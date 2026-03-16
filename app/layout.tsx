import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';
import QueryProvider from '@/components/QueryProvider';
import ThemeProvider from '@/components/ThemeProvider';
import { Plus_Jakarta_Sans } from 'next/font/google';
import ToasterWrapper from '@/components/ToasterWrapper';
import PWARegister from '@/components/PWARegister';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-main',
});

export const metadata: Metadata = {
  title: 'SonicStream — Free Music Streaming & Download',
  description: 'Stream and download millions of songs for free. Discover trending music, create playlists, and enjoy high-quality audio with SonicStream.',
  keywords: ['music streaming', 'free music', 'download songs', 'online music', 'music player', 'Bollywood songs', 'trending music', 'playlists'],
  authors: [{ name: 'SonicStream' }],
  creator: 'SonicStream',
  publisher: 'SonicStream',
  robots: 'index, follow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SonicStream',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', sizes: '192x192' },
      { url: '/icon.png', sizes: '512x512' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sonic-stream-fawn.vercel.app',
    siteName: 'SonicStream',
    title: 'SonicStream — Free Music Streaming & Download',
    description: 'Stream and download millions of songs for free. Discover trending music, create playlists, and enjoy high-quality audio.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SonicStream - Music Streaming',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SonicStream — Free Music Streaming & Download',
    description: 'Stream and download millions of songs for free. Discover trending music, create playlists, and enjoy high-quality audio.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://sonic-stream-fawn.vercel.app',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
    { media: '(prefers-color-scheme: light)', color: '#f5f3f0' },
  ],
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${font.className}`}
        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen w-full relative">
              <Sidebar />
              <main className="flex-1 pt-0 md:pt-[var(--header-height)] relative">
                <div className="relative z-10 w-full max-w-[1600px] mx-auto">
                  {children}
                  {/* Persistent Bottom Spacer to prevent clipping by Fixed Player and Mobile Nav */}
                  <div className="h-[200px] md:h-[120px] w-full flex-shrink-0" aria-hidden="true" />
                </div>
              </main>
              <Player />
            </div>
            <ToasterWrapper />
            <PWARegister />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
