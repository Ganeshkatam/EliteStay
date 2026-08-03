export enum SecurityEventType {
  LOGIN_FAILED = 'LoginFailed',
  LOGIN_SUCCESS = 'LoginSuccess',
  RATE_LIMIT_EXCEEDED = 'RateLimitExceeded',
  SUSPICIOUS_IP_DETECTED = 'SuspiciousIpDetected',
  ACCOUNT_LOCKED = 'AccountLocked',
  CSRF_VALIDATION_FAILED = 'CsrfValidationFailed',
}
