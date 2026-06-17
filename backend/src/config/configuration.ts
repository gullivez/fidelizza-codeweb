export default () => ({
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),

  database: {
    url: process.env.DATABASE_URL,
    migrationUrl: process.env.DATABASE_MIGRATION_URL,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },

  aesSecret: process.env.AES_SECRET,
  integrationAdapter: process.env.INTEGRATION_ADAPTER ?? 'mock',

  whatsapp: {
    provider: process.env.WHATSAPP_PROVIDER ?? 'mock',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      from: process.env.TWILIO_WHATSAPP_FROM,
      statusWebhookSecret: process.env.TWILIO_STATUS_WEBHOOK_SECRET,
    },
  },

  campaign: {
    rateLimitPerSec: Number(process.env.CAMPAIGN_RATE_LIMIT_PER_SEC ?? 10),
  },

  app: {
    baseUrl: process.env.APP_BASE_URL ?? 'http://localhost:3000',
  },
});
