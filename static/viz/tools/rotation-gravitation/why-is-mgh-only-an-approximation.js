import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { GM, RE } from './_rg.js';

const state = { k: 3 };
const hmax = (s) => 10 ** s.k * 1000;
const exact = (h) => (GM * h) / (RE * (RE + h)) / 1000;
const lin = (h) => (9.8 * h) / 1000;

plotTool({
  state,
  label: 'Gain in potential energy per kilogram against height: the exact curve and the straight line mgh. At small heights they coincide; at large heights the exact curve bends below the line.',
  x: [0, 1],
  y: [0, 1],
  xLabel: 'height (m)',
  yLabel: 'ΔU per kg (kJ/kg)',
  range: (s) => [[0, hmax(s)], [0, lin(hmax(s)) * 1.05]],
  curves: (s, c) => [[lin, { color: c.a, dash: [6, 5] }], [exact, { color: c.b }]],
  controls: [
    { title: 'Zoom' },
    { key: 'k', label: 'Height range (10^k km)', min: 0, max: 4, step: 0.25 },
    { readout: [
      ['Range', (s) => `${fixed(10 ** s.k, 2)} km`],
      ['mgh at the top', (s) => `${fixed(lin(hmax(s)), 3)} kJ/kg`],
      ['Exact at the top', (s) => `${fixed(exact(hmax(s)), 3)} kJ/kg`],
      ['mgh is too big by', (s) => `${fixed((lin(hmax(s)) / exact(hmax(s)) - 1) * 100, 2)}%`],
    ] },
  ],
  tex: () => `\\Delta U=\\dfrac{GMm\\,h}{R(R+h)}\\approx mgh\\quad(h\\ll R)`,
});
