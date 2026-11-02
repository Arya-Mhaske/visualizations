import { createTool } from '../../lib/tool.js';
import { box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';

const state = { a: 3, b: 2 };

createTool({
  state,
  label: 'A big square of side a plus b cut into an a-squared square, a b-squared square and two a-by-b rectangles.',
  draw(ctx, stage, c) {
    const u = (Math.min(stage.w, stage.h) - 70) / (state.a + state.b);
    const [x0, y0] = [(stage.w - u * (state.a + state.b)) / 2, 24];
    const { a, b } = state;
    box(ctx, c, x0, y0, u * a, u * a, c.fillA, `a² = ${a * a}`);
    box(ctx, c, x0 + u * a, y0, u * b, u * a, c.fillB, `ab = ${a * b}`);
    box(ctx, c, x0, y0 + u * a, u * a, u * b, c.fillB, `ab = ${a * b}`);
    box(ctx, c, x0 + u * a, y0 + u * a, u * b, u * b, c.fillC, `b² = ${b * b}`);
    label(ctx, `(a + b)² = ${(a + b) ** 2}`, stage.w / 2, y0 + u * (a + b) + 20, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Side lengths' },
    { key: 'a', label: 'a', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'b', min: 1, max: 6, step: 1 },
    { readout: [['a² + b²', (s) => String(s.a ** 2 + s.b ** 2)], ['Missing 2ab', (s) => String(2 * s.a * s.b)], ['(a + b)²', (s) => String((s.a + s.b) ** 2)]] },
  ],
  tex: (s) => `(${s.a}+${s.b})^2=${s.a}^2+2(${s.a})(${s.b})+${s.b}^2=${(s.a + s.b) ** 2}`,
});
