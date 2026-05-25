// Twitter / X content script — 5 features + redirect (twitter.com + x.com).

import type { PlatformSettings } from '../shared/types';
import { SELECTORS, FOLLOWING_TAB_TEXT } from '../shared/selectors/twitter.selectors';
import { runContentScript, hideRule } from './runtime';

// Track which URL we already forced to Following, so we don't fight manual tab switches.
let followingDoneFor = '';

function buildCss(p: PlatformSettings): string {
  const f = p.features;
  return [
    hideRule(SELECTORS.trending, f.hideTrending),
    hideRule(SELECTORS.whoToFollow, f.hideWhoToFollow),
    hideRule(SELECTORS.promotedCell, f.hideAds),
    hideRule(SELECTORS.grok, f.hideGrok),
  ]
    .filter(Boolean)
    .join('\n');
}

function applyDom(p: PlatformSettings): void {
  if (!p.features.defaultToFollowing) return;
  if (location.pathname !== '/home') return;
  if (followingDoneFor === location.href) return;

  const tabs = Array.from(document.querySelectorAll<HTMLElement>(SELECTORS.homeTab));
  const following = tabs.find((t) =>
    FOLLOWING_TAB_TEXT.some((label) => (t.textContent || '').trim() === label),
  );
  if (!following) return;

  if (following.getAttribute('aria-selected') !== 'true') following.click();
  followingDoneFor = location.href;
}

function redirect(p: PlatformSettings): string | null {
  // Default to Following: bounce root visit to /home (tab switch handled in applyDom).
  if (p.features.defaultToFollowing && location.pathname === '/') return '/home';
  return null;
}

runContentScript({ platform: 'twitter', buildCss, applyDom, redirect });
