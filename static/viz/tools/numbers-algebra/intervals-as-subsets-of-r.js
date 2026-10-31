import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { inInterval } from './_sets-math.js';

const state = { a: -2, b: 3, closedA: true, closedB: false, toMinus: false, toPlus: false, x: 3 };
const SPAN = 6;
const notation = (s) => `${s.toMinus ? '(−∞' : `${s.closedA ? '[' : '('}${s.a}`}, ${s.toPlus ? '∞)' : `${s.b}${s.closedB ? ']' : ')'}`}`;
function builder(s) {
  const parts = [];
  if (!s.toMinus) parts.push(`${s.a} ${s.closedA ? '≤' : '<'}`);
  parts.push('x');
  if (!s.toPlus) parts.push(`${s.closedB ? '≤' : '<'} ${s.b}`);
  return `{x : ${parts.join(' ')}}`;
}

createTool({
  state,
  label: 'A number line with an interval marked. A filled end is included and a hollow end is not. A test point shows whether it lies in the interval.',
  draw(ctx, stage, c) {
    const y = stage.h * 0.5;
    const toPx = (v) => stage.w / 2 + (v / SPAN) * (stage.w / 2 - 20);
    arrow(ctx, 8, y, stage.w - 8, y, { color: c.ink, width: 2 });
    arrow(ctx, stage.w - 8, y, 8, y, { color: c.ink, width: 2 });
    for (let v = -SPAN; v <= SPAN; v++) {
      line(ctx, toPx(v), y - 6, toPx(v), y + 6, { color: c.ink, width: 2 });
      if (stage.w > 420 || v % 2 === 0) label(ctx, String(v).replace('-', '−'), toPx(v), y + 20, c, { size: 11 });
    }
    const left = state.toMinus ? 12 : toPx(state.a);
    const right = state.toPlus ? stage.w - 12 : toPx(state.b);
    if (left < right) line(ctx, left, y, right, y, { color: c.b, width: 8 });
    if (!state.toMinus) dot(ctx, left, y, 8, state.closedA ? c.b : c.paper, c.ink);
    if (!state.toPlus) dot(ctx, right, y, 8, state.closedB ? c.b : c.paper, c.ink);
    const inside = inInterval(state.x, state);
    dot(ctx, toPx(state.x), y - 44, 8, c.a, c.ink);
    line(ctx, toPx(state.x), y - 36, toPx(state.x), y - 8, { color: c.a, width: 2, dash: [4, 4] });
    label(ctx, `x = ${state.x}: ${inside ? 'in' : 'out'}`, toPx(state.x), y - 64, c, { size: 12, bounds: stage });
    label(ctx, notation(state), stage.w / 2, stage.h * 0.82, c, { size: 18, bounds: stage });
  },
  controls: [
    { title: 'Build an interval' },
    { key: 'a', label: 'Left end, a', min: -6, max: 5 },
    { key: 'b', label: 'Right end, b', min: -5, max: 6 },
    { row: [
      { key: 'closedA', label: 'Include a', toggle: true },
      { key: 'closedB', label: 'Include b', toggle: true },
    ] },
    { row: [
      { key: 'toMinus', label: 'From −∞', toggle: true },
      { key: 'toPlus', label: 'To ∞', toggle: true },
    ] },
    { key: 'x', label: 'Test point, x', min: -6, max: 6, step: 0.5, format: (v) => fixed(v, 1) },
    { readout: [
      ['Interval', (s) => notation(s)],
      ['As a set', (s) => builder(s)],
      ['Valid?', (s) => ({ text: s.toMinus || s.toPlus || s.a < s.b ? 'yes' : 'needs a < b', good: s.toMinus || s.toPlus || s.a < s.b })],
      ['Is x in it?', (s) => (inInterval(s.x, s) ? 'yes' : 'no')],
    ] },
  ],
  tex: (s) => {
    const rule = builder(s).slice(5, -1).replace(/≤/g, '\\le').replace(/−/g, '-');
    return `${notation(s).replace('−∞', '-\\infty').replace('∞', '\\infty')} = \\{x : ${rule}\\}`;
  },
});
