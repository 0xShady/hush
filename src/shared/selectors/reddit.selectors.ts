// Reddit DOM selectors — single source of truth.
// Targets the current shreddit (sh.reddit.com) UI primarily.
// Note: community/coin "awards" were removed by Reddit in 2023 — the awards
// toggle now hides any remaining Gold/Highlight badges + legacy award icons.

export const SELECTORS = {
  // A single post in the feed (modern shreddit + minimal legacy fallback).
  post: 'article, shreddit-post, shreddit-ad-post',
  // Hard ad markers that don't need text matching.
  adMarker:
    'shreddit-ad-post, shreddit-post[promoted], [data-promoted="true"], [data-ad-promoted="true"]',
  // Award icons / gold badges (mostly legacy, kept for back-compat).
  awards:
    'shreddit-award-button, award-button, [data-testid="award-icon"], [icon-name="award-fill"], shreddit-gold-badge, faceplate-tracker[noun*="award"]',
  // Premium banners + nudges (modern + legacy + sidebar promo cards).
  premiumUpsellHard:
    'shreddit-gold-upsell, [data-testid="premium-upsell"], a[href*="/premium"][role="button"]',
  // Feed videos for autoplay control.
  videos: 'shreddit-player video, [data-testid="post-container"] video, video',
} as const;

export const HIDDEN_ATTR = 'data-focusfeed-hidden';

// Text markers used to flag posts / widgets when class hooks miss.
export const AD_TEXT = ['Promoted', 'Sponsored'];
export const PREMIUM_TEXT = [
  'Reddit Premium',
  'Try Premium',
  'Upgrade to Premium',
  'Get Premium',
  'Premium membership',
];
