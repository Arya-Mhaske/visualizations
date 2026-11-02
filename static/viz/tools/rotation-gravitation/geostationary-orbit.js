import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { GM, RE, vCirc } from './_rg.js';

const state = { T: 24 };
const rOf = (T) => (GM * (T * 3600) ** 2 / (4 * Math.PI ** 2)) ** (1 / 3);

plotTool({
  state,
  label: 'Orbit height against orbital period, rising with the period. A marker shows the chosen period and the geostationary height at twenty-four hours.',
  x: [0, 48],
  y: [0, 70000],
  xLabel: 'period T (hours)',
  yLabel: 'height (km)',
  range: () => [[0, 48], [0, 80000]],
  curves: (s, c) => [[(T) => (rOf(T) - RE) / 1000, { color: c.b }]],
  points: (s, c) => [[24, (rOf(24) - RE) / 1000, c.c, 6], [s.T, (rOf(s.T) - RE) / 1000, c.a, 8]],
  controls: [
    { title: 'Period' },
    { key: 'T', label: 'Period T (hours)', min: 2, max: 48, step: 0.5 },
    { readout: [
      ['Height', (s) => `${fixed((rOf(s.T) - RE) / 1000, 0)} km`],
      ['Radius from the centre', (s) => `${fixed(rOf(s.T) / 1000, 0)} km`],
      ['Speed', (s) => `${fixed(vCirc(rOf(s.T)) / 1000, 2)} km/s`],
    ] },
  ],
  tex: (s) => `r=\\left(\\dfrac{GMT^2}{4\\pi^2}\\right)^{1/3}=${fixed(rOf(s.T) / 1000, 0)}\\ \\mathrm{km}`,
});
