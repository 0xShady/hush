// Dev-only background worker, added to the Chrome manifest by `npm run dev:chrome`.
//
// `vite build --watch` writes dev-build.json with a new id after every rebuild.
// This polls it and, when the id changes, reloads the extension, then reloads open
// tabs on supported sites so their content scripts re-inject.
//
// Unpacked extensions serve files straight from disk, so the fetch sees new builds.
// Calling an extension API every tick (storage.local.get) keeps the MV3 worker
// alive; otherwise Chrome stops it after 30 s idle.
import browser from 'webextension-polyfill';

const BUILD_FILE = browser.runtime.getURL('dev-build.json');
const POLL_MS = 1000;

async function reloadContentScriptTabs(): Promise<void> {
  const matches = (browser.runtime.getManifest().content_scripts ?? []).flatMap((cs) => cs.matches ?? []);
  const tabs = await browser.tabs.query({ url: matches });
  await Promise.all(tabs.map((tab) => tab.id !== undefined && browser.tabs.reload(tab.id)));
}

async function poll(): Promise<void> {
  try {
    const { id } = (await (await fetch(BUILD_FILE, { cache: 'no-store' })).json()) as { id: string };
    const { devBuildId } = await browser.storage.local.get('devBuildId');
    if (devBuildId === undefined) {
      await browser.storage.local.set({ devBuildId: id });
    } else if (id !== devBuildId) {
      await browser.storage.local.set({ devBuildId: id, devReloadTabs: true });
      browser.runtime.reload();
    }
  } catch {
    // Mid-build: file missing or half-written, try again next tick
  }
}

// Wake on browser start too, not only on install or reload
browser.runtime.onStartup.addListener(() => {});

void (async () => {
  const { devReloadTabs } = await browser.storage.local.get('devReloadTabs');
  if (devReloadTabs) {
    await browser.storage.local.remove('devReloadTabs');
    await reloadContentScriptTabs();
  }
  setInterval(() => void poll(), POLL_MS);
})();
