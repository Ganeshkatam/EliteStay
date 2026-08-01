import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import '@/config/env';
import { Header } from '@/components/header/Header';
import { HeaderWrapper } from '@/components/header/HeaderWrapper';
import { Footer } from '@/components/navigation/Footer';
import { FooterWrapper } from '@/components/navigation/FooterWrapper';
import { SearchProvider } from '@/features/search/components/GlobalSearch/SearchContext';

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
  return (
    <html lang="en" className={`${plusJakartaSans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Suspense>
          <SearchProvider>
            <div className="flex flex-1 flex-col font-sans min-h-0">
              <HeaderWrapper>
                <Header />
              </HeaderWrapper>
              <main className="flex-1 flex flex-col min-h-0">{children}</main>
              <FooterWrapper>
                <Footer />
              </FooterWrapper>
            </div>
          </SearchProvider>
        </Suspense>
      </body>
    </html>
  );
}
