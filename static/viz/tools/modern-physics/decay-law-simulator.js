import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

const YEAR = 3.156e7;
// Half-lives in seconds.
const ISOTOPES = [
  ['po214', 'polonium-214', 1.64e-4],
  ['i131', 'iodine-131', 8.02 * 86400],
  ['co60', 'cobalt-60', 5.27 * YEAR],
  ['c14', 'carbon-14', 5730 * YEAR],
  ['ra226', 'radium-226', 1600 * YEAR],
  ['u238', 'uranium-238', 4.47e9 * YEAR],
];
const state = { iso: 'c14', x: 1.5 };
const half = (s) => ISOTOPES.find((i) => i[0] === s.iso)[2];
const lambda = (s) => Math.LN2 / half(s);
const mean = (s) => 1 / lambda(s);
const timeText = (sec) => {
  if (sec < 1e-3) return `${sig(sec * 1e6, 3)} μs`;
  if (sec < 120) return `${sig(sec, 3)} s`;
  if (sec < 86400 * 2) return `${sig(sec / 3600, 3)} h`;
  if (sec < YEAR) return `${sig(sec / 86400, 3)} days`;
  return `${sig(sec / YEAR, 3)} years`;
};

const tool = createTool({
  state,
  label: 'A graph of the fraction of nuclei left against time measured in half-lives. A smooth falling curve passes through one half at one half-life and through one over e, about 0.37, at the mean life of 1.44 half-lives. A coral point follows the time slider.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6], y: [0, 1.05], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't ÷ T½', yLabel: 'N/N₀' });
    plot.fn((x) => 2 ** -x, { color: c.b });
    plot.segment(0, 0.5, 1, 0.5, { color: c.ink, width: 2, dash: [5, 4] });
    plot.segment(1, 0.5, 1, 0, { color: c.ink, width: 2, dash: [5, 4] });
    plot.point(1, 0.5, { fill: c.c, r: 6 });
    plot.text('T½', 1.05, 0.58, { align: 'left', size: 10 });
    const tau = 1 / Math.LN2;
    plot.segment(0, Math.exp(-1), tau, Math.exp(-1), { color: c.ink, width: 2, dash: [3, 4] });
    plot.segment(tau, Math.exp(-1), tau, 0, { color: c.ink, width: 2, dash: [3, 4] });
    plot.point(tau, Math.exp(-1), { fill: c.d, r: 6 });
    plot.text('τ', tau + 0.08, 0.28, { align: 'left', size: 10 });
    plot.point(state.x, 2 ** -state.x, { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Pick a radioactive isotope' },
    { key: 'iso', label: 'Isotope', options: ISOTOPES.map(([k, name]) => [k, name]) },
    { key: 'x', label: 'Time elapsed', min: 0, max: 6, step: 0.05, format: (v) => `${fixed(v, 2)} T½` },
    { readout: [
      ['Half-life T½', (s) => timeText(half(s))],
      ['Decay constant λ', (s) => `${sig(lambda(s), 3)} s⁻¹`],
      ['Mean life τ = 1/λ', (s) => timeText(mean(s))],
      ['τ ÷ T½', () => fixed(1 / Math.LN2, 3)],
      ['Time elapsed', (s) => timeText(s.x * half(s))],
      ['Left, N/N₀', (s) => fixed(2 ** -s.x, 4)],
    ] },
  ],
  tex: (s) => `\\lambda=\\dfrac{0.693}{T_{1/2}}=${sig(lambda(s), 3)}\\ \\text{s}^{-1},\\quad \\tau=\\dfrac{T_{1/2}}{0.693}`,
});

tool.update();
