import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string(),
  DATABASE_MIGRATION_URL: z.string().optional(),

  REDIS_HOST: z.string(),

  REDIS_PORT: z.coerce.number(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET deve ter no mínimo 32 caracteres'),

  AES_SECRET: z.string().min(32, 'AES_SECRET deve ter no mínimo 32 caracteres'),

  INTEGRATION_ADAPTER: z.enum(['anota_ai', 'mock']).default('mock'),

  WHATSAPP_PROVIDER: z.enum(['twilio', 'mock']).default('mock'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  TWILIO_STATUS_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
