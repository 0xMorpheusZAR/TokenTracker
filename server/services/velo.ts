import { Buffer } from 'buffer';

interface VeloConfig {
  apiKey: string;
  baseUrl: string;
}

interface VeloMarketData {
  time: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price?: number;
  coin_volume?: number;
  dollar_volume?: number;
  funding_rate?: number;
  buy_trades?: number;
  sell_trades?: number;
  total_trades?: number;
}

interface VeloCapData {
  coin: string;
  time: number;
  market_cap: number;
}

interface VeloNewsItem {
  id: number;
  time: number;
  headline: string;
  source: string;
  priority: string;
  coins: string[];
  summary: string;
  link: string;
}

interface VeloProduct {
  exchange: string;
  symbol: string;
  product: string;
  type: string;
}

class VeloService {
  private config: VeloConfig;
  private livePriceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private cacheExpiry = 60 * 1000; // 60 seconds cache

  constructor() {
    this.config = {
      apiKey: process.env.VELO_API_KEY || '',
      baseUrl: 'https://api.velo.xyz/api/v1'
    };

    if (!this.config.apiKey) {
      console.warn('Velo API key not found. Some features may be limited.');
    }

    // Start background refresh every 2 minutes for all news coins
    setInterval(() => {
      this.refreshNewsCoinsInBackground();
    }, 2 * 60 * 1000); // 2 minutes

    console.log('Velo service initialized with live pricing cache and background refresh');
  }

