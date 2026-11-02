import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { w0Of, I, Q, halfPower } from './_lcr.js';

// L = 10 mH, C = 10 μF (ω₀ = 3162 rad/s). Smaller R: taller, narrower peak. Q = ω₀L/R, bandwidth Δω = R/L.
const V = 10;
const L = 0.01;
const C = 1e-5;
const state = { R: 10 };

const tool = createTool({
  state,
  label: 'A graph of current against angular frequency with two curves: a dashed grey curve for a reference resistance of 20 ohms and a coral curve for the resistance you chose. A lower resistance gives a taller, narrower peak. The shaded band under the coral curve marks the half-power points.',
  setup: (stage, c) => createPlot(stage, { x: [2000, 4400], y: [0, 3], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const peak = V / state.R;
    plot.setRange([2000, 4400], [0, Math.max(peak, V / 20) * 1.15]);
    plot.axes({ xLabel: 'ω (rad/s)', yLabel: 'I (A)' });
    const [w1, w2] = halfPower(state.R, L, C);
    plot.shade((w) => I(V, state.R, L, C, w), null, w1, w2, c.fillY);
    plot.fn((w) => I(V, 20, L, C, w), { color: c.grid, dash: [6, 4], width: 2 });
    plot.fn((w) => I(V, state.R, L, C, w), { color: c.a });
    plot.segment(w1, 0, w1, peak / Math.SQRT2, { color: c.ink, width: 2, dash: [4, 4] });
    plot.segment(w2, 0, w2, peak / Math.SQRT2, { color: c.ink, width: 2, dash: [4, 4] });
    plot.segment(2000, peak / Math.SQRT2, 4400, peak / Math.SQRT2, { color: c.ink, width: 1, dash: [3, 4] });
  },
  controls: () => [
    { title: 'Lower the resistance' },
    { key: 'R', label: 'Resistance R', min: 2, max: 40, step: 1, format: (v) => `${v} Ω` },
    { readout: [
      ['Peak current V/R', (s) => `${fixed(V / s.R, 2)} A`],
      ['Bandwidth Δω = R/L', (s) => `${sig(s.R / L, 3)} rad/s`],
      ['Measured half-power width', (s) => { const [a, b] = halfPower(s.R, L, C); return `${sig(b - a, 3)} rad/s`; }],
      ['Q = ω₀L/R', (s) => fixed(Q(s.R, L, C), 2)],
      ['ω₀', () => `${sig(w0Of(L, C), 4)} rad/s`],
    ] },
  ],
  tex: (s) => `Q=\\dfrac{\\omega_0L}{R}=\\dfrac{\\omega_0}{\\Delta\\omega}=${fixed(Q(s.R, L, C), 2)}`,
});

tool.update();
