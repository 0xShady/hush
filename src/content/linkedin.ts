// LinkedIn's class names rotate; posts are matched by their header labels and modules by their titles.

import type { PlatformSettings } from '../shared/types';
import {
  SELECTORS,
  HIDDEN_ATTR,
  AD_LABELS,
  MODULE_TITLES,
  NAV_PREMIUM_TEXT,
  PREMIUM_TEXT,
} from '../shared/selectors/linkedin.selectors';
import { runContentScript, hideRule } from './runtime';

const POST_HEADER_LEAVES = 15;
const SMALL_CARD_CHARS = 400;
const NAV_LABEL_CHARS = 40;

function buildCss(p: PlatformSettings): string {
  const anyHide = Object.values(p.features).some(Boolean);
  return [
    hideRule(`[${HIDDEN_ATTR}]`, anyHide),
    hideRule(SELECTORS.railAd, !!p.features.hideAds),
    hideRule(SELECTORS.puzzles, !!p.features.hidePuzzles),
  ]
    .filter(Boolean)
    .join('\n');
}

function applyDom(p: PlatformSettings): void {
  const f = p.features;

  for (const el of document.querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}]`)) {
    el.removeAttribute(HIDDEN_ATTR);
  }

  const titles: string[] = [
    ...(f.hidePeopleYouMayKnow ? MODULE_TITLES.pymk : []),
    ...(f.hidePuzzles ? MODULE_TITLES.puzzles : []),
  ];
  const hideAds = !!f.hideAds;
  const hidePremium = !!f.hidePremiumUpsell;
  if (!hideAds && !hidePremium && titles.length === 0) return;

  if (hideAds) markAdPosts();
  if (titles.length) markTitledModules(titles);
  if (hideAds || hidePremium) markSmallCards(hideAds, hidePremium);
  if (hidePremium) markNavPremium();
}

function markAdPosts(): void {
  for (const post of document.querySelectorAll<HTMLElement>(SELECTORS.feedPost)) {
    const header = leafTexts(post).slice(0, POST_HEADER_LEAVES).map((l) => l.text);
    if (hasAdLabel(header)) post.setAttribute(HIDDEN_ATTR, '');
  }
}

function markNavPremium(): void {
  for (const el of document.querySelectorAll<HTMLElement>(SELECTORS.navButtons)) {
    const text = el.textContent?.trim() ?? '';
    if (text.length > NAV_LABEL_CHARS) continue;
    if (NAV_PREMIUM_TEXT.some((t) => text.includes(t))) el.setAttribute(HIDDEN_ATTR, '');
  }
}

// Hide the largest container that starts with the title, staying inside the rail or feed entry.
function markTitledModules(titles: string[]): void {
  for (const { root, inclusive } of moduleRoots()) {
    for (const leaf of leafTexts(root)) {
      if (!titles.some((t) => leaf.text.startsWith(t))) continue;
      let card: Element = leaf.el;
      while (card !== root && card.parentElement && firstLeaf(card.parentElement) === leaf.el) {
        if (card.parentElement === root && !inclusive) break;
        card = card.parentElement;
      }
      card.setAttribute(HIDDEN_ATTR, '');
    }
  }
}

function markSmallCards(hideAds: boolean, hidePremium: boolean): void {
  for (const card of collectCards()) {
    const text = card.textContent || '';
    if (text.length > SMALL_CARD_CHARS) continue;
    if (
      (hidePremium && PREMIUM_TEXT.some((t) => text.includes(t))) ||
      (hideAds && hasAdLabel(leafTexts(card).map((l) => l.text)))
    ) {
      card.setAttribute(HIDDEN_ATTR, '');
    }
  }
}

function hasAdLabel(texts: string[]): boolean {
  return texts.some((t) => AD_LABELS.includes(t));
}

type Leaf = { el: Element; text: string };

function leafTexts(root: Element): Leaf[] {
  const out: Leaf[] = [];
  for (const el of root.querySelectorAll('span, p')) {
    if (el.childElementCount > 0) continue;
    const text = el.textContent?.trim();
    if (text) out.push({ el, text });
  }
  return out;
}

function firstLeaf(root: Element): Element | null {
  for (const el of root.querySelectorAll('span, p')) {
    if (el.childElementCount === 0 && el.textContent?.trim()) return el;
  }
  return null;
}

// A rail's content box is its first element with more than one child.
function railBox(rail: Element): Element {
  let box = rail;
  while (box.children.length === 1) box = box.children[0];
  return box;
}

// Feed entries can be hidden whole; a rail itself never is.
function moduleRoots(): { root: Element; inclusive: boolean }[] {
  const roots: { root: Element; inclusive: boolean }[] = [];
  for (const el of document.querySelectorAll(SELECTORS.feedModule)) roots.push({ root: el, inclusive: true });
  for (const rail of document.querySelectorAll(SELECTORS.rail)) roots.push({ root: railBox(rail), inclusive: false });
  return roots;
}

function collectCards(): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  for (const el of document.querySelectorAll<HTMLElement>(SELECTORS.feedModule)) seen.add(el);
  for (const el of document.querySelectorAll<HTMLElement>(SELECTORS.legacyRailModule)) seen.add(el);
  for (const rail of document.querySelectorAll(SELECTORS.rail)) {
    for (const child of railBox(rail).children) seen.add(child as HTMLElement);
  }
  return [...seen];
}

runContentScript({ platform: 'linkedin', buildCss, applyDom });
