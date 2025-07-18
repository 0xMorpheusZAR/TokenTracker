import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cryptoRankService } from "./services/cryptorank";
import { coinGeckoService } from "./services/coingecko";
import { duneService } from "./services/dune";
import { whopService } from "./services/whop";
import { discordService } from "./services/discord";
import { defiLlamaService } from "./services/defillama";
import { veloService } from "./services/velo";
import { insertTokenSchema, insertUnlockEventSchema, insertPriceHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tokens with real-time CoinGecko data
  app.get("/api/tokens", async (req, res) => {
    try {
      const baseTokens = await storage.getAllTokens();
      
      // Get enhanced data from CoinGecko Pro API
      const symbols = baseTokens.map(token => token.symbol);
      const detailedData = await coinGeckoService.getDetailedTokenData(symbols);
      
      if (detailedData && Array.isArray(detailedData)) {
        // Merge base token data with real-time CoinGecko data
        const enhancedTokens = baseTokens.map(token => {
          const liveData = detailedData.find(cgToken => 
            cgToken.symbol?.toUpperCase() === token.symbol ||
            cgToken.name?.toLowerCase().includes(token.name.toLowerCase())
          );
          
          if (liveData) {
            const circulatingSupply = liveData.circulating_supply || 0;
            const totalSupply = liveData.total_supply || liveData.max_supply || 0;
            const circulatingSupplyPercentage = totalSupply > 0 ? (circulatingSupply / totalSupply) * 100 : 0;
            
            return {
              ...token,
              currentPrice: liveData.current_price || parseFloat(token.currentPrice),
              currentPriceFormatted: liveData.current_price?.toFixed(6) || token.currentPrice,
              marketCap: liveData.market_cap || 0,
              volume24h: liveData.total_volume || 0,
              priceChange24h: liveData.price_change_percentage_24h || 0,
              priceChange7d: liveData.price_change_percentage_7d || 0,
              priceChange30d: liveData.price_change_percentage_30d || 0,
              ath: liveData.ath || parseFloat(token.currentPrice),
              athDate: liveData.ath_date || token.listingDate,
              athDeclinePercent: liveData.ath && liveData.current_price ? 
                (((liveData.ath - liveData.current_price) / liveData.ath) * 100).toFixed(1) :
                token.athDeclinePercent,
              circulatingSupply: circulatingSupply,
              totalSupply: totalSupply,
              maxSupply: liveData.max_supply || 0,
              fdv: liveData.fully_diluted_valuation || 0,
              circulatingSupplyPercentage: circulatingSupplyPercentage,
              lastUpdated: new Date().toISOString(),
              // Recalculate performance with real current price
              performancePercent: liveData.current_price ? 
                (((liveData.current_price - parseFloat(token.listingPrice)) / parseFloat(token.listingPrice)) * 100).toFixed(1) :
                token.performancePercent,
              // Add HIGH FDV flag
              isHighFdv: liveData.fully_diluted_valuation > 1000000000 || token.peakFdv.includes('B')
            };
          }
          return token;
        });
        
        res.json(enhancedTokens);
      } else {
        // Fallback to base data if CoinGecko fails
        res.json(baseTokens);
      }
    } catch (error) {
      console.error("Failed to fetch enhanced tokens:", error);
      // Fallback to base data
      const tokens = await storage.getAllTokens();
      res.json(tokens);
    }
  });

  // Get top failures (must come before /:id route)
  app.get("/api/tokens/top-failures", async (req, res) => {
    try {
      const topFailures = await storage.getTopFailures();
      res.json(topFailures);
    } catch (error) {
      console.error("Error fetching top failures:", error);
      res.status(500).json({ error: "Failed to fetch top failures" });
    }
  });

  // Get token by ID
  app.get("/api/tokens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const token = await storage.getTokenById(id);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch token" });
    }
  });

  // Get unlock events for a token
  app.get("/api/tokens/:id/unlocks", async (req, res) => {
    try {
      const tokenId = parseInt(req.params.id);
      const unlocks = await storage.getUnlockEventsByTokenId(tokenId);
      res.json(unlocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unlock events" });
    }
  });

  // Get price history for a token
  app.get("/api/tokens/:id/price-history", async (req, res) => {
    try {
      const tokenId = parseInt(req.params.id);
      const priceHistory = await storage.getPriceHistoryByTokenId(tokenId);
      res.json(priceHistory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  // Get upcoming unlocks
  app.get("/api/unlocks/upcoming", async (req, res) => {
    try {
      const upcomingUnlocks = await storage.getUpcomingUnlocks();
      res.json(upcomingUnlocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming unlocks" });
    }
  });

  // CryptoRank API integration endpoints
  app.get("/api/cryptorank/unlocks/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const unlockData = await cryptoRankService.getTokenUnlocks(symbol);
      
      if (!unlockData) {
        return res.status(404).json({ error: "Unlock data not found" });
      }
      
      res.json(unlockData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unlock data from CryptoRank" });
    }
  });

  app.get("/api/cryptorank/price/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { days = 365 } = req.query;
      const priceData = await cryptoRankService.getTokenPriceHistory(symbol, Number(days));
      
      if (!priceData) {
        return res.status(404).json({ error: "Price data not found" });
      }
      
      res.json(priceData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price data from CryptoRank" });
    }
  });

  app.get("/api/cryptorank/vesting/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const vestingData = await cryptoRankService.getVestingSchedule(symbol);
      
      if (!vestingData) {
        return res.status(404).json({ error: "Vesting data not found" });
      }
      
      res.json(vestingData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vesting data from CryptoRank" });
    }
  });

  // Get CryptoRank connection status
  app.get("/api/cryptorank/status", async (req, res) => {
    try {
      const isConnected = cryptoRankService.isConnected();
      res.json({ 
        connected: isConnected,
        endpoint: "https://api.cryptorank.io/v2",
        documentation: "https://api.cryptorank.io/v2/docs"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check CryptoRank status" });
    }
  });

  // CoinGecko API integration endpoints
  app.get("/api/coingecko/prices", async (req, res) => {
    try {
      const tokens = await storage.getAllTokens();
      const symbols = tokens.map(token => token.symbol);
      const priceData = await coinGeckoService.getCurrentPrices(symbols);
      
      if (!priceData) {
        return res.status(404).json({ error: "Price data not found" });
      }
      
      res.json(priceData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prices from CoinGecko" });
    }
  });

  app.get("/api/coingecko/market/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const marketData = await coinGeckoService.getMarketData([symbol]);
      
      if (!marketData || marketData.length === 0) {
        return res.status(404).json({ error: "Market data not found" });
      }
      
      res.json(marketData[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market data from CoinGecko" });
    }
  });

  app.get("/api/coingecko/history/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { days = 365 } = req.query;
      const historyData = await coinGeckoService.getTokenHistory(symbol, Number(days));
      
      if (!historyData) {
        return res.status(404).json({ error: "History data not found" });
      }
      
      res.json(historyData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history data from CoinGecko" });
    }
  });

  app.get("/api/coingecko/details/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const details = await coinGeckoService.getTokenDetails(symbol);
      
      if (!details) {
        return res.status(404).json({ error: "Token details not found" });
      }
      
      res.json(details);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch token details from CoinGecko" });
    }
  });

  // Get CoinGecko connection status
  app.get("/api/coingecko/status", async (req, res) => {
    try {
      const status = coinGeckoService.getConnectionStatus();
      res.json({
        ...status,
        endpoint: status.tier === 'Pro' ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3",
        documentation: "https://www.coingecko.com/en/api/documentation"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check CoinGecko status" });
    }
  });

  // Get trending coins for news feed
  app.get("/api/coingecko/trending", async (req, res) => {
    try {
      const trending = await coinGeckoService.getTrending();
      res.json(trending);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
      res.status(500).json({ error: 'Failed to fetch trending coins' });
    }
  });

  // Get global market data for insights
  app.get("/api/coingecko/global", async (req, res) => {
    try {
      const globalData = await coinGeckoService.getGlobalData();
      res.json(globalData);
    } catch (error) {
      console.error('Failed to fetch global data:', error);
      res.status(500).json({ error: 'Failed to fetch global market data' });
    }
  });

  // Enhanced CoinGecko routes with Pro API features
  app.get("/api/coingecko/detailed", async (req, res) => {
    try {
      const symbols = ['PORTAL', 'STRK', 'AEVO', 'PIXEL', 'SAGA', 'REZ', 'MANTA', 'ALT', 'ENA', 'OMNI', 'HYPE'];
      const detailedData = await coinGeckoService.getDetailedTokenData(symbols);
      
      if (!detailedData) {
        return res.status(500).json({ error: "Failed to fetch detailed data" });
      }
      
      res.json(detailedData);
    } catch (error) {
      console.error("Failed to fetch detailed token data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get top 100 altcoins with drawdown data
  app.get("/api/coingecko/top100", async (req, res) => {
    try {
      const top100Data = await coinGeckoService.getTop100Altcoins();
      
      if (!top100Data) {
        return res.status(500).json({ error: "Failed to fetch top 100 altcoins" });
      }
      
      res.json(top100Data);
    } catch (error) {
      console.error("Failed to fetch top 100 altcoins:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Pump.fun token data endpoint
  app.get("/api/coingecko/pump", async (req, res) => {
    try {
      const pumpData = await coinGeckoService.getDetailedTokenData(['PUMP']);
      
      if (!pumpData || pumpData.length === 0) {
        return res.status(404).json({ error: "Pump.fun token not found" });
      }
      
      // Get additional Pump.fun details
      const tokenDetails = await coinGeckoService.getTokenDetails('PUMP');
      
      // Extract relevant data for the dashboard
      const pumpToken = pumpData[0];
      
      res.json({
        id: pumpToken.id,
        symbol: pumpToken.symbol,
        name: pumpToken.name,
        currentPrice: pumpToken.current_price,
        marketCap: pumpToken.market_cap,
        marketCapRank: pumpToken.market_cap_rank,
        fullyDilutedValuation: pumpToken.fully_diluted_valuation,
        totalVolume: pumpToken.total_volume,
        priceChange24h: pumpToken.price_change_percentage_24h,
        priceChange7d: pumpToken.price_change_percentage_7d,
        priceChange30d: pumpToken.price_change_percentage_30d,
        priceChange1y: pumpToken.price_change_percentage_1y,
        ath: pumpToken.ath,
        athChangePercentage: pumpToken.ath_change_percentage,
        athDate: pumpToken.ath_date,
        atl: pumpToken.atl,
        atlChangePercentage: pumpToken.atl_change_percentage,
        atlDate: pumpToken.atl_date,
        circulatingSupply: pumpToken.circulating_supply,
        totalSupply: pumpToken.total_supply,
        maxSupply: pumpToken.max_supply,
        sparklineData: pumpToken.sparkline_in_7d,
        lastUpdated: pumpToken.last_updated,
        details: tokenDetails || {}
      });
    } catch (error) {
      console.error("Failed to fetch Pump.fun data:", error);
      res.status(500).json({ error: "Failed to fetch Pump.fun data" });
    }
  });

  // EstateX live data endpoint
  app.get("/api/estatex/live", async (req, res) => {
    try {
      const estatexData = await coinGeckoService.getTokenDetails('estatex');
      
      if (!estatexData) {
        return res.status(500).json({ error: "Failed to fetch EstateX data" });
      }
      
      // Use real market data from CoinGecko Pro or latest known values
      const currentPrice = estatexData.market_data?.current_price?.usd || 0.02558;
      const maxSupply = estatexData.market_data?.max_supply || 6300000000; // 6.3 billion
      
      const liveData = {
        symbol: 'ESX',
        name: 'EstateX',
        currentPrice: currentPrice,
        marketCap: estatexData.market_data?.market_cap?.usd || 0, // Not disclosed
        fullyDilutedValuation: estatexData.market_data?.fully_diluted_valuation?.usd || (currentPrice * maxSupply), // $86.02M
        circulatingSupply: estatexData.market_data?.circulating_supply || 0, // Not disclosed
        totalSupply: estatexData.market_data?.total_supply || 0,
        maxSupply: maxSupply,
        volume24h: estatexData.market_data?.total_volume?.usd || 5540000, // $5.54M from search
        priceChange24h: estatexData.market_data?.price_change_percentage_24h || 58.00, // +58% from search
        priceChange7d: estatexData.market_data?.price_change_percentage_7d || 283.50, // +283.5% from search
        priceChange30d: estatexData.market_data?.price_change_percentage_30d || 0,
        ath: estatexData.market_data?.ath?.usd || 0.02612, // ATH from search
        athDate: estatexData.market_data?.ath_date?.usd || '2025-06-25',
        athChangePercentage: estatexData.market_data?.ath_change_percentage?.usd || -2.40,
        atl: estatexData.market_data?.atl?.usd || 0,
        atlDate: estatexData.market_data?.atl_date?.usd || '',
        tgeData: {
          launchDate: '2025-06-20',
          launchPrice: 0.00295,
          initialMarketCap: 350000,
          initialCirculatingSupply: 118644068,
          percentageFromTGE: ((currentPrice - 0.00295) / 0.00295 * 100)
        }
      };
      
      res.json(liveData);
    } catch (error) {
      console.error("Failed to fetch EstateX data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/hyperliquid/comprehensive", async (req, res) => {
    try {
      const hypeData = await coinGeckoService.getHyperliquidData();
      
      // Get real-time Hyperliquid data from CoinGecko or use enhanced fallback
      const enhancedData = {
        basicData: hypeData || {},
        realTimeMetrics: {
          currentPrice: hypeData?.market_data?.current_price?.usd || 36.50,
          marketCap: hypeData?.market_data?.market_cap?.usd || 12070000000,
          volume24h: hypeData?.market_data?.total_volume?.usd || 850000000,
          priceChange24h: hypeData?.market_data?.price_change_percentage_24h || 5.2,
          priceChange7d: hypeData?.market_data?.price_change_percentage_7d || 15.8,
          priceChange30d: hypeData?.market_data?.price_change_percentage_30d || 890.3,
          priceChangeSinceLaunch: 1029.5, // +1029.5%
          ath: hypeData?.market_data?.ath?.usd || 38.00,
          athChangePercentage: hypeData?.market_data?.ath_change_percentage?.usd || -3.9,
          circulatingSupply: hypeData?.market_data?.circulating_supply || 330700000,
          totalSupply: hypeData?.market_data?.total_supply || 1000000000,
          maxSupply: hypeData?.market_data?.max_supply || 1000000000,
          fdv: 36500000000, // Fully diluted valuation
        },
        fundamentals: {
          launchDate: "2024-11-29",
          listingPrice: 3.90,
          annualRevenue: 1150000000, // $1.15B verified revenue
          monthlyRevenue: 95833333, // $95.8M monthly
          activeUsers: 190000,
          dailyActiveUsers: 45000,
          dailyVolume: 2800000000, // $2.8B daily volume
          avgDailyVolume30d: 2100000000, // $2.1B 30-day avg
          tvl: 1270000000, // $1.27B TVL
          launchFloat: 33.39, // 33.39% - significantly higher than failures
          currentFloat: 33.07, // Current float percentage
        },
        tokenomics: {
          initialCirculatingSupply: 333900000, // 33.39%
          currentCirculatingSupply: 330700000,
          teamAllocation: 23, // 23% to team
          communityAllocation: 77, // 77% to community
          vestingSchedule: "4-year linear vesting for team allocation",
          unlockSchedule: "No major unlocks scheduled - mostly in circulation",
          fairLaunch: true,
          premine: false,
          noPrivateSale: true,
          airdropAmount: 31, // 31% airdrop to users
        },
        businessModel: {
          revenueStreams: [
            "Trading fees (0.02-0.05%)",
            "Liquidation fees", 
            "Funding payments",
            "Market making rebates"
          ],
          revenueModel: "Direct trading revenue from DEX operations",
          profitability: true,
          revenueGrowth: "275% QoQ growth",
          operatingMargin: "~85%",
          cashFlow: "Positive and growing"
        },
        competitiveAdvantages: {
          realRevenue: true,
          realUsers: true,
          realProduct: true,
          fairDistribution: true,
          noVCDumping: true,
          transparentTokenomics: true,
          workingProduct: "Fully functional perpetual DEX",
          marketFit: "Clear product-market fit demonstrated"
        },
        comparisons: {
          avgFailedTokenFloat: 13.2,
          avgFailedTokenPerformance: -95.2,
          avgFailedTokenRevenue: 0,
          avgFailedTokenUsers: 0,
          hypeFloatAdvantage: "2.5x higher initial circulation than failures",
          performanceAdvantage: "+1029% vs -95% average for low-float tokens",
          revenueAdvantage: "$1.15B revenue vs $0 for failed tokens",
          userAdvantage: "190K+ real users vs artificial metrics"
        },
        riskFactors: {
          regulatoryRisk: "Medium - DeFi regulatory environment",
          competitionRisk: "Medium - competitive DEX landscape", 
          technicalRisk: "Low - battle-tested infrastructure",
          tokenDilution: "Low - most tokens already in circulation",
          teamRisk: "Low - proven team with working product"
        },
        successMetrics: {
          pricePerformance: "+1029% since launch",
          volumeGrowth: "Consistent $2-3B daily volume",
          userGrowth: "190K+ active users and growing",
          revenueGrowth: "275% quarter-over-quarter",
          marketShare: "Top 3 perpetual DEX by volume",
          tokenUtility: "Required for trading rebates and governance"
        }
      };
      
      res.json(enhancedData);
    } catch (error) {
      console.error("Failed to fetch Hyperliquid comprehensive data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard analytics
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const tokens = await storage.getAllTokens();
      
      const totalTokens = tokens.length;
      const averageLoss = tokens.reduce((sum, token) => sum + parseFloat(token.performancePercent), 0) / totalTokens;
      const totalMarketCapLost = tokens.reduce((sum, token) => {
        const fdvNumber = parseFloat(token.peakFdv.replace(/[$B]/g, ''));
        const lossPercent = Math.abs(parseFloat(token.performancePercent)) / 100;
        return sum + (fdvNumber * lossPercent);
      }, 0);
      const averageInitialFloat = tokens.reduce((sum, token) => sum + parseFloat(token.initialFloat), 0) / totalTokens;

      res.json({
        totalTokens,
        averageLoss: averageLoss.toFixed(1),
        totalMarketCapLost: `$${totalMarketCapLost.toFixed(1)}B`,
        averageInitialFloat: averageInitialFloat.toFixed(1),
        failureRate: "100"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  // Dune Analytics API routes
  app.get("/api/dune/protocols", async (req, res) => {
    try {
      const protocolData = await duneService.getProtocolRevenueData();
      
      if (!protocolData) {
        return res.status(500).json({ error: "Failed to fetch protocol data from Dune" });
      }
      
      res.json(protocolData);
    } catch (error) {
      console.error("Failed to fetch Dune protocol data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dune/status", async (req, res) => {
    try {
      const status = duneService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to check Dune status" });
    }
  });

  app.get("/api/dune/query/:queryId", async (req, res) => {
    try {
      const queryId = parseInt(req.params.queryId);
      const limit = parseInt(req.query.limit as string) || 1000;
      
      const queryResult = await duneService.getQueryResults(queryId, limit);
      
      if (!queryResult) {
        return res.status(500).json({ error: "Failed to fetch query results" });
      }
      
      res.json(queryResult);
    } catch (error) {
      console.error("Failed to fetch Dune query:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Discord Authentication Routes
  app.get("/api/auth/discord", async (req, res) => {
    try {
      // Generate CSRF state token
      const state = Math.random().toString(36).substring(7);
      
      // Store state in session for verification
      req.session.discordState = state;
      
      // Get Discord OAuth URL
      const authUrl = discordService.getAuthorizationUrl(state);
      
      res.json({ authUrl });
    } catch (error) {
      console.error("Failed to generate Discord auth URL:", error);
      res.status(500).json({ error: "Failed to generate authentication URL" });
    }
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      // Verify state for CSRF protection
      if (!state || state !== req.session.discordState) {
        return res.status(400).json({ error: "Invalid state parameter" });
      }
      
      // Clear state from session
      delete req.session.discordState;
      
      if (!code) {
        return res.status(400).json({ error: "No authorization code provided" });
      }
      
      // Exchange code for token
      const tokenData = await discordService.exchangeCodeForToken(code as string);
      if (!tokenData) {
        return res.status(500).json({ error: "Failed to exchange code for token" });
      }
      
      // Get user info
      const discordUser = await discordService.getUserInfo(tokenData.access_token);
      if (!discordUser) {
        return res.status(500).json({ error: "Failed to get Discord user info" });
      }
      
      // Check Miles High Club membership via Whop
      const membership = await whopService.checkMembership(discordUser.id);
      
      // Store auth data in session
      req.session.discordAuth = {
        user: discordUser,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        hasMHCMembership: !!membership,
        membershipDetails: membership
      };
      
      // Redirect to dashboard with success
      res.redirect("/?auth=success");
    } catch (error) {
      console.error("Discord auth callback error:", error);
      res.redirect("/?auth=error");
    }
  });

  app.get("/api/auth/status", async (req, res) => {
    try {
      const discordAuth = req.session.discordAuth;
      
      if (!discordAuth) {
        return res.json({ authenticated: false });
      }
      
      // Check if token is expired
      if (Date.now() > discordAuth.expiresAt) {
        // Try to refresh token
        const newToken = await discordService.refreshAccessToken(discordAuth.refreshToken);
        if (newToken) {
          req.session.discordAuth = {
            ...discordAuth,
            accessToken: newToken.access_token,
            refreshToken: newToken.refresh_token,
            expiresAt: Date.now() + (newToken.expires_in * 1000)
          };
        } else {
          delete req.session.discordAuth;
          return res.json({ authenticated: false });
        }
      }
      
      res.json({
        authenticated: true,
        user: {
          id: discordAuth.user.id,
          username: discordAuth.user.username,
          avatar: discordAuth.user.avatar,
          globalName: discordAuth.user.global_name
        },
        hasMHCMembership: discordAuth.hasMHCMembership,
        membershipDetails: discordAuth.membershipDetails
      });
    } catch (error) {
      console.error("Failed to check auth status:", error);
      res.status(500).json({ error: "Failed to check authentication status" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      delete req.session.discordAuth;
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to logout:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  app.get("/api/auth/verify-membership", async (req, res) => {
    try {
      const discordAuth = req.session.discordAuth;
      
      if (!discordAuth) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Re-check membership status
      const membership = await whopService.checkMembership(discordAuth.user.id);
      
      // Update session
      req.session.discordAuth.hasMHCMembership = !!membership;
      req.session.discordAuth.membershipDetails = membership;
      
      res.json({
        hasMembership: !!membership,
        membershipDetails: membership
      });
    } catch (error) {
      console.error("Failed to verify membership:", error);
      res.status(500).json({ error: "Failed to verify membership" });
    }
  });

  // Service status endpoints
  app.get("/api/services/status", async (req, res) => {
    try {
      res.json({
        coingecko: coinGeckoService.getConnectionStatus(),
        cryptorank: { connected: cryptoRankService.isConnected() },
        dune: duneService.getConnectionStatus(),
        discord: discordService.getConnectionStatus(),
        whop: whopService.getConnectionStatus(),
        defillama: defiLlamaService.getConnectionStatus()
      });
    } catch (error) {
      console.error("Failed to check services status:", error);
      res.status(500).json({ error: "Failed to check services status" });
    }
  });

  // DefiLlama Revenue Analytics endpoints
  app.get("/api/defillama/protocol-revenues", async (req, res) => {
    try {
      const revenues = await defiLlamaService.getProtocolRevenues();
      if (!revenues) {
        return res.status(500).json({ error: "Failed to fetch protocol revenues" });
      }
      res.json(revenues);
    } catch (error) {
      console.error("Failed to fetch protocol revenues:", error);
      res.status(500).json({ error: "Failed to fetch protocol revenues" });
    }
  });

  app.get("/api/defillama/category-revenues", async (req, res) => {
    try {
      const categoryRevenues = await defiLlamaService.getCategoryRevenues();
      if (!categoryRevenues) {
        return res.status(500).json({ error: "Failed to fetch category revenues" });
      }
      res.json(categoryRevenues);
    } catch (error) {
      console.error("Failed to fetch category revenues:", error);
      res.status(500).json({ error: "Failed to fetch category revenues" });
    }
  });

  app.get("/api/defillama/chain-revenues", async (req, res) => {
    try {
      const chainRevenues = await defiLlamaService.getChainRevenues();
      if (!chainRevenues) {
        return res.status(500).json({ error: "Failed to fetch chain revenues" });
      }
      res.json(chainRevenues);
    } catch (error) {
      console.error("Failed to fetch chain revenues:", error);
      res.status(500).json({ error: "Failed to fetch chain revenues" });
    }
  });

  app.get("/api/defillama/protocol/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const details = await defiLlamaService.getProtocolDetails(id);
      if (!details) {
        return res.status(404).json({ error: "Protocol not found" });
      }
      res.json(details);
    } catch (error) {
      console.error("Failed to fetch protocol details:", error);
      res.status(500).json({ error: "Failed to fetch protocol details" });
    }
  });

  app.get("/api/defillama/active-users", async (req, res) => {
    try {
      const users = await defiLlamaService.getActiveUsers();
      if (!users) {
        return res.status(500).json({ error: "Failed to fetch active users" });
      }
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch active users:", error);
      res.status(500).json({ error: "Failed to fetch active users" });
    }
  });

  // Dune Analytics endpoints
  app.get("/api/dune/status", async (req, res) => {
    try {
      const status = duneService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      console.error("Failed to check Dune status:", error);
      res.status(500).json({ error: "Failed to check Dune status" });
    }
  });

  app.get("/api/dune/hyperliquid/all", async (req, res) => {
    try {
      const data = await duneService.getAllHyperliquidData();
      if (!data) {
        return res.status(500).json({ error: "Failed to fetch Hyperliquid data" });
      }
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch all Hyperliquid data:", error);
      res.status(500).json({ error: "Failed to fetch Hyperliquid data" });
    }
  });

  app.get("/api/dune/hyperliquid/:metric", async (req, res) => {
    try {
      const { metric } = req.params;
      const data = await duneService.getHyperliquidMetric(metric.toUpperCase() as any);
      if (!data) {
        return res.status(404).json({ error: "Metric not found" });
      }
      res.json(data);
    } catch (error) {
      console.error(`Failed to fetch Hyperliquid metric ${req.params.metric}:`, error);
      res.status(500).json({ error: "Failed to fetch metric data" });
    }
  });

  app.get("/api/dune/query/:queryId/latest", async (req, res) => {
    try {
      const { queryId } = req.params;
      const data = await duneService.getLatestResults(parseInt(queryId));
      if (!data) {
        return res.status(404).json({ error: "Query not found or no data available" });
      }
      res.json(data);
    } catch (error) {
      console.error(`Failed to fetch query ${req.params.queryId} results:`, error);
      res.status(500).json({ error: "Failed to fetch query results" });
    }
  });

  app.get("/api/dune/bonkfun/revenue", async (req, res) => {
    try {
      const revenueData = await duneService.getBonkfunRevenue24h();
      if (!revenueData) {
        return res.status(500).json({ error: "Failed to fetch Bonk.fun revenue data" });
      }
      res.json({
        ...revenueData,
        source: "Dune Analytics",
        creator: "adam_tehc",
        dashboard: "https://dune.com/adam_tehc"
      });
    } catch (error) {
      console.error("Failed to fetch Bonk.fun revenue:", error);
      res.status(500).json({ error: "Failed to fetch revenue data" });
    }
  });

  app.get("/api/dune/pumpfun/revenue", async (req, res) => {
    try {
      const revenueData = await duneService.getPumpfunRevenue24h();
      if (!revenueData) {
        return res.status(500).json({ error: "Failed to fetch Pump.fun revenue data" });
      }
      res.json({
        ...revenueData,
        source: "Dune Analytics"
      });
    } catch (error) {
      console.error("Failed to fetch Pump.fun revenue:", error);
      res.status(500).json({ error: "Failed to fetch revenue data" });
    }
  });

  app.get("/api/dune/pumpfun/volume", async (req, res) => {
    try {
      const volumeData = await duneService.getPumpfunVolume24h();
      if (!volumeData) {
        return res.status(500).json({ error: "Failed to fetch Pump.fun volume data" });
      }
      res.json({
        ...volumeData,
        source: "Dune Analytics"
      });
    } catch (error) {
      console.error("Failed to fetch Pump.fun volume:", error);
      res.status(500).json({ error: "Failed to fetch volume data" });
    }
  });

  app.get("/api/dune/bonkfun/volume", async (req, res) => {
    try {
      const volumeData = await duneService.getBonkfunVolume24h();
      if (!volumeData) {
        return res.status(500).json({ error: "Failed to fetch Bonk.fun volume data" });
      }
      res.json({
        ...volumeData,
        source: "Dune Analytics"
      });
    } catch (error) {
      console.error("Failed to fetch Bonk.fun volume:", error);
      res.status(500).json({ error: "Failed to fetch volume data" });
    }
  });

  app.get("/api/dune/pumpfun/additional-metrics", async (req, res) => {
    try {
      const metricsData = await duneService.getAdditionalMetrics();
      if (!metricsData) {
        return res.status(500).json({ error: "Failed to fetch additional metrics data" });
      }
      res.json({
        data: metricsData,
        source: "Dune Analytics",
        queryId: 5446111
      });
    } catch (error) {
      console.error("Failed to fetch additional metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics data" });
    }
  });

  app.get("/api/dune/pumpfun/daily-revenue-csv", async (req, res) => {
    try {
      const revenueData = await duneService.getDailyRevenueCSV();
      if (!revenueData) {
        return res.status(500).json({ error: "Failed to fetch daily revenue CSV data" });
      }
      res.json({
        data: revenueData,
        source: "Dune Analytics",
        queryId: 5445866
      });
    } catch (error) {
      console.error("Failed to fetch daily revenue CSV:", error);
      res.status(500).json({ error: "Failed to fetch revenue data" });
    }
  });

  app.get("/api/dune/pumpfun/additional-metrics-json", async (req, res) => {
    try {
      const metricsData = await duneService.getAdditionalMetricsJSON();
      if (!metricsData) {
        return res.status(500).json({ error: "Failed to fetch additional metrics JSON data" });
      }
      res.json({
        data: metricsData,
        source: "Dune Analytics",
        queryId: 5446111
      });
    } catch (error) {
      console.error("Failed to fetch additional metrics JSON:", error);
      res.status(500).json({ error: "Failed to fetch metrics data" });
    }
  });

  app.get("/api/dune/graduation-rates", async (req, res) => {
    try {
      const graduationData = await duneService.getGraduationRates();
      if (!graduationData) {
        return res.status(500).json({ error: "Failed to fetch graduation rates data" });
      }
      res.json({
        data: graduationData,
        source: "Dune Analytics",
        queryId: 5129526
      });
    } catch (error) {
      console.error("Failed to fetch graduation rates:", error);
      res.status(500).json({ error: "Failed to fetch graduation rates data" });
    }
  });

  app.get("/api/dune/market-share", async (req, res) => {
    try {
      const marketShareData = await duneService.getMarketShare();
      if (!marketShareData) {
        return res.status(500).json({ error: "Failed to fetch market share data" });
      }
      res.json({
        data: marketShareData,
        source: "Dune Analytics",
        queryId: 5468582
      });
    } catch (error) {
      console.error("Failed to fetch market share:", error);
      res.status(500).json({ error: "Failed to fetch market share data" });
    }
  });

  app.post("/api/dune/query/:queryId/execute", async (req, res) => {
    try {
      const { queryId } = req.params;
      const { waitForResults } = req.body;
      
      if (waitForResults) {
        const data = await duneService.executeAndWaitForResults(parseInt(queryId));
        if (!data) {
          return res.status(500).json({ error: "Query execution failed" });
        }
        res.json(data);
      } else {
        const executionId = await duneService.executeQuery(parseInt(queryId));
        if (!executionId) {
          return res.status(500).json({ error: "Failed to execute query" });
        }
        res.json({ executionId });
      }
    } catch (error) {
      console.error(`Failed to execute query ${req.params.queryId}:`, error);
      res.status(500).json({ error: "Failed to execute query" });
    }
  });

  // ====================
  // VELO API ENDPOINTS
  // ====================

  // Velo status and health check
  app.get("/api/velo/status", async (req, res) => {
    try {
      const status = await veloService.getStatus();
      res.json({
        ...status,
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error("Failed to fetch Velo status:", error);
      res.status(500).json({ error: "Failed to fetch Velo status" });
    }
  });

  // Get supported products and exchanges
  app.get("/api/velo/products", async (req, res) => {
    try {
      const { type } = req.query;
      
      let products;
      switch (type) {
        case 'futures':
          products = await veloService.getFuturesContracts();
          break;
        case 'options':
          products = await veloService.getOptionsContracts();
          break;
        case 'spot':
          products = await veloService.getSpotPairs();
          break;
        default:
          return res.status(400).json({ error: "Type parameter required (futures, options, or spot)" });
      }

      res.json({
        data: products,
        type,
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error(`Failed to fetch ${req.query.type} products:`, error);
      res.status(500).json({ error: `Failed to fetch ${req.query.type} products` });
    }
  });

  // Market data endpoint
  app.get("/api/velo/market-data", async (req, res) => {
    try {
      const {
        type,
        exchanges,
        products,
        coins,
        columns,
        begin,
        end,
        resolution = '1h'
      } = req.query;

      if (!type) {
        return res.status(400).json({ error: "Type parameter required (futures, options, or spot)" });
      }

      const params: any = {
        type: type as string,
        resolution: resolution as string
      };

      if (exchanges) params.exchanges = (exchanges as string).split(',');
      if (products) params.products = (products as string).split(',');
      if (coins) params.coins = (coins as string).split(',');
      if (columns) params.columns = (columns as string).split(',');
      if (begin) params.begin = parseInt(begin as string);
      if (end) params.end = parseInt(end as string);

      const csvData = await veloService.getMarketData(params);
      const parsedData = veloService.parseMarketDataCSV(csvData);

      res.json({
        data: parsedData,
        raw_csv: csvData,
        parameters: params,
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // Market caps for multiple coins
  app.get("/api/velo/market-caps", async (req, res) => {
    try {
      const { coins } = req.query;
      
      if (!coins) {
        return res.status(400).json({ error: "Coins parameter required (comma-separated)" });
      }

      const coinsList = (coins as string).split(',');
      const csvData = await veloService.getMarketCaps(coinsList);
      const parsedData = veloService.parseMarketCapsCSV(csvData);

      res.json({
        data: parsedData,
        coins: coinsList,
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error("Failed to fetch market caps:", error);
      res.status(500).json({ error: "Failed to fetch market caps" });
    }
  });

  // Options term structure
  app.get("/api/velo/options-terms", async (req, res) => {
    try {
      const { coins } = req.query;
      
      if (!coins) {
        return res.status(400).json({ error: "Coins parameter required (comma-separated)" });
      }

      const coinsList = (coins as string).split(',');
      const termsData = await veloService.getOptionsTermStructure(coinsList);

      res.json({
        data: termsData,
        coins: coinsList,
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error("Failed to fetch options terms:", error);
      res.status(500).json({ error: "Failed to fetch options term structure" });
    }
  });

  // Crypto news
  app.get("/api/velo/news", async (req, res) => {
    try {
      const { hours = 24 } = req.query;
      const hoursNum = parseInt(hours as string);
      
      const news = await veloService.getCryptoNews(hoursNum);

      res.json({
        data: news,
        timeframe_hours: hoursNum,
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error("Failed to fetch crypto news:", error);
      res.status(500).json({ error: "Failed to fetch crypto news" });
    }
  });

  // BTC 24h price data
  app.get("/api/velo/btc/24h", async (req, res) => {
    try {
      const btcData = await veloService.getBTCSpotPrice24h();
      
      res.json({
        data: btcData,
        asset: "BTC",
        timeframe: "24h",
        resolution: "1h",
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error("Failed to fetch BTC 24h data:", error);
      res.status(500).json({ error: "Failed to fetch BTC 24h data" });
    }
  });

  // ETH 24h price data
  app.get("/api/velo/eth/24h", async (req, res) => {
    try {
      const ethData = await veloService.getETHSpotPrice24h();
      
      res.json({
        data: ethData,
        asset: "ETH",
        timeframe: "24h",
        resolution: "1h",
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error("Failed to fetch ETH 24h data:", error);
      res.status(500).json({ error: "Failed to fetch ETH 24h data" });
    }
  });

  // Top coins market caps
  app.get("/api/velo/top-market-caps", async (req, res) => {
    try {
      const marketCaps = await veloService.getTopCoinsMarketCaps();
      
      res.json({
        data: marketCaps,
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error("Failed to fetch top market caps:", error);
      res.status(500).json({ error: "Failed to fetch top market caps" });
    }
  });

  // Multi-asset price data for dashboard
  app.get("/api/velo/multi-asset", async (req, res) => {
    try {
      const { assets, timeframe = '1h' } = req.query;
      
      if (!assets) {
        return res.status(400).json({ error: "Assets parameter required (comma-separated)" });
      }

      const assetsList = (assets as string).split(',');
      const timeframeValue = timeframe as '1h' | '4h' | '1d';
      
      const multiAssetData = await veloService.getMultiAssetPriceData(assetsList, timeframeValue);

      res.json({
        data: multiAssetData,
        assets: assetsList,
        timeframe: timeframeValue,
        provider: "Velo Pro API"
      });
    } catch (error) {
      console.error("Failed to fetch multi-asset data:", error);
      res.status(500).json({ error: "Failed to fetch multi-asset data" });
    }
  });

  // Combined dashboard data endpoint
  app.get("/api/velo/dashboard", async (req, res) => {
    try {
      const { assets = 'BTC,ETH,SOL,ADA,DOT' } = req.query;
      const assetsList = (assets as string).split(',');

      // Fetch multiple data sources in parallel with error handling for each
      const results = await Promise.allSettled([
        veloService.getTopCoinsMarketCaps().catch(err => {
          console.error("Failed to fetch market caps:", err);
          return [];
        }),
        veloService.getBTCSpotPrice24h().catch(err => {
          console.error("Failed to fetch BTC 24h:", err);
          return [];
        }),
        veloService.getETHSpotPrice24h().catch(err => {
          console.error("Failed to fetch ETH 24h:", err);
          return [];
        }),
        veloService.getCryptoNews(24).catch(err => {
          console.error("Failed to fetch news:", err);
          return [];
        }),
        veloService.getMultiAssetPriceData(assetsList, '1h').catch(err => {
          console.error("Failed to fetch multi-asset data:", err);
          return {};
        })
      ]);

      // Extract results with fallbacks
      const marketCaps = results[0].status === 'fulfilled' ? results[0].value : [];
      const btc24h = results[1].status === 'fulfilled' ? results[1].value : [];
      const eth24h = results[2].status === 'fulfilled' ? results[2].value : [];
      const veloNews = results[3].status === 'fulfilled' ? results[3].value : [];
      const multiAssetData = results[4].status === 'fulfilled' ? results[4].value : {};

      // Only use Velo news - no fallback generation

      res.json({
        market_caps: marketCaps,
        btc_24h: btc24h,
        eth_24h: eth24h,
        news: veloNews,
        multi_asset_data: multiAssetData,
        assets: assetsList,
        provider: "Velo Pro API",
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
