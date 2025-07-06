# DefiLlama Pro API Endpoints

This document summarizes the endpoints available in the DefiLlama Pro API. All requests use the API key:

```
https://pro-api.llama.fi/4b4fd225f408d49fc6d984ca64fad9d948bbaa183390b6434deea0604b8b11ff
```

Append the paths below to the base URL. Unless noted otherwise, all routes use the `GET` method.

## TVL
- `/api/tokenProtocols/{symbol}` – amount of a token within all protocols
- `/api/inflows/{protocol}/{timestamp}` – inflows and outflows for a protocol at a given timestamp
- `/api/chainAssets` – assets of all chains
- `/api/protocols` – list of protocols with TVL
- `/api/protocol/{protocol}` – historical TVL for a protocol
- `/api/v2/historicalChainTvl` – historical TVL across all chains
- `/api/v2/historicalChainTvl/{chain}` – historical TVL for a specific chain
- `/api/tvl/{protocol}` – current TVL for a protocol
- `/api/v2/chains` – current TVL of all chains

## Stablecoins
- `/stablecoins/stablecoindominance/{chain}` – stablecoin dominance per chain (optional `stablecoin` query)

## Active users
- `/api/activeUsers` – active users on chains and protocols
- `/api/userData/{type}/{protocolId}` – user data by type and protocol

## Unlocks
- `/api/emissions` – list of all tokens with basic info
- `/api/emission/{protocol}` – unlocks data for a protocol

## Main page
- `/api/categories` – categories overview
- `/api/forks` – forks overview
- `/api/oracles` – oracle overview
- `/api/hacks` – hacks overview
- `/api/raises` – raises overview
- `/api/treasuries` – list of protocols with treasuries
- `/api/entities` – list of entities

## Token liquidity
- `/api/historicalLiquidity/{token}` – historical liquidity for a token

## Yields
- `/yields/pools` – latest pool data with predictions
- `/yields/poolsOld` – same as `/pools` but with `pool_old` parameter
- `/yields/chart/{pool}` – historical APY and TVL of a pool
- `/yields/poolsBorrow` – borrow cost APY
- `/yields/chartLendBorrow/{pool}` – historical borrow cost APY
- `/yields/perps` – funding rates and open interest
- `/yields/lsdRates` – APY rates of LSDs

## ETFs
- `/etfs/overview` – BTC ETF metrics
- `/etfs/overviewEth` – ETH ETF metrics
- `/etfs/history` – historical AUM of BTC ETFs
- `/etfs/historyEth` – historical AUM of ETH ETFs

## Narratives
- `/fdv/performance/{period}` – narrative performance chart

## Derivatives
- `/api/overview/derivatives` – list derivatives with volume summaries
- `/api/summary/derivatives/{protocol}` – volume details for a specific perp protocol

## Bridges
These routes use the server `https://bridges.llama.fi`.
- `/bridges` – list of bridges (optional `includeChains` query)
- `/bridge/{id}` – bridge summary and chain breakdown
- `/bridgevolume/{chain}` – historical bridge volumes (optional `id` query)
- `/bridgedaystats/{timestamp}/{chain}` – 24h volume breakdown (optional `id` query)
- `/transactions/{id}` – transactions for a bridge with filters

## Coins
- `/coins/prices/current/{coins}` – current token prices (optional `searchWidth` query)
- `/coins/prices/historical/{timestamp}/{coins}` – historical token prices (optional `searchWidth` query)

## Meta
- `/usage/APIKEY` – check remaining API credits

Additional endpoints (e.g., further `/coins`, `/stablecoins`, and `/api/overview` routes) may be available in the full API specification.
