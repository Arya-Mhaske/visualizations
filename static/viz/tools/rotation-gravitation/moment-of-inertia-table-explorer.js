import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const T = { ring: ['Ring, about its axis', 1], disc: ['Disc or solid cylinder', 1 / 2], hollow: ['Hollow sphere', 2 / 3], sphere: ['Solid sphere', 2 / 5], rodc: ['Rod, about its centre (R = L)', 1 / 12], rode: ['Rod, about one end (R = L)', 1 / 3] };
const state = { b: 'disc', M: 2, R: 0.5 };

barTool({
  state,
  label: 'Bars of the moment of inertia of six standard bodies of the same mass and size, with the chosen body highlighted.',
  rows: (s, c) => Object.entries(T).map(([k, [name, f]]) => [name.split(',')[0], f * s.M * s.R * s.R, k === s.b ? c.a : c.fillB, `${fixed(f * s.M * s.R * s.R, 4)}`]),
  max: (s) => s.M * s.R * s.R,
  left: 0.36,
  controls: [
    { title: 'Pick a body' },
    { key: 'b', label: 'Body and axis', options: Object.entries(T).map(([k, v]) => [k, v[0]]) },
    { key: 'M', label: 'Mass M (kg)', min: 0.5, max: 5, step: 0.5 },
    { key: 'R', label: 'Radius or length R (m)', min: 0.1, max: 1, step: 0.1 },
    { readout: [
      ['Formula', (s) => `I = ${fixed(T[s.b][1], 4)} M R²`],
      ['I', (s) => `${fixed(T[s.b][1] * s.M * s.R * s.R, 4)} kg m²`],
    ] },
  ],
  tex: (s) => `I=${fixed(T[s.b][1], 4)}\\,MR^2=${fixed(T[s.b][1] * s.M * s.R * s.R, 4)}\\ \\mathrm{kg\\,m^2}`,
});
