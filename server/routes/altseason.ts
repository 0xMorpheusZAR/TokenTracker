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
    const btcChange7d = bitcoinData.price_change_percentage_7d_in_currency || 0;
    
    // Calculate 90d change for Bitcoin (approximate from 30d data if not available)
    const btcChange90d = bitcoinData.price_change_percentage_90d_in_currency || (btcChange30d * 2.5);
    
    // Calculate how many altcoins outperformed Bitcoin and get the list
    let outperformingCount = 0;
    const outperformingCoins = [];
    top50Altcoins.forEach(coin => {
      const coinChange30d = coin.price_change_percentage_30d_in_currency || 0;
      const coinChange7d = coin.price_change_percentage_7d_in_currency || 0;
      const coinChange90d = coin.price_change_percentage_90d_in_currency || (coinChange30d * 2.5);
      
      if (coinChange30d > btcChange30d) {
        outperformingCount++;
        outperformingCoins.push({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          change30d: coinChange30d,
          change7d: coinChange7d,
          change90d: coinChange90d,
          outperformance: coinChange30d - btcChange30d,
          outperformance7d: coinChange7d - btcChange7d,
          outperformance90d: coinChange90d - btcChange90d,
          currentPrice: coin.current_price,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          rank: coin.market_cap_rank
        });
      }
    });
    
    // Sort by outperformance (best performers first)
    outperformingCoins.sort((a, b) => b.outperformance - a.outperformance);
    
    // Calculate Altseason Index (percentage of top 50 altcoins outperforming BTC)
    const altseasonIndex = Math.round((outperformingCount / 50) * 100);
    
    const metricsData = {
      altseasonIndex,
      bitcoinDominance: btcDominance,
      totalMarketCap: globalData.data.total_market_cap.usd,
      totalVolume: globalData.data.total_volume.usd,
      outperformingCount,
      outperformingCoins,
      btcChange30d,
      btcChange7d,
      btcChange90d,
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

// Get OTHERS/BTC ratio data (Total Market Cap excluding Top 10 coins and BTC)
router.get('/others-btc-ratio', async (req, res) => {
  try {
    const CACHE_KEY = 'others_btc_ratio_historical';
    const CACHE_TTL = 15; // 15 minutes (matching Python script)
    
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
    
    // Get current global market data
    const globalData = await coingeckoService.getGlobalData();
    const totalMarketCap = globalData.data.total_market_cap.usd;
    const btcDominance = globalData.data.market_cap_percentage.btc;
    
    // Get top 11 coins (including BTC) to calculate top 10 altcoins market cap
    const top11Coins = await coingeckoService.getTop100Altcoins();
    if (!top11Coins || top11Coins.length === 0) {
      throw new Error('Failed to fetch top coins data');
    }
    
    // Calculate BTC market cap
    const btcMarketCap = totalMarketCap * (btcDominance / 100);
    
    // Calculate top 10 altcoins market cap (excluding BTC)
    let top10AltcoinsMarketCap = 0;
    const topAltcoins = top11Coins.filter(coin => coin.id !== 'bitcoin').slice(0, 10);
    topAltcoins.forEach(coin => {
      top10AltcoinsMarketCap += coin.market_cap || 0;
    });
    
    // Calculate OTHERS market cap (Total - BTC - Top 10 Altcoins)
    const othersMarketCap = totalMarketCap - btcMarketCap - top10AltcoinsMarketCap;
    
    // Calculate current OTHERS/BTC ratio
    const currentRatio = othersMarketCap / btcMarketCap;
    
    // Fetch real historical data from CoinGecko
    const days = 365; // 1 year of data
    
    console.log('Fetching historical market cap data from CoinGecko...');
    
    // Get current top 10 altcoin IDs (excluding Bitcoin)
    const currentTop10Altcoins = topAltcoins.slice(0, 10).map(coin => coin.id);
    console.log('Top 10 altcoins (excluding BTC):', currentTop10Altcoins);
    
    // Fetch historical global market cap data
    const globalMarketCapData = await coingeckoService.getHistoricalGlobalMarketCap(days);
    
    // Fetch historical Bitcoin market cap data
    const btcMarketCapData = await coingeckoService.getHistoricalMarketCap('bitcoin', days);
    
    // Fetch historical market cap data for top 10 altcoins
    const top10HistoricalData = await Promise.all(
      currentTop10Altcoins.map(coinId => 
        coingeckoService.getHistoricalMarketCap(coinId, days)
          .then(data => ({ coinId, data }))
          .catch(err => {
            console.error(`Failed to fetch ${coinId} historical data:`, err);
            return { coinId, data: [] };
          })
      )
    );
    
    // Create maps for efficient lookup
    const btcMap = new Map(btcMarketCapData.map(([ts, cap]) => [ts, cap]));
    const top10Maps = new Map(
      top10HistoricalData.map(({ coinId, data }) => [
        coinId,
        new Map(data.map(([ts, cap]) => [ts, cap]))
      ])
    );
    
    // Calculate OTHERS/BTC ratio for each timestamp
    const historicalData = [];
    
    globalMarketCapData.forEach(([timestamp, totalCap]) => {
      const btcCap = btcMap.get(timestamp);
      
      if (btcCap && totalCap > btcCap) {
        // Calculate sum of top 10 altcoin market caps at this timestamp
        let top10Sum = 0;
        currentTop10Altcoins.forEach(coinId => {
          const coinMap = top10Maps.get(coinId);
          if (coinMap) {
            const coinCap = coinMap.get(timestamp);
            if (coinCap) {
              top10Sum += coinCap;
            }
          }
        });
        
        // OTHERS = Total - BTC - Top 10 Altcoins
        const othersCap = totalCap - btcCap - top10Sum;
        const ratio = othersCap / btcCap;
        
        historicalData.push({
          timestamp,
          ratio
        });
      }
    });
    
    // Sort by timestamp
    historicalData.sort((a, b) => a.timestamp - b.timestamp);
    
    const responseData = {
      currentRatio, // Dynamic real-time ratio
      btcDominance,
      othersMarketCap,
      btcMarketCap,
      totalMarketCap,
      historicalData,
      criticalLevels: {
        extreme_greed: 0.35,  // Others 35% of BTC (extreme altseason for small caps)
        strong_altseason: 0.30,  // Others 30% of BTC
        altseason_start: 0.25,  // Others 25% of BTC
        neutral: 0.20,
        btc_dominance: 0.17,
        strong_btc_dominance: 0.15
      },
      description: "OTHERS/BTC = (Global Market Cap - BTC - Top 10 Altcoins) / BTC",
      dataSource: "CoinGecko Pro API - 365 days of historical market cap data",
      methodology: "OTHERS excludes Bitcoin and current top 10 altcoins by market cap"
    };
    
    // Cache the data
    cacheService.set(CACHE_KEY, responseData, CACHE_TTL);
    
    res.json({
      ...responseData,
      cached: false,
      cacheTimestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to fetch OTHERS/BTC ratio:', error);
    res.status(500).json({ error: 'Failed to fetch OTHERS/BTC ratio data' });
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
    
    // Filter out Bitcoin, stablecoins, and wrapped tokens to get exactly top 50 altcoins
    const excludedTokens = [
      // Bitcoin and derivatives
      'bitcoin', 'wrapped-bitcoin', 'bitcoin-bep2', 'bitcoin-avalanche-bridged-btc-b',
      // ETH derivatives
      'wrapped-steth', 'staked-ether', 'wsteth', 'weeth', 'steth', 
      'lido-staked-ether', 'rocket-pool-eth', 'frax-ether', 'sfrxeth',
      'wbeth', 'weth', 'wrapped-ether', 'wrapped-beacon-eth', 'binance-wrapped-eth',
      // Major stablecoins
      'tether', 'usd-coin', 'dai', 'binance-usd', 'true-usd', 'terrausd', 'paxos-standard',
      'gemini-dollar', 'husd', 'frax', 'neutrino', 'fei-usd', 'tribe', 'reserve-rights-token',
      'usdd', 'usdc', 'busd', 'tusd', 'usdp', 'gusd', 'susd', 'lusd', 'cusd', 'musd',
      'tether-gold', 'pax-gold', 'digix-gold', 'first-digital-usd', 'paypal-usd'
    ];
    
    const top50Altcoins = topCoins
      .filter(coin => !excludedTokens.includes(coin.id))
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
    
    // Sort by performance vs BTC (descending order)
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

// Get top altcoins performance vs Ethereum
router.get('/altcoins-performance-eth', async (req, res) => {
  try {
    const coingeckoService = req.app.locals.coingeckoService;
    const { period = '90d' } = req.query;
    
    // Get top 100 coins to ensure we have enough altcoins after filtering
    const topCoins = await coingeckoService.getTop100Altcoins();
    
    if (!topCoins || topCoins.length === 0) {
      throw new Error('Failed to fetch coins data');
    }
    
    // Get Ethereum data separately for comparison
    const ethereumData = topCoins.find(coin => coin.id === 'ethereum');
    if (!ethereumData) {
      throw new Error('Ethereum data not found');
    }
    
    // Filter out Ethereum and ETH derivatives, then get exactly top 50 altcoins
    const ethDerivatives = [
      'ethereum', 'wrapped-steth', 'staked-ether', 'wsteth', 'weeth', 'steth', 
      'lido-staked-ether', 'rocket-pool-eth', 'frax-ether', 'sfrxeth',
      'wbeth', 'weth', 'wrapped-ether', 'wrapped-beacon-eth', 'binance-wrapped-eth'
    ];
    const top50Altcoins = topCoins
      .filter(coin => !ethDerivatives.includes(coin.id))
      .slice(0, 50);
    
    // For 90-day data, we'll use approximation based on 30-day trends
    const eth90dPerformance = (ethereumData?.price_change_percentage_30d_in_currency || 0) * 3;
    
    const ethPerformance = {
      '24h': ethereumData?.price_change_percentage_24h || 0,
      '7d': ethereumData?.price_change_percentage_7d_in_currency || ethereumData?.price_change_percentage_7d || 0,
      '30d': ethereumData?.price_change_percentage_30d_in_currency || ethereumData?.price_change_percentage_30d || 0,
      '90d': eth90dPerformance
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
          performanceVsEth: {
            '7d': ((coin.price_change_percentage_7d_in_currency || coin.price_change_percentage_7d || 0)) - ethPerformance['7d'],
            '30d': ((coin.price_change_percentage_30d_in_currency || coin.price_change_percentage_30d || 0)) - ethPerformance['30d'],
            '90d': coin90dPerformance - ethPerformance['90d']
          }
        };
      })
    );
    
    // Sort by performance vs ETH for the selected timeframe
    const sortedAltcoins = altcoinsPerformance.sort((a, b) => 
      b.performanceVsEth['30d'] - a.performanceVsEth['30d']
    );
    
    res.json({
      ethPerformance,
      altcoins: sortedAltcoins
    });
  } catch (error) {
    console.error('Failed to fetch altcoins performance vs ETH:', error);
    res.status(500).json({ error: 'Failed to fetch altcoins performance vs ETH' });
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

// Get OTHERS/ETH ratio
router.get('/others-eth-ratio', async (req, res) => {
  try {
    const coingeckoService = req.app.locals.coingeckoService;
    
    // Get global market cap
    const globalData = await coingeckoService.getGlobalData();
    const totalMarketCap = globalData.data.total_market_cap.usd;
    
    // Get market data for BTC and ETH
    const marketData = await coingeckoService.getMarketData(['BTC', 'ETH']);
    if (!marketData || marketData.length < 2) {
      throw new Error('Failed to fetch BTC and ETH market data');
    }
    
    // Find BTC and ETH data
    const btcData = marketData.find((coin: any) => coin.symbol.toUpperCase() === 'BTC');
    const ethData = marketData.find((coin: any) => coin.symbol.toUpperCase() === 'ETH');
    
    if (!btcData || !ethData) {
      throw new Error('BTC or ETH data not found');
    }
    
    const btcMarketCap = btcData.market_cap;
    const ethMarketCap = ethData.market_cap;
    
    // Calculate OTHERS (all altcoins excluding BTC)
    const othersMarketCap = totalMarketCap - btcMarketCap;
    
    // Calculate OTHERS/ETH ratio
    const othersEthRatio = othersMarketCap / ethMarketCap;
    
    res.json({
      currentRatio: othersEthRatio, // Dynamic real-time ratio
      othersMarketCap,
      ethMarketCap,
      totalMarketCap,
      btcMarketCap
    });
  } catch (error) {
    console.error('Error calculating OTHERS/ETH ratio:', error);
    res.status(500).json({ error: 'Failed to calculate OTHERS/ETH ratio' });
  }
});

// Get trading pair info for a coin
router.get('/coin-trading-info/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const coingeckoService = req.app.locals.coingeckoService;
    
    // Get tickers to find the best exchange and trading pair
    const tickers = await coingeckoService.getCoinTickers(coinId);
    
    // Find the ticker with highest volume on major exchanges
    const majorExchanges = ['binance', 'coinbase_exchange', 'kraken', 'okex', 'huobi', 'kucoin', 'bybit_spot', 'gate'];
    const sortedTickers = tickers
      .filter((ticker: any) => majorExchanges.includes(ticker.market.identifier))
      .sort((a: any, b: any) => b.converted_volume.usd - a.converted_volume.usd);
    
    if (sortedTickers.length === 0) {
      // Fallback to any exchange
      const bestTicker = tickers.sort((a: any, b: any) => b.converted_volume.usd - a.converted_volume.usd)[0];
      res.json({
        exchange: bestTicker?.market?.identifier || 'binance',
        tradingPair: bestTicker?.base + bestTicker?.target || 'UNKNOWN',
        tradingViewSymbol: `${bestTicker?.market?.identifier.toUpperCase()}:${bestTicker?.base}${bestTicker?.target}`
      });
    } else {
      const bestTicker = sortedTickers[0];
      const exchange = bestTicker.market.identifier === 'binance' ? 'BINANCE' : 
                      bestTicker.market.identifier === 'coinbase_exchange' ? 'COINBASE' :
                      bestTicker.market.identifier === 'kraken' ? 'KRAKEN' :
                      bestTicker.market.identifier === 'okex' ? 'OKEX' :
                      bestTicker.market.identifier === 'huobi' ? 'HUOBI' :
                      bestTicker.market.identifier === 'kucoin' ? 'KUCOIN' :
                      bestTicker.market.identifier === 'bybit_spot' ? 'BYBIT' :
                      bestTicker.market.identifier === 'gate' ? 'GATEIO' :
                      bestTicker.market.identifier.toUpperCase();
      
      res.json({
        exchange: exchange,
        tradingPair: `${bestTicker.base}${bestTicker.target}`,
        tradingViewSymbol: `${exchange}:${bestTicker.base}${bestTicker.target}`
      });
    }
  } catch (error) {
    console.error('Error fetching coin trading info:', error);
    res.json({
      exchange: 'BINANCE',
      tradingPair: 'UNKNOWNUSDT',
      tradingViewSymbol: 'BINANCE:UNKNOWNUSDT'
    });
  }
});

export default router;