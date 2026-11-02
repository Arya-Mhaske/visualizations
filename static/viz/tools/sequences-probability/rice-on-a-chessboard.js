import { plotTool } from '../../lib/recipes.js';
import { sci } from '../../lib/format.js';

const state = { k: 20 };
const tot = (k) => (2n ** BigInt(k) - 1n).toString();

plotTool({
  state,
  label: 'The logarithm of the number of grains on each square and the logarithm of the running total against the square number. Both rise in straight lines, doubling at every step.',
  x: [0, 64],
  y: [0, 20],
  xLabel: 'square number',
  yLabel: 'log₁₀ (grains)',
  range: () => [[0, 65], [0, 20]],
  curves: (s, c) => [[(k) => (k - 1) * Math.log10(2), { color: c.a }], [(k) => k * Math.log10(2), { color: c.b, dash: [6, 5] }]],
  points: (s, c) => [[s.k, (s.k - 1) * Math.log10(2), c.a], [s.k, s.k * Math.log10(2), c.b]],
  controls: [
    { title: 'The squares' },
    { key: 'k', label: 'Square number', min: 1, max: 64, step: 1 },
    { readout: [
      ['Grains on this square', (s) => String(2n ** BigInt(s.k - 1))],
      ['Total up to here', (s) => tot(s.k)],
      ['Mass of the total (25 mg a grain)', (s) => `${sci(Number(BigInt(tot(s.k))) * 25e-6 / 1000, 2)} tonnes`],
    ] },
  ],
  tex: (s) => `S_{${s.k}}=2^{${s.k}}-1=${sci(Number(BigInt(tot(s.k))), 3)}`,
});
