import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { KB, GASES, vmean } from './_kt.js';
import { sig, fixed } from '../../lib/format.js';

// λ = k T / (√2 π d² P), nitrogen-like. P in atm (1 atm = 101325 Pa), d in ångström.
const ATM = 101325;
const state = { logP: 0, T: 300, d: 2 };
const lam = (s, logP = s.logP) => (KB * s.T) / (Math.SQRT2 * Math.PI * (s.d * 1e-10) ** 2 * (10 ** logP) * ATM);
const unit = (m) => (m >= 1 ? `${sig(m, 3)} m` : m >= 1e-3 ? `${sig(m * 1e3, 3)} mm` : m >= 1e-6 ? `${sig(m * 1e6, 3)} µm` : `${sig(m * 1e9, 3)} nm`);

createTool({
  state,
  label: 'A graph of the logarithm of the mean free path against the logarithm of the pressure. It is a straight line sloping down: ten times less pressure means ten times longer free path. At one atmosphere the path is a fraction of a micrometre, and in a good vacuum it is metres.',
  setup: (stage, c) => createPlot(stage, { c, x: [-8, 1], y: [-8, 4] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'log P (atm)', yLabel: 'log λ (m)' });
    plot.fn((x) => Math.log10(lam(state, x)), { color: c.a, domain: [-8, 1] });
    plot.segment(-8, Math.log10(lam(state)), state.logP, Math.log10(lam(state)), { width: 2, dash: [4, 4] });
    plot.segment(state.logP, -8, state.logP, Math.log10(lam(state)), { width: 2, dash: [4, 4] });
    plot.point(state.logP, Math.log10(lam(state)), { fill: c.a });
    plot.text('room: 1 m', -6.2, 0.4, { size: 11, patch: false });
    plot.segment(-8, 0, 1, 0, { color: c.grid, width: 1.5, dash: [6, 5] });
  },
  controls: [
    { title: 'Thin the air' },
    { key: 'logP', label: 'log₁₀ P (atm)', min: -8, max: 1, step: 0.5, format: (v) => `${fixed(v, 1)}` },
    { key: 'T', label: 'Temperature (K)', min: 200, max: 400, step: 20 },
    { key: 'd', label: 'Molecule diameter (Å)', min: 1.5, max: 4, step: 0.5, format: (v) => fixed(v, 1) },
    { readout: [
      ['Mean free path', (s) => unit(lam(s))],
      ['In diameters', (s) => sig(lam(s) / (s.d * 1e-10), 3)],
      ['Collisions per second', (s) => sig(vmean(GASES.N2.M, s.T) / lam(s), 2)],
    ] },
  ],
  tex: (s) => `\\lambda=\\dfrac{kT}{\\sqrt2\\,\\pi d^{2}P}=${sig(lam(s), 3)}\\ \\mathrm{m}`,
});
