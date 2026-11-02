import { createTool } from '../../lib/tool.js';
import { vec, box } from '../../lib/quick.js';

const ITEMS = [
  ['W', 'Weight (Earth on box)', true, 0, 1],
  ['N', 'Normal (floor on box)', true, 0, -1],
  ['P', 'Push (hand on box)', true, 1, 0],
  ['f', 'Friction (floor on box)', true, -1, 0],
  ['ma', '"ma" (the effect, not a force)', false, 1, 0],
  ['Nb', 'Box pushes the floor (acts on the floor)', false, 0, 1],
  ['v', 'Velocity (not a force)', false, 1, 0],
];
const state = Object.fromEntries(ITEMS.map(([k]) => [k, k === 'W' || k === 'N']));
const on = () => ITEMS.filter(([k]) => state[k]);

createTool({
  state,
  label: 'A box on a rough floor with arrows for each force that is switched on. Wrong choices are flagged.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h * 0.5];
    box(ctx, c, cx - 40, cy - 30, 80, 60, c.fillA, 'box');
    on().forEach(([k, , ok, dx, dy], i) => vec(ctx, c, cx + (dx ? dx * 40 : (i % 2 ? 14 : -14)), cy + dy * -30 * -1, dx * 60, dy * 60, { color: ok ? c.c : c.a, text: k }));
  },
  controls: [
    { title: 'Switch on the forces' },
    ...ITEMS.map(([k, name]) => ({ key: k, label: name, toggle: true })),
    { readout: [
      ['Missing', () => ITEMS.filter(([k, , ok]) => ok && !state[k]).map(([k]) => k).join(', ') || 'none'],
      ['Wrong', () => ITEMS.filter(([k, , ok]) => !ok && state[k]).map(([k]) => k).join(', ') || 'none'],
      ['Complete?', () => { const good = ITEMS.every(([k, , ok]) => state[k] === ok); return { text: good ? 'yes' : 'not yet', good }; }],
    ] },
  ],
  tex: () => `P=f,\\qquad N=W\\quad(\\text{constant velocity})`,
});
