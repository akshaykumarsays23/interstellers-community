import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { MusicProvider } from '@/lib/MusicContext';
import { SpaceCanvasBackground } from '@/components/common/SpaceCanvasBackground';

export const metadata: Metadata = {
  metadataBase: new URL('https://interstellers.vercel.app'),
  title: 'Interstellers — Professional Galactic Networking | interstellers.vercel.app',
  description:
    'Join Interstellers — "Time is never coming back, remember time is never..." Connect with fellows, explore Space Houses, collaborate across stations, and experience real-time community networking at https://interstellers.vercel.app.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Interstellers — interstellers.vercel.app',
    description: 'Time is never coming back, remember time is never... Join the verified professional galaxy.',
    url: 'https://interstellers.vercel.app',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('interstellers_theme');
                if (t === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-on-background min-h-screen antialiased selection:bg-primary selection:text-on-primary">
        <AppProvider>
          <MusicProvider>
            <SpaceCanvasBackground />
            {children}
          </MusicProvider>
        </AppProvider>
      </body>
    </html>
  );
}


