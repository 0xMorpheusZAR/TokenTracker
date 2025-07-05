/**
 * DefiLlama Pro API Service
 * Provides comprehensive DeFi data including TVL, fees, revenue, unlocks, and more
 */

interface DefiLlamaProtocol {
  id: string;
  name: string;
  symbol?: string;
  tvl: number;
  chain: string;
  chains?: string[];
  change_1h?: number;
  change_1d?: number;
  change_7d?: number;
  mcap?: number;
  fdv?: number;
  category?: string;
  fees?: number;
  revenue?: number;
}

interface TokenUnlock {
  token: string;
  gecko_id?: string;
  date: string;
  amount: string;
  percentage: number;
  impact: string;
  price?: number;
  value_usd?: number;
  type?: string;
  description?: string;
}

interface ProtocolRevenue {
  protocol: string;
  totalDataChart: Array<[number, number]>;
  totalFees24h: number;
  totalRevenue24h: number;
  totalFees30d: number;
  totalRevenue30d: number;
  totalAllTime?: number;
  chains?: Record<string, number>;
}

interface ProtocolTVL {
  date: number;
  tvl: number;
  chainTvls?: Record<string, number>;
}

interface ActiveUsersData {
  protocol: string;
  users24h: number;
  users7d: number;
  users30d: number;
  txns24h?: number;
  gasUsed24h?: number;
  chains?: Record<string, number>;
}

interface YieldPool {
  pool: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase?: number;
  apyReward?: number;
  chain: string;
  rewardTokens?: string[];
  underlyingTokens?: string[];
  poolMeta?: string;
  exposure?: string;
  predictions?: any;
}

interface StablecoinData {
  id: string;
  name: string;
  symbol: string;
  circulating: number;
  price: number;
  chains: Record<string, number>;
  change_1d?: number;
  change_7d?: number;
  change_1m?: number;
}

interface HackData {
  date: string;
  protocol: string;
  classification: string;
  technique?: string;
  amount?: number;
  chain?: string;
  description?: string;
  returnedFunds?: number;
}

interface RaiseData {
  date: string;
  name: string;
  round?: string;
  amount: number;
  chains?: string[];
  category?: string;
  investors?: string[];
  valuation?: number;
}

interface DerivativesVolume {
  protocol: string;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  openInterest?: number;
  chains?: Record<string, number>;
  change_1d?: number;
  marketShare?: number;
}

export class DefiLlamaService {
  private baseUrl: string;
  private apiKey: string;
  private isConnected: boolean = false;

  constructor() {
    this.apiKey = process.env.DEFILLAMA_API_KEY || '';
    this.baseUrl = this.apiKey 
      ? `https://pro-api.llama.fi/${this.apiKey}`
      : 'https://api.llama.fi';
    
    if (this.apiKey) {
      this.isConnected = true;
      console.log('DefiLlama Pro API initialized');
    } else {
      console.log('DefiLlama API initialized (free tier - limited features)');
    }
  }

