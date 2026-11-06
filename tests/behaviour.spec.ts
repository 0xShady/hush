import { DEFAULT_SETTINGS } from '../src/shared/defaults';
import { bodyHtml, expect, openFixture, readSettings, setPlatform, test, writeRawSettings } from './harness';

test.describe('youtube', () => {
  const watch = 'https://www.youtube.com/watch?v=abc123';

  test('commentsBeside swaps comments and recommendations, then restores them', async ({ page }) => {
    await openFixture(page, watch, 'youtube-watch');
    const original = await bodyHtml(page);

    await setPlatform(page, 'youtube', { features: ['commentsBeside'] });
    await expect(page.locator('#secondary-inner > #comments')).toBeAttached();
    await expect(page.locator('#primary-inner > #related')).toBeAttached();
    await expect(page.locator('#hush-yt-beside')).toBeAttached();

    await setPlatform(page, 'youtube', { features: [] });
    await expect.poll(() => bodyHtml(page)).toBe(original);
    await expect(page.locator('#hush-yt-beside')).not.toBeAttached();
    await expect(page.locator('#primary-inner > #comments')).toBeAttached();
  });

  test('disableAutoplay turns the player toggle off', async ({ page }) => {
    await openFixture(page, watch, 'youtube-watch');
    await page.locator('.ytp-autonav-toggle-button').evaluate((toggle) => {
      toggle.addEventListener('click', () => toggle.setAttribute('aria-checked', 'false'));
    });

    await setPlatform(page, 'youtube', { features: ['disableAutoplay'] });
    await expect(page.locator('.ytp-autonav-toggle-button')).toHaveAttribute('aria-checked', 'false');
  });

  test('showDislikeCount shows the count and removes it again', async ({ page }) => {
    await openFixture(page, watch, 'youtube-watch');
    const original = await bodyHtml(page);
    await page.context().route('https://returnyoutubedislikeapi.com/**', (route) =>
      route.fulfill({ json: { dislikes: 12345 }, headers: { 'access-control-allow-origin': '*' } }),
    );

    await setPlatform(page, 'youtube', { features: ['showDislikeCount'] });
    await expect(page.locator('.hush-dislike-count')).toHaveText('12K');

    await setPlatform(page, 'youtube', { features: [] });
    await expect.poll(() => bodyHtml(page)).toBe(original);
  });

  test('hideShorts sends /shorts/ pages to the landing page', async ({ page }) => {
    await openFixture(page, 'https://www.youtube.com/', 'youtube-home');
    await setPlatform(page, 'youtube', { landingPage: '/feed/subscriptions', features: ['hideShorts'] });

    await page.goto('https://www.youtube.com/shorts/abc123');
    await expect(page).toHaveURL('https://www.youtube.com/feed/subscriptions');
  });

  test('the landing page replaces the home page', async ({ page }) => {
    await openFixture(page, 'https://www.youtube.com/feed/you', 'youtube-home');
    await setPlatform(page, 'youtube', { landingPage: '/feed/subscriptions' });

    await page.goto('https://www.youtube.com/');
    await expect(page).toHaveURL('https://www.youtube.com/feed/subscriptions');
  });

  test('a site that is off does not redirect', async ({ page }) => {
    await openFixture(page, 'https://www.youtube.com/feed/you', 'youtube-home');
    await setPlatform(page, 'youtube', { enabled: false, landingPage: '/feed/subscriptions' });

    await page.goto('https://www.youtube.com/');
    await readSettings(page);
    await expect(page).toHaveURL('https://www.youtube.com/');
  });
});

test.describe('x', () => {
  const clicksOnFollowing = () => {
    const tab = document.querySelectorAll('[role="tab"]')[1];
    window.name = '0';
    tab.addEventListener('click', () => {
      window.name = String(Number(window.name) + 1);
      tab.setAttribute('aria-selected', 'true');
    });
  };

  test('defaultToFollowing picks the Following tab once per visit', async ({ page }) => {
    await openFixture(page, 'https://x.com/home', 'x-home');
    await page.evaluate(clicksOnFollowing);

    await setPlatform(page, 'twitter', { features: ['defaultToFollowing'] });
    await expect(page.getByRole('tab', { name: 'Following' })).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('tab', { name: 'Following' }).evaluate((tab) => tab.setAttribute('aria-selected', 'false'));
    await page.evaluate(() => document.body.append(document.createElement('div')));
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.name)).toBe('1');
  });

  test('defaultToFollowing sends the root page to /home', async ({ page }) => {
    await openFixture(page, 'https://x.com/explore', 'x-home');
    await setPlatform(page, 'twitter', { features: ['defaultToFollowing'] });

    await page.goto('https://x.com/');
    await expect(page).toHaveURL('https://x.com/home');
  });
});

test.describe('instagram', () => {
  test('hideReels sends /reels pages to the home page', async ({ page }) => {
    await openFixture(page, 'https://www.instagram.com/', 'instagram-home');
    await setPlatform(page, 'instagram', { features: ['hideReels'] });

    await page.goto('https://www.instagram.com/reels/abc123/');
    await expect(page).toHaveURL('https://www.instagram.com/');
  });
});

test.describe('reddit', () => {
  test('disableVideoAutoplay removes autoplay from new videos', async ({ page }) => {
    await openFixture(page, 'https://www.reddit.com/', 'reddit-home');
    await setPlatform(page, 'reddit', { features: ['disableVideoAutoplay'] });

    await page.evaluate(() => {
      const video = document.createElement('video');
      video.autoplay = true;
      const player = document.createElement('shreddit-player');
      player.setAttribute('autoplay', '');
      document.body.append(video, player);
    });
    await expect(page.locator('video')).not.toHaveAttribute('autoplay');
    await expect(page.locator('shreddit-player')).not.toHaveAttribute('autoplay');
  });
});

test.describe('settings', () => {
  test('stored settings merge over the defaults', async ({ page }) => {
    await openFixture(page, 'https://www.youtube.com/', 'youtube-home');

    const settings = await writeRawSettings(page, {
      youtube: { enabled: false, features: { hideShorts: true, removedFeature: true } },
    });

    expect(settings.youtube).toEqual({
      ...DEFAULT_SETTINGS.youtube,
      enabled: false,
      features: { ...DEFAULT_SETTINGS.youtube.features, hideShorts: true },
    });
    expect(settings.reddit).toEqual(DEFAULT_SETTINGS.reddit);
  });
});
