// LinkedIn ships hashed class names that rotate. Stable hooks in the current UI:
//   - [data-testid="mainFeed"] with role="listitem" entries; posts have componentkey="update-card…"
//   - aside[aria-label] for the left and right rails
// Hooks from the older UI stay in the lists while LinkedIn still serves it to some accounts.

export const SELECTORS = {
  feedPost:
    '[data-testid="mainFeed"] [role="listitem"][componentkey^="update-card"], div.feed-shared-update-v2, [data-urn^="urn:li:activity"], [data-id^="urn:li:activity"], [data-id^="urn:li:aggregate"]',
  // Feed entries that are not posts: suggestion carousels and similar.
  feedModule:
    '[data-testid="mainFeed"] [role="listitem"]:not([componentkey^="update-card"]), .scaffold-finite-scroll__content > div:not(.feed-shared-update-v2)',
  rail: 'aside[aria-label], aside.scaffold-layout__aside',
  // Right-rail ad slot: the iframe's box, not the footer next to it.
  railAd: 'aside div:has(> iframe[componentkey$="_ad"]), aside div:has(> iframe[title="advertisement"])',
  puzzles: '[componentkey="feedRightNavGamesComponentRef"]',
  navButtons: '[data-testid="primary-nav"] [role="button"], [data-testid="primary-nav"] a, #global-nav a',
  legacyRailModule: 'aside.scaffold-layout__aside section, aside.scaffold-layout__aside .artdeco-card',
} as const;

export const HIDDEN_ATTR = 'data-hush-hidden';

// Matched exactly against the short labels in a post header.
export const AD_LABELS = ['Promoted', 'Sponsorisé', 'Anzeige', 'Promocionado', 'Promosso', 'Patrocinado'];

// Titles of sidebar and in-feed modules (matched at the start of a text node), never inside posts.
export const MODULE_TITLES = {
  pymk: [
    'People you may know',
    'Personnes que vous connaissez peut-être',
    'More suggestions for you',
    'Add to your feed',
    'Follow these recommendations',
  ],
  puzzles: ['Today’s puzzles', "Today's puzzles"],
} as const;

// Short Premium prompt in the top navigation bar.
export const NAV_PREMIUM_TEXT = ['Premium', 'Retry for', 'Try for', 'Reactivate'];

// Matched inside small sidebar and in-feed cards only.
export const PREMIUM_TEXT = [
  'Try Premium',
  'Retry Premium',
  'Reactivate Premium',
  'Premium for free',
  'free Premium trial',
  'unlock with Premium',
  'See who viewed your profile',
];
