import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { RE, period } from './_rg.js';

const state = { h: 0 };

plotTool({
  state,
  label: 'Orbital period against height above the Earth, rising from about eighty-four minutes at the surface, with a marker at the chosen height.',
  x: [0, 40000],
  y: [0, 25],
  xLabel: 'height h (km)',
  yLabel: 'T (hours)',
  range: () => [[0, 40000], [0, 26]],
  curves: (s, c) => [[(h) => period(RE + h * 1000) / 3600, { color: c.b }]],
  points: (s, c) => [[s.h, period(RE + s.h * 1000) / 3600, c.a]],
  controls: [
    { title: 'The orbit' },
    { key: 'h', label: 'Height above the surface (km)', min: 0, max: 40000, step: 100 },
    { readout: [
      ['Period', (s) => `${fixed(period(RE + s.h * 1000) / 60, 1)} min`],
      ['In hours', (s) => `${fixed(period(RE + s.h * 1000) / 3600, 3)} h`],
    ] },
  ],
  tex: (s) => `T=2\\pi\\sqrt{\\dfrac{r^3}{GM}}=${fixed(period(RE + s.h * 1000) / 60, 1)}\\ \\mathrm{min}`,
});
