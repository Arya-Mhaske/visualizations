import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { coll } from './_collisions.js';

const state = { lg: 0, u: 10 };
const res = (s, lg = s.lg) => coll(1, s.u, 10 ** lg, 0, 1);

plotTool({
  state,
  label: 'Final velocities of a ball and a truck against the truck-to-ball mass ratio on a log axis. The ball bounces back at nearly its own speed and the truck stays almost still.',
  x: [-2, 4],
  y: [-12, 12],
  xLabel: 'log₁₀ (M/m)',
  yLabel: 'velocity after (m/s)',
  range: (s) => [[-2, 4], [-s.u * 1.2, s.u * 1.2]],
  curves: (s, c) => [[(x) => res(s, x)[0], { color: c.a }], [(x) => res(s, x)[1], { color: c.b }]],
  points: (s, c) => [[s.lg, res(s)[0], c.a], [s.lg, res(s)[1], c.b]],
  controls: [
    { title: 'Ball (1 kg) against a truck at rest' },
    { key: 'lg', label: 'Truck mass: 10^x kg', min: -2, max: 4, step: 0.25 },
    { key: 'u', label: 'Ball speed (m/s)', min: 2, max: 12, step: 1 },
    { readout: [
      ['Ball after', (s) => `${fixed(res(s)[0], 3)} m/s`],
      ['Truck after', (s) => `${fixed(res(s)[1], 3)} m/s`],
      ['Truck mass', (s) => `${fixed(10 ** s.lg, 2)} kg`],
    ] },
  ],
  tex: (s) => `v_1=\\dfrac{m-M}{m+M}u\\to-u,\\quad v_2=\\dfrac{2m}{m+M}u\\to0`,
});
