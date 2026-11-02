import { createTool } from '../../lib/tool.js';
import { bars, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const MODES = [['sliding', 0.4], ['rolling', 0.02], ['ball bearings', 0.002]];
const state = { m: 100, v: 5 };

createTool({
  state,
  label: 'Bars of the friction force on a crate in three situations, sliding, rolling and on ball bearings, on a very different scale for each.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, MODES.map(([n, mu], i) => [n, mu * state.m * G, [c.fillA, c.fillB, c.fillC][i], `${fixed(mu * state.m * G, 1)} N`]), { max: 0.4 * 200 * G });
  },
  controls: [
    { title: 'Move a crate' },
    { key: 'm', label: 'Mass (kg)', min: 20, max: 200, step: 10 },
    { key: 'v', label: 'Speed (m/s)', min: 1, max: 10, step: 1 },
    { readout: MODES.map(([n, mu]) => [`${n}: coasts`, (s) => `${fixed(s.v ** 2 / (2 * mu * G), 1)} m`]) },
  ],
  tex: (s) => `f=\\mu N,\\quad \\mu_{\\text{slide}}\\gg\\mu_{\\text{roll}}`,
});
