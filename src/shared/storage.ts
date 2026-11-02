import browser from 'webextension-polyfill';
import type { PlatformKey, PlatformSettings, Settings } from './types';
import { DEFAULT_SETTINGS } from './defaults';
import { PLATFORM_KEYS } from './types';

const STORAGE_KEY = 'hush:settings';

// True after the host extension is reloaded/uninstalled. Existing content
// scripts keep running but every browser.* call throws "Extension context
// invalidated". We swallow those and stop further work.
function contextAlive(): boolean {
  try {
    return !!browser.runtime?.id;
  } catch {
    return false;
  }
}

function isContextInvalidated(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /Extension context invalidated|context invalidated|Receiving end does not exist/i.test(
    msg,
  );
}

// Merge stored settings over defaults so new feature keys always resolve and removed ones drop out.
function mergeWithDefaults(stored: Partial<Settings> | undefined): Settings {
  const result = {} as Settings;
  for (const key of PLATFORM_KEYS) {
    const def = DEFAULT_SETTINGS[key];
    const got = stored?.[key];
    const features = Object.fromEntries(
      Object.keys(def.features).map((f) => [f, got?.features?.[f] ?? def.features[f]]),
    );
    result[key] = {
      enabled: got?.enabled ?? def.enabled,
      landingPage: got?.landingPage ?? def.landingPage,
      features,
    };
  }
  return result;
}

export async function getSettings(): Promise<Settings> {
  if (!contextAlive()) return mergeWithDefaults(undefined);
  try {
    const raw = await browser.storage.sync.get(STORAGE_KEY);
    return mergeWithDefaults(raw[STORAGE_KEY] as Partial<Settings> | undefined);
  } catch (e) {
    if (isContextInvalidated(e)) return mergeWithDefaults(undefined);
    throw e;
  }
}

export async function setSettings(settings: Settings): Promise<void> {
  if (!contextAlive()) return;
  try {
    await browser.storage.sync.set({ [STORAGE_KEY]: settings });
  } catch (e) {
    if (isContextInvalidated(e)) return;
    throw e;
  }
}

export async function setPlatformSettings(
  key: PlatformKey,
  patch: Partial<PlatformSettings>,
): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = {
    ...current,
    [key]: { ...current[key], ...patch },
  };
  await setSettings(next);
  return next;
}

export function onSettingsChange(cb: (settings: Settings) => void): () => void {
  if (!contextAlive()) return () => {};
  const listener = (
    changes: Record<string, browser.Storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName !== 'sync' || !(STORAGE_KEY in changes)) return;
    cb(mergeWithDefaults(changes[STORAGE_KEY].newValue as Partial<Settings> | undefined));
  };
  try {
    browser.storage.onChanged.addListener(listener);
  } catch (e) {
    if (isContextInvalidated(e)) return () => {};
    throw e;
  }
  return () => {
    try {
      browser.storage.onChanged.removeListener(listener);
    } catch {
      /* context already gone */
    }
  };
}

export { contextAlive, isContextInvalidated };
