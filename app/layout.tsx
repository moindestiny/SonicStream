import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';
import QueryProvider from '@/components/QueryProvider';
import ThemeProvider from '@/components/ThemeProvider';
import { Plus_Jakarta_Sans } from 'next/font/google';
import ToasterWrapper from '@/components/ToasterWrapper';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-main',
});

export const metadata: Metadata = {
  title: 'SonicStream — Feel the Music',
  description: 'A unique music streaming experience. Discover, stream and download high-quality music.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${font.className} overflow-hidden`}
        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ThemeProvider>
            <div className="flex flex-col h-screen w-full relative">
              <Sidebar />
              <main className="flex-1 overflow-y-auto pb-28 md:pb-32 pt-0 md:pt-20 relative">
                <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto">
                  {children}
                </div>
              </main>
              <Player />
            </div>
            <ToasterWrapper />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
