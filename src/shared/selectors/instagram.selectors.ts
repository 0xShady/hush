// IG class names are obfuscated/rotating, so prefer href, role, and structure hooks.

export const SELECTORS = {
  // The Reels entry in the navigation only: posts also link to /reels/<id>/ and /reels/audio/<id>/.
  reelsNav: 'a[href="/reels/"]',
  // Story rings are drawn on <canvas>; the tray is the list of them above the feed.
  storiesList: 'main ul:has(canvas)',
  feedArticle: 'article',
  // Reels in the feed link to the reel or its audio under /reels/; photos and other videos do not.
  feedReelArticle: 'article:has(a[href^="/reels/"])',
} as const;

export const HIDDEN_ATTR = 'data-hush-hidden';
export const STORIES_ATTR = 'data-hush-stories';

// Matched exactly against the short labels in a post header.
export const AD_LABELS = ['Ad', 'Sponsored', 'Sponsorisé', 'Publicité', 'Patrocinado', 'Werbung', 'Anzeige'];
export const SUGGESTED_LABELS = [
  'Suggested for you',
  'Suggested posts',
  'Suggestions for you',
  'Suggéré pour vous',
  'Suggestions pour vous',
  'Publications suggérées',
];
