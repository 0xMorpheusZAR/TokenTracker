interface DuneQueryResult {
  execution_id: string;
  query_id: number;
  state: string;
  submitted_at: string;
  expires_at: string;
  execution_started_at: string;
  execution_ended_at: string;
  result: {
    rows: any[];
    metadata: {
      column_names: string[];
      column_types: string[];
      row_count: number;
      result_set_bytes: number;
      total_row_count: number;
      datapoint_count: number;
      pending_time_millis: number;
      execution_time_millis: number;
    };
  };
}

interface ProtocolRevenueData {
  protocol_name: string;
  symbol: string;
  category: string;
  daily_revenue: number;
  monthly_revenue: number;
  quarterly_revenue: number;
  annual_revenue: number;
  revenue_growth_30d: number;
  revenue_growth_90d: number;
  total_value_locked: number;
  active_users: number;
  transaction_count: number;
  fee_to_revenue_ratio: number;
  last_updated: string;
}

export class DuneService {
  private baseUrl = 'https://api.dune.com/api/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DUNE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('DUNE_API_KEY not found in environment variables');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'X-Dune-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getQueryResults(queryId: number, limit: number = 1000): Promise<DuneQueryResult | null> {
    if (!this.apiKey) {
      console.error('Dune API key not configured');
      return null;
    }

    try {
      console.log(`Fetching Dune query ${queryId} with limit ${limit}`);
      
      const response = await fetch(
        `${this.baseUrl}/query/${queryId}/results?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        console.error(`Dune API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        return null;
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.result?.metadata?.row_count || 0} rows from Dune`);
      return data;

    } catch (error) {
      console.error('Error fetching data from Dune:', error);
      return null;
    }
  }

  async getProtocolRevenueData(): Promise<ProtocolRevenueData[] | null> {
    // Query ID 4796056 from the user's request
    const queryResult = await this.getQueryResults(4796056, 1000);
    
    if (!queryResult || !queryResult.result?.rows) {
      console.log('No Dune data available');
      return null;
    }

    try {
      // Transform Dune data to our protocol format using the actual structure
      const protocolData: ProtocolRevenueData[] = queryResult.result.rows.map((row: any) => {
        return {
          protocol_name: this.getProtocolName(row.symbol),
          symbol: row.symbol || 'UNKNOWN',
          category: row.category || 'DeFi',
          daily_revenue: parseFloat(row.monthly_revenue_30d || 0) / 30, // Approximate daily from monthly
          monthly_revenue: parseFloat(row.monthly_revenue_30d || 0),
          quarterly_revenue: parseFloat(row.quarterly_revenue || 0),
          annual_revenue: parseFloat(row.annualized_revenue || 0),
          revenue_growth_30d: parseFloat(row.revenue_growth_30d || 0),
          revenue_growth_90d: parseFloat(row.revenue_growth_90d || 0),
          total_value_locked: parseFloat(row.fully_diluted_valuation || 0), // Using FDV as proxy
          active_users: 0, // Not available in this dataset
          transaction_count: 0, // Not available in this dataset
          fee_to_revenue_ratio: row.annualized_fees && row.annualized_revenue ? 
            parseFloat(row.annualized_fees) / parseFloat(row.annualized_revenue) : 0.8,
          last_updated: new Date().toISOString()
        };
      });

      console.log(`Processed ${protocolData.length} protocols from Dune data`);
      return protocolData;

    } catch (error) {
      console.error('Error processing Dune protocol data:', error);
      return null;
    }
  }

  private getProtocolName(symbol: string): string {
    const protocolNames: { [key: string]: string } = {
      'HYPE': 'Hyperliquid',
      'CAKE': 'PancakeSwap',
      'AERO': 'Aerodrome',
      'MKR': 'MakerDAO',
      'AAVE': 'Aave',
      'UNI': 'Uniswap',
      'GMX': 'GMX',
      'PENDLE': 'Pendle',
      'COMP': 'Compound',
      'CRV': 'Curve',
      'BAL': 'Balancer',
      'SUSHI': 'SushiSwap',
      'RAY': 'Raydium',
      'JUP': 'Jupiter'
    };
    return protocolNames[symbol] || symbol;
  }

  async executeQuery(queryId: number, parameters?: Record<string, any>): Promise<string | null> {
    if (!this.apiKey) {
      console.error('Dune API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/query/${queryId}/execute`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            query_parameters: parameters || {}
          })
        }
      );

      if (!response.ok) {
        console.error(`Dune execute error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data.execution_id;

    } catch (error) {
      console.error('Error executing Dune query:', error);
      return null;
    }
  }

  async getExecutionStatus(executionId: string): Promise<DuneQueryResult | null> {
    if (!this.apiKey) {
      console.error('Dune API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/execution/${executionId}/status`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        console.error(`Dune status error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();

    } catch (error) {
      console.error('Error getting Dune execution status:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return !!this.apiKey;
  }

  getConnectionStatus(): { connected: boolean; queryId: number } {
    return {
      connected: this.isConnected(),
      queryId: 4796056
    };
  }
}

export const duneService = new DuneService();