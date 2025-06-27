interface CryptoRankUnlockResponse {
  data: {
    unlocks: Array<{
      token: string;
      date: string;
      amount: string;
      percentage: number;
      impact: string;
    }>;
  };
}

interface CryptoRankPriceResponse {
  data: {
    prices: Array<{
      date: string;
      price: number;
      marketCap: string;
      volume: string;
    }>;
  };
}

export class CryptoRankService {
  private baseUrl = 'https://api.cryptorank.io/v2';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.CRYPTORANK_API_KEY || process.env.API_KEY || 'demo_key';
  }

  async getTokenUnlocks(symbol: string): Promise<CryptoRankUnlockResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/unlocks/${symbol}?key=${this.apiKey}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TokenAnalytics/1.0'
        }
      });

      if (!response.ok) {
        console.error(`CryptoRank API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch unlock data from CryptoRank:', error);
      return null;
    }
  }

  async getTokenPriceHistory(symbol: string, days: number = 365): Promise<CryptoRankPriceResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/price/${symbol}/history?days=${days}&key=${this.apiKey}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TokenAnalytics/1.0'
        }
      });

      if (!response.ok) {
        console.error(`CryptoRank API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch price history from CryptoRank:', error);
      return null;
    }
  }

  async getVestingSchedule(symbol: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/vesting/${symbol}?key=${this.apiKey}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TokenAnalytics/1.0'
        }
      });

      if (!response.ok) {
        console.error(`CryptoRank API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch vesting schedule from CryptoRank:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return this.apiKey !== 'demo_key';
  }
}

export const cryptoRankService = new CryptoRankService();
