import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_is.js';

// Planck: B = 2hc²/λ⁵ · 1/(e^x − 1), x = hc/(λkT). For small x, e^x − 1 ≈ x, giving Rayleigh–Jeans B = 2ckT/λ⁴.
const H = 6.626e-34;
const C = 2.998e8;
const KB = 1.381e-23;
const state = { T: 5800, lam: 3 }; // T in K, λ in μm
const xOf = (lam, T = state.T) => (H * C) / (lam * 1e-6 * KB * T);
const planck = (lam, T = state.T) => ((2 * H * C * C) / (lam * 1e-6) ** 5) / Math.expm1(xOf(lam, T));
const rj = (lam, T = state.T) => (2 * C * KB * T) / (lam * 1e-6) ** 4;
const lg = (v) => Math.log10(v);
const peak = () => 2897.8 / state.T; // Wien, μm

createTool({
  state,
  label: 'Brightness of a hot body against wavelength on log scales. The Planck curve (black) bends over and falls at short wavelengths, while the classical Rayleigh-Jeans line (coral) keeps rising. At long wavelengths they merge.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1.5], y: [8, 16], c }),
  draw(ctx, stage, c, plot) {
    const top = lg(rj(0.1)) + 0.2;
    plot.setRange([-1, 1.5], [lg(planck(30)) - 0.3, Math.min(top, lg(rj(0.1)) + 0.2)]);
    plot.axes({ xLabel: 'log₁₀ λ (μm)', yLabel: 'log₁₀ B' });
    plot.fn((x) => lg(rj(10 ** x)), { color: c.a, width: 3, dash: [7, 4] });
    plot.fn((x) => lg(planck(10 ** x)), { color: c.ink, width: 3 });
    plot.segment(lg(state.lam), -50, lg(state.lam), 50, { color: c.b, width: 2, dash: [5, 4] });
    plot.point(lg(state.lam), lg(planck(state.lam)), { fill: c.ink, r: 5 });
    plot.point(lg(state.lam), lg(rj(state.lam)), { fill: c.a });
  },
  controls: [
    { title: 'Heat it, tune it' },
    { key: 'T', label: 'Temperature T', min: 2000, max: 12000, step: 100, format: (v) => `${v} K` },
    { key: 'lam', label: 'Wavelength λ', min: 0.1, max: 30, step: 0.1, format: (v) => `${v.toFixed(1)} μm` },
    { readout: [
      ['x = hc/λkT', () => num(xOf(state.lam), 4)],
      ['Planck ÷ classical', () => num(planck(state.lam) / rj(state.lam), 4)],
      ['x/(eˣ − 1) ≈ 1 − x/2', () => `${num(xOf(state.lam) / Math.expm1(xOf(state.lam)), 4)} ≈ ${num(1 - xOf(state.lam) / 2, 4)}`],
      ['Peak (Wien, 2898 μm·K / T)', () => `${num(peak(), 3)} μm`],
    ] },
  ],
  tex: (s) => `\\frac{2hc^2}{\\lambda^5}\\frac{1}{e^{x}-1}\\to\\frac{2ckT}{\\lambda^4}\\ \\text{as } x\\to 0,\\quad x=\\frac{hc}{\\lambda kT}`,
});
