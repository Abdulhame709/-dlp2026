import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cortex AI - AI Productivity Operating System',
  description: 'Your intelligent AI executive assistant that plans, organizes, and improves your productivity every day.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
