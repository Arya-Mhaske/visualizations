import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { RE, vCirc, period } from './_rg.js';

const state = { h: 400 };
const r = (h) => RE + h * 1000;

plotTool({
  state,
  label: 'Orbital speed against height above the Earth, falling as the orbit rises, with a marker at the chosen height.',
  x: [0, 40000],
  y: [0, 8],
  xLabel: 'height h (km)',
  yLabel: 'v (km/s)',
  range: () => [[0, 40000], [0, 8.5]],
  curves: (s, c) => [[(h) => vCirc(r(h)) / 1000, { color: c.b }]],
  points: (s, c) => [[s.h, vCirc(r(s.h)) / 1000, c.a]],
  controls: [
    { title: 'Raise the orbit' },
    { key: 'h', label: 'Height above the surface (km)', min: 200, max: 40000, step: 100 },
    { readout: [
      ['Speed', (s) => `${fixed(vCirc(r(s.h)) / 1000, 3)} km/s`],
      ['Period', (s) => `${fixed(period(r(s.h)) / 3600, 2)} hours`],
    ] },
  ],
  tex: (s) => `v=\\sqrt{\\dfrac{GM}{r}}=${fixed(vCirc(r(s.h)) / 1000, 3)}\\ \\mathrm{km/s}`,
});
