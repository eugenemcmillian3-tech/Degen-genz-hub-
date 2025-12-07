// lens-api.ts
/**
 * ================================================================================
 * DO NOT MODIFY THIS FILE. This file is READ ONLY and is DETERMINISTIC.
 * Lens Protocol SDK [Beta] — Strict, Explicit, and Typed API
 * ================================================================================
 */

export type Address = string;
export type AccessToken = string;
export type AppId = string; // always use "0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE" unless overridden
export type LensAccount = { address: Address; username: string };
export type PostMetadata = { content: string; [k: string]: any };

export interface GroveUploadResult { uri: string }
export interface LensPostResult { hash?: string; reason?: string; type: string }
export interface FeedItem { id: string; [k: string]: any }
export interface FeedPage { items: FeedItem[]; pageInfo: { prev: string | null; next: string | null } }

const APP_ID: AppId = "0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE";

async function proxyGraphQL({ query, variables, accessToken }: { query: string, variables: any, accessToken?: AccessToken }) {
  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protocol: 'https',
      origin: 'api.lens.xyz',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://ohara.ai',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    }),
  });
  return res.json();
}

async function proxyGroveStorage(jsonMetadata: any): Promise<GroveUploadResult> {
  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protocol: 'https',
      origin: 'api.grove.storage',
      path: '/?chain_id=232',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonMetadata),
    }),
  });
  const data = await res.json();
  return { uri: data?.[0]?.uri || "" };
}

/**
 * Discover all Lens accounts managed/owned by a wallet address.
 */
export async function discoverLensAccounts(walletAddress: Address): Promise<LensAccount[]> {
  const DISCOVER_ACCOUNTS_QUERY = `
    query($addr:EvmAddress!){
      accountsAvailable(request:{managedBy:$addr,includeOwned:true,pageSize:TEN}){
        items{
          ... on AccountOwned  { account{address username{value}} }
          ... on AccountManaged{ account{address username{value}} }
        }
      }
    }
  `;
  const res = await proxyGraphQL({ query: DISCOVER_ACCOUNTS_QUERY, variables: { addr: walletAddress } });
  return (
    res?.data?.accountsAvailable?.items?.map(
      (item: any) => ({
        address: item.account?.address || "",
        username: item.account?.username?.value || "Unknown"
      })
    ) || []
  );
}

/**
 * Generate access token for a Lens account as manager.
 * @param params { wallet: string; lensAccount: string }
 * Returns { accessToken, refreshToken }
 */
export async function getAccountManagerToken({ wallet, lensAccount, appId = APP_ID }: { wallet: Address, lensAccount: Address, appId?: AppId }): Promise<{ accessToken: string; refreshToken: string }> {
  const CHALLENGE_QUERY = `
    mutation($app:EvmAddress!,$acct:EvmAddress!,$owner:EvmAddress!){
      challenge(request:{accountOwner:{app:$app,account:$acct,owner:$owner}}){
        id
        text
      }
    }
  `;
  const AUTH_QUERY = `
    mutation($id:String!,$sig:String!){
      authenticate(request:{id:$id,signature:$sig}){
        ... on AuthenticationTokens {
          accessToken
          refreshToken
        }
      }
    }
  `;
  // 1. Get challenge text
  const { data: ch } = await proxyGraphQL({ query: CHALLENGE_QUERY, variables: { app: appId, acct: lensAccount, owner: wallet } });
  if (!ch?.challenge?.id || !ch?.challenge?.text) throw new Error("No challenge received");
  // 2. User must sign `ch.challenge.text` using wallet, e.g. with ethers.js (not included here)
  //    You must pass the signature to the next step!
  //    e.g. let signature = await signer.signMessage(ch.challenge.text);
  throw new Error("You must call getAccountManagerTokenStep2 with challengeId and signature.");
  // (continue with getAccountManagerTokenStep2 below)
}

/**
 * Step 2 for getAccountManagerToken: after signature is produced.
 * @param params { id: string, sig: string }
 */
