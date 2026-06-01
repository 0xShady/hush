// LinkedIn content script — 7 features (via shared runtime). Hide-only, no redirect.
// LinkedIn's class names rotate; everything content-specific is matched by text.

import type { PlatformSettings } from '../shared/types';
import {
  SELECTORS,
  TEXT_MARKERS,
  HIDDEN_ATTR,
} from '../shared/selectors/linkedin.selectors';
import { runContentScript, hideRule } from './runtime';

function buildCss(p: PlatformSettings): string {
  // One CSS rule covers everything JS marks. Categories are tracked via JS state,
  // not via separate selectors, so we don't pay for many selectors at parse time.
  const anyHide =
    p.features.hideAds ||
    p.features.hidePeopleYouMayKnow ||
    p.features.hideNewsActivity ||
    p.features.hideLearning ||
    p.features.hideAddToProfile ||
    p.features.hideCelebrate ||
    p.features.hidePremiumUpsell;
  return [hideRule(`[${HIDDEN_ATTR}]`, anyHide)].filter(Boolean).join('\n');
}

type MarkerGroup = { on: boolean; texts: readonly string[] };

function applyDom(p: PlatformSettings): void {
  const f = p.features;
  const groups: MarkerGroup[] = [
    { on: !!f.hideAds, texts: TEXT_MARKERS.ads },
    { on: !!f.hidePeopleYouMayKnow, texts: TEXT_MARKERS.pymk },
    { on: !!f.hideNewsActivity, texts: TEXT_MARKERS.news },
    { on: !!f.hideLearning, texts: TEXT_MARKERS.learning },
    { on: !!f.hideAddToProfile, texts: TEXT_MARKERS.addToProfile },
    { on: !!f.hideCelebrate, texts: TEXT_MARKERS.celebrate },
    { on: !!f.hidePremiumUpsell, texts: TEXT_MARKERS.premium },
  ].filter((g) => g.on);

  // Clear previous marks so toggling categories off un-hides instantly.
  for (const el of document.querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}]`)) {
    el.removeAttribute(HIDDEN_ATTR);
  }
  if (groups.length === 0) return;

  const targets = collectTargets();
  for (const el of targets) {
    const text = (el.textContent || '').slice(0, 800); // cap to avoid O(huge) scans
    if (groups.some((g) => g.texts.some((t) => text.includes(t)))) {
      el.setAttribute(HIDDEN_ATTR, '');
    }
  }
}

// Build a de-duplicated set of candidate elements to scan.
function collectTargets(): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  const push = (list: NodeListOf<HTMLElement>) => {
    for (const el of list) seen.add(el);
  };
  push(document.querySelectorAll<HTMLElement>(SELECTORS.feedItem));
  push(document.querySelectorAll<HTMLElement>(SELECTORS.asideModule));
  push(document.querySelectorAll<HTMLElement>(SELECTORS.inlineFeedModule));
  return [...seen];
}

runContentScript({ platform: 'linkedin', buildCss, applyDom });
