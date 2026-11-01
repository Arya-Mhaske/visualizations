import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { curve, trace } from './_conics-view.js';

// A dish opening upward: x² = 4 f y, width D, depth d, so f = D² / (16 d)
const state = { D: 4, d: 1, r: 1.6, mode: 'dish' };
const focus = (s = state) => (s.D * s.D) / (16 * s.d);
const rayXs = (s) => Array.from({ length: 9 }, (_, i) => (-0.45 + (0.9 * i) / 8) * s.D).filter((x) => Math.abs(x) > 0.01);
const dishY = (s, x) => (x * x) / (4 * focus(s));
// A ray hits the receiver if it passes within 0.12 m of it
const caught = (s) => rayXs(s).filter((x) => {
  // the reflected ray runs from the hit point to the focus; how far does it pass from the receiver?
  const hy = dishY(s, x);
  const d = [-x, focus(s) - hy];
  const m = Math.hypot(d[0], d[1]);
  return Math.abs((0 - x) * (d[1] / m) - (s.r - hy) * (d[0] / m)) < 0.12;
}).length;

createTool({
  state,
  label: 'A satellite dish seen from the side, opening upward, with parallel signals falling from above. Each signal reflects off the dish towards the focus. A receiver you place on the axis collects the rays that pass close to it. In headlight mode the idea is reversed: a lamp at the focus sends parallel light out.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-1, 5], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    const f = focus();
    curve(plot, trace((x) => [x, dishY(state, x)], -state.D / 2, state.D / 2, 120), { color: c.ink, width: 5 });
    rayXs(state).forEach((x) => {
      const hy = dishY(state, x);
      if (state.mode === 'dish') {
        plot.segment(x, 4.8, x, hy, { color: c.b, width: 2 });
        plot.segment(x, hy, 0, f, { color: c.a, width: 2 });
      } else {
        plot.segment(0, state.r, x, hy, { color: c.a, width: 2 });
        plot.segment(x, hy, x, 4.8, { color: c.b, width: 2 });
      }
    });
    plot.point(0, f, { fill: c.c, r: 6 });
    plot.text(`focus ${fixed(f, 2)} m`, 0.35, f + 0.2, { size: 11, align: 'left', patch: false });
    plot.point(0, state.r, { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Design the dish' },
    { key: 'mode', label: 'Use it as', options: [['dish', 'Satellite dish'], ['lamp', 'Headlight']] },
    { key: 'D', label: 'Width of the dish, D', min: 2, max: 5, step: 0.5, format: (n) => `${n} m` },
    { key: 'd', label: 'Depth of the dish, d', min: 0.4, max: 2, step: 0.1, format: (n) => `${n.toFixed(1)} m` },
    { key: 'r', label: 'Receiver (or lamp) height', min: 0, max: 4, step: 0.05, format: (n) => `${n.toFixed(2)} m` },
    { readout: [
      ['Focus above the vertex', (s) => `${fixed(focus(s), 2)} m`],
      ['Rays caught', (s) => ({ text: `${caught(s)} of ${rayXs(s).length}`, good: caught(s) === rayXs(s).length })],
    ] },
  ],
  tex: (s) => `x^2=4fy,\\ \\left(\\dfrac D2\\right)^2=4fd\\ \\Rightarrow\\ f=\\dfrac{D^2}{16d}=\\dfrac{${s.D}^2}{16(${fixed(s.d, 1)})}=${fixed(focus(s), 2)}\\text{ m}`,
});
