// Analytics tracking utilities
// PostHog is already installed, this provides type-safe wrappers

export type AnalyticsEvent =
  | 'feature_clicked'
  | 'payment_initiated'
  | 'payment_completed'
  | 'ai_generation_started'
  | 'ai_generation_completed'
  | 'contest_created'
  | 'contest_entered'
  | 'contest_voted'
  | 'referral_code_generated'
  | 'referral_shared'
  | 'profile_viewed'
  | 'social_share_clicked';

export interface AnalyticsProperties {
  feature_type?: string;
  price_usd?: number;
  chain?: string;
  model_used?: string;
  contest_type?: string;
  referral_code?: string;
  share_platform?: 'warpcast' | 'twitter' | 'native';
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): void {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(event, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.identify(userId, traits);
  }
}

export function trackPageView(path: string): void {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('$pageview', { path });
  }
}

// Type augmentation for window.posthog
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string, traits?: Record<string, unknown>) => void;
    };
  }
}
