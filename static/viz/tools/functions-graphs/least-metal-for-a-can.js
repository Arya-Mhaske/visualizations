import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { V: 330, r: 3 };
const S = (s, r) => 2 * Math.PI * r * r + (2 * s.V) / r;
const best = (s) => (s.V / (2 * Math.PI)) ** (1 / 3);
const lower = (stage) => ({ x: 0, y: stage.h * 0.42, w: stage.w, h: stage.h * 0.58 });

createTool({
  state,
  label: 'Top: a can drawn to scale for a fixed volume. Bottom: the surface area, the amount of metal, against the radius. A thin tall can needs a lot of metal for its sides, and a wide flat can needs a lot for its top and bottom, so the metal is least at one radius in between, shown with a green marker. At that radius the height of the can equals its diameter.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 600], c, box: lower, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const h = state.V / (Math.PI * state.r ** 2);
    const k = Math.min((stage.w * 0.4) / (2 * state.r), (stage.h * 0.3) / h, 6);
    const [cx, y0] = [stage.w / 2, stage.h * 0.05];
    poly(ctx, [[cx - state.r * k, y0], [cx + state.r * k, y0], [cx + state.r * k, y0 + h * k], [cx - state.r * k, y0 + h * k]], { fill: c.fillB, stroke: c.ink, width: 3 });
    label(ctx, `r = ${fixed(state.r, 1)}, h = ${fixed(h, 1)}`, cx, y0 + (h * k) / 2, c, { size: 11, bounds: stage, patch: false });
    plot.setRange([0, Math.min(12, best(state) * 3)], [0, S(state, best(state)) * 2]);
    plot.axes({ xLabel: 'radius (cm)', yLabel: 'metal (cm²)' });
    plot.fn((r) => S(state, r), { color: c.a, width: 4, domain: [0.4, 12] });
    plot.point(state.r, S(state, state.r), { fill: c.fillY, r: 9 });
    plot.point(best(state), S(state, best(state)), { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Design the can' },
    { key: 'r', label: 'Radius', min: 1, max: 9, step: 0.25, format: (v) => `${v} cm` },
    { key: 'V', label: 'Volume', min: 200, max: 1000, step: 50, format: (v) => `${v} mL` },
    { readout: [
      ['Height', (s) => `${fixed(s.V / (Math.PI * s.r ** 2), 2)} cm`],
      ['Metal used', (s) => `${fixed(S(s, s.r), 1)} cm²`],
      ['Least metal at r =', (s) => ({ text: `${fixed(best(s), 2)} cm, where h = 2r = ${fixed(2 * best(s), 2)} cm`, good: Math.abs(s.r - best(s)) < 0.3 })],
    ] },
  ],
  tex: (s) => `S(r)=2\\pi r^2+\\dfrac{2V}{r}=${fixed(S(s, s.r), 1)},\\quad r_{\\min}=\\sqrt[3]{\\dfrac{V}{2\\pi}}`,
});
