import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum([
    'development',
    'test',
    'production',
  ]),

  PORT: z.coerce.number(),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string(),

  REDIS_PORT: z.coerce.number(),

  JWT_SECRET: z.string().min(32),
});

export type Env = z.infer<typeof envSchema>;