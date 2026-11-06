import { readFileSync } from 'node:fs';
import { DEFAULT_SETTINGS } from '../src/shared/defaults';
import type { PlatformKey } from '../src/shared/types';
import {
  bodyHtml,
  expect,
  expectAllHidden,
  expectAllVisible,
  fixturePath,
  openFixture,
  setPlatform,
  test,
} from './harness';

type FixturePage = { platform: PlatformKey; url: string; fixture: string };

const PAGES: FixturePage[] = [
  { platform: 'youtube', url: 'https://www.youtube.com/', fixture: 'youtube-home' },
  { platform: 'youtube', url: 'https://www.youtube.com/watch?v=abc123', fixture: 'youtube-watch' },
  { platform: 'twitter', url: 'https://x.com/home', fixture: 'x-home' },
  { platform: 'instagram', url: 'https://www.instagram.com/', fixture: 'instagram-home' },
  { platform: 'reddit', url: 'https://www.reddit.com/', fixture: 'reddit-home' },
  { platform: 'linkedin', url: 'https://www.linkedin.com/feed/', fixture: 'linkedin-feed' },
];

// Switches that do more than hide, covered in behaviour.spec.ts.
const BEHAVIOUR_ONLY = new Set([
  'youtube.commentsBeside',
  'youtube.showDislikeCount',
  'twitter.defaultToFollowing',
  'reddit.disableVideoAutoplay',
]);

function featuresIn(fixture: string): string[] {
  const html = readFileSync(fixturePath(fixture), 'utf8');
  const lists = [...html.matchAll(/data-hidden-by="([^"]+)"/g)].map((m) => m[1].split(' '));
  return [...new Set(lists.flat())];
}

test('every switch is covered by a fixture or a behaviour test', () => {
  const covered = new Set(PAGES.flatMap((p) => featuresIn(p.fixture).map((f) => `${p.platform}.${f}`)));
  const all = Object.entries(DEFAULT_SETTINGS).flatMap(([platform, s]) =>
    Object.keys(s.features).map((f) => `${platform}.${f}`),
  );
  expect(all.filter((key) => !covered.has(key) && !BEHAVIOUR_ONLY.has(key))).toEqual([]);
});

for (const { platform, url, fixture } of PAGES) {
  test.describe(fixture, () => {
    for (const feature of featuresIn(fixture)) {
      test(`${feature} hides only its targets and undoes itself`, async ({ page }) => {
        await openFixture(page, url, fixture);
        const original = await bodyHtml(page);
        const targets = page.locator(`[data-hidden-by~="${feature}"]`);
        const others = page.locator(`[data-keep], [data-hidden-by]:not([data-hidden-by~="${feature}"])`);

        await expectAllVisible(targets);

        await setPlatform(page, platform, { features: [feature] });
        await expectAllHidden(targets);
        await expectAllVisible(others);

        await setPlatform(page, platform, { features: [] });
        await expectAllVisible(targets);
        await expect.poll(() => bodyHtml(page)).toBe(original);
      });
    }

    test('turning the site off undoes every switch', async ({ page }) => {
      await openFixture(page, url, fixture);
      const original = await bodyHtml(page);
      const features = Object.keys(DEFAULT_SETTINGS[platform].features);
      const marked = page.locator('[data-hidden-by]');

      await setPlatform(page, platform, { features });
      await expectAllHidden(marked);
      await expectAllVisible(page.locator('[data-keep]'));

      await setPlatform(page, platform, { enabled: false, features });
      await expectAllVisible(marked);
      await expect.poll(() => bodyHtml(page)).toBe(original);
    });
  });
}
