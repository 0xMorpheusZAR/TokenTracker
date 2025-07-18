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

export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type UnlockEvent = typeof unlockEvents.$inferSelect;
export type InsertUnlockEvent = z.infer<typeof insertUnlockEventSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
