import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from './storage';

interface InsertToken {
  symbol: string;
  name: string;
  exchange: string;
  listingDate: string;
  initialFloat: string;
  peakFdv: string;
  listingPrice: string;
  currentPrice: string;
  athPrice: string;
  performancePercent: string;
  athDeclinePercent: string;
  sector: string;
  riskLevel: string;
  totalSupply: string;
  circulatingSupply: string;
  majorUnlockEvents: string;
}

const baseToken: InsertToken = {
  symbol: 'TST',
  name: 'Test Token',
  exchange: 'TestEx',
  listingDate: '',
  initialFloat: '',
  peakFdv: '',
  listingPrice: '',
  currentPrice: '',
  athPrice: '',
  performancePercent: '',
  athDeclinePercent: '',
  sector: '',
  riskLevel: '',
  totalSupply: '',
  circulatingSupply: '',
  majorUnlockEvents: ''
};

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  it('creates and retrieves a token by id', async () => {
    const created = await storage.createToken(baseToken);
    const fetched = await storage.getTokenById(created.id);
    expect(fetched).toEqual(created);
  });

  it('lists all tokens including newly created ones', async () => {
    const created = await storage.createToken({ ...baseToken, symbol: 'NEW' });
    const all = await storage.getAllTokens();
    expect(all.some(t => t.id === created.id)).toBe(true);
  });
});
