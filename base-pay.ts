/**
 * Base Pay Integration
 * For Base Builder Account payments
 */

export interface BasePayConfig {
  amount: string;
  currency: 'USD' | 'ETH' | 'USDC';
  recipientAddress: string;
  metadata?: {
    featureType: string;
    userId: string;
    priceUsd: number;
  };
}

export interface BasePayResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

declare global {
  interface Window {
    baseAccount?: {
      pay: (config: BasePayConfig) => Promise<BasePayResponse>;
      isAvailable: () => boolean;
      getAddress: () => Promise<string>;
    };
  }
}

/**
 * Check if Base Pay is available (Base Builder context)
 */
export function isBasePayAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return window.baseAccount?.isAvailable() ?? false;
}

/**
 * Get the user's Base Builder address
 */
export async function getBaseAddress(): Promise<string | null> {
  if (!isBasePayAvailable()) return null;
  try {
    return await window.baseAccount!.getAddress();
  } catch (error) {
    console.error('Failed to get Base address:', error);
    return null;
  }
}

/**
 * Execute a Base Pay payment
 */
export async function executeBasePay(config: BasePayConfig): Promise<BasePayResponse> {
  if (!isBasePayAvailable()) {
    return {
      success: false,
      error: 'Base Pay not available. Please use this app in a Base Builder context.',
    };
  }

  try {
    const result = await window.baseAccount!.pay(config);
    return result;
  } catch (error) {
    console.error('Base Pay error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Format USD to USDC (1:1)
 */
export function usdToUsdc(usd: number): string {
  return usd.toFixed(2);
}

/**
 * Format USD to ETH (approximate, should use real-time price)
 */
export function usdToEth(usd: number, ethPrice: number = 3000): string {
  return (usd / ethPrice).toFixed(6);
}
