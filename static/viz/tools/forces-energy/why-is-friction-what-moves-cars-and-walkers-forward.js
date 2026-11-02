import { createTool } from '../../lib/tool.js';
import { bars, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const SURF = { road: ['Dry road', 0.7], wet: ['Wet road', 0.4], ice: ['Ice', 0.05] };
const state = { s: 'road', F: 4000, m: 1000 };
const avail = (s) => SURF[s.s][1] * s.m * G;
const push = (s) => Math.min(s.F, avail(s));

createTool({
  state,
  label: 'Bars compare the push the wheels demand with the most friction the ground can give. The car accelerates only with the smaller of the two; if the demand is bigger, the wheels spin.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, [['wheels demand', state.F, c.fillA, `${state.F} N`], ['ground can give', avail(state), c.fillB, `${fixed(avail(state), 0)} N`], ['forward push', push(state), c.c, `${fixed(push(state), 0)} N`]], { max: 8000 });
  },
  controls: [
    { title: 'Drive' },
    { key: 's', label: 'Surface', options: Object.entries(SURF).map(([k, v]) => [k, v[0]]) },
    { key: 'F', label: 'Push the wheels try to give (N)', min: 500, max: 8000, step: 500 },
    { key: 'm', label: 'Car mass (kg)', min: 500, max: 2000, step: 100 },
    { readout: [
      ['Acceleration', (s) => `${fixed(push(s) / s.m, 2)} m/s²`],
      ['Largest possible μg', (s) => `${fixed(SURF[s.s][1] * G, 2)} m/s²`],
      ['Wheels', (s) => (s.F > avail(s) ? 'spinning' : 'gripping')],
    ] },
  ],
  tex: (s) => `a_{\\max}=\\mu g=${SURF[s.s][1]}\\times9.8=${fixed(SURF[s.s][1] * G, 2)}\\ \\mathrm{m/s^2}`,
});
