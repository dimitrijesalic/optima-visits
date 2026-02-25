const nextConfig = {
  env: {
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
}

module.exports = nextConfig
