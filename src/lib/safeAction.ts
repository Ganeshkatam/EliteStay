import { createClient } from '@/lib/supabase/server';
import { User, SupabaseClient } from '@supabase/supabase-js';
import { checkRateLimit } from './security/rate-limiter';
import {
  instrumentExecution,
  RequestContext,
  logger,
} from '@/lib/observability';

type ActionState<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

export async function safeAction<T>(
  actionFn: (user: User, supabase: SupabaseClient) => Promise<T>
): Promise<ActionState<T>> {
  const actionName = actionFn.name || 'anonymous_action';

  return instrumentExecution(
    actionName,
    'ACTION',
    async () => {
      try {
        const supabase = await createClient();

        // Authenticate within action trace
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          logger
            .category('AUTH')
            .warn('Unauthorized action attempt', { action: actionName });
          return { error: 'Unauthorized. Please log in.' };
        }

        // Attach user identity metadata to active trace and all subsequent child spans
        RequestContext.setAttribute('userId', user.id);

        // Rate Limiting verification
        const rateLimit = checkRateLimit(user.id, actionName);
        if (!rateLimit.success) {
          logger
            .category('SECURITY')
            .warn('Rate limit exceeded for user action', {
              action: actionName,
              userId: user.id,
            });
          return { error: 'Too many requests. Please try again later.' };
        }

        // Execute action domain logic
        const data = await actionFn(user, supabase);
        logger
          .category('ACTION')
          .info(`Action completed successfully: ${actionName}`, {
            userId: user.id,
          });

        return { success: true, data };
      } catch (error: unknown) {
        const err = error as {
          code?: string;
          message?: string;
          stack?: string;
        };
        logger
          .category('ERROR')
          .error(`Server action execution error in ${actionName}`, {
            errCode: err.code,
            errMsg: err.message,
          });

        if (err.code && err.code.startsWith('23')) {
          return { error: 'A data conflict occurred. Please try again.' };
        }

        return { error: err.message || 'An unexpected error occurred.' };
      }
    },
    { action: actionName }
  );
}
