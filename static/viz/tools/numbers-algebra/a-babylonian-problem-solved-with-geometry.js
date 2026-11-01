import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { babylonian } from './_quadratic-equations-math.js';

const state = { step: 0, p: 4, q: 45 };
const LINES = [
  'A rectangle with area q; long side minus short side is p',
  'Cut a strip of width p/2 off the long side',
  'Move the strip to the top of the rectangle',
  'Fill the corner (p/2)²: a perfect square of side m',
  'Read it off: m² = q + (p/2)², so L = m + p/2',
];
const t = (s = state) => babylonian(s.p, s.q);

createTool({
  state,
  label: 'A rectangle of area q whose long side is p longer than its short side. A strip is cut off one end and moved to the top, which turns the rectangle into a square with one small corner missing. Filling the corner gives a perfect square whose side m is the average of the two sides.',
  draw(ctx, stage, c) {
    const T = t();
    const k = Math.min((stage.w * 0.86) / T.L, (stage.h * 0.7) / (T.m + state.p / 2));
    const [x0, y0] = [(stage.w - T.L * k) / 2, 28];
    const rect = (u, v, w, h, fill, dash = false) => poly(ctx, [[x0 + u * k, y0 + v * k], [x0 + (u + w) * k, y0 + v * k], [x0 + (u + w) * k, y0 + (v + h) * k], [x0 + u * k, y0 + (v + h) * k]], { fill, stroke: c.ink, width: 3, dash: dash ? [6, 5] : [] });
    const say = (text, u, v, color = c.ink) => label(ctx, text, x0 + u * k, y0 + v * k, c, { size: 11, color, bounds: stage, patch: false });
    const half = state.p / 2;
    if (state.step === 0) {
      rect(0, 0, T.L, T.W, c.fillA);
      say(`area q = ${state.q}`, T.L / 2, T.W / 2);
      say(`L = ${fixed(T.L, 2)}`, T.L / 2, T.W + 0.5);
      say(`W = ${fixed(T.W, 2)}`, -0.3, T.W / 2);
    } else {
      rect(0, 0, T.m, T.W, c.fillA);
      if (state.step === 1) {
        rect(T.m, 0, half, T.W, c.fillB);
        say('strip', T.m + half / 2, T.W / 2);
      } else {
        rect(0, T.W, T.W, half, c.fillB);
        say('strip', T.W / 2, T.W + half / 2);
      }
    }
    if (state.step >= 3) {
      rect(T.W, T.W, half, half, c.fillY);
      rect(0, 0, T.m, T.m, null);
      say(`corner ${fixed(T.corner, 2)}`, T.W + half / 2, T.W + half + 0.5);
      say(`m = ${fixed(T.m, 2)}`, T.m / 2, -0.4);
    }
    label(ctx, LINES[state.step], stage.w / 2, 12, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Cut and move' },
    { key: 'step', label: 'Move', min: 0, max: 4, step: 1, format: (n) => `${n + 1} of 5` },
    { key: 'p', label: 'Long side minus short side, p', min: 1, max: 10, step: 1 },
    { key: 'q', label: 'Area, q', min: 1, max: 200, step: 1 },
    { readout: [
      ['Square side, m', (s) => fixed(t(s).m, 3)],
      ['Long side, L', (s) => fixed(t(s).L, 3)],
      ['Short side, W', (s) => fixed(t(s).W, 3)],
      ['Check, L × W', (s) => fixed(t(s).L * t(s).W, 3)],
    ] },
  ],
  tex: (s) => `m=\\sqrt{q+\\left(\\dfrac p2\\right)^2}=\\sqrt{${s.q}+${fixed((s.p / 2) ** 2, 2)}}=${fixed(t(s).m, 3)},\\quad L=m+\\dfrac p2=${fixed(t(s).L, 3)}`,
});
