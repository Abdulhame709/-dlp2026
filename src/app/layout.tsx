import type { Metadata } from 'next';
import './globals.css';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Cortex AI - AI Productivity Operating System',
  description: 'Your intelligent AI executive assistant that plans, organizes, and improves your productivity every day.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve language from cookie for SSR-correct html lang attribute
  let lang = 'en';
  try {
    const cookieStore = await cookies();
    const langCookie = cookieStore.get('language');
    if (langCookie?.value === 'ar') {
      lang = 'ar';
    }
  } catch {
    // Fallback during static generation or when cookies unavailable
  }

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
