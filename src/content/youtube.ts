import type { PlatformSettings } from '../shared/types';
import { SELECTORS } from '../shared/selectors/youtube.selectors';
import { runContentScript, hideRule } from './runtime';

const BEESIDE_STYLE_ID = 'hush-yt-beeside';
const DISLIKE_COUNT_ATTR = 'data-hush-dislike-id';
const commentsHome = document.createComment('hush-comments-home');
const relatedHome = document.createComment('hush-related-home');
const dislikeCache = new Map<string, string>();
let dislikeInFlight = new Set<string>();

function buildCss(p: PlatformSettings): string {
  const f = p.features;
  return [
    hideRule(SELECTORS.shortsShelf, f.hideShorts),
    hideRule(SELECTORS.shortsNav, f.hideShorts),
    hideRule(SELECTORS.sidebarRecs, f.hideSidebarRecs),
    hideRule(SELECTORS.endScreen, f.hideEndScreen),
    hideRule(SELECTORS.homeFeed, f.hideHomeFeed),
    hideRule(SELECTORS.autoplayToggle, f.disableAutoplay),
    hideRule(SELECTORS.subscriptionsGuide, f.hideSubscriptions),
    hideRule(SELECTORS.playables, f.hidePlayables),
  ]
    .filter(Boolean)
    .join('\n');
}

function applyDom(p: PlatformSettings): void {
  const f = p.features;

  applyCommentsBeside(!!f.commentsBeeside);

  if (f.disableAutoplay) {
    const toggle = document.querySelector<HTMLElement>(SELECTORS.autoplayToggleChecked);
    if (toggle) toggle.click();
  }

  applyDislikeCount(!!f.showDislikeCount);
}

function applyDislikeCount(on: boolean): void {
  const btn = document.querySelector<HTMLElement>(SELECTORS.dislikeButton);
  if (!btn) return;

  if (!on) {
    if (btn.hasAttribute(DISLIKE_COUNT_ATTR)) {
      btn.removeAttribute(DISLIKE_COUNT_ATTR);
      const label = btn.querySelector('.hush-dislike-count');
      label?.remove();
    }
    return;
  }

  if (location.pathname !== '/watch') return;
  const videoId = new URLSearchParams(location.search).get('v');
  if (!videoId) return;

  const current = btn.getAttribute(DISLIKE_COUNT_ATTR);
  if (current === videoId && btn.querySelector('.hush-dislike-count')) return;

  const cached = dislikeCache.get(videoId);
  if (cached !== undefined) {
    renderDislikeCount(btn, videoId, cached);
    return;
  }

  if (dislikeInFlight.has(videoId)) return;
  dislikeInFlight.add(videoId);
  fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data: { dislikes?: number }) => {
      const formatted =
        typeof data.dislikes === 'number' ? formatCount(data.dislikes) : '?';
      dislikeCache.set(videoId, formatted);
      const liveBtn = document.querySelector<HTMLElement>(SELECTORS.dislikeButton);
      if (liveBtn) renderDislikeCount(liveBtn, videoId, formatted);
    })
    .catch(() => {
      dislikeCache.set(videoId, '?');
    })
    .finally(() => {
      dislikeInFlight.delete(videoId);
    });
}

function renderDislikeCount(btn: HTMLElement, videoId: string, text: string): void {
  btn.setAttribute(DISLIKE_COUNT_ATTR, videoId);
  let label = btn.querySelector<HTMLElement>('.hush-dislike-count');
  if (!label) {
    label = document.createElement('span');
    label.className = 'hush-dislike-count';
    label.style.marginLeft = '6px';
    label.style.fontWeight = '500';
    btn.appendChild(label);
  }
  label.textContent = text;
}

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)}M`;
  return `${(n / 1_000_000_000).toFixed(1)}B`;
}

// Comments Beside: comments fill the right column at the player's height and
// scroll internally; recommendations move under the player, so the whole thread
// is reachable without leaving the video.
function applyCommentsBeside(on: boolean): void {
  const comments = document.querySelector<HTMLElement>(SELECTORS.comments);
  const related = document.querySelector<HTMLElement>(SELECTORS.related);
  const primary = document.querySelector<HTMLElement>(SELECTORS.primaryInner);
  const secondary = document.querySelector<HTMLElement>(SELECTORS.secondaryInner);
  if (!comments || !primary || !secondary) return;

  if (on) {
    if (comments.parentElement !== secondary) {
      comments.before(commentsHome);
      secondary.prepend(comments);
    }
    if (related && related.parentElement !== primary) {
      related.before(relatedHome);
      primary.appendChild(related);
    }
    upsertBeesideStyle();
  } else {
    if (comments.parentElement === secondary) putBack(comments, commentsHome, primary);
    if (related && related.parentElement === primary) putBack(related, relatedHome, secondary);
    document.getElementById(BEESIDE_STYLE_ID)?.remove();
  }
}

// Placeholders left where YouTube rendered the nodes, so turning the feature off restores the original layout.
function putBack(el: HTMLElement, home: Comment, fallback: HTMLElement): void {
  if (home.isConnected) home.replaceWith(el);
  else fallback.appendChild(el);
}

function upsertBeesideStyle(): void {
  if (document.getElementById(BEESIDE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = BEESIDE_STYLE_ID;
  // --masthead = YT top bar height (~56px). Sticky pins the right column at
  // top; max-height clamps to viewport so the inner #comments scroll-area
  // matches the player's vertical footprint.
  style.textContent = `
    ${SELECTORS.watchFlexy}:not([theater]) #secondary {
      position: sticky !important;
      top: 56px !important;
      align-self: flex-start !important;
      height: calc(100vh - 80px) !important;
      max-height: calc(100vh - 80px) !important;
      overflow: hidden !important;
    }
    ${SELECTORS.watchFlexy}:not([theater]) ${SELECTORS.secondaryInner} {
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }
    ${SELECTORS.watchFlexy}:not([theater]) ${SELECTORS.secondaryInner} > #comments {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow-y: auto !important;
      margin-top: 0 !important;
    }
    ${SELECTORS.primaryInner} > #related { margin-top: 24px !important; }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function redirect(p: PlatformSettings): string | null {
  // Hide Shorts also blocks /shorts/* pages → bounce to landing or root.
  if (p.features.hideShorts && location.pathname.startsWith('/shorts/')) {
    return resolveLanding(p, ['/shorts/']);
  }
  return null;
}

// Pick landing page, falling back to root if landing collides with a blocked path.
function resolveLanding(p: PlatformSettings, blocked: string[]): string {
  const landing = p.landingPage;
  if (!landing || blocked.some((b) => landing.startsWith(b))) return '/';
  return landing;
}

runContentScript({ platform: 'youtube', buildCss, applyDom, redirect });
