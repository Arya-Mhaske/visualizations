import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { RE, gAt } from './_rg.js';

const state = { where: 'orbit', h: 400, m: 70 };
const r = (s) => RE + s.h * 1000;

barTool({
  state,
  label: 'Bars for the pull of gravity on an astronaut, the push of the floor on them, and the acceleration they share with the ship. In orbit gravity is almost as large as on the ground, but the floor pushes with nothing.',
  rows: (s, c) => [
    ['gravity on astronaut', s.m * (s.where === 'orbit' ? gAt(r(s)) : 9.8), c.fillA, `${fixed(s.m * (s.where === 'orbit' ? gAt(r(s)) : 9.8), 0)} N`],
    ['floor pushes with', s.where === 'orbit' ? 0.001 : s.m * 9.8, c.fillC, s.where === 'orbit' ? '0 N' : `${fixed(s.m * 9.8, 0)} N`],
    ['acceleration of the ship', s.where === 'orbit' ? gAt(r(s)) : 0.001, c.fillB, s.where === 'orbit' ? `${fixed(gAt(r(s)), 2)} m/s² (the same)` : '0'],
  ],
  max: 800,
  left: 0.36,
  controls: [
    { title: 'Where?' },
    { key: 'where', label: 'Place', options: [['orbit', 'In orbit'], ['ground', 'Standing on the ground']] },
    { key: 'h', label: 'Orbit height (km)', min: 200, max: 36000, step: 100 },
    { readout: [['g there', (s) => `${fixed(s.where === 'orbit' ? gAt(r(s)) : 9.8, 2)} m/s²`], ['Feels weight?', (s) => (s.where === 'orbit' ? 'no: free fall' : 'yes')]] },
  ],
  tex: () => `N=m(g-a)=0\\ \\text{when}\\ a=g`,
});
