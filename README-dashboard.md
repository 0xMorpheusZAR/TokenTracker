# Token Failure Analytics Dashboard

A comprehensive cryptocurrency analysis platform providing real-time insights into token performance, DeFi protocol revenues, and market dynamics.

![Dashboard Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Overview

The Token Failure Analytics Dashboard is a cutting-edge platform designed to analyze cryptocurrency tokens, track DeFi protocol revenues, and provide comprehensive market insights. Built with modern web technologies and integrated with multiple data sources, it offers institutional-grade analytics for crypto investors and researchers.

### Key Features

- **Token Failure Analysis**: Track and analyze tokens that have underperformed since their listing
- **Revenue Analytics**: Comprehensive DeFi protocol revenue tracking across categories, chains, and timeframes
- **Real-time Data**: Live price feeds and market data from CoinGecko Pro API
- **Protocol Metrics**: TVL, fees, revenue, and holder revenue tracking for 1,100+ protocols
- **Interactive Visualizations**: Advanced charts and graphs using Chart.js
- **Multi-chain Support**: Analytics across all major blockchain networks
- **Responsive Design**: Optimized for desktop and mobile viewing

## 📊 Dashboards

### 1. Token Failure Analysis
- Tracks tokens with significant price declines from ATH
- Risk assessment and unlock event tracking
- Performance metrics and comparative analysis
- Categories: High Risk, Medium Risk, Low Risk

### 2. Revenue Dashboard ("Cash Cows")
- Real-time DeFi protocol revenue tracking
- Category analysis (DEXs, Lending, Stablecoins, etc.)
- Chain-by-chain revenue breakdown
- TVL and fee metrics for all protocols
- Timeframe filtering (24h, 7d, 30d)

### 3. Hyperliquid Success Story
- Detailed analysis of Hyperliquid's market dominance
- Real-time price and market cap tracking
- Revenue projections and market share analysis
- Monte Carlo price simulations

### 4. Interactive Projects
- EstateX: Web3 real estate tokenization platform
- Raiinmaker: AI-powered video generation infrastructure
- BloFin Trading Competition integration

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and HMR
- **TanStack Query** for server state management
- **Chart.js** for data visualization
- **Tailwind CSS** for styling
- **shadcn/ui** components with Radix UI
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** (Neon Database)
- **Drizzle ORM** with Zod validation
- **Express Sessions** with PostgreSQL store

### External APIs
- **CoinGecko Pro API**: Real-time and historical price data
- **DefiLlama API**: Protocol TVL, fees, and revenue data
- **CryptoRank API**: Token unlock schedules
- **Discord OAuth2**: Authentication integration

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use Neon Database)
- API Keys:
  - CoinGecko Pro API key
  - CryptoRank API key (optional)
  - Discord OAuth credentials (optional)

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/token-failure-analytics.git
cd token-failure-analytics
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
COINGECKO_PRO_API_KEY=your_api_key_here
CRYPTORANK_API_KEY=your_api_key_here
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🏗 Architecture

### Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and helpers
│   │   └── App.tsx      # Main app component
│   └── index.html
├── server/              # Express backend
│   ├── services/        # External API integrations
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Data layer
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schemas
├── docs/                # Documentation
└── attached_assets/     # Static assets
```

### Data Flow
1. External APIs → Server Services → Database
2. Database → API Routes → React Query → UI Components
3. User Interactions → State Updates → Real-time UI Updates

### Key Services

#### CoinGecko Service
- Fetches real-time price data
- Historical price charts
- Market cap and volume metrics
- Token details and metadata

#### DefiLlama Service
- Protocol revenue data
- TVL tracking
- Fee analytics
- Multi-chain metrics

#### Storage Layer
- Interface-based design for flexibility
- PostgreSQL with Drizzle ORM
- Type-safe queries with Zod validation

## 📈 API Endpoints

### Token Analytics
- `GET /api/tokens` - List all tracked tokens
- `GET /api/tokens/:id` - Get token details
- `GET /api/analytics/summary` - Dashboard summary

### Revenue Analytics
- `GET /api/defillama/protocol-revenues` - All protocol revenues
- `GET /api/defillama/category-revenues` - Revenue by category
- `GET /api/defillama/chain-revenues` - Revenue by blockchain

### Market Data
- `GET /api/coingecko/detailed` - Detailed token data
- `GET /api/hyperliquid/comprehensive` - Hyperliquid analytics
- `GET /api/coingecko/status` - API connection status

## 🎨 UI Components

### Design System
- Dark theme with gradient backgrounds
- Glass morphism effects
- Responsive grid layouts
- Interactive hover states
- Real-time data updates

### Key Components
- Revenue charts (Doughnut, Bar, Line)
- Protocol tables with sorting
- Risk assessment indicators
- Market status cards
- Interactive filters

## 🔒 Security

- Environment-based configuration
- Secure session management
- API key protection
- CORS configuration
- Input validation with Zod

## 🚦 Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Style
- TypeScript strict mode
- ESLint with React hooks rules
- Prettier for formatting
- Conventional commits

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Areas
- New data integrations
- UI/UX improvements
- Performance optimizations
- Documentation updates
- Bug fixes

## 📊 Data Sources

### Primary Sources
- **DefiLlama**: DeFi protocol metrics and TVL data
- **CoinGecko Pro**: Comprehensive cryptocurrency market data
- **CryptoRank**: Token vesting and unlock schedules

### Update Frequency
- Price data: Real-time
- Protocol metrics: Every 5 minutes
- TVL data: Hourly
- Revenue data: Daily aggregation

## 🗺 Roadmap

### Phase 1 (Completed)
- ✅ Basic token failure tracking
- ✅ Revenue dashboard implementation
- ✅ CoinGecko Pro integration
- ✅ Multi-chain support

### Phase 2 (Current)
- 🔄 Enhanced protocol analytics
- 🔄 Advanced filtering options
- 🔄 Mobile optimization
- 🔄 Performance improvements

### Phase 3 (Planned)
- 📋 Portfolio tracking
- 📋 Custom alerts system
- 📋 AI-powered insights
- 📋 Social sentiment analysis
- 📋 Advanced risk modeling

### Phase 4 (Future)
- 📋 Mobile app development
- 📋 API for third-party integrations
- 📋 Machine learning predictions
- 📋 Institutional features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Created by [@0xMorpheusXBT](https://twitter.com/0xMorpheusXBT)

## 🙏 Acknowledgments

- DefiLlama team for comprehensive DeFi data
- CoinGecko for reliable market data
- Replit for development platform
- Open source community for amazing tools

## 📞 Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Contact via Twitter: [@0xMorpheusXBT](https://twitter.com/0xMorpheusXBT)

---

**Note**: This project is under active development. Features and documentation may change frequently. Always refer to the latest version of this README for current information.