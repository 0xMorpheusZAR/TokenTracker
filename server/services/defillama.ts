/**
 * DefiLlama API Service for protocol analytics
 * Provides access to TVL, revenue, and other DeFi metrics
 */

interface ProtocolRevenue {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  category?: string;
  chains: string[];
  revenue24h: number;
  revenue7d: number;
  revenue30d: number;
  totalRevenue: number;
  tvl?: number;
  change24h?: number;
  change7d?: number;
  change30d?: number;
  // Additional metrics
  fees24h?: number;
  fees7d?: number;
  fees30d?: number;
  holdersRevenue24h?: number;
  holdersRevenue7d?: number;
  holdersRevenue30d?: number;
  earnings24h?: number;
  earnings7d?: number;
  earnings30d?: number;
  userFees24h?: number;
  supplySideRevenue24h?: number;
  protocolRevenue24h?: number;
  mcapToFees?: number;
  peRatio?: number;
}

interface CategoryRevenue {
  category: string;
  totalRevenue24h: number;
  totalRevenue7d: number;
  totalRevenue30d: number;
  protocolCount: number;
  topProtocols: ProtocolRevenue[];
}

interface ChainRevenue {
  chain: string;
  revenue24h: number;
  revenue7d: number;
  revenue30d: number;
  protocolCount: number;
}

interface ProtocolMetrics {
  fees?: any;
  revenue?: any;
  holdersRevenue?: any;
  earnings?: any;
}

export class DefiLlamaService {
  private baseUrl = 'https://api.llama.fi';
  
  constructor() {
    console.log('DefiLlama service initialized with public API');
  }

