# Token Failure Analytics Dashboard - API Documentation

## Table of Contents
1. [CoinGecko Pro API](#coingecko-pro-api)
2. [Velo Data Pro API](#velo-data-pro-api)
3. [Dune Analytics API](#dune-analytics-api)
4. [DefiLlama Pro API](#defillama-pro-api)

---

## CoinGecko Pro API

### Overview
CoinGecko Pro provides comprehensive cryptocurrency data including real-time prices, market caps, volume, and historical data for over 10,000 cryptocurrencies.

### Base URL
```
https://pro-api.coingecko.com/api/v3
```

### Authentication
```javascript
headers: {
  'X-CG-PRO-API-KEY': process.env.COINGECKO_PRO_API_KEY
}
```

### Key Endpoints Used

#### 1. Market Data
```
GET /coins/markets
```
**Parameters:**
- `vs_currency`: Target currency (e.g., 'usd')
- `ids`: Comma-separated coin IDs
- `order`: Sort order (market_cap_desc, volume_desc, etc.)
- `per_page`: Results per page (max 250)
- `page`: Page number
- `sparkline`: Include 7-day sparkline data
- `price_change_percentage`: Time frames (1h,24h,7d,30d,1y)

**Response Fields:**
- `id`: Unique coin identifier
- `symbol`: Trading symbol
- `name`: Full name
- `current_price`: Current price in target currency
- `market_cap`: Market capitalization
- `total_volume`: 24h trading volume
- `price_change_percentage_24h`: 24h price change
- `circulating_supply`: Circulating supply
- `total_supply`: Total supply
- `ath`: All-time high price
- `atl`: All-time low price

#### 2. Coin Details
```
GET /coins/{id}
```
**Parameters:**
- `localization`: Include localized languages (false)
- `tickers`: Include exchange tickers (false)
- `market_data`: Include market data (true)
- `community_data`: Include community data (false)
- `developer_data`: Include developer data (false)
- `sparkline`: Include sparkline data (false)

#### 3. Historical Data
```
GET /coins/{id}/market_chart
```
**Parameters:**
- `vs_currency`: Target currency
- `days`: Number of days (1, 7, 30, 90, 365, max)
- `interval`: Data interval (minutely, hourly, daily)

### Rate Limits
- Pro Tier: 30 calls/minute
- Response includes rate limit headers

### Integration Example
```javascript
async getTokenDetails(tokenIds: string[]) {
  const response = await fetch(
    `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${tokenIds.join(',')}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d,30d,1y`,
    {
      headers: {
        'X-CG-PRO-API-KEY': this.apiKey
      }
    }
  );
  return response.json();
}
```

---

## Velo Data Pro API

### Overview
Velo Data provides cross-exchange cryptocurrency market data with high-resolution 1-minute intervals, including futures, options, spot markets, and real-time news.

### Base URL
```
https://api.velo.xyz/api/v1
```

### Authentication
```javascript
const credentials = Buffer.from(`api:${VELO_API_KEY}`).toString('base64');
headers: {
  'Authorization': `Basic ${credentials}`,
  'Content-Type': 'application/json'
}
```

### News API (Primary Feature)

#### Get Crypto News
```
GET https://api.velo.xyz/api/n/news
```
**Parameters:**
- `hours`: Time range in hours (default: 24, max: 240)

**Response Structure:**
```json
{
  "data": [
    {
      "id": 1337,
      "time": 1704085200000,
      "effectiveTime": 1704085200000,
      "headline": "Breaking crypto news headline",
      "source": "Bloomberg",
      "priority": 1,  // 1=High, 2=Normal, 3+=Low
      "coins": ["BTC", "ETH"],
      "summary": "Detailed news summary",
      "link": "https://source-url.com",
      "effectivePrice": 45000.50
    }
  ],
  "timeframe_hours": 24,
  "provider": "Velo Pro API"
}
```

**Optimal Implementation for News Dashboard:**
1. **Refresh Rate**: 10 seconds for fastest news scanning
2. **Effective Price**: Use `effectivePrice` field for price at news time
3. **Priority Filtering**: Filter by priority levels (1=High Priority)
4. **Coin Tracking**: Monitor `coins` array for new tickers
5. **Source Links**: Use `link` field for source attribution

### Market Data Endpoints

#### 1. Futures Market Data
```
GET /futures
```
**Parameters:**
- `coins`: Comma-separated coin symbols
- `exchanges`: Comma-separated exchange names
- `products`: Specific products (BTC-PERP, ETH-USD-240329)
- `start_time`: Unix timestamp (milliseconds)
- `end_time`: Unix timestamp (milliseconds)
- `time_bucket`: Aggregation period (1m, 5m, 15m, 1h, 1d)

#### 2. Spot Prices
```
GET /spot
```
**Parameters:**
- `coins`: Comma-separated symbols
- `exchanges`: Exchange names
- `time_bucket`: Aggregation period

**Response Fields:**
- `time`: Unix timestamp
- `open_price`: Opening price
- `high_price`: Highest price
- `low_price`: Lowest price
- `close_price`: Closing price
- `coin_volume`: Volume in coin units
- `dollar_volume`: Volume in USD

#### 3. Market Caps
```
GET /caps
```
**Parameters:**
- `coins`: Coin symbols
- `start_time`: Start timestamp
- `end_time`: End timestamp

### Best Practices for News Integration

1. **Error Handling**
```javascript
try {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Velo API error: ${response.status}`);
  }
  const data = await response.json();
  console.log(`Successfully fetched ${data.data.length} news items from Velo`);
  return data;
} catch (error) {
  console.error('Error fetching Velo news:', error);
  return { data: [], timeframe_hours: 24, provider: 'Velo Pro API' };
}
```

2. **News Caching Strategy**
- Cache news items by ID to detect new stories
- Track coin appearances for new ticker alerts
- Store effective prices for historical comparison

3. **Trading Integration**
- Route all coin links to BloFin futures: `https://blofin.com/futures/${coin}-USDT`
- Display both effective price and current spot price
- Calculate price movement since news publication

---

## Dune Analytics API

### Overview
Dune Analytics provides on-chain blockchain data through SQL queries, enabling complex analytics on Ethereum, Polygon, BSC, and other chains.

### Base URL
```
https://api.dune.com/api/v1
```

### Authentication
```javascript
headers: {
  'X-Dune-Api-Key': process.env.DUNE_API_KEY
}
```

### Key Endpoints

#### 1. Execute Query
```
POST /query/{query_id}/execute
```
**Parameters:**
- `query_parameters`: Object with query parameters

#### 2. Get Query Results
```
GET /query/{query_id}/results
```
**Parameters:**
- `limit`: Number of rows to return
- `offset`: Pagination offset

#### 3. Get Execution Status
```
GET /execution/{execution_id}/status
```

### Integration Queries Used

#### Pump.fun Analytics
- **24h Revenue** (Query #5445866): CSV format revenue data
- **24h Volume** (Query #5440990): Trading volume metrics
- **Market Share** (Query #5468582): Platform comparison data

#### Bonk.fun Analytics  
- **24h Revenue** (Query #5431407): Revenue in SOL and USD
- **24h Volume** (Query #5440994): Trading volume data

### Implementation Example
```javascript
async executeQuery(queryId: number, parameters?: Record<string, any>) {
  const response = await fetch(
    `${this.baseUrl}/query/${queryId}/execute`,
    {
      method: 'POST',
      headers: {
        'X-Dune-Api-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query_parameters: parameters || {} })
    }
  );
  
  const execution = await response.json();
  
  // Poll for results
  return this.getQueryResults(execution.execution_id);
}
```

### Rate Limits
- 100 requests per minute
- Query execution time limits based on plan

---

## DefiLlama Pro API

### Overview
DefiLlama provides comprehensive DeFi protocol data including TVL, volume, fees, revenue, and user metrics for over 1,100 protocols.

### Base URL
```
https://api.llama.fi
```

### Authentication
- Public endpoints (no authentication required)
- Pro features integrated through data enrichment

### Key Endpoints

#### 1. Protocol TVL
```
GET /protocols
```
**Response Fields:**
- `name`: Protocol name
- `tvl`: Current total value locked
- `chainTvls`: TVL breakdown by chain
- `change_1h`: Hourly TVL change
- `change_1d`: Daily TVL change
- `change_7d`: Weekly TVL change

#### 2. Protocol Fees & Revenue
```
GET /overview/fees/{protocol}
GET /overview/revenue/{protocol}
```
**Parameters:**
- `excludeTotalDataChart`: Exclude chart data (true/false)
- `excludeTotalDataChartBreakdown`: Exclude breakdown (true/false)
- `dataType`: daily or totalDataChart

**Response Structure:**
```json
{
  "totalDataChart": [
    [timestamp, value],
    [timestamp, value]
  ],
  "total24h": 1234567.89,
  "total7d": 8901234.56,
  "total30d": 34567890.12
}
```

#### 3. Historical Metrics
```
GET /summary/fees/{protocol}
GET /summary/revenue/{protocol}
```
**Query Parameters:**
- `dataType`: totalDataChart

### Optimal Integration Strategy

1. **Data Aggregation**
```javascript
async getProtocolMetrics(protocol: string) {
  const [tvl, fees, revenue] = await Promise.all([
    this.getTVL(protocol),
    this.getFees(protocol),
    this.getRevenue(protocol)
  ]);
  
  return {
    protocol,
    tvl: tvl.tvl,
    fees24h: fees.total24h,
    revenue24h: revenue.total24h,
    feeToRevenue: revenue.total24h / fees.total24h
  };
}
```

2. **Caching Strategy**
- Cache TVL data for 5 minutes
- Cache fee/revenue data for 1 hour
- Use stale-while-revalidate pattern

3. **Error Handling**
```javascript
const fetchWithRetry = async (url: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### Rate Limits
- No official rate limits for public endpoints
- Recommended: 10 requests per second max
- Use caching to minimize API calls

---

## Best Practices Across All APIs

### 1. Error Handling
```javascript
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public provider: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

const handleAPIError = (error: any, provider: string) => {
  console.error(`${provider} API Error:`, error);
  
  if (error.response) {
    throw new APIError(
      error.response.statusText,
      error.response.status,
      provider
    );
  }
  
  throw error;
};
```

### 2. Rate Limit Management
```javascript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  
  constructor(
    private maxRequests: number,
    private timeWindow: number
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.processing) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxRequests);
      await Promise.all(batch.map(fn => fn()));
      
      if (this.queue.length > 0) {
        await new Promise(resolve => 
          setTimeout(resolve, this.timeWindow)
        );
      }
    }
    
    this.processing = false;
  }
}
```

### 3. Caching Strategy
```javascript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set<T>(key: string, data: T, ttl: number = 300000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}
```

### 4. Unified Response Format
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  provider: string;
  cached: boolean;
}

const formatResponse = <T>(
  data: T,
  provider: string,
  cached = false
): APIResponse<T> => ({
  success: true,
  data,
  timestamp: Date.now(),
  provider,
  cached
});
```

---

## Environment Variables Required

```bash
# CoinGecko Pro
COINGECKO_PRO_API_KEY=your_coingecko_pro_key

# Velo Data Pro
VELO_API_KEY=your_velo_api_key

# Dune Analytics
DUNE_API_KEY=your_dune_api_key

# DefiLlama (Public API - No key required)
# No environment variable needed
```

## Security Best Practices

1. **Never expose API keys in client-side code**
2. **Use environment variables for all sensitive data**
3. **Implement request signing where supported**
4. **Use HTTPS for all API calls**
5. **Validate and sanitize all API responses**
6. **Implement proper CORS policies**
7. **Use API key rotation strategies**
8. **Monitor API usage and set up alerts**

---

Last Updated: January 2025