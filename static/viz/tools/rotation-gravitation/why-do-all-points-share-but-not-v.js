import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { w: 4 };
const RS = [0.1, 0.3, 0.5, 0.7];

barTool({
  state,
  label: 'Bars of the speed of four points at different distances from the axis of a spinning disc. They all have the same angular speed but the speeds grow with distance.',
  rows: (s, c) => RS.map((r, i) => [`r = ${r} m`, s.w * r, [c.fillA, c.fillB, c.fillC, c.fillA][i], `v = ${fixed(s.w * r, 2)} m/s  (ω = ${s.w})`]),
  max: 6,
  left: 0.2,
  controls: [
    { title: 'A spinning disc' },
    { key: 'w', label: 'Angular speed ω (rad/s)', min: 0, max: 8, step: 0.5 },
    { readout: [['All points share', (s) => `ω = ${s.w} rad/s`], ['Speed at the rim', (s) => `${fixed(s.w * 0.7, 2)} m/s`]] },
  ],
  tex: (s) => `v=\\omega r`,
});
