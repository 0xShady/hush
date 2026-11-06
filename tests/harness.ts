import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test as base, expect, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { DEFAULT_SETTINGS } from '../src/shared/defaults';
import type { PlatformKey, PlatformSettings, Settings } from '../src/shared/types';

const extensionPath = resolve('dist/test');

export const test = base.extend<{ context: BrowserContext }>({
  context: async ({ playwright }, use) => {
    const profile = await mkdtemp(join(tmpdir(), 'hush-test-'));
    const context = await playwright.chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
    await use(context);
    await context.close();
    await rm(profile, { recursive: true, force: true });
  },
});

export { expect };

export function fixturePath(fixture: string): string {
  return resolve('tests/fixtures', `${fixture}.html`);
}

export async function openFixture(page: Page, url: string, fixture: string): Promise<void> {
  const body = await readFile(fixturePath(fixture), 'utf8');
  await page.context().route(/^https?:/, (route) =>
    route.request().isNavigationRequest() ? route.fulfill({ contentType: 'text/html; charset=utf-8', body }) : route.abort(),
  );
  await page.goto(url);
  await readSettings(page);
}

// The content script loads asynchronously, so the message repeats until its bridge answers.
function bridge(page: Page, message: { type: string; settings?: unknown }): Promise<Settings> {
  return page.evaluate(
    (msg) =>
      new Promise<Settings>((done) => {
        const timer = setInterval(() => window.postMessage(msg, '*'), 50);
        window.addEventListener('message', function onMessage(e) {
          if (e.data?.type !== 'hush:test-settings') return;
          clearInterval(timer);
          window.removeEventListener('message', onMessage);
          done(e.data.settings);
        });
      }),
    message,
  );
}

export function readSettings(page: Page): Promise<Settings> {
  return bridge(page, { type: 'hush:test-get' });
}

export function writeRawSettings(page: Page, settings: unknown): Promise<Settings> {
  return bridge(page, { type: 'hush:test-set', settings });
}

export function setPlatform(
  page: Page,
  platform: PlatformKey,
  patch: Partial<Omit<PlatformSettings, 'features'>> & { features?: string[] },
): Promise<Settings> {
  const def = DEFAULT_SETTINGS[platform];
  const on = patch.features ?? [];
  const features = Object.fromEntries(Object.keys(def.features).map((f) => [f, on.includes(f)]));
  return writeRawSettings(page, { ...DEFAULT_SETTINGS, [platform]: { ...def, ...patch, features } });
}

export function bodyHtml(page: Page): Promise<string> {
  return page.evaluate(() => document.body.outerHTML);
}

export async function expectAllHidden(locator: Locator): Promise<void> {
  await expect(locator).not.toHaveCount(0);
  for (const el of await locator.all()) await expect(el).toBeHidden();
}

export async function expectAllVisible(locator: Locator): Promise<void> {
  for (const el of await locator.all()) await expect(el).toBeVisible();
}
