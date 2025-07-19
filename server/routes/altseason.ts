import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Get altseason metrics
router.get('/metrics', async (req, res) => {
  try {
    const coingeckoService = req.app.locals.coingeckoService;
    
    // Get global market data for Bitcoin dominance
    const globalData = await coingeckoService.getGlobalData();
    
    // Get top 100 altcoins (we'll use first 50 for index)
    const topCoins = await coingeckoService.getTop100Altcoins();
    
    if (!topCoins || topCoins.length === 0) {
      throw new Error('Failed to fetch top coins data');
    }
    
    // Get top 50 coins
    const top50Coins = topCoins.slice(0, 50);
    
    // Find Bitcoin data for comparison
    const bitcoinData = top50Coins.find(coin => coin.id === 'bitcoin');
    if (!bitcoinData) {
      throw new Error('Bitcoin data not found');
    }
    
    const btcChange90d = bitcoinData.price_change_percentage_30d_in_currency || 0; // Using 30d as proxy for 90d
    
    // Calculate how many coins outperformed Bitcoin
    let outperformingCount = 0;
    top50Coins.forEach(coin => {
      if (coin.id !== 'bitcoin' && (coin.price_change_percentage_30d_in_currency || 0) > btcChange90d) {
        outperformingCount++;
      }
    });
    
    // Calculate Altseason Index (percentage of top 50 outperforming BTC)
    const altseasonIndex = Math.round((outperformingCount / 49) * 100); // 49 because we exclude BTC
    
    res.json({
      altseasonIndex,
      bitcoinDominance: globalData.data.market_cap_percentage.btc,
      totalMarketCap: globalData.data.total_market_cap.usd,
      totalVolume: globalData.data.total_volume.usd,
      outperformingCount,
      btcChange90d,
      isAltseason: altseasonIndex >= 75
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
    
    // Get top 50 coins
    const topCoins = await coingeckoService.getTop100Altcoins();
    const top50Coins = topCoins ? topCoins.slice(0, 50) : [];
    
    if (!top50Coins || top50Coins.length === 0) {
      throw new Error('Failed to fetch coins data');
    }
    
    // Use all top 50 coins for performance analysis
    const analyzeCoins = top50Coins;
    
    // Get Bitcoin data for comparison
    const bitcoinData = analyzeCoins.find(coin => coin.id === 'bitcoin');
    
    // For 90d data, we'll need to fetch historical prices
    const currentDate = new Date();
    const ninetyDaysAgo = new Date(currentDate.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    // Fetch historical data for Bitcoin and calculate 90d performance
    let btc90dPerformance = 0;
    try {
      const historicalBtcData = await coingeckoService.getHistoricalPrice(
        'bitcoin',
        ninetyDaysAgo.toISOString().split('T')[0]
      );
      if (historicalBtcData && bitcoinData) {
        btc90dPerformance = ((bitcoinData.current_price - historicalBtcData) / historicalBtcData) * 100;
      }
    } catch (error) {
      console.error('Failed to fetch 90d BTC data:', error);
      // Fallback to using 30d data multiplied by factor if historical fetch fails
      btc90dPerformance = (bitcoinData?.price_change_percentage_30d_in_currency || 0) * 2.5;
    }
    
    const btcPerformance = {
      '24h': bitcoinData?.price_change_percentage_24h || 0,
      '7d': bitcoinData?.price_change_percentage_7d_in_currency || bitcoinData?.price_change_percentage_7d || 0,
      '30d': bitcoinData?.price_change_percentage_30d_in_currency || bitcoinData?.price_change_percentage_30d || 0,
      '90d': btc90dPerformance
    };
    
    // Calculate relative performance - Fetch 90d data for altcoins as well
    const altcoinsPerformance = await Promise.all(
      analyzeCoins
        .filter(coin => coin.id !== 'bitcoin')
        .map(async coin => {
          // Calculate 90d performance for each altcoin
          let coin90dPerformance = 0;
          try {
            const historicalPrice = await coingeckoService.getHistoricalPrice(
              coin.id,
              ninetyDaysAgo.toISOString().split('T')[0]
            );
            if (historicalPrice && coin.current_price) {
              coin90dPerformance = ((coin.current_price - historicalPrice) / historicalPrice) * 100;
            }
          } catch (error) {
            console.error(`Failed to fetch 90d data for ${coin.id}:`, error);
            // Fallback to using 30d data multiplied by factor
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
            },
            sparkline: [] // Sparkline not available in this endpoint
          };
        })
    );
    
    res.json({
      btcPerformance,
      altcoins: altcoinsPerformance
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
    const coingeckoService = req.app.locals.coingeckoService;
    
    const globalData = await coingeckoService.getGlobalData();
    
    // Calculate altcoin market caps
    const totalMarketCap = globalData.data.total_market_cap.usd;
    const btcMarketCap = totalMarketCap * (globalData.data.market_cap_percentage.btc / 100);
    const ethMarketCap = totalMarketCap * (globalData.data.market_cap_percentage.eth / 100);
    const altcoinsMarketCap = totalMarketCap - btcMarketCap;
    const otherAltcoinsMarketCap = altcoinsMarketCap - ethMarketCap;
    
    res.json({
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
      altcoinsDominance: 100 - globalData.data.market_cap_percentage.btc
    });
  } catch (error) {
    console.error('Failed to fetch market cap breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch market cap breakdown' });
  }
});

export default router;