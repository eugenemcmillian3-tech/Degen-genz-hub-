// adjacent-api.ts
/**
 * ================================================================================
 * DO NOT MODIFY THIS FILE. This file is READ ONLY and is DETERMINISTIC.
 * Adjacent News API Service — Strict, Explicit, and Typed API
 * ================================================================================
 */

type Query = Record<string, any>;

const BASE_URL = 'api.data.adj.news';

// SAFE MAPPERS

function safeMarket(raw: any = {}): any {
  return {
    market_id: raw?.market_id || "",
    platform_id: raw?.platform_id || "",
    ticker: raw?.ticker || "",
    adj_ticker: raw?.adj_ticker || "",
    market_slug: raw?.market_slug || "",
    platform: raw?.platform || "",
    market_type: raw?.market_type || "",
    question: raw?.question || "",
    description: raw?.description || "",
    rules: raw?.rules || "",
    result: raw?.result ?? "",
    link: raw?.link || "",
    status: raw?.status || "",
    reported_date: raw?.reported_date || "",
    created_at: raw?.created_at || "",
    updated_at: raw?.updated_at || "",
    end_date: raw?.end_date || "",
    resolution_date: raw?.resolution_date || "",
    probability: typeof raw?.probability === 'number' ? raw.probability : 0,
    volume: typeof raw?.volume === 'number' ? raw.volume : 0,
    open_interest: typeof raw?.open_interest === 'number' ? raw.open_interest : 0,
    liquidity: typeof raw?.liquidity === 'number' ? raw.liquidity : 0,
    category: raw?.category || "",
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    platform_ids: raw?.platform_ids || {},
    status_details: raw?.status_details || {},
    settlement_sources: Array.isArray(raw?.settlement_sources) ? raw.settlement_sources : [],
    comments_count: typeof raw?.comments_count === 'number' ? raw.comments_count : 0,
    has_comments: typeof raw?.has_comments === 'number' ? raw.has_comments : 0,
    trades_count: typeof raw?.trades_count === 'number' ? raw.trades_count : 0,
    event: raw?.event || "",
  };
}

function safeTrade(raw: any = {}): any {
  return {
    id: raw?.id || "",
    trade_id: raw?.trade_id || "",
    market_id: raw?.market_id || "",
    event_id: raw?.event_id || "",
    title: raw?.title || "",
    amount: typeof raw?.amount === 'number' ? raw.amount : 0,
    yes_price: typeof raw?.yes_price === 'number' ? raw.yes_price : 0,
    no_price: typeof raw?.no_price === 'number' ? raw.no_price : 0,
    price: typeof raw?.price === 'number' ? raw.price : 0,
    side: raw?.side || "",
    maker_side: raw?.maker_side || "",
    created_at: raw?.created_at || "",
    platform: raw?.platform || "",
    trader_id: raw?.trader_id || "",
    transaction_hash: raw?.transaction_hash || "",
    metadata: raw?.metadata || {},
  };
}

function safeNews(raw: any = {}): any {
  return {
    title: raw?.title || "",
    url: raw?.url || "",
    publishedDate: raw?.publishedDate || "",
    author: raw?.author || "",
    domain: raw?.domain || "",
    snippet: raw?.snippet || "",
  };
}

function safeRelatedQuestion(raw: any = {}): any {
  return {
    question: raw?.question || "",
    adj_ticker: raw?.adj_ticker || "",
    similarity: typeof raw?.similarity === 'number' ? raw.similarity : 0,
  };
}

function safePricePoint(raw: any = {}): any {
  return {
    timestamp: typeof raw?.timestamp === 'number' ? raw.timestamp : 0,
    datetime: raw?.datetime || "",
    price: typeof raw?.price === 'number' ? raw.price : 0,
    volume: typeof raw?.volume === 'number' ? raw.volume : 0,
    open: typeof raw?.open === 'number' ? raw.open : 0,
    high: typeof raw?.high === 'number' ? raw.high : 0,
    low: typeof raw?.low === 'number' ? raw.low : 0,
    close: typeof raw?.close === 'number' ? raw.close : 0,
  };
}

