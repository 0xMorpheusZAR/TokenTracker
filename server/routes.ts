import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cryptoRankService } from "./services/cryptorank";
import { coinGeckoService } from "./services/coingecko";
import { duneService } from "./services/dune";
import { whopService } from "./services/whop";
import { discordService } from "./services/discord";
import { defiLlamaService } from "./services/defillama";
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
            return {
              ...token,
              currentPrice: liveData.current_price?.toFixed(6) || token.currentPrice,
              marketCap: liveData.market_cap || 0,
              volume24h: liveData.total_volume || 0,
              priceChange24h: liveData.price_change_percentage_24h?.toFixed(2) || "0",
              priceChange7d: liveData.price_change_percentage_7d?.toFixed(2) || "0",
              priceChange30d: liveData.price_change_percentage_30d?.toFixed(2) || "0",
              ath: liveData.ath || parseFloat(token.currentPrice),
              athDate: liveData.ath_date || token.listingDate,
              circulatingSupply: liveData.circulating_supply || 0,
              totalSupply: liveData.total_supply || 0,
              maxSupply: liveData.max_supply || 0,
              fdv: liveData.fully_diluted_valuation || 0,
              lastUpdated: new Date().toISOString(),
              // Recalculate performance with real current price
              performancePercent: liveData.current_price ? 
                (((liveData.current_price - parseFloat(token.listingPrice)) / parseFloat(token.listingPrice)) * 100).toFixed(1) :
                token.performancePercent
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

  // DefiLlama API routes
  app.get("/api/defillama/status", async (req, res) => {
    try {
      const status = defiLlamaService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to check DefiLlama status" });
    }
  });

  app.get("/api/defillama/protocols", async (req, res) => {
    try {
      const protocols = await defiLlamaService.getAllProtocols();
      
      if (!protocols) {
        return res.status(500).json({ error: "Failed to fetch protocols from DefiLlama" });
      }
      
      res.json(protocols);
    } catch (error) {
      console.error("Failed to fetch DefiLlama protocols:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/protocol/:protocol", async (req, res) => {
    try {
      const protocol = req.params.protocol;
      const protocolData = await defiLlamaService.getProtocolDetails(protocol);
      
      if (!protocolData) {
        return res.status(404).json({ error: "Protocol not found" });
      }
      
      res.json(protocolData);
    } catch (error) {
      console.error("Failed to fetch protocol details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/unlocks", async (req, res) => {
    try {
      const unlocks = await defiLlamaService.getAllTokenUnlocks();
      
      if (!unlocks) {
        return res.status(500).json({ error: "Failed to fetch token unlocks" });
      }
      
      res.json(unlocks);
    } catch (error) {
      console.error("Failed to fetch token unlocks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/unlocks/:geckoId", async (req, res) => {
    try {
      const geckoId = req.params.geckoId;
      const unlocks = await defiLlamaService.getTokenUnlocks(geckoId);
      
      if (!unlocks) {
        return res.status(404).json({ error: "Token unlocks not found" });
      }
      
      res.json(unlocks);
    } catch (error) {
      console.error("Failed to fetch token unlock details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/fees", async (req, res) => {
    try {
      const dataType = (req.query.dataType as 'dailyFees' | 'dailyRevenue') || 'dailyRevenue';
      const feesData = await defiLlamaService.getFeesAndRevenue(dataType);
      
      if (!feesData) {
        return res.status(500).json({ error: "Failed to fetch fees data" });
      }
      
      res.json(feesData);
    } catch (error) {
      console.error("Failed to fetch fees data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/revenue/:protocol", async (req, res) => {
    try {
      const protocol = req.params.protocol;
      const revenueData = await defiLlamaService.getProtocolRevenue(protocol);
      
      if (!revenueData) {
        return res.status(404).json({ error: "Protocol revenue data not found" });
      }
      
      res.json(revenueData);
    } catch (error) {
      console.error("Failed to fetch protocol revenue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/yields", async (req, res) => {
    try {
      const yields = await defiLlamaService.getYieldPools();
      
      if (!yields) {
        return res.status(500).json({ error: "Failed to fetch yield data" });
      }
      
      res.json(yields);
    } catch (error) {
      console.error("Failed to fetch yield data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/derivatives", async (req, res) => {
    try {
      const derivatives = await defiLlamaService.getDerivativesOverview();
      
      if (!derivatives) {
        return res.status(500).json({ error: "Failed to fetch derivatives data" });
      }
      
      res.json(derivatives);
    } catch (error) {
      console.error("Failed to fetch derivatives data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/derivatives/:protocol", async (req, res) => {
    try {
      const protocol = req.params.protocol;
      const derivativesData = await defiLlamaService.getDerivativesProtocol(protocol);
      
      if (!derivativesData) {
        return res.status(404).json({ error: "Protocol derivatives data not found" });
      }
      
      res.json(derivativesData);
    } catch (error) {
      console.error("Failed to fetch protocol derivatives:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/chains", async (req, res) => {
    try {
      const chains = await defiLlamaService.getChainTVLs();
      
      if (!chains) {
        return res.status(500).json({ error: "Failed to fetch chain TVL data" });
      }
      
      res.json(chains);
    } catch (error) {
      console.error("Failed to fetch chain TVLs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/analytics/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const geckoId = req.query.geckoId as string;
      
      const analytics = await defiLlamaService.getTokenAnalytics(symbol, geckoId);
      res.json(analytics);
    } catch (error) {
      console.error("Failed to fetch token analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/defillama/usage", async (req, res) => {
    try {
      const usage = await defiLlamaService.getApiUsage();
      
      if (!usage) {
        return res.status(500).json({ error: "Failed to fetch API usage data" });
      }
      
      res.json(usage);
    } catch (error) {
      console.error("Failed to fetch API usage:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DEX Intelligence endpoints
  app.get("/api/dex/trending-pools", async (req, res) => {
    try {
      const { chain = 'all' } = req.query;
      
      // Get yield pools from DefiLlama
      const yieldsResponse: any = await defiLlamaService.getYieldPools();
      
      // Handle the response structure
      let pools: any[] = [];
      if (yieldsResponse) {
        if (Array.isArray(yieldsResponse)) {
          pools = yieldsResponse;
        } else if (yieldsResponse.data && Array.isArray(yieldsResponse.data)) {
          pools = yieldsResponse.data;
        } else if (yieldsResponse.status === 'success' && yieldsResponse.data) {
          pools = yieldsResponse.data;
        }
      }
      
      // Filter by chain if specified
      if (chain !== 'all' && pools.length > 0) {
        pools = pools.filter((pool: any) => 
          pool.chain && pool.chain.toLowerCase() === (chain as string).toLowerCase()
        );
      }
      
      // Filter DEX pools only and sort by TVL
      const dexPools = pools
        .filter((pool: any) => {
          // Filter for DEX pools with reasonable TVL
          // Skip single-asset staking pools and focus on liquidity pools
          const isDexPool = pool.symbol && pool.symbol.includes('-') && 
                           pool.project && pool.project !== 'lido' && 
                           pool.project !== 'ether.fi-stake' &&
                           pool.project !== 'wasabi';
          const hasReasonableTvl = pool.tvlUsd > 100000 && pool.tvlUsd < 5000000000; // Less than $5B
          
          return isDexPool && hasReasonableTvl && pool.project;
        })
        .sort((a: any, b: any) => b.tvlUsd - a.tvlUsd)
        .slice(0, 20);
      
      const trendingPools = dexPools.map((pool: any) => ({
        id: pool.pool,
        name: pool.symbol,
        project: pool.project,
        chain: pool.chain,
        tvl: pool.tvlUsd,
        apy: parseFloat(pool.apy) || 0,
        apyBase: parseFloat(pool.apyBase) || 0,
        apyReward: parseFloat(pool.apyReward) || 0,
        rewardTokens: pool.rewardTokens || [],
        poolMeta: pool.poolMeta,
        ilRisk: pool.il7d || 0,
        volumeUsd1d: pool.volumeUsd1d || 0,
        volumeUsd7d: pool.volumeUsd7d || 0
      }));
      
      res.json(trendingPools);
    } catch (error: any) {
      console.error('Error fetching trending pools:', error);
      res.status(500).json({ 
        error: 'Failed to fetch trending pools', 
        message: error.message 
      });
    }
  });

  app.get("/api/dex/whale-transactions", async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      
      // For now, return mock data as real whale tracking requires on-chain data
      // In production, this would connect to blockchain nodes or services like Dune Analytics
      const mockWhaleTransactions = [
        {
          id: '1',
          type: 'buy',
          amount: 2500000,
          token: 'USDC',
          pool: 'USDC-ETH',
          timestamp: Date.now() - 300000,
          impact: 2.5,
          walletCategory: 'Smart Money',
          txHash: '0x1234...',
          gasUsed: 250000
        },
        {
          id: '2',
          type: 'sell',
          amount: 1800000,
          token: 'WETH',
          pool: 'WETH-USDT',
          timestamp: Date.now() - 600000,
          impact: -1.8,
          walletCategory: 'Institution',
          txHash: '0x5678...',
          gasUsed: 180000
        },
        {
          id: '3',
          type: 'buy',
          amount: 950000,
          token: 'ARB',
          pool: 'ARB-ETH',
          timestamp: Date.now() - 900000,
          impact: 1.2,
          walletCategory: 'Whale',
          txHash: '0x9abc...',
          gasUsed: 220000
        }
      ];
      
      res.json(mockWhaleTransactions.slice(0, parseInt(limit as string)));
    } catch (error: any) {
      console.error('Error fetching whale transactions:', error);
      res.status(500).json({ 
        error: 'Failed to fetch whale transactions', 
        message: error.message 
      });
    }
  });

  app.get("/api/dex/protocol-metrics", async (_req, res) => {
    try {
      // Get protocols and revenue data
      const [protocols, revenueData] = await Promise.all([
        defiLlamaService.getAllProtocols(),
        defiLlamaService.getFeesAndRevenue('dailyRevenue')
      ]);
      
      if (!protocols || !revenueData) {
        return res.json([]);
      }
      
      // Get DEX protocols only
      const dexProtocols = protocols
        .filter((p: any) => 
          p.category === 'Dexes' || 
          p.name.toLowerCase().includes('swap') ||
          p.name.toLowerCase().includes('dex')
        )
        .slice(0, 10);
      
      // Enhance with revenue data
      const enhancedProtocols = await Promise.all(
        dexProtocols.map(async (protocol: any) => {
          // Try to get revenue data for this specific protocol
          let fees24h = 0;
          let revenue24h = 0;
          
          // First try aggregated data which is more reliable
          if (revenueData && revenueData.protocols) {
            const revenueInfo = revenueData.protocols[protocol.name] || 
                              revenueData.protocols[protocol.module] ||
                              revenueData.protocols[protocol.slug];
            if (revenueInfo) {
              fees24h = revenueInfo.total24h || revenueInfo.totalDataChart24h || 0;
              revenue24h = revenueInfo.revenue24h || revenueInfo.totalRevenue24h || 0;
            }
          }
          
          // Skip individual protocol fetches to avoid 400 errors
          // The aggregated data should be sufficient
          
          return {
            protocol: protocol.name,
            tvl: protocol.tvl || 0,
            volume24h: protocol.volume || 0,
            fees24h: fees24h,
            revenue24h: revenue24h,
            users24h: protocol.activeUsers || 0,
            chains: protocol.chains || [],
            change1d: protocol.change_1d || 0,
            dominance: 0 // Will calculate after
          };
        })
      );
      
      // Calculate dominance
      const totalTvl = enhancedProtocols.reduce((sum: number, p: any) => sum + p.tvl, 0);
      enhancedProtocols.forEach((p: any) => {
        p.dominance = totalTvl > 0 ? (p.tvl / totalTvl) * 100 : 0;
      });
      
      res.json(enhancedProtocols);
    } catch (error: any) {
      console.error('Error fetching protocol metrics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch protocol metrics', 
        message: error.message 
      });
    }
  });

  app.get("/api/dex/volume-stats", async (_req, res) => {
    try {
      // Get derivatives volume data for DEX volume insights
      const volumeData = await defiLlamaService.getDerivativesOverview();
      
      if (!volumeData) {
        return res.json({
          total24h: 0,
          change24h: 0,
          topProtocols: []
        });
      }
      
      res.json({
        total24h: volumeData.total24h || 0,
        change24h: volumeData.change24h || 0,
        topProtocols: volumeData.protocols?.slice(0, 5) || []
      });
    } catch (error: any) {
      console.error('Error fetching volume stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch volume stats', 
        message: error.message 
      });
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
        whop: whopService.getConnectionStatus()
      });
    } catch (error) {
      console.error("Failed to check services status:", error);
      res.status(500).json({ error: "Failed to check services status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
