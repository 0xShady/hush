import type { PlatformSettings } from '../shared/types';
import {
  SELECTORS,
  AD_TEXT,
  PREMIUM_TEXT,
  HIDDEN_ATTR,
} from '../shared/selectors/reddit.selectors';
import { runContentScript, hideRule } from './runtime';

function buildCss(p: PlatformSettings): string {
  const f = p.features;
  return [
    hideRule(SELECTORS.adMarker, f.hideAds),
    hideRule(SELECTORS.awards, f.hideAwards),
    hideRule(SELECTORS.premiumUpsellHard, f.hidePremiumUpsell),
    hideRule(`[${HIDDEN_ATTR}]`, f.hideAds || f.hidePremiumUpsell),
  ]
    .filter(Boolean)
    .join('\n');
}

function applyDom(p: PlatformSettings): void {
  const f = p.features;

  // Clear previous text-based marks so toggling categories off un-hides instantly.
  for (const el of document.querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}]`)) {
    el.removeAttribute(HIDDEN_ATTR);
  }

  if (f.hideAds) markAds();
  if (f.hidePremiumUpsell) markPremium();
  if (f.disableVideoAutoplay) stopVideoAutoplay();
}

function markAds(): void {
  for (const post of document.querySelectorAll<HTMLElement>(SELECTORS.post)) {
    // Only scan the post header: the full post text would false-positive on the
    // word "Promoted" in body content.
    const head = post.textContent?.slice(0, 200) || '';
    if (AD_TEXT.some((t) => head.includes(t))) {
      post.setAttribute(HIDDEN_ATTR, '');
    }
  }
}

function markPremium(): void {
  // Premium widgets show up in the right rail and as inline banners, so check
  // small candidate containers (cards, sections) for premium copy.
  const candidates = document.querySelectorAll<HTMLElement>(
    'aside section, aside > div, [data-testid*="sidebar"] section, faceplate-tracker',
  );
  for (const el of candidates) {
    const text = el.textContent?.slice(0, 300) || '';
    if (PREMIUM_TEXT.some((t) => text.includes(t))) {
      el.setAttribute(HIDDEN_ATTR, '');
    }
  }
}

function stopVideoAutoplay(): void {
  for (const video of document.querySelectorAll<HTMLVideoElement>(SELECTORS.videos)) {
    video.autoplay = false;
    video.removeAttribute('autoplay');
    if (!video.paused) video.pause();
  }
}

runContentScript({ platform: 'reddit', buildCss, applyDom });
