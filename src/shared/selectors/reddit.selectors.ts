// Targets the current shreddit (sh.reddit.com) UI first.
// Reddit removed community/coin awards in 2023, so the awards toggle now hides
// remaining Gold/Highlight badges and legacy award icons.

export const SELECTORS = {
  post: 'article, shreddit-post, shreddit-ad-post',
  adMarker:
    'shreddit-ad-post, shreddit-ad-post + hr, shreddit-comments-page-ad, shreddit-sidebar-ad, shreddit-post[promoted], [data-promoted="true"], [data-ad-promoted="true"]',
  // Award icons / gold badges (mostly legacy, kept for back-compat).
  awards:
    'shreddit-award-button, award-button, [data-testid="award-icon"], [icon-name="award-fill"], shreddit-gold-badge, faceplate-tracker[noun*="award"]',
  games: 'faceplate-tracker[noun="games_drawer"], faceplate-tracker[noun="games_drawer"] + hr',
  premiumUpsellHard:
    'shreddit-gold-upsell, [data-testid="premium-upsell"], a[href*="/premium"][role="button"]',
  // The player keeps its <video> in an open shadow root.
  players: 'shreddit-player, shreddit-player-2',
  videos: 'video',
} as const;

export const HIDDEN_ATTR = 'data-hush-hidden';

export const AD_TEXT = ['Promoted', 'Sponsored'];
export const PREMIUM_TEXT = [
  'Reddit Premium',
  'Try Premium',
  'Upgrade to Premium',
  'Get Premium',
  'Premium membership',
];
