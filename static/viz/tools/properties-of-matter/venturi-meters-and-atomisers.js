import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { A1: 20, A2: 5, dP: 5 };
const Q = (s, dP = s.dP) => {
  const [A1, A2] = [s.A1 * 1e-4, s.A2 * 1e-4];
  return A1 * A2 * Math.sqrt((2 * dP * 1000) / (1000 * (A1 * A1 - A2 * A2)));
};

plotTool({
  state,
  label: 'Flow rate through a Venturi meter against the pressure drop between the wide part and the neck: a square root curve, with a marker at the chosen drop.',
  x: [0, 20],
  y: [0, 10],
  xLabel: 'pressure drop ΔP (kPa)',
  yLabel: 'flow rate Q (L/s)',
  range: (s) => [[0, 20], [0, Q(s, 20) * 1000 * 1.05]],
  curves: (s, c) => [[(dP) => Q(s, dP) * 1000, { color: c.b }]],
  points: (s, c) => [[s.dP, Q(s) * 1000, c.a]],
  controls: [
    { title: 'The meter (water)' },
    { key: 'A1', label: 'Pipe area A₁ (cm²)', min: 10, max: 40, step: 1 },
    { key: 'A2', label: 'Neck area A₂ (cm²)', min: 2, max: 9, step: 1 },
    { key: 'dP', label: 'Pressure drop (kPa)', min: 0.5, max: 20, step: 0.5 },
    { readout: [['Flow rate', (s) => `${sig(Q(s) * 1000, 3)} L/s`], ['Speed in the pipe', (s) => `${sig(Q(s) / (s.A1 * 1e-4), 3)} m/s`], ['Speed at the neck', (s) => `${sig(Q(s) / (s.A2 * 1e-4), 3)} m/s`]] },
  ],
  tex: (s) => `Q=A_1A_2\\sqrt{\\dfrac{2\\Delta P}{\\rho(A_1^2-A_2^2)}}=${sig(Q(s) * 1000, 3)}\\ \\mathrm{L/s}`,
});
