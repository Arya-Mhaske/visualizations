import { plotTool } from '../../lib/recipes.js';

const state = { n: 5 };

plotTool({
  state,
  label: 'The logarithm of the gap between one and the sum of n nines after the decimal point, against n. It falls in a straight line without ever reaching zero.',
  x: [0, 12],
  y: [-12, 0],
  xLabel: 'number of nines n',
  yLabel: 'log₁₀ (1 − Sₙ)',
  range: () => [[0, 12], [-12.5, 0.5]],
  curves: (s, c) => [[(n) => -n, { color: c.b }]],
  points: (s, c) => [[s.n, -s.n, c.a]],
  controls: [
    { title: 'Nines after the decimal point' },
    { key: 'n', label: 'n', min: 1, max: 12, step: 1 },
    { readout: [['Sₙ', (s) => `0.${'9'.repeat(s.n)}`], ['Gap 1 − Sₙ', (s) => `10^−${s.n}`], ['a / (1 − r)', () => '0.9 / 0.9 = 1']] },
  ],
  tex: (s) => `\\dfrac{0.9}{1-0.1}=1`,
});
