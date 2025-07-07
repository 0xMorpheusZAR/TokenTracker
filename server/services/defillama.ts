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
      // Fetch fees data from the overview endpoint
      const feesResponse = await fetch(`${this.baseUrl}/overview/fees`, {
        headers: this.getHeaders(),
      });

      if (!feesResponse.ok) {
        console.error('Failed to fetch fees overview:', feesResponse.status);
        return [];
      }

      const feesData = await feesResponse.json();
      const protocols: ProtocolRevenue[] = [];

      // Process protocols from the fees data
      if (feesData.protocols && Array.isArray(feesData.protocols)) {
        for (const protocol of feesData.protocols) {
          const protocolRevenue: ProtocolRevenue = {
            id: protocol.module || protocol.name?.toLowerCase().replace(/\s+/g, '-') || '',
            name: protocol.name || '',
            displayName: protocol.displayName || protocol.name || '',
            logo: protocol.logo,
            category: protocol.category || 'DeFi',
            chains: protocol.chains || [],
            revenue24h: protocol.dailyRevenue || 0,
            revenue7d: protocol.revenue7d || 0,
            revenue30d: protocol.revenue30d || 0,
            totalRevenue: protocol.totalRevenue || 0,
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
            tvl: protocol.tvl || 0,
            change24h: protocol.change_1d || 0,
            change7d: protocol.change_7d || 0,
            change30d: protocol.change_1m || 0,
          };

          // Calculate P/E ratio if market cap is available
          if (protocol.mcap && protocolRevenue.fees30d > 0) {
            protocolRevenue.mcapToFees = protocol.mcap / (protocolRevenue.fees30d * 12);
            protocolRevenue.peRatio = protocolRevenue.mcapToFees;
          }

          protocols.push(protocolRevenue);
        }
      }

      // Sort protocols by 24h fees
      protocols.sort((a, b) => (b.fees24h || 0) - (a.fees24h || 0));

      return protocols;
    } catch (error) {
      console.error('Error fetching protocol revenues:', error);
      return [];
    }
  }



  async getCategoryRevenues(): Promise<CategoryRevenue[] | null> {
    try {
      const protocols = await this.getProtocolRevenues();
      if (!protocols) return null;

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
          const totalRevenue24h = protocols.reduce((sum, p) => sum + p.revenue24h, 0);
          const totalRevenue7d = protocols.reduce((sum, p) => sum + p.revenue7d, 0);
          const totalRevenue30d = protocols.reduce((sum, p) => sum + p.revenue30d, 0);
          
          return {
            category,
            totalRevenue24h,
            totalRevenue7d,
            totalRevenue30d,
            protocolCount: protocols.length,
            topProtocols: protocols.slice(0, 5), // Top 5 protocols per category
          };
        })
        .sort((a, b) => b.totalRevenue24h - a.totalRevenue24h);

      return categoryRevenues;
    } catch (error) {
      console.error('Error calculating category revenues:', error);
      return null;
    }
  }

  async getChainRevenues(): Promise<ChainRevenue[] | null> {
    try {
      const protocols = await this.getProtocolRevenues();
      if (!protocols) return null;

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
          chainData.revenue24h += protocol.revenue24h;
          chainData.revenue7d += protocol.revenue7d;
          chainData.revenue30d += protocol.revenue30d;
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
        .sort((a, b) => b.revenue24h - a.revenue24h);

      return chainRevenues;
    } catch (error) {
      console.error('Error calculating chain revenues:', error);
      return null;
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