import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recordBusinessEvent } from '@/lib/observability/events/business-events';
import { auditLogger } from '@/lib/audit/audit-logger';
import { AuditEventType } from '@/lib/audit/audit-events';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Open redirect protection: ensure next is a relative path
  const nextParam = searchParams.get('next') ?? '/';
  const safeNext =
    nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

  if (error) {
    recordBusinessEvent(
      'AUTH_LOGIN_FAILED',
      { provider: 'oauth', error },
      { errorDescription }
    );
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    recordBusinessEvent('AUTH_LOGIN_STARTED', { provider: 'oauth' });

    // Exchange the authorization code for a session
    const {
      data: { user },
      error: exchangeError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && user) {
      // The session has been established
      recordBusinessEvent('AUTH_LOGIN_SUCCESS', {
        provider: 'oauth',
        userId: user.id,
      });

      // Audit Logging
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        undefined;
      const userAgent = request.headers.get('user-agent') || undefined;

      await auditLogger.log(
        AuditEventType.USER_SIGNED_IN,
        user.id,
        { provider: user.app_metadata?.provider || 'oauth' },
        undefined,
        ipAddress,
        userAgent
      );

      // Redirect the user to their safe destination.
      // This automatically resumes reservations or onboarding if safeNext is set to those routes.
      return NextResponse.redirect(`${origin}${safeNext}`);
    } else {
      console.error(
        'OAuth Callback Error exchanging code for session:',
        exchangeError?.message
      );
      recordBusinessEvent('AUTH_LOGIN_FAILED', {
        provider: 'oauth',
        error: exchangeError?.message || 'unknown',
      });
    }
  }

  // If there's no code or there was an error exchanging the code
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
