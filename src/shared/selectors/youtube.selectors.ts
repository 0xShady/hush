// The Shorts guide entry has no link, only a localized title. Best-effort list of known titles.
const SHORTS_TITLES = ['Shorts', 'ショート', '쇼츠', 'Шортс', 'شورتس', 'שורטס', 'Kurzvideos', 'Cortos'];

export const SELECTORS = {
  shortsShelf:
    'ytd-rich-section-renderer:has([is-shorts]), ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer, grid-shelf-view-model:has(a[href^="/shorts/"])',
  shortsNav: SHORTS_TITLES.map(
    (t) => `ytd-guide-entry-renderer:has(a[title="${t}"]), ytd-mini-guide-entry-renderer[aria-label="${t}"]`,
  ).join(', '),
  // The Subscriptions section with channel entries, never the first section (Home) or "You".
  subscriptionsGuide:
    'ytd-guide-section-renderer:has(a[href="/feed/subscriptions"]):not(:has(a[href="/"])):not(:has(a[href="/feed/you"]))',
  playables:
    'ytd-guide-entry-renderer:has(a[href="/playables"]), ytd-mini-guide-entry-renderer:has(a[href="/playables"]), ytd-rich-section-renderer:has(a[href^="/playables"])',
  // Right-rail watch-page recommendations. Matches wherever #related lives
  // (we relocate it under the player when Comments Beside is on).
  sidebarRecs: '#related',
  related: '#related',
  endScreen: '.ytp-endscreen-content, .ytp-ce-element, .html5-video-player.ended-mode .ytp-fullscreen-grid',
  comments: '#comments',
  watchFlexy: 'ytd-watch-flexy',
  primaryInner: '#primary-inner',
  secondaryInner: '#secondary-inner',
  homeFeed: 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
  autoplayToggle: '.ytp-autonav-toggle-button',
  autoplayToggleChecked: '.ytp-autonav-toggle-button[aria-checked="true"]',
  dislikeButton:
    'ytd-watch-metadata dislike-button-view-model button, ytd-watch-metadata ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button',
};
