import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  // Only handle session refreshing and attach auth context.
  // We do NOT handle business authorization here.
  // That belongs in Server Actions and Route Handlers.
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/internal (health checks)
     * - _next (Next.js internal mechanics)
     * - static files / assets
     */
    '/((?!api/internal|_next|favicon.ico|.*\\.(?:css|js|svg|png|jpg|jpeg|gif|webp|ico|json|txt|woff2?)$).*)',
  ],
};
