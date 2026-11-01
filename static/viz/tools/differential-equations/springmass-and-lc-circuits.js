import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Spring: m x'' + k x = 0.  LC circuit: L q'' + q / C = 0.  Same equation with m <-> L, k <-> 1/C, x <-> q.
const state = { m: 2, k: 8, L: 1, C: 0.5 };
const w1 = (s) => Math.sqrt(s.k / s.m);
const w2 = (s) => 1 / Math.sqrt(s.L * s.C);
const same = (s) => Math.abs(w1(s) - w2(s)) < 0.005;

createTool({
  state,
  label: 'A mass on a spring in coral and a charge in an inductor and capacitor circuit in blue, each released from rest at full displacement. Both obey the same equation, with mass playing the part of inductance and spring stiffness the part of one over capacitance. Setting L equal to m and C equal to one over k makes the two curves identical.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [-1.3, 1.3], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't', yLabel: 'x, or q' });
    plot.fn((t) => Math.cos(w2(state) * t), { color: c.b, width: 6 });
    plot.fn((t) => Math.cos(w1(state) * t), { color: c.a, width: 3 });
  },
  controls: (tool) => [
    { title: 'Spring and mass' },
    { key: 'm', label: 'Mass m', min: 0.5, max: 5, step: 0.5, format: (v) => `${fixed(v, 1)} kg` },
    { key: 'k', label: 'Spring constant k', min: 1, max: 10, step: 1, format: (v) => `${v} N/m` },
    { title: 'LC circuit' },
    { key: 'L', label: 'Inductance L', min: 0.5, max: 5, step: 0.5, format: (v) => `${fixed(v, 1)} H` },
    { key: 'C', label: 'Capacitance C', min: 0.1, max: 1, step: 0.05, format: (v) => `${fixed(v, 2)} F` },
    { button: 'Match the circuit to the spring', onClick: () => { state.L = state.m; state.C = Math.min(1, Math.max(0.1, 1 / state.k)); tool.update(); } },
    { readout: [
      ['Spring ω = √(k/m)', (s) => `${fixed(w1(s), 3)} rad/s`],
      ['Circuit ω = 1/√(LC)', (s) => `${fixed(w2(s), 3)} rad/s`],
      ['The two agree?', (s) => (same(s) ? { text: 'yes', good: true } : { text: 'no', good: false })],
    ] },
  ],
  tex: () => String.raw`m\,x''+kx=0\quad\longleftrightarrow\quad L\,q''+\dfrac qC=0`,
});
