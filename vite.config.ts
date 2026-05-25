import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import webExtension from '@samrum/vite-plugin-web-extension';

import chromeManifest from './manifest.chrome.json';
import firefoxManifest from './manifest.firefox.json';

type Target = 'chrome' | 'firefox';

const target = (process.env.TARGET as Target) || 'chrome';
const devReload = target === 'chrome' && process.env.DEV_RELOAD === '1';
const outDir = `dist/${target}`;

const manifest = target === 'firefox'
  ? firefoxManifest
  : devReload
    ? {
        ...chromeManifest,
        permissions: [...chromeManifest.permissions, 'tabs'],
        background: { service_worker: 'src/dev/reloader.ts' },
      }
    : chromeManifest;

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
  define: {
    __HUSH_DEV__: JSON.stringify(devReload),
  },
  plugins: [
    webExtension({
      manifest: manifest as Record<string, unknown>,
    }),
    ...(target === 'chrome' ? [buildIdStamp()] : []),
  ],
  build: {
    outDir,
    emptyOutDir: !devReload,
  },
});
