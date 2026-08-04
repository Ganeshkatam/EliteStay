import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // The 'next' param is used to preserve the user's intended destination (e.g. /reserve/abc)
  // If there's no next param, default to the root '/'
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();

    // Exchange the authorization code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // The session has been established. Redirect the user to their destination.
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error(
        'OAuth Callback Error exchanging code for session:',
        error.message
      );
    }
  }

  // If there's no code or there was an error exchanging the code, redirect to login
  // with an error state (or just back to login for now).
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
