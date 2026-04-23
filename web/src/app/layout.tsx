import type { Metadata } from 'next';
import { DM_Sans, Orbitron } from 'next/font/google';
import { headers } from 'next/headers';
import { cookieToInitialState } from 'wagmi';

import { Web3Provider } from '@/components/providers/Web3Provider';
import { config } from '@/lib/wagmi/config';

import './globals.css';

const display = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
});

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? 'airport-control-dev';

/** Resolves OG / Twitter absolute URLs; avoids Next.js metadataBase warning when env is missing. */
function getMetadataBase(): URL {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    return new URL(site);
  }
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return new URL(`https://${vercel}`);
  }
  return new URL('http://localhost:3000');
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'Airport Control',
  description: 'Neon air traffic control on Base',
  icons: {
    icon: '/app-icon.jpg',
    apple: '/app-icon.jpg',
  },
  openGraph: {
    images: ['/app-thumbnail.jpg'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const cookie = headerList.get('cookie');
  const initialState = cookieToInitialState(config, cookie ?? undefined);

  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body
        className={`${display.variable} ${body.variable} min-h-dvh bg-[#050508] font-sans antialiased text-slate-100`}
      >
        <Web3Provider initialState={initialState}>{children}</Web3Provider>
      </body>
    </html>
  );
}
