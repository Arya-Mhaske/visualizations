import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { th: 37 };
const rad = (d) => (d * Math.PI) / 180;

plotTool({
  state,
  label: 'Velocity arrows for a glancing collision between equal balls: the incoming velocity along the axis, and two outgoing velocities at right angles to each other.',
  x: [-1, 11],
  y: [-6, 6],
  range: () => [[-1, 11], [-6, 6]],
  segments: (s, c) => {
    const a = 10 * Math.cos(rad(s.th));
    const b = 10 * Math.sin(rad(s.th));
    return [[0, 0, 10, 0, { color: c.ink, width: 3, dash: [6, 5] }], [0, 0, a * Math.cos(rad(s.th)), a * Math.sin(rad(s.th)), { color: c.b, width: 5 }], [0, 0, b * Math.sin(rad(s.th)), -b * Math.cos(rad(s.th)), { color: c.a, width: 5 }]];
  },
  points: (s, c) => [[10, 0, c.ink, 4], [10 * Math.cos(rad(s.th)) ** 2, 10 * Math.cos(rad(s.th)) * Math.sin(rad(s.th)), c.b], [10 * Math.sin(rad(s.th)) ** 2, -10 * Math.sin(rad(s.th)) * Math.cos(rad(s.th)), c.a]],
  controls: [
    { title: 'Pot the ball' },
    { key: 'th', label: 'Target ball leaves at (°)', min: 5, max: 85, step: 1 },
    { readout: [
      ['Target speed', (s) => `${fixed(10 * Math.cos(rad(s.th)), 2)} (of 10)`],
      ['Cue ball goes off at', (s) => `${90 - s.th}° the other side`],
      ['Angle between the paths', () => '90°'],
    ] },
  ],
  tex: (s) => `\\vec v=\\vec v_1+\\vec v_2,\\ v^2=v_1^2+v_2^2\\ \\Rightarrow\\ \\theta_1+\\theta_2=90^\\circ`,
});