export async function getAccountManagerTokenStep2({ id, sig }: { id: string; sig: string }): Promise<{ accessToken: string; refreshToken: string }> {
  const AUTH_QUERY = `
    mutation($id:String!,$sig:String!){
      authenticate(request:{id:$id,signature:$sig}){
        ... on AuthenticationTokens {
          accessToken
          refreshToken
        }
      }
    }
  `;
  const { data: auth } = await proxyGraphQL({ query: AUTH_QUERY, variables: { id, sig } });
  if (!auth?.authenticate?.accessToken) throw new Error("No access token returned");
  return { accessToken: auth.authenticate.accessToken, refreshToken: auth.authenticate.refreshToken };
}

/**
 * Fetch global feed.
 */
export async function getGlobalFeed(accessToken: AccessToken): Promise<FeedPage> {
  const GLOBAL_FEED_QUERY = `query GlobalFeed {
    posts(request: { filter: { feeds: [{ globalFeed: true }] }, pageSize: TEN }) {
      items {
        ... on Post { __typename id timestamp author { username { value } metadata { name picture } } metadata { __typename ... on TextOnlyMetadata { content } } stats { comments quotes reposts reactions } quoteOf { ...ReferencedPost } commentOn { ...ReferencedPost } }
        ... on Repost { __typename id timestamp author { username { value } metadata { name picture } } repostOf { __typename id timestamp author { username { value } metadata { name picture } } metadata { __typename ... on TextOnlyMetadata { content } } stats { comments quotes reposts reactions } quoteOf { ...ReferencedPost } commentOn { ...ReferencedPost } } }
      }
      pageInfo { prev next }
    }
  }
  fragment ReferencedPost on Post {
    __typename id timestamp author { username { value } metadata { name picture } } metadata { __typename ... on TextOnlyMetadata { content } } stats { comments quotes reposts reactions }
  }`;
  const res = await proxyGraphQL({ query: GLOBAL_FEED_QUERY, variables: {}, accessToken });
  const items = res?.data?.posts?.items || [];
  const pageInfo = res?.data?.posts?.pageInfo || { prev: null, next: null };
  return { items, pageInfo };
}

/**
 * Fetch feed for a Lens account.
 */
export async function getAccountFeed(account: Address, accessToken: AccessToken): Promise<FeedPage> {
  const ACCOUNT_FEED_QUERY = `query AccountFeed($acct: EvmAddress!) {
    posts(request: { filter: { authors: [$acct], postTypes: [ROOT, REPOST, QUOTE, COMMENT] }, pageSize: TEN }) {
      items {
        ... on Post { __typename id timestamp author { username { value } metadata { name picture } } metadata { __typename ... on TextOnlyMetadata { content } } stats { comments quotes reposts reactions } quoteOf { ...ReferencedPost } commentOn { ...ReferencedPost } }
        ... on Repost { __typename id timestamp author { username { value } metadata { name picture } } repostOf { __typename id timestamp author { username { value } metadata { name picture } } metadata { __typename ... on TextOnlyMetadata { content } } stats { comments quotes reposts reactions } quoteOf { ...ReferencedPost } commentOn { ...ReferencedPost } } }
      }
      pageInfo { prev next }
    }
  }
  fragment ReferencedPost on Post {
    __typename id timestamp author { username { value } metadata { name picture } } metadata { __typename ... on TextOnlyMetadata { content } } stats { comments quotes reposts reactions }
  }`;
  const res = await proxyGraphQL({ query: ACCOUNT_FEED_QUERY, variables: { acct: account }, accessToken });
  const items = res?.data?.posts?.items || [];
  const pageInfo = res?.data?.posts?.pageInfo || { prev: null, next: null };
  return { items, pageInfo };
}

/**
 * Post (text only). Handles metadata upload and transaction mutation.
 * @param params { postContent, accessToken }
 */
export async function createPost({ postContent, accessToken }: { postContent: string, accessToken: AccessToken }): Promise<LensPostResult> {
  // 1. Build Metadata
  const metadata = {
    "$schema": "https://json-schemas.lens.dev/posts/text-only/3.0.0.json",
    "lens": {
      "id": "post-" + Date.now(),
      "locale": "en",
      "mainContentFocus": "TEXT_ONLY",
      "content": postContent,
    },
  };
  // 2. Upload to Grove
  const { uri: contentUri } = await proxyGroveStorage(metadata);
  if (!contentUri) throw new Error("No Grove 'uri' returned");
  // 3. Call Lens Post Mutation
  const CREATE_POST_MUTATION = `mutation CreatePost($request: CreatePostRequest!) {
    post(request: $request) {
      ... on PostResponse { hash __typename }
      ... on SelfFundedTransactionRequest { reason __typename }
      ... on SponsoredTransactionRequest { reason __typename }
      ... on TransactionWillFail { reason __typename }
      __typename
    }
  }`;
  const variables = { request: { contentUri } };
  const res = await proxyGraphQL({ query: CREATE_POST_MUTATION, variables, accessToken });
  const post = res?.data?.post;
  if (!post) throw new Error("No post response");
  return { hash: post.hash, reason: post.reason, type: post.__typename };
}

