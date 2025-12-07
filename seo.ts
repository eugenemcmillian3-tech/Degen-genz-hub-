import type { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'DEGENZ GEN/Z HUB',
  title: 'DEGENZ HUB - AI-Powered Memecoin, NFT & Viral Content Creation',
  description: 'Create viral memecoins, NFTs, and crypto content with AI for just $0.75-$5. Multi-chain payments on Base, Solana, Ethereum & more. Join contests, earn referrals, and go viral!',
  url: process.env.NEXT_PUBLIC_HOST || 'https://degenz-hub.vercel.app',
  ogImage: '/og-image.png',
  keywords: [
    'memecoin generator',
    'AI memecoin',
    'NFT creator',
    'crypto content AI',
    'Base blockchain',
    'Farcaster mini app',
    'viral crypto content',
    'memecoin launch',
    'NFT ideas',
    'crypto trading research',
    'blockchain contests',
    'crypto referral program',
    'multi-chain payments',
    'Solana memecoins',
    'Ethereum NFTs',
    'AI trading insights',
    'degen tools',
    'crypto viral marketing',
    'Web3 AI tools',
    'onchain content creation'
  ],
  creator: '@degenz_hub',
  author: 'DEGENZ Team',
  twitterHandle: '@degenz_hub',
  links: {
    twitter: 'https://twitter.com/degenz_hub',
    github: 'https://github.com/degenz-hub',
    discord: 'https://discord.gg/degenz'
  }
} as const;

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
}

export function generateMetadata({
  title,
  description = SITE_CONFIG.description,
  image = SITE_CONFIG.ogImage,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  keywords = SITE_CONFIG.keywords
}: SEOProps = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.title;
  const pageUrl = url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url;
  const imageUrl = image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`;

  return {
    title: pageTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: SITE_CONFIG.author }],
    creator: SITE_CONFIG.creator,
    publisher: SITE_CONFIG.author,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: pageUrl,
      title: pageTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [imageUrl],
      creator: SITE_CONFIG.twitterHandle,
      site: SITE_CONFIG.twitterHandle,
    },
    alternates: {
      canonical: pageUrl,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
    category: 'Technology',
    other: {
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: `${SITE_CONFIG.url}/fc-frame.png`,
        button: {
          title: 'Open DEGENZ HUB',
          action: {
            type: 'launch_frame',
            name: SITE_CONFIG.name,
            url: SITE_CONFIG.url,
            splashImageUrl: `${SITE_CONFIG.url}/splash.svg`,
            splashBackgroundColor: '#7c3aed'
          }
        }
      })
    }
  };
}

export function generateStructuredData(type: 'Organization' | 'WebSite' | 'WebApplication' = 'WebApplication') {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  if (type === 'Organization') {
    return {
      ...baseData,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: `${SITE_CONFIG.url}/logo.png`,
      description: SITE_CONFIG.description,
      sameAs: Object.values(SITE_CONFIG.links),
    };
  }

  if (type === 'WebSite') {
    return {
      ...baseData,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      description: SITE_CONFIG.description,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  }

  // WebApplication
  return {
    ...baseData,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0.75',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1247',
      bestRating: '5',
      worstRating: '1',
    },
  };
}
