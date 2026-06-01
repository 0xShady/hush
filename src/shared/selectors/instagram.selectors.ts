// Instagram DOM selectors — single source of truth.
// IG class names are obfuscated/rotating, so prefer href, role, and structure hooks.

export const SELECTORS = {
  // Reels entry in the left/bottom nav.
  reelsNav: 'a[href="/reels/"], a[href^="/reels/"]',
  // Stable anchor for stories tray detection: every story tile links to /stories/<user>/.
  // The actual wrapper is found by walking up to the nearest <section> in JS.
  storiesAnchor: 'main a[href^="/stories/"]',
  // Feed posts are <article> elements.
  feedArticle: 'article',
  // Reel/video posts in feed (Hide Reels in Feed).
  feedVideoArticle: 'article:has(video)',
} as const;

// Marker attributes managed by the content script.
export const HIDDEN_ATTR = 'data-focusfeed-hidden';
export const STORIES_ATTR = 'data-focusfeed-stories';

// Header text used to identify sponsored / suggested posts (text match in JS).
export const AD_TEXT = ['Sponsored', 'Sponsorisé', 'Patrocinado', 'Werbung'];
export const SUGGESTED_TEXT = [
  'Suggested for you',
  'Suggested posts',
  'Suggestions for you',
  'Suggéré pour vous',
  'Publications suggérées',
];
