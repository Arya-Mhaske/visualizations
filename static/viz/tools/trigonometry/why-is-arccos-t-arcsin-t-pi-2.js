import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { deg, fixed } from '../../lib/format.js';
import { rad } from './_identities-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { t: 0.6 };
const toDeg = (r) => (r * 180) / Math.PI;
const angles = (s = state) => ({ s: toDeg(Math.asin(s.t)), c: toDeg(Math.acos(s.t)) });

createTool({
  state,
  label: 'The unit circle. A horizontal line at height t meets the circle at the angle whose sine is t. A vertical line at x equals t meets it at the angle whose cosine is t. The two points are mirror images in the 45 degree line, so the two angles always add to 90 degrees. For t between 0 and 1 they are the two acute angles of one right triangle.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.4);
    drawFrame(ctx, f, c, { ticks: false });
    const O = f.px([0, 0]);
    const { s, c: cc } = angles();
    const P1 = f.px([Math.cos(rad(s)), state.t]);
    const P2 = f.px([state.t, Math.sin(rad(cc))]);
    const e = f.k * 1.3;
    line(ctx, O[0] - e, O[1] + e, O[0] + e, O[1] - e, { color: c.grid, width: 2, dash: [6, 5] });
    line(ctx, ...f.px([0, state.t]), ...P1, { color: c.b, width: 3, dash: [4, 4] });
    line(ctx, ...f.px([state.t, 0]), ...P2, { color: c.a, width: 3, dash: [4, 4] });
    line(ctx, ...O, ...P1, { color: c.b, width: 4 });
    line(ctx, ...O, ...P2, { color: c.a, width: 4 });
    arc(ctx, ...O, 30, -rad(s), 0, { color: c.b, width: 4 });
    arc(ctx, ...O, 44, -rad(cc), 0, { color: c.a, width: 4 });
    dot(ctx, ...P1, 7, c.b, c.ink);
    dot(ctx, ...P2, 7, c.a, c.ink);
    label(ctx, 'arcsin t', O[0] + 60, O[1] - 6, c, { size: 10, color: c.b, bounds: stage, patch: false });
    label(ctx, 'arccos t', P2[0] + (P2[0] >= O[0] ? 8 : -8), P2[1] - 14, c, { size: 10, color: c.a, bounds: stage, patch: false, align: P2[0] >= O[0] ? 'left' : 'right' });
    label(ctx, 'mirror line', O[0] + e * 0.72, O[1] - e * 0.72 - 10, c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Choose t' },
    { key: 't', label: 't', min: -1, max: 1, step: 0.01 },
    { readout: [
      ['arcsin t', (s) => deg(angles(s).s, 1)],
      ['arccos t', (s) => deg(angles(s).c, 1)],
      ['Sum', (s) => ({ text: deg(angles(s).s + angles(s).c, 1), good: true })],
    ] },
  ],
  tex: (s) => `\\arcsin t+\\arccos t=${fixed(angles(s).s, 1)}^\\circ+${fixed(angles(s).c, 1)}^\\circ=90^\\circ=\\dfrac{\\pi}{2}`,
});
