import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const MAT = { steel: ['Steel', 2.0e11], copper: ['Copper', 1.2e11], brass: ['Brass', 0.9e11] };
const state = { m: 'steel', L: 2, d: 0.5 };
const A = (s) => (Math.PI * (s.d / 2000) ** 2);
const slope = (s) => (A(s) * MAT[s.m][1]) / s.L; // N per m
const ext = (s, M) => (M * G) / slope(s) * 1000; // mm

plotTool({
  state,
  label: 'Load against extension for a wire: five measured points on a straight line through the origin. The slope of the line gives Young\'s modulus.',
  x: [0, 1],
  y: [0, 50],
  xLabel: 'extension (mm)',
  yLabel: 'load (N)',
  range: (s) => [[0, ext(s, 5) * 1.15], [0, 5 * G * 1.1]],
  curves: (s, c) => [[(x) => (x * slope(s)) / 1000, { color: c.b }]],
  points: (s, c) => [1, 2, 3, 4, 5].map((M) => [ext(s, M), M * G, c.a]),
  controls: [
    { title: 'The experiment' },
    { key: 'm', label: 'Wire', options: Object.entries(MAT).map(([k, v]) => [k, v[0]]) },
    { key: 'L', label: 'Length L (m)', min: 1, max: 4, step: 0.5 },
    { key: 'd', label: 'Diameter (mm)', min: 0.3, max: 1, step: 0.1 },
    { readout: [
      ['Slope', (s) => `${sig(slope(s) / 1000, 3)} N/mm`],
      ['Y = slope × L / A', (s) => `${sig((slope(s) * s.L) / A(s), 3)} Pa`],
      ['Extension at 5 kg', (s) => `${sig(ext(s, 5), 3)} mm`],
    ] },
  ],
  tex: (s) => `Y=\\dfrac{FL}{A\\,\\Delta L}=${sig((slope(s) * s.L) / A(s), 3)}\\ \\mathrm{Pa}`,
});
