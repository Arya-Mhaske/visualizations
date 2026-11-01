import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { ellipseHalfHeight, ellipsePoint } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

// Half-ellipse arch: semi-span a, rise b. A boat of width w and height hb is centred x from the middle.
const state = { a: 12, b: 7, w: 6, hb: 4, x: 0 };
const clearance = (s, x) => ellipseHalfHeight(s.a, s.b, x);
// the boat is limited by the lower of the arch heights at its two top corners
const roof = (s) => Math.min(clearance(s, s.x - s.w / 2), clearance(s, s.x + s.w / 2));
const fits = (s) => roof(s) >= s.hb;

createTool({
  state,
  label: 'A bridge arch shaped like the top half of an ellipse, with a boat passing underneath. The arch is highest in the middle and lower towards the banks. The boat fits if the arch above its two top corners is at least as high as the boat. The boat is green if it fits and coral if it does not.',
  setup: (stage, c) => createPlot(stage, { x: [-15, 15], y: [-2, 10], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x (m)', yLabel: '' });
    curve(plot, trace((t) => ellipsePoint(state.a, state.b, t), 0, Math.PI, 160), { color: c.ink, width: 5 });
    const ok = fits(state);
    const [l, r] = [state.x - state.w / 2, state.x + state.w / 2];
    [[l, 0], [r, 0], [r, state.hb], [l, state.hb], [l, 0]].reduce((p, q) => { if (p) plot.segment(p[0], p[1], q[0], q[1], { color: ok ? c.c : c.a, width: 5 }); return q; }, null);
    [l, r].forEach((x) => plot.segment(x, state.hb, x, clearance(state, x), { color: c.grid, width: 2, dash: [4, 4] }));
    plot.segment(state.x, 0, state.x, clearance(state, state.x), { color: c.b, width: 2, dash: [4, 4] });
    plot.text(ok ? 'fits' : 'too tall here', state.x, state.hb + 0.8, { size: 12, color: ok ? c.c : c.a, patch: false });
  },
  controls: [
    { title: 'Steer the boat' },
    { key: 'x', label: 'Boat centre, x from the middle', min: -11, max: 11, step: 0.5, format: (n) => `${n} m` },
    { key: 'hb', label: 'Boat height', min: 1, max: 7, step: 0.5, format: (n) => `${n} m` },
    { key: 'w', label: 'Boat width', min: 2, max: 10, step: 1, format: (n) => `${n} m` },
    { key: 'a', label: 'Semi-span, a', min: 8, max: 14, step: 1, format: (n) => `${n} m` },
    { key: 'b', label: 'Rise, b', min: 4, max: 9, step: 1, format: (n) => `${n} m` },
    { readout: [
      ['Arch height at the middle', (s) => `${fixed(clearance(s, s.x), 2)} m`],
      ['Clearance at the boat\'s corners', (s) => `${fixed(roof(s), 2)} m`],
      ['Boat fits?', (s) => ({ text: fits(s) ? 'yes' : 'no', good: fits(s) })],
    ] },
  ],
  tex: (s) => `y=b\\sqrt{1-\\dfrac{x^2}{a^2}}=${s.b}\\sqrt{1-\\dfrac{${fixed(Math.max(Math.abs(s.x - s.w / 2), Math.abs(s.x + s.w / 2)), 1)}^2}{${s.a}^2}}=${fixed(roof(s), 2)}\\text{ m at the nearer-to-bank corner}`,
});
