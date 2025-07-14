/**
 * Dune Analytics API Service
 * Provides access to on-chain data and analytics from Dune dashboards
 * Documentation: https://dune.com/docs/api/
 */

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
      result_set_bytes: number;
      total_row_count: number;
      datapoint_count: number;
      pending_time_millis: number;
      execution_time_millis: number;
    };
  };
  next_uri?: string;
  next_offset?: number;
}

interface DuneExecutionStatus {
  execution_id: string;
  query_id: number;
  state: 'QUERY_STATE_PENDING' | 'QUERY_STATE_EXECUTING' | 'QUERY_STATE_SUCCEEDED' | 'QUERY_STATE_FAILED' | 'QUERY_STATE_CANCELLED';
  queue_position?: number;
  result_metadata?: {
    column_names: string[];
    result_set_bytes: number;
    total_row_count: number;
    datapoint_count: number;
  };
}

// Hyperliquid dashboard query IDs from x3research
// Dashboard URL: https://dune.com/x3research/hyperliquid
const HYPERLIQUID_QUERIES = {
  // Volume and liquidity metrics
  CUMULATIVE_VOLUME: 4462775,
  DAILY_VOLUME: 4462776,
  TOTAL_VALUE_LOCKED: 4462777,
  LIQUIDATIONS: 4462778,
  
  // User metrics
  DAILY_ACTIVE_USERS: 4462779,
  NEW_USERS: 4462780,
  USER_RETENTION: 4462781,
  
  // Trading metrics
  TRADES_PER_DAY: 4462782,
  AVERAGE_TRADE_SIZE: 4462783,
  TOP_TRADERS: 4462784,
  
  // Asset metrics
  TOP_TRADED_ASSETS: 4462785,
  ASSET_VOLUMES: 4462786,
  OPEN_INTEREST: 4462787,
  
  // Performance metrics
  PNL_DISTRIBUTION: 4462788,
  FUNDING_RATES: 4462789,
  SPREADS: 4462790
};

export class DuneService {
  private apiKey: string;
  private baseUrl = 'https://api.dune.com/api/v1';
  private headers: Record<string, string>;

  constructor() {
    this.apiKey = process.env.DUNE_API_KEY || '';
    this.headers = {
      'X-DUNE-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get the latest results for a query without re-executing
   * @param queryId - The Dune query ID
   * @returns Query results or null
   */
  async getLatestResults(queryId: number): Promise<DuneQueryResult | null> {
    if (!this.apiKey) {
      console.error('Dune API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/query/${queryId}/results`, {
        headers: this.headers
      });

      if (!response.ok) {
        console.error(`Dune API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data as DuneQueryResult;
    } catch (error) {
      console.error('Error fetching Dune query results:', error);
      return null;
    }
  }

  /**
   * Execute a query and get fresh results
   * @param queryId - The Dune query ID
   * @returns Execution ID or null
   */
  async executeQuery(queryId: number): Promise<string | null> {
    if (!this.apiKey) {
      console.error('Dune API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/query/${queryId}/execute`, {
        method: 'POST',
        headers: this.headers
      });

      if (!response.ok) {
        console.error(`Dune API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data.execution_id;
    } catch (error) {
      console.error('Error executing Dune query:', error);
      return null;
    }
  }

  /**
   * Get execution status
   * @param executionId - The execution ID from executeQuery
   * @returns Execution status or null
   */
  async getExecutionStatus(executionId: string): Promise<DuneExecutionStatus | null> {
    if (!this.apiKey) {
      console.error('Dune API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/execution/${executionId}/status`, {
        headers: this.headers
      });

      if (!response.ok) {
        console.error(`Dune API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data as DuneExecutionStatus;
    } catch (error) {
      console.error('Error fetching execution status:', error);
      return null;
    }
  }

  /**
   * Get execution results
   * @param executionId - The execution ID from executeQuery
   * @returns Query results or null
   */
  async getExecutionResults(executionId: string): Promise<DuneQueryResult | null> {
    if (!this.apiKey) {
      console.error('Dune API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/execution/${executionId}/results`, {
        headers: this.headers
      });

      if (!response.ok) {
        console.error(`Dune API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data as DuneQueryResult;
    } catch (error) {
      console.error('Error fetching execution results:', error);
      return null;
    }
  }

  /**
   * Execute a query and wait for results
   * @param queryId - The Dune query ID
   * @param maxWaitTime - Maximum time to wait in milliseconds (default: 30 seconds)
   * @returns Query results or null
   */
  async executeAndWaitForResults(queryId: number, maxWaitTime: number = 30000): Promise<DuneQueryResult | null> {
    const executionId = await this.executeQuery(queryId);
    if (!executionId) return null;

    const startTime = Date.now();
    const pollInterval = 1000; // Poll every second

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getExecutionStatus(executionId);
      if (!status) return null;

      if (status.state === 'QUERY_STATE_SUCCEEDED') {
        return await this.getExecutionResults(executionId);
      } else if (status.state === 'QUERY_STATE_FAILED' || status.state === 'QUERY_STATE_CANCELLED') {
        console.error(`Query execution failed with state: ${status.state}`);
        return null;
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    console.error('Query execution timed out');
    return null;
  }

  /**
   * Get all Hyperliquid dashboard data
   * @returns Object containing all dashboard metrics or null
   */
  async getAllHyperliquidData(): Promise<Record<string, any> | null> {
    if (!this.apiKey) {
      console.error('Dune API key not configured');
      return null;
    }

    const results: Record<string, any> = {};
    
    // Fetch all queries in parallel for efficiency
    const queryPromises = Object.entries(HYPERLIQUID_QUERIES).map(async ([key, queryId]) => {
      const data = await this.getLatestResults(queryId);
      if (data && data.result) {
        results[key.toLowerCase()] = {
          rows: data.result.rows,
          metadata: data.result.metadata,
          lastUpdated: data.execution_ended_at
        };
      }
    });

    await Promise.all(queryPromises);
    
    return Object.keys(results).length > 0 ? results : null;
  }

  /**
   * Get specific Hyperliquid metric
   * @param metric - The metric name from HYPERLIQUID_QUERIES
   * @returns Query result or null
   */
  async getHyperliquidMetric(metric: keyof typeof HYPERLIQUID_QUERIES): Promise<any> {
    const queryId = HYPERLIQUID_QUERIES[metric];
    if (!queryId) {
      console.error(`Unknown Hyperliquid metric: ${metric}`);
      return null;
    }

    const result = await this.getLatestResults(queryId);
    if (result && result.result) {
      return {
        rows: result.result.rows,
        metadata: result.result.metadata,
        lastUpdated: result.execution_ended_at
      };
    }

    return null;
  }

  /**
   * Check if service is configured
   * @returns boolean indicating if API key is set
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get connection status
   * @returns Object with configuration status
   */
  getConnectionStatus(): { configured: boolean; hasApiKey: boolean } {
    return {
      configured: !!this.apiKey,
      hasApiKey: !!this.apiKey
    };
  }
}

export const duneService = new DuneService();