// Twitter / X DOM selectors — single source of truth.
// data-testid hooks are the most stable handle on this app.

export const SELECTORS = {
  // "What's happening" / trending widget in the right sidebar.
  trending: '[data-testid="sidebarColumn"] section:has([data-testid="trend"])',
  // "Who to follow" suggestion widget.
  whoToFollow: '[data-testid="sidebarColumn"] aside:has([data-testid="UserCell"])',
  // Promoted tweets carry a placementTracking node.
  promotedCell: '[data-testid="cellInnerDiv"]:has([data-testid="placementTracking"])',
  // Grok button in sidebar nav + composer.
  grok: 'a[href="/i/grok"], [data-testid="GrokDrawerHeaderItem"], [aria-label="Grok"]',
  // Home timeline tabs.
  homeTabList: '[role="tablist"]',
  homeTab: '[role="tab"]',
} as const;

// Tab label used to switch to the Following feed.
export const FOLLOWING_TAB_TEXT = ['Following'];
