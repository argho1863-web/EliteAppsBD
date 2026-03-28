import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'EliteApps BD — Premium Digital Products',
  description: 'Discover premium digital apps, tools, and software at EliteApps BD. Fast delivery, secure payments via bKash, Nagad, Rocket & Upay.',
  keywords: 'digital products, apps, software, Bangladesh, bKash, Nagad',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body className="font-body bg-brand-navy text-white antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1A2E',
                color: '#f1f5f9',
                border: '1px solid rgba(240,165,0,0.3)',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#F0A500', secondary: '#0A0A14' } },
              error: { iconTheme: { primary: '#E94560', secondary: '#0A0A14' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
