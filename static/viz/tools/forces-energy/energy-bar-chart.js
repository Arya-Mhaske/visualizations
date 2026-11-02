import { createTool } from '../../lib/tool.js';
import { bars, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { mo: 'ball', s: 0.3, loss: 0 };
const M = 1;
// V(s) in joules for s in [0, 1] along the motion; E is the total with no loss.
const MO = {
  ball: ['Ball thrown up', (s) => M * G * 20 * (1 - (2 * s - 1) ** 2), () => M * G * 20 + 0.0001 * 0, 'height'],
  pend: ['Pendulum', (s) => M * G * 2 * (1 - Math.cos((60 * (2 * s - 1) * Math.PI) / 180)), () => M * G * 2 * (1 - Math.cos(Math.PI / 3)), 'swing'],
  spring: ['Mass on a spring', (s) => 0.5 * 100 * (0.5 * (2 * s - 1)) ** 2, () => 0.5 * 100 * 0.25, 'stretch'],
};
const total = (s) => MO[s.mo][2]() * (1 - s.loss / 100 * (1 - Math.abs(2 * s.s - 1)) * 0.5);
const V = (s) => MO[s.mo][1](s.s);
const K = (s) => Math.max(0, total(s) - V(s));

createTool({
  state,
  label: 'Three bars for the kinetic energy, the potential energy and the total energy of an object at a chosen point in its motion.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, [['kinetic K', K(state), c.fillA, `${fixed(K(state), 1)} J`], ['potential V', V(state), c.fillB, `${fixed(V(state), 1)} J`], ['total E = K + V', total(state), c.fillC, `${fixed(total(state), 1)} J`]], { max: 220 });
  },
  controls: [
    { title: 'A motion' },
    { key: 'mo', label: 'Motion', options: Object.entries(MO).map(([k, v]) => [k, v[0]]) },
    { key: 's', label: 'Position along the motion', min: 0, max: 1, step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'loss', label: 'Friction or drag (% loss)', min: 0, max: 60, step: 5 },
    { readout: [
      ['K + V', (s) => `${fixed(K(s) + V(s), 1)} J`],
      ['Total energy', (s) => `${fixed(total(s), 1)} J`],
    ] },
  ],
  tex: (s) => `K+V=E=${fixed(total(s), 1)}\\ \\mathrm{J}`,
});
