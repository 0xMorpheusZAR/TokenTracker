# Velo Data API - Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL and Headers](#base-url-and-headers)
4. [Core API Endpoints](#core-api-endpoints)
   - [Market Data Endpoint](#1-market-data-endpoint-rows)
   - [Market Caps Endpoint](#2-market-caps-endpoint-caps)
   - [Futures Products](#3-futures-products-futures)
   - [Options Products](#4-options-products-options)
   - [Spot Products](#5-spot-products-spot)
   - [Status Endpoint](#6-status-endpoint-status)
   - [News Feed](#7-news-feed-news)
5. [Data Types and Structures](#data-types-and-structures)
6. [Request Parameters](#request-parameters)
7. [Response Formats](#response-formats)
8. [Advanced Features](#advanced-features)
9. [Rate Limits and Best Practices](#rate-limits-and-best-practices)
10. [Error Handling](#error-handling)
11. [WebSocket Streaming](#websocket-streaming)
12. [Code Examples](#code-examples)

---

## Overview

Velo Data API provides institutional-grade cryptocurrency market data with high-resolution historical and real-time data across multiple exchanges. The API offers:

- **Cross-exchange Data**: Unified data from 30+ exchanges
- **High Resolution**: 1-minute resolution data going back to 2017
- **Multiple Asset Classes**: Spot, futures, options, and perpetual swaps
- **Low Latency**: Sub-100ms response times
- **Professional Features**: Advanced metrics including funding rates, open interest, volume analysis

### Key Features:
- Historical and real-time market data
- Cross-exchange price aggregation
- Options chain data with Greeks
- Futures contract specifications and pricing
- Market capitalization tracking
- Crypto news aggregation
- WebSocket streaming for real-time updates

---

## Authentication

Velo API uses Basic Authentication with an API key.

### Authentication Headers:
```typescript
const headers = {
  'Authorization': `Basic ${Buffer.from(`api:${VELO_API_KEY}`).toString('base64')}`,
  'Content-Type': 'application/json'
};
```

### Environment Setup:
```bash
# .env file
VELO_API_KEY=your_velo_api_key_here
```

---

## Base URL and Headers

### Base URL:
```
Production: https://api.velo.xyz/api/v1
```

### Required Headers:
```json
{
  "Authorization": "Basic base64(api:YOUR_API_KEY)",
  "Content-Type": "application/json"
}
```

---

## Core API Endpoints

### 1. Market Data Endpoint (`/rows`)

The primary endpoint for fetching historical and real-time market data.

**URL:** `GET /rows`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Data type: `spot`, `futures`, `options` |
| `exchanges` | string[] | No | Exchange filter (e.g., `["binance", "coinbase"]`) |
| `products` | string[] | No | Product filter (e.g., `["BTC-USD", "ETH-USD"]`) |
| `coins` | string[] | No | Coin filter (e.g., `["BTC", "ETH"]`) |
| `columns` | string[] | No | Data columns to return |
| `begin` | number | No | Start timestamp (milliseconds) |
| `end` | number | No | End timestamp (milliseconds) |
| `resolution` | string | No | Time resolution: `1m`, `5m`, `15m`, `1h`, `1d` |

**Available Columns by Type:**

**Spot Columns:**
- `time` - Unix timestamp
- `open_price` - Opening price
- `high_price` - High price
- `low_price` - Low price
- `close_price` - Closing price
- `coin_volume` - Volume in base currency
- `dollar_volume` - Volume in USD
- `buy_trades` - Number of buy trades
- `sell_trades` - Number of sell trades
- `total_trades` - Total number of trades

**Futures Columns:**
- All spot columns plus:
- `funding_rate` - Funding rate (for perpetuals)
- `open_interest` - Open interest in contracts
- `open_interest_value` - Open interest in USD
- `liquidations_long` - Long liquidations
- `liquidations_short` - Short liquidations

**Options Columns:**
- `time` - Unix timestamp
- `strike` - Strike price
- `expiry` - Expiration timestamp
- `type` - Option type (call/put)
- `mark_price` - Mark price
- `bid_price` - Best bid price
- `ask_price` - Best ask price
- `volume` - Trading volume
- `open_interest` - Open interest
- `implied_volatility` - Implied volatility
- `delta` - Option delta
- `gamma` - Option gamma
- `theta` - Option theta
- `vega` - Option vega

**Example Request:**
```bash
GET /rows?type=spot&exchanges=binance,coinbase&products=BTC-USD&columns=time,close_price,dollar_volume&begin=1704067200000&end=1704153600000&resolution=1h
```

**Response Format:** CSV
```csv
time,close_price,dollar_volume
1704067200000,42350.5,1234567890
1704070800000,42450.3,987654321
```

---

### 2. Market Caps Endpoint (`/caps`)

Fetch cryptocurrency market capitalizations.

**URL:** `GET /caps`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `coins` | string | Yes | Comma-separated coin symbols (e.g., `BTC,ETH,SOL`) |

**Example Request:**
```bash
GET /caps?coins=BTC,ETH,SOL,ADA,DOT
```

**Response Format:** CSV
```csv
time,coin,market_cap
1704153600000,BTC,850000000000
1704153600000,ETH,280000000000
1704153600000,SOL,35000000000
```

---

### 3. Futures Products (`/futures`)

List all available futures contracts.

**URL:** `GET /futures`

**Response Format:** JSON
```json
[
  {
    "exchange": "binance",
    "coin": "BTC",
    "product": "BTCUSDT",
    "type": "perpetual",
    "contract_size": 1,
    "quote_currency": "USDT",
    "settlement_currency": "USDT",
    "tick_size": 0.1,
    "expiry": null
  },
  {
    "exchange": "cme",
    "coin": "BTC",
    "product": "BTC-MAR24",
    "type": "future",
    "contract_size": 5,
    "quote_currency": "USD",
    "settlement_currency": "USD",
    "tick_size": 5,
    "expiry": 1711123200000
  }
]
```

---

### 4. Options Products (`/options`)

List all available options contracts.

**URL:** `GET /options`

**Response Format:** JSON
```json
[
  {
    "exchange": "deribit",
    "coin": "BTC",
    "product": "BTC-29MAR24-50000-C",
    "type": "call",
    "strike": 50000,
    "expiry": 1711699200000,
    "contract_size": 1,
    "settlement_currency": "BTC"
  },
  {
    "exchange": "okex",
    "coin": "ETH",
    "product": "ETH-USD-240329-3000-P",
    "type": "put",
    "strike": 3000,
    "expiry": 1711699200000,
    "contract_size": 1,
    "settlement_currency": "ETH"
  }
]
```

---

### 5. Spot Products (`/spot`)

List all available spot trading pairs.

**URL:** `GET /spot`

**Response Format:** JSON
```json
[
  {
    "exchange": "binance",
    "coin": "BTC",
    "product": "BTCUSDT",
    "base_currency": "BTC",
    "quote_currency": "USDT",
    "tick_size": 0.01,
    "min_size": 0.00001
  },
  {
    "exchange": "coinbase",
    "coin": "ETH",
    "product": "ETH-USD",
    "base_currency": "ETH",
    "quote_currency": "USD",
    "tick_size": 0.01,
    "min_size": 0.001
  }
]
```

---

### 6. Status Endpoint (`/status`)

Check API connection and authentication status.

**URL:** `GET /status`

**Response Format:** JSON
```json
{
  "status": "ok",
  "authenticated": true,
  "tier": "professional",
  "rate_limit": {
    "limit": 10000,
    "remaining": 9876,
    "reset": 1704157200000
  },
  "server_time": 1704153600000
}
```

---

### 7. News Feed (`/news`)

Fetch cryptocurrency news and market updates.

**URL:** `GET /news`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `begin` | number | No | Start timestamp for news (milliseconds) |
| `limit` | number | No | Maximum number of news items (default: 100) |

**Response Format:** JSON
```json
[
  {
    "id": 123456,
    "time": 1704153600000,
    "effectiveTime": 1704153600000,
    "headline": "Bitcoin ETF Approval Expected This Week",
    "source": "Bloomberg",
    "priority": 1,
    "coins": ["BTC"],
    "sentiment": "bullish",
    "impact": 5,
    "summary": "The SEC is expected to approve multiple Bitcoin ETF applications...",
    "link": "https://bloomberg.com/news/..."
  }
]
```

**Priority Levels:**
- `1`: High priority (breaking news)
- `2`: Normal priority
- `3`: Low priority

**Impact Scale:** 1-5 (1 = low impact, 5 = high impact)

---

## Data Types and Structures

### Market Data Row
```typescript
interface VeloMarketData {
  time: number;              // Unix timestamp in milliseconds
  open_price?: number;       // Opening price
  high_price?: number;       // High price
  low_price?: number;        // Low price
  close_price?: number;      // Closing price
  coin_volume?: number;      // Volume in base currency
  dollar_volume?: number;    // Volume in USD
  funding_rate?: number;     // Funding rate (perpetuals only)
  open_interest?: number;    // Open interest
  buy_trades?: number;       // Number of buy trades
  sell_trades?: number;      // Number of sell trades
  total_trades?: number;     // Total trades
  [key: string]: any;        // Additional dynamic columns
}
```

### Market Cap Data
```typescript
interface VeloCapData {
  time: number;          // Unix timestamp
  coin: string;          // Coin symbol (e.g., "BTC")
  market_cap: number;    // Market cap in USD
}
```

### Product Specification
```typescript
interface VeloProduct {
  exchange: string;           // Exchange name
  coin: string;              // Base coin symbol
  product: string;           // Product identifier
  base_currency: string;     // Base currency
  quote_currency: string;    // Quote currency
  type?: string;             // Product type (spot/future/option)
  contract_size?: number;    // Contract size
  tick_size: number;         // Minimum price increment
  min_size?: number;         // Minimum order size
  expiry?: number | null;    // Expiration timestamp (futures/options)
  strike?: number;           // Strike price (options only)
}
```

### News Item
```typescript
interface VeloNewsItem {
  id: number;                // Unique news ID
  time: number;              // Publication timestamp
  effectiveTime: number;     // When news becomes effective
  headline: string;          // News headline
  source: string;            // News source
  priority: number;          // Priority level (1-3)
  coins: string[];           // Related coins
  sentiment?: string;        // Market sentiment
  impact?: number;           // Impact scale (1-5)
  summary: string;           // Full news summary
  link: string | null;       // External link
}
```

---

## Request Parameters

### Time Parameters
- **Timestamps**: All timestamps are Unix timestamps in milliseconds
- **Time Ranges**: Maximum of 30 days per request for minute resolution
- **Default Range**: Last 24 hours if not specified

### Resolution Options
- `1m` - 1 minute
- `5m` - 5 minutes
- `15m` - 15 minutes
- `30m` - 30 minutes
- `1h` - 1 hour
- `4h` - 4 hours
- `1d` - 1 day
- `1w` - 1 week

### Exchange Identifiers
Common exchanges supported:
- `binance` - Binance
- `coinbase` - Coinbase
- `kraken` - Kraken
- `okex` - OKX
- `bybit` - Bybit
- `bitfinex` - Bitfinex
- `huobi` - Huobi
- `kucoin` - KuCoin
- `deribit` - Deribit (options)
- `cme` - CME (futures)
- `ftx` - FTX (historical)

---

## Response Formats

### CSV Format (Market Data)
- First row contains column headers
- Subsequent rows contain data
- Values separated by commas
- Timestamps in milliseconds
- Numeric values without quotes

### JSON Format (Product Lists, Status, News)
- Standard JSON structure
- UTF-8 encoding
- Timestamps in milliseconds
- Null values explicitly stated

---

## Advanced Features

### 1. Multi-Exchange Aggregation
Fetch data from multiple exchanges in a single request:
```typescript
const params = {
  type: 'spot',
  exchanges: ['binance', 'coinbase', 'kraken'],
  products: ['BTC-USD', 'BTC-USDT'],
  columns: ['time', 'close_price', 'dollar_volume'],
  resolution: '1h'
};
```

### 2. Cross-Pair Analysis
Compare multiple trading pairs:
```typescript
const params = {
  type: 'futures',
  coins: ['BTC', 'ETH', 'SOL'],
  columns: ['time', 'close_price', 'funding_rate', 'open_interest'],
  resolution: '1h'
};
```

### 3. Options Chain Analysis
Fetch entire options chain for analysis:
```typescript
const params = {
  type: 'options',
  coins: ['BTC'],
  columns: ['strike', 'expiry', 'type', 'mark_price', 'implied_volatility', 'volume'],
  begin: Date.now() - 86400000, // Last 24 hours
  end: Date.now()
};
```

### 4. Funding Rate Tracking
Monitor perpetual funding rates across exchanges:
```typescript
const params = {
  type: 'futures',
  products: ['BTCUSDT', 'ETHUSDT'],
  columns: ['time', 'funding_rate', 'open_interest'],
  resolution: '1h'
};
```

---

## Rate Limits and Best Practices

### Rate Limits
- **Standard Tier**: 1,000 requests per hour
- **Professional Tier**: 10,000 requests per hour
- **Enterprise Tier**: Custom limits

### Best Practices

1. **Batch Requests**: Combine multiple symbols in single requests
```typescript
// Good - Single request for multiple coins
const caps = await getMarketCaps(['BTC', 'ETH', 'SOL', 'ADA', 'DOT']);

// Avoid - Multiple requests
const btc = await getMarketCaps(['BTC']);
const eth = await getMarketCaps(['ETH']);
```

2. **Use Appropriate Resolution**: Don't request minute data for monthly analysis
```typescript
// For long-term analysis, use daily resolution
const params = {
  resolution: '1d',
  begin: Date.now() - 365 * 24 * 60 * 60 * 1000 // 1 year
};
```

3. **Cache Responses**: Implement client-side caching for static data
```typescript
const cache = new Map();
const cacheKey = `${type}-${exchange}-${product}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

4. **Handle Errors Gracefully**: Implement exponential backoff
```typescript
async function fetchWithRetry(url: string, attempts = 3): Promise<any> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

---

## Error Handling

### Common Error Codes

| Status Code | Description | Solution |
|-------------|-------------|----------|
| 400 | Bad Request | Check parameter formatting |
| 401 | Unauthorized | Verify API key |
| 403 | Forbidden | Check API tier permissions |
| 404 | Not Found | Verify endpoint URL |
| 429 | Too Many Requests | Implement rate limiting |
| 500 | Internal Server Error | Retry with backoff |
| 503 | Service Unavailable | Service maintenance |

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid resolution parameter. Must be one of: 1m, 5m, 15m, 1h, 1d",
    "details": {
      "parameter": "resolution",
      "value": "2m"
    }
  }
}
```

---

## WebSocket Streaming

### Connection URL
```
wss://stream.velo.xyz/v1/stream
```

### Authentication
```json
{
  "type": "auth",
  "apiKey": "your_api_key"
}
```

### Subscribe to Streams
```json
{
  "type": "subscribe",
  "channels": [
    {
      "name": "trades",
      "symbols": ["BTC-USD", "ETH-USD"],
      "exchanges": ["coinbase", "binance"]
    },
    {
      "name": "orderbook",
      "symbols": ["BTC-USD"],
      "depth": 10
    }
  ]
}
```

### Message Types

**Trade Message:**
```json
{
  "type": "trade",
  "symbol": "BTC-USD",
  "exchange": "coinbase",
  "price": 42350.5,
  "amount": 0.5,
  "side": "buy",
  "timestamp": 1704153600123
}
```

**Order Book Update:**
```json
{
  "type": "orderbook",
  "symbol": "BTC-USD",
  "exchange": "coinbase",
  "bids": [[42350.0, 1.5], [42349.5, 2.0]],
  "asks": [[42351.0, 1.2], [42351.5, 1.8]],
  "timestamp": 1704153600123
}
```

---

## Code Examples

### Example 1: Fetch BTC Price History
```typescript
async function getBTCPriceHistory() {
  const params = {
    type: 'spot',
    exchanges: ['coinbase'],
    products: ['BTC-USD'],
    columns: ['time', 'close_price', 'dollar_volume'],
    begin: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days
    end: Date.now(),
    resolution: '1h'
  };
  
  const data = await veloService.getMarketData(params);
  return data;
}
```

### Example 2: Compare Funding Rates
```typescript
async function compareFundingRates() {
  const params = {
    type: 'futures',
    exchanges: ['binance', 'bybit', 'okex'],
    products: ['BTCUSDT', 'BTCUSD'],
    columns: ['time', 'funding_rate', 'open_interest'],
    resolution: '8h' // Funding typically every 8 hours
  };
  
  const data = await veloService.getMarketData(params);
  return data;
}
```

### Example 3: Options Volatility Surface
```typescript
async function getVolatilitySurface() {
  const params = {
    type: 'options',
    coins: ['BTC'],
    columns: ['strike', 'expiry', 'type', 'implied_volatility'],
    begin: Date.now(),
    end: Date.now()
  };
  
  const data = await veloService.getMarketData(params);
  
  // Group by expiry and strike
  const surface = data.reduce((acc, option) => {
    const key = `${option.expiry}-${option.strike}`;
    acc[key] = option.implied_volatility;
    return acc;
  }, {});
  
  return surface;
}
```

### Example 4: Market Cap Tracking
```typescript
async function trackMarketCaps() {
  const topCoins = ['BTC', 'ETH', 'SOL', 'ADA', 'AVAX', 'DOT', 'MATIC'];
  
  const data = await veloService.getMarketCaps(topCoins);
  
  // Calculate total market cap
  const totalCap = data.reduce((sum, coin) => sum + coin.market_cap, 0);
  
  // Calculate dominance
  const dominance = data.map(coin => ({
    ...coin,
    dominance: (coin.market_cap / totalCap) * 100
  }));
  
  return dominance;
}
```

### Example 5: News Sentiment Analysis
```typescript
async function analyzeSentiment() {
  const news = await veloService.getCryptoNews(24); // Last 24 hours
  
  const sentimentCounts = news.reduce((acc, item) => {
    acc[item.sentiment || 'neutral'] = (acc[item.sentiment || 'neutral'] || 0) + 1;
    return acc;
  }, {});
  
  const highImpactNews = news.filter(item => item.impact >= 4);
  
  return {
    sentimentCounts,
    highImpactNews,
    totalNews: news.length
  };
}
```

### Example 6: Cross-Exchange Arbitrage Detection
```typescript
async function detectArbitrage() {
  const params = {
    type: 'spot',
    exchanges: ['binance', 'coinbase', 'kraken', 'huobi'],
    products: ['BTC-USD', 'BTC-USDT'],
    columns: ['time', 'close_price', 'bid_price', 'ask_price'],
    resolution: '1m'
  };
  
  const data = await veloService.getMarketData(params);
  
  // Group by timestamp
  const opportunities = [];
  const grouped = groupBy(data, 'time');
  
  Object.entries(grouped).forEach(([time, prices]) => {
    const sorted = prices.sort((a, b) => a.ask_price - b.ask_price);
    const spread = (sorted[sorted.length - 1].bid_price - sorted[0].ask_price) / sorted[0].ask_price;
    
    if (spread > 0.001) { // 0.1% arbitrage opportunity
      opportunities.push({
        time,
        buyExchange: sorted[0].exchange,
        sellExchange: sorted[sorted.length - 1].exchange,
        spreadPercent: spread * 100
      });
    }
  });
  
  return opportunities;
}
```

---

## Additional Resources

### TypeScript SDK Example
```typescript
class VeloClient {
  private apiKey: string;
  private baseUrl = 'https://api.velo.xyz/api/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  private async request<T>(endpoint: string, params?: any): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getMarketData(params: MarketDataParams) {
    return this.request('/rows', params);
  }
  
  async getMarketCaps(coins: string[]) {
    return this.request('/caps', { coins: coins.join(',') });
  }
  
  // ... additional methods
}
```

### Python Integration Example
```python
import velodata.lib as velo
import pandas as pd

# Initialize client
client = velo.client('your_api_key')

# Fetch market data
params = {
    'type': 'spot',
    'exchanges': ['binance', 'coinbase'],
    'products': ['BTC-USD'],
    'columns': ['time', 'close_price', 'dollar_volume'],
    'begin': client.timestamp() - 86400000,  # 24 hours ago
    'end': client.timestamp(),
    'resolution': '1h'
}

# Get data as DataFrame
df = client.get_rows(params)

# Analyze
print(f"Average BTC price: ${df['close_price'].mean():,.2f}")
print(f"Total volume: ${df['dollar_volume'].sum():,.0f}")
```

---

## Support and Contact

- **Documentation**: https://docs.velo.xyz
- **API Status**: https://status.velo.xyz
- **Support Email**: support@velo.xyz
- **Discord**: https://discord.gg/velodata

---

## Changelog

- **v1.2.0** - Added options Greeks data
- **v1.1.0** - WebSocket streaming support
- **v1.0.0** - Initial API release

---

*Last Updated: January 2025*