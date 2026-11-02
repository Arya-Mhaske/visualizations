import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { F: 10, d: 2, px: 1, py: 3 };
const torque = (s) => {
  // forces: (0, +F) at (-d/2, 0) wait in-plane: F up at x = +d/2, F down at x = -d/2; torque about the pivot.
  const [x1, x2] = [s.d / 2, -s.d / 2];
  return (x1 - s.px) * s.F - (x2 - s.px) * s.F;
};

plotTool({
  state,
  label: 'Two equal and opposite forces along parallel lines, with a movable pivot point. The torque about the pivot is the same wherever the pivot is placed.',
  x: [-5, 5],
  y: [-4, 6],
  range: () => [[-5, 5], [-4, 6]],
  segments: (s, c) => [[s.d / 2, 0, s.d / 2, s.F / 5, { color: c.a, width: 5 }], [-s.d / 2, 0, -s.d / 2, -s.F / 5, { color: c.b, width: 5 }], [-s.d / 2, 0, s.d / 2, 0, { color: c.grid, width: 2, dash: [4, 4] }], [s.px, s.py, s.px, 0, { color: c.grid, width: 1, dash: [3, 3] }]],
  points: (s, c) => [[s.d / 2, 0, c.a], [-s.d / 2, 0, c.b], [s.px, s.py, c.c, 8]],
  controls: [
    { title: 'A couple' },
    { key: 'F', label: 'Each force (N)', min: 2, max: 20, step: 1 },
    { key: 'd', label: 'Gap between the lines d (m)', min: 0, max: 4, step: 0.5 },
    { key: 'px', label: 'Pivot x (m)', min: -4, max: 4, step: 0.5 },
    { key: 'py', label: 'Pivot y (m)', min: -3, max: 5, step: 0.5 },
    { readout: [
      ['Net force', () => '0 N'],
      ['Torque about the pivot', (s) => `${fixed(torque(s), 2)} N m`],
      ['F × d', (s) => `${fixed(s.F * s.d, 2)} N m`],
    ] },
  ],
  tex: (s) => `\\tau=Fd=${s.F}\\times${s.d}=${fixed(s.F * s.d, 2)}\\ \\mathrm{N\\,m}`,
});
