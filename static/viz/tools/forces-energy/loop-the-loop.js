import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { v0: 8, L: 1 };
const vmin = (s) => Math.sqrt(5 * G * s.L);
const vtop2 = (s) => s.v0 ** 2 - 4 * G * s.L;
const Ttop = (s) => vtop2(s) / s.L - G;

createTool({
  state,
  label: 'The tension at the top of the circle against the speed at the bottom. It is negative below the critical speed, where the string would go slack, and positive above it.',
  setup: (stage, c) => createPlot(stage, { x: [0, 14], y: [-10, 40], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 14], [-12, 40]);
    plot.axes({ xLabel: 'v₀ at the bottom (m/s)', yLabel: 'T at top / m (N/kg)' });
    plot.fn((v) => (v * v - 4 * G * state.L) / state.L - G, { color: c.b });
    plot.segment(vmin(state), -12, vmin(state), 40, { color: c.c, width: 2, dash: [5, 4] });
    plot.point(state.v0, Math.max(-11, Math.min(39, Ttop(state))), { fill: Ttop(state) >= 0 ? c.c : c.a });
  },
  controls: [
    { title: 'Swing the ball' },
    { key: 'v0', label: 'Speed at the bottom v₀ (m/s)', min: 2, max: 14, step: 0.5 },
    { key: 'L', label: 'String length L (m)', min: 0.5, max: 2, step: 0.25 },
    { readout: [
      ['Least v₀ = √(5gL)', (s) => `${fixed(vmin(s), 2)} m/s`],
      ['v² at the top', (s) => fixed(vtop2(s), 2)],
      ['Tension at the top per kg', (s) => `${fixed(Ttop(s), 2)} N/kg`],
      ['String', (s) => (Ttop(s) >= 0 ? 'stays taut' : 'goes slack')],
    ] },
  ],
  tex: (s) => `v_0^2\\ge5gL\\ \\Rightarrow\\ v_0\\ge${fixed(vmin(s), 2)}\\ \\mathrm{m/s}`,
});
