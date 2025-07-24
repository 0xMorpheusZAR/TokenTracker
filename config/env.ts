import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).default('8080'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  SESSION_SECRET: z.string().min(10).optional(),
  COINGECKO_KEY: z.string().optional(),
  VELO_KEY: z.string().optional(),
  DUNE_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
