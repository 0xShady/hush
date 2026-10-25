export const SELECTORS = {
  shortsShelf:
    'ytd-rich-section-renderer:has([is-shorts]), ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer',
  shortsNav:
    'ytd-guide-entry-renderer:has(a[title="Shorts"]), ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
  // Right-rail watch-page recommendations. Matches wherever #related lives
  // (we relocate it under the player when Comments Beside is on).
  sidebarRecs: '#related',
  related: '#related',
  endScreen: '.ytp-endscreen-content, .ytp-ce-element',
  comments: '#comments',
  watchFlexy: 'ytd-watch-flexy',
  primaryInner: '#primary-inner',
  secondaryInner: '#secondary-inner',
  homeFeed: 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
  autoplayToggle: '.ytp-autonav-toggle-button',
  autoplayToggleChecked: '.ytp-autonav-toggle-button[aria-checked="true"]',
  dislikeButton:
    'ytd-watch-metadata dislike-button-view-model button, ytd-watch-metadata ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button',
} as const;
