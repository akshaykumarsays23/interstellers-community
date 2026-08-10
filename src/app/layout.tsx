import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.akshayweb.com'),
  title: 'Interstellers — Professional Networking | www.akshayweb.com',
  description:
    'Join Interstellers — "Time is never coming back, remember time is never..." Connect with friends, collaborate across galactic spaces, and experience real-time community networking at www.akshayweb.com.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Interstellers — www.akshayweb.com',
    description: 'Time is never coming back, remember time is never... Join the verified professional galaxy.',
    url: 'https://www.akshayweb.com',
    siteName: 'Interstellers',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Interstellers Logo',
      },
    ],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-on-background min-h-screen antialiased selection:bg-primary selection:text-on-primary">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
