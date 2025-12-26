export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'crypto_sentinel',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  binance: {
    wsUrl: process.env.BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws',
    apiUrl: process.env.BINANCE_API_URL || 'https://api.binance.com',
    apiKey: process.env.BINANCE_API_KEY || '',
    secretKey: process.env.BINANCE_SECRET_KEY || '',
    futuresApiUrl: process.env.BINANCE_FUTURES_API_URL || 'https://fapi.binance.com',
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'deepseek', // 'deepseek' or 'claude'
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    },
    claude: {
      apiKey: process.env.CLAUDE_API_KEY || '',
    },
  },

  bark: {
    key: process.env.BARK_KEY || '',
    url: process.env.BARK_URL || 'https://api.day.app',
  },

  monitor: {
    volatilityThreshold: parseFloat(process.env.VOLATILITY_THRESHOLD || '10'),
    interval: parseInt(process.env.MONITOR_INTERVAL || '1000', 10),
    priceHistorySize: parseInt(process.env.PRICE_HISTORY_SIZE || '900', 10),
  },

  futures: {
    monitorInterval: parseInt(process.env.FUTURES_MONITOR_INTERVAL || '10000', 10),
    priceDropThreshold: parseFloat(process.env.FUTURES_PRICE_DROP_THRESHOLD || '5'),
    timeframe: parseInt(process.env.FUTURES_TIMEFRAME || '300000', 10),
  },
});
