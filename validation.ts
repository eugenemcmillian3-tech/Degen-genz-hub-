/**
 * Validation utilities for DEGENZ GEN/Z HUB
 */

import { GLOBAL_PRICING, REFERRAL_CONFIG, CONTEST_CONFIG } from './constants';
import { FEATURE_PRICING, OPENROUTER_MODELS, SUPPORTED_CHAINS } from '@/types/app';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate USD amount is within global constraints
 */
export function validateGlobalPricing(usdAmount: number): ValidationResult {
  if (usdAmount < GLOBAL_PRICING.MIN_USD) {
    return {
      valid: false,
      error: `Amount must be at least $${GLOBAL_PRICING.MIN_USD}`,
    };
  }
  
  if (usdAmount > GLOBAL_PRICING.MAX_USD) {
    return {
      valid: false,
      error: `Amount must not exceed $${GLOBAL_PRICING.MAX_USD}`,
    };
  }

  return { valid: true };
}

/**
 * Validate feature-specific pricing
 */
export function validateFeaturePricing(featureType: string, usdAmount: number): ValidationResult {
  const globalCheck = validateGlobalPricing(usdAmount);
  if (!globalCheck.valid) {
    return globalCheck;
  }

  const pricing = FEATURE_PRICING[featureType as keyof typeof FEATURE_PRICING];
  if (!pricing) {
    return {
      valid: false,
      error: `Invalid feature type: ${featureType}`,
    };
  }

  if (usdAmount < pricing.min || usdAmount > pricing.max) {
    return {
      valid: false,
      error: `${featureType} must be between $${pricing.min} and $${pricing.max}`,
    };
  }

  return { valid: true };
}

/**
 * Validate OpenRouter model is in allowlist
 */
export function validateModel(model: string): ValidationResult {
  if (!OPENROUTER_MODELS.includes(model as typeof OPENROUTER_MODELS[number])) {
    return {
      valid: false,
      error: 'Invalid model. Only free OpenRouter models are allowed.',
    };
  }

  return { valid: true };
}

/**
 * Validate blockchain chain is supported
 */
export function validateChain(chain: string): ValidationResult {
  if (!SUPPORTED_CHAINS.includes(chain as typeof SUPPORTED_CHAINS[number])) {
    return {
      valid: false,
      error: `Unsupported chain: ${chain}`,
    };
  }

  return { valid: true };
}

/**
 * Validate contest entry fee
 */
export function validateContestEntryFee(entryFeeUsd: number): ValidationResult {
  const globalCheck = validateGlobalPricing(entryFeeUsd);
  if (!globalCheck.valid) {
    return globalCheck;
  }

  return { valid: true };
}

/**
 * Validate contest type
 */
export function validateContestType(type: string): ValidationResult {
  if (!CONTEST_CONFIG.TYPES.includes(type as typeof CONTEST_CONFIG.TYPES[number])) {
    return {
      valid: false,
      error: `Invalid contest type. Must be one of: ${CONTEST_CONFIG.TYPES.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate platform fee in basis points
 */
export function validatePlatformFeeBP(feeBP: number): ValidationResult {
  if (feeBP < CONTEST_CONFIG.MIN_PLATFORM_FEE_BP || feeBP > CONTEST_CONFIG.MAX_PLATFORM_FEE_BP) {
    return {
      valid: false,
      error: `Platform fee must be between ${CONTEST_CONFIG.MIN_PLATFORM_FEE_BP}bp and ${CONTEST_CONFIG.MAX_PLATFORM_FEE_BP}bp`,
    };
  }

  return { valid: true };
}

/**
 * Validate referral code format
 */
export function validateReferralCode(code: string): ValidationResult {
  if (code.length < 4 || code.length > 20) {
    return {
      valid: false,
      error: 'Referral code must be between 4 and 20 characters',
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return {
      valid: false,
      error: 'Referral code can only contain letters, numbers, hyphens, and underscores',
    };
  }

  return { valid: true };
}

/**
 * Validate Farcaster FID
 */
export function validateFID(fid: number): ValidationResult {
  if (!Number.isInteger(fid) || fid < 1) {
    return {
      valid: false,
      error: 'Invalid Farcaster FID',
    };
  }

  return { valid: true };
}

/**
 * Validate transaction hash format (basic check)
 */
export function validateTxHash(txHash: string, chain: string): ValidationResult {
  if (!txHash || txHash.length < 32) {
    return {
      valid: false,
      error: 'Invalid transaction hash',
    };
  }

  // EVM chains use 0x-prefixed hashes
  if (chain !== 'Solana' && !txHash.startsWith('0x')) {
    return {
      valid: false,
      error: 'EVM transaction hash must start with 0x',
    };
  }

  return { valid: true };
}

/**
 * Generate a random referral code
 */
export function generateReferralCode(length: number = REFERRAL_CONFIG.CODE_LENGTH): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate referral commission
 */
export function calculateCommission(amount: number, commissionPercent: number = REFERRAL_CONFIG.DEFAULT_COMMISSION_PERCENT): number {
  return Math.round(amount * commissionPercent * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate contest platform fee
 */
export function calculatePlatformFee(potAmount: number, feeBP: number): number {
  return Math.round(potAmount * (feeBP / 10000) * 100) / 100; // Convert BP to decimal and round
}
