import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Get altseason metrics
router.get('/metrics', async (req, res) => {
  try {
    const coingeckoService = req.app.locals.coingeckoService;
    
    // Get global market data for Bitcoin dominance
    const globalData = await coingeckoService.getGlobalData();
    
    // Get top 50 coins for altseason index calculation
    const top50Coins = await coingeckoService.getMarketData({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 50,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h,7d,30d,90d'
    });
    
    // Get Bitcoin data for comparison
    const bitcoinData = await coingeckoService.getCoinData('bitcoin');
    
    // Calculate how many coins outperformed Bitcoin in the last 90 days
    let outperformingCount = 0;
    const btcChange90d = bitcoinData.market_data.price_change_percentage_90d_in_currency.usd;
    
    top50Coins.forEach(coin => {
      if (coin.id !== 'bitcoin' && coin.price_change_percentage_90d_in_currency > btcChange90d) {
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
    
    // Get historical ETH/BTC price data
    const ethData = await coingeckoService.getMarketChart('ethereum', {
      vs_currency: 'btc',
      days: 365,
      interval: 'daily'
    });
    
    // Get current ETH and BTC prices
    const prices = await coingeckoService.getSimplePrice(['ethereum', 'bitcoin'], ['usd']);
    const currentRatio = prices.ethereum.usd / prices.bitcoin.usd;
    
    res.json({
      currentRatio,
      historicalData: ethData.prices.map(([timestamp, price]) => ({
        timestamp,
        ratio: price
      })),
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
    
    // Get top altcoins
    const topAltcoins = await coingeckoService.getMarketData({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 20,
      page: 1,
      sparkline: true,
      price_change_percentage: '24h,7d,30d,90d'
    });
    
    // Get Bitcoin data for comparison
    const bitcoinData = topAltcoins.find(coin => coin.id === 'bitcoin');
    const btcPerformance = {
      '24h': bitcoinData?.price_change_percentage_24h || 0,
      '7d': bitcoinData?.price_change_percentage_7d || 0,
      '30d': bitcoinData?.price_change_percentage_30d || 0,
      '90d': bitcoinData?.price_change_percentage_90d_in_currency || 0
    };
    
    // Calculate relative performance
    const altcoinsPerformance = topAltcoins
      .filter(coin => coin.id !== 'bitcoin')
      .map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        currentPrice: coin.current_price,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        priceChange: {
          '24h': coin.price_change_percentage_24h,
          '7d': coin.price_change_percentage_7d,
          '30d': coin.price_change_percentage_30d,
          '90d': coin.price_change_percentage_90d_in_currency
        },
        performanceVsBtc: {
          '24h': (coin.price_change_percentage_24h || 0) - btcPerformance['24h'],
          '7d': (coin.price_change_percentage_7d || 0) - btcPerformance['7d'],
          '30d': (coin.price_change_percentage_30d || 0) - btcPerformance['30d'],
          '90d': (coin.price_change_percentage_90d_in_currency || 0) - btcPerformance['90d']
        },
        sparkline: coin.sparkline_in_7d?.price || []
      }));
    
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
    
    // Get Bitcoin dominance history (1 year)
    const globalHistory = await coingeckoService.getGlobalMarketCapChart(365);
    
    // Extract monthly averages for seasonal analysis
    const monthlyData: Record<string, { dominance: number[], count: number }> = {};
    
    globalHistory.market_cap_percentage.forEach(([timestamp, percentages]) => {
      const date = new Date(timestamp);
      const month = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { dominance: [], count: 0 };
      }
      
      monthlyData[month].dominance.push(percentages.btc);
      monthlyData[month].count++;
    });
    
    // Calculate monthly averages
    const seasonalPattern = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      avgBtcDominance: data.dominance.reduce((a, b) => a + b, 0) / data.dominance.length,
      isAltseasonMonth: ['Jan', 'Feb', 'Mar', 'Apr', 'May'].includes(month)
    }));
    
    res.json({
      seasonalPattern,
      historicalDominance: globalHistory.market_cap_percentage.map(([timestamp, percentages]) => ({
        timestamp,
        btcDominance: percentages.btc,
        ethDominance: percentages.eth
      }))
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