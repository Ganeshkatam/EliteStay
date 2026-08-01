import { createClient } from '@/lib/supabase/server';
import { User, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';
import { randomUUID } from 'crypto';
import { checkRateLimit } from './rate-limiter';

type ActionState<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

export async function safeAction<T>(
  actionFn: (user: User, supabase: SupabaseClient) => Promise<T>
): Promise<ActionState<T>> {
  const traceId = randomUUID();
  const startTime = Date.now();
  let actionLogger = logger.child({ traceId, action: actionFn.name || 'anonymous_action' });

  try {
    const supabase = await createClient();
    
    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      actionLogger.warn({ status: 'unauthorized', durationMs: Date.now() - startTime }, 'Unauthorized action attempt');
      return { error: 'Unauthorized. Please log in.' };
    }

    actionLogger = actionLogger.child({ userId: user.id });

    // Rate Limiting
    const rateLimit = checkRateLimit(user.id, actionFn.name || 'anonymous');
    if (!rateLimit.success) {
      actionLogger.warn({ status: 'rate_limited', durationMs: Date.now() - startTime }, 'Rate limit exceeded');
      return { error: 'Too many requests. Please try again later.' };
    }

    // Execute with validated user
    const data = await actionFn(user, supabase);
    const durationMs = Date.now() - startTime;
    
    const logData = { status: 'success', durationMs };
    if (durationMs > 1000) {
      actionLogger.error(logData, 'Action completed very slowly');
    } else if (durationMs > 500) {
      actionLogger.warn(logData, 'Action completed slowly');
    } else if (durationMs > 100) {
      actionLogger.info(logData, 'Action completed normally');
    } else {
      actionLogger.debug(logData, 'Action completed fast');
    }
    
    return { success: true, data };
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    
    // Prevent leaking SQL errors or sensitive backend info
    const err = error as { code?: string; message?: string };
    
    actionLogger.error({ status: 'error', durationMs, errCode: err.code, errMsg: err.message }, 'Server Action Error');

    if (err.code && err.code.startsWith('23')) {
      return { error: 'A data conflict occurred. Please try again.' };
    }
    
    return { error: err.message || 'An unexpected error occurred.' };
  }
}
