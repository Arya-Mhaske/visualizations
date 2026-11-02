import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { a: 4, b: 3, th: 60, swap: false };
const rad = (d) => (d * Math.PI) / 180;
const z = (s) => (s.swap ? -1 : 1) * s.a * s.b * Math.sin(rad(s.th));

plotTool({
  state,
  label: 'Two vectors drawn from the origin and the parallelogram they span. Its area is the size of the cross product, and the sign says whether the product points out of or into the page.',
  x: [-1, 8],
  y: [-1, 6],
  range: () => [[-1, 8], [-1, 6]],
  segments: (s, c) => {
    const [ax, ay, bx, by] = [s.a, 0, s.b * Math.cos(rad(s.th)), s.b * Math.sin(rad(s.th))];
    return [[0, 0, ax, ay, { color: c.a, width: 5 }], [0, 0, bx, by, { color: c.b, width: 5 }], [ax, ay, ax + bx, by, { color: c.grid, width: 2, dash: [4, 4] }], [bx, by, ax + bx, by, { color: c.grid, width: 2, dash: [4, 4] }]];
  },
  points: (s, c) => [[s.a, 0, c.a], [s.b * Math.cos(rad(s.th)), s.b * Math.sin(rad(s.th)), c.b]],
  texts: (s) => [[s.swap ? 'b × a' : 'a × b', 3.5, 4.8, {}], [z(s) > 0 ? '⊙ out of the page' : '⊗ into the page', 3.5, 4.2, {}]],
  controls: [
    { title: 'Two vectors' },
    { key: 'a', label: 'Length of a', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'Length of b', min: 1, max: 6, step: 1 },
    { key: 'th', label: 'Angle from a to b (°)', min: 0, max: 180, step: 5 },
    { key: 'swap', label: 'Take b × a instead', toggle: true },
    { readout: [
      ['Size ab sin θ', (s) => fixed(Math.abs(z(s)), 2)],
      ['z-component', (s) => fixed(z(s), 2)],
      ['Perpendicular to both', () => 'yes'],
    ] },
  ],
  tex: (s) => `${s.swap ? 'b\\times a' : 'a\\times b'}=${fixed(z(s), 2)}\\,\\hat z`,
});
