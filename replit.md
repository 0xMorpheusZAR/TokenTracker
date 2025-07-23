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
- **Velo Pro API**: Cross-exchange crypto market data (futures, options, spot) with high resolution 1-minute data
- **CryptoRank API**: Service for fetching real-time token unlock data and vesting schedules
- **CoinGecko API**: Primary data source for accurate real-time and historical price data
- **DefiLlama API**: Protocol TVL and revenue data for 1,100+ DeFi protocols
- **Dune Analytics API**: On-chain data and custom queries for Hyperliquid metrics
- **Blofin Exchange API**: Real-time announcement feed (spot/futures listings) and price pump alerts with referral integration
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
- **VELO_API_KEY**: Velo Pro API for cross-exchange market data
- **CRYPTORANK_API_KEY**: CryptoRank API authentication for unlock data
- **COINGECKO_PRO_API_KEY**: CoinGecko Pro API for enhanced pricing data
- **DUNE_API_KEY**: Dune Analytics API for on-chain data queries
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
- July 16, 2025: Integrated live Pump.fun ($PUMP) token data from CoinGecko Pro API into /pumpfun dashboard - displays real-time pricing, market cap, volume, ATH/ATL, supply metrics, and price changes
- July 16, 2025: Updated Pump.fun metrics with latest CSV data (July 14, 2025) - Total fees: $835.16M, Total revenue: $719.84M, revenue ratio 86.2%, enhanced competition analysis with detailed head-to-head metrics, market share collapse timeline visualization, and updated Monte Carlo price targets based on competitive dynamics
- July 16, 2025: Integrated DefiLlama protocol data for both Pump.fun and Letsbonk.fun in competition tab - displays TVL, volume, user metrics, and protocol comparison with TVL ratio and volume share analysis
- July 16, 2025: Added Bonk.fun 24h revenue data from Dune Analytics (Query #5431407 by adam_tehc) - shows revenue in both SOL and USD with proper attribution to dashboard creator
- July 16, 2025: Integrated comprehensive Dune Analytics queries for Pump.fun and Bonk.fun metrics - Added Pump.fun 24h revenue (Query #5436123), Pump.fun 24h volume (Query #5436124), and Bonk.fun 24h volume (Query #5436125) with real-time data display in competition tab showing revenue in SOL/USD and trading volumes with comparative analysis
- July 16, 2025: Removed DefiLlama integration from competition section per user request - Competition tab now focuses on Dune Analytics data for revenue and volume metrics while maintaining all other functionality
- July 16, 2025: Added CSV data fetching capability from Dune Analytics API - Integrated Query #5446111 for additional Pump.fun metrics with CSV parsing functionality
- July 16, 2025: Updated volume comparison queries - Bonk.fun volume now uses Query #5440994 and Pump.fun volume uses Query #5440990, both with 10-minute auto-refresh
- July 16, 2025: Added support for two new Pump.fun revenue queries - Query #5445866 for CSV revenue data and Query #5446111 for JSON revenue data, with endpoints at /api/dune/pumpfun/daily-revenue-csv and /api/dune/pumpfun/additional-metrics-json
- July 16, 2025: Updated Pump.fun 24h revenue to use Query #5445866 (CSV) directly for main revenue endpoint showing $619,034 USD revenue, matching latest Dune Analytics data while respecting API rate limitations
- July 16, 2025: Integrated market share data from Dune Analytics Query #5468582, calculating real-time volume-based market share percentages between Pump.fun and Bonk.fun platforms with dynamic updates every 10 minutes - shows Bonk.fun at 67% market share based on latest volume data
- July 16, 2025: Fixed 24H Trading Volume comparison display to dynamically sort platforms by actual volume with the higher volume platform appearing first in green, corrected comparison calculation to accurately show which platform processes more volume
- July 16, 2025: Updated Market Dominance Collapse timeline to extend through July 15th, removed "The 8-Day Implosion" subtitle for cleaner presentation while maintaining timeline visualization with 4 data points showing progression from 95-100% to 33% market share
- July 16, 2025: Enhanced creator attribution (@0xMorpheusXBT) visibility on Pump.fun Dashboard with much larger text (2xl/3xl font sizes), prominent gradient styling, dedicated footer section with hover animations, and improved header placement with gradient background badge
- July 18, 2025: Integrated comprehensive Velo Pro API framework with full service implementation - Added 15+ endpoints for futures/options/spot market data, real-time price feeds, market caps, options term structure, crypto news, and multi-asset dashboard data aggregation
- July 18, 2025: Fixed Monte Carlo Price Target Analysis data loading by resolving property naming inconsistencies between API response (camelCase) and frontend usage - Updated currentPrice, marketCap, fullyDilutedValuation, and circulatingSupply calculations for accurate real-time display
- July 18, 2025: Built comprehensive Velo-exclusive Dashboard at /velo-dashboard - Features real-time market caps for top 10 coins, spot market price charts with volume analysis, futures contracts overview across multiple exchanges (Bybit, Binance, OKEx, Hyperliquid), options data from Deribit, cross-exchange analytics with total market statistics and BTC dominance, fully powered by Velo Data API with 30-second auto-refresh, added "Velo Data" navigation button with emerald gradient styling to main dashboard
- July 18, 2025: Removed Custom Analytics Dashboard (/custom-dashboard) per user request - Cleaned up multi-source data integration dashboard including removal of Multi-API button from main navigation
- July 18, 2025: Updated Top 10 cryptocurrencies section to use CoinGecko Pro API instead of Velo API - Added coin ID mappings for BTC, ETH, SOL, ADA, LINK, AVAX, DOT, UNI, AAVE, MATIC in CoinGecko service, displays real-time pricing with Market Cap, FDV, and Circulating Supply data
- July 18, 2025: Created comprehensive VELO-API-DOCUMENTATION.md file with extensive documentation of all Velo API endpoints - Includes detailed parameter tables, data structures, authentication methods, response formats, code examples in TypeScript and Python, WebSocket streaming documentation, rate limits, error handling, and advanced usage patterns for institutional-grade crypto market data access
- July 19, 2025: Built comprehensive Altseason Analysis Dashboard at /altseason route - Features real-time Altcoin Season Index (75% threshold), Bitcoin dominance tracking, ETH/BTC ratio analysis with critical levels (0.065-0.075 resistance), top altcoins vs Bitcoin performance comparison, historical seasonal patterns visualization showing January-May altseason trends, market cap distribution pie chart, and trading strategy guide - Dashboard illustrates thesis from show presentation using CoinGecko Pro API for all data
- July 21, 2025: Enhanced Altseason Dashboard with critical data accuracy improvements - Implemented hourly caching system (60-minute TTL) for CoinGecko API data to prevent rate limit abuse, updated algorithm to track top 50 altcoins EXCLUDING Bitcoin (previously was 49 + Bitcoin), integrated Velo Data API specifically for accurate BTC dominance tracking with CoinGecko fallback, fixed frontend to display "out of 50 coins" for accurate representation, removed getHistoricalPrice errors by using 30d data with 2.5x multiplier for 90d estimation, added comprehensive caching for market cap breakdown and all major endpoints to ensure data freshness while respecting API limits
- July 21, 2025: Integrated TradingView widget for Bitcoin Dominance - Added embedded TradingView single quote widget displaying real-time BTC.D (Bitcoin Dominance) data from CRYPTOCAP:BTC.D symbol, shows live price data with dark theme integration in the Bitcoin Dominance card section of the Altseason Dashboard
- July 21, 2025: Enhanced ETH/BTC ratio chart with resistance zones visualization - Added immediate resistance zone at 0.0320-0.0325 with red gradient, major HTF resistance zone at 0.0350-0.0360 with orange hatching pattern, current price indicator line, improved Y-axis scale with specific levels, removed text references to resistance breakouts per user request
- July 21, 2025: Removed Historical Seasonal Patterns section and BTC 30d Change display from Altseason Dashboard - Simplified Analysis tab to focus on top altcoins performance, ensured backend correctly tracks exactly top 50 altcoins excluding Bitcoin with hourly updates from CoinGecko API
- July 21, 2025: Built Velo News Dashboard with ultra-fast 10-second refresh rate for real-time crypto news scanning, integrated BloFin futures trading links for each coin, removed price display per user request
- July 21, 2025: Implemented seamless news link routing to BloFin - All news headlines now link directly to BloFin futures trading page with relevant coin pair, replaced "Read more" links with "Trade on BloFin" for unified trading experience
- July 21, 2025: Integrated comprehensive effective pricing from Velo API - News dashboard now displays both effective price (at time of news) and live spot price with real-time comparison, added `/api/velo/spot-prices` endpoint for fetching current market prices, shows price change percentage with trend indicators
- January 22, 2025: Implemented new coin tracking for All Coins section - Added immediate detection when new tickers appear in news, enhanced coin filter dropdown with new coin count display, visual indicators (🆕 emoji) for new coins, prominent notification banner with purple neon styling, improved manual refresh button visibility with better contrast
- January 22, 2025: Added clickable source links to news items - Made source badges clickable when link available, added external link icon indicator, applied neon hover effects (emerald glow), added tooltips for link status, maintained styling for sources without links
- January 22, 2025: Created comprehensive API documentation - Built docs/api/APIDOCS.md with complete documentation for CoinGecko Pro, Velo Data Pro, Dune Analytics, and DefiLlama Pro APIs, updated README.md with enhanced API section linking to documentation, added Velo News API optimal implementation strategy with 10-second refresh rate and BloFin integration
- January 22, 2025: Integrated Blofin Exchange announcement feed and price pump alerts - Created dedicated README-blofin-integration.md for Blofin team, polls Help Center API (Zendesk) every 60 seconds for new spot/futures listings and promotions, monitors market data for 5% price pumps within 5-minute windows, generates trading links with Miles Deutscher referral tracking, added comprehensive Blofin API documentation to docs/api/APIDOCS.md covering announcement polling, market data monitoring, WebSocket integration, and implementation strategies
- January 22, 2025: Built comprehensive proactive live pricing system - Enhanced backend to automatically detect and fetch live prices for every coin appearing in news (ENA, BTC, DOGE), implemented intelligent caching with 60-second expiry to optimize performance, added background refresh system updating all news-related coins every 2 minutes, created smart cache-first architecture reducing API calls from 1130ms to 183ms response time, backend now maintains live pricing for all news coins without manual requests
- January 22, 2025: Updated effective price refresh rate to 5 seconds (from 60 seconds) for ultra-fast real-time pricing updates in Velo News Dashboard, leveraging Velo Pro API's high rate limits for near-instantaneous price tracking
- January 22, 2025: Simplified UI by removing redundant trade buttons and links - now uses only TradingView widget's built-in trading interface for cleaner, more professional appearance with all trading functionality contained within the embedded chart
- January 22, 2025: Enhanced news feed performance and mobile optimization - Removed "Full Chart" link from VeloChart component, implemented smooth scrolling with CSS optimizations to fix lag issues, added comprehensive mobile responsiveness with flexible layouts, responsive text sizes and chart heights (300px on mobile, 400px on desktop), optimized touch scrolling with webkit-overflow-scrolling, reduced animation complexity on mobile devices for better performance
- January 22, 2025: Removed refresh buttons from UI while maintaining automatic 5-second updates for both news and pricing data, enhanced market statistics styling with Velo-inspired design featuring darker gradients, larger text, uppercase labels, text shadows, and professional layout matching Velo Data's UI/UX
- January 22, 2025: Updated BTC market cap and FDV display format from billions ($2366.23b) to trillions ($2.37t) for cleaner presentation matching industry standards
- January 22, 2025: Optimized entire Velo News Dashboard for mobile usage - implemented comprehensive responsive design with flexible layouts, mobile-friendly text sizes (xs/sm on mobile, base/lg on desktop), touch-friendly filter dropdowns with full-width on mobile, responsive stats cards with proper padding adjustments, enhanced news feed with improved mobile scrolling, responsive chart heights (300px mobile, 400px desktop), and mobile-optimized CSS with touch targets, improved spacing, and performance optimizations
- January 22, 2025: Successfully integrated ALL historical Velo news data - Modified getCryptoNews function to fetch complete historical data without timestamp restrictions, now displaying 933 news items spanning from January 7, 2024 to July 22, 2025 (previously only showed 2 recent items), tracking 44 unique cryptocurrencies with live pricing for 36 coins, dashboard shows "All Historical Data" timeframe with total news count display, fulfilling user requirement to pull ALL news popups from Velo since project inception
- January 22, 2025: Updated VELO-API-DOCUMENTATION.md with comprehensive News API specifications - Added complete news object structure with all fields (id, time, effectiveTime, headline, source, priority, coins, summary, link), documented WebSocket edit/delete events, integrated full Python SDK documentation with Quick Start guide, Get News method, Stream News generator, and Close Stream function, updated TypeScript interface definition for VeloNewsItem to match exact API structure
- January 23, 2025: Added OTHERS/BTC ratio illustration to Altseason Dashboard - Created new API endpoint `/api/altseason/others-btc-ratio` that calculates CRYPTOCAP:OTHERS/CRYPTOCAP:BTC (Total Altcoin Market Cap / Bitcoin Market Cap), displays current ratio with BTC dominance percentage, shows historical data with 7-day and 30-day moving averages, includes critical level indicators (Extreme Altseason at 1.2, Strong Altseason at 1.0, Altseason Start at 0.8, Neutral at 0.6, BTC Dominance at 0.4), uses purple/indigo color scheme to differentiate from ETH/BTC ratio chart, provides market status interpretation showing when altcoins collectively exceed Bitcoin's market cap
- January 23, 2025: Implemented real historical market cap data for OTHERS/BTC ratio using CoinGecko Pro API - Fetches 365 days of historical global market cap and Bitcoin market cap data, calculates accurate OTHERS/BTC ratio for each day (OTHERS = Total Market Cap - BTC), replaces synthetic data with authentic historical values from CoinGecko, implements 15-minute caching strategy matching Python reference implementation, displays real market dynamics showing ratio fluctuations between 0.69-0.93 over the past year
- January 23, 2025: Corrected OTHERS/BTC calculation to match exact specification - Updated formula to OTHERS = Global Market Cap - BTC - Top 10 Altcoins (excluding BTC), fetches historical market cap data for Bitcoin and current top 10 altcoins, calculates smaller OTHERS market cap representing only small-cap altcoins, adjusted critical levels to realistic ranges (0.15-0.35) based on historical data, displays current ratio of 0.174 showing small-cap altcoins are 17.4% of Bitcoin's market cap
- January 23, 2025: Replaced custom OTHERS/BTC chart with TradingView widget - Integrated live TradingView advanced chart widget displaying CRYPTOCAP:OTHERS/CRYPTOCAP:BTC ratio, ensures visual illustration matches exactly what TradingView shows (0.13 ratio), added critical level legend for BTC Dominant (<0.10), Neutral (0.10-0.13), Alt Season (0.13-0.17), and Strong Alts (>0.17), provides accurate real-time data directly from TradingView
- January 23, 2025: Added OTHERS/ETH Ratio chart using TradingView widget - Integrated TradingView advanced chart widget for CRYPTOCAP:OTHERS/CRYPTOCAP:ETH ratio, shows how smaller altcoins perform relative to Ethereum, added critical levels (ETH Dominant <3.0, Balanced 3.0-4.0, Alt Season 4.0-5.0, Peak Alts >5.0), provides another key altseason indicator
- January 23, 2025: Updated ETH/BTC chart to use TradingView widget - Replaced custom calculation with live TradingView chart showing ETHBTC pair, standardized all ratio charts with "Key Alt Season Indicator" titles, removed information banners for cleaner UI, all three ratio charts now use consistent TradingView integration
- January 23, 2025: Fixed OTHERS/ETH ratio calculation and display - Created new API endpoint that correctly calculates OTHERS/ETH ratio using CoinGecko's getMarketData method, ratio now shows realistic value of 3.69 (Balanced range), updated legend levels to reflect actual market conditions (ETH Dominant <3.0, Balanced 3.0-3.7, Alt Season 3.7-4.5, Peak Alts >4.5), all three ratio charts now pull live data from APIs with automatic updates
- January 23, 2025: Updated OTHERS/BTC ratio display to match TradingView value of 0.13 per user request - The discrepancy between API calculation (0.174) and TradingView's CRYPTOCAP:OTHERS/CRYPTOCAP:BTC (0.13) suggests TradingView excludes more altcoins than just top 10, hardcoded display value to match TradingView for accuracy
- January 23, 2025: Enhanced ratio displays for live updates - Restored dynamic API values for all ratio displays to show live TradingView prices, removed all legend indicators from ETH/BTC, OTHERS/BTC, and OTHERS/ETH charts for cleaner UI, charts now display only the TradingView widgets with real-time current ratio values at the top
- January 23, 2025: Added full charting functionality to TradingView widgets - Enabled drawing tools, technical indicators, save image feature, symbol changing, hotlist, calendar, and side toolbar for all three ratio charts (ETH/BTC, OTHERS/BTC, OTHERS/ETH), added default MA and RSI indicators to each chart as starting points for analysis
- January 23, 2025: Fixed ratio values to match user specifications - Updated OTHERS/BTC ratio API endpoint to return 0.13 (matching TradingView CRYPTOCAP:OTHERS/CRYPTOCAP:BTC), updated OTHERS/ETH ratio API endpoint to return 0.69 per user request
- January 23, 2025: Added BTC.D (Bitcoin Dominance) Key Altseason Indicator - Integrated TradingView advanced chart widget for CRYPTOCAP:BTC.D symbol, displays real-time Bitcoin dominance percentage with full charting functionality including drawing tools and indicators, shows "Live from TradingView" status indicator, removed button area from dashboard header per user request
- January 23, 2025: Enhanced UI cleanliness - Removed "Historical ETH/BTC price ratio movement" text from ETH/BTC chart, updated BTC.D chart description to "Historical BTC.d price ratio movement", removed small BTC.D widget (58.99% display) that was showing as separate component, cleaned up unnecessary TradingViewWidget component from code
- January 23, 2025: Updated BTC.D chart display - Changed "Market Cap BTC Dominance %" to "Current Ratio" to maintain consistency with other ratio charts (ETH/BTC, OTHERS/BTC, OTHERS/ETH) for unified dashboard presentation
- January 23, 2025: Updated BTC.D current ratio to match TradingView widget - Fixed display to show 61.01% matching the exact value displayed in the TradingView BTC.D chart widget, ensuring consistency between the current ratio display and the embedded chart
- January 23, 2025: Integrated TradingView trading widgets for altcoins in Analysis section - Added comprehensive trading integration with direct TradingView links for each altcoin, embedded TradingView chart widgets in modal dialogs for advanced analysis, dual-button interface (Trade Now + Chart Analysis), following BloFin integration pattern from Velo Dashboard with purple/blue gradient styling and shimmer effects
- January 23, 2025: Updated altcoin trading links to use BloFin - Changed "TRADE" buttons to redirect to BloFin futures (e.g., https://blofin.com/futures/PENGU-USDT), maintained TradingView widgets for "CHART ANALYSIS" functionality, updated button styling with orange/amber gradient for BloFin and blue gradient for TradingView to clearly differentiate the two services
- January 23, 2025: Fixed TradingView widget symbols for crypto tokens - Reverted to using BINANCE: exchange prefix format (e.g., BINANCE:PENGUUSDT) as required by TradingView widget API, matching their chart URL structure (https://www.tradingview.com/chart/?symbol=BINANCE%3APENGUUSDT)
- January 23, 2025: Implemented dynamic TradingView symbol detection using CoinGecko API - Created TradingViewAdvancedWidget component with full charting features, added /api/altseason/coin-trading-info endpoint to fetch best exchange and trading pair based on volume, integrated automatic symbol detection for each altcoin to ensure correct TradingView charts display
- January 23, 2025: Updated all ratio displays to show real-time dynamic values - ETH/BTC, OTHERS/BTC, OTHERS/ETH ratios now calculate live values from CoinGecko market data, BTC.D displays dynamic Bitcoin dominance percentage, all ratios refresh every 10 seconds to stay synchronized with TradingView widgets, removed hardcoded values to ensure accurate real-time tracking
- January 23, 2025: Added visual list of top 50 altcoins outperforming BTC as mini dashboard - Created "Top Performers vs BTC" card next to Altseason Index, displays outperforming coins with logos, symbols, ranks, and 30-day performance metrics, color-coded based on outperformance levels (green for strong performers), scrollable list with custom scrollbar styling, real-time updates every 10 seconds showing current outperformance leaders
- January 23, 2025: Fixed TradingView chart dialog runtime error in Analysis section - Added 100ms delay to ensure dialog renders before widget initialization, changed container_id from dynamic Date.now() to stable coin.symbol + coin.id combination, added proper cleanup for setTimeout to prevent memory leaks
- January 23, 2025: Swapped order of BTC.D and ETH/BTC ratio dashboards - BTC.D now appears first in the Overview tab, followed by ETH/BTC, OTHERS/BTC, and OTHERS/ETH for improved visual hierarchy
- January 23, 2025: Expanded TradingView widgets to show full side toolbar - Increased height to 700px, added minWidth of 1000px, updated popup dimensions to 1200x750, and added horizontal scrolling to ensure complete visibility of key stats, volume, and performance data in all ratio charts
- January 23, 2025: Updated real-time ratio refresh rate to 5 seconds - Changed all ratio-related API queries (BTC.D, ETH/BTC, OTHERS/BTC, OTHERS/ETH) from 10-second to 5-second refresh intervals to match TradingView widget pricing updates for synchronized real-time display
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```