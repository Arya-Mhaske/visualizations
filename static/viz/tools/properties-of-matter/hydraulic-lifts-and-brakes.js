import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { F: 100, lever: 4, ratio: 6 };
const master = (s) => s.F * s.lever;
const wheel = (s) => master(s) * s.ratio;

barTool({
  state,
  label: 'Bars for the force at each stage of a hydraulic brake: the foot, the master cylinder after the pedal lever, and the brake pad at the wheel after the area ratio.',
  rows: (s, c) => [['foot on pedal', s.F, c.fillA, `${s.F} N`], ['master cylinder', master(s), c.fillB, `${sig(master(s), 3)} N`], ['brake at the wheel', wheel(s), c.fillC, `${sig(wheel(s), 3)} N`]],
  max: 6000,
  left: 0.3,
  controls: [
    { title: 'Press the pedal' },
    { key: 'F', label: 'Foot force (N)', min: 20, max: 250, step: 10 },
    { key: 'lever', label: 'Pedal lever ratio', min: 2, max: 6, step: 0.5 },
    { key: 'ratio', label: 'Wheel ÷ master piston area', min: 2, max: 10, step: 0.5 },
    { readout: [['Total gain', (s) => `×${sig(s.lever * s.ratio, 3)}`], ['Pad moves', (s) => `1/${sig(s.lever * s.ratio, 3)} as far as the foot`]] },
  ],
  tex: (s) => `F_{\\text{wheel}}=F\\times${s.lever}\\times${s.ratio}=${sig(wheel(s), 3)}\\ \\mathrm{N}`,
});
