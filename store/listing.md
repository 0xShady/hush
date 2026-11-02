# Store listing

One source for the Chrome Web Store and Firefox Add-ons (AMO) forms. Limits in brackets. Keep every
claim true for the shipped build, and in step with the website's privacy policy.

## Name [CWS 75, AMO 50]

Hush: quiet your social feeds

## Summary [CWS 132, AMO 250]

Hide Shorts, Reels, ads, suggestions and other noise on YouTube, X, Reddit, LinkedIn and Instagram. No account, no tracking.

## Description

Paste `store/description.txt` (one line per paragraph: the stores keep every line break).

## Category

- CWS: Productivity → Workflow & planning (alternative: Social & communication)
- AMO: Social & communication, Privacy & security

## Links

- Website / homepage: https://hush-media.dev
- Support: https://hush-media.dev/docs and contact@hush-media.dev
- Privacy policy: https://hush-media.dev/privacy

## Chrome Web Store: Privacy practices tab

Single purpose:
> Hush hides distracting parts of YouTube, X, Reddit, LinkedIn and Instagram (such as Shorts, Reels,
> ads and suggestions) according to switches the user sets in its popup.

Permission justifications:
- `storage`: saves the user's switch settings (which parts of each site to hide, the landing page per site).
- `activeTab`: when the user opens the popup, reads the active tab's address to select the matching site's tab in the popup.
- Host access (content scripts on youtube.com, x.com, twitter.com, reddit.com, linkedin.com, instagram.com): hides the page elements the user switched off on those five sites. Hush runs on no other site.

Remote code: No. All code ships in the package.

Data usage (check none of the data types). The optional dislike count sends a YouTube video ID, which
is not personal data in the form's categories; it is disclosed in the description and privacy policy.
Certify:
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

## AMO: submission notes

- Source code: upload `hush-source-<version>.zip` (the release workflow builds it with `git archive`).
- Notes for reviewers:
  > Built with Vite. To reproduce: Node 22, `npm ci && npm run build`, output in `dist/firefox`.
  > The only network request is the optional YouTube dislike count (returnyoutubedislikeapi.com),
  > off by default and gated by the browsingActivity data-collection consent.
- Data collection: none required; optional `browsingActivity` (the dislike count).

## Images

- Icon: 128x128 (`public/icons/icon-128.png`, 96px art on 16px padding).
- Screenshots: `store/screenshots/hush-screenshot-1..4.png` (1280x800, RGB): before/after on the site's
  made-up demo page, the YouTube switches, three popups (light and dark), privacy. No real posts from any
  site. Source: `screenshots/src/shots.html` (popups rendered from the production build with the browser
  APIs mocked, demo captured from hush-media.dev); serve the folder and capture each section at 1280x800.
- Promo tiles: `screenshots/hush-promo-small-440x280.png` (shown in search and category lists) and `screenshots/hush-promo-marquee-1400x560.png` (used if the store features Hush). Same source page.