/**
 * Comment. Handles metadata upload and transaction mutation.
 * @param params { postContent, commentOn, accessToken }
 */
export async function commentOnPost({ postContent, commentOn, accessToken }: { postContent: string, commentOn: string, accessToken: AccessToken }): Promise<LensPostResult> {
  const metadata = {
    "$schema": "https://json-schemas.lens.dev/posts/text-only/3.0.0.json",
    "lens": {
      "id": "post-" + Date.now(),
      "locale": "en",
      "mainContentFocus": "TEXT_ONLY",
      "content": postContent,
    },
  };
  const { uri: contentUri } = await proxyGroveStorage(metadata);
  if (!contentUri) throw new Error("No Grove 'uri' returned");
  const CREATE_POST_MUTATION = `mutation CreatePost($request: CreatePostRequest!) {
    post(request: $request) {
      ... on PostResponse { hash __typename }
      ... on SelfFundedTransactionRequest { reason __typename }
      ... on SponsoredTransactionRequest { reason __typename }
      ... on TransactionWillFail { reason __typename }
      __typename
    }
  }`;
  const variables = { request: { contentUri, commentOn: { post: commentOn } } };
  const res = await proxyGraphQL({ query: CREATE_POST_MUTATION, variables, accessToken });
  const post = res?.data?.post;
  if (!post) throw new Error("No post response");
  return { hash: post.hash, reason: post.reason, type: post.__typename };
}

/**
 * Quote. Handles metadata upload and transaction mutation.
 * @param params { postContent, quoteOf, accessToken }
 */
export async function quotePost({ postContent, quoteOf, accessToken }: { postContent: string, quoteOf: string, accessToken: AccessToken }): Promise<LensPostResult> {
  const metadata = {
    "$schema": "https://json-schemas.lens.dev/posts/text-only/3.0.0.json",
    "lens": {
      "id": "post-" + Date.now(),
      "locale": "en",
      "mainContentFocus": "TEXT_ONLY",
      "content": postContent,
    },
  };
  const { uri: contentUri } = await proxyGroveStorage(metadata);
  if (!contentUri) throw new Error("No Grove 'uri' returned");
  const CREATE_POST_MUTATION = `mutation CreatePost($request: CreatePostRequest!) {
    post(request: $request) {
      ... on PostResponse { hash __typename }
      ... on SelfFundedTransactionRequest { reason __typename }
      ... on SponsoredTransactionRequest { reason __typename }
      ... on TransactionWillFail { reason __typename }
      __typename
    }
  }`;
  const variables = { request: { contentUri, quoteOf: { post: quoteOf } } };
  const res = await proxyGraphQL({ query: CREATE_POST_MUTATION, variables, accessToken });
  const post = res?.data?.post;
  if (!post) throw new Error("No post response");
  return { hash: post.hash, reason: post.reason, type: post.__typename };
}

/**
 * Repost (no metadata upload).
 * @param params { repostOf, accessToken }
 */
export async function repost({ repostOf, accessToken }: { repostOf: string, accessToken: AccessToken }): Promise<LensPostResult> {
  const CREATE_REPOST_MUTATION = `mutation Repost($request: CreateRepostRequest!) {
    repost(request: $request) {
      ... on PostResponse { hash __typename }
      ... on SelfFundedTransactionRequest { reason __typename }
      ... on SponsoredTransactionRequest { reason __typename }
      ... on TransactionWillFail { reason __typename }
      __typename
    }
  }`;
  const variables = { request: { post: repostOf } };
  const res = await proxyGraphQL({ query: CREATE_REPOST_MUTATION, variables, accessToken });
  const repost = res?.data?.repost;
  if (!repost) throw new Error("No repost response");
  return { hash: repost.hash, reason: repost.reason, type: repost.__typename };
}