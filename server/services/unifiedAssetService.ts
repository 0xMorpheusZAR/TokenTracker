/**
 * Unified Asset Service
 * Aggregates data from multiple sources (CoinGecko, DefiLlama) for comprehensive token analysis
 */

import { coinGeckoService } from './coingecko.js';
import { defiLlamaService } from './defillama.js';

interface UnifiedAssetData {
  // Basic Info
  id: string;
  symbol: string;
  name: string;
  image: string;
  
  // Market Data (from CoinGecko)
  currentPrice: number;
  marketCap: number;
  fullyDilutedValuation: number;
  totalVolume: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number;
  athDate: string;
  atl: number;
  atlDate: string;
  
  // Category & Trends (from CoinGecko)
  categories: string[];
  isTrending: boolean;
  
  // DeFi Metrics (from DefiLlama)
  tvl: number | null;
  tvlChange24h: number | null;
  activeUsers: number | null;
  activeUsersChange24h: number | null;
  
  // Liquidity Data (from DefiLlama)
  totalLiquidity: number | null;
  topLiquidityPools: Array<{
    pool: string;
    liquidity: number;
    chain: string;
  }> | null;
  
  // Token Unlocks (from DefiLlama)
  nextUnlock: {
    date: string;
    amount: string;
    percentage: number;
    impact: string;
  } | null;
  upcomingUnlocks: Array<{
    date: string;
    amount: string;
    percentage: number;
  }> | null;
  
  // Protocol Revenue/Fees (from DefiLlama)
  fees24h: number | null;
  revenue24h: number | null;
  fees30d: number | null;
  revenue30d: number | null;
  
  // Historical Data for Charts
  priceHistory: Array<[number, number]> | null;
  tvlHistory: Array<[number, number]> | null;
}

export class UnifiedAssetService {
  async getUnifiedAssetData(coinId: string): Promise<UnifiedAssetData | null> {
    try {
      // Fetch data from multiple sources in parallel
      const [coinGeckoData, trendingData, protocolData, unlockData] = await Promise.all([
        this.fetchCoinGeckoData(coinId),
        this.fetchTrendingStatus(coinId),
        this.fetchDefiLlamaProtocolData(coinId),
        this.fetchUnlockData(coinId)
      ]);

      if (!coinGeckoData) {
        return null;
      }

      // Combine all data sources
      const unifiedData: UnifiedAssetData = {
        // Basic Info
        id: coinGeckoData.id,
        symbol: coinGeckoData.symbol.toUpperCase(),
        name: coinGeckoData.name,
        image: coinGeckoData.image,
        
        // Market Data
        currentPrice: coinGeckoData.current_price,
        marketCap: coinGeckoData.market_cap,
        fullyDilutedValuation: coinGeckoData.fully_diluted_valuation || 0,
        totalVolume: coinGeckoData.total_volume,
        priceChange24h: coinGeckoData.price_change_percentage_24h || 0,
        priceChange7d: coinGeckoData.price_change_percentage_7d || 0,
        priceChange30d: coinGeckoData.price_change_percentage_30d || 0,
        circulatingSupply: coinGeckoData.circulating_supply || 0,
        totalSupply: coinGeckoData.total_supply || 0,
        maxSupply: coinGeckoData.max_supply,
        ath: coinGeckoData.ath,
        athDate: coinGeckoData.ath_date,
        atl: coinGeckoData.atl,
        atlDate: coinGeckoData.atl_date,
        
        // Category & Trends
        categories: coinGeckoData.categories || [],
        isTrending: trendingData,
        
        // DeFi Metrics
        tvl: protocolData?.tvl || null,
        tvlChange24h: protocolData?.tvlChange24h || null,
        activeUsers: protocolData?.activeUsers || null,
        activeUsersChange24h: protocolData?.activeUsersChange24h || null,
        
        // Liquidity Data
        totalLiquidity: protocolData?.liquidity || null,
        topLiquidityPools: protocolData?.topPools || null,
        
        // Token Unlocks
        nextUnlock: unlockData?.nextUnlock || null,
        upcomingUnlocks: unlockData?.upcomingUnlocks || null,
        
        // Protocol Revenue/Fees
        fees24h: protocolData?.fees24h || null,
        revenue24h: protocolData?.revenue24h || null,
        fees30d: protocolData?.fees30d || null,
        revenue30d: protocolData?.revenue30d || null,
        
        // Historical Data
        priceHistory: coinGeckoData.sparkline_in_7d?.price || null,
        tvlHistory: protocolData?.tvlHistory || null
      };

      return unifiedData;
    } catch (error) {
      console.error('Error fetching unified asset data:', error);
      return null;
    }
  }

  private async fetchCoinGeckoData(coinId: string): Promise<any | null> {
    try {
      // Get detailed token data directly
      const detailData = await coinGeckoService.getTokenDetails(coinId);
      if (!detailData) {
        return null;
      }

      // Extract market data from the detailed response
      const marketData = detailData.market_data;
      
      return {
        id: detailData.id,
        symbol: detailData.symbol,
        name: detailData.name,
        image: detailData.image?.large || detailData.image?.small || '',
        current_price: marketData?.current_price?.usd || 0,
        market_cap: marketData?.market_cap?.usd || 0,
        fully_diluted_valuation: marketData?.fully_diluted_valuation?.usd || 0,
        total_volume: marketData?.total_volume?.usd || 0,
        price_change_percentage_24h: marketData?.price_change_percentage_24h || 0,
        price_change_percentage_7d: marketData?.price_change_percentage_7d || 0,
        price_change_percentage_30d: marketData?.price_change_percentage_30d || 0,
        circulating_supply: marketData?.circulating_supply || 0,
        total_supply: marketData?.total_supply || 0,
        max_supply: marketData?.max_supply || null,
        ath: marketData?.ath?.usd || 0,
        ath_date: marketData?.ath_date?.usd || '',
        atl: marketData?.atl?.usd || 0,
        atl_date: marketData?.atl_date?.usd || '',
        categories: detailData.categories || [],
        sparkline_in_7d: marketData?.sparkline_7d || null
      };
    } catch (error) {
      console.error('Error fetching CoinGecko data:', error);
      return null;
    }
  }

  private async fetchTrendingStatus(coinId: string): Promise<boolean> {
    try {
      // Check if coin is in trending list
      const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
      const data = await response.json();
      
      if (data?.coins) {
        return data.coins.some((coin: any) => coin.item.id === coinId);
      }
      return false;
    } catch (error) {
      console.error('Error checking trending status:', error);
      return false;
    }
  }

  private async fetchDefiLlamaProtocolData(coinId: string): Promise<any | null> {
    try {
      // Get all protocols to find matching one
      const protocols = await defiLlamaService.getAllProtocols();
      if (!protocols) return null;

      // Find protocol matching the coin
      const protocol = protocols.find(p => 
        (p as any).gecko_id === coinId || 
        p.symbol?.toLowerCase() === coinId.toLowerCase() ||
        p.name.toLowerCase() === coinId.toLowerCase()
      );

      if (!protocol) return null;

      // Fetch detailed protocol data
      const [protocolDetails, revenueData, userData] = await Promise.all([
        defiLlamaService.getProtocolDetails(protocol.id),
        defiLlamaService.getProtocolRevenue(protocol.id),
        this.fetchUserData(protocol.id)
      ]);

      // Get liquidity data if available
      const liquidityData = await this.fetchLiquidityData(coinId);

      return {
        tvl: protocol.tvl,
        tvlChange24h: protocol.change_1d || null,
        fees24h: revenueData?.totalFees24h || null,
        revenue24h: revenueData?.totalRevenue24h || null,
        fees30d: revenueData?.totalFees30d || null,
        revenue30d: revenueData?.totalRevenue30d || null,
        activeUsers: userData?.users24h || null,
        activeUsersChange24h: userData?.userChange24h || null,
        liquidity: liquidityData?.totalLiquidity || null,
        topPools: liquidityData?.topPools || null,
        tvlHistory: protocolDetails?.tvl || null
      };
    } catch (error) {
      console.error('Error fetching DefiLlama protocol data:', error);
      return null;
    }
  }

  private async fetchUserData(protocolId: string): Promise<any | null> {
    try {
      // Try to get active users data
      const activeUsers = await defiLlamaService.getActiveUsers();
      if (!activeUsers) return null;

      const protocolUsers = activeUsers.protocols?.find(
        (p: any) => p.name === protocolId || p.id === protocolId
      );

      return protocolUsers || null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  private async fetchLiquidityData(coinId: string): Promise<any | null> {
    try {
      // Get yield pools to find liquidity data
      const pools = await defiLlamaService.getYieldPools();
      if (!pools || !Array.isArray(pools)) return null;

      // Filter pools for this token
      const tokenPools = pools.filter(pool => {
        if (!pool || typeof pool !== 'object') return false;
        
        const symbolMatch = pool.symbol && pool.symbol.toLowerCase().includes(coinId.toLowerCase());
        const underlyingMatch = Array.isArray(pool.underlyingTokens) && 
          pool.underlyingTokens.some(t => t && t.toLowerCase().includes(coinId.toLowerCase()));
        
        return symbolMatch || underlyingMatch;
      });

      if (tokenPools.length === 0) return null;

      // Calculate total liquidity and get top pools
      const totalLiquidity = tokenPools.reduce((sum, pool) => sum + (pool.tvlUsd || 0), 0);
      const topPools = tokenPools
        .sort((a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0))
        .slice(0, 5)
        .map(pool => ({
          pool: pool.symbol || 'Unknown',
          liquidity: pool.tvlUsd || 0,
          chain: pool.chain || 'Unknown'
        }));

      return { totalLiquidity, topPools };
    } catch (error) {
      console.error('Error fetching liquidity data:', error);
      return null;
    }
  }

  private async fetchUnlockData(coinId: string): Promise<any | null> {
    try {
      // Get token unlocks from DefiLlama
      const unlocks = await defiLlamaService.getTokenUnlocks(coinId);
      if (!unlocks || unlocks.length === 0) return null;

      // Sort by date
      const sortedUnlocks = unlocks.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Get next unlock
      const futureUnlocks = sortedUnlocks.filter(u => 
        new Date(u.date).getTime() > Date.now()
      );

      if (futureUnlocks.length === 0) return null;

      const nextUnlock = futureUnlocks[0];
      const upcomingUnlocks = futureUnlocks.slice(0, 5).map(u => ({
        date: u.date,
        amount: u.amount,
        percentage: u.percentage
      }));

      return {
        nextUnlock: {
          date: nextUnlock.date,
          amount: nextUnlock.amount,
          percentage: nextUnlock.percentage,
          impact: nextUnlock.impact
        },
        upcomingUnlocks
      };
    } catch (error) {
      console.error('Error fetching unlock data:', error);
      return null;
    }
  }
}

export const unifiedAssetService = new UnifiedAssetService();