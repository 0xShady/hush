const SVG_NS = 'http://www.w3.org/2000/svg';

export function infoTip(text: string): HTMLElement {
  const wrap = document.createElement('span');
  wrap.className = 'info';
  wrap.tabIndex = 0;
  wrap.setAttribute('aria-label', text);

  const tip = document.createElement('span');
  tip.className = 'info-tip';
  tip.setAttribute('role', 'tooltip');
  tip.textContent = text;

  wrap.append(infoIcon(), tip);
  // Inside a <label>, a click on the icon would otherwise flip the switch.
  wrap.addEventListener('click', (e) => e.preventDefault());
  return wrap;
}

function infoIcon(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');

  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', '8');
  circle.setAttribute('cy', '8');
  circle.setAttribute('r', '6.5');

  const mark = document.createElementNS(SVG_NS, 'path');
  mark.setAttribute('d', 'M8 7.25v4M8 4.75v.01');

  svg.append(circle, mark);
  return svg;
}
