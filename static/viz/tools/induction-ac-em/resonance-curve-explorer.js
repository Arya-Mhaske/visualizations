import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { w0Of, I, Q, halfPower } from './_lcr.js';

const V = 10;
const state = { L: 10, C: 10, R: 10 }; // mH, μF, Ω
const Ls = (s) => s.L / 1000;
const Cs = (s) => s.C / 1e6;
const REF = { L: 10, C: 10, R: 10 };

const tool = createTool({
  state,
  label: 'A graph of current against frequency in hertz for a series circuit. The coral curve has a single peak at the resonant frequency. A dashed grey curve shows the starting circuit for comparison. Changing L or C moves the peak sideways. Changing R changes its height and width.',
  setup: (stage, c) => createPlot(stage, { x: [100, 1500], y: [0, 3], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const f0 = w0Of(Ls(state), Cs(state)) / (2 * Math.PI);
    const peak = V / state.R;
    plot.setRange([Math.max(50, f0 * 0.3), f0 * 2.2], [0, Math.max(peak, V / REF.R) * 1.15]);
    plot.axes({ xLabel: 'f (Hz)', yLabel: 'I (A)' });
    plot.fn((f) => I(V, REF.R, Ls(REF), Cs(REF), 2 * Math.PI * f), { color: c.grid, dash: [6, 4], width: 2 });
    plot.fn((f) => I(V, state.R, Ls(state), Cs(state), 2 * Math.PI * f), { color: c.a });
    plot.point(f0, peak, { fill: c.c, r: 7 });
  },
  controls: () => [
    { title: 'Tune the circuit' },
    { key: 'L', label: 'Inductance L', min: 2, max: 40, step: 1, format: (v) => `${v} mH` },
    { key: 'C', label: 'Capacitance C', min: 2, max: 40, step: 1, format: (v) => `${v} μF` },
    { key: 'R', label: 'Resistance R', min: 2, max: 40, step: 1, format: (v) => `${v} Ω` },
    { readout: [
      ['Resonant f₀', (s) => `${sig(w0Of(Ls(s), Cs(s)) / (2 * Math.PI), 4)} Hz`],
      ['Peak current', (s) => `${fixed(V / s.R, 2)} A`],
      ['Q', (s) => fixed(Q(s.R, Ls(s), Cs(s)), 2)],
      ['Bandwidth (half-power)', (s) => { const [a, b] = halfPower(s.R, Ls(s), Cs(s)); return `${sig((b - a) / (2 * Math.PI), 3)} Hz`; }],
    ] },
  ],
  tex: (s) => `f_0=\\dfrac{1}{2\\pi\\sqrt{LC}}=${sig(w0Of(Ls(s), Cs(s)) / (2 * Math.PI), 4)}\\ \\text{Hz}`,
});

tool.update();
