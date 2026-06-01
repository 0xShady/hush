// Instagram content script — 5 features + redirect (via shared runtime).

import type { PlatformSettings } from '../shared/types';
import {
  SELECTORS,
  AD_TEXT,
  SUGGESTED_TEXT,
  HIDDEN_ATTR,
  STORIES_ATTR,
} from '../shared/selectors/instagram.selectors';
import { runContentScript, hideRule } from './runtime';

function buildCss(p: PlatformSettings): string {
  const f = p.features;
  return [
    hideRule(SELECTORS.reelsNav, f.hideReels),
    // Stories wrapper marked by JS — hide the whole section so arrows + ring borders collapse.
    hideRule(`[${STORIES_ATTR}]`, f.hideStories),
    hideRule(SELECTORS.feedVideoArticle, f.hideReelsInFeed),
    // Articles marked as ad/suggested: collapse in place (no display:none).
    // display:none triggers IG's virtualization to reshuffle scroll math →
    // jumpy feed + huge gaps. Zero-height-but-in-flow keeps anchors stable.
    f.hideAds || f.hideSuggested
      ? `article[${HIDDEN_ATTR}] {
           height: 0 !important;
           min-height: 0 !important;
           max-height: 0 !important;
           margin: 0 !important;
           padding: 0 !important;
           border: 0 !important;
           overflow: hidden !important;
           opacity: 0 !important;
           pointer-events: none !important;
           overflow-anchor: none !important;
         }`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function applyDom(p: PlatformSettings): void {
  const f = p.features;

  applyStoriesMark(!!f.hideStories);
  applyArticleMarks(!!f.hideAds, !!f.hideSuggested);
}

// Find the stories tray via /stories/ links and mark its enclosing <section>.
// We anchor on the link (stable) rather than on aria/class hooks (rotated).
function applyStoriesMark(on: boolean): void {
  // Always start by clearing any prior mark so toggling off restores layout.
  for (const el of document.querySelectorAll<HTMLElement>(`[${STORIES_ATTR}]`)) {
    el.removeAttribute(STORIES_ATTR);
  }
  if (!on) return;

  const link = document.querySelector<HTMLElement>(SELECTORS.storiesAnchor);
  if (!link) return;

  // Prefer the closest <section> — IG wraps the tray in its own section.
  // Fall back to walking up two ancestors so we catch arrows + ring borders.
  const wrapper =
    link.closest('section') ||
    link.closest('ul')?.parentElement?.parentElement ||
    link.closest('ul')?.parentElement;
  if (!wrapper) return;
  // Don't grab anything that contains an <article> (feed post) — would nuke feed.
  if (wrapper.querySelector('article')) return;
  wrapper.setAttribute(STORIES_ATTR, '');
}

// Scan feed articles and mark ad / suggested ones. Clears prior marks each pass
// so toggling a category off immediately un-hides matching posts.
function applyArticleMarks(hideAds: boolean, hideSuggested: boolean): void {
  // Clear previous marks so a single rule covers both categories cleanly.
  for (const el of document.querySelectorAll<HTMLElement>(`article[${HIDDEN_ATTR}]`)) {
    el.removeAttribute(HIDDEN_ATTR);
  }
  if (!hideAds && !hideSuggested) return;

  for (const article of document.querySelectorAll<HTMLElement>(SELECTORS.feedArticle)) {
    // textContent is cheap relative to the work IG already does; only the
    // header region matters but a full pass is simpler and still fast.
    const text = article.textContent || '';
    const isAd = hideAds && AD_TEXT.some((t) => text.includes(t));
    const isSuggested =
      hideSuggested && SUGGESTED_TEXT.some((t) => text.includes(t));
    if (isAd || isSuggested) article.setAttribute(HIDDEN_ATTR, '');
  }
}

function redirect(p: PlatformSettings): string | null {
  // Hide Reels Tab also blocks /reels/* → bounce to landing or root.
  if (p.features.hideReels && location.pathname.startsWith('/reels')) {
    return resolveLanding(p, ['/reels']);
  }
  return null;
}

function resolveLanding(p: PlatformSettings, blocked: string[]): string {
  const landing = p.landingPage;
  if (!landing || blocked.some((b) => landing.startsWith(b))) return '/';
  return landing;
}

runContentScript({ platform: 'instagram', buildCss, applyDom, redirect });
