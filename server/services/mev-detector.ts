import { db } from "../db";
import { mevOpportunities, dexPairs, gasPrices } from "@shared/schema";
import { coinGeckoService } from "./coingecko";
import { defiLlamaService } from "./defillama";
import { eq, and, gt, sql } from "drizzle-orm";

interface PriceData {
  token: string;
  exchange: string;
  price: number;
  volume?: number;
  liquidity?: number;
}

interface ArbitrageOpportunity {
  tokenA: string;
  tokenB: string;
  dexA: string;
  dexB: string;
  priceA: number;
  priceB: number;
  priceDiff: number;
  estimatedProfit: number;
  liquidityA?: number;
  liquidityB?: number;
  chain: string;
}

interface GasEstimate {
  standard: number;
  fast: number;
  rapid: number;
  estimatedCost: number;
}

export class MEVDetectorService {
  private isRunning = false;
  private scanInterval: NodeJS.Timeout | null = null;
  private gasPriceInterval: NodeJS.Timeout | null = null;

  async startScanning() {
    if (this.isRunning) return;
    
    console.log("Starting MEV opportunity scanner...");
    this.isRunning = true;

    // Update gas prices every 15 seconds
    this.updateGasPrices();
    this.gasPriceInterval = setInterval(() => {
      this.updateGasPrices();
    }, 15000);

    // Scan for opportunities every 5 seconds
    this.scanForOpportunities();
    this.scanInterval = setInterval(() => {
      this.scanForOpportunities();
    }, 5000);
  }

