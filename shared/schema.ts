import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  exchange: text("exchange").notNull(),
  listingDate: text("listing_date").notNull(),
  initialFloat: decimal("initial_float", { precision: 5, scale: 2 }).notNull(),
  peakFdv: text("peak_fdv").notNull(),
  listingPrice: decimal("listing_price", { precision: 10, scale: 6 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 6 }).notNull(),
  athPrice: decimal("ath_price", { precision: 10, scale: 6 }).notNull(),
  performancePercent: decimal("performance_percent", { precision: 5, scale: 2 }).notNull(),
  athDeclinePercent: decimal("ath_decline_percent", { precision: 5, scale: 2 }).notNull(),
  sector: text("sector").notNull(),
  riskLevel: text("risk_level").notNull(),
  totalSupply: text("total_supply").notNull(),
  circulatingSupply: text("circulating_supply").notNull(),
  majorUnlockEvents: text("major_unlock_events").notNull(),
});

export const unlockEvents = pgTable("unlock_events", {
  id: serial("id").primaryKey(),
  tokenId: integer("token_id").notNull(),
  unlockDate: text("unlock_date").notNull(),
  tokensUnlocked: text("tokens_unlocked").notNull(),
  percentOfSupply: decimal("percent_of_supply", { precision: 5, scale: 2 }).notNull(),
  priceImpact: decimal("price_impact", { precision: 5, scale: 2 }),
  description: text("description").notNull(),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  tokenId: integer("token_id").notNull(),
  date: text("date").notNull(),
  price: decimal("price", { precision: 10, scale: 6 }).notNull(),
  marketCap: text("market_cap"),
  volume: text("volume"),
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
});

export const insertUnlockEventSchema = createInsertSchema(unlockEvents).omit({
  id: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
});

// MEV Opportunity Tables
export const mevOpportunities = pgTable("mev_opportunities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'sandwich', 'arbitrage', 'liquidation'
  status: text("status").notNull().default("pending"), // 'pending', 'executing', 'completed', 'failed'
  tokenA: text("token_a").notNull(),
  tokenB: text("token_b"),
  chain: text("chain").notNull(),
  dexA: text("dex_a"),
  dexB: text("dex_b"),
  estimatedProfit: decimal("estimated_profit", { precision: 20, scale: 8 }).notNull(),
  gasCost: decimal("gas_cost", { precision: 20, scale: 8 }).notNull(),
  netProfit: decimal("net_profit", { precision: 20, scale: 8 }).notNull(),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }).notNull(),
  executionWindow: integer("execution_window"), // seconds
  targetTxHash: text("target_tx_hash"), // for sandwich attacks
  priceA: decimal("price_a", { precision: 20, scale: 8 }),
  priceB: decimal("price_b", { precision: 20, scale: 8 }),
  liquidityA: decimal("liquidity_a", { precision: 20, scale: 2 }),
  liquidityB: decimal("liquidity_b", { precision: 20, scale: 2 }),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
  executedAt: timestamp("executed_at"),
});

export const mevExecutions = pgTable("mev_executions", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull(),
  executionTxHash: text("execution_tx_hash"),
  actualProfit: decimal("actual_profit", { precision: 20, scale: 8 }),
  actualGasCost: decimal("actual_gas_cost", { precision: 20, scale: 8 }),
  status: text("status").notNull(), // 'success', 'failed', 'reverted'
  errorMessage: text("error_message"),
  blockNumber: integer("block_number"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const gasPrices = pgTable("gas_prices", {
  id: serial("id").primaryKey(),
  chain: text("chain").notNull(),
  standard: decimal("standard", { precision: 10, scale: 2 }).notNull(),
  fast: decimal("fast", { precision: 10, scale: 2 }).notNull(),
  rapid: decimal("rapid", { precision: 10, scale: 2 }).notNull(),
  baseFee: decimal("base_fee", { precision: 10, scale: 2 }),
  priorityFee: decimal("priority_fee", { precision: 10, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dexPairs = pgTable("dex_pairs", {
  id: serial("id").primaryKey(),
  chain: text("chain").notNull(),
  dex: text("dex").notNull(),
  tokenA: text("token_a").notNull(),
  tokenB: text("token_b").notNull(),
  pairAddress: text("pair_address").notNull(),
  liquidity: decimal("liquidity", { precision: 20, scale: 2 }).notNull(),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  feeRate: decimal("fee_rate", { precision: 5, scale: 4 }).notNull(),
  lastPrice: decimal("last_price", { precision: 20, scale: 8 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletConfig = pgTable("wallet_config", {
  id: serial("id").primaryKey(),
  chain: text("chain").notNull().unique(),
  walletAddress: text("wallet_address").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  maxGasPrice: decimal("max_gas_price", { precision: 10, scale: 2 }),
  minProfit: decimal("min_profit", { precision: 20, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMevOpportunitySchema = createInsertSchema(mevOpportunities).omit({
  id: true,
  createdAt: true,
});

export const insertMevExecutionSchema = createInsertSchema(mevExecutions).omit({
  id: true,
  executedAt: true,
});

export const insertGasPriceSchema = createInsertSchema(gasPrices).omit({
  id: true,
  updatedAt: true,
});

export const insertDexPairSchema = createInsertSchema(dexPairs).omit({
  id: true,
  updatedAt: true,
});

export const insertWalletConfigSchema = createInsertSchema(walletConfig).omit({
  id: true,
  createdAt: true,
});

export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type UnlockEvent = typeof unlockEvents.$inferSelect;
export type InsertUnlockEvent = z.infer<typeof insertUnlockEventSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type MevOpportunity = typeof mevOpportunities.$inferSelect;
export type InsertMevOpportunity = z.infer<typeof insertMevOpportunitySchema>;
export type MevExecution = typeof mevExecutions.$inferSelect;
export type InsertMevExecution = z.infer<typeof insertMevExecutionSchema>;
export type GasPrice = typeof gasPrices.$inferSelect;
export type InsertGasPrice = z.infer<typeof insertGasPriceSchema>;
export type DexPair = typeof dexPairs.$inferSelect;
export type InsertDexPair = z.infer<typeof insertDexPairSchema>;
export type WalletConfig = typeof walletConfig.$inferSelect;
export type InsertWalletConfig = z.infer<typeof insertWalletConfigSchema>;
