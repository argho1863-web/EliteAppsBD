import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import LanguagePrompt from '@/components/LanguagePrompt';

const geist = Geist({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'EliteApps BD — Apps, subscriptions and top-ups',
  description: 'Buy apps, subscriptions and top-ups in Bangladesh. Pay with bKash, Nagad, Rocket or Upay. Delivered to WhatsApp or email within 48 hours.',
  keywords: 'digital products, apps, software, Bangladesh, bKash, Nagad',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-body bg-brand-navy text-white antialiased">
        <Providers>
          <LanguagePrompt />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1E28',
                color: '#EEF0F5',
                border: '1px solid rgba(238,240,245,0.08)',
                borderRadius: '10px',
                fontSize: '14px',
                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.5)',
              },
              success: { iconTheme: { primary: '#F0A500', secondary: '#0B0D14' } },
              error: { iconTheme: { primary: '#E5484D', secondary: '#0B0D14' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
