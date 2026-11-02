import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// Illustrative potential energies (MeV) against separation r (fm). Coulomb p–p: 1.44/r exactly.
// The nuclear part is a Yukawa-shaped well, the same for n–n, n–p and p–p, set to −45 MeV at 1 fm.
// Real values depend on spin and state; the shape (strong, then gone beyond a few fm) is the point.
const state = { r: 1.5, pair: 'pp' };
const nuclear = (r) => (-45 / r) * Math.exp(-(r - 1) / 1.4);
const coulomb = (r, pair) => (pair === 'pp' ? 1.44 / r : 0);
const total = (r, pair) => nuclear(r) + coulomb(r, pair);

const tool = createTool({
  state,
  label: 'A graph of potential energy in MeV against the separation of two nucleons in femtometres. A green curve, the nuclear attraction, plunges to about minus 45 at 1 fm and fades to nothing by 6 fm. A coral curve, the Coulomb repulsion between two protons, is small but falls slowly. At large separation the repulsion is the bigger of the two.',
  setup: (stage, c) => createPlot(stage, { x: [0.8, 9], y: [-30, 8], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'r (fm)', yLabel: 'U (MeV)' });
    plot.fn(nuclear, { color: c.c, domain: [0.8, 9] });
    plot.fn((r) => coulomb(r, 'pp'), { color: c.a, domain: [0.8, 9], dash: state.pair === 'pp' ? [] : [6, 5] });
    plot.fn((r) => total(r, state.pair), { color: c.ink, width: 2, dash: [3, 4], domain: [0.8, 9] });
    const r = state.r;
    plot.point(r, nuclear(r), { fill: c.c, r: 6 });
    if (state.pair === 'pp') plot.point(r, coulomb(r, 'pp'), { fill: c.a, r: 6 });
    plot.text('nuclear', 1.9, -20, { size: 10 });
    plot.text('Coulomb (p–p)', 6.4, 2.3, { size: 10 });
  },
  controls: () => [
    { title: 'Bring two nucleons together' },
    { key: 'pair', label: 'Pair', options: [['pp', 'proton–proton'], ['np', 'neutron–proton'], ['nn', 'neutron–neutron']] },
    { key: 'r', label: 'Separation r', min: 0.8, max: 9, step: 0.1, format: (v) => `${fixed(v, 1)} fm` },
    { readout: [
      ['Nuclear U', (s) => `${fixed(nuclear(s.r), 2)} MeV`],
      ['Coulomb U', (s) => `${fixed(coulomb(s.r, s.pair), 2)} MeV`],
      ['Total U', (s) => `${fixed(total(s.r, s.pair), 2)} MeV`],
      ['Nuclear ÷ Coulomb', (s) => (s.pair === 'pp' ? `${sig(Math.abs(nuclear(s.r) / coulomb(s.r, 'pp')), 2)}×` : 'no Coulomb')],
      ['Who wins?', (s) => ({ text: total(s.r, s.pair) < 0 ? 'attraction' : 'repulsion', good: total(s.r, s.pair) < 0 })],
    ] },
  ],
  tex: (s) => `U_C=\\dfrac{e^2}{4\\pi\\varepsilon_0 r}=\\dfrac{1.44}{r}\\ \\text{MeV}=${fixed(coulomb(s.r, 'pp'), 2)}\\ \\text{MeV}`,
});

void dot;
tool.update();
