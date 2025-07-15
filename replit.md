# Token Failure Analytics - Replit.md

## Overview

This is a full-stack cryptocurrency token analytics application focused on analyzing token failures, unlock events, and price performance. The application tracks tokens with poor performance since listing, providing insights into tokenomics failures and unlock schedule impacts.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Charts**: Chart.js for data visualization
- **Build Tool**: Vite with TypeScript support

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: Hot module replacement via Vite integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database
- **ORM**: Drizzle ORM with Zod schema validation
- **Schema**: Three main tables:
  - `tokens`: Core token information and performance metrics
  - `unlock_events`: Token unlock schedules and price impacts
  - `price_history`: Historical price data for charting
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Database Schema
The application uses a normalized schema with three core entities:
- **Tokens**: Stores symbol, name, exchange, listing info, performance metrics, and risk assessment
- **Unlock Events**: Tracks token unlock schedules, amounts, and price impacts
- **Price History**: Historical price data for trend analysis

### Storage Layer
- **Interface-based design**: IStorage interface for data operations
- **Memory storage implementation**: MemStorage class for development/testing
- **Database operations**: CRUD operations for tokens, unlock events, and price history

### External Integrations
- **CryptoRank API**: Service for fetching real-time token unlock data and vesting schedules
- **CoinGecko API**: Primary data source for accurate real-time and historical price data
- **DefiLlama API**: Protocol TVL and revenue data for 1,100+ DeFi protocols
- **Dune Analytics API**: On-chain data and custom queries for Hyperliquid metrics
- **API Key Management**: Environment-based configuration for external services

### UI Components
- **Token Table**: Sortable, filterable table with exchange and sector filters
- **Performance Chart**: Line charts showing price decline over time with Chart.js
- **Risk Indicators**: Visual risk assessment badges and warnings
- **Unlock Calendar**: Timeline view of upcoming token unlock events

## Data Flow

1. **Data Ingestion**: CryptoRank service fetches external API data
2. **Storage**: Data is normalized and stored via Drizzle ORM
3. **API Layer**: Express routes serve data to frontend
4. **State Management**: TanStack Query handles caching and synchronization
5. **Visualization**: React components render charts and tables
6. **User Interaction**: Filtering, sorting, and search functionality

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management
- **express**: Node.js web framework
- **chart.js**: Data visualization library

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: CSS variant management

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- **Replit Platform**: Cloud-based development with PostgreSQL module
- **Hot Reload**: Vite dev server with HMR for frontend
- **TypeScript**: Real-time type checking and compilation
- **Database**: Local PostgreSQL instance via Replit modules

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles TypeScript server to `dist/index.js`
- **Database**: Neon serverless PostgreSQL for production
- **Deployment**: Replit autoscale deployment target

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **CRYPTORANK_API_KEY**: CryptoRank API authentication for unlock data
- **COINGECKO_PRO_API_KEY**: CoinGecko Pro API for enhanced pricing data
- **NODE_ENV**: Environment-specific behavior

## Changelog

