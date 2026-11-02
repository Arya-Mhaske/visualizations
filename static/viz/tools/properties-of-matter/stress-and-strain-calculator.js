import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { F: 5000, A: 2, L: 2, dL: 1.5, dV: 0.01 };
const stress = (s) => s.F / (s.A * 1e-4);

plotTool({
  state,
  label: 'A straight line of stress against strain whose slope is the modulus, with a marker at the strain produced by the chosen extension.',
  x: [0, 0.002],
  y: [0, 2e8],
  xLabel: 'strain ΔL / L',
  yLabel: 'stress (Pa)',
  range: (s) => [[0, Math.max((s.dL / 1000 / s.L) * 1.4, 1e-6)], [0, stress(s) * 1.4]],
  curves: (s, c) => [[(e) => stress(s) * (e / (s.dL / 1000 / s.L)), { color: c.b }]],
  points: (s, c) => [[s.dL / 1000 / s.L, stress(s), c.a]],
  controls: [
    { title: 'Tensile, shear and volume' },
    { key: 'F', label: 'Force F (N)', min: 500, max: 20000, step: 500 },
    { key: 'A', label: 'Area A (cm²)', min: 0.5, max: 10, step: 0.5 },
    { key: 'L', label: 'Length or height L (m)', min: 0.5, max: 5, step: 0.5 },
    { key: 'dL', label: 'Extension or shear shift (mm)', min: 0.1, max: 5, step: 0.1 },
    { key: 'dV', label: 'Volume change under pressure (%)', min: 0.001, max: 0.1, step: 0.001 },
    { readout: [
      ['Stress F/A', (s) => `${sig(stress(s), 3)} Pa`],
      ['Tensile strain', (s) => sig(s.dL / 1000 / s.L, 3)],
      ['Y = stress/strain', (s) => `${sig(stress(s) / (s.dL / 1000 / s.L), 3)} Pa`],
      ['G (same numbers, shear)', (s) => `${sig(stress(s) / (s.dL / 1000 / s.L), 3)} Pa`],
      ['B = p / (ΔV/V)', (s) => `${sig(stress(s) / (s.dV / 100), 3)} Pa`],
    ] },
  ],
  tex: (s) => `Y=\\dfrac{F/A}{\\Delta L/L}=${sig(stress(s) / (s.dL / 1000 / s.L), 3)}\\ \\mathrm{Pa}`,
});
