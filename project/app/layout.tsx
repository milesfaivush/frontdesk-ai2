import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProviderWrapper } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FrontDesk AI - Your AI Employee That Never Sleeps',
  description: 'Answer calls, book appointments, qualify leads, follow up with customers, and grow your business automatically.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
