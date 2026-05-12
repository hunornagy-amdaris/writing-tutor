import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppHeader } from '@/modules/layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Writing Tutor',
  description: 'AI writing tutor',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
