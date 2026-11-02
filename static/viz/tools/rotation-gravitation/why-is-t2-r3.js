import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const PL = [['Mercury', 0.387, 0.241], ['Venus', 0.723, 0.615], ['Earth', 1, 1], ['Mars', 1.524, 1.881], ['Jupiter', 5.203, 11.86], ['Saturn', 9.537, 29.46]];
const state = { i: 2 };

plotTool({
  state,
  label: 'The logarithm of the orbital period against the logarithm of the orbital radius for six planets. The points lie on a straight line of slope one and a half.',
  x: [-0.5, 1.2],
  y: [-1, 1.8],
  xLabel: 'log₁₀ R (AU)',
  yLabel: 'log₁₀ T (years)',
  range: () => [[-0.5, 1.2], [-1, 1.8]],
  curves: (s, c) => [[(x) => 1.5 * x, { color: c.ink, dash: [6, 5] }]],
  points: (s, c) => PL.map(([, R, T], i) => [Math.log10(R), Math.log10(T), i === s.i ? c.a : c.b, i === s.i ? 8 : 5]),
  texts: () => PL.map(([n, R, T]) => [n, Math.log10(R) + 0.05, Math.log10(T) - 0.12, { align: 'left' }]),
  controls: [
    { title: 'The planets' },
    { key: 'i', label: 'Planet', options: PL.map(([n], i) => [i, n]) },
    { readout: [
      ['R (AU) and T (years)', (s) => `${PL[s.i][1]} and ${PL[s.i][2]}`],
      ['T² / R³', (s) => fixed(PL[s.i][2] ** 2 / PL[s.i][1] ** 3, 3)],
      ['Slope of the line', () => '3/2'],
    ] },
  ],
  tex: (s) => `\\dfrac{T^2}{R^3}=\\dfrac{${PL[s.i][2]}^2}{${PL[s.i][1]}^3}=${fixed(PL[s.i][2] ** 2 / PL[s.i][1] ** 3, 3)}`,
});
