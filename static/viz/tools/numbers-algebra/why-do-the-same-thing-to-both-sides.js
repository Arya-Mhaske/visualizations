import { createTool } from '../../lib/tool.js';
import { line, poly, label } from '../../lib/draw.js';
import { BALANCE, solution, sides } from './_linear-equations-math.js';

const state = { eq: 'a', ...BALANCE.a, star: solution(BALANCE.a), msg: 'Level: both pans weigh the same.' };
let tool;
const eqText = (s) => `${s.a ? `${s.a === 1 ? '' : s.a}x` : ''}${s.a && s.b ? ' + ' : ''}${s.b || (!s.a ? '0' : '')} = ${s.c ? `${s.c === 1 ? '' : s.c}x` : ''}${s.c && s.d ? ' + ' : ''}${s.d || (!s.c ? '0' : '')}`;
const level = (s) => sides(s, s.star);
const done = (s) => s.a === 1 && s.c === 0;

function pan(ctx, c, cx, y, blocks, ones) {
  poly(ctx, [[cx - 34, y], [cx + 34, y], [cx + 24, y + 10], [cx - 24, y + 10]], { fill: c.fillB, stroke: c.ink, width: 2 });
  for (let i = 0; i < blocks; i++) {
    const bx = cx - 32 + (i % 3) * 22;
    const by = y - 22 - Math.floor(i / 3) * 22;
    poly(ctx, [[bx, by], [bx + 20, by], [bx + 20, by + 20], [bx, by + 20]], { fill: c.a, stroke: c.ink, width: 2 });
    label(ctx, 'x', bx + 10, by + 10, c, { size: 11, patch: false });
  }
  const rows = Math.ceil(blocks / 3);
  for (let i = 0; i < ones; i++) {
    const bx = cx - 30 + (i % 6) * 10;
    const by = y - 26 - rows * 22 - Math.floor(i / 6) * 10;
    poly(ctx, [[bx, by], [bx + 8, by], [bx + 8, by + 8], [bx, by + 8]], { fill: c.c, stroke: c.ink, width: 1 });
  }
}

tool = createTool({
  state,
  label: 'A balance with blocks marked x and small unit weights on each pan. When equal things are removed from both pans the beam stays level. If something is removed from one pan only, the beam tips.',
  draw(ctx, stage, c) {
    const { L, R } = level(state);
    const t = Math.max(-1, Math.min(1, (L - R) / Math.max(L, R, 1))) * 0.5;
    const [cx, cy, A] = [stage.w / 2, stage.h * 0.5, stage.w * 0.34];
    const [yl, yr] = [cy + t * A * 0.5, cy - t * A * 0.5];
    line(ctx, cx - A, yl, cx + A, yr, { color: c.ink, width: 5 });
    poly(ctx, [[cx - 10, stage.h * 0.9], [cx + 10, stage.h * 0.9], [cx, cy]], { fill: c.ink, stroke: c.ink });
    line(ctx, cx - A, yl, cx - A, yl + 36, { color: c.ink, width: 2 });
    line(ctx, cx + A, yr, cx + A, yr + 36, { color: c.ink, width: 2 });
    pan(ctx, c, cx - A, yl + 36, state.a, state.b);
    pan(ctx, c, cx + A, yr + 36, state.c, state.d);
    label(ctx, eqText(state), stage.w / 2, 18, c, { size: 18, bounds: stage, patch: false });
    label(ctx, L === R ? 'level' : 'tips!', stage.w / 2, stage.h - 12, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Do the same to both sides' },
    { key: 'eq', label: 'Equation', options: [['a', '2x+3 = x+7'], ['b', '3x+2 = x+8'], ['c', '4x = 2x+10']] },
    { row: [
      { button: 'Remove x from both', onClick: () => act(() => state.a >= 1 && state.c >= 1 && (state.a--, state.c--)) },
      { button: 'Remove 1 from both', onClick: () => act(() => state.b >= 1 && state.d >= 1 && (state.b--, state.d--)) },
    ] },
    { row: [
      { button: 'Halve both sides', onClick: () => act(() => [state.a, state.b, state.c, state.d].every((v) => v % 2 === 0) && ([state.a, state.b, state.c, state.d] = [state.a / 2, state.b / 2, state.c / 2, state.d / 2])) },
      { button: 'Cheat: add 1 to left only', ghost: true, onClick: () => act(() => state.b++) },
    ] },
    { readout: [
      ['Left pan', () => String(level(state).L)],
      ['Right pan', () => String(level(state).R)],
      ['Solved?', () => ({ text: done(state) ? `x = ${state.d}` : 'not yet', good: done(state) })],
    ] },
  ],
  tex: (s) => eqText(s).replace(/ = /, '=').replace(/\+/g, '+'),
  onChange: (s) => {
    if (s.eq !== s.last) {
      Object.assign(s, BALANCE[s.eq], { star: solution(BALANCE[s.eq]), last: s.eq });
    }
    tool?.ui.refresh();
  },
});
state.last = state.eq;
function act(fn) {
  fn();
  tool.update();
}
