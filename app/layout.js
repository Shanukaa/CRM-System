import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata = {
  title: 'Clinic Manager',
  description: 'Client & appointment management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 text-slate-800 antialiased font-sans">{children}</body>
    </html>
  );
}
