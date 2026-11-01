import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { L: 40, w: 6 };
const lower = (stage) => ({ x: 0, y: stage.h * 0.46, w: stage.w, h: stage.h * 0.54 });
const area = (s, w) => w * (s.L / 2 - w);

createTool({
  state,
  label: 'Top: a rectangular field made with a fixed length of fence. As the width changes, the length changes to use all the fence, and the shape goes from long and thin to short and fat. Bottom: the area against the width, which is a parabola. Its peak is where the width is a quarter of the fence, which makes the field a square.',
  setup: (stage, c) => createPlot(stage, { x: [0, 25], y: [0, 120], c, box: lower, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const half = state.L / 2;
    const k = Math.min((stage.w * 0.8) / half, (stage.h * 0.36) / half);
    const [x0, y0] = [(stage.w - (half - state.w) * k) / 2, stage.h * 0.05];
    const len = half - state.w;
    poly(ctx, [[x0, y0], [x0 + len * k, y0], [x0 + len * k, y0 + state.w * k], [x0, y0 + state.w * k]], { fill: Math.abs(len - state.w) < 1e-9 ? c.fillC : c.fillB, stroke: c.ink, width: 3 });
    label(ctx, `${fixed(len, 1)} × ${state.w}`, x0 + (len * k) / 2, y0 + (state.w * k) / 2, c, { size: 12, bounds: stage, patch: false });
    plot.setRange([0, state.L / 2], [0, (state.L / 4) ** 2 * 1.15]);
    plot.axes({ xLabel: 'width', yLabel: 'area' });
    plot.fn((w) => area(state, w), { color: c.a, width: 4 });
    plot.point(state.w, area(state, state.w), { fill: c.fillY, r: 9 });
    plot.point(state.L / 4, area(state, state.L / 4), { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Fence the field' },
    { key: 'L', label: 'Length of fence, all round', min: 20, max: 80, step: 4, format: (v) => `${v} m` },
    { key: 'w', label: 'Width', min: 1, max: 19, step: 0.5, format: (v) => `${v} m` },
    { readout: [
      ['Length', (s) => `${fixed(s.L / 2 - s.w, 1)} m`],
      ['Area', (s) => `${fixed(area(s, s.w), 1)} m²`],
      ['Best width, L/4', (s) => ({ text: `${fixed(s.L / 4, 1)} m  (area ${fixed((s.L / 4) ** 2, 1)} m²)`, good: Math.abs(s.w - s.L / 4) < 1e-9 })],
    ] },
  ],
  onChange(s) { if (s.w >= s.L / 2) s.w = s.L / 2 - 0.5; },
  tex: (s) => `A=w\\left(\\dfrac{${s.L}}{2}-w\\right)=${fixed(area(s, s.w), 1)},\\quad w_{\\max}=-\\dfrac{b}{2a}=\\dfrac{${s.L}}{4}`,
});
