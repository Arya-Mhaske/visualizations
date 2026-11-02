import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// A rod of length L slides at speed v on rails in a field B into the page. A charge q in the rod feels qvB along the rod,
// so ε = BLv. The same number is B × (rate the area is swept): Φ = B L x, dΦ/dt = B L v.
const CYCLE = 4;
const state = { t: 2, B: 0.5, L: 0.4, v: 2 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const x = (s, t) => s.v * t * 0.5; // metres from the left end of the rails
const flux = (s, t) => s.B * s.L * x(s, t);

const tool = createTool({
  state,
  label: 'Top: two rails and a sliding rod in a magnetic field into the page, with a coral arrow on a charge in the rod showing the force q v B along the rod. The area swept out is shaded. Bottom: a graph of the flux through the loop against time, a straight line whose slope is the emf.',
  setup: (stage, c) => createPlot(stage, { x: [0, CYCLE], y: [0, 1], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.52, w: g.w, h: g.h * 0.48 }) }),
  draw(ctx, stage, c, plot) {
    const X0 = 40;
    const W = stage.w - 80;
    const top = stage.h * 0.08;
    const bot = stage.h * 0.4;
    const xr = X0 + (x(state, state.t) / (state.v * CYCLE * 0.5 || 1)) * W;
    ctx.fillStyle = c.fillB;
    ctx.fillRect(X0, top, xr - X0, bot - top);
    line(ctx, X0, top, X0 + W + 10, top, { color: c.ink, width: 4 });
    line(ctx, X0, bot, X0 + W + 10, bot, { color: c.ink, width: 4 });
    line(ctx, X0, top, X0, bot, { color: c.ink, width: 4 });
    line(ctx, xr, top - 6, xr, bot + 6, { color: c.a, width: 6 });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) label(ctx, '×', X0 + 20 + (i * (W - 20)) / 6, top + 16 + (j * (bot - top - 20)) / 2, c, { size: 11, color: c.grid, patch: false });
    const qy = (top + bot) / 2;
    dot(ctx, xr, qy, 6, c.paper, c.ink, 2);
    label(ctx, '+q', xr + 14, qy - 12, c, { size: 10, patch: false });
    arrow(ctx, xr, qy, xr, qy - 24, { color: c.a, width: 3, head: 7 });
    arrow(ctx, xr + 28, bot - 6, xr + 58, bot - 6, { color: c.ink, width: 2, head: 6 });
    label(ctx, 'v', xr + 66, bot - 6, c, { size: 10, patch: false });
    const fmax = state.B * state.L * state.v * CYCLE * 0.5;
    plot.setRange([0, CYCLE], [0, Math.max(fmax * 1.1, 0.01)]);
    plot.axes({ xLabel: 't (s)', yLabel: 'Φ = BLx (Wb)' });
    plot.fn((t) => flux(state, t), { color: c.b });
    plot.point(state.t, flux(state, state.t), { fill: c.a, r: 6 });
  },
  controls: () => [
    { title: 'Slide the rod' },
    { key: 'B', label: 'Field B', min: 0.1, max: 1, step: 0.05, format: (v) => `${fixed(v, 2)} T` },
    { key: 'L', label: 'Rod length L', min: 0.1, max: 0.8, step: 0.05, format: (v) => `${fixed(v, 2)} m` },
    { key: 'v', label: 'Speed v', min: 0.5, max: 5, step: 0.5, format: (v) => `${fixed(v, 1)} m/s` },
    { key: 't', label: 'Time', min: 0, max: CYCLE, step: 0.01, format: (v) => `${fixed(v, 2)} s` },
    transport(line2.clock),
    { readout: [
      ['Force on a charge, qvB', (s) => `${sig(1.6e-19 * s.v * s.B, 3)} N (electron)`],
      ['Field along the rod, vB', (s) => `${fixed(s.v * s.B, 3)} V/m`],
      ['Emf = (vB) × L', (s) => `${fixed(s.v * s.B * s.L, 4)} V`],
      ['Slope of Φ against t', (s) => `${fixed((flux(s, 3) - flux(s, 1)) / 2, 4)} V`],
    ] },
  ],
  onChange: () => line2.sync(),
  tex: (s) => `\\varepsilon=BLv=${fixed(s.B, 2)}\\times${fixed(s.L, 2)}\\times${fixed(s.v, 1)}=${fixed(s.B * s.L * s.v, 4)}\\ \\text{V}`,
});
line2.sync();
tool.update();