  stopScanning() {
    this.isRunning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.gasPriceInterval) {
      clearInterval(this.gasPriceInterval);
      this.gasPriceInterval = null;
    }
    console.log("MEV scanner stopped");
  }

  private async updateGasPrices() {
    try {
      // For now, we'll use estimated values. In production, integrate with gas oracle
      const chains = ["ethereum", "polygon", "arbitrum", "optimism"];
      
      for (const chain of chains) {
        let gasPrice = {
          standard: 20,
          fast: 30,
          rapid: 50,
        };

        // Adjust for different chains
        if (chain === "polygon") {
          gasPrice = { standard: 30, fast: 50, rapid: 100 };
        } else if (chain === "arbitrum" || chain === "optimism") {
          gasPrice = { standard: 0.1, fast: 0.2, rapid: 0.5 };
        }

        await db.insert(gasPrices).values({
          chain,
          standard: gasPrice.standard.toString(),
          fast: gasPrice.fast.toString(),
          rapid: gasPrice.rapid.toString(),
          baseFee: (gasPrice.standard * 0.8).toString(),
          priorityFee: (gasPrice.standard * 0.2).toString(),
        }).onConflictDoNothing();
      }
    } catch (error) {
      console.error("Error updating gas prices:", error);
    }
  }

  private async scanForOpportunities() {
    try {
      // Scan for arbitrage opportunities
      await this.detectArbitrageOpportunities();
      
      // Future: Add sandwich attack detection
      // Future: Add liquidation opportunity detection
    } catch (error) {
      console.error("Error scanning for MEV opportunities:", error);
    }
  }

  private async detectArbitrageOpportunities() {
    try {
      // Get top tokens to monitor
      const topTokens = ["ethereum", "bitcoin", "usdc", "usdt", "dai", "weth", "matic", "arbitrum"];
      
      // Fetch prices from multiple sources
      const priceData = await this.fetchMultiSourcePrices(topTokens);
      
      // Find arbitrage opportunities
      const opportunities = this.findArbitrageOpportunities(priceData);
      
      // Save profitable opportunities
      for (const opp of opportunities) {
        const gasEstimate = await this.estimateGasCost("ethereum", "arbitrage");
        const netProfit = opp.estimatedProfit - gasEstimate.estimatedCost;
        
        if (netProfit > 10) { // Only save if profit > $10
          const confidenceScore = this.calculateConfidenceScore(opp);
          
          await db.insert(mevOpportunities).values({
            type: "arbitrage",
            status: "pending",
            tokenA: opp.tokenA,
            tokenB: opp.tokenB || "USD",
            chain: opp.chain,
            dexA: opp.dexA,
            dexB: opp.dexB,
            estimatedProfit: opp.estimatedProfit.toString(),
            gasCost: gasEstimate.estimatedCost.toString(),
            netProfit: netProfit.toString(),
            confidenceScore: confidenceScore.toString(),
            executionWindow: 60, // 60 seconds
            priceA: opp.priceA.toString(),
            priceB: opp.priceB.toString(),
            liquidityA: opp.liquidityA?.toString(),
            liquidityB: opp.liquidityB?.toString(),
            metadata: JSON.stringify({
              priceDiff: opp.priceDiff,
              gasEstimate,
              timestamp: new Date().toISOString()
            })
          });
        }
      }
    } catch (error) {
      console.error("Error detecting arbitrage opportunities:", error);
    }
  }

  private async fetchMultiSourcePrices(tokens: string[]): Promise<PriceData[]> {
    const priceData: PriceData[] = [];

    try {
      // Fetch from CoinGecko
      const cgPrices = await coinGeckoService.getCurrentPrices(tokens);
      if (cgPrices) {
        for (const [token, data] of Object.entries(cgPrices)) {
          priceData.push({
            token,
            exchange: "coingecko_aggregate",
            price: data.usd,
            volume: data.usd_24h_vol
          });
        }
      }

      // Fetch DEX data from DefiLlama
      const dexData = await defiLlamaService.getDerivativesOverview();
      if (dexData) {
        // Process DEX-specific price data
        // This would need more specific endpoints in production
      }

      // Simulate some DEX prices with slight variations
      for (const token of tokens) {
        const basePrice = priceData.find(p => p.token === token)?.price || 1000;
        
        // Uniswap
        priceData.push({
          token,
          exchange: "uniswap_v3",
          price: basePrice * (1 + (Math.random() - 0.5) * 0.02), // ±1% variation
          liquidity: Math.random() * 10000000
        });

        // SushiSwap
        priceData.push({
          token,
          exchange: "sushiswap",
          price: basePrice * (1 + (Math.random() - 0.5) * 0.025), // ±1.25% variation
          liquidity: Math.random() * 5000000
        });

        // Curve
        if (["usdc", "usdt", "dai"].includes(token)) {
          priceData.push({
            token,
            exchange: "curve",
            price: basePrice * (1 + (Math.random() - 0.5) * 0.005), // ±0.25% for stables
            liquidity: Math.random() * 50000000
          });
        }
      }
    } catch (error) {
      console.error("Error fetching multi-source prices:", error);
    }

    return priceData;
  }

  private findArbitrageOpportunities(priceData: PriceData[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    const minProfitThreshold = 0.005; // 0.5% minimum profit

    // Group prices by token
    const pricesByToken = priceData.reduce((acc, data) => {
      if (!acc[data.token]) acc[data.token] = [];
      acc[data.token].push(data);
      return acc;
    }, {} as Record<string, PriceData[]>);

    // Find arbitrage opportunities for each token
    for (const [token, prices] of Object.entries(pricesByToken)) {
      prices.sort((a, b) => a.price - b.price);
      
      for (let i = 0; i < prices.length - 1; i++) {
        for (let j = i + 1; j < prices.length; j++) {
          const low = prices[i];
          const high = prices[j];
          const priceDiff = (high.price - low.price) / low.price;

          if (priceDiff > minProfitThreshold) {
            // Calculate potential profit based on available liquidity
            const maxTradeSize = Math.min(
              low.liquidity || 100000,
              high.liquidity || 100000
            ) * 0.1; // Use 10% of liquidity

            const estimatedProfit = maxTradeSize * priceDiff;

            opportunities.push({
              tokenA: token,
              tokenB: "USD",
              dexA: low.exchange,
              dexB: high.exchange,
              priceA: low.price,
              priceB: high.price,
              priceDiff,
              estimatedProfit,
              liquidityA: low.liquidity,
              liquidityB: high.liquidity,
              chain: "ethereum" // Default to Ethereum, would need chain detection
            });
          }
        }
      }
    }

    return opportunities.sort((a, b) => b.estimatedProfit - a.estimatedProfit);
  }

  private calculateConfidenceScore(opp: ArbitrageOpportunity): number {
    let score = 0.5; // Base score

    // Higher price difference = higher confidence
    if (opp.priceDiff > 0.02) score += 0.2;
    else if (opp.priceDiff > 0.01) score += 0.1;

    // Higher liquidity = higher confidence
    const minLiquidity = Math.min(opp.liquidityA || 0, opp.liquidityB || 0);
    if (minLiquidity > 5000000) score += 0.2;
    else if (minLiquidity > 1000000) score += 0.1;

    // Known DEXes = higher confidence
    const knownDexes = ["uniswap_v3", "sushiswap", "curve"];
    if (knownDexes.includes(opp.dexA) && knownDexes.includes(opp.dexB)) {
      score += 0.1;
    }

    return Math.min(score, 0.99);
  }

  private async estimateGasCost(chain: string, txType: string): Promise<GasEstimate> {
    try {
      // Get latest gas prices
      const [gasPrice] = await db
        .select()
        .from(gasPrices)
        .where(eq(gasPrices.chain, chain))
        .orderBy(sql`updated_at DESC`)
        .limit(1);

      if (!gasPrice) {
        return {
          standard: 20,
          fast: 30,
          rapid: 50,
          estimatedCost: 5
        };
      }

      // Estimate gas units based on transaction type
      let gasUnits = 150000; // Default for simple swap
      if (txType === "arbitrage") gasUnits = 300000; // Two swaps
      if (txType === "sandwich") gasUnits = 450000; // Two swaps + higher priority
      if (txType === "liquidation") gasUnits = 400000; // Complex liquidation

      // Calculate cost in USD (assuming ETH at $2000)
      const ethPrice = 2000; // Would fetch from CoinGecko in production
      const costInEth = (parseFloat(gasPrice.fast) * gasUnits) / 1e9;
      const estimatedCost = costInEth * ethPrice;

      return {
        standard: parseFloat(gasPrice.standard),
        fast: parseFloat(gasPrice.fast),
        rapid: parseFloat(gasPrice.rapid),
        estimatedCost
      };
    } catch (error) {
      console.error("Error estimating gas cost:", error);
      return {
        standard: 20,
        fast: 30,
        rapid: 50,
        estimatedCost: 5
      };
    }
  }

  async getRecentOpportunities(limit = 20) {
    return await db
      .select()
      .from(mevOpportunities)
      .orderBy(sql`created_at DESC`)
      .limit(limit);
  }

  async getOpportunityStats() {
    const stats = await db
      .select({
        type: mevOpportunities.type,
        count: sql<number>`count(*)::int`,
        totalProfit: sql<number>`sum(net_profit)::float`,
        avgProfit: sql<number>`avg(net_profit)::float`,
        avgConfidence: sql<number>`avg(confidence_score)::float`
      })
      .from(mevOpportunities)
      .groupBy(mevOpportunities.type);

    return stats;
  }
}

export const mevDetectorService = new MEVDetectorService();