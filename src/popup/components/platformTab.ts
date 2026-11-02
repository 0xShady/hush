import type { PlatformKey, PlatformSettings } from '../../shared/types';
import { ENABLE_INFO, LANDING_INFO, PLATFORM_CONFIG } from '../../shared/platformConfig';
import { infoTip } from './infoTip';
import { toggleRow } from './toggleRow';

export type PlatformTabOpts = {
  platform: PlatformKey;
  settings: PlatformSettings;
  onPatch: (patch: Partial<PlatformSettings>) => void;
};

export function platformTab(opts: PlatformTabOpts): HTMLElement {
  const { platform, settings, onPatch } = opts;
  const config = PLATFORM_CONFIG[platform];

  const panel = document.createElement('section');
  panel.className = 'platform-panel';

  const siteGroup = document.createElement('div');
  siteGroup.className = 'group';
  panel.append(siteGroup);

  siteGroup.append(
    toggleRow({
      label: `Enable ${config.name}`,
      info: ENABLE_INFO,
      checked: settings.enabled,
      onChange: (enabled) => onPatch({ enabled }),
    }),
  );

  const landingWrap = document.createElement('div');
  landingWrap.className = 'landing-row';
  if (!settings.enabled) landingWrap.classList.add('is-disabled');

  const landingLabel = document.createElement('span');
  landingLabel.className = 'landing-label';
  landingLabel.textContent = 'Landing page';
  landingLabel.append(infoTip(LANDING_INFO));

  const select = document.createElement('select');
  select.className = 'landing-select';
  select.disabled = !settings.enabled;
  for (const opt of config.landingOptions) {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    if (opt.value === settings.landingPage) o.selected = true;
    select.append(o);
  }
  select.addEventListener('change', () => onPatch({ landingPage: select.value }));

  landingWrap.append(landingLabel, select);
  siteGroup.append(landingWrap);

  // Feature toggles are greyed out while the master toggle is off.
  const list = document.createElement('div');
  list.className = 'group feature-list';
  for (const feat of config.features) {
    list.append(
      toggleRow({
        label: feat.label,
        info: feat.info,
        checked: !!settings.features[feat.key],
        disabled: !settings.enabled,
        onChange: (val) =>
          onPatch({ features: { ...settings.features, [feat.key]: val } }),
      }),
    );
  }
  panel.append(list);

  return panel;
}
