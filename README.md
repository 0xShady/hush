# Hush

Browser extension to show/hide UI sections and pages across YouTube, Instagram,
Twitter/X, Reddit, and LinkedIn. All control via a popup with per-platform toggles
and a landing-page dropdown. No AI, no analytics, no backend: pure DOM manipulation
+ `chrome.storage.sync`. Website: https://hush-media.dev

## Install (dev)

```bash
npm install
npm run build          # → dist/chrome + dist/firefox (both Manifest V3)
```

- **Chrome**: `chrome://extensions` → enable Developer mode → Load unpacked → `dist/chrome`
- **Firefox**: `about:debugging` → This Firefox → Load Temporary Add-on → `dist/firefox/manifest.json`

## Scripts

| Script | Action |
|---|---|
| `npm run build` | Build both Chrome + Firefox into `dist/` |
| `npm run build:chrome` / `build:firefox` | Single target |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run package` | Build then zip both via `web-ext` → `web-ext-artifacts/{chrome,firefox}/hush-<browser>-<version>.zip` |
| `npm run lint:firefox` | `web-ext lint` on the Firefox build (what addons.mozilla.org runs) |
| `npm run dev:chrome` | Watch build with an auto-reloading dev worker and a settings bridge for end-to-end tests (dev only) |
| `npm run release` | Create the GitHub Release for the version in `package.json` (from an up-to-date `main`) |

## Building from source (for add-on reviewers)

Requirements: Node.js 22 and npm 10, on macOS or Linux.

```bash
npm ci
npm run build:firefox   # output: dist/firefox (same files as the submitted package)
```

The source archive attached to each release is `git archive` of the tagged commit.

## Permissions and data

- `storage`: remembers the switches (`storage.sync`).
- `activeTab`: lets the popup see which site the current tab is on.
- Content scripts only on youtube.com, instagram.com, twitter.com, x.com, reddit.com and linkedin.com.
- The only outside request is the optional YouTube dislike count: when the user turns it on, the
  video ID is sent to `returnyoutubedislikeapi.com`. It is off by default. Firefox asks for
  "browsing activity" consent (`data_collection_permissions.optional`) before it can be turned on.

## Releasing

Same flow as docktui. A PR bumps the version in `package.json`, `manifest.chrome.json` and
`manifest.firefox.json` (CI rejects a tag that does not match all three). Then, on a clean,
up-to-date `main`, `npm run release` creates GitHub Release `vX.Y.Z` and the `Release` workflow:

1. builds and lints both targets, and attaches the two zips plus the source archive to the release;
2. uploads the Chrome zip and submits it for review (Chrome Web Store API v2), when the repo
   variable `CWS_EXTENSION_ID` is set;
3. submits the Firefox build with its source to addons.mozilla.org (listed channel), when the repo
   variable `AMO_PUBLISH` is `true`.

`npm run release -- rc.1` makes a pre-release: zips attached, nothing sent to the stores.
The very first version of each listing is uploaded by hand from the release assets.

Secrets: `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`, `AMO_JWT_ISSUER`,
`AMO_JWT_SECRET`. Variables: `CWS_PUBLISHER_ID`, `CWS_EXTENSION_ID`, `AMO_PUBLISH`.

## Architecture

| Path | Role |
|---|---|
| `src/shared/types.ts` | `Settings` data model + `PLATFORM_KEYS` |
| `src/shared/defaults.ts` | `DEFAULT_SETTINGS` |
| `src/shared/storage.ts` | Typed `getSettings` / `setSettings` / `setPlatformSettings` / `onSettingsChange` over `storage.sync` (merges stored over defaults) |
| `src/shared/platformConfig.ts` | UI metadata: names, feature labels, landing options |
| `src/shared/selectors/*.selectors.ts` | **All CSS selectors live here**, one file per platform |
| `src/content/runtime.ts` | Shared plumbing: CSS injection, MutationObserver, redirect, `onSettingsChange` wiring |
| `src/content/<platform>.ts` | Per-platform feature logic (`buildCss` / `applyDom` / `redirect`) |
| `src/popup/` | Vanilla-TS popup: tabs, master toggle, landing dropdown, feature toggles |

### How a content script works

`runContentScript({ platform, buildCss, applyDom?, redirect? })`:

1. **redirect**: runs on URL change; returns a path to navigate to, or `null`.
2. **buildCss**: returns a CSS string (via `hideRule(selector, on)`) injected into one
   `<style>` tag. CSS auto-applies to future DOM nodes, so most hiding needs no observer.
3. **applyDom**: imperative per-pass work (move comments, pause autoplay, click a tab)
   re-run on every mutation.

Disabling a platform clears its injected CSS. Toggling in the popup fires
`storage.onChanged` → all tabs re-apply **without reload** (live sync, step 9).

## Selector maintenance

When a platform ships a DOM change and a feature stops working:

1. Open the matching file in `src/shared/selectors/`.
2. Inspect the live page, find the new stable handle (prefer `href`, `role`,
   `data-testid`, `aria-label`, or web-component tag over rotating class names).
3. Update only the selector string. Logic in `src/content/` should not need edits.
4. `npm run build` and reload the extension.

Text-based markers (e.g. "Sponsored", "People you may know") live as exported arrays
at the bottom of the relevant selector file; add localized strings there.

## Icons

- Vector source: `src/assets/icons/icon.svg` (feed rows; top rows dissolving = hidden, one row highlighted blue).
- Shipped PNGs live in `public/icons/` (`icon-16/32/48/128.png`). Vite copies `public/` verbatim to the build root, and the manifests reference `icons/icon-*.png`.
- Regenerate after editing the SVG:

  ```bash
  cd src/assets/icons
  for s in 16 32 48 128; do magick -background none icon.svg -resize ${s}x${s} ../../../public/icons/icon-$s.png; done
  ```

## Notes

- Twitter script is declared for both `twitter.com` and `x.com` in both manifests.
