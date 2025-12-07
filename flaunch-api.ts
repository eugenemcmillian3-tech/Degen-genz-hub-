/**
 * ================================================================================
 * DO NOT MODIFY THIS FILE. This file is READ ONLY and is DETERMINISTIC.
 * Exposes only 4 top-level endpoints for robust agent workflows.
 * ================================================================================
 */

export type Token = {
  tokenAddress: string;
  symbol: string;
  name: string;
  marketCapETH: string;
  createdAt: number | string;
  fairLaunchActive: boolean;
  image: string;
  description: string;
};

export type ListTokensParams = { limit?: number; offset?: number };

export type RevenueManagerParams = {
  protocolFee: number;
  recipientAddress: string;
  ownerAddress?: string;
};
export type RevenueManagerResponse = {
  success: boolean;
  managerAddress?: string;
  error?: string;
};

export type LaunchSimpleParams = {
  name: string;
  symbol: string;
  description: string;
  base64Image: string;
  creator: {
    address?: string;
    email?: string;
    twitter?: string;
    farcaster?: string;
  };
  websiteUrl?: string;
};
/**
 * CRITICAL: `base64Image` must include full prefix (e.g., "data:image/png;base64,...").
 * Never strip the prefix—Flaunch API will reject it otherwise.
 */
export type LaunchWithManagerParams = {
  name: string;
  symbol: string;
  description: string;
  base64Image: string;
  creatorAddress: string;
  protocolFee: number;
  websiteUrl?: string;
};
export type LaunchResponse = {
  success: boolean;
  tokenAddress?: string;
  managerAddress?: string; // for with-manager only
  error?: string;
};

const BASE_URL = 'web2-api.flaunch.gg';
const CHAIN = 'base';

export const formatDate = (value: number | string) => {
  const n = Number(value);
  const ts = isFinite(n) ? (String(value).length === 10 ? n * 1000 : n) : NaN;
  const d = new Date(ts);
  return isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ========== PRIVATE HELPERS ==========

async function flaunchProxy({
  path,
  method = 'GET',
  body,
  query,
}: {
  path: string;
  method?: 'GET' | 'POST';
  body?: any;
  query?: Record<string, any>;
}): Promise<any> {
  const queryString =
    query && Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : '';
  try {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: BASE_URL,
        path: path + queryString,
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

function safeToken(raw: any): Token {
  return {
    tokenAddress: raw?.tokenAddress || '',
    symbol: raw?.symbol || '',
    name: raw?.name || '',
    marketCapETH: raw?.marketCapETH || '0',
    createdAt: raw?.createdAt || 0,
    fairLaunchActive: !!raw?.fairLaunchActive,
    image: raw?.image || '',
    description: raw?.description || '',
  };
}

async function uploadImage(base64Image: string): Promise<{ ipfsHash: string } | null> {
  try {
    const res = await flaunchProxy({
      path: `/api/v1/upload-image`,
      method: 'POST',
      body: { base64Image },
    });
    if (res?.success && res?.ipfsHash) return { ipfsHash: res.ipfsHash };
    return null;
  } catch {
    return null;
  }
}

async function launchMemecoinApi(body: any): Promise<{ jobId: string } | null> {
  try {
    const res = await flaunchProxy({
      path: `/api/v1/${CHAIN}/launch-memecoin`,
      method: 'POST',
      body,
    });
    if (res?.success && res?.jobId) return { jobId: res.jobId };
    return null;
  } catch {
    return null;
  }
}

async function pollLaunchStatus(jobId: string, maxAttempts = 20, intervalMs = 4000): Promise<any> {
  for (let i = 0; i < maxAttempts; ++i) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const res = await flaunchProxy({
        path: `/api/v1/launch-status/${jobId}`,
        method: 'GET',
      });
      if (res?.state === 'failed') return { state: 'failed', ...res };
      if (res?.state === 'completed' && res?.collectionToken?.address)
        return { state: 'completed', ...res };
    } catch {
      // keep polling
    }
  }
  return { state: 'failed', error: 'Timeout waiting for memecoin launch' };
}

async function deployManagerApi(input: RevenueManagerParams): Promise<{ managerAddress: string } | { error: string }> {
  try {
    const res = await flaunchProxy({
      path: `/api/v1/base/create-revenue-manager`,
      method: 'POST',
      body: input,
    });
    if (res?.success && res?.managerAddress) return { managerAddress: res.managerAddress };
    return { error: res?.error || 'Failed to deploy revenue manager' };
  } catch {
    return { error: 'Failed to deploy revenue manager' };
  }
}

// ========== PUBLIC ENDPOINTS ==========

/** 1. List memecoins (with fallbacks) */
export async function listMemecoins(params: ListTokensParams = {}): Promise<Token[]> {
  try {
    const queryString =
      params && Object.keys(params).length ? '?' + new URLSearchParams(params as any).toString() : '';
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: 'dev-api.flayerlabs.xyz',
        path: `/v1/base/tokens/new${queryString}`,
        method: 'GET',
        headers: { 'accept': 'application/json' },
      }),
    });
    const data = await res.json();
    if (!data?.data || !Array.isArray(data.data)) return [];
    return data.data.map(safeToken);
  } catch {
    return [];
  }
}

