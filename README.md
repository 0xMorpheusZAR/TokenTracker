# Token Failure Analytics Dashboard

A comprehensive cryptocurrency analytics platform that tracks token performance, analyzes failure patterns, and provides real-time insights into tokenomics and unlock schedules. Built by [@0xMorpheusXBT](https://twitter.com/0xMorpheusXBT).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue.svg)

## 🚀 Overview

This platform provides institutional-grade analytics for cryptocurrency tokens, focusing on:
- **Token Failure Analysis**: Track tokens that have declined 90%+ from their all-time highs
- **Unlock Schedule Monitoring**: Visualize upcoming token unlocks and their potential market impact
- **Revenue Analytics**: Compare DeFi protocol revenues and P/E ratios
- **Monte Carlo Simulations**: Statistical price projections using Geometric Brownian Motion
- **Success Stories**: Deep dive into successful projects like Hyperliquid

## ✨ Key Features

### 📊 Analytics Dashboard
- Real-time price tracking via CoinGecko Pro API
- Performance metrics with 1h, 24h, 7d, 30d, and 1y changes
- Market cap rankings and volatility indicators
- Interactive charts with multiple visualization options

### 🔓 Token Unlock Tracking
- $155B+ in pending token unlocks tracked
- Visual timeline of upcoming unlock events
- Impact analysis on token prices
- Float percentage calculations

### 💰 Revenue Analysis ("Cash Cows")
- DeFi protocol revenue comparison
- P/E ratio calculations
- Revenue growth metrics
- Annual run rate projections

### 🎲 Monte Carlo Simulations
- Three scenario models: Bearish (15th), Base (50th), Bullish (85th percentile)
- Geometric Brownian Motion with fundamental factors
- End-of-year price projections
- Risk assessment metrics

### 🏆 Success Story Analysis
- Hyperliquid case study with 76%+ market share metrics
- $1.15B annual revenue run rate
- 190K+ active users tracking
- Comprehensive performance analysis

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **TanStack Query** for server state management
- **shadcn/ui** components with Radix UI
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** database (Neon)
- **Drizzle ORM** for type-safe queries
- **Session management** with connect-pg-simple

### External APIs
- **CoinGecko Pro API** for real-time pricing data
- **CryptoRank API** for unlock schedule data
- **Dune Analytics API** for on-chain blockchain metrics and custom queries
- **DefiLlama API** for DeFi protocol TVL and revenue data
- **Discord OAuth2** for authentication
- **Whop API** for membership verification

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- API keys for CoinGecko Pro and CryptoRank

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/token-failure-analytics.git
cd token-failure-analytics
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# API Keys
COINGECKO_PRO_API_KEY=your_coingecko_pro_key
CRYPTORANK_API_KEY=your_cryptorank_key

# Optional APIs
DUNE_API_KEY=your_dune_key
WHOP_API_KEY=your_whop_key
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Session Secret
SESSION_SECRET=your_session_secret
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## 🗂️ Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and helpers
├── server/               # Backend Express server
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Data access layer
│   └── services/         # External API integrations
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── drizzle.config.ts     # Database configuration
```

## 🌟 Features in Detail

### Token Failure Analysis
- Tracks 90%+ price declines from ATH
- Categorizes by sector (Gaming, DeFi, Layer 2)
- Provides risk indicators and warnings
- Historical price charts with trend analysis

### Real-time Data Integration
- Live price updates every 30 seconds
- Market status indicators
- Fear & Greed Index integration
- Liquidity risk analysis

### Professional Analytics
- Institutional-grade metrics
- Comparative analysis tools
- Export capabilities for reports
- Multi-timeframe analysis

## 🔗 Dune Analytics Integration

The dashboard integrates with Dune Analytics to provide comprehensive on-chain data for Hyperliquid and other protocols.

### Hyperliquid Dashboard Data
We pull data from the [x3research Hyperliquid Dashboard](https://dune.com/x3research/hyperliquid) which includes:

#### Volume & Liquidity Metrics
- **Cumulative Volume**: Total trading volume over time
- **Daily Volume**: 24-hour trading volume breakdown
- **Total Value Locked (TVL)**: Liquidity in the protocol
- **Liquidations**: Tracking liquidation events and volumes

#### User Analytics
- **Daily Active Users**: Unique users interacting with the protocol
- **New Users**: Daily new user acquisition
- **User Retention**: Cohort retention analysis

#### Trading Metrics
- **Trades Per Day**: Transaction count and trends
- **Average Trade Size**: Mean transaction values
- **Top Traders**: Leaderboard of highest volume traders

#### Asset Performance
- **Top Traded Assets**: Most popular trading pairs
- **Asset Volumes**: Volume breakdown by asset
- **Open Interest**: Outstanding derivative positions
- **PnL Distribution**: Profit/loss analysis across users
- **Funding Rates**: Perpetual funding rate history
- **Spreads**: Bid-ask spread analysis

### API Endpoints

```javascript
// Get all Hyperliquid metrics
GET /api/dune/hyperliquid/all

// Get specific metric
GET /api/dune/hyperliquid/:metric

// Execute custom query
POST /api/dune/query/:queryId/execute
```

### Setup Requirements
To use Dune Analytics features, add your API key to the environment:
```bash
DUNE_API_KEY=pZBvRD0acWVAtWRwnTtOuZgUvuETutIt
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with data from [CoinGecko Pro](https://www.coingecko.com/en/api)
- Token unlock data powered by [CryptoRank](https://cryptorank.io/)
- Created by [@0xMorpheusXBT](https://twitter.com/0xMorpheusXBT)

## 📧 Contact

For questions or support, reach out on Twitter: [@0xMorpheusXBT](https://twitter.com/0xMorpheusXBT)

---

**Note**: This project requires API keys for full functionality. Some features may be limited without proper authentication credentials.