import type { Metadata } from 'next';
import './globals.css';
import AppProviders from './providers';
import Navbar from '@/components/Navbar';
import PreviewModal from '@/components/PreviewModal';
import NotificationMonitor from '@/components/NotificationMonitor';

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
          <NotificationMonitor />
          <Navbar />
          <main className="relative min-h-screen">{children}</main>
          <PreviewModal />
        </AppProviders>
      </body>
    </html>
  );
}