/** 2. Create (deploy) a revenue manager (launchpad contract) */
export async function createRevenueManager(input: RevenueManagerParams): Promise<RevenueManagerResponse> {
  const mgr = await deployManagerApi(input);
  if ('managerAddress' in mgr && mgr.managerAddress) {
    return { success: true, managerAddress: mgr.managerAddress };
  }
  return { success: false, error: mgr.error || 'Unknown error' };
}

/**
 * 3. Launch a memecoin (no revenue manager, simple flow)
 * Handles image upload, launch, polling. Returns {success, tokenAddress, error}
 */
/**
 * CRITICAL: `base64Image` must include full prefix (e.g., "data:image/png;base64,...").
 * Never strip the prefix—Flaunch API will reject it otherwise.
 * CRITICAL: MUST provide a valid wallet address (creatorAddress) OR a valid email (creatorEmail), and MUST include at least one of these.
 */
export async function launchMemecoinSimple(input: LaunchSimpleParams): Promise<LaunchResponse> {
  // 1. Upload image
  const img = await uploadImage(input.base64Image);
  if (!img?.ipfsHash)
    return { success: false, error: 'Image upload failed' };

  // 2. Build launch payload
  const launchBody: any = {
    name: input.name,
    symbol: input.symbol,
    description: input.description,
    imageIpfs: img.ipfsHash,
    websiteUrl: input.websiteUrl || '',
  };
  if (input.creator?.address) launchBody.creatorAddress = input.creator.address;
  if (input.creator?.email) launchBody.creatorEmail = input.creator.email;
  if (input.creator?.twitter) launchBody.creatorTwitterUsername = input.creator.twitter;
  if (input.creator?.farcaster) launchBody.creatorFarcasterUsername = input.creator.farcaster;

  // 3. Launch memecoin
  const launch = await launchMemecoinApi(launchBody);
  if (!launch?.jobId)
    return { success: false, error: 'Failed to launch memecoin' };

  // 4. Poll for status
  const status = await pollLaunchStatus(launch.jobId);
  if (status?.state !== 'completed' || !status?.collectionToken?.address)
    return { success: false, error: 'Launch failed or incomplete' };

  return { success: true, tokenAddress: status.collectionToken.address };
}

/**
 * 4. Launch a memecoin WITH a new revenue manager (deploys, then launches)
 * Handles all steps, returns {success, tokenAddress, managerAddress, error}
 */
/**
 * CRITICAL: `base64Image` must include full prefix (e.g., "data:image/png;base64,...").
 * Never strip the prefix—Flaunch API will reject it otherwise.
 * CRITICAL: MUST provide a valid wallet address (creatorAddress).
 */
export async function launchMemecoinWithManager(input: LaunchWithManagerParams): Promise<LaunchResponse> {
  // 1. Deploy revenue manager
  const mgr = await deployManagerApi({
    protocolFee: input.protocolFee,
    recipientAddress: input.creatorAddress,
    ownerAddress: input.creatorAddress,
  });
  if (!('managerAddress' in mgr) || !mgr.managerAddress)
    return { success: false, error: mgr.error || 'Failed to deploy manager' };

  // 2. Upload image
  const img = await uploadImage(input.base64Image);
  if (!img?.ipfsHash)
    return { success: false, managerAddress: mgr.managerAddress, error: 'Image upload failed' };

  // 3. Launch memecoin with revenue manager
  const launchBody: any = {
    name: input.name,
    symbol: input.symbol,
    description: input.description,
    imageIpfs: img.ipfsHash,
    creatorAddress: input.creatorAddress,
    revenueManagerAddress: mgr.managerAddress,
    websiteUrl: input.websiteUrl || '',
  };
  const launch = await launchMemecoinApi(launchBody);
  if (!launch?.jobId)
    return { success: false, managerAddress: mgr.managerAddress, error: 'Failed to launch memecoin' };

  // 4. Poll for status
  const status = await pollLaunchStatus(launch.jobId);
  if (status?.state !== 'completed' || !status?.collectionToken?.address)
    return { success: false, managerAddress: mgr.managerAddress, error: 'Launch failed or incomplete' };

  return {
    success: true,
    managerAddress: mgr.managerAddress,
    tokenAddress: status.collectionToken.address,
  };
}
