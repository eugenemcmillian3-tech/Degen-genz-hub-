/**
 * DEGENZ GEN/Z HUB - Global Constants
 * 
 * This file contains all hardcoded values and configuration for the app
 */

// Owner Information
export const OWNER_FID = 1378286;

// Payment Wallet Addresses
export const PAYMENT_WALLETS = {
  EVM: '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3', // Base, BSC, Ethereum, Arbitrum, Monad, HyperEVM, Celo
  SOLANA: 'BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7',
} as const;

// Supported Chains
export const CHAIN_CONFIG = {
  Base: { 
    wallet: PAYMENT_WALLETS.EVM, 
    type: 'EVM',
    chainId: 8453,
  },
  Solana: { 
    wallet: PAYMENT_WALLETS.SOLANA, 
    type: 'SOLANA',
  },
  BSC: { 
    wallet: PAYMENT_WALLETS.EVM, 
    type: 'EVM',
    chainId: 56,
  },
  Ethereum: { 
    wallet: PAYMENT_WALLETS.EVM, 
    type: 'EVM',
    chainId: 1,
  },
  Arbitrum: { 
    wallet: PAYMENT_WALLETS.EVM, 
    type: 'EVM',
    chainId: 42161,
  },
  Monad: { 
    wallet: PAYMENT_WALLETS.EVM, 
    type: 'EVM',
  },
  HyperEVM: { 
    wallet: PAYMENT_WALLETS.EVM, 
    type: 'EVM',
  },
  Celo: { 
    wallet: PAYMENT_WALLETS.EVM, 
    type: 'EVM',
    chainId: 42220,
  },
} as const;

// Global Pricing Constraints
export const GLOBAL_PRICING = {
  MIN_USD: 0.75,
  MAX_USD: 5.00,
} as const;

// Referral Configuration
export const REFERRAL_CONFIG = {
  DEFAULT_COMMISSION_PERCENT: 0.10, // 10%
  MIN_COMMISSION_PERCENT: 0.05, // 5%
  MAX_COMMISSION_PERCENT: 0.20, // 20%
  CODE_LENGTH: 8,
} as const;

// Contest Configuration
export const CONTEST_CONFIG = {
  DEFAULT_PLATFORM_FEE_BP: 2000, // 20% (2000 basis points)
  MIN_PLATFORM_FEE_BP: 1000, // 10%
  MAX_PLATFORM_FEE_BP: 3000, // 30%
  TYPES: ['memecoin', 'meme_thread', 'nft_concept'] as const,
} as const;

// AI Feature Configuration
export const AI_FEATURE_CONFIG = {
  DEFAULT_MODEL: 'meta-llama/llama-3.3-8b-instruct:free',
  MAX_PROMPT_LENGTH: 2000,
  MAX_OUTPUT_LENGTH: 10000,
} as const;

// Feature Pricing (all in USD, enforced globally between $0.75-$5.00)
export const FEATURE_PRICING = {
  // Original Features
  memecoin_quick: { min: 0.75, max: 1.50, default: 1.00 },
  memecoin_full: { min: 3.00, max: 5.00, default: 4.00 },
  memecoin_helpers: { min: 1.00, max: 3.00, default: 2.00 },
  nft_idea: { min: 0.75, max: 1.50, default: 1.00 },
  meme_pack: { min: 1.00, max: 3.00, default: 2.00 },
  viral_scout: { min: 0.75, max: 2.00, default: 1.50 },
  narrative_report: { min: 3.00, max: 5.00, default: 4.00 },
  
  // New Integration Features
  nft_mint: { min: 2.00, max: 3.00, default: 2.50 }, // Pinata NFT minting
  memecoin_launch: { min: 3.00, max: 5.00, default: 4.00 }, // Flaunch actual launch
  market_analysis: { min: 1.00, max: 2.00, default: 1.50 }, // Adjacent News markets
  builder_reputation: { min: 0.75, max: 1.50, default: 1.00 }, // Talent Protocol
  token_price: { min: 0.75, max: 1.00, default: 0.75 }, // 0x API prices
  contract_interaction: { min: 2.00, max: 3.00, default: 2.50 }, // Thirdweb
  ai_research: { min: 1.00, max: 2.00, default: 1.50 }, // Perplexity
  lens_post: { min: 1.50, max: 2.50, default: 2.00 }, // Lens Protocol
} as const;

// Feature Categories for UI Organization
export const FEATURE_CATEGORIES = {
  AI_GENERATION: ['memecoin_quick', 'memecoin_full', 'memecoin_helpers', 'nft_idea', 'meme_pack'],
  RESEARCH: ['viral_scout', 'narrative_report', 'market_analysis', 'ai_research'],
  BLOCKCHAIN: ['memecoin_launch', 'nft_mint', 'contract_interaction', 'token_price'],
  SOCIAL: ['lens_post', 'builder_reputation'],
} as const;

// API Rate Limits (per user per minute)
export const RATE_LIMITS = {
  AI_GENERATION: 5,
  PAYMENT_CREATION: 10,
  CONTEST_VOTING: 20,
} as const;
