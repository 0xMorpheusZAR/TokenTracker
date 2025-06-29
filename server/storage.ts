import { 
  tokens, 
  unlockEvents, 
  priceHistory,
  users,
  type Token, 
  type InsertToken,
  type UnlockEvent,
  type InsertUnlockEvent,
  type PriceHistory,
  type InsertPriceHistory,
  type User,
  type UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Token operations
  getAllTokens(): Promise<Token[]>;
  getTokenById(id: number): Promise<Token | undefined>;
  getTokenBySymbol(symbol: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  
  // Unlock event operations
  getUnlockEventsByTokenId(tokenId: number): Promise<UnlockEvent[]>;
  createUnlockEvent(event: InsertUnlockEvent): Promise<UnlockEvent>;
  
  // Price history operations
  getPriceHistoryByTokenId(tokenId: number): Promise<PriceHistory[]>;
  createPriceHistory(history: InsertPriceHistory): Promise<PriceHistory>;
  
  // Analytics
  getTopFailures(): Promise<Token[]>;
  getUpcomingUnlocks(): Promise<(UnlockEvent & { token: Token })[]>;
}

export class MemStorage implements IStorage {
  private tokens: Map<number, Token>;
  private unlockEvents: Map<number, UnlockEvent>;
  private priceHistory: Map<number, PriceHistory>;
  private users: Map<string, User>;
  private currentTokenId: number;
  private currentUnlockEventId: number;
  private currentPriceHistoryId: number;

  constructor() {
    this.tokens = new Map();
    this.unlockEvents = new Map();
    this.priceHistory = new Map();
    this.users = new Map();
    this.currentTokenId = 1;
    this.currentUnlockEventId = 1;
    this.currentPriceHistoryId = 1;
    
    this.initializeData();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id,
      email: userData.email !== undefined ? userData.email : null,
      firstName: userData.firstName !== undefined ? userData.firstName : null,
      lastName: userData.lastName !== undefined ? userData.lastName : null,
      profileImageUrl: userData.profileImageUrl !== undefined ? userData.profileImageUrl : null,
      stripeCustomerId: userData.stripeCustomerId !== undefined ? userData.stripeCustomerId : null,
      stripeSubscriptionId: userData.stripeSubscriptionId !== undefined ? userData.stripeSubscriptionId : null,
      subscriptionStatus: userData.subscriptionStatus !== undefined ? userData.subscriptionStatus : null,
      subscriptionTier: userData.subscriptionTier !== undefined ? userData.subscriptionTier : null,
      createdAt: userData.createdAt !== undefined ? userData.createdAt : null,
      updatedAt: userData.updatedAt !== undefined ? userData.updatedAt : null,
    };
    this.users.set(user.id, user);
    return user;
  }

  private initializeData() {
    // Initialize with the 10 failed tokens from the PDF
    const failedTokens: InsertToken[] = [
      {
        symbol: "PORTAL",
        name: "Portal",
        exchange: "Binance",
        listingDate: "Feb 29, 2024",
        initialFloat: "16.7",
        peakFdv: "$3.36B",
        listingPrice: "3.36",
        currentPrice: "0.03",
        athPrice: "3.65",
        performancePercent: "-99.1",
        athDeclinePercent: "-99.0",
        sector: "Web3 Gaming",
        riskLevel: "CRITICAL",
        totalSupply: "1B",
        circulatingSupply: "167M",
        majorUnlockEvents: "Ongoing vesting through 2024-2025"
      },
      {
        symbol: "STRK",
        name: "Starknet",
        exchange: "Binance",
        listingDate: "Feb 20, 2024",
        initialFloat: "7.3",
        peakFdv: "$20.0B",
        listingPrice: "2.00",
        currentPrice: "0.11",
        athPrice: "5.00",
        performancePercent: "-94.5",
        athDeclinePercent: "-97.8",
        sector: "Layer-2",
        riskLevel: "CRITICAL",
        totalSupply: "10B",
        circulatingSupply: "728M",
        majorUnlockEvents: "Monthly unlocks of 64M STRK from Apr 2024"
      },
      {
        symbol: "AEVO",
        name: "Aevo",
        exchange: "Binance, Bybit",
        listingDate: "Mar 13, 2024",
        initialFloat: "9.0",
        peakFdv: "$3.7B",
        listingPrice: "3.00",
        currentPrice: "0.08",
        athPrice: "3.94",
        performancePercent: "-97.3",
        athDeclinePercent: "-98.0",
        sector: "DeFi Exchange",
        riskLevel: "CRITICAL",
        totalSupply: "1B",
        circulatingSupply: "90M",
        majorUnlockEvents: "May 15, 2024 - 878M tokens unlocked (753% increase)"
      },
      {
        symbol: "PIXEL",
        name: "Pixels",
        exchange: "Binance, Bybit",
        listingDate: "Feb 19, 2024",
        initialFloat: "15.4",
        peakFdv: "$5.1B",
        listingPrice: "1.02",
        currentPrice: "0.03",
        athPrice: "1.0219",
        performancePercent: "-97.1",
        athDeclinePercent: "-97.0",
        sector: "Web3 Gaming",
        riskLevel: "CRITICAL",
        totalSupply: "5B",
        circulatingSupply: "771M",
        majorUnlockEvents: "60-month vesting schedule with regular monthly unlocks"
      },
      {
        symbol: "SAGA",
        name: "Saga",
        exchange: "Binance",
        listingDate: "Apr 9, 2024",
        initialFloat: "9.0",
        peakFdv: "$10.0B",
        listingPrice: "7.60",
        currentPrice: "0.22",
        athPrice: "7.53",
        performancePercent: "-97.1",
        athDeclinePercent: "-97.0",
        sector: "Layer-1",
        riskLevel: "CRITICAL",
        totalSupply: "1B",
        circulatingSupply: "90M",
        majorUnlockEvents: "176% annual inflation, 6-month pause implemented"
      },
      {
        symbol: "REZ",
        name: "Renzo",
        exchange: "Binance",
        listingDate: "Apr 30, 2024",
        initialFloat: "11.5",
        peakFdv: "$2.8B",
        listingPrice: "0.278",
        currentPrice: "0.008",
        athPrice: "0.2782",
        performancePercent: "-97.1",
        athDeclinePercent: "-97.0",
        sector: "Liquid Staking",
        riskLevel: "CRITICAL",
        totalSupply: "10B",
        circulatingSupply: "1.15B",
        majorUnlockEvents: "Complex vesting with 1-year cliff then linear"
      },
      {
        symbol: "MANTA",
        name: "Manta Network",
        exchange: "Binance",
        listingDate: "Jan 18, 2024",
        initialFloat: "25.1",
        peakFdv: "$3.0B",
        listingPrice: "2.50",
        currentPrice: "0.17",
        athPrice: "4.08",
        performancePercent: "-93.2",
        athDeclinePercent: "-95.8",
        sector: "Layer-1",
        riskLevel: "HIGH",
        totalSupply: "1B",
        circulatingSupply: "251M",
        majorUnlockEvents: "Regular monthly unlocks to investors and advisors"
      },
      {
        symbol: "ALT",
        name: "AltLayer",
        exchange: "Binance",
        listingDate: "Jan 25, 2024",
        initialFloat: "11.0",
        peakFdv: "$3.2B",
        listingPrice: "0.32",
        currentPrice: "0.03",
        athPrice: "0.68",
        performancePercent: "-90.6",
        athDeclinePercent: "-95.6",
        sector: "Rollup Service",
        riskLevel: "CRITICAL",
        totalSupply: "10B",
        circulatingSupply: "1.1B",
        majorUnlockEvents: "July 25, 2024 - 684M ALT unlocked, 6-month pause"
      },
      {
        symbol: "ENA",
        name: "Ethena",
        exchange: "Binance, Bybit",
        listingDate: "Apr 2, 2024",
        initialFloat: "9.5",
        peakFdv: "$22.8B",
        listingPrice: "1.52",
        currentPrice: "0.25",
        athPrice: "1.52",
        performancePercent: "-83.6",
        athDeclinePercent: "-83.5",
        sector: "DeFi Protocol",
        riskLevel: "HIGH",
        totalSupply: "15B",
        circulatingSupply: "1.425B",
        majorUnlockEvents: "Regular monthly unlocks from May 2024"
      },
      {
        symbol: "W",
        name: "Wormhole",
        exchange: "Binance",
        listingDate: "Apr 3, 2024",
        initialFloat: "1.8",
        peakFdv: "$18.0B",
        listingPrice: "1.66",
        currentPrice: "0.21",
        athPrice: "1.84",
        performancePercent: "-87.3",
        athDeclinePercent: "-88.6",
        sector: "Cross-chain",
        riskLevel: "CRITICAL",
        totalSupply: "10B",
        circulatingSupply: "180M",
        majorUnlockEvents: "Ongoing team and investor vesting"
      }
    ];

    failedTokens.forEach(token => {
      this.createToken(token);
    });
  }

  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async getTokenById(id: number): Promise<Token | undefined> {
    return this.tokens.get(id);
  }

  async getTokenBySymbol(symbol: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(token => token.symbol === symbol);
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = this.currentTokenId++;
    const token: Token = { ...insertToken, id };
    this.tokens.set(id, token);
    return token;
  }

  async getUnlockEventsByTokenId(tokenId: number): Promise<UnlockEvent[]> {
    return Array.from(this.unlockEvents.values()).filter(event => event.tokenId === tokenId);
  }

  async createUnlockEvent(insertEvent: InsertUnlockEvent): Promise<UnlockEvent> {
    const id = this.currentUnlockEventId++;
    const event: UnlockEvent = { 
      ...insertEvent, 
      id,
      priceImpact: insertEvent.priceImpact || null
    };
    this.unlockEvents.set(id, event);
    return event;
  }

  async getPriceHistoryByTokenId(tokenId: number): Promise<PriceHistory[]> {
    return Array.from(this.priceHistory.values()).filter(history => history.tokenId === tokenId);
  }

  async createPriceHistory(insertHistory: InsertPriceHistory): Promise<PriceHistory> {
    const id = this.currentPriceHistoryId++;
    const history: PriceHistory = { 
      ...insertHistory, 
      id,
      marketCap: insertHistory.marketCap || null,
      volume: insertHistory.volume || null
    };
    this.priceHistory.set(id, history);
    return history;
  }

  async getTopFailures(): Promise<Token[]> {
    const tokens = Array.from(this.tokens.values());
    return tokens.sort((a, b) => parseFloat(a.performancePercent) - parseFloat(b.performancePercent)).slice(0, 5);
  }

  async getUpcomingUnlocks(): Promise<(UnlockEvent & { token: Token })[]> {
    const events = Array.from(this.unlockEvents.values());
    const tokens = Array.from(this.tokens.values());
    
    return events.map(event => {
      const token = tokens.find(t => t.id === event.tokenId);
      return { ...event, token: token! };
    }).filter(event => event.token);
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Token operations
  async getAllTokens(): Promise<Token[]> {
    return await db.select().from(tokens);
  }

  async getTokenById(id: number): Promise<Token | undefined> {
    const [token] = await db.select().from(tokens).where(eq(tokens.id, id));
    return token;
  }

  async getTokenBySymbol(symbol: string): Promise<Token | undefined> {
    const [token] = await db.select().from(tokens).where(eq(tokens.symbol, symbol));
    return token;
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const [token] = await db.insert(tokens).values(insertToken).returning();
    return token;
  }

  // Unlock event operations
  async getUnlockEventsByTokenId(tokenId: number): Promise<UnlockEvent[]> {
    return await db.select().from(unlockEvents).where(eq(unlockEvents.tokenId, tokenId));
  }

  async createUnlockEvent(insertEvent: InsertUnlockEvent): Promise<UnlockEvent> {
    const [event] = await db.insert(unlockEvents).values(insertEvent).returning();
    return event;
  }

  // Price history operations
  async getPriceHistoryByTokenId(tokenId: number): Promise<PriceHistory[]> {
    return await db.select().from(priceHistory).where(eq(priceHistory.tokenId, tokenId));
  }

  async createPriceHistory(insertHistory: InsertPriceHistory): Promise<PriceHistory> {
    const [history] = await db.insert(priceHistory).values(insertHistory).returning();
    return history;
  }

  // Analytics
  async getTopFailures(): Promise<Token[]> {
    return await db
      .select()
      .from(tokens)
      .orderBy(sql`CAST(${tokens.performancePercent} AS REAL) ASC`)
      .limit(5);
  }

  async getUpcomingUnlocks(): Promise<(UnlockEvent & { token: Token })[]> {
    const results = await db
      .select({
        id: unlockEvents.id,
        tokenId: unlockEvents.tokenId,
        unlockDate: unlockEvents.unlockDate,
        tokensUnlocked: unlockEvents.tokensUnlocked,
        percentOfSupply: unlockEvents.percentOfSupply,
        priceImpact: unlockEvents.priceImpact,
        description: unlockEvents.description,
        token: tokens,
      })
      .from(unlockEvents)
      .innerJoin(tokens, eq(unlockEvents.tokenId, tokens.id))
      .where(gte(unlockEvents.unlockDate, sql`NOW()`))
      .orderBy(unlockEvents.unlockDate);

    return results.map(result => ({
      id: result.id,
      tokenId: result.tokenId,
      unlockDate: result.unlockDate,
      tokensUnlocked: result.tokensUnlocked,
      percentOfSupply: result.percentOfSupply,
      priceImpact: result.priceImpact,
      description: result.description,
      token: result.token,
    }));
  }
}

// Use DatabaseStorage for production, MemStorage for development
export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new MemStorage();
