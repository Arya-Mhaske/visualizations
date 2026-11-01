import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { ROW, START, dipoleShift, hopRow } from './_intrinsic-extrinsic-semiconductors-math.js';

const state = { k: 3, dir: 1 };

const tool = createTool({
  state,
  label: 'A row of eleven silicon bonds, each holding a coral electron except one empty ring, the hole. A blue arrow shows the field. Each hop, the electron next to the hole steps into it, so the hole moves one place the other way. A green plus marks where the hole is now.',
  draw(ctx, stage, c) {
    const gap = (stage.w - 40) / (ROW - 1);
    const x = (j) => 20 + j * gap;
    const y = stage.h * 0.5;
    const { vacancy, moved } = hopRow(state.k, state.dir);
    line(ctx, x(0), y, x(ROW - 1), y, { color: c.grid, width: 3 });
    const mid = stage.w / 2;
    const fy = stage.h * 0.16;
    const sign = state.dir;
    arrow(ctx, mid - sign * 50, fy, mid + sign * 50, fy, { color: c.b, width: 5, head: 14 });
    label(ctx, 'electric field E', mid, fy - 16, c, { size: 11, bounds: stage, patch: false });
    for (let j = 0; j < ROW; j++) {
      if (j !== vacancy || moved[j]) dot(ctx, x(j) + (moved[j] ? -sign * gap : 0), y, 11, c.a, c.ink);
    }
    dot(ctx, x(vacancy), y, 13, c.paper, c.ink);
    label(ctx, '+', x(vacancy), y, c, { size: 16, color: c.c, patch: false });
    for (let j = 0; j < ROW; j++) {
      if (j === START && state.k > 0) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x(j), y, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    // The hole's path as one positive charge, below the row.
    const by = stage.h * 0.78;
    line(ctx, x(0), by, x(ROW - 1), by, { color: c.grid, width: 3 });
    dot(ctx, x(START), by, 7, c.paper, c.ink, 2);
    dot(ctx, x(vacancy), by, 11, c.c, c.ink);
    label(ctx, 'one + charge', x(vacancy), by + 24, c, { size: 11, bounds: stage, patch: false });
    if (state.k > 0) arrow(ctx, x(START), by - 20, x(vacancy), by - 20, { color: c.c, width: 4, head: 11 });
  },
  controls: () => [
    { title: 'Let the electrons hop' },
    { key: 'k', label: 'Hops so far', min: 0, max: 5, step: 1, format: (n) => String(n) },
    { key: 'dir', label: 'Field points', options: [[1, 'right →'], [-1, '← left']] },
    { readout: [
      ['Electrons moved', (s) => `${s.k}, each 1 place ${s.dir > 0 ? 'left' : 'right'}`],
      ['Hole moved', (s) => `${s.k} places ${s.dir > 0 ? 'right' : 'left'}`],
      ['Same as a charge of', (s) => `+e moved ${s.k} places`],
    ] },
  ],
  tex: (s) => `\\sum q\\,\\Delta x = ${s.k}\\times(-e)\\times(${s.dir > 0 ? '-' : '+'}d)=${dipoleShift(s.k, s.dir) >= 0 ? '+' : '-'}${s.k}\\,e\\,d`,
});

tool.update();
