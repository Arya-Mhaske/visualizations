import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';

// Integrate the function 1. Over a disk, ∬ 1 dA counts little squares (area). Over a ball, ∭ 1 dV counts little cubes (volume).
// Counting layers of cubes shows how the 3D count is a stack of 2D counts.
const state = { R: 2.5, n: 3 };
export function counts(R, n) {
  const d = 1 / n;
  const span = Math.ceil(R * n);
  let squares = 0;
  const layers = [];
  for (let k = -span; k < span; k++) {
    const z = (k + 0.5) * d;
    let layer = 0;
    for (let i = -span; i < span; i++) for (let j = -span; j < span; j++) {
      const x = (i + 0.5) * d;
      const y = (j + 0.5) * d;
      if (x * x + y * y + z * z <= R * R) layer++;
      if (k === 0 && x * x + y * y <= R * R) squares++;
    }
    layers.push(layer);
  }
  return { squares, layers, cubes: layers.reduce((a, b) => a + b, 0), d };
}

createTool({
  state,
  label: 'On the left, a disk with all the small squares whose centres lie inside it. On the right, a bar chart where each bar is the number of small cubes in one horizontal layer of a ball of the same radius. Adding the squares gives the area, and adding the cubes in all the layers gives the volume.',
  draw(ctx, stage, c) {
    const o = counts(state.R, state.n);
    const d = o.d;
    const span = Math.ceil(state.R * state.n);
    const half = stage.w / 2;
    const k = Math.min((half - 16) / (2 * state.R), (stage.h * 0.55) / (2 * state.R));
    const [cx, cy] = [half / 2, stage.h * 0.36];
    for (let i = -span; i < span; i++) for (let j = -span; j < span; j++) {
      const x = (i + 0.5) * d;
      const y = (j + 0.5) * d;
      if (x * x + y * y <= state.R * state.R) {
        ctx.fillStyle = c.fillB;
        ctx.fillRect(cx + i * d * k, cy + j * d * k, d * k, d * k);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cx + i * d * k, cy + j * d * k, d * k, d * k);
      }
    }
    const top = Math.max(...o.layers, 1);
    const bh = (stage.h * 0.6) / o.layers.length;
    o.layers.forEach((n, i) => {
      ctx.fillStyle = c.fillC;
      ctx.fillRect(half + 10, stage.h * 0.06 + i * bh, (n / top) * (half - 24), Math.max(bh - 1, 1));
    });
    label(ctx, `${o.squares} squares × ${(d * d).toFixed(3)} = ${(o.squares * d * d).toFixed(3)}`, half / 2, stage.h * 0.76, c, { size: 11, bounds: { w: half, h: stage.h } });
    label(ctx, `${o.cubes} cubes × ${(d ** 3).toFixed(4)} = ${(o.cubes * d ** 3).toFixed(3)}`, half + half / 2, stage.h * 0.76, c, { size: 11, bounds: stage });
    label(ctx, `circle area π r² = ${(Math.PI * state.R ** 2).toFixed(3)}`, half / 2, stage.h * 0.88, c, { size: 11, bounds: { w: half, h: stage.h } });
    label(ctx, `ball volume = ${((4 / 3) * Math.PI * state.R ** 3).toFixed(3)}`, half + half / 2, stage.h * 0.88, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Count the pieces' },
    { key: 'R', label: 'Radius R', min: 1, max: 3.5, step: 0.25, format: (v) => v.toFixed(2) },
    { key: 'n', label: 'Pieces per unit length', min: 1, max: 5, step: 1 },
    { readout: [
      ['Area ∬ 1 dA', (s) => { const o = counts(s.R, s.n); return (o.squares * o.d * o.d).toFixed(4); }],
      ['Volume ∭ 1 dV', (s) => { const o = counts(s.R, s.n); return (o.cubes * o.d ** 3).toFixed(4); }],
    ] },
  ],
  tex: () => '\\text{Area}=\\iint_D 1\\,dA,\\qquad \\text{Volume}=\\iiint_E 1\\,dV',
});
