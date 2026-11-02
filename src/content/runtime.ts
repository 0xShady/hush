import browser from 'webextension-polyfill';
import type { PlatformKey, PlatformSettings, Settings } from '../shared/types';
import { getSettings, setSettings, onSettingsChange, contextAlive } from '../shared/storage';

const STYLE_ID = 'hush-style';

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

export function hideRule(selector: string, on: boolean): string {
  if (!on || !selector) return '';
  return `${selector} { display: none !important; }`;
}

export type RedirectResult = string | null;

export type ContentScript = {
  platform: PlatformKey;
  // CSS from feature flags; applies to future nodes, so no observer is needed.
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
  let cleaned = true;

  const apply = (settings: Settings) => {
    cached = settings;
    const p = settings[script.platform];

    if (!p.enabled) {
      injectCss('');
      // One pass with every feature off undoes DOM work (moved nodes, marks, injected labels).
      if (!cleaned) {
        script.applyDom?.(allFeaturesOff(p));
        cleaned = true;
      }
      return;
    }
    cleaned = false;

    // Redirect first, only when the URL changed since the last pass.
    if (location.href !== lastHref) {
      lastHref = location.href;
      const target = script.redirect?.(p) ?? landingRedirect(p);
      if (target && !samePath(target)) {
        location.replace(new URL(target, location.origin).toString());
        return;
      }
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

  onSettingsChange(apply);

  // The popup also pings the active tab after a write, in case the storage event is missed.
  try {
    browser.runtime.onMessage.addListener((msg: unknown) => {
      if (msg && typeof msg === 'object' && (msg as { type?: string }).type === 'hush:refresh') {
        refresh();
      }
    });
  } catch {
    /* context gone */
  }

  if (__HUSH_DEV__) installTestBridge();

  refresh();
}

// Dev builds only: lets E2E tests read and write settings from the page with postMessage.
function installTestBridge(): void {
  window.addEventListener('message', async (e) => {
    if (e.source !== window || !e.data || typeof e.data !== 'object') return;
    const { type, settings } = e.data as { type?: string; settings?: Settings };
    if (type === 'hush:test-set' && settings) await setSettings(settings);
    if (type === 'hush:test-set' || type === 'hush:test-get') {
      window.postMessage({ type: 'hush:test-settings', settings: await getSettings() }, '*');
    }
  });
}

function landingRedirect(p: PlatformSettings): RedirectResult {
  return p.landingPage && location.pathname === '/' ? p.landingPage : null;
}

function allFeaturesOff(p: PlatformSettings): PlatformSettings {
  const features = Object.fromEntries(Object.keys(p.features).map((k) => [k, false]));
  return { ...p, features };
}

function samePath(target: string): boolean {
  try {
    const t = new URL(target, location.origin);
    return t.pathname === location.pathname;
  } catch {
    return false;
  }
}
