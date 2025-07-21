# Velo Data API Integration Guide

## Overview

This project integrates with Velo Data API to provide comprehensive cryptocurrency market data including futures, options, spot prices, market caps, and news. We've implemented both TypeScript (for our web application) and reference the official Python library for data science workflows.

## Table of Contents

1. [Velo API Features](#velo-api-features)
2. [TypeScript Implementation](#typescript-implementation)
3. [Python Implementation](#python-implementation)
4. [API Endpoints](#api-endpoints)
5. [Authentication](#authentication)
6. [Data Types](#data-types)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

## Velo API Features

The Velo Data API provides access to:

- **Futures Data**: Historical and real-time futures contract data
- **Options Data**: Options chains and historical options data
- **Spot Market Data**: Cross-exchange spot price data
- **Market Caps**: Cryptocurrency market capitalizations
- **News Feed**: Crypto market news and updates
- **WebSocket Streaming**: Real-time data streaming capabilities

## TypeScript Implementation

Our TypeScript implementation is located in `server/services/velo.ts` and provides a comprehensive service class for accessing Velo API endpoints.

### Key Features:

```typescript
// Initialize Velo Service
const veloService = new VeloService();

// Get market data
const marketData = await veloService.getMarketData({
  type: 'spot',
  exchanges: ['coinbase'],
  products: ['BTC-USD'],
  columns: ['close_price', 'dollar_volume'],
  begin: Date.now() - 86400000, // 24 hours ago
  end: Date.now(),
  resolution: '1h'
});

// Get market caps
const marketCaps = await veloService.getMarketCaps(['BTC', 'ETH', 'SOL']);

// Get options data
const optionsData = await veloService.getOptionsData({
  coin: 'BTC',
  columns: ['strike', 'mark_price', 'volume'],
  begin: Date.now() - 86400000,
  end: Date.now()
});
```

### Available Methods:

- `getStatus()`: Check API connection status
- `getFuturesContracts()`: List available futures contracts
- `getOptionsContracts()`: List available options contracts
- `getSpotProducts()`: List available spot trading pairs
- `getMarketData()`: Fetch historical market data
- `getMarketCaps()`: Get cryptocurrency market capitalizations
- `getOptionsData()`: Retrieve options market data
- `getCryptoNews()`: Fetch crypto news (requires additional permissions)

## Python Implementation

For data science and analytical workflows, Velo provides an official Python library:

### Installation:

```bash
pip install velodata
```

### Basic Usage:

```python
from velodata import lib as velo

# Initialize client
client = velo.client('your_api_key')

# Get futures data
futures = client.get_futures()
columns = client.get_futures_columns()

# Fetch market data
params = {
    'type': 'futures',
    'columns': columns[:2],
    'exchanges': [futures[0]['exchange']],
    'products': [futures[0]['product']],
    'begin': client.timestamp() - 1000 * 60 * 60,  # 1 hour ago
    'end': client.timestamp(),
    'resolution': '1m'
}

# Returns pandas DataFrame
df = client.get_rows(params)
```

### Streaming Data:

```python
# For large requests, stream data in batches
batches = client.batch_rows(params)
for df in client.stream_rows(batches):
    print(df)
```

### News Streaming:

```python
import asyncio
import json

# Stream news updates
async def stream_news():
    async for message in client.news.stream_news():
        if message not in ('connected', 'heartbeat', 'closed'):
            news_item = json.loads(message)
            print(f"News: {news_item['headline']}")

asyncio.run(stream_news())
```

## API Endpoints

### Base URL
- Production: `https://api.velo.xyz/api/v1`

### Available Endpoints:

1. **Market Data**: `/rows`
   - Parameters: type, exchanges, products, columns, begin, end, resolution

2. **Market Caps**: `/caps`
   - Parameters: coins

3. **Status**: `/status`
   - Returns API connection status

4. **Products**: `/futures`, `/options`, `/spot`
   - Returns available trading products

5. **News**: `/news`
   - Parameters: begin (timestamp)
   - Note: Requires additional API permissions

## Authentication

The Velo API uses Basic Authentication with your API key:

### TypeScript:
```typescript
const headers = {
  'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
  'Content-Type': 'application/json'
};
```

### Python:
```python
client = velo.client('your_api_key')
```

### Environment Setup:
```bash
# .env file
VELO_API_KEY=your_api_key_here
```

## Data Types

### Market Data Row
```typescript
interface VeloMarketData {
  time: number;          // Unix timestamp
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price?: number;
  volume?: number;
  dollar_volume?: number;
  [key: string]: any;    // Additional columns
}
```

### Market Cap Data
```typescript
interface VeloCapData {
  time: number;
  coin: string;
  market_cap: number;
}
```

### News Item
```typescript
interface VeloNewsItem {
  id: number;
  time: number;
  effectiveTime: number;
  headline: string;
  source: string;
  priority: number;      // 1 = high priority, 2 = normal
  coins: string[];
  summary: string;       // May include markdown
  link: string | null;
}
```

## Usage Examples

### 1. Fetching BTC Price History

**TypeScript:**
```typescript
const btcPrices = await veloService.getBTCSpotPrice24h();
console.log(`BTC 24h prices: ${btcPrices.length} data points`);
```

**Python:**
```python
params = {
    'type': 'spot',
    'exchanges': ['coinbase'],
    'products': ['BTC-USD'],
    'columns': ['close_price'],
    'begin': client.timestamp() - 86400000,
    'end': client.timestamp(),
    'resolution': '1h'
}
btc_prices = client.get_rows(params)
```

### 2. Multi-Asset Dashboard Data

**TypeScript:**
```typescript
const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
const dashboardData = await veloService.getMultiAssetPriceData(assets, '1h');
```

### 3. Options Term Structure

**TypeScript:**
```typescript
const btcOptions = await veloService.getOptionsData({
  coin: 'BTC',
  columns: ['strike', 'mark_price', 'implied_volatility'],
  begin: Date.now() - 3600000,
  end: Date.now()
});
```

## Troubleshooting

### Common Issues:

1. **400 Bad Request on News Endpoint**

   **Console Error Log:**
   ```
   === VELO NEWS API ERROR - DETAILED DIAGNOSTIC REPORT ===
   
   [ERROR] Failed to fetch news from /news: Velo API error: 400 Bad Request - {"error":"insufficient_permissions"}
   [ERROR] Failed to fetch news from /v1/news: Velo API error: 400 Bad Request - {"error":"insufficient_permissions"}
   [ERROR] Failed to fetch news from /api/news: Velo API error: 400 Bad Request - {"error":"insufficient_permissions"}
   [ERROR] All news endpoints failed: Error: Velo API error: 400 Bad Request - {"error":"insufficient_permissions"}
   
   === REQUEST DETAILS ===
   Endpoint: https://api.velo.xyz/api/v1/news
   Method: GET
   Headers: {
     'Authorization': 'Basic [REDACTED_API_KEY]',
     'Content-Type': 'application/json'
   }
   Parameters: {
     'begin': 1753002000000 // Unix timestamp
   }
   
   === RESPONSE DETAILS ===
   Status: 400 Bad Request
   Status Text: Bad Request
   Response Body: {"error":"insufficient_permissions"}
   
   === DIAGNOSTIC INFORMATION ===
   1. Authentication: Valid (API key is correctly formatted and sent)
   2. Endpoint Access: Forbidden (requires additional permissions)
   3. Error Type: Permission-based restriction
   4. Root Cause: News API access is not enabled for this API key
   
   === CODE IMPLEMENTATION ===
   File: server/services/velo.ts
   
   // News endpoint implementation
   async getNews(beginTimestamp?: number): Promise<VeloNewsItem[]> {
     try {
       const params: Record<string, any> = {};
       if (beginTimestamp !== undefined) {
         params.begin = beginTimestamp;
       }

       // Try multiple possible endpoints
       const endpoints = ['/news', '/v1/news', '/api/news'];
       let lastError: any;

       for (const endpoint of endpoints) {
         try {
           return await this.makeRequest(endpoint, params);
         } catch (error: any) {
           lastError = error;
           console.log(`Failed to fetch news from ${endpoint}:`, error.message);
         }
       }

       // If all endpoints fail, return empty array
       console.error('All news endpoints failed:', lastError);
       return [];
     } catch (error) {
       console.error('Failed to fetch news:', error);
       return [];
     }
   }
   
   === RESOLUTION ===
   To resolve this issue:
   1. Contact Velo support at support@velodata.app
   2. Request news API access for your API key
   3. Provide your API key identifier (not the full key)
   4. Explain your use case for news data access
   
   === WORKAROUND ===
   Current implementation returns empty array [] when news access is denied,
   allowing the application to continue functioning without news data.
   ```

   **Summary:**
   - The news API requires additional permissions not included in standard API keys
   - Returns HTTP 400 with {"error":"insufficient_permissions"}
   - Contact Velo support to enable news access for your API key

2. **"ok" Response Parsing Error**
   - The `/status` endpoint returns plain text "ok" instead of JSON
   - This is handled in our TypeScript implementation

3. **Rate Limiting**
   - Implement exponential backoff for large requests
   - Use streaming/batching for large data requests

4. **Data Resolution Options**
   - Available: '1m', '5m', '15m', '30m', '1h', '4h', '1d'
   - Choose appropriate resolution for your time range

### Error Handling:

**TypeScript:**
```typescript
try {
  const data = await veloService.getMarketData(params);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Invalid API key');
  } else if (error.message.includes('400')) {
    console.error('Invalid parameters');
  }
}
```

**Python:**
```python
try:
    data = client.get_rows(params)
except Exception as e:
    print(f"Error fetching data: {e}")
```

## Additional Resources

- [Official Velo API Documentation](https://velodata.gitbook.io/velo-data-api)
- [Python Library GitHub](https://github.com/velodataorg/velo-python)
- [API Status Page](https://status.velodata.app)

## License

This integration guide is part of the Token Analytics Dashboard project.
For Velo API terms of use, please refer to their official documentation.