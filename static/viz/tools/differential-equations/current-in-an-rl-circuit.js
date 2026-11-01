import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// L dI/dt + R I = E  =>  dI/dt = (E - R I) / L.  Exact with I(0) = 0:  I = (E/R)(1 - e^(-Rt/L)).
const state = { L: 2, R: 4, E: 12, t: 0.5 };
const slope = (s, I) => (s.E - s.R * I) / s.L;
const exact = (s, t) => (s.E / s.R) * (1 - Math.exp((-s.R * t) / s.L));
const tau = (s) => s.L / s.R;

createTool({
  state,
  label: 'A slope field for the current in a circuit with an inductor L, a resistor R and a battery E. The arrows show how fast the current changes at each time and current. The solution that starts from zero current climbs and levels off at E over R, and a dashed line marks the time constant L over R where it reaches 63 percent.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5], y: [0, 4], c }),
  draw(ctx, stage, c, plot) {
    const tEnd = tau(state) * 5;
    const Imax = (state.E / state.R) * 1.2;
    plot.setRange([0, tEnd], [0, Imax]);
    plot.axes({ xLabel: 't (s)', yLabel: 'I (A)' });
    const sx = Math.abs(plot.toPx(1, 0)[0] - plot.toPx(0, 0)[0]);
    const sy = Math.abs(plot.toPx(0, 1)[1] - plot.toPx(0, 0)[1]);
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 9; j++) {
        const t = ((i + 0.5) / 15) * tEnd;
        const I = ((j + 0.5) / 9) * Imax;
        const dx = sx;
        const dy = -slope(state, I) * sy;
        const n = Math.hypot(dx, dy) || 1;
        const [px, py] = plot.toPx(t, I);
        line(ctx, px - (dx / n) * 8, py - (dy / n) * 8, px + (dx / n) * 8, py + (dy / n) * 8, { color: c.grid, width: 2 });
      }
    }
    plot.segment(0, state.E / state.R, tEnd, state.E / state.R, { color: c.c, width: 3, dash: [8, 5] });
    plot.fn((t) => exact(state, t), { color: c.a, width: 4 });
    plot.segment(tau(state), 0, tau(state), exact(state, tau(state)), { color: c.b, width: 3, dash: [5, 4] });
    plot.point(Math.min(state.t, tEnd), exact(state, Math.min(state.t, tEnd)), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Switch on the battery' },
    { key: 'L', label: 'Inductance L', min: 0.5, max: 5, step: 0.5, format: (v) => `${fixed(v, 1)} H` },
    { key: 'R', label: 'Resistance R', min: 1, max: 10, step: 0.5, format: (v) => `${fixed(v, 1)} Ω` },
    { key: 'E', label: 'Battery E', min: 2, max: 20, step: 1, format: (v) => `${v} V` },
    { key: 't', label: 'Time', min: 0, max: 5, step: 0.05, format: (v) => `${fixed(v, 2)} s` },
    { readout: [
      ['Final current E/R', (s) => `${fixed(s.E / s.R, 2)} A`],
      ['Time constant L/R', (s) => `${fixed(tau(s), 2)} s`],
      ['Current now', (s) => `${fixed(exact(s, Math.min(s.t, tau(s) * 5)), 3)} A`],
      ['Rate dI/dt now', (s) => `${fixed(slope(s, exact(s, Math.min(s.t, tau(s) * 5))), 3)} A/s`],
    ] },
  ],
  tex: (s) => String.raw`L\dfrac{dI}{dt}+RI=E\ \Rightarrow\ I=\dfrac ER\left(1-e^{-t/\tau}\right),\ \tau=\dfrac LR=${fixed(tau(s), 2)}\text{ s}`,
});
