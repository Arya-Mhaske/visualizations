import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { F: 25, L: 2, I: 1 };
const W = (s) => s.F * s.L;
const w = (s) => Math.sqrt((2 * W(s)) / s.I);

barTool({
  state,
  label: 'Two equal bars for the work done in pulling the cord and the kinetic energy of the flywheel, and a bar for its final angular speed.',
  rows: (s, c) => [['work F·L', W(s), c.fillA, `${fixed(W(s), 1)} J`], ['KE ½Iω²', 0.5 * s.I * w(s) ** 2, c.fillB, `${fixed(0.5 * s.I * w(s) ** 2, 1)} J`], ['ω', w(s), c.fillC, `${fixed(w(s), 2)} rad/s`]],
  max: 100,
  controls: [
    { title: 'Pull the cord' },
    { key: 'F', label: 'Pull F (N)', min: 5, max: 50, step: 5 },
    { key: 'L', label: 'Cord pulled L (m)', min: 0.5, max: 4, step: 0.5 },
    { key: 'I', label: 'Moment of inertia I (kg m²)', min: 0.25, max: 4, step: 0.25 },
    { readout: [['Final speed', (s) => `${fixed(w(s), 2)} rad/s`], ['Equal?', () => ({ text: 'work = KE', good: true })]] },
  ],
  tex: (s) => `FL=\\tfrac12I\\omega^2\\ \\Rightarrow\\ \\omega=\\sqrt{\\dfrac{2FL}{I}}=${fixed(w(s), 2)}\\ \\mathrm{rad/s}`,
});
