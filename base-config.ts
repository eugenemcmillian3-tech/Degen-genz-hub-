/**
 * Base Network Configuration
 * Chain IDs, RPC URLs, and network settings
 */

import { base, baseSepolia } from 'viem/chains';
import type { Chain } from 'viem/chains';

export const SUPPORTED_BASE_CHAINS = {
  mainnet: base,
  testnet: baseSepolia,
} as const;

export type BaseChainType = keyof typeof SUPPORTED_BASE_CHAINS;

/**
 * Get the active Base chain based on environment
 */
export function getActiveBaseChain(): Chain {
  const chainEnv = process.env.NEXT_PUBLIC_BASE_CHAIN as BaseChainType | undefined;
  return SUPPORTED_BASE_CHAINS[chainEnv || 'mainnet'];
}

/**
 * Base Chain IDs
 */
export const BASE_CHAIN_IDS = {
  mainnet: 8453,
  testnet: 84532,
} as const;

/**
 * Block Explorer URLs
 */
export const BASE_EXPLORERS = {
  mainnet: 'https://basescan.org',
  testnet: 'https://sepolia.basescan.org',
} as const;

/**
 * RPC URLs (fallback if not using OnchainKit)
 */
export const BASE_RPC_URLS = {
  mainnet: 'https://mainnet.base.org',
  testnet: 'https://sepolia.base.org',
} as const;

/**
 * Get block explorer URL for transaction
 */
export function getExplorerTxUrl(txHash: string, chainId: number = BASE_CHAIN_IDS.mainnet): string {
  const explorer = chainId === BASE_CHAIN_IDS.mainnet ? BASE_EXPLORERS.mainnet : BASE_EXPLORERS.testnet;
  return `${explorer}/tx/${txHash}`;
}

/**
 * Get block explorer URL for address
 */
export function getExplorerAddressUrl(address: string, chainId: number = BASE_CHAIN_IDS.mainnet): string {
  const explorer = chainId === BASE_CHAIN_IDS.mainnet ? BASE_EXPLORERS.mainnet : BASE_EXPLORERS.testnet;
  return `${explorer}/address/${address}`;
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Basename resolution (for future integration)
 */
export async function resolveBasename(address: string): Promise<string | null> {
  // TODO: Integrate with Basename API when available
  // For now, return null
  return null;
}

/**
 * Get faucet URL for testnet
 */
export function getTestnetFaucetUrl(): string {
  return 'https://www.coinbase.com/faucets/base-ethereum-goerli-faucet';
}
