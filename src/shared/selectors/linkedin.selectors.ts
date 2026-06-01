// LinkedIn DOM selectors — single source of truth.
// LinkedIn ships hashed CSS-module classes that rotate frequently. Stable hooks:
//   - `feed-shared-update-v2` for feed cards
//   - `data-id="urn:li:..."` on activity wrappers
//   - `scaffold-layout__aside` for the right rail
// Everything content-specific is matched by text in JS.

export const SELECTORS = {
  // A single feed post wrapper (multiple variants to catch wrappers + cards).
  feedItem:
    'div.feed-shared-update-v2, [data-urn^="urn:li:activity"], [data-id^="urn:li:activity"], [data-id^="urn:li:aggregate"]',
  // Right-rail modules (each card-like section we may want to hide).
  asideModule:
    'aside.scaffold-layout__aside section, aside.scaffold-layout__aside > div > div, aside.scaffold-layout__aside .artdeco-card',
  // Inline feed modules that aren't feed posts (PYMK carousels, suggestions injected into the feed).
  inlineFeedModule:
    '.scaffold-finite-scroll__content > div:not(.feed-shared-update-v2)',
} as const;

export const HIDDEN_ATTR = 'data-focusfeed-hidden';

// Text markers used to flag feed cards / aside modules in JS.
// Keep wide enough to survive minor copy edits.
export const TEXT_MARKERS = {
  ads: ['Promoted', 'Sponsorisé', 'Anzeige'],
  pymk: [
    'People you may know',
    'Personnes que vous connaissez peut-être',
    'More suggestions for you',
    'Add to your feed',
    'Follow these recommendations',
  ],
  news: ['LinkedIn News', "Today's news", 'Top stories', 'Top news', 'Trending now'],
  learning: [
    'From LinkedIn Learning',
    'LinkedIn Learning',
    'Top courses',
    'Recommended courses',
  ],
  addToProfile: [
    'Add to your profile',
    'Add skills',
    'Add a certification',
    'Add a language',
    'Add languages',
    'Complete your profile',
  ],
  celebrate: [
    'work anniversary',
    'Celebrate',
    'celebrating',
    'started a new position',
    'has a new job',
    'gave kudos',
    'Send congrats',
  ],
  premium: [
    'Try Premium',
    'Retry Premium',
    'Reactivate Premium',
    'Premium for free',
    'free Premium trial',
    'unlock with Premium',
    'See who viewed your profile',
  ],
} as const;