// =============== CORE PROXY =================

async function proxyAdjacent({
  path,
  method = 'GET',
  query = {},
  body
}: {
  path: string;
  method?: 'GET' | 'POST';
  query?: Query;
  body?: any;
}): Promise<any> {
  const queryString = query && Object.keys(query).length
    ? '?' + new URLSearchParams(query).toString()
    : '';
  try {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: BASE_URL,
        path: path + queryString,
        method,
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer secret_cmbv3hqtg0000356nw0uhj6yv`,
        },
        body: body ? JSON.stringify(body) : undefined,
      }),
    });
    const result = await res.json();
    if (result?.failure_reason) throw new Error(result.failure_reason);
    if (result?.detail) throw new Error(typeof result.detail === 'string' ? result.detail : JSON.stringify(result.detail));
    return result;
  } catch (err) {
    // Always return empty/fallback values, never throw uncaught error
    return {};
  }
}

// ============== SAFE ENDPOINTS ==============

export async function getMarkets(params: Query = {}): Promise<{ data: any[] }> {
  try {
    const result = await proxyAdjacent({ path: '/api/markets', method: 'GET', query: params });
    const data = Array.isArray(result?.data) ? result.data.map(safeMarket) : [];
    return { data };
  } catch {
    return { data: [] };
  }
}

export async function getMarket(adj_ticker: string): Promise<{ data: any }> {
  if (!adj_ticker) return { data: safeMarket({}) };
  try {
    const result = await proxyAdjacent({ path: `/api/markets/${adj_ticker}`, method: 'GET' });
    return { data: safeMarket(result?.data) };
  } catch {
    return { data: safeMarket({}) };
  }
}

export async function semanticSearch(params: { q: string; limit?: number; include_context?: boolean }): Promise<{ data: any[] }> {
  if (!params?.q) return { data: [] };
  try {
    const result = await proxyAdjacent({ path: '/api/search/query', method: 'GET', query: params });
    const data = Array.isArray(result?.data) ? result.data.map(safeMarket) : [];
    return { data };
  } catch {
    return { data: [] };
  }
}

export async function relatedQuestions(params: { text: string; limit?: number; min_similarity?: number }): Promise<{ data: any[] }> {
  if (!params?.text) return { data: [] };
  try {
    const result = await proxyAdjacent({ path: '/api/search/related-questions', method: 'GET', query: params });
    const data = Array.isArray(result?.data) ? result.data.map(safeRelatedQuestion) : [];
    return { data };
  } catch {
    return { data: [] };
  }
}

export async function getMarketNews(market: string, params: Query = {}): Promise<{ data: any[] }> {
  if (!market) return { data: [] };
  try {
    const result = await proxyAdjacent({ path: `/api/news/${encodeURIComponent(market)}`, method: 'GET', query: params });
    const data = Array.isArray(result?.data) ? result.data.map(safeNews) : [];
    return { data };
  } catch {
    return { data: [] };
  }
}

export async function getMarketTrades(marketId: string, params: Query = {}): Promise<{ data: any[] }> {
  if (!marketId) return { data: [] };
  try {
    const result = await proxyAdjacent({ path: `/api/trade/market/${marketId}`, method: 'GET', query: params });
    const data = Array.isArray(result?.data) ? result.data.map(safeTrade) : [];
    return { data };
  } catch {
    return { data: [] };
  }
}

export async function getRecentTrades(params: Query = {}): Promise<{ data: any[] }> {
  try {
    const result = await proxyAdjacent({ path: '/api/trade/recent', method: 'GET', query: params });
    const data = Array.isArray(result?.data) ? result.data.map(safeTrade) : [];
    return { data };
  } catch {
    return { data: [] };
  }
}

export async function getPriceHistory(params: { market_id: string; [key: string]: any }): Promise<{ data: any[] }> {
  if (!params?.market_id) return { data: [] };
  try {
    const result = await proxyAdjacent({ path: '/api/trade/price-history', method: 'GET', query: params });
    const data = Array.isArray(result?.data) ? result.data.map(safePricePoint) : [];
    return { data };
  } catch {
    return { data: [] };
  }
}
