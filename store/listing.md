# Store listing

One source for the Chrome Web Store and Firefox Add-ons (AMO) forms. Limits in brackets. Keep every
claim true for the shipped build, and in step with the website's privacy policy.

## Name [CWS 75, AMO 50]

Hush: quiet your social feeds

## Summary [CWS 132, AMO 250]

Hide Shorts, Reels, ads, suggestions and other noise on YouTube, X, Reddit, LinkedIn and Instagram. No account, no tracking.

## Description

Hush lets you switch off the parts of social sites you never asked for. Open the popup, pick a site,
flip a switch: that part of the page disappears right away, without a reload. Turn the switch off and
it comes back.

YouTube
- Shorts, the home feed, sidebar recommendations and the end screen
- Autoplay, Games (Playables) and the Subscriptions list in the menu
- Comments beside the video, and an optional dislike count

X
- Promoted posts, Trending, Who to follow and Grok
- Open on your Following feed instead of For you

Reddit
- Promoted posts, awards, Premium upsells, video autoplay and Games

LinkedIn
- Promoted posts, People you may know, Today's puzzles and Premium upsells

Instagram
- Reels, Stories, suggested posts and accounts, and ads

You can also choose the page each site opens on, and turn Hush off for a whole site.

Private by design
- No account, no analytics, no ads, no server.
- Your switches are saved in your browser's extension storage.
- Hush sends nothing anywhere. The one exception is the optional YouTube dislike count, which is off
  by default: when you turn it on, the ID of the video you watch is sent to Return YouTube Dislike,
  an independent service.

Good to know: these sites change their pages often, so a switch can stop working until Hush is
updated. Known limits are listed at https://hush-media.dev/docs.

Hush is an independent project, not affiliated with YouTube, X, Reddit, LinkedIn or Instagram.

## Category

- CWS: Productivity → Workflow & planning (alternative: Social & communication)
- AMO: Social & communication, Privacy & security

## Links

- Website / homepage: https://hush-media.dev
- Support: https://hush-media.dev/docs and [CONTACT_EMAIL]
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
- Screenshots: 1280x800 PNG, 1 to 5 (CWS needs at least one). Plan: the popup over a quiet YouTube
  home page, YouTube watch page with comments beside, Instagram feed without Reels, X with Following,
  the popup in dark mode.
- CWS small promo tile 440x280 (optional, shown in lists): logo and "Quiet your social feeds".
