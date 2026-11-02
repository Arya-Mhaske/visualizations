import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { F: 250, d: 8, dr: 0 };
const wCycle = (s) => -s.F * s.d;
const wRoad = (s) => s.F * s.dr;

createTool({
  state,
  label: 'Two bars: the work done by the road on the cycle, which is negative, and the work done by the cycle on the road, which is zero unless the road also moves.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, [['on cycle', Math.abs(wCycle(state)), c.fillA, `${fixed(wCycle(state), 0)} J`], ['on road', Math.abs(wRoad(state)) || 0.001, c.fillB, `${fixed(wRoad(state), 0)} J`]], { max: 4000 });
  },
  controls: [
    { title: 'The skid' },
    { key: 'F', label: 'Friction force (N)', min: 100, max: 500, step: 50 },
    { key: 'd', label: 'Cycle slides (m)', min: 1, max: 10, step: 1 },
    { key: 'dr', label: 'Road moves (m)', min: 0, max: 5, step: 0.5 },
    { readout: [
      ['Work on cycle', (s) => `${fixed(wCycle(s), 0)} J`],
      ['Work on road', (s) => `${fixed(wRoad(s), 0)} J`],
      ['Total', (s) => `${fixed(wCycle(s) + wRoad(s), 0)} J (lost as heat)`],
    ] },
  ],
  tex: (s) => `W_{\\text{cycle}}=-Fd=-${s.F}\\times${s.d}=${fixed(wCycle(s), 0)}\\ \\mathrm{J}`,
});
