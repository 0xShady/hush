# Hush

Browser extension to show/hide UI sections and pages across YouTube, Instagram,
Twitter/X, Reddit, and LinkedIn. All control via a popup with per-platform toggles
and a landing-page dropdown. No AI, no analytics, no backend — pure DOM manipulation
+ `chrome.storage.sync`.

## Install (dev)

```bash
npm install
npm run build          # → dist/chrome (MV3) + dist/firefox (MV2)
```

- **Chrome**: `chrome://extensions` → enable Developer mode → Load unpacked → `dist/chrome`
- **Firefox**: `about:debugging` → This Firefox → Load Temporary Add-on → `dist/firefox/manifest.json`

## Scripts

| Script | Action |
|---|---|
| `npm run build` | Build both Chrome + Firefox into `dist/` |
| `npm run build:chrome` / `build:firefox` | Single target |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run package` | Build then zip both via `web-ext` → `web-ext-artifacts/` |

## Architecture

| Path | Role |
|---|---|
| `src/shared/types.ts` | `Settings` data model + `PLATFORM_KEYS` |
| `src/shared/defaults.ts` | `DEFAULT_SETTINGS` |
| `src/shared/storage.ts` | Typed `getSettings` / `setSettings` / `setPlatformSettings` / `onSettingsChange` over `storage.sync` (merges stored over defaults) |
| `src/shared/platformConfig.ts` | UI metadata: names, feature labels, landing options |
| `src/shared/selectors/*.selectors.ts` | **All CSS selectors live here** — one file per platform |
| `src/content/runtime.ts` | Shared plumbing: CSS injection, MutationObserver, redirect, `onSettingsChange` wiring |
| `src/content/<platform>.ts` | Per-platform feature logic (`buildCss` / `applyDom` / `redirect`) |
| `src/popup/` | Vanilla-TS popup: tabs, master toggle, landing dropdown, feature toggles |

### How a content script works

`runContentScript({ platform, buildCss, applyDom?, redirect? })`:

1. **redirect** — runs on URL change; returns a path to navigate to, or `null`.
2. **buildCss** — returns a CSS string (via `hideRule(selector, on)`) injected into one
   `<style>` tag. CSS auto-applies to future DOM nodes, so most hiding needs no observer.
3. **applyDom** — imperative per-pass work (move comments, pause autoplay, click a tab)
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
at the bottom of the relevant selector file — add localized strings there.

## Icons

- Vector source: `src/assets/icons/icon.svg` (feed rows; top rows dissolving = hidden, one row highlighted blue).
- Shipped PNGs live in `public/icons/` (`icon-16/32/48/128.png`) — Vite copies `public/` verbatim to the build root, and the manifests reference `icons/icon-*.png`.
- Regenerate after editing the SVG:

  ```bash
  cd src/assets/icons
  for s in 16 32 48 128; do magick -background none icon.svg -resize ${s}x${s} ../../../public/icons/icon-$s.png; done
  ```

## Notes

- Twitter script is declared for both `twitter.com` and `x.com` in both manifests.
