import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { a: 2, b: 3 };
const TOP = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const NAMED = [1, 2, 3, 5, 10, 20, 30, 50, 100];

function scale(ctx, c, stage, y, shift, from, to, ticks, named, showLabels = true) {
  const x = (v) => 16 + ((stage.w - 32) * (shift + Math.log10(v))) / 2;
  line(ctx, x(from), y, x(to), y, { color: c.ink, width: 3 });
  for (const v of ticks) {
    line(ctx, x(v), y, x(v), y + (named.includes(v) ? 12 : 7), { color: c.ink, width: 2 });
    if (named.includes(v) && showLabels) label(ctx, `${v}`, x(v), y + 24, c, { size: 10, bounds: stage, patch: false });
  }
  return x;
}

createTool({
  state,
  label: 'Two slide-rule scales whose tick marks are spaced by the logarithm of the number. The top scale is fixed. The lower scale slides so its 1 sits under a. Where b sits on the lower scale, the number above it on the fixed scale is a times b. Two coloured bars show that the lengths add.',
  draw(ctx, stage, c) {
    const { a, b } = state;
    const H = stage.h;
    const X = (v) => 16 + ((stage.w - 32) * Math.log10(v)) / 2;
    label(ctx, 'Fixed scale: numbers 1 to 100', 16, H * 0.07, c, { size: 11, align: 'left', patch: false });
    scale(ctx, c, stage, H * 0.13, 0, 1, 100, TOP, NAMED);
    ctx.fillStyle = c.fillA;
    ctx.fillRect(X(1), H * 0.4, X(a) - X(1), 24);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(X(a), H * 0.4, X(a * b) - X(a), 24);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(X(1), H * 0.4, X(a) - X(1), 24);
    ctx.strokeRect(X(a), H * 0.4, X(a * b) - X(a), 24);
    label(ctx, 'log a', (X(1) + X(a)) / 2, H * 0.4 + 12, c, { size: 10, patch: false });
    label(ctx, 'log b', (X(a) + X(a * b)) / 2, H * 0.4 + 12, c, { size: 10, patch: false });
    label(ctx, 'Sliding scale: its 1 sits under a', 16, H * 0.58, c, { size: 11, align: 'left', patch: false });
    scale(ctx, c, stage, H * 0.64, Math.log10(a), 1, 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 5, 10]);
    line(ctx, X(a * b), H * 0.13, X(a * b), H * 0.64, { color: c.c, width: 3, dash: [6, 4] });
    ctx.fillStyle = c.fillY;
    ctx.fillRect(X(a * b) - 5, H * 0.64 - 6, 10, 12);
    label(ctx, `${fixed(a, 1)} × ${fixed(b, 1)} = ${fixed(a * b, 2)}`, stage.w / 2, H * 0.92, c, { size: 14, bounds: stage });
  },
  controls: [
    { title: 'Slide to multiply' },
    { key: 'a', label: 'First number, a', min: 1, max: 10, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'b', label: 'Second number, b', min: 1, max: 10, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['log a', (s) => fixed(Math.log10(s.a), 4)],
      ['log b', (s) => fixed(Math.log10(s.b), 4)],
      ['Sum of lengths', (s) => fixed(Math.log10(s.a) + Math.log10(s.b), 4)],
      ['10 to the sum', (s) => fixed(10 ** (Math.log10(s.a) + Math.log10(s.b)), 3)],
    ] },
  ],
  tex: (s) => `\\log(${fixed(s.a, 1)})+\\log(${fixed(s.b, 1)})=${fixed(Math.log10(s.a), 4)}+${fixed(Math.log10(s.b), 4)}=${fixed(Math.log10(s.a * s.b), 4)}=\\log(${fixed(s.a * s.b, 2)})`,
});
