import type { PlatformSettings } from '../shared/types';
import {
  SELECTORS,
  AD_LABELS,
  SUGGESTED_LABELS,
  HIDDEN_ATTR,
  STORIES_ATTR,
  SUGGESTED_ACCOUNTS_ATTR,
} from '../shared/selectors/instagram.selectors';
import { runContentScript, hideRule } from './runtime';

const POST_HEADER_LEAVES = 12;

function buildCss(p: PlatformSettings): string {
  const f = p.features;
  return [
    hideRule(SELECTORS.reelsNav, f.hideReels),
    hideRule(`[${STORIES_ATTR}]`, f.hideStories),
    hideRule(`[${SUGGESTED_ACCOUNTS_ATTR}]`, f.hideSuggested),
    collapseRule(
      [f.hideReelsInFeed && SELECTORS.feedReelArticle, (f.hideAds || f.hideSuggested) && `article[${HIDDEN_ATTR}]`],
    ),
  ]
    .filter(Boolean)
    .join('\n');
}

// The feed is a virtual list that sizes each post as the gap to the next post's top. A display:none post
// reports a top of 0 and corrupts its neighbour's size (blank space, no next page); a 1px post is first
// counted at the 800px estimate and the shrink pulls the scroll back. 0px in flow is measured exactly.
function collapseRule(selectors: (string | false | undefined)[]): string {
  const list = selectors.filter(Boolean).join(', ');
  if (!list) return '';
  return `${list} {
    display: block !important;
    height: 0 !important;
    min-height: 0 !important;
    max-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    overflow: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }`;
}

function applyDom(p: PlatformSettings): void {
  const f = p.features;

  applyStoriesMark(!!f.hideStories);
  applySuggestedAccountsMark(!!f.hideSuggested);
  applyArticleMarks(!!f.hideAds, !!f.hideSuggested);
}

function applyStoriesMark(on: boolean): void {
  for (const el of document.querySelectorAll<HTMLElement>(`[${STORIES_ATTR}]`)) {
    el.removeAttribute(STORIES_ATTR);
  }
  if (!on) return;

  const tray = [...document.querySelectorAll<HTMLElement>(SELECTORS.storiesList)].find((ul) => !ul.closest('article'));
  if (!tray) return;
  // The tray and its scroll arrow share the parent of the presentation box.
  let wrapper = tray.closest('[role="presentation"]')?.parentElement ?? tray.parentElement;
  // Never a box that holds feed posts, or the whole feed would go.
  if (!wrapper || wrapper.querySelector('article')) return;
  // Its single-child ancestors keep a fixed height; hide the outermost one so no gap is left.
  while (wrapper.parentElement && wrapper.parentElement.children.length === 1 && !wrapper.parentElement.querySelector('article')) {
    wrapper = wrapper.parentElement;
  }
  wrapper.setAttribute(STORIES_ATTR, '');
}

function applySuggestedAccountsMark(on: boolean): void {
  for (const el of document.querySelectorAll<HTMLElement>(`[${SUGGESTED_ACCOUNTS_ATTR}]`)) {
    el.removeAttribute(SUGGESTED_ACCOUNTS_ATTR);
  }
  if (!on) return;

  const link = [...document.querySelectorAll<HTMLElement>(SELECTORS.suggestedAccountsLink)].find((a) => !a.closest('article'));
  if (!link) return;
  // "See all" sits in the heading row; the block is the first ancestor that also holds the avatars.
  let block: HTMLElement | null = link;
  while (block && block.querySelectorAll('img').length < 2) block = block.parentElement;
  if (!block || block.matches('main') || block.querySelector('article')) return;
  while (block.parentElement && block.parentElement.children.length === 1) block = block.parentElement;
  block.setAttribute(SUGGESTED_ACCOUNTS_ATTR, '');
}

function applyArticleMarks(hideAds: boolean, hideSuggested: boolean): void {
  for (const el of document.querySelectorAll<HTMLElement>(`article[${HIDDEN_ATTR}]`)) {
    el.removeAttribute(HIDDEN_ATTR);
  }
  if (!hideAds && !hideSuggested) return;

  for (const article of document.querySelectorAll<HTMLElement>(SELECTORS.feedArticle)) {
    const header = headerLabels(article);
    const isAd = hideAds && header.some((t) => AD_LABELS.includes(t));
    const isSuggested = hideSuggested && header.some((t) => SUGGESTED_LABELS.includes(t));
    if (isAd || isSuggested) article.setAttribute(HIDDEN_ATTR, '');
  }
}

// Text of the first leaf nodes of a post: author, labels ("Ad", "Suggested for you"), not the caption.
function headerLabels(article: HTMLElement): string[] {
  const out: string[] = [];
  for (const el of article.querySelectorAll('span, a, div')) {
    if (el.childElementCount > 0) continue;
    const text = el.textContent?.trim();
    if (text) out.push(text);
    if (out.length >= POST_HEADER_LEAVES) break;
  }
  return out;
}

function redirect(p: PlatformSettings): string | null {
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
