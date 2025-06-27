interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap: number;
    usd_24h_vol: number;
  };
}

interface CoinGeckoHistoryResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CoinGeckoMarketDataResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  price_change_percentage_1y: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
}

export class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private proApiUrl = 'https://pro-api.coingecko.com/api/v3';
  private apiKey: string;
  private isProUser: boolean;

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY || process.env.COINGECKO_PRO_API_KEY || '';
    this.isProUser = !!process.env.COINGECKO_PRO_API_KEY;
  }

  private getApiUrl(): string {
    return this.isProUser ? this.proApiUrl : this.baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'TokenAnalytics/1.0'
    };

    if (this.isProUser && this.apiKey) {
      headers['x-cg-pro-api-key'] = this.apiKey;
    }

    return headers;
  }

  // Map token symbols to CoinGecko IDs
  private getTokenId(symbol: string): string {
    const tokenMap: Record<string, string> = {
      'PORTAL': 'portal',
      'STRK': 'starknet',
      'AEVO': 'aevo',
      'PIXEL': 'pixels',
      'SAGA': 'saga',
      'REZ': 'renzo',
      'MANTA': 'manta-network',
      'ALT': 'altlayer',
      'ENA': 'ethena',
      'W': 'wormhole'
    };
    
    return tokenMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  async getCurrentPrices(symbols: string[]): Promise<CoinGeckoPriceResponse | null> {
    try {
      const coinIds = symbols.map(symbol => this.getTokenId(symbol)).join(',');
      const url = `${this.getApiUrl()}/simple/price?ids=${coinIds}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true&include_24hr_vol=true`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch current prices from CoinGecko:', error);
      return null;
    }
  }

  async getTokenHistory(symbol: string, days: number = 365): Promise<CoinGeckoHistoryResponse | null> {
    try {
      const coinId = this.getTokenId(symbol);
      const url = `${this.getApiUrl()}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch token history from CoinGecko:', error);
      return null;
    }
  }

  async getMarketData(symbols: string[]): Promise<CoinGeckoMarketDataResponse[] | null> {
    try {
      const coinIds = symbols.map(symbol => this.getTokenId(symbol)).join(',');
      const url = `${this.getApiUrl()}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h,7d,30d,1y`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch market data from CoinGecko:', error);
      return null;
    }
  }

  async getTokenDetails(symbol: string): Promise<any> {
    try {
      const coinId = this.getTokenId(symbol);
      const url = `${this.getApiUrl()}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch token details from CoinGecko:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return this.isProUser ? !!this.apiKey : true; // Free tier doesn't require API key
  }

  getConnectionStatus(): { connected: boolean; tier: string; rateLimit: string } {
    if (this.isProUser) {
      return {
        connected: !!this.apiKey,
        tier: 'Pro',
        rateLimit: '500 calls/minute'
      };
    } else {
      return {
        connected: true,
        tier: 'Free',
        rateLimit: '10-50 calls/minute'
      };
    }
  }
}

export const coinGeckoService = new CoinGeckoService();