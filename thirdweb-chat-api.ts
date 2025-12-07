// /src/lib/thirdweb/thirdweb-chat-api.ts
/**
 * =============================================================================
 * DO NOT MODIFY THIS FILE. Deterministic agent wrapper for Thirdweb AI Chat.
 * Purpose: Strict, typed access to Thirdweb AI chat via the platform proxy.
 * Routing: All HTTP must go through POST /api/proxy.
 * =============================================================================
 */

export type Dict = Record<string, any>;

/* ============================== Types ============================== */
export type AIChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type AIChatContext = {
  /** EVM chain ids to scope actions (e.g., [8453]) */
  chain_ids?: number[];
  /** Sender address for tx preparation/execution */
  from?: string;
  /** If true and backend is allowlisted, model may auto-execute prepared actions */
  auto_execute_transaction?: boolean;
};
export type AIChatParams = {
  messages: AIChatMessage[];
  context?: AIChatContext;
  stream?: boolean;
};

export type SignTransactionAction = {
  session_id: string;
  request_id: string;
  source?: 'model';
  type: 'sign_transaction';
  data: {
    chain_id: number;
    function?: string | null;
    to: string;
    value: string;
    data: string;
  };
};

export type SignSwapAction = {
  session_id: string;
  request_id: string;
  source?: 'model';
  type: 'sign_swap';
  data: {
    transaction: {
      chain_id: number;
      function?: string | null;
      to: string;
      value: string;
      data: string;
    };
    action?: string | null;
    intent: {
      origin_chain_id: number;
      origin_token_address: string;
      destination_chain_id: number;
      destination_token_address: string;
      amount: string;
      sender: string;
      receiver: string;
      maxSteps: number;
    };
    from_token: {
      address: string;
      chain_id: number;
      amount: string;
      symbol: string;
      decimals: number;
      price: number | null;
    };
    to_token: {
      address: string;
      chain_id: number;
      amount: string;
      symbol: string;
      decimals: number;
      price: number | null;
    };
  };
};

export type MonitorTransactionAction = {
  session_id: string;
  request_id: string;
  source?: 'model';
  type: 'monitor_transaction';
  data: { transaction_id: string };
};

export type AIChatAction = SignTransactionAction | SignSwapAction | MonitorTransactionAction;

export type AIChatResponse = {
  message: string;
  actions: AIChatAction[];
  session_id: string;
  request_id: string;
};

/** Type guards */
export function isSignTransactionAction(a: AIChatAction): a is SignTransactionAction {
  return a?.type === 'sign_transaction';
}
export function isSignSwapAction(a: AIChatAction): a is SignSwapAction {
  return a?.type === 'sign_swap';
}
export function isMonitorTransactionAction(a: AIChatAction): a is MonitorTransactionAction {
  return a?.type === 'monitor_transaction';
}

/* ============================== Proxy Core ========================= */
const BASE_ORIGIN = 'api.thirdweb.com';
const DEFAULT_CLIENT = 'secret_cm98tgbme00003b6rjf0egbe3'
const DEFAULT_TOKEN = 'secret_cmf6vwaq40000356o80rt5bv2';

function _require(obj: any, keys: string[], ctx = 'response'): void {
  for (const k of keys) {
    const v = obj?.[k];
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      throw new Error(`Thirdweb: required ${ctx} field "${k}" missing`);
    }
  }
}

/** All calls must go through /api/proxy */
async function _proxyThirdweb(opts: {
  path: string;
  method?: 'GET' | 'POST';
  body?: any;
  headers?: Record<string, string>;
}): Promise<any> {
  const payload: any = {
    protocol: 'https',
    origin: BASE_ORIGIN,
    path: opts.path,
    method: opts.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Thirdweb AI chat supports x-client-id (frontend) or x-secret-key (backend). Send both via proxy.
      'x-client-id': DEFAULT_CLIENT,
      'x-secret-key': DEFAULT_TOKEN,
      'Authorization': `Bearer ${DEFAULT_TOKEN}`,
      ...(opts.headers || {}),
    },
  };
  if (opts.body !== undefined) payload.body = JSON.stringify(opts.body);

  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (json?.failure_reason) throw new Error(json.failure_reason);
  if (json?.detail && !json.message) {
    // Chat returns {message, actions, ...}. If detail exists without message, treat as error.
    throw new Error(typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail));
  }
  return json;
}

/* ============================== AI Chat ============================ */
/**
 * Chat with Thirdweb AI. OpenAI-compatible input shape.
 * Provide `context.from` and `context.chain_ids` for any on-chain operation.
 * Set `context.auto_execute_transaction = true` only if your backend is allowlisted.
 */
export async function aiChat(params: AIChatParams): Promise<AIChatResponse> {
  if (!params?.messages?.length) throw new Error('messages[] required');
  const res = await _proxyThirdweb({
    path: '/ai/chat',
    method: 'POST',
    body: {
      messages: params.messages,
      context: params.context || {},
      stream: !!params.stream,
    },
  });
  _require(res, ['message', 'actions', 'session_id', 'request_id']);
  return res as AIChatResponse;
}
