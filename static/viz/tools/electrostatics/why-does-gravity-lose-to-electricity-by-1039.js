import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { K, E, G, MP, ME } from './_coulomb.js';

const PAIRS = {
  ep: { name: 'electron–proton', Fe: (r) => (K * E * E) / (r * r), Fg: (r) => (G * MP * ME) / (r * r) },
  pp: { name: 'proton–proton', Fe: (r) => (K * E * E) / (r * r), Fg: (r) => (G * MP * MP) / (r * r) },
  ee: { name: 'electron–electron', Fe: (r) => (K * E * E) / (r * r), Fg: (r) => (G * ME * ME) / (r * r) },
};
const state = { pair: 'ep', logr: -10 };
const ratio = (s) => PAIRS[s.pair].Fe(1) / PAIRS[s.pair].Fg(1);
const sci = (x) => { const e = Math.floor(Math.log10(x)); return `${(x / 10 ** e).toFixed(2)} × 10^${e}`; };

createTool({
  state,
  label: 'Two parallel straight lines on a log graph of force against distance. The upper line is the electric force and the lower line is the gravitational force between the chosen pair of particles. Both fall with the same slope, so the gap between them, about 39 powers of ten for an electron and a proton, stays the same at every distance.',
  setup: (stage, c) => createPlot(stage, { c, x: [-15, 0], y: [-60, 10] }),
  draw(ctx, stage, c, plot) {
    const P = PAIRS[state.pair];
    plot.axes({ xLabel: 'log r (m)', yLabel: 'log F (N)' });
    plot.fn((x) => Math.log10(P.Fe(10 ** x)), { color: c.a });
    plot.fn((x) => Math.log10(P.Fg(10 ** x)), { color: c.b });
    plot.segment(state.logr, Math.log10(P.Fg(10 ** state.logr)), state.logr, Math.log10(P.Fe(10 ** state.logr)), { width: 3, dash: [4, 4] });
    plot.point(state.logr, Math.log10(P.Fe(10 ** state.logr)), { fill: c.a });
    plot.point(state.logr, Math.log10(P.Fg(10 ** state.logr)), { fill: c.b });
    plot.text('electric', -13, Math.log10(P.Fe(1e-13)) + 5, { color: c.a, size: 11, patch: false });
    plot.text('gravity', -13, Math.log10(P.Fg(1e-13)) - 5, { color: c.b, size: 11, patch: false });
  },
  controls: [
    { title: 'Compare two forces' },
    { key: 'pair', label: 'Pair', options: Object.entries(PAIRS).map(([k, v]) => [k, v.name.split('–').map((w) => w[0]).join('–')]) },
    { key: 'logr', label: 'log₁₀ r (m)', min: -15, max: 0, step: 1 },
    { readout: [
      ['Electric force', (s) => `${sci(PAIRS[s.pair].Fe(10 ** s.logr))} N`],
      ['Gravity', (s) => `${sci(PAIRS[s.pair].Fg(10 ** s.logr))} N`],
      ['Ratio Fe/Fg', (s) => sci(ratio(s))],
    ] },
  ],
  tex: (s) => `\\dfrac{F_e}{F_g}=\\dfrac{ke^{2}}{Gm_1m_2}=${(ratio(s) / 10 ** Math.floor(Math.log10(ratio(s)))).toFixed(2)}\\times10^{${Math.floor(Math.log10(ratio(s)))}}`,
});
