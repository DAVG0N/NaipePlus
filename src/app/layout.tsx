import type { Metadata } from 'next';
import './globals.css';
import AppProviders from './providers';
import Navbar from '@/components/Navbar';
import PreviewModal from '@/components/PreviewModal';
import VideoPlayer from '@/components/VideoPlayer';
import NotificationMonitor from '@/components/NotificationMonitor';
import AuthListener from '@/components/AuthListener';

export const metadata: Metadata = {
  title: 'NAIPE+ | Streaming de Filmes & Séries',
  description: 'Plataforma de streaming de filmes e séries de alta velocidade com múltiplos servidores.',
  icons: {
    icon: [
      { url: '/logo_naipe.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo_naipe.svg',
    apple: '/logo_naipe.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="bg-netflix-black text-white antialiased">
        <AppProviders>
          <AuthListener />
          <NotificationMonitor />
          <Navbar />
          <main className="relative min-h-screen">{children}</main>
          <PreviewModal />
          <VideoPlayer />
        </AppProviders>
      </body>
    </html>
  );
}
