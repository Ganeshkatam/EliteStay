import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import '@/config/env';
import { InactivityRefresh } from '@/components/common/InactivityRefresh';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EliteStay | Premium Hospitality',
  description: 'Book exceptional listings worldwide.',
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
        <Suspense>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  );

  return layout;
}
