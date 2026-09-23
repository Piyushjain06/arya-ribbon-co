import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Arya Ribbon Company — B2B Sales Intelligence Dashboard',
  description:
    'Real-time B2B client segmentation dashboard for Arya Ribbon Company. Powered by RFM analysis and K-Means clustering on PostgreSQL data.',
  keywords: ['B2B', 'ribbon', 'MSME', 'dashboard', 'RFM', 'client segmentation', 'India'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-[#090c12]">{children}</body>
    </html>
  );
}
