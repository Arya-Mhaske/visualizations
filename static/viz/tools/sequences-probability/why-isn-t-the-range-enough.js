import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { sd, meanDev } from './_seq.js';

const state = { w: 0.5 };
const A = [0, 1.7, 3.3, 5, 6.7, 8.3, 10];
const B = (s) => [0, 5 - s.w * 2, 5 - s.w, 5, 5 + s.w, 5 + s.w * 2, 10];

plotTool({
  state,
  label: 'Two dot plots on the same scale from zero to ten. Both have the same range. One has evenly spread points; the other has its middle points squeezed together.',
  x: [-1, 11],
  y: [-1, 2],
  range: () => [[-1, 11], [-0.8, 1.8]],
  points: (s, c) => [...A.map((x) => [x, 1, c.a, 7]), ...B(s).map((x) => [x, 0, c.b, 7])],
  texts: () => [['set A', 0.2, 1.4, { align: 'left' }], ['set B', 0.2, 0.4, { align: 'left' }]],
  controls: [
    { title: 'Squeeze the middle of set B' },
    { key: 'w', label: 'Spread of the middle points', min: 0.1, max: 2.5, step: 0.1 },
    { readout: [
      ['Range A | B', () => '10 | 10'],
      ['SD A | B', (s) => `${fixed(sd(A), 2)} | ${fixed(sd(B(s)), 2)}`],
      ['Mean deviation A | B', (s) => `${fixed(meanDev(A, 5), 2)} | ${fixed(meanDev(B(s), 5), 2)}`],
    ] },
  ],
  tex: (s) => `\\text{range}=10\\ \\text{for both};\\ \\sigma_A=${fixed(sd(A), 2)},\\ \\sigma_B=${fixed(sd(B(s)), 2)}`,
});
