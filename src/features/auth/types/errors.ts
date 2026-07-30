export type AuthErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'validation_error'
  | 'conflict'
  | 'server_error';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface AuthResult<T = void> {
  data?: T;
  error?: AuthError;
}