```
Changelog:
- June 27, 2025: Initial setup with basic dashboard and token failure analytics
- June 27, 2025: Integrated CoinGecko Pro API for accurate real-time pricing data
- June 27, 2025: Enhanced CoinGecko service with detailed market data endpoints
- June 27, 2025: Added comprehensive Hyperliquid analysis section with real revenue metrics
- June 27, 2025: Implemented real-time token data synchronization with CoinGecko Pro
- June 27, 2025: Built advanced interactive dashboard with Chart.js visualizations
- June 27, 2025: Added enhanced filtering, sorting, and multi-view capabilities
- June 27, 2025: Created dedicated Hyperliquid analysis page at /hyperliquid route
- June 27, 2025: Updated Hyperliquid data with latest metrics (76.07% market share, $830M revenue)
- June 27, 2025: Added navigation system between main dashboard and Hyperliquid success story
- June 27, 2025: Built Monte Carlo price simulation page with statistical modeling and 3 scenarios
- June 27, 2025: Integrated real-time data into Monte Carlo simulations for end-of-year projections
- June 27, 2025: Enhanced entire website with world-class UI/UX including animated backgrounds, glass morphism effects, and premium hover animations
- June 27, 2025: Created comprehensive Revenue Analysis dashboard ("Cash Cows") with DeFi protocol comparison, P/E ratios, and revenue metrics analysis
- June 27, 2025: Standardized Monte Carlo methodology across application using Geometric Brownian Motion with fundamental factors, consistent scenario definitions (Bearish/Base/Bullish at 15th/50th/85th percentiles), and aligned volatility models based on protocol categories
- June 27, 2025: Removed AI predictions functionality completely from the application per user request
- June 27, 2025: Implemented comprehensive green/black cypherpunk theme across entire website with Matrix-style animations, monospace fonts, and terminal-inspired UI elements
- June 27, 2025: Fixed front page scrolling to natural website behavior with proper sections and smooth navigation
- June 27, 2025: Renamed "Simulations" button to "Hype Simulation" and updated all navigation elements with cypherpunk styling
- June 27, 2025: Completely removed cypherpunk theme from failure analysis page and updated to match revenue analysis styling with consistent gradient backgrounds, improved card designs, and clean modern UI matching the rest of the application
- June 27, 2025: Added creator attribution (@0xMorpheusXBT) with prominent Twitter/X link in dashboard header and footer
- June 27, 2025: Enhanced failure analysis page with improved dropdown placement and visual hierarchy
- June 27, 2025: Transformed entire site with world-class crypto analyst features including professional market status indicators, advanced risk metrics, Fear & Greed Index, Unlock Pressure indicators, Liquidity Risk analysis, enhanced metric cards with real-time data, professional token risk analysis dashboard, and institutional-grade comparative metrics across all pages
- June 30, 2025: Added comprehensive Rainmaker Analysis section showcasing AI infrastructure for cinematic video generation, featuring Hollywood-quality data solutions, decentralized network architecture, ethical AI framework, strategic partnerships with Aethir, and investment analysis for the $231.5B AI video market by 2030
- June 30, 2025: Renamed "Rainmaker" section to "Interesting Projects", added official website link (raiinmaker.com), Twitter/X profile (@raiinmakerapp), and updated TGE status to "TBA"
- June 30, 2025: Added EstateX Web3 real estate platform to Interesting Projects with live CoinGecko Pro integration, showing real-time price data, fully diluted valuation, and TGE performance
- June 30, 2025: Removed Circulating Market Cap from EstateX metrics display per user request
- June 30, 2025: Added BloFin x Miles Deutscher Space Trading Competition to Interesting Projects, featuring $10,000 prize pool, competition sign-up link, customized tabs (Overview/About/Rules), and space-themed orange/yellow styling
- June 30, 2025: Created dedicated BloFin Trading Competition page at /blofin-competition route with full competition details, prize distribution, and rules
- June 30, 2025: Updated Projects button in dashboard with crypto-themed styling including gradient effects, shimmer animation, CPU icon, and blockchain-inspired design elements
- June 30, 2025: Changed Projects button text from "PROJECTS" to "Projects" to match other button styling
- June 30, 2025: Removed BloFin from Interesting Projects dropdown and added dedicated BloFin button to main dashboard with orange/amber gradient styling and Trophy icon
- June 30, 2025: Integrated Discord Authentication with Whop API for Miles High Club membership verification - includes Discord OAuth2 login, Whop membership checking (read-only), session management, and Discord authentication UI component in dashboard
- July 4, 2025: Removed Discord Login button from main dashboard per user request
- July 6, 2025: Created comprehensive README.md file for GitHub repository with project overview, features, tech stack, installation instructions, and contributing guidelines
- July 7, 2025: Updated Hyperliquid analysis page to display live real-time price data from CoinGecko API for current price, market cap, and annual revenue metrics
- July 7, 2025: Rewrote DefiLlama Pro API documentation (docs/defillama_pro_api_summary.md) based on official OpenAPI specification - includes comprehensive endpoint reference with 15+ categories, detailed parameter documentation, and usage notes
- July 7, 2025: Fixed DefiLlama service to properly fetch revenue data from all endpoints (fees, revenue, holders revenue, earnings) and display comprehensive metrics for 1,100+ protocols
- July 7, 2025: Enhanced revenue dashboard with TVL data integration from DefiLlama protocols API, optimized view switching performance with useMemo, and improved loading states
- July 7, 2025: Created comprehensive dashboard documentation (README-dashboard.md) for GitHub repository including detailed feature descriptions, architecture overview, setup instructions, API documentation, development guidelines, and future roadmap
- July 9, 2025: Built comprehensive Pump.fun Dashboard analyzing TGE scenarios, $TRUMP liquidity blackhole impact (Jan 17, 2025), and Bonk.fun competition - includes altcoin drawdown simulations, market share analysis, valuation debates (Bull/Bear cases), and community sentiment tracking
- July 9, 2025: Updated Pump.fun Dashboard with latest market analysis - Revenue down 86% from February highs, valuation multiple reduced to 5.59x, ICO raise reduced from $1B to $600M (15% of supply), updated tokenomics (33% ICO, 24% community), institutional skepticism from Dragonfly Capital, mixed community sentiment ("everyone complained but still aped in")
- July 14, 2025: Integrated Dune Analytics API for on-chain blockchain data querying - Added comprehensive service for Hyperliquid dashboard metrics from x3research, includes volume/liquidity metrics, user analytics, trading metrics, asset performance data, and custom query execution capabilities
- July 14, 2025: Enhanced README.md with comprehensive documentation including Dune Analytics integration guide, API endpoints documentation, and setup instructions for GitHub deployment
- July 16, 2025: Removed /hyperliquid-dune dashboard page per user request, maintaining Dune Analytics API integration for other dashboard features
- July 16, 2025: Enhanced interactive dashboard to display live CoinGecko pricing data with 24h price changes for all tokens in both grid and table views
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```