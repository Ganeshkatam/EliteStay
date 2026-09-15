import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import '@/config/env';
import { InactivityRefresh } from '@/components/common/InactivityRefresh';
import { AppUpdatePrompt } from '@/components/common/AppUpdatePrompt';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://elite-stay-one.vercel.app'
  ),
  title: {
    default: 'EliteStay | Premium Accommodation & Living',
    template: '%s | EliteStay',
  },
  description:
    'Discover, compare, and book exceptional PG accommodations, student hostels, and premium living spaces.',
  openGraph: {
    title: 'EliteStay | Premium Accommodation & Living',
    description:
      'Discover, compare, and book exceptional PG accommodations, student hostels, and premium living spaces.',
    siteName: 'EliteStay',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layout = (
    <html lang="en" className={`${plusJakartaSans.variable}`}>
      <head>
        <link
          rel="preconnect"
          href="https://tiles.openfreemap.org"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://tiles.openfreemap.org" />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <InactivityRefresh />
        <AppUpdatePrompt />
        <Suspense>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  );

  return layout;
}