  private getHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json',
    };
  }

  async getProtocolRevenues(): Promise<ProtocolRevenue[] | null> {
    try {
      // Create a map to aggregate all protocol data
      const protocolMap = new Map<string, ProtocolRevenue>();

      // Fetch fees data and protocols data in parallel
      const [feesResponse, protocolsResponse] = await Promise.all([
        fetch(`${this.baseUrl}/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`, {
          headers: this.getHeaders(),
        }),
        fetch(`${this.baseUrl}/protocols`, {
          headers: this.getHeaders(),
        })
      ]);

      // Create TVL map from protocols data
      const tvlMap = new Map<string, number>();
      const nameToTvlMap = new Map<string, number>();
      if (protocolsResponse.ok) {
        const protocolsData = await protocolsResponse.json();
        protocolsData.forEach((protocol: any) => {
          const slug = protocol.slug || '';
          const name = protocol.name || '';
          const tvl = protocol.tvl || 0;
          
          // Map by both slug and name for better matching
          if (slug) tvlMap.set(slug, tvl);
          if (name) {
            nameToTvlMap.set(name.toLowerCase(), tvl);
            nameToTvlMap.set(name, tvl);
          }
          
          // Also map common variations
          if (slug.includes('-')) {
            tvlMap.set(slug.replace(/-/g, ''), tvl);
          }
        });
      }

      if (feesResponse.ok) {
        const feesData = await feesResponse.json();
        if (feesData.protocols && Array.isArray(feesData.protocols)) {
          feesData.protocols.forEach((protocol: any) => {
            const id = protocol.module || protocol.name?.toLowerCase().replace(/\s+/g, '-') || '';
            const protocolRevenue: ProtocolRevenue = {
              id,
              name: protocol.name || '',
              displayName: protocol.displayName || protocol.name || '',
              logo: protocol.logo,
              category: protocol.category || 'DeFi',
              chains: protocol.chains || [],
              revenue24h: protocol.dailyRevenue || protocol.total24h || 0,
              revenue7d: protocol.revenue7d || protocol.total7d || 0,
              revenue30d: protocol.revenue30d || protocol.total30d || 0,
              totalRevenue: protocol.totalRevenue || protocol.totalAllTime || 0,
              fees24h: protocol.dailyFees || protocol.total24h || 0,
              fees7d: protocol.total7d || 0,
              fees30d: protocol.total30d || 0,
              holdersRevenue24h: protocol.dailyHoldersRevenue || 0,
              holdersRevenue7d: protocol.holdersRevenue7d || 0,
              holdersRevenue30d: protocol.holdersRevenue30d || 0,
              earnings24h: protocol.dailyProtocolRevenue || 0,
              earnings7d: protocol.protocolRevenue7d || 0,
              earnings30d: protocol.protocolRevenue30d || 0,
              userFees24h: protocol.dailyUserFees || 0,
              supplySideRevenue24h: protocol.dailySupplySideRevenue || 0,
              protocolRevenue24h: protocol.dailyProtocolRevenue || 0,
              tvl: tvlMap.get(id) || tvlMap.get(protocol.module) || nameToTvlMap.get(protocol.name) || nameToTvlMap.get(protocol.name?.toLowerCase()) || protocol.tvl || 0,
              change24h: protocol.change_1d || 0,
              change7d: protocol.change_7d || 0,
              change30d: protocol.change_1m || 0,
            };

            // If revenue is 0, use fees as revenue (common for DEXs and lending protocols)
            if (protocolRevenue.revenue24h === 0 && protocolRevenue.fees24h > 0) {
              protocolRevenue.revenue24h = protocolRevenue.fees24h;
              protocolRevenue.revenue7d = protocolRevenue.fees7d;
              protocolRevenue.revenue30d = protocolRevenue.fees30d;
            }

            protocolMap.set(id, protocolRevenue);
          });
        }
      }

      // Convert map to array and sort by revenue/fees
      const protocols = Array.from(protocolMap.values())
        .filter(p => p.revenue24h > 0 || p.fees24h > 0)
        .sort((a, b) => (b.revenue24h || 0) - (a.revenue24h || 0));

      return protocols;
    } catch (error) {
      console.error('Error fetching protocol revenues:', error);
      return [];
    }
  }



  async getCategoryRevenues(): Promise<CategoryRevenue[] | null> {
    try {
      const protocols = await this.getProtocolRevenues();
      if (!protocols || protocols.length === 0) return [];

      // Group protocols by category
      const categoryMap = new Map<string, ProtocolRevenue[]>();
      
      protocols.forEach(protocol => {
        const category = protocol.category || 'Other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(protocol);
      });

      // Calculate category revenues
      const categoryRevenues: CategoryRevenue[] = Array.from(categoryMap.entries())
        .map(([category, protocols]) => {
          const totalRevenue24h = protocols.reduce((sum, p) => sum + (p.revenue24h || 0), 0);
          const totalRevenue7d = protocols.reduce((sum, p) => sum + (p.revenue7d || 0), 0);
          const totalRevenue30d = protocols.reduce((sum, p) => sum + (p.revenue30d || 0), 0);
          
          return {
            category,
            totalRevenue24h,
            totalRevenue7d,
            totalRevenue30d,
            protocolCount: protocols.length,
            topProtocols: protocols
              .sort((a, b) => (b.revenue24h || 0) - (a.revenue24h || 0))
              .slice(0, 5), // Top 5 protocols per category
          };
        })
        .filter(cat => cat.totalRevenue24h > 0 || cat.totalRevenue7d > 0 || cat.totalRevenue30d > 0)
        .sort((a, b) => (b.totalRevenue24h || 0) - (a.totalRevenue24h || 0));

      return categoryRevenues;
    } catch (error) {
      console.error('Error calculating category revenues:', error);
      return [];
    }
  }

  async getChainRevenues(): Promise<ChainRevenue[] | null> {
    try {
      const protocols = await this.getProtocolRevenues();
      if (!protocols || protocols.length === 0) return [];

      // Group revenues by chain
      const chainMap = new Map<string, { revenue24h: number; revenue7d: number; revenue30d: number; protocols: Set<string> }>();
      
      protocols.forEach(protocol => {
        protocol.chains.forEach(chain => {
          if (!chainMap.has(chain)) {
            chainMap.set(chain, {
              revenue24h: 0,
              revenue7d: 0,
              revenue30d: 0,
              protocols: new Set(),
            });
          }
          
          const chainData = chainMap.get(chain)!;
          chainData.revenue24h += protocol.revenue24h || 0;
          chainData.revenue7d += protocol.revenue7d || 0;
          chainData.revenue30d += protocol.revenue30d || 0;
          chainData.protocols.add(protocol.id);
        });
      });

      // Convert to array and sort
      const chainRevenues: ChainRevenue[] = Array.from(chainMap.entries())
        .map(([chain, data]) => ({
          chain,
          revenue24h: data.revenue24h,
          revenue7d: data.revenue7d,
          revenue30d: data.revenue30d,
          protocolCount: data.protocols.size,
        }))
        .filter(chain => chain.revenue24h > 0 || chain.revenue7d > 0 || chain.revenue30d > 0)
        .sort((a, b) => (b.revenue24h || 0) - (a.revenue24h || 0));

      return chainRevenues;
    } catch (error) {
      console.error('Error calculating chain revenues:', error);
      return [];
    }
  }

  async getProtocolDetails(protocolId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/protocol/${protocolId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch protocol details:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching protocol details:', error);
      return null;
    }
  }

  async getActiveUsers(): Promise<any> {
    try {
      // Note: Active users endpoint might not be available in public API
      // Returning null for now
      return null;
    } catch (error) {
      console.error('Error fetching active users:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return true; // Public API is always available
  }

  getConnectionStatus(): { connected: boolean; hasApiKey: boolean } {
    return {
      connected: true,
      hasApiKey: false, // No API key needed for public API
    };
  }
}

export const defiLlamaService = new DefiLlamaService();