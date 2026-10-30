// IG class names are obfuscated/rotating, so prefer href, role, and structure hooks.

export const SELECTORS = {
  reelsNav: 'a[href="/reels/"], a[href^="/reels/"]',
  // Stable anchor for stories tray detection: every story tile links to /stories/<user>/.
  // The actual wrapper is found by walking up to the nearest <section> in JS.
  storiesAnchor: 'main a[href^="/stories/"]',
  feedArticle: 'article',
  feedVideoArticle: 'article:has(video)',
} as const;

export const HIDDEN_ATTR = 'data-hush-hidden';
export const STORIES_ATTR = 'data-hush-stories';

export const AD_TEXT = ['Sponsored', 'Sponsorisé', 'Patrocinado', 'Werbung'];
export const SUGGESTED_TEXT = [
  'Suggested for you',
  'Suggested posts',
  'Suggestions for you',
  'Suggéré pour vous',
  'Publications suggérées',
];
