import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DEGENZ GEN/Z HUB - AI-Powered Memecoin & NFT Creator',
    short_name: 'DEGENZ HUB',
    description: 'Create viral memecoins, NFTs, and crypto content with AI. Multi-chain payments, contests, and referrals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#7c3aed',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['finance', 'utilities', 'productivity', 'entertainment'],
    screenshots: [
      {
        src: '/screenshot-1.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'DEGENZ HUB Home - AI-Powered Features',
      },
      {
        src: '/screenshot-2.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Contest Creation Interface',
      },
    ],
    shortcuts: [
      {
        name: 'Create Memecoin',
        short_name: 'Memecoin',
        description: 'Generate AI-powered memecoin concepts',
        url: '/?feature=memecoin',
        icons: [{ src: '/icon-coin.png', sizes: '96x96' }],
      },
      {
        name: 'Browse Contests',
        short_name: 'Contests',
        description: 'Join crypto contests and win prizes',
        url: '/contests',
        icons: [{ src: '/icon-trophy.png', sizes: '96x96' }],
      },
      {
        name: 'Referral Dashboard',
        short_name: 'Referrals',
        description: 'Track your earnings and referrals',
        url: '/referrals',
        icons: [{ src: '/icon-users.png', sizes: '96x96' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
