import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { v: 60, S: 16, a: 5 };
const CL = (a) => 2 * Math.PI * ((a * Math.PI) / 180);
const lift = (s, a = s.a) => 0.5 * 1.2 * s.v * s.v * s.S * CL(a);

plotTool({
  state,
  label: 'Lift on a flat wing against its angle of attack, a straight line through the origin. A flat wing has the same curvature top and bottom, yet it lifts when it is tilted.',
  x: [0, 12],
  y: [0, 30],
  xLabel: 'angle of attack (°)',
  yLabel: 'lift (kN)',
  range: (s) => [[0, 12], [0, lift(s, 12) / 1000 * 1.1 + 0.1]],
  curves: (s, c) => [[(a) => lift(s, a) / 1000, { color: c.b }]],
  points: (s, c) => [[s.a, lift(s) / 1000, c.a]],
  controls: [
    { title: 'A flat wing' },
    { key: 'v', label: 'Airspeed (m/s)', min: 20, max: 100, step: 5 },
    { key: 'S', label: 'Wing area (m²)', min: 5, max: 30, step: 1 },
    { key: 'a', label: 'Angle of attack (°)', min: 0, max: 12, step: 0.5 },
    { readout: [
      ['Lift', (s) => `${sig(lift(s) / 1000, 3)} kN`],
      ['Lift at 0°', () => '0: flat wing, equal curvature'],
      ['Air is turned', () => 'downward: Newton\'s third law'],
    ] },
  ],
  tex: (s) => `L=\\tfrac12\\rho v^2S\\,C_L,\\quad C_L\\approx2\\pi\\alpha`,
});
