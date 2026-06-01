// Shared content-script runtime: CSS injection, observer, redirect, storage wiring.
// Each platform script supplies its feature/redirect logic; this handles the plumbing.

import browser from 'webextension-polyfill';
import type { PlatformKey, PlatformSettings, Settings } from '../shared/types';
import { getSettings, onSettingsChange, contextAlive } from '../shared/storage';

const STYLE_ID = 'focusfeed-style';

// Upsert a single <style> tag holding all CSS-based hiding rules.
export function injectCss(css: string): void {
  const parent = document.head || document.documentElement;
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    parent.appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

// Build a CSS string: hide `selector` when `on` is true.
export function hideRule(selector: string, on: boolean): string {
  if (!on || !selector) return '';
  return `${selector} { display: none !important; }`;
}

export type RedirectResult = string | null; // target path, or null = no redirect

export type ContentScript = {
  platform: PlatformKey;
  // Build CSS from feature flags (auto-applies to future nodes — no observer needed).
  buildCss: (p: PlatformSettings) => string;
  // Imperative per-pass work (move DOM, disable autoplay, etc.). Re-run on mutation.
  applyDom?: (p: PlatformSettings) => void;
  // Return a path to navigate to, or null. Runs once per settings pass / navigation.
  redirect?: (p: PlatformSettings) => RedirectResult;
};

export function runContentScript(script: ContentScript): void {
  let lastHref = '';
  let cached: Settings | null = null;
  let rafScheduled = false;

  const apply = (settings: Settings) => {
    cached = settings;
    const p = settings[script.platform];

    if (!p.enabled) {
      injectCss(''); // clear all hiding when platform disabled
      return;
    }

    // Redirect first — only when URL actually changed since last pass.
    if (script.redirect && location.href !== lastHref) {
      lastHref = location.href;
      const target = script.redirect(p);
      if (target && !samePath(target)) {
        location.replace(new URL(target, location.origin).toString());
        return;
      }
    } else {
      lastHref = location.href;
    }

    injectCss(script.buildCss(p));
    script.applyDom?.(p);
  };

  // Observer path: cached settings only, throttled to one apply per frame.
  const scheduleObserverApply = () => {
    if (rafScheduled || !cached) return;
    rafScheduled = true;
    requestAnimationFrame(() => {
      rafScheduled = false;
      if (cached) apply(cached);
    });
  };

  // Initial + storage-change path: refresh from storage, then apply.
  const refresh = async () => {
    if (!contextAlive()) {
      if (cached) apply(cached);
      return;
    }
    try {
      const settings = await getSettings();
      apply(settings);
    } catch {
      if (cached) apply(cached);
    }
  };

  const observer = new MutationObserver(scheduleObserverApply);
  const startObserver = () => observer.observe(document.body, { childList: true, subtree: true });
  if (document.body) startObserver();
  else document.addEventListener('DOMContentLoaded', startObserver, { once: true });

  // Live sync from popup toggles via storage event.
  onSettingsChange(apply);

  // Belt-and-suspenders: popup also pings the active tab after a write.
  try {
    browser.runtime.onMessage.addListener((msg: unknown) => {
      if (msg && typeof msg === 'object' && (msg as { type?: string }).type === 'focusfeed:refresh') {
        refresh();
      }
    });
  } catch {
    /* context gone — ignore */
  }

  // Initial run.
  refresh();
}

function samePath(target: string): boolean {
  try {
    const t = new URL(target, location.origin);
    return t.pathname === location.pathname;
  } catch {
    return false;
  }
}
