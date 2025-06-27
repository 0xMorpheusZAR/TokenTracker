import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cryptoRankService } from "./services/cryptorank";
import { coinGeckoService } from "./services/coingecko";
import { insertTokenSchema, insertUnlockEventSchema, insertPriceHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tokens
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getAllTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tokens" });
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

  const httpServer = createServer(app);
  return httpServer;
}
