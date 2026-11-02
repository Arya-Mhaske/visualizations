import { createTool } from '../../lib/tool.js';
import { box, bars } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';

const state = { a: 3, b: 2 };
const parts = (s) => [['a³', s.a ** 3, 1], ['3a²b', 3 * s.a * s.a * s.b, 3], ['3ab²', 3 * s.a * s.b * s.b, 3], ['b³', s.b ** 3, 1]];

createTool({
  state,
  label: 'Top: the square of side a plus b cut into a squared, two rectangles ab and b squared. Bottom: bars for the four kinds of block in the cube, which add up to the cube of a plus b.',
  draw(ctx, stage, c) {
    const u = Math.min(stage.w * 0.5, stage.h * 0.4) / (state.a + state.b);
    const [x0, y0] = [(stage.w - u * (state.a + state.b)) / 2, 12];
    box(ctx, c, x0, y0, u * state.a, u * state.a, c.fillA, 'a²');
    box(ctx, c, x0 + u * state.a, y0, u * state.b, u * state.a, c.fillB, 'ab');
    box(ctx, c, x0, y0 + u * state.a, u * state.a, u * state.b, c.fillB, 'ab');
    box(ctx, c, x0 + u * state.a, y0 + u * state.a, u * state.b, u * state.b, c.fillC, 'b²');
    label(ctx, '(a + b)² = a² + 2ab + b²', stage.w / 2, y0 + u * (state.a + state.b) + 14, c, { size: 11, bounds: stage, patch: false });
    ctx.save();
    ctx.translate(0, stage.h * 0.56);
    bars(ctx, { w: stage.w, h: stage.h * 0.44 }, c, parts(state).map(([n, v, k], i) => [`${k} × ${n}`.replace('1 × ', ''), v, [c.fillA, c.fillB, c.fillB, c.fillC][i], String(v)]), { max: (state.a + state.b) ** 3, top: 4, gap: 5, left: 0.3 });
    ctx.restore();
  },
  controls: [
    { title: 'Sides of the cube' },
    { key: 'a', label: 'a', min: 1, max: 5, step: 1 },
    { key: 'b', label: 'b', min: 1, max: 5, step: 1 },
    { readout: [
      ['Sum of the pieces', (s) => String(parts(s).reduce((t, p) => t + p[1], 0))],
      ['(a + b)³', (s) => String((s.a + s.b) ** 3)],
      ['Blocks', () => '1 + 3 + 3 + 1 = 8'],
    ] },
  ],
  tex: (s) => `(${s.a}+${s.b})^3=${parts(s).map((p) => p[1]).join('+')}=${(s.a + s.b) ** 3}`,
});
