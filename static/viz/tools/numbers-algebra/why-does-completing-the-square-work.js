import { createTool } from '../../lib/tool.js';
import { box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';

const state = { x: 4, b: 4 };

createTool({
  state,
  label: 'A square of side x with two strips of width b over two along its right and bottom sides, and a small dashed square missing from the corner. Adding it completes a larger square.',
  draw(ctx, stage, c) {
    const { x, b } = state;
    const u = (Math.min(stage.w, stage.h) - 80) / (x + b / 2);
    const [x0, y0] = [(stage.w - u * (x + b / 2)) / 2, 30];
    box(ctx, c, x0, y0, u * x, u * x, c.fillA, `x² = ${x * x}`);
    box(ctx, c, x0 + u * x, y0, u * (b / 2), u * x, c.fillB, '');
    box(ctx, c, x0, y0 + u * x, u * x, u * (b / 2), c.fillB, '');
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(x0 + u * x, y0 + u * x, u * (b / 2), u * (b / 2));
    ctx.restore();
    label(ctx, `missing (b/2)² = ${(b / 2) ** 2}`, stage.w / 2, y0 + u * (x + b / 2) + 20, c, { size: 13, bounds: stage, patch: false });
    label(ctx, `x² + bx = ${x * x + b * x}`, stage.w / 2, 16, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'x² + bx' },
    { key: 'x', label: 'x', min: 1, max: 8, step: 1 },
    { key: 'b', label: 'b', min: 2, max: 12, step: 2 },
    { readout: [['x² + bx', (s) => String(s.x ** 2 + s.b * s.x)], ['(x + b/2)²', (s) => String((s.x + s.b / 2) ** 2)], ['Difference', (s) => `${(s.b / 2) ** 2} = (b/2)²`]] },
  ],
  tex: (s) => `x^2+${s.b}x=(x+${s.b / 2})^2-${(s.b / 2) ** 2}`,
});
