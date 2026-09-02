import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import './globals.css';

const body = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
});

const display = Sora({
  variable: '--font-display',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Manufacturers Marketplace`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground text-sm">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
