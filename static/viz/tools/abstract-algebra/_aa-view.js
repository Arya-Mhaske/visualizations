// Drawing and layout helpers shared by the abstract-algebra tools.
//   host(el, className)                      a div appended to el
//   figure(el, c, draw, label, square)       a canvas stage inside a .viz-figure; draw(ctx, stage, c). Returns the stage.
//   textBox(el)                              a callout whose text you set with box.set(lines)
//   ngonPoints(cx, cy, R, n, rot)            corners of a regular n-gon, corner 0 at angle rot (radians, y down)
//   triPicture(ctx, c, cx, cy, R, arrangement, opts)  the labelled triangle of D3
//   spec(c, i)                               a colour for class number i (spectrum, then the site colours)
import { createStage } from '../../lib/stage.js';
import { dot, label, line, poly, TAU } from '../../lib/draw.js';

export function host(el, className = '') {
  const node = document.createElement('div');
  if (className) node.className = className;
  el.appendChild(node);
  return node;
}

export function figure(el, c, draw, labelText, square = true) {
  const box = host(el, square ? 'viz-figure viz-figure--square' : 'viz-figure');
  return createStage(box, (ctx, size, stage) => draw(ctx, stage, c), { label: labelText });
}

export function textBox(el, className = 'nb-callout') {
  const node = host(el, className);
  node.setAttribute('aria-live', 'polite');
  return { node, set(lines) { node.replaceChildren(...[].concat(lines).map((t) => { const p = document.createElement('div'); p.textContent = t; return p; })); } };
}

export const ngonPoints = (cx, cy, R, n, rot = -Math.PI / 2) => [...Array(n).keys()].map((k) => [cx + R * Math.cos(rot + (TAU * k) / n), cy + R * Math.sin(rot + (TAU * k) / n)]);

export const spec = (c, i) => [c.a, c.b, c.c, c.d, c.spec[3], c.spec[1], c.spec[5], c.spec[6]][i % 8];
export const specFill = (c, i) => [c.fillA, c.fillB, c.fillC, c.fillY, c.spec[3], c.spec[1], c.spec[5], c.spec[6]][i % 8];

// arrangement[pos] = label sitting at position pos (0 top, 1 bottom-left, 2 bottom-right).
export function triPicture(ctx, c, cx, cy, R, arrangement, { fills = null, title = null } = {}) {
  const pts = [[cx, cy - R], [cx - R * 0.87, cy + R * 0.5], [cx + R * 0.87, cy + R * 0.5]];
  poly(ctx, pts, { fill: c.paper, stroke: c.ink });
  line(ctx, cx, cy - R, cx, cy + R * 0.5, { color: c.grid, width: 1, dash: [3, 4] });
  arrangement.forEach((lab, pos) => {
    const [x, y] = pts[pos];
    dot(ctx, x, y, 13, fills ? fills[lab] : [c.fillA, c.fillB, c.fillC][lab], c.ink);
    label(ctx, String(lab + 1), x, y, c, { size: 13, patch: false });
  });
  if (title) label(ctx, title, cx, cy + R * 0.95, c, { size: 12 });
}
