export const SecurityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  session: {
    expirationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  password: {
    minLength: 12,
  },
  csrf: {
    enabled: true,
  },
};
