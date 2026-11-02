import type { PlatformSettings } from '../shared/types';
import {
  SELECTORS,
  AD_TEXT,
  PREMIUM_TEXT,
  HIDDEN_ATTR,
} from '../shared/selectors/reddit.selectors';
import { runContentScript, hideRule } from './runtime';

const guardedVideos = new WeakSet<HTMLVideoElement>();
let blockAutoplay = false;

function buildCss(p: PlatformSettings): string {
  const f = p.features;
  return [
    hideRule(SELECTORS.adMarker, f.hideAds),
    hideRule(SELECTORS.awards, f.hideAwards),
    hideRule(SELECTORS.games, f.hideGames),
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
  blockAutoplay = !!f.disableVideoAutoplay;
  if (blockAutoplay) stopVideoAutoplay();
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
  for (const player of document.querySelectorAll<HTMLElement>(SELECTORS.players)) {
    player.removeAttribute('autoplay');
    const video = player.shadowRoot?.querySelector('video');
    if (video) guardVideo(video);
  }
  for (const video of document.querySelectorAll<HTMLVideoElement>(SELECTORS.videos)) {
    guardVideo(video);
  }
}

// Pause playback that starts without a user gesture, so clicking play still works.
function guardVideo(video: HTMLVideoElement): void {
  video.autoplay = false;
  video.removeAttribute('autoplay');
  if (guardedVideos.has(video)) return;
  guardedVideos.add(video);
  video.addEventListener('play', () => {
    if (blockAutoplay && !navigator.userActivation?.isActive) video.pause();
  });
  if (!video.paused && !navigator.userActivation?.isActive) video.pause();
}

runContentScript({ platform: 'reddit', buildCss, applyDom });
