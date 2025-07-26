import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3333'),
  JWT_SECRET: z.string().min(10),
  DATABASE_URL: z.string().min(10),
});
