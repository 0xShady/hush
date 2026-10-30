// Hush popup entry point. Renders platform tabs + active panel, wired to storage.

import browser from 'webextension-polyfill';
import type { PlatformKey, Settings } from '../shared/types';
import { PLATFORM_KEYS } from '../shared/types';
import { PLATFORM_CONFIG } from '../shared/platformConfig';
import { getSettings, setPlatformSettings } from '../shared/storage';
import { platformTab } from './components/platformTab';

let settings: Settings;
let active: PlatformKey = 'youtube';

function platformForHost(host: string): PlatformKey | null {
  const h = host.toLowerCase();
  if (h.endsWith('youtube.com') || h === 'youtu.be') return 'youtube';
  if (h.endsWith('instagram.com')) return 'instagram';
  if (h.endsWith('twitter.com') || h.endsWith('x.com')) return 'twitter';
  if (h.endsWith('reddit.com')) return 'reddit';
  if (h.endsWith('linkedin.com')) return 'linkedin';
  return null;
}

async function detectActiveTabPlatform(): Promise<PlatformKey | null> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0]?.url;
    if (!url) return null;
    return platformForHost(new URL(url).hostname);
  } catch {
    return null;
  }
}

async function pingActiveTab(): Promise<void> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;
    if (tabId == null) return;
    await browser.tabs.sendMessage(tabId, { type: 'hush:refresh' });
  } catch {
    /* tab without content script or context issue — storage event is the fallback */
  }
}

const app = document.getElementById('app')!;

function render() {
  app.replaceChildren();

  // Tab bar.
  const tabs = document.createElement('nav');
  tabs.className = 'tabs';
  for (const key of PLATFORM_KEYS) {
    const btn = document.createElement('button');
    btn.className = 'tab';
    if (key === active) btn.classList.add('is-active');
    btn.textContent = PLATFORM_CONFIG[key].name;
    btn.addEventListener('click', () => {
      active = key;
      render();
    });
    tabs.append(btn);
  }
  app.append(tabs);

  // Active platform panel.
  app.append(
    platformTab({
      platform: active,
      settings: settings[active],
      onPatch: async (patch) => {
        settings = await setPlatformSettings(active, patch);
        render();
        pingActiveTab();
      },
    }),
  );
}

async function init() {
  const [loaded, detected] = await Promise.all([getSettings(), detectActiveTabPlatform()]);
  settings = loaded;
  if (detected) active = detected;
  render();
}

init();