  private getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(`api:${this.config.apiKey}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Velo API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();
    
    // Check if response is CSV by content type or by examining the data
    if (contentType?.includes('text/csv') || 
        contentType?.includes('text/plain') ||
        endpoint === '/rows' ||  // rows endpoint returns CSV
        (responseText.includes(',') && responseText.includes('\n') && !responseText.startsWith('{'))) {
      return responseText as T;
    }
    
    // Parse as JSON
    try {
      return JSON.parse(responseText) as T;
    } catch (error) {
      console.error('Failed to parse response as JSON:', responseText.substring(0, 100));
      throw new Error(`Invalid JSON response from Velo API: ${error}`);
    }
  }

  // Helper endpoints
  async getStatus(): Promise<any> {
    try {
      const result = await this.makeRequest<string>('/status');
      // If the response is just "ok", return a structured response
      if (result === 'ok') {
        return { status: 'ok', connected: true };
      }
      return result;
    } catch (error) {
      console.error('Failed to fetch Velo status:', error);
      throw error;
    }
  }

  async getFuturesContracts(): Promise<VeloProduct[]> {
    try {
      return await this.makeRequest('/futures');
    } catch (error) {
      console.error('Failed to fetch futures contracts:', error);
      throw error;
    }
  }

  async getOptionsContracts(): Promise<VeloProduct[]> {
    try {
      return await this.makeRequest('/options');
    } catch (error) {
      console.error('Failed to fetch options contracts:', error);
      throw error;
    }
  }

  async getSpotPairs(): Promise<VeloProduct[]> {
    try {
      return await this.makeRequest('/spot');
    } catch (error) {
      console.error('Failed to fetch spot pairs:', error);
      throw error;
    }
  }

  // Core data endpoint
  async getMarketData(params: {
    type: 'futures' | 'options' | 'spot';
    exchanges?: string[];
    products?: string[];
    coins?: string[];
    columns?: string[];
    begin?: number;
    end?: number;
    resolution?: string;
  }): Promise<string> {
    try {
      const queryParams: Record<string, any> = {
        type: params.type
      };

      if (params.exchanges?.length) {
        queryParams.exchanges = params.exchanges.join(',');
      }
      if (params.products?.length) {
        queryParams.products = params.products.join(',');
      }
      if (params.coins?.length) {
        queryParams.coins = params.coins.join(',');
      }
      if (params.columns?.length) {
        queryParams.columns = params.columns.join(',');
      }
      if (params.begin) {
        queryParams.begin = params.begin;
      }
      if (params.end) {
        queryParams.end = params.end;
      }
      if (params.resolution) {
        queryParams.resolution = params.resolution;
      }

      return await this.makeRequest('/rows', queryParams);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      throw error;
    }
  }

  // Parse CSV data helper
  parseMarketDataCSV(csvData: string): VeloMarketData[] {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: VeloMarketData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'time') {
          row[header] = parseInt(value);
        } else if (value && value !== '') {
          row[header] = parseFloat(value) || value;
        }
      });

      data.push(row as VeloMarketData);
    }

    return data;
  }

  // Options data
  async getOptionsData(params: {
    coin?: string;
    columns?: string[];
    begin?: number;
    end?: number;
  }): Promise<any[]> {
    try {
      const queryParams: any = {
        type: 'options'
      };
      
      if (params.coin) {
        queryParams.coins = params.coin;
      }
      if (params.columns?.length) {
        queryParams.columns = params.columns.join(',');
      }
      if (params.begin) {
        queryParams.begin = params.begin;
      }
      if (params.end) {
        queryParams.end = params.end;
      }

      const csvData = await this.makeRequest<string>('/rows', queryParams);
      return this.parseMarketDataCSV(csvData);
    } catch (error) {
      console.error('Failed to fetch options data:', error);
      throw error;
    }
  }

  // Options term structure
  async getOptionsTermStructure(coins: string[]): Promise<string> {
    try {
      return await this.makeRequest('/terms', {
        coins: coins.join(',')
      });
    } catch (error) {
      console.error('Failed to fetch options term structure:', error);
      throw error;
    }
  }

  // Market caps
  async getMarketCaps(coins: string[]): Promise<string> {
    try {
      return await this.makeRequest('/caps', {
        coins: coins.join(',')
      });
    } catch (error) {
      console.error('Failed to fetch market caps:', error);
      throw error;
    }
  }

  // Parse market caps CSV
  parseMarketCapsCSV(csvData: string): VeloCapData[] {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: VeloCapData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'time') {
          row[header] = parseInt(value);
        } else if (header === 'market_cap') {
          row[header] = parseFloat(value);
        } else {
          row[header] = value;
        }
      });

      data.push(row as VeloCapData);
    }

    return data;
  }

  // Parse products CSV (for spot, futures, options lists)
  parseProductsCSV(csvData: string): any[] {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'begin' && value) {
          row[header] = parseInt(value);
        } else {
          row[header] = value;
        }
      });

      data.push(row);
    }

    return data;
  }

  // News endpoint - uses different base URL
  async getNews(beginTimestamp?: number): Promise<VeloNewsItem[]> {
    try {
      const newsBaseUrl = 'https://api.velo.xyz/api/n';
      const url = new URL(`${newsBaseUrl}/news`);
      
      if (beginTimestamp !== undefined) {
        url.searchParams.append('begin', beginTimestamp.toString());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`News API error: ${response.status} ${response.statusText} - ${errorText}`);
        return [];
      }

      const data = await response.json();
      const newsCount = Array.isArray(data) ? data.length : (data.stories?.length || 0);
      const timeframeInfo = beginTimestamp ? `from timestamp ${beginTimestamp} (${new Date(beginTimestamp).toISOString()})` : 'all available';
      console.log(`Successfully fetched ${newsCount} news items from Velo (${timeframeInfo})`);
      return Array.isArray(data) ? data : (data.stories || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      return [];
    }
  }

  // Convenience methods for common use cases
  async getBTCSpotPrice24h(): Promise<VeloMarketData[]> {
    try {
      const end = Date.now();
      const begin = end - (24 * 60 * 60 * 1000); // 24 hours ago

      const csvData = await this.getMarketData({
        type: 'spot',
        exchanges: ['coinbase'],
        products: ['BTC-USD'],
        columns: ['close_price', 'dollar_volume'],
        begin,
        end,
        resolution: '1h'
      });

      return this.parseMarketDataCSV(csvData);
    } catch (error) {
      console.error('Failed to fetch BTC 24h data:', error);
      throw error;
    }
  }

  async getETHSpotPrice24h(): Promise<VeloMarketData[]> {
    try {
      const end = Date.now();
      const begin = end - (24 * 60 * 60 * 1000); // 24 hours ago

      const csvData = await this.getMarketData({
        type: 'spot',
        exchanges: ['coinbase'],
        products: ['ETH-USD'],
        columns: ['close_price', 'dollar_volume'],
        begin,
        end,
        resolution: '1h'
      });

      return this.parseMarketDataCSV(csvData);
    } catch (error) {
      console.error('Failed to fetch ETH 24h data:', error);
      throw error;
    }
  }

  async getTopCoinsMarketCaps(): Promise<VeloCapData[]> {
    try {
      const csvData = await this.getMarketCaps(['BTC', 'ETH', 'SOL', 'ADA', 'LINK', 'AVAX', 'DOT', 'UNI', 'AAVE', 'MATIC']);
      return this.parseMarketCapsCSV(csvData);
    } catch (error) {
      console.error('Failed to fetch top coins market caps:', error);
      throw error;
    }
  }

  async getCryptoNews(hours?: number): Promise<VeloNewsItem[]> {
    try {
      if (hours !== undefined && hours > 0) {
        const beginTimestamp = Date.now() - (hours * 60 * 60 * 1000);
        console.log(`Fetching news from last ${hours} hours`);
        return await this.getNews(beginTimestamp);
      } else {
        // Try fetching without any begin timestamp first for all historical data
        console.log('Fetching ALL historical news (no timestamp filter)');
        const allNews = await this.getNews();
        
        // If we get limited results, try with a very early timestamp
        if (allNews.length < 10) {
          console.log('Trying with early timestamp (Jan 1, 2024) for more historical data');
          const earlyTimestamp = new Date('2024-01-01').getTime();
          const historicalNews = await this.getNews(earlyTimestamp);
          return historicalNews.length > allNews.length ? historicalNews : allNews;
        }
        
        return allNews;
      }
    } catch (error) {
      console.error('Failed to fetch crypto news:', error);
      throw error;
    }
  }

  // Check if cached price is still valid
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheExpiry;
  }

  // Get cached price if valid
  private getCachedPrice(coin: string): number | null {
    const cached = this.livePriceCache.get(coin);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.price;
    }
    return null;
  }

  // Cache live price
  private cachePrice(coin: string, price: number): void {
    this.livePriceCache.set(coin, {
      price: price,
      timestamp: Date.now()
    });
  }

  // Live spot prices for specific coins (optimized with caching)
  async getLiveSpotPrices(coins: string[]): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    const coinsToFetch: string[] = [];
    
    // Check cache first
    for (const coin of coins) {
      const cachedPrice = this.getCachedPrice(coin);
      if (cachedPrice !== null) {
        results[coin] = cachedPrice;
      } else {
        coinsToFetch.push(coin);
      }
    }
    
    if (coinsToFetch.length === 0) {
      console.log(`All ${coins.length} prices served from cache`);
      return results;
    }
    
    console.log(`Fetching fresh prices for ${coinsToFetch.length} coins: ${coinsToFetch.join(', ')}`);
    
    // Batch fetch prices for coins not in cache
    for (const coin of coinsToFetch) {
      try {
        const end = Date.now();
        const begin = end - (60 * 60 * 1000); // Last 60 minutes for fresh data
        
        const csvData = await this.getMarketData({
          type: 'spot',
          exchanges: ['binance'],
          products: [`${coin}USDT`],
          columns: ['close_price'],
          begin,
          end,
          resolution: '1m' // 1-minute resolution for most recent data
        });
        
        const priceData = this.parseMarketDataCSV(csvData);
        
        if (priceData.length > 0) {
          const latestPrice = priceData[priceData.length - 1];
          
          if (latestPrice.close_price && latestPrice.close_price > 0) {
            results[coin] = latestPrice.close_price;
            this.cachePrice(coin, latestPrice.close_price);
            console.log(`Fresh price for ${coin}: $${latestPrice.close_price}`);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch live price for ${coin}:`, error.message);
      }
    }

    console.log(`Final result: ${Object.keys(results).length} prices (${coins.length - coinsToFetch.length} cached, ${Object.keys(results).length - (coins.length - coinsToFetch.length)} fresh)`);
    return results;
  }

  // Get all coins mentioned in recent news automatically
  async getCoinsFromRecentNews(): Promise<string[]> {
    try {
      const news = await this.getCryptoNews(24);
      const allCoins = new Set<string>();
      
      news.forEach(item => {
        item.coins.forEach(coin => allCoins.add(coin));
      });
      
      return Array.from(allCoins);
    } catch (error) {
      console.error('Failed to extract coins from news:', error);
      return [];
    }
  }

  // Background refresh of all news-related coin prices
  async refreshNewsCoinsInBackground(): Promise<void> {
    try {
      const newsCoins = await this.getCoinsFromRecentNews();
      if (newsCoins.length > 0) {
        console.log(`Background refresh: updating prices for ${newsCoins.length} news coins`);
        await this.getLiveSpotPrices(newsCoins);
      }
    } catch (error) {
      console.error('Background coin price refresh failed:', error);
    }
  }

  // Get futures market data for specific coin
  async getFuturesMarketData(coin: string, timeframe: string = '1h'): Promise<VeloMarketDataPoint[]> {
    try {
      const end = Date.now();
      const begin = end - (24 * 60 * 60 * 1000); // Last 24 hours
      
      const csvData = await this.getMarketData({
        type: 'spot',
        exchanges: ['binance'],
        products: [`${coin}USDT`],
        columns: ['time', 'open_price', 'high_price', 'low_price', 'close_price', 'coin_volume', 'dollar_volume'],
        begin,
        end,
        resolution: timeframe
      });

      return this.parseMarketDataCSV(csvData);
    } catch (error) {
      console.error(`Failed to fetch futures data for ${coin}:`, error);
      throw error;
    }
  }

  // Get comprehensive market stats for a coin with demo data
  async getMarketStats(coin: string): Promise<{
    openInterest: string;
    volume24h: string;
    fundingRate: string;
    marketCap: string;
    fdv: string;
  }> {
    try {
      // Get current live price for accurate calculations
      const livePrice = await this.getLiveSpotPrices([coin]);
      const currentPrice = livePrice[coin] || 0;

      // Demo market stats based on coin type
      const mockStats = {
        'BTC': {
          openInterest: '$31.67B',
          volume24h: '$55.73B', 
          fundingRate: '10.99%',
          marketCap: currentPrice > 0 ? `$${(currentPrice * 19700000 / 1000000000).toFixed(2)}B` : '$2368.64B',
          fdv: currentPrice > 0 ? `$${(currentPrice * 21000000 / 1000000000).toFixed(2)}B` : '$2368.64B'
        },
        'ETH': {
          openInterest: '$15.2B',
          volume24h: '$28.4B',
          fundingRate: '8.45%', 
          marketCap: currentPrice > 0 ? `$${(currentPrice * 120000000 / 1000000000).toFixed(2)}B` : '$420.5B',
          fdv: currentPrice > 0 ? `$${(currentPrice * 120000000 / 1000000000).toFixed(2)}B` : '$420.5B'
        },
        'ENA': {
          openInterest: '$245M',
          volume24h: '$128M',
          fundingRate: '12.3%',
          marketCap: currentPrice > 0 ? `$${(currentPrice * 15000000000 / 1000000000).toFixed(2)}B` : '$7.6B',
          fdv: currentPrice > 0 ? `$${(currentPrice * 15000000000 / 1000000000).toFixed(2)}B` : '$7.6B'
        }
      };

      return mockStats[coin as keyof typeof mockStats] || {
        openInterest: '$125M',
        volume24h: '$45M',
        fundingRate: '9.8%',
        marketCap: currentPrice > 0 ? `$${(currentPrice * 1000000000 / 1000000000).toFixed(2)}B` : '$1.2B',
        fdv: currentPrice > 0 ? `$${(currentPrice * 1500000000 / 1000000000).toFixed(2)}B` : '$1.8B'
      };
    } catch (error) {
      console.error(`Failed to fetch market stats for ${coin}:`, error);
      return {
        openInterest: 'N/A',
        volume24h: 'N/A', 
        fundingRate: 'N/A',
        marketCap: 'N/A',
        fdv: 'N/A'
      };
    }
  }

  // Multi-asset price data for dashboard charts
  async getMultiAssetPriceData(assets: string[], timeframe: '1h' | '4h' | '1d' = '1h'): Promise<Record<string, VeloMarketData[]>> {
    const results: Record<string, VeloMarketData[]> = {};
    
    const end = Date.now();
    let begin: number;
    let resolution: string;

    switch (timeframe) {
      case '1h':
        begin = end - (24 * 60 * 60 * 1000); // 24 hours
        resolution = '1h';
        break;
      case '4h':
        begin = end - (7 * 24 * 60 * 60 * 1000); // 7 days
        resolution = '4h';
        break;
      case '1d':
        begin = end - (30 * 24 * 60 * 60 * 1000); // 30 days
        resolution = '1d';
        break;
    }

    for (const asset of assets) {
      try {
        const csvData = await this.getMarketData({
          type: 'spot',
          exchanges: ['coinbase', 'binance'],
          coins: [asset],
          columns: ['close_price', 'dollar_volume', 'high_price', 'low_price'],
          begin,
          end,
          resolution
        });

        results[asset] = this.parseMarketDataCSV(csvData);
      } catch (error) {
        console.error(`Failed to fetch data for ${asset}:`, error);
        results[asset] = [];
      }
    }

    return results;
  }
}

export const veloService = new VeloService();
export type { VeloMarketData, VeloCapData, VeloNewsItem, VeloProduct };