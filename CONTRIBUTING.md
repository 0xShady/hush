# Contributing to Hush

Thanks for helping out. The sites Hush works on change their pages often, so the most useful
contribution is usually a small selector fix.

## Getting set up

You need Node.js 22 and npm 10.

```bash
git clone https://github.com/0xShady/hush.git
cd hush
npm ci
npm run dev:chrome
```

Load `dist/chrome` unpacked from `chrome://extensions` with Developer mode on. The dev build reloads
the extension and open site tabs when you save. For Firefox, run `npm run build:firefox` and load
`dist/firefox/manifest.json` from `about:debugging`.

The README explains how the code is laid out and how a content script works.

## Fixing a switch that stopped working

1. Open the matching file in `src/shared/selectors/`. Every selector and text marker lives there.
2. Find a stable handle on the live page. Prefer `data-testid`, `role`, `href`, `aria-label` and custom
   tag names over class names, which rotate.
3. Match labels exactly, never as a substring of post text, so a post that mentions "Sponsored" stays
   visible.
4. Check the switch both ways: on hides the element, off brings it back without a reload.

## Rules for code changes

- Every DOM change must undo itself when its switch is off. Turning a site off runs `applyDom` once
  with every feature off.
- Hush has no account, no analytics and no server. Please open an issue before proposing a new network
  request or a new permission.
- A new switch needs its key in `src/shared/defaults.ts` and its label in
  `src/shared/platformConfig.ts`.
- Write comments only for what the code cannot say, such as why a site needs a workaround.
- If your change alters what Hush hides, stores or asks permission for, say so in the PR. The website
  and privacy policy describe those and have to change with it.

## Before you open a pull request

```bash
npm run lint
npm run typecheck
npm run build
npm run lint:firefox
```

Keep one change per pull request, and say which site, switch and browser you tested. When you add a
screenshot, use your own test account or crop it, so nobody's feed or name ends up in the repo.

## Reporting a security issue

Please follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
