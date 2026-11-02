import { infoTip } from './infoTip';

export type ToggleRowOpts = {
  label: string;
  info?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function toggleRow(opts: ToggleRowOpts): HTMLElement {
  const row = document.createElement('label');
  row.className = 'toggle-row';
  if (opts.disabled) row.classList.add('is-disabled');

  const text = document.createElement('span');
  text.className = 'toggle-label';
  text.textContent = opts.label;
  if (opts.info) text.append(infoTip(opts.info));

  const sw = document.createElement('span');
  sw.className = 'switch';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = opts.checked;
  input.disabled = !!opts.disabled;
  input.addEventListener('change', () => opts.onChange(input.checked));

  const knob = document.createElement('span');
  knob.className = 'knob';

  sw.append(input, knob);
  row.append(text, sw);
  return row;
}
