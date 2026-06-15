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
});