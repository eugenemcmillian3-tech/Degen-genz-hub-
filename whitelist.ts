/**
 * Whitelist system for free access to all features
 * Used for testing and owner access
 */

interface WhitelistCheck {
  fid?: number;
  evmAddress?: string;
  solAddress?: string;
}

// Owner FID and wallets (FREE ACCESS)
const WHITELIST_FID = 1378286;
const WHITELIST_EVM_ADDRESS = '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3';
const WHITELIST_SOL_ADDRESS = 'BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7';

/**
 * Check if a user is whitelisted for free access
 */
export function isUserWhitelisted(check: WhitelistCheck): boolean {
  // Check FID
  if (check.fid && check.fid === WHITELIST_FID) {
    return true;
  }

  // Check EVM address (case-insensitive)
  if (check.evmAddress && 
      check.evmAddress.toLowerCase() === WHITELIST_EVM_ADDRESS.toLowerCase()) {
    return true;
  }

  // Check Solana address
  if (check.solAddress && check.solAddress === WHITELIST_SOL_ADDRESS) {
    return true;
  }

  return false;
}

/**
 * Generate a special payment ID for whitelisted users
 */
export function createWhitelistPaymentId(userId: string, featureType: string): string {
  return `WHITELIST_${userId}_${featureType}_${Date.now()}`;
}

/**
 * Check if a payment ID is from a whitelisted user
 */
export function isWhitelistPaymentId(paymentId: string): boolean {
  return paymentId.startsWith('WHITELIST_');
}

/**
 * Get whitelist info for display
 */
export function getWhitelistInfo(): {
  fid: number;
  evmAddress: string;
  solAddress: string;
} {
  return {
    fid: WHITELIST_FID,
    evmAddress: WHITELIST_EVM_ADDRESS,
    solAddress: WHITELIST_SOL_ADDRESS,
  };
}
