import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WA Gateway',
  description: 'WhatsApp Gateway Monitor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-[#e2e2e2] font-mono min-h-screen">
        {children}
      </body>
    </html>
  );
}
