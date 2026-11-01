import { createTool } from '../../lib/tool.js';
import { numberLine } from '../../lib/numline.js';
import { label, line } from '../../lib/draw.js';
import { symbolAfter } from './_inequalities-math.js';

const state = { a: 1, b: 3, k: -2 };
const R = 12;
const say = (n) => String(n).replace('-', '−');

createTool({
  state,
  label: 'Two number lines. The top line has two points a and b with a to the left of b. The bottom line shows both points after multiplying by k. Lines join each point to its new position. Multiplying by a positive number keeps a on the left of b. Multiplying by a negative number swaps their order, and the two joining lines cross.',
  draw(ctx, stage, c) {
    const top = numberLine(ctx, stage, c, { lo: -R, hi: R, y: stage.h * 0.25, step: 4 });
    const low = numberLine(ctx, stage, c, { lo: -R, hi: R, y: stage.h * 0.72, step: 4 });
    top.axis();
    low.axis();
    const [ka, kb] = [state.a * state.k, state.b * state.k];
    line(ctx, top.px(state.a), top.y, low.px(ka), low.y, { color: c.a, width: 3, dash: [5, 4] });
    line(ctx, top.px(state.b), top.y, low.px(kb), low.y, { color: c.b, width: 3, dash: [5, 4] });
    top.dot(state.a, { fill: c.a });
    top.dot(state.b, { fill: c.b });
    low.dot(ka, { fill: c.a });
    low.dot(kb, { fill: c.b });
    top.text('a', state.a, -18, { color: c.a, size: 12 });
    top.text('b', state.b, -18, { color: c.b, size: 12 });
    low.text('k·a', ka, -18, { color: c.a, size: 12 });
    low.text('k·b', kb, -18, { color: c.b, size: 12 });
    label(ctx, `before: a ${state.a < state.b ? '<' : '>'} b`, 10, stage.h * 0.06, c, { size: 11, align: 'left', bounds: stage, patch: false });
    label(ctx, `after ×${say(state.k)}: ka ${symbolAfter(state.k) === '=' ? '=' : ka < kb ? '<' : '>'} kb`, 10, stage.h * 0.53, c, { size: 11, align: 'left', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Multiply two points' },
    { key: 'a', label: 'Point a', min: -4, max: 3, step: 1, format: say },
    { key: 'b', label: 'Point b (right of a)', min: -3, max: 4, step: 1, format: say },
    { key: 'k', label: 'Multiply by k', min: -3, max: 3, step: 0.5, format: say },
    { readout: [
      ['Before', (s) => `${say(s.a)} < ${say(s.b)}`],
      ['After', (s) => `${say(s.a * s.k)} ${s.k === 0 ? '=' : s.a * s.k < s.b * s.k ? '<' : '>'} ${say(s.b * s.k)}`],
      ['Order', (s) => ({ text: s.k > 0 ? 'kept' : s.k < 0 ? 'flipped' : 'lost (both 0)', good: s.k > 0 })],
    ] },
  ],
  onChange(s) {
    if (s.b <= s.a) s.b = s.a + 1;
  },
  tex: (s) => `${say(s.a)}<${say(s.b)}\\ \\Rightarrow\\ ${say(s.k)}\\cdot${say(s.a)}\\ ${s.k === 0 ? '=' : s.a * s.k < s.b * s.k ? '<' : '>'}\\ ${say(s.k)}\\cdot${say(s.b)}`,
});
