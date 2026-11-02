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
    /* tab has no content script; the storage event is the fallback */
  }
}

const app = document.getElementById('app')!;

function render() {
  app.replaceChildren();

  const header = document.createElement('header');
  header.className = 'header';
  const logo = document.createElement('img');
  logo.className = 'logo';
  logo.src = '/icons/icon-32.png';
  logo.alt = '';
  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = 'Hush';
  header.append(logo, title);
  app.append(header);

  const tabs = document.createElement('nav');
  tabs.className = 'tabs';
  tabs.setAttribute('role', 'tablist');
  for (const key of PLATFORM_KEYS) {
    const config = PLATFORM_CONFIG[key];
    const platform = settings[key];
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(key === active));
    btn.title = config.name;
    if (key === active) btn.classList.add('is-active');
    if (!platform.enabled) btn.classList.add('is-off');

    const name = document.createElement('span');
    name.textContent = config.short ?? config.name;
    btn.append(name);

    // Number of filters switched on for this site.
    const count = platform.enabled ? Object.values(platform.features).filter(Boolean).length : 0;
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = String(count);
      badge.setAttribute('aria-label', `${count} on`);
      btn.append(badge);
    }

    btn.addEventListener('click', () => {
      active = key;
      render();
    });
    tabs.append(btn);
  }
  app.append(tabs);

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
