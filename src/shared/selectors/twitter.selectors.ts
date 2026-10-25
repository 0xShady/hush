// data-testid hooks are the most stable handle on this app.

export const SELECTORS = {
  trending: '[data-testid="sidebarColumn"] section:has([data-testid="trend"])',
  whoToFollow: '[data-testid="sidebarColumn"] aside:has([data-testid="UserCell"])',
  // Promoted tweets carry a placementTracking node.
  promotedCell: '[data-testid="cellInnerDiv"]:has([data-testid="placementTracking"])',
  grok: 'a[href="/i/grok"], [data-testid="GrokDrawerHeaderItem"], [aria-label="Grok"]',
  homeTabList: '[role="tablist"]',
  homeTab: '[role="tab"]',
} as const;

export const FOLLOWING_TAB_TEXT = ['Following'];
