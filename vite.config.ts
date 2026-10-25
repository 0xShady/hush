import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import webExtension from '@samrum/vite-plugin-web-extension';

import chromeManifest from './manifest.chrome.json';
import firefoxManifest from './manifest.firefox.json';

type Target = 'chrome' | 'firefox';

const target = (process.env.TARGET as Target) || 'chrome';
// `npm run dev:chrome`: watch build + background worker that auto-reloads the extension
const devReload = target === 'chrome' && process.env.DEV_RELOAD === '1';
const outDir = `dist/${target}`;

const manifest = target === 'firefox'
  ? firefoxManifest
  : devReload
    ? { ...chromeManifest, background: { service_worker: 'src/dev/reloader.ts' } }
    : chromeManifest;

// Every Chrome build stamps dev-build.json last, so src/dev/reloader.ts reloads the
// installed extension once a build is complete — including the final non-dev build,
// which swaps the reloader back out.
function buildIdStamp(): Plugin {
  return {
    name: 'build-id-stamp',
    apply: 'build',
    closeBundle() {
      writeFileSync(resolve(outDir, 'dev-build.json'), JSON.stringify({ id: Date.now().toString() }));
    },
  };
}

export default defineConfig({
  plugins: [
    webExtension({
      manifest: manifest as Record<string, unknown>,
    }),
    ...(target === 'chrome' ? [buildIdStamp()] : []),
  ],
  build: {
    outDir,
    // Watch mode keeps the folder in place so the loaded extension never sees it empty
    emptyOutDir: !devReload,
  },
});
