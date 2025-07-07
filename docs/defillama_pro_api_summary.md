# DefiLlama Pro API Documentation

This document provides a comprehensive reference for all endpoints available in the DefiLlama Pro API.

## Base URL

```
https://pro-api.llama.fi/4b4fd225f408d49fc6d984ca64fad9d948bbaa183390b6434deea0604b8b11ff
```

All endpoints listed below should be appended to this base URL. Unless noted otherwise, all routes use the `GET` method.

## Table of Contents

1. [TVL](#tvl)
2. [Stablecoins](#stablecoins)
3. [Active Users](#active-users)
4. [Unlocks](#unlocks)
5. [Main Page](#main-page)
6. [Token Liquidity](#token-liquidity)
7. [Yields](#yields)
8. [ETFs](#etfs)
9. [Narratives](#narratives)
10. [Derivatives](#derivatives)
11. [Bridges](#bridges)
12. [Coins](#coins)
13. [Overview Pages](#overview-pages)
14. [Protocols](#protocols)
15. [Meta](#meta)

## TVL

### Token Protocols
- **GET** `/api/tokenProtocols/{symbol}`
  - Lists the amount of a certain token within all protocols
  - Path parameter: `symbol` (e.g., "usdt")

### Inflows/Outflows
- **GET** `/api/inflows/{protocol}/{timestamp}`
  - Lists the amount of inflows and outflows for a protocol at a given date
  - Path parameters:
    - `protocol`: protocol slug (e.g., "compound-v3")
    - `timestamp`: unix timestamp (e.g., 1700006400)

### Chain Assets
- **GET** `/api/chainAssets`
  - Get assets of all chains

### Historical Chain TVL
- **GET** `/api/v2/historicalChainTvl`
  - Historical TVL data for all chains combined
  
- **GET** `/api/v2/historicalChainTvl/{chain}`
  - Historical TVL for a specific chain
  - Path parameter: `chain` (chain slug)

### Current TVL
- **GET** `/api/tvl/{protocol}`
  - Current TVL for a specific protocol
  - Path parameter: `protocol` (protocol slug)

- **GET** `/api/v2/chains`
  - Current TVL of all chains

## Stablecoins

### Stablecoin Dominance
- **GET** `/stablecoins/stablecoindominance/{chain}`
  - Get stablecoin dominance per chain
  - Path parameter: `chain` (e.g., "Ethereum")
  - Query parameter: `stablecoin` (optional, stablecoin ID)

### Stablecoins List
- **GET** `/stablecoins/stablecoins`
  - List all stablecoins along with their circulating supply

### Stablecoin Info
- **GET** `/stablecoins/stablecoin/{asset}`
  - Get info about a stablecoin
  - Path parameter: `asset` (stablecoin ID)

### Stablecoin Chains
- **GET** `/stablecoins/stablecoinchains`
  - List all chains where stablecoins are present

### Historical Stablecoin Market Cap
- **GET** `/stablecoins/stablecoincharts/{chain}`
  - Get historical market cap sum of all stablecoins on a chain
  - Path parameter: `chain` (optional, defaults to all chains)
  - Query parameter: `stablecoin` (optional, stablecoin ID)

### Stablecoin Prices
- **GET** `/stablecoins/stablecoinprices`
  - Get historical prices of all stablecoins

## Active Users

### Active Users Overview
- **GET** `/api/activeUsers`
  - Get active users on chains and protocols

### User Data by Type
- **GET** `/api/userData/{type}/{protocolId}`
  - Get user data by type and protocol
  - Path parameters:
    - `type`: data type (e.g., "activeUsers")
    - `protocolId`: protocol ID (integer)

## Unlocks

### Emissions List
- **GET** `/api/emissions`
  - List of all tokens along with basic info for each

### Token Emission Data
- **GET** `/api/emission/{protocol}`
  - Unlocks data for a given token/protocol
  - Path parameter: `protocol` (protocol slug, e.g., "aave")

## Main Page

### Categories Overview
- **GET** `/api/categories`
  - Overview of all categories across all protocols

### Forks Overview
- **GET** `/api/forks`
  - Overview of all protocol forks

### Oracles Overview
- **GET** `/api/oracles`
  - Overview of all oracle protocols

### Hacks Overview
- **GET** `/api/hacks`
  - Overview of all hacks on the Hacks dashboard

### Raises Overview
- **GET** `/api/raises`
  - Overview of all raises on the Raises dashboard

### Treasuries List
- **GET** `/api/treasuries`
  - List all protocols on the Treasuries dashboard

### Entities List
- **GET** `/api/entities`
  - List all entities

## Token Liquidity

### Historical Liquidity
- **GET** `/api/historicalLiquidity/{token}`
  - Provides historical liquidity data for a token
  - Path parameter: `token` (token slug, e.g., "usdt")

## Yields

### Pools Data
- **GET** `/yields/pools`
  - Retrieve the latest data for all pools, including enriched information such as predictions

- **GET** `/yields/poolsOld`
  - Same as `/pools` but includes `pool_old` parameter (usually contains pool address)

### Historical Pool Data
- **GET** `/yields/chart/{pool}`
  - Get historical APY and TVL of a pool
  - Path parameter: `pool` (pool ID, e.g., "747c1d2a-c668-4682-b9f9-296708a3dd90")

### Borrow Costs
- **GET** `/yields/poolsBorrow`
  - Borrow costs APY of assets from lending markets

- **GET** `/yields/chartLendBorrow/{pool}`
  - Historical borrow cost APY from a pool on a lending market
  - Path parameter: `pool` (pool ID from `/poolsBorrow`)

### Perps Data
- **GET** `/yields/perps`
  - Funding rates and Open Interest of perps across exchanges (DEX and CEX)

### LSD Rates
- **GET** `/yields/lsdRates`
  - APY rates of multiple LSDs (Liquid Staking Derivatives)

## ETFs

### BTC ETFs
- **GET** `/etfs/overview`
  - Get BTC ETFs and their metrics (AUM, price, fees)

- **GET** `/etfs/history`
  - List of all daily ETF in/outflows for BTC

### ETH ETFs
- **GET** `/etfs/overviewEth`
  - Get ETH ETFs

- **GET** `/etfs/historyEth`
  - List of all daily ETF in/outflows for ETH

## Narratives

### Performance Tracking
- **GET** `/fdv/performance/{period}`
  - Get FDV performance chart over time
  - Path parameter: `period` (e.g., "7d", "30d")

## Derivatives

### Derivatives Overview
- **GET** `/api/overview/derivatives`
  - List derivatives with volume summaries

### Protocol Derivatives Summary
- **GET** `/api/summary/derivatives/{protocol}`
  - Volume details for a specific perp protocol
  - Path parameter: `protocol` (protocol slug)

## Bridges

Note: These routes use the server `https://bridges.llama.fi`.

### Bridges List
- **GET** `/bridges`
  - Get list of all bridges
  - Query parameter: `includeChains` (optional, boolean)

### Bridge Details
- **GET** `/bridge/{id}`
  - Get bridge summary with historical data and chain breakdown
  - Path parameter: `id` (bridge ID)

### Bridge Volume
- **GET** `/bridgevolume/{chain}`
  - Get historical volumes for a bridge, aggregate and by chain
  - Path parameter: `chain` (chain slug or "all")
  - Query parameter: `id` (optional, bridge ID)

### Daily Bridge Stats
- **GET** `/bridgedaystats/{timestamp}/{chain}`
  - Get 24hr volume breakdown by bridge and chain
  - Path parameters:
    - `timestamp`: unix timestamp
    - `chain`: chain slug
  - Query parameter: `id` (optional, bridge ID)

### Bridge Transactions
- **GET** `/transactions/{id}`
  - Get last 24hr transactions for a bridge
  - Path parameter: `id` (bridge ID)
  - Query parameters:
    - `starttimestamp` (optional)
    - `endtimestamp` (optional)
    - `sourcechain` (optional)
    - `address` (optional)
    - `limit` (optional, default 200, max 6000)

## Coins

### Current Prices
- **GET** `/coins/prices/current/{coins}`
  - Get current prices of tokens
  - Path parameter: `coins` (comma-separated list, e.g., "ethereum:0x1234")
  - Query parameter: `searchWidth` (optional, e.g., "4h")

### Historical Prices
- **GET** `/coins/prices/historical/{timestamp}/{coins}`
  - Get historical prices of tokens at a specific timestamp
  - Path parameters:
    - `timestamp`: unix timestamp
    - `coins`: comma-separated list
  - Query parameter: `searchWidth` (optional)

### Batch Historical Prices
- **POST** `/coins/batchHistorical`
  - Get historical prices for multiple tokens at multiple timestamps
  - Body: JSON array of objects with `coins` and `timestamps`

### Price Charts
- **GET** `/coins/chart/{coins}`
  - Get token price history over time
  - Path parameter: `coins` (coingecko_id or {chain}:{address})
  - Query parameters:
    - `start` (unix timestamp)
    - `end` (unix timestamp)
    - `span` (optional, integer)
    - `period` (optional, e.g., "1d")
    - `searchWidth` (optional, e.g., "600")

### Price Changes
- **GET** `/coins/percentage/{coins}`
  - Get price change percentages over different periods
  - Path parameter: `coins` (comma-separated list)
  - Query parameters:
    - `timestamp` (optional)
    - `lookForward` (optional, boolean)
    - `period` (optional, e.g., "3w")

### First Recorded Prices
- **GET** `/coins/prices/first/{coins}`
  - Get earliest recorded price of tokens
  - Path parameter: `coins` (comma-separated list)

### Block Numbers
- **GET** `/coins/block/{chain}/{timestamp}`
  - Get the closest block to a timestamp
  - Path parameters:
    - `chain`: chain slug
    - `timestamp`: unix timestamp

## Overview Pages

### Overview Options
- **GET** `/api/overview/options`
  - List all options protocols with summary data

- **GET** `/api/overview/dexs`
  - List all DEX protocols with volume summaries

- **GET** `/api/overview/derivatives`
  - List all derivatives with volume summaries

- **GET** `/api/overview/fees`
  - List all protocols with fee data

- **GET** `/api/overview/liquid-staking`
  - List all liquid staking protocols

### Revenue Overview
- **GET** `/api/overview/fees/{chain}`
  - Revenue overview for a specific chain
  - Path parameter: `chain` (optional)
  - Query parameters:
    - `excludeTotalDataChart` (boolean)
    - `excludeTotalDataChartBreakdown` (boolean)
    - `dataType` (e.g., "dailyFees", "dailyRevenue")

## Protocols

### Protocols List
- **GET** `/api/protocols`
  - List all protocols on DefiLlama with TVL, volume, and other metrics

### Protocol Details
- **GET** `/api/protocol/{protocol}`
  - Get comprehensive data about a protocol
  - Path parameter: `protocol` (protocol slug, e.g., "aave")

### Summary Endpoints
- **GET** `/api/summary/fees/{protocol}`
  - Summary of protocol fees/revenue
  - Path parameter: `protocol`
  - Query parameter: `dataType` (optional)

- **GET** `/api/summary/dexs/{protocol}`
  - Summary of DEX protocol volume
  - Path parameter: `protocol`
  - Query parameter: `dataType` (optional)

- **GET** `/api/summary/options/{protocol}`
  - Summary of options protocol volume
  - Path parameter: `protocol`
  - Query parameter: `dataType` (optional)

## Meta

### API Usage
- **GET** `/usage/APIKEY`
  - Check remaining API credits for your key

---

## Notes

1. All timestamps are Unix timestamps (seconds since epoch)
2. Chain slugs are case-sensitive (e.g., "Ethereum", "BSC", "Polygon")
3. Protocol slugs are usually lowercase with hyphens (e.g., "uniswap-v3", "aave-v2")
4. Token addresses should be prefixed with chain (e.g., "ethereum:0x...")
5. Rate limits apply based on your API key tier
6. Some endpoints may return large datasets - consider using pagination or filtering where available

For the most up-to-date information and detailed response schemas, please refer to the official DefiLlama Pro API documentation.
