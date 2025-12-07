export interface User {
  id: string;
  fid: number;
  username: string | null;
  evm_wallet: string | null;
  sol_wallet: string | null;
  created_at: string;
}

export interface AIJobRequest {
  featureType: string;
  model: string;
  prompt: string;
  priceUsd: number;
  userId: string;
}

export interface AIJobResponse {
  id: string;
  output: string;
  model: string;
}

export interface PaymentRequest {
  userId: string;
  chain: string;
  txHash: string;
  tokenSymbol: string;
  amount: string;
  usdEquiv: number;
  featureType: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
}

export interface Contest {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  type: string;
  entry_fee_usd: number;
  platform_fee_bp: number;
  status: string;
  total_pot_usd: number;
  chain: string;
  created_at: string;
  ends_at: string;
}

export interface ContestEntry {
  id: string;
  contest_id: string;
  user_id: string;
  content_type: string;
  content: string;
  created_at: string;
  votes?: number;
}

export const OPENROUTER_MODELS = [
  'meituan/longcat-flash-chat:free',
  'openai/gpt-oss-20b:free',
  'z-ai/glm-4.5-air:free',
  'moonshotai/kimi-k2:free',
  'google/gemma-3n-e2b-it:free',
  'tencent/hunyuan-a13b-instruct:free',
  'tngtech/deepseek-r1t2-chimera:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
  'moonshotai/kimi-dev-72b:free',
  'deepseek/deepseek-r1-0528:free',
  'mistralai/devstral-small-2505:free',
  'google/gemma-3n-e4b-it:free',
  'meta-llama/llama-3.3-8b-instruct:free',
  'qwen/qwen3-4b:free',
  'qwen/qwen3-30b-a3b:free',
  'deepseek/deepseek-chat-v3.1:free',
  'minimax/minimax-m2:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
] as const;

export const SUPPORTED_CHAINS = [
  'Base',
  'Solana',
  'BSC',
  'Ethereum',
  'Arbitrum',
  'Monad',
  'HyperEVM',
  'Celo',
] as const;

export const FEATURE_PRICING: Record<string, { min: number; max: number }> = {
  // Original Features
  memecoin_quick: { min: 0.75, max: 1.5 },
  memecoin_full: { min: 3.0, max: 5.0 },
  memecoin_helpers: { min: 1.0, max: 3.0 },
  nft_idea: { min: 0.75, max: 1.5 },
  meme_pack: { min: 1.0, max: 3.0 },
  viral_scout: { min: 0.75, max: 2.0 },
  narrative_report: { min: 3.0, max: 5.0 },
  
  // New Integration Features
  nft_mint: { min: 2.0, max: 3.0 },
  memecoin_launch: { min: 3.0, max: 5.0 },
  market_analysis: { min: 1.0, max: 2.0 },
  builder_reputation: { min: 0.75, max: 1.5 },
  token_price: { min: 0.75, max: 1.0 },
  contract_interaction: { min: 2.0, max: 3.0 },
  ai_research: { min: 1.0, max: 2.0 },
  lens_post: { min: 1.5, max: 2.5 },
};
