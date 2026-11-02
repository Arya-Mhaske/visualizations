import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';

const state = { n: 8, flip: true };

createTool({
  state,
  label: 'A staircase of squares for one plus two up to n, and a second staircase in a different colour turned upside down, which together fill a rectangle n wide and n plus one tall.',
  draw(ctx, stage, c) {
    const { n } = state;
    const u = Math.min((stage.w - 40) / n, (stage.h - 80) / (n + 1));
    const [x0, y0] = [(stage.w - u * n) / 2, 24];
    for (let col = 0; col < n; col++) {
      for (let row = 0; row < n + 1; row++) {
        const inStair = row >= n - (col + 1);
        const fill = inStair ? c.fillA : state.flip ? c.fillB : c.paper;
        poly(ctx, [[x0 + col * u, y0 + row * u], [x0 + (col + 1) * u, y0 + row * u], [x0 + (col + 1) * u, y0 + (row + 1) * u], [x0 + col * u, y0 + (row + 1) * u]], { fill, stroke: c.ink, width: 1.5 });
      }
    }
    label(ctx, state.flip ? `2 × (1 + … + ${n}) = ${n} × ${n + 1} = ${n * (n + 1)}` : `1 + … + ${n} = ${(n * (n + 1)) / 2}`, stage.w / 2, stage.h - 16, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'The staircase' },
    { key: 'n', label: 'n', min: 2, max: 14, step: 1 },
    { key: 'flip', label: 'Add the upside-down copy', toggle: true },
    { readout: [['Rectangle n(n + 1)', (s) => String(s.n * (s.n + 1))], ['Sum n(n + 1)/2', (s) => String((s.n * (s.n + 1)) / 2)]] },
  ],
  tex: (s) => `1+2+\\cdots+${s.n}=\\dfrac{${s.n}(${s.n}+1)}{2}=${(s.n * (s.n + 1)) / 2}`,
});
