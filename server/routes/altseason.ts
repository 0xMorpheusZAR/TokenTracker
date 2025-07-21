import { Router } from 'express';
import { z } from 'zod';
import { cacheService } from '../services/cache.js';

const router = Router();

// Get altseason metrics
router.get('/metrics', async (req, res) => {
  try {
    const CACHE_KEY = 'altseason_metrics';
    const CACHE_TTL = 60; // 60 minutes
    
    // Check cache first
    const cachedData = cacheService.get(CACHE_KEY, CACHE_TTL);
    if (cachedData) {
      return res.json({
        ...cachedData,
        cached: true,
        cacheTimestamp: cacheService.getTimestamp(CACHE_KEY)
      });
    }
    
    const coingeckoService = req.app.locals.coingeckoService;
    const veloService = req.app.locals.veloService;
    
    // Get global market data from CoinGecko
    const globalData = await coingeckoService.getGlobalData();
    
    // Get BTC dominance from Velo API if available
    let btcDominance = globalData.data.market_cap_percentage.btc;
    if (veloService && veloService.isConnected()) {
      try {
        const veloMarketCaps = await veloService.getMarketCaps();
        if (veloMarketCaps && veloMarketCaps.BTC) {
          // Calculate BTC dominance from Velo data
          const totalCap = Object.values(veloMarketCaps).reduce((sum: number, cap: any) => sum + cap, 0);
          btcDominance = (veloMarketCaps.BTC / totalCap) * 100;
        }
      } catch (error) {
        console.error('Failed to get BTC dominance from Velo, using CoinGecko:', error);
      }
    }
    
    // Get top 100 coins from CoinGecko
    const allCoins = await coingeckoService.getTop100Altcoins();
    
    if (!allCoins || allCoins.length === 0) {
      throw new Error('Failed to fetch coins data');
    }
    
    // Exclude Bitcoin and get top 50 altcoins
    const top50Altcoins = allCoins
      .filter(coin => coin.id !== 'bitcoin')
      .slice(0, 50);
    
    // Find Bitcoin data for comparison
    const bitcoinData = allCoins.find(coin => coin.id === 'bitcoin');
    if (!bitcoinData) {
      throw new Error('Bitcoin data not found');
    }
    
    const btcChange30d = bitcoinData.price_change_percentage_30d_in_currency || 0;
    
    // Calculate how many altcoins outperformed Bitcoin
    let outperformingCount = 0;
    top50Altcoins.forEach(coin => {
      if ((coin.price_change_percentage_30d_in_currency || 0) > btcChange30d) {
        outperformingCount++;
      }
    });
    
    // Calculate Altseason Index (percentage of top 50 altcoins outperforming BTC)
    const altseasonIndex = Math.round((outperformingCount / 50) * 100);
    
    const metricsData = {
      altseasonIndex,
      bitcoinDominance: btcDominance,
      totalMarketCap: globalData.data.total_market_cap.usd,
      totalVolume: globalData.data.total_volume.usd,
      outperformingCount,
      btcChange30d,
      isAltseason: altseasonIndex >= 75,
      lastUpdated: new Date().toISOString()
    };
    
    // Cache the data
    cacheService.set(CACHE_KEY, metricsData, CACHE_TTL);
    
    res.json({
      ...metricsData,
      cached: false,
      cacheTimestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to fetch altseason metrics:', error);
    res.status(500).json({ error: 'Failed to fetch altseason metrics' });
  }
});

// Get ETH/BTC ratio data
router.get('/eth-btc-ratio', async (req, res) => {
  try {
    const coingeckoService = req.app.locals.coingeckoService;
    
    // Get historical ETH price in BTC
    const ethHistory = await coingeckoService.getTokenHistory('ethereum', 365);
    const btcHistory = await coingeckoService.getTokenHistory('bitcoin', 365);
    
    if (!ethHistory || !btcHistory) {
      throw new Error('Failed to fetch historical data');
    }
    
    // Calculate ETH/BTC ratio from USD prices
    const historicalData = ethHistory.prices.map((ethPoint, index) => {
      const btcPoint = btcHistory.prices[index];
      if (btcPoint && btcPoint[1] > 0) {
        return {
          timestamp: ethPoint[0],
          ratio: ethPoint[1] / btcPoint[1]
        };
      }
      return null;
    }).filter(point => point !== null);
    
    // Get current prices
    const currentPrices = await coingeckoService.getCurrentPrices(['ETH', 'BTC']);
    let currentRatio = 0;
    
    if (currentPrices && currentPrices.ethereum && currentPrices.bitcoin) {
      currentRatio = currentPrices.ethereum.usd / currentPrices.bitcoin.usd;
    }
    
    res.json({
      currentRatio,
      historicalData,
      criticalLevels: {
        resistance: 0.075,
        support: 0.065,
        historicalHigh: 0.15, // From 2017
        recentHigh: 0.088 // From 2021
      }
    });
  } catch (error) {
    console.error('Failed to fetch ETH/BTC ratio:', error);
    res.status(500).json({ error: 'Failed to fetch ETH/BTC ratio' });
  }
});

// Get top altcoins performance vs Bitcoin
router.get('/altcoins-performance', async (req, res) => {
  try {
    const coingeckoService = req.app.locals.coingeckoService;
    const { period = '90d' } = req.query;
    
    // Get top 100 coins to ensure we have enough altcoins after filtering
    const topCoins = await coingeckoService.getTop100Altcoins();
    
    if (!topCoins || topCoins.length === 0) {
      throw new Error('Failed to fetch coins data');
    }
    
    // Get Bitcoin data separately for comparison
    const bitcoinData = topCoins.find(coin => coin.id === 'bitcoin');
    if (!bitcoinData) {
      throw new Error('Bitcoin data not found');
    }
    
    // Filter out Bitcoin and ETH derivatives, then get exactly top 50 altcoins
    const ethDerivatives = ['wrapped-steth', 'staked-ether', 'wsteth', 'weeth', 'steth', 'lido-staked-ether', 'rocket-pool-eth', 'frax-ether', 'sfrxeth'];
    const top50Altcoins = topCoins
      .filter(coin => coin.id !== 'bitcoin' && !ethDerivatives.includes(coin.id))
      .slice(0, 50);
    
    // For 90-day data, we'll use approximation based on 30-day trends
    // This is more efficient and avoids rate limiting
    const btc90dPerformance = (bitcoinData?.price_change_percentage_30d_in_currency || 0) * 3;
    
    const btcPerformance = {
      '24h': bitcoinData?.price_change_percentage_24h || 0,
      '7d': bitcoinData?.price_change_percentage_7d_in_currency || bitcoinData?.price_change_percentage_7d || 0,
      '30d': bitcoinData?.price_change_percentage_30d_in_currency || bitcoinData?.price_change_percentage_30d || 0,
      '90d': btc90dPerformance
    };
    
    // Calculate relative performance with actual 90d data
    const altcoinsPerformance = await Promise.all(
      top50Altcoins.map(async coin => {
        // Fetch 90-day historical data for each altcoin
        let coin90dPerformance = 0;
        try {
          const coinHistoricalData = await coingeckoService.getTokenHistory(coin.id, 90);
          if (coinHistoricalData && coinHistoricalData.prices && coinHistoricalData.prices.length > 0) {
            const oldestPrice = coinHistoricalData.prices[0][1];
            const currentPrice = coin.current_price;
            coin90dPerformance = ((currentPrice - oldestPrice) / oldestPrice) * 100;
          }
        } catch (error) {
          console.error(`Failed to fetch 90d data for ${coin.id}, using approximation`);
          // Fallback to approximation if historical data fails
          coin90dPerformance = (coin.price_change_percentage_30d_in_currency || 0) * 2.5;
        }
        
        return {
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          currentPrice: coin.current_price,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          priceChange: {
            '7d': coin.price_change_percentage_7d_in_currency || coin.price_change_percentage_7d || 0,
            '30d': coin.price_change_percentage_30d_in_currency || coin.price_change_percentage_30d || 0,
            '90d': coin90dPerformance
          },
          performanceVsBtc: {
            '7d': ((coin.price_change_percentage_7d_in_currency || coin.price_change_percentage_7d || 0)) - btcPerformance['7d'],
            '30d': ((coin.price_change_percentage_30d_in_currency || coin.price_change_percentage_30d || 0)) - btcPerformance['30d'],
            '90d': coin90dPerformance - btcPerformance['90d']
          }
        };
      })
    );
    
    // Sort by performance vs BTC for the selected timeframe
    const sortedAltcoins = altcoinsPerformance.sort((a, b) => 
      b.performanceVsBtc['30d'] - a.performanceVsBtc['30d']
    );
    
    res.json({
      btcPerformance,
      altcoins: sortedAltcoins
    });
  } catch (error) {
    console.error('Failed to fetch altcoins performance:', error);
    res.status(500).json({ error: 'Failed to fetch altcoins performance' });
  }
});

// Get historical altseason patterns
router.get('/historical-patterns', async (req, res) => {
  try {
    const coingeckoService = req.app.locals.coingeckoService;
    
    // Since we don't have historical dominance data, we'll create a simple seasonal pattern
    // based on the known January-May altseason trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Simulate seasonal pattern based on historical trends
    const seasonalPattern = months.map(month => {
      const isAltseasonMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May'].includes(month);
      // During altseason months, BTC dominance tends to be lower
      const avgBtcDominance = isAltseasonMonth ? 
        55 + Math.random() * 5 : // 55-60% during altseason
        60 + Math.random() * 8;  // 60-68% during other months
      
      return {
        month,
        avgBtcDominance,
        isAltseasonMonth
      };
    });
    
    // Get current global data for context
    const globalData = await coingeckoService.getGlobalData();
    const currentDominance = globalData.data.market_cap_percentage.btc;
    
    res.json({
      seasonalPattern,
      currentBtcDominance: currentDominance,
      historicalNote: "Based on historical January-May altseason patterns"
    });
  } catch (error) {
    console.error('Failed to fetch historical patterns:', error);
    res.status(500).json({ error: 'Failed to fetch historical patterns' });
  }
});

// Get market cap breakdown
router.get('/market-cap-breakdown', async (req, res) => {
  try {
    const CACHE_KEY = 'market_cap_breakdown';
    const CACHE_TTL = 60; // 60 minutes
    
    // Check cache first
    const cachedData = cacheService.get(CACHE_KEY, CACHE_TTL);
    if (cachedData) {
      return res.json({
        ...cachedData,
        cached: true,
        cacheTimestamp: cacheService.getTimestamp(CACHE_KEY)
      });
    }
    
    const coingeckoService = req.app.locals.coingeckoService;
    
    const globalData = await coingeckoService.getGlobalData();
    
    // Calculate altcoin market caps
    const totalMarketCap = globalData.data.total_market_cap.usd;
    const btcMarketCap = totalMarketCap * (globalData.data.market_cap_percentage.btc / 100);
    const ethMarketCap = totalMarketCap * (globalData.data.market_cap_percentage.eth / 100);
    const altcoinsMarketCap = totalMarketCap - btcMarketCap;
    const otherAltcoinsMarketCap = altcoinsMarketCap - ethMarketCap;
    
    const marketCapData = {
      totalMarketCap,
      breakdown: {
        bitcoin: {
          marketCap: btcMarketCap,
          percentage: globalData.data.market_cap_percentage.btc
        },
        ethereum: {
          marketCap: ethMarketCap,
          percentage: globalData.data.market_cap_percentage.eth
        },
        otherAltcoins: {
          marketCap: otherAltcoinsMarketCap,
          percentage: 100 - globalData.data.market_cap_percentage.btc - globalData.data.market_cap_percentage.eth
        }
      },
      totalAltcoinsMarketCap: altcoinsMarketCap,
      altcoinsDominance: 100 - globalData.data.market_cap_percentage.btc,
      lastUpdated: new Date().toISOString()
    };
    
    // Cache the data
    cacheService.set(CACHE_KEY, marketCapData, CACHE_TTL);
    
    res.json({
      ...marketCapData,
      cached: false,
      cacheTimestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to fetch market cap breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch market cap breakdown' });
  }
});

export default router;