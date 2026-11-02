import type { PlatformSettings } from '../shared/types';
import { SELECTORS, HIDDEN_ATTR, AD_LABELS } from '../shared/selectors/twitter.selectors';
import { runContentScript, hideRule } from './runtime';

// Set once Following was picked for this visit to /home, so manual tab switches are not fought.
// Cleared when leaving /home or turning the switch off, so turning it on switches at once.
let followingDone = false;

function buildCss(p: PlatformSettings): string {
  const f = p.features;
  return [
    hideRule(SELECTORS.trending, f.hideTrending),
    hideRule(SELECTORS.whoToFollow, f.hideWhoToFollow),
    hideRule(`[${HIDDEN_ATTR}]`, f.hideAds),
    hideRule(SELECTORS.grok, f.hideGrok),
  ]
    .filter(Boolean)
    .join('\n');
}

function applyDom(p: PlatformSettings): void {
  markAds(!!p.features.hideAds);
  applyDefaultFollowing(!!p.features.defaultToFollowing);
}

function markAds(on: boolean): void {
  // Cells are recycled while scrolling, so marks are rebuilt on every pass.
  for (const el of document.querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}]`)) {
    el.removeAttribute(HIDDEN_ATTR);
  }
  if (!on) return;

  for (const tweet of document.querySelectorAll<HTMLElement>(SELECTORS.tweet)) {
    if (hasAdLabel(tweet)) tweet.closest(SELECTORS.cell)?.setAttribute(HIDDEN_ATTR, '');
  }
}

// Promoted tweets carry a short label ("Ad") outside the tweet text.
function hasAdLabel(tweet: HTMLElement): boolean {
  for (const span of tweet.querySelectorAll('span')) {
    if (span.childElementCount > 0) continue;
    if (!AD_LABELS.includes(span.textContent?.trim() ?? '')) continue;
    if (!span.closest(SELECTORS.tweetText)) return true;
  }
  return false;
}

function applyDefaultFollowing(on: boolean): void {
  if (!on || location.pathname !== '/home') {
    followingDone = false;
    return;
  }
  if (followingDone) return;

  // Following is the second home tab in every language.
  const tablist = document.querySelector(SELECTORS.homeTabList);
  const following = tablist?.querySelectorAll<HTMLElement>(SELECTORS.homeTab)[1];
  if (!following) return;

  if (following.getAttribute('aria-selected') !== 'true') following.click();
  followingDone = true;
}

function redirect(p: PlatformSettings): string | null {
  // Default to Following: bounce root visit to /home (tab switch handled in applyDom).
  if (p.features.defaultToFollowing && location.pathname === '/') return '/home';
  return null;
}

runContentScript({ platform: 'twitter', buildCss, applyDom, redirect });
