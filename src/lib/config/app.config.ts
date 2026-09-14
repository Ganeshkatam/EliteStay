export const APP_CONFIG = {
  name: 'EliteStay',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  apiPrefix: '/api',
};

export const AppConfig = APP_CONFIG;
