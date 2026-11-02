import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { tensionAt, angleAt, entryPressure } from './_surface-tension-math.js';

const state = { c: 0, r: 30 };
const P = (s, c = s.c) => entryPressure(tensionAt(c), angleAt(c), s.r * 1e-6);

createTool({
  state,
  label: 'A graph of the pressure needed to push water into a greasy pore against the amount of detergent. It starts positive and falls below zero as detergent is added. Below it, a pore with the water meniscus bulging in or being drawn in.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1.5], y: [-4, 6], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.68 }) }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'detergent (× CMC)', yLabel: 'P (kPa)' });
    plot.segment(0, 0, 1.5, 0, { color: c.ink, width: 2, dash: [5, 4] });
    plot.fn((x) => P(state, x) / 1000, { color: c.b });
    plot.point(state.c, P(state) / 1000);
    const [x0, x1, y0] = [stage.w * 0.35, stage.w * 0.92, stage.h * 0.86];
    poly(ctx, [[10, y0 - 22], [x0, y0 - 22], [x0, y0 + 22], [10, y0 + 22]], { fill: c.fillB });
    poly(ctx, [[x0, y0 - 24], [x1, y0 - 24]], { stroke: c.ink, closed: false });
    poly(ctx, [[x0, y0 + 24], [x1, y0 + 24]], { stroke: c.ink, closed: false });
    const bulge = (P(state) > 0 ? 1 : -1) * Math.min(22, Math.abs(P(state)) / 150 + 4);
    const pts = [];
    for (let i = 0; i <= 20; i++) pts.push([x0 + bulge * Math.sin((Math.PI * i) / 20), y0 - 22 + (44 * i) / 20]);
    poly(ctx, pts, { stroke: c.a, closed: false });
    label(ctx, P(state) > 0 ? 'water held out' : 'water drawn in', stage.w * 0.66, y0 - 40, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Add detergent' },
    { key: 'c', label: 'Detergent (× CMC)', min: 0, max: 1.5, step: 0.05 },
    { key: 'r', label: 'Pore radius r (μm)', min: 10, max: 100, step: 5 },
    { readout: [
      ['S (mN/m)', (s) => fixed(tensionAt(s.c) * 1000, 1)],
      ['θ', (s) => `${fixed(angleAt(s.c), 0)}°`],
      ['Pressure to push in', (s) => `${sig(P(s) / 1000, 2)} kPa`],
      ['Water enters by itself?', (s) => ({ text: P(s) < 0 ? 'yes' : 'no', good: P(s) < 0 })],
    ] },
  ],
  tex: (s) => `P=\\dfrac{-2S\\cos\\theta}{r}=${sig(P(s) / 1000, 2)}\\ \\mathrm{kPa}`,
});
