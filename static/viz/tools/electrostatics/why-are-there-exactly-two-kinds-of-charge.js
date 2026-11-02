import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';

// Six rubbed objects. Each is "like glass" (+) or "like amber" (−). Every pair either attracts (unlike) or repels (like).
const ITEMS = [
  { name: 'Glass rod (silk)', s: 1 },
  { name: 'Silk cloth', s: -1 },
  { name: 'Amber (fur)', s: -1 },
  { name: 'Fur', s: 1 },
  { name: 'Ebonite (fur)', s: -1 },
  { name: 'Glass rod 2', s: 1 },
];
const state = { x: 0, y: 2, sort: false };
const order = (s) => (s.sort ? [...ITEMS.keys()].sort((a, b) => ITEMS[b].s - ITEMS[a].s || a - b) : [...ITEMS.keys()]);
const verdict = (i, j) => (ITEMS[i].s === ITEMS[j].s ? 'repel' : 'attract');

createTool({
  state,
  label: 'A six by six table showing whether each pair of rubbed objects attracts or repels. Repelling pairs are coral and attracting pairs are blue. In the table in its first order the colours look scattered. Sorted, the objects fall into two groups: inside a group every pair repels, between the groups every pair attracts.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const o = order(state);
    const m = Math.min(W, H) * 0.62;
    const [x0, y0, cell] = [W * 0.3, H * 0.2, m / 6];
    o.forEach((i, r) => {
      label(ctx, ITEMS[i].name, x0 - 6, y0 + r * cell + cell / 2, c, { size: 10, align: 'right', bounds: stage, patch: false });
      label(ctx, String(i + 1), x0 + r * cell + cell / 2, y0 - 10, c, { size: 11, bounds: stage, patch: false });
      o.forEach((j, k) => {
        if (i === j) { ctx.fillStyle = c.grid; } else ctx.fillStyle = verdict(i, j) === 'repel' ? c.fillA : c.fillB;
        ctx.fillRect(x0 + k * cell, y0 + r * cell, cell - 2, cell - 2);
        const pick = (i === state.x && j === state.y) || (i === state.y && j === state.x);
        if (pick) { ctx.strokeStyle = c.ink; ctx.lineWidth = 4; ctx.strokeRect(x0 + k * cell, y0 + r * cell, cell - 2, cell - 2); }
      });
    });
    label(ctx, 'coral = repel, blue = attract', W * 0.5, H * 0.93, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Test pairs' },
    { key: 'x', label: 'First object (1–6)', min: 0, max: 5, step: 1, format: (v) => `${v + 1}: ${ITEMS[v].name}` },
    { key: 'y', label: 'Second object (1–6)', min: 0, max: 5, step: 1, format: (v) => `${v + 1}: ${ITEMS[v].name}` },
    { key: 'sort', label: 'Sort the table into groups', toggle: true },
    { readout: [
      ['This pair', (s) => (s.x === s.y ? 'same object' : verdict(s.x, s.y))],
      ['Groups found', () => '2'],
    ] },
  ],
});
