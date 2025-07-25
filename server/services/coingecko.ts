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
    this.apiKey = process.env.COINGECKO_PRO_API_KEY || '';
    this.isProUser = !!this.apiKey;
    console.log(`CoinGecko initialized: ${this.isProUser ? 'Pro' : 'Free'} tier`);
    if (this.isProUser) {
      console.log('Using CoinGecko Pro API for enhanced data accuracy');
    }
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

  // Map token symbols to CoinGecko IDs - Updated June 27, 2025
  private getTokenId(symbol: string): string {
    const tokenMap: Record<string, string> = {
      // Top 10 coins
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'ADA': 'cardano',
      'LINK': 'chainlink',
      'AVAX': 'avalanche-2',
      'DOT': 'polkadot',
      'UNI': 'uniswap',
      'AAVE': 'aave',
      'MATIC': 'matic-network',
      // Other tokens
      'PORTAL': 'portal',
      'STRK': 'starknet', 
      'AEVO': 'aevo',
      'PIXEL': 'pixels',  // Note: CoinGecko uses 'pixels' not 'pixel'
      'SAGA': 'saga',
      'REZ': 'renzo',
      'MANTA': 'manta-network',
      'ALT': 'altlayer',
      'ENA': 'ethena',
      'OMNI': 'omni-network',
      'HYPE': 'hyperliquid',
      'W': 'wormhole',
      'ESX': 'estatex',
      'PUMP': 'pump-fun'  // Pump.fun token
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

  async getDetailedTokenData(symbols: string[]): Promise<any> {
    try {
      const coinIds = symbols.map(symbol => this.getTokenId(symbol)).join(',');
      const url = `${this.getApiUrl()}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d,30d,1y&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
      
      console.log(`Fetching detailed data from: ${url}`);
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error(`CoinGecko detailed data error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log(`Fetched detailed data for ${data.length} tokens`);
      return data;
    } catch (error) {
      console.error('Error fetching detailed token data:', error);
      return null;
    }
  }

  async getHyperliquidData(): Promise<any> {
    try {
      const url = `${this.getApiUrl()}/coins/hyperliquid`;
      console.log(`Fetching Hyperliquid data from: ${url}`);
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error(`Hyperliquid data error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log('Fetched Hyperliquid real-time data');
      return data;
    } catch (error) {
      console.error('Error fetching Hyperliquid data:', error);
      return null;
    }
  }

  // Get ticker data including exchanges for a specific coin
  async getCoinTickers(coinId: string) {
    try {
      const response = await fetch(
        `${this.getApiUrl()}/coins/${coinId}/tickers?include_exchange_logo=false&depth=false`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CoinGecko tickers error:', errorText);
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      return data.tickers || [];
    } catch (error) {
      console.error('Error fetching coin tickers:', error);
      throw error;
    }
  }

  async getTokenOHLCV(symbol: string, days: number = 30): Promise<any> {
    try {
      const coinId = this.getTokenId(symbol);
      const url = `${this.getApiUrl()}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error(`CoinGecko OHLCV error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching OHLCV data:', error);
      return null;
    }
  }

  async getTop100Altcoins(): Promise<any> {
    try {
      const apiUrl = this.getApiUrl();
      const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: '100',
        page: '1',
        price_change_percentage: '1h,24h,7d,30d',
        sparkline: 'false'
      });

      const url = `${apiUrl}/coins/markets?${params}`;
      console.log('Fetching top 100 altcoins from:', url);

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CoinGecko API error: ${response.status} - ${errorText}`);
        return null;
      }

      const data = await response.json();
      console.log(`Fetched top 100 altcoins`);
      return data.slice(0, 100);
    } catch (error) {
      console.error('Failed to fetch top 100 altcoins:', error);
      return null;
    }
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

  // Get trending coins for news feed
  async getTrending(): Promise<any> {
    try {
      const response = await fetch(
        `${this.getApiUrl()}/search/trending`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch trending coins:', error);
      throw error;
    }
  }

  // Get global market data for insights
  async getGlobalData(): Promise<any> {
    try {
      const response = await fetch(
        `${this.getApiUrl()}/global`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch global market data:', error);
      throw error;
    }
  }

  // Get historical global market cap data
  async getHistoricalGlobalMarketCap(days: number = 365): Promise<[number, number][]> {
    try {
      const params = new URLSearchParams({
        vs_currency: 'usd',
        days: days.toString()
      });
      
      const response = await fetch(
        `${this.getApiUrl()}/global/market_cap_chart?${params}`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.market_cap_chart?.market_cap || [];
    } catch (error) {
      console.error('Failed to fetch historical global market cap:', error);
      throw error;
    }
  }

  // Get historical market cap data for a specific coin
  async getHistoricalMarketCap(coinId: string, days: number = 365): Promise<[number, number][]> {
    try {
      const params = new URLSearchParams({
        vs_currency: 'usd',
        days: days.toString(),
        interval: 'daily'
      });
      
      const response = await fetch(
        `${this.getApiUrl()}/coins/${coinId}/market_chart?${params}`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.market_caps || [];
    } catch (error) {
      console.error(`Failed to fetch historical market cap for ${coinId}:`, error);
      throw error;
    }
  }
}

export const coinGeckoService = new CoinGeckoService();