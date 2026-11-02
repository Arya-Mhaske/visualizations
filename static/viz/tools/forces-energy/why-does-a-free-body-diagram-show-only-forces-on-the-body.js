import { createTool } from '../../lib/tool.js';
import { vec, box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';

const FORCES = [
  ['Earth pulls block', 'block', 1, 'W'],
  ['Table pushes block', 'block', -1, 'N'],
  ['Block pushes table', 'table', 1, "N'"],
  ['Earth pulls table', 'table', 1, 'Wt'],
  ['Floor pushes table', 'table', -1, 'Nf'],
];
const SYS = { block: ['Block'], table: ['Table'], both: ['Block + table'] };
const state = { sys: 'block' };
const on = (f) => (state.sys === 'block' ? f[1] === 'block' : state.sys === 'table' ? f[1] === 'table' : ['Earth pulls block', 'Earth pulls table', 'Floor pushes table'].includes(f[0]));

createTool({
  state,
  label: 'A block on a table. Only the forces acting on the chosen system are drawn as arrows; forces between the block and table are internal when both are chosen.',
  draw(ctx, stage, c) {
    const cx = stage.w / 2;
    box(ctx, c, cx - 40, stage.h * 0.28, 80, 50, state.sys === 'table' ? c.paper : c.fillA, 'block');
    box(ctx, c, cx - 70, stage.h * 0.28 + 50, 140, 40, state.sys === 'block' ? c.paper : c.fillB, 'table');
    const mid = state.sys === 'table' ? stage.h * 0.28 + 70 : state.sys === 'block' ? stage.h * 0.28 + 25 : stage.h * 0.28 + 45;
    let n = 0;
    FORCES.forEach((f) => {
      if (!on(f)) return;
      const x = cx - 50 + n++ * 28;
      vec(ctx, c, x + 20, mid, 0, f[2] * 50, { color: f[2] > 0 ? c.a : c.c, text: f[3] });
    });
    label(ctx, `System: ${SYS[state.sys][0]}`, cx, 20, c, { size: 14, patch: false });
  },
  controls: [
    { title: 'Choose the system' },
    { key: 'sys', label: 'Body', options: Object.entries(SYS).map(([k, v]) => [k, v[0]]) },
    { readout: [
      ['Forces on it', () => FORCES.filter(on).map((f) => f[0]).join('; ')],
      ['Left out', () => FORCES.filter((f) => !on(f)).map((f) => f[0]).join('; ')],
    ] },
  ],
  tex: () => `\\sum \\vec F_{\\text{on the body}}=m\\vec a`,
});
