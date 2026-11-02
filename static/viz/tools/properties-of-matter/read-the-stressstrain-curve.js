import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const MAT = {
  steel: { name: 'Steel', emax: 0.25, f: (e) => (e <= 0.02 ? 2e4 * e : e <= 0.03 ? 400 + 4000 * (e - 0.02) : e <= 0.1 ? 440 + 700 * (e - 0.03) : 489 + 1300 * (e - 0.1)), regions: [[0.02, 'proportional (Hooke)'], [0.03, 'elastic limit'], [0.1, 'yield: large strain for little extra stress'], [0.25, 'plastic: permanent set; fracture at the end']] },
  copper: { name: 'Copper', emax: 0.25, f: (e) => (e <= 0.015 ? 1.2e4 * e : e <= 0.03 ? 180 + 8000 * (e - 0.015) : 300 + 400 * (e - 0.03)), regions: [[0.015, 'proportional (Hooke)'], [0.03, 'elastic limit'], [0.25, 'plastic: permanent set']] },
  rubber: { name: 'Rubber', emax: 6, smax: 20, f: (e) => 0.5 * (e + 0.3 * e ** 3), regions: [[6, 'elastic but not Hooke: returns, along a different path']] },
  aorta: { name: 'Aorta', emax: 1.5, smax: 1.2, f: (e) => 0.05 * (Math.exp(3.2 * e) - 1), regions: [[1.5, 'elastic but not Hooke: stiffens as it stretches']] },
};
const state = { m: 'steel', p: 0.5 };
const e = (s) => s.p * MAT[s.m].emax * (s.m === 'steel' ? 1 : 1);
const region = (s) => MAT[s.m].regions.find(([lim]) => e(s) <= lim)?.[1] ?? 'fracture';

plotTool({
  state,
  label: 'A stress against strain curve for the chosen material with a marker that can be slid along it. The region of the curve is named.',
  x: [0, 1],
  y: [0, 1],
  xLabel: 'strain',
  yLabel: 'stress (MPa)',
  range: (s) => [[0, MAT[s.m].emax], [0, MAT[s.m].f(MAT[s.m].emax) * 1.1]],
  curves: (s, c) => [[MAT[s.m].f, { color: c.b, domain: [0, MAT[s.m].emax] }]],
  points: (s, c) => [[e(s), MAT[s.m].f(e(s)), c.a, 8]],
  controls: [
    { title: 'Load the sample' },
    { key: 'm', label: 'Material', options: Object.entries(MAT).map(([k, v]) => [k, v.name]) },
    { key: 'p', label: 'How far along the curve', min: 0.01, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { readout: [
      ['Strain', (s) => sig(e(s), 3)],
      ['Stress', (s) => `${sig(MAT[s.m].f(e(s)), 3)} MPa`],
      ['Region', (s) => region(s)],
    ] },
  ],
  tex: (s) => `\\sigma=Y\\varepsilon\\ \\text{only in the linear region}`,
});