  private async fetchData<T>(endpoint: string): Promise<T | null> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TokenFailureAnalytics/1.0'
        }
      });

      if (!response.ok) {
        console.error(`DefiLlama API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`DefiLlama API request failed: ${error}`);
      return null;
    }
  }

  /**
   * Get all token unlock/emission data
   */
  async getAllTokenUnlocks(): Promise<any[] | null> {
    return this.fetchData('/api/emissions');
  }

  /**
   * Get unlock data for a specific token
   */
  async getTokenUnlocks(geckoId: string): Promise<TokenUnlock[] | null> {
    const data = await this.fetchData<any>(`/api/emission/${geckoId}`);
    if (!data) return null;

    // Transform the data into our TokenUnlock format
    try {
      const unlocks: TokenUnlock[] = [];
      if (data.events) {
        for (const event of data.events) {
          unlocks.push({
            token: data.name || geckoId,
            gecko_id: geckoId,
            date: event.date,
            amount: event.amount?.toString() || '0',
            percentage: event.percentage || 0,
            impact: event.impact || 'medium',
            type: event.type,
            description: event.description,
            price: data.price,
            value_usd: event.value_usd
          });
        }
      }
      return unlocks;
    } catch (error) {
      console.error('Error parsing unlock data:', error);
      return null;
    }
  }

  /**
   * Get list of all protocols with TVL
   */
  async getAllProtocols(): Promise<DefiLlamaProtocol[] | null> {
    return this.fetchData('/api/protocols');
  }

  /**
   * Get detailed protocol data including historical TVL
   */
  async getProtocolDetails(protocol: string): Promise<any | null> {
    return this.fetchData(`/api/protocol/${protocol}`);
  }

  /**
   * Get current TVL for a specific protocol
   */
  async getProtocolTVL(protocol: string): Promise<number | null> {
    const data = await this.fetchData<number>(`/api/tvl/${protocol}`);
    return data;
  }

  /**
   * Get fees and revenue overview for all protocols
   */
  async getFeesAndRevenue(dataType: 'dailyFees' | 'dailyRevenue' = 'dailyRevenue'): Promise<any | null> {
    return this.fetchData(`/api/overview/fees?dataType=${dataType}`);
  }

  /**
   * Get fees and revenue for a specific protocol
   */
  async getProtocolRevenue(protocol: string): Promise<ProtocolRevenue | null> {
    return this.fetchData(`/api/summary/fees/${protocol}`);
  }

  /**
   * Get active users data
   */
  async getActiveUsers(): Promise<any | null> {
    return this.fetchData('/api/activeUsers');
  }

  /**
   * Get user data for a specific protocol
   */
  async getProtocolUsers(protocolId: number): Promise<ActiveUsersData | null> {
    return this.fetchData(`/api/userData/activeUsers/${protocolId}`);
  }

  /**
   * Get current chain TVLs
   */
  async getChainTVLs(): Promise<any | null> {
    return this.fetchData('/api/v2/chains');
  }

  /**
   * Get historical TVL for a specific chain
   */
  async getChainHistoricalTVL(chain: string): Promise<any | null> {
    return this.fetchData(`/api/v2/historicalChainTvl/${chain}`);
  }

  /**
   * Get stablecoin data
   */
  async getStablecoins(includePrices: boolean = true): Promise<StablecoinData[] | null> {
    return this.fetchData(`/stablecoins?includePrices=${includePrices}`);
  }

  /**
   * Get stablecoin dominance for a chain
   */
  async getStablecoinDominance(chain: string): Promise<any | null> {
    return this.fetchData(`/stablecoins/stablecoindominance/${chain}`);
  }

  /**
   * Get yield/APY data for all pools
   */
  async getYieldPools(): Promise<YieldPool[] | null> {
    return this.fetchData('/yields/pools');
  }

  /**
   * Get historical yield data for a specific pool
   */
  async getYieldHistory(poolId: string): Promise<any | null> {
    return this.fetchData(`/yields/chart/${poolId}`);
  }

  /**
   * Get derivatives/perps volume data
   */
  async getDerivativesOverview(): Promise<any | null> {
    return this.fetchData('/api/overview/derivatives');
  }

  /**
   * Get volume data for a specific derivatives protocol
   */
  async getDerivativesProtocol(protocol: string): Promise<DerivativesVolume | null> {
    return this.fetchData(`/api/summary/derivatives/${protocol}`);
  }

  /**
   * Get hack/exploit data
   */
  async getHacks(): Promise<HackData[] | null> {
    return this.fetchData('/api/hacks');
  }

  /**
   * Get funding rounds data
   */
  async getRaises(): Promise<RaiseData[] | null> {
    return this.fetchData('/api/raises');
  }

  /**
   * Get token prices (current)
   */
  async getTokenPrices(tokens: string[]): Promise<any | null> {
    const tokenString = tokens.join(',');
    return this.fetchData(`/coins/prices/current/${tokenString}`);
  }

  /**
   * Get historical token prices
   */
  async getHistoricalTokenPrices(tokens: string[], timestamp: number): Promise<any | null> {
    const tokenString = tokens.join(',');
    return this.fetchData(`/coins/prices/historical/${timestamp}/${tokenString}`);
  }

  /**
   * Get token price chart data
   */
  async getTokenPriceChart(token: string, start?: number, span: number = 365): Promise<any | null> {
    const params = new URLSearchParams({
      span: span.toString()
    });
    if (start) params.append('start', start.toString());
    
    return this.fetchData(`/coins/chart/${token}?${params}`);
  }

  /**
   * Get API usage/credits remaining
   */
  async getApiUsage(): Promise<any | null> {
    if (!this.apiKey) return null;
    
    // Use the non-prefixed URL for usage endpoint
    try {
      const response = await fetch(`https://pro-api.llama.fi/usage/${this.apiKey}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to get API usage:', error);
      return null;
    }
  }

  /**
   * Get token emissions/unlock data for a specific token
   */
  async getTokenEmissions(geckoId: string): Promise<any | null> {
    try {
      const data = await this.fetchData(`/api/emission/${geckoId}`);
      return data;
    } catch (error) {
      console.error('Error fetching token emissions:', error);
      return null;
    }
  }

  /**
   * Get historical liquidity data for a token
   */
  async getHistoricalLiquidity(tokenSymbol: string): Promise<any | null> {
    try {
      const data = await this.fetchData(`/api/historicalLiquidity/${tokenSymbol}`);
      return data;
    } catch (error) {
      console.error('Error fetching historical liquidity:', error);
      return null;
    }
  }

  /**
   * Get token usage across protocols
   */
  async getTokenProtocols(symbol: string): Promise<any | null> {
    try {
      const data = await this.fetchData(`/api/tokenProtocols/${symbol}`);
      return data;
    } catch (error) {
      console.error('Error fetching token protocols:', error);
      return null;
    }
  }

  /**
   * Get all emissions/unlocks data
   */
  async getAllEmissions(): Promise<any | null> {
    try {
      const data = await this.fetchData('/api/emissions');
      return data;
    } catch (error) {
      console.error('Error fetching all emissions:', error);
      return null;
    }
  }

  /**
   * Get protocol-specific TVL data with token breakdown
   */
  async getProtocolTVLBreakdown(protocol: string): Promise<any | null> {
    return this.fetchData(`/tvl/${protocol}`);
  }

  /**
   * Get protocol yields data
   */
  async getProtocolYields(protocol: string): Promise<any | null> {
    return this.fetchData(`/yields/${protocol}`);
  }

  /**
   * Get protocol-specific unlocks data
   */
  async getProtocolUnlocks(protocol: string): Promise<any | null> {
    return this.fetchData(`/unlocks/${protocol}`);
  }

  /**
   * Get comprehensive Ethena protocol data
   */
  async getEthenaProtocolData(): Promise<any> {
    try {
      const [
        protocolData,
        tvlBreakdown,
        feesData,
        yieldsData,
        unlocksData,
        allYieldPools
      ] = await Promise.all([
        this.getProtocolDetails('ethena'),
        this.getProtocolTVLBreakdown('ethena'),
        this.getProtocolRevenue('ethena'),
        this.getProtocolYields('ethena'),
        this.getProtocolUnlocks('ethena'),
        this.getYieldPools()
      ]);

      // Filter Ethena-specific yield pools
      const ethenaYields = allYieldPools?.filter(pool => 
        pool.project?.toLowerCase() === 'ethena' || 
        pool.symbol?.toLowerCase().includes('usde') ||
        pool.symbol?.toLowerCase().includes('usdtb')
      ) || [];

      return {
        protocol: protocolData,
        tvlBreakdown,
        fees: feesData,
        yields: ethenaYields,
        unlocks: unlocksData,
        metrics: {
          tvl: protocolData?.tvl || 0,
          mcap: protocolData?.mcap || 0,
          fdv: protocolData?.fdv || 0,
          fees24h: feesData?.totalFees24h || 0,
          revenue24h: feesData?.totalRevenue24h || 0,
          feesAnnualized: (feesData?.totalFees24h || 0) * 365,
          revenueAnnualized: (feesData?.totalRevenue24h || 0) * 365
        }
      };
    } catch (error) {
      console.error('Error fetching Ethena protocol data:', error);
      return null;
    }
  }

  /**
   * Get comprehensive token analytics data
   */
  async getTokenAnalytics(symbol: string, geckoId?: string): Promise<any> {
    const results = {
      unlocks: null as TokenUnlock[] | null,
      protocol: null as any,
      revenue: null as ProtocolRevenue | null,
      users: null as any,
      derivatives: null as any,
      yields: null as any
    };

    // Get unlock data if gecko ID provided
    if (geckoId) {
      results.unlocks = await this.getTokenUnlocks(geckoId);
    }

    // Try to get protocol data
    const protocolSlug = symbol.toLowerCase();
    results.protocol = await this.getProtocolDetails(protocolSlug);
    
    if (results.protocol) {
      // Get revenue data
      results.revenue = await this.getProtocolRevenue(protocolSlug);
      
      // Get derivatives data if applicable
      results.derivatives = await this.getDerivativesProtocol(protocolSlug);
    }

    // Get yield data
    const yields = await this.getYieldPools();
    if (yields) {
      results.yields = yields.filter(pool => 
        pool.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
        pool.project.toLowerCase().includes(symbol.toLowerCase())
      );
    }

    return results;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { 
    connected: boolean; 
    tier: string; 
    baseUrl: string;
    hasApiKey: boolean;
  } {
    return {
      connected: this.isConnected,
      tier: this.apiKey ? 'Pro' : 'Free',
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey
    };
  }
}

export const defiLlamaService = new DefiLlamaService();