import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://noctra-atelier.racing-snipe-1210.chatgpt.site'),
  title: 'NOCTRA° — El futuro te queda bien',
  description: 'Moda de autor para moverse entre mundos. Descubre la Colección 01 de NOCTRA.',
  openGraph: {
    title: 'NOCTRA° — El futuro te queda bien',
    description: 'Prendas inteligentes. Siluetas precisas. Descubre la Colección 01.',
    images: [{ url: '/og.png', width: 1734, height: 907, alt: 'NOCTRA — El futuro te queda bien' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOCTRA° — El futuro te queda bien',
    description: 'Prendas inteligentes. Siluetas precisas. Descubre la Colección 01.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
