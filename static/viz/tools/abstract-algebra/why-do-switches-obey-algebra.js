import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// A closed switch is 1, an open one is 0. Two switches in series let current through only if both are closed: A AND B (A·B).
// Two switches in parallel let current through if either is closed: A OR B (A + B).
const state = { A: true, B: false };
const lit = (s) => ({ series: s.A && s.B, parallel: s.A || s.B });

function switchAt(ctx, c, x, y, closed, name) {
  line(ctx, x - 22, y, x - 12, y, { color: c.ink });
  line(ctx, x + 12, y, x + 22, y, { color: c.ink });
  dot(ctx, x - 12, y, 3.5, c.ink);
  dot(ctx, x + 12, y, 3.5, c.ink);
  if (closed) line(ctx, x - 12, y, x + 12, y, { color: c.a, width: 4 });
  else line(ctx, x - 12, y, x + 8, y - 15, { color: c.ink, width: 3 });
  label(ctx, name, x, y + 20, c, { size: 12, patch: false });
}
function lamp(ctx, c, x, y, on) {
  dot(ctx, x, y, 16, on ? c.fillY : c.paper, c.ink);
  line(ctx, x - 9, y - 9, x + 9, y + 9, { color: c.ink, width: 2 });
  line(ctx, x - 9, y + 9, x + 9, y - 9, { color: c.ink, width: 2 });
  if (on) for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; line(ctx, x + Math.cos(a) * 22, y + Math.sin(a) * 22, x + Math.cos(a) * 30, y + Math.sin(a) * 30, { color: c.a, width: 3 }); }
}
function cell(ctx, c, x, y) {
  line(ctx, x, y - 12, x, y + 12, { color: c.ink, width: 4 });
  line(ctx, x + 8, y - 6, x + 8, y + 6, { color: c.ink, width: 4 });
}

createTool({
  state,
  label: 'Two circuits, each with a cell, two switches and a lamp. In the top circuit the switches are in series, in the bottom one they are in parallel. Open switches have a gap. The lamp lights when current can complete a loop.',
  draw(ctx, stage, c) {
    const w = stage.w;
    const l = lit(state);
    const [x0, x1] = [26, w - 40];
    // series
    let y = stage.h * 0.2;
    const yb = y + stage.h * 0.2;
    line(ctx, x0, y, x0, yb, { color: c.ink });
    line(ctx, x1, y, x1, yb, { color: c.ink });
    line(ctx, x0, yb, x1, yb, { color: c.ink });
    line(ctx, x0, y, w * 0.35 - 22, y, { color: c.ink });
    switchAt(ctx, c, w * 0.35, y, state.A, 'A');
    line(ctx, w * 0.35 + 22, y, w * 0.6 - 22, y, { color: c.ink });
    switchAt(ctx, c, w * 0.6, y, state.B, 'B');
    line(ctx, w * 0.6 + 22, y, x1, y, { color: c.ink });
    lamp(ctx, c, x1, (y + yb) / 2, l.series);
    cell(ctx, c, x0, (y + yb) / 2);
    label(ctx, 'series: A AND B', w / 2, stage.h * 0.06, c, { size: 12 });
    // parallel
    y = stage.h * 0.62;
    const yTop = y;
    const yBot = y + stage.h * 0.14;
    const yRet = yBot + stage.h * 0.14;
    line(ctx, x0, yTop + (yBot - yTop) / 2, x0, yRet, { color: c.ink });
    line(ctx, x0, yTop + (yBot - yTop) / 2, w * 0.25, yTop + (yBot - yTop) / 2, { color: c.ink });
    line(ctx, w * 0.25, yTop, w * 0.25, yBot, { color: c.ink });
    line(ctx, w * 0.25, yTop, w * 0.5 - 22, yTop, { color: c.ink });
    line(ctx, w * 0.25, yBot, w * 0.5 - 22, yBot, { color: c.ink });
    switchAt(ctx, c, w * 0.5, yTop, state.A, 'A');
    switchAt(ctx, c, w * 0.5, yBot, state.B, 'B');
    line(ctx, w * 0.5 + 22, yTop, w * 0.75, yTop, { color: c.ink });
    line(ctx, w * 0.5 + 22, yBot, w * 0.75, yBot, { color: c.ink });
    line(ctx, w * 0.75, yTop, w * 0.75, yBot, { color: c.ink });
    line(ctx, w * 0.75, yTop + (yBot - yTop) / 2, x1, yTop + (yBot - yTop) / 2, { color: c.ink });
    line(ctx, x1, yTop + (yBot - yTop) / 2, x1, yRet, { color: c.ink });
    line(ctx, x0, yRet, x1, yRet, { color: c.ink });
    lamp(ctx, c, x1, (yTop + yRet) / 2 + 6, l.parallel);
    cell(ctx, c, x0, (yTop + yRet) / 2 + 6);
    label(ctx, 'parallel: A OR B', w / 2, yTop - 24, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Flip the switches' },
    { key: 'A', label: 'Switch A closed', toggle: true },
    { key: 'B', label: 'Switch B closed', toggle: true },
    { readout: [
      ['A, B', (s) => `${s.A ? 1 : 0}, ${s.B ? 1 : 0}`],
      ['Series lamp = A · B', (s) => ({ text: lit(s).series ? 'on (1)' : 'off (0)', good: lit(s).series })],
      ['Parallel lamp = A + B', (s) => ({ text: lit(s).parallel ? 'on (1)' : 'off (0)', good: lit(s).parallel })],
    ] },
  ],
  tex: (s) => `${s.A ? 1 : 0}\\cdot ${s.B ? 1 : 0}=${lit(s).series ? 1 : 0},\\qquad ${s.A ? 1 : 0}+${s.B ? 1 : 0}=${lit(s).parallel ? 1 : 0}`,
});
