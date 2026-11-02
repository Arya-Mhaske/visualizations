import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { w0Of, XL, XC, Z, I } from './_lcr.js';

const V = 10;
const state = { w: 2000, L: 10, C: 10, R: 10 }; // L mH, C μF
const L = (s) => s.L / 1000;
const C = (s) => s.C / 1e6;
const W = [500, 8000];

const tool = createTool({
  state,
  label: 'Top: reactances against angular frequency. The inductive reactance is a rising line and the capacitive reactance a falling curve; they cross at the resonant frequency. Bottom: the current amplitude against frequency, a peak that sits exactly where the two reactances cross. A coral dot marks your chosen frequency on both.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: W, y: [0, 60], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    bottom: createPlot(stage, { x: W, y: [0, 1.2], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const l = L(state);
    const cc = C(state);
    const w0 = w0Of(l, cc);
    top.axes({ xLabel: 'ω (rad/s)', yLabel: 'reactance Ω' });
    top.fn((w) => XL(l, w), { color: c.b });
    top.fn((w) => XC(cc, w), { color: c.d });
    top.point(w0, XL(l, w0), { fill: c.c, r: 6 });
    top.point(state.w, XL(l, state.w), { fill: c.a, r: 5 });
    top.point(state.w, XC(cc, state.w), { fill: c.a, r: 5 });
    bottom.setRange(W, [0, Math.max(V / state.R, 0.3) * 1.15]);
    bottom.axes({ xLabel: 'ω (rad/s)', yLabel: 'I (A)' });
    bottom.fn((w) => I(V, state.R, l, cc, w), { color: c.a });
    bottom.segment(w0, 0, w0, 100, { color: c.c, width: 2, dash: [5, 4] });
    bottom.point(state.w, I(V, state.R, l, cc, state.w), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Sweep the frequency' },
    { key: 'w', label: 'Angular frequency ω', min: 500, max: 8000, step: 10, format: (v) => `${v} rad/s` },
    { key: 'L', label: 'Inductance L', min: 5, max: 20, step: 1, format: (v) => `${v} mH` },
    { key: 'C', label: 'Capacitance C', min: 5, max: 20, step: 1, format: (v) => `${v} μF` },
    { key: 'R', label: 'Resistance R', min: 2, max: 30, step: 1, format: (v) => `${v} Ω` },
    { readout: [
      ['X_L', (s) => `${fixed(XL(L(s), s.w), 1)} Ω`],
      ['X_C', (s) => `${fixed(XC(C(s), s.w), 1)} Ω`],
      ['Z', (s) => `${fixed(Z(s.R, L(s), C(s), s.w), 1)} Ω`],
      ['Current amplitude', (s) => `${fixed(I(V, s.R, L(s), C(s), s.w), 3)} A`],
      ['ω₀ = 1/√(LC)', (s) => `${sig(w0Of(L(s), C(s)), 4)} rad/s`],
    ] },
  ],
  tex: (s) => `X_L=X_C\\ \\Rightarrow\\ \\omega_0=\\dfrac{1}{\\sqrt{LC}}=${sig(w0Of(L(s), C(s)), 4)}\\ \\text{rad/s}`,
});

tool.update();
