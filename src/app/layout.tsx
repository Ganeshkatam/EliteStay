import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import '@/config/env';

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
  console.time('RootLayout-Boot');

  const layout = (
    <html lang="en" className={`${plusJakartaSans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );

  console.timeEnd('RootLayout-Boot');
  return layout;
}
