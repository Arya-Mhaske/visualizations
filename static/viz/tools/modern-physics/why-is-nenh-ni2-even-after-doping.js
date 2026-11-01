import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sci, sig, texSci } from '../../lib/format.js';
import { NI_SI, settle } from './_intrinsic-extrinsic-semiconductors-math.js';

const TAU_MAX = 30;
const state = { logND: Math.log10(5e22), tau: TAU_MAX };
const ND = (s) => 10 ** s.logND;
const at = (s, tau = s.tau) => settle(ND(s), tau);

const tool = createTool({
  state,
  label: 'Two stacked graphs against time. Top: the log of the electron count n in coral stays high while the log of the hole count p in blue falls from 1.5 times 10 to the 16 down to about 10 to the 10. Bottom: the log of n times p divided by n sub i squared starts high and falls to zero, where the product equals n sub i squared. A dot marks the chosen time.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, TAU_MAX], y: [8, 24], c, pad: 26, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.55 }) }),
    low: createPlot(stage, { x: [0, TAU_MAX], y: [-0.5, 8], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.55, w: g.w, h: g.h * 0.45 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const r = at(state);
    top.axes({ xLabel: 't', yLabel: 'log₁₀ per m³' });
    top.fn((t) => Math.log10(at(state, t).n), { color: c.a });
    top.fn((t) => Math.log10(at(state, t).p), { color: c.b });
    top.point(state.tau, Math.log10(r.n), { fill: c.a, r: 6 });
    top.point(state.tau, Math.log10(r.p), { fill: c.b, r: 6 });
    top.text('electrons n', TAU_MAX * 0.7, Math.log10(at(state, TAU_MAX).n) + 1.4, { size: 11 });
    top.text('holes p', TAU_MAX * 0.7, Math.log10(at(state, TAU_MAX).p) + 1.4, { size: 11 });
    low.axes({ xLabel: 't', yLabel: 'log₁₀ (np ÷ nᵢ²)' });
    low.fn((t) => Math.log10(Math.max(at(state, t).np / NI_SI ** 2, 1e-3)), { color: c.c });
    low.segment(0, 0, TAU_MAX, 0, { color: c.ink, width: 2, dash: [6, 4] });
    low.point(state.tau, Math.log10(Math.max(r.np / NI_SI ** 2, 1e-3)), { fill: c.c, r: 6 });
  },
  controls: () => [
    { title: 'Add donors, then wait' },
    { row: [
      { button: '1 Just added', onClick() { state.tau = 0; tool.update(); } },
      { button: '2 Settled', ghost: true, onClick() { state.tau = TAU_MAX; tool.update(); } },
      { button: '1 ppm of As', ghost: true, onClick() { state.logND = Math.log10(5e22); tool.update(); } },
    ] },
    { key: 'tau', label: 'Time since adding', min: 0, max: TAU_MAX, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'logND', label: 'Donors added, N_D', min: 18, max: 24, step: 0.05, format: (n) => `${sci(10 ** n, 2)} m⁻³` },
    { readout: [
      ['Electrons, n', (s) => `${sci(at(s).n, 3)} m⁻³`],
      ['Holes, p', (s) => `${sci(at(s).p, 3)} m⁻³`],
      ['Holes lost', (s) => `${sig((1 - at(s).p / NI_SI) * 100, 3)} %`],
      ['n·p ÷ nᵢ²', (s) => sig(at(s).np / NI_SI ** 2, 3)],
    ] },
  ],
  tex: (s) => `n_en_h=${texSci(at(s).n, 3)}\\times${texSci(at(s).p, 3)}=${texSci(at(s).np, 3)}\\ \\text{m}^{-6},\\quad n_i^2=${texSci(NI_SI ** 2, 3)}`,
});

tool.update();
