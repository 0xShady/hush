// Sidebar modules are hidden by their bordered card so no empty box stays behind.

export const SELECTORS = {
  trending:
    '[data-testid="sidebarColumn"] div:has(> section [data-testid="trend"]), [data-testid="sidebarColumn"] section:has([data-testid="trend"]), [data-testid="sidebarColumn"] div:has(> [data-testid="news_sidebar"])',
  whoToFollow:
    '[data-testid="sidebarColumn"] div:has(> div > aside [data-testid="UserCell"]), [data-testid="sidebarColumn"] aside:has([data-testid="UserCell"])',
  cell: '[data-testid="cellInnerDiv"]',
  tweet: 'article[data-testid="tweet"]',
  tweetText: '[data-testid="tweetText"]',
  grok: 'a[href="/i/grok"], [data-testid="GrokDrawer"], [data-testid="GrokDrawerHeader"], [aria-label="Grok"], button[aria-label="Grok actions"]',
  homeTabList: '[data-testid="primaryColumn"] [role="tablist"]',
  homeTab: '[role="tab"]',
} as const;

export const HIDDEN_ATTR = 'data-hush-hidden';

export const AD_LABELS = [
  'Ad',
  'Promoted',
  'Sponsored',
  'Publicité',
  'Sponsorisé',
  'Anzeige',
  'Gesponsert',
  'Promocionado',
  'Patrocinado',
  'إعلان',
];
