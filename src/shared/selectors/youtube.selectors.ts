// YouTube DOM selectors — single source of truth.

export const SELECTORS = {
  // Shorts shelves on home / subscriptions.
  shortsShelf:
    'ytd-rich-section-renderer:has([is-shorts]), ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer',
  // Shorts entry in the left guide / mini-guide.
  shortsNav:
    'ytd-guide-entry-renderer:has(a[title="Shorts"]), ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
  // Right-rail watch-page recommendations. Matches wherever #related lives
  // (we relocate it under the player when Comments Beside is on).
  sidebarRecs: '#related',
  // Watch-page related container, used as the move target for Comments Beside.
  related: '#related',
  // End-of-video suggested overlay.
  endScreen: '.ytp-endscreen-content, .ytp-ce-element',
  // Comments section.
  comments: '#comments',
  // Watch-page layout columns (used by Comments Beside).
  watchFlexy: 'ytd-watch-flexy',
  primaryInner: '#primary-inner',
  secondaryInner: '#secondary-inner',
  // Homepage feed grid.
  homeFeed: 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
  // Autoplay toggle in the player controls.
  autoplayToggle: '.ytp-autonav-toggle-button',
  autoplayToggleChecked: '.ytp-autonav-toggle-button[aria-checked="true"]',
  // Dislike button on watch page (segmented-like-dislike layout).
  dislikeButton:
    'ytd-watch-metadata dislike-button-view-model button, ytd-watch-metadata ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button',
} as const;
