import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { cell } from '../../lib/circuit.js';
import { sig, fixed } from '../../lib/format.js';
import { combine } from './_cells-emf-power-math.js';

const state = { mode: 'series', n: 3, E: 1.5, r: 0.5, R: 2 };
const group = (s) => combine(Array.from({ length: s.n }, () => ({ E: s.E, r: s.r })), s.mode);
const I = (s) => group(s).E / (group(s).r + s.R);

const tool = createTool({
  state,
  label: 'The chosen number of identical cells drawn joined in series, in a row, or in parallel, stacked, with a load resistor.',
  draw(ctx, stage, c) {
    const n = state.n;
    const mid = stage.h / 2;
    if (state.mode === 'series') {
      const x0 = 18;
      const x1 = stage.w - 18;
      const step = (x1 - x0) / n;
      line(ctx, x0, mid, x1, mid, { color: c.ink });
      for (let i = 0; i < n; i++) {
        const a = x0 + step * i + step * 0.2;
        const b = x0 + step * i + step * 0.8;
        ctx.fillStyle = c.paper;
        ctx.fillRect(a - 2, mid - 20, b - a + 4, 40);
        cell(ctx, a, mid, b, mid, { color: c.a });
      }
      label(ctx, `${n} cells in a chain: + joins to −`, stage.w / 2, mid + 50, c, { color: c.ink });
    } else {
      const top = 40;
      const bottom = stage.h - 70;
      const gap = (bottom - top) / Math.max(1, n - 1);
      const xl = stage.w * 0.3;
      const xr = stage.w * 0.7;
      line(ctx, xl, top, xl, top + gap * (n - 1), { color: c.ink });
      line(ctx, xr, top, xr, top + gap * (n - 1), { color: c.ink });
      for (let i = 0; i < n; i++) {
        const y = n === 1 ? (top + bottom) / 2 : top + gap * i;
        ctx.fillStyle = c.paper;
        ctx.fillRect(xl + (xr - xl) * 0.25, y - 16, (xr - xl) * 0.5, 32);
        cell(ctx, xl, y, xr, y, { color: c.a });
      }
      label(ctx, `${n} cells side by side: all + on one rail`, stage.w / 2, stage.h - 24, c, { color: c.ink });
    }
  },
  controls: () => [
    { title: 'Join identical cells' },
    { key: 'mode', label: 'Joined', options: [['series', 'Series'], ['parallel', 'Parallel']] },
    { key: 'n', label: 'Number of cells', min: 1, max: 6, step: 1 },
    { key: 'E', label: 'Each cell, ε', min: 1, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} V` },
    { key: 'r', label: 'Each cell, r', min: 0.1, max: 2, step: 0.1, format: (n) => `${fixed(n, 1)} Ω` },
    { key: 'R', label: 'Load, R', min: 0.1, max: 10, step: 0.1, format: (n) => `${fixed(n, 1)} Ω` },
    { readout: [
      ['Combined emf', (s) => `${sig(group(s).E, 3)} V`],
      ['Combined r', (s) => `${sig(group(s).r, 3)} Ω`],
      ['Current in the load', (s) => `${sig(I(s), 3)} A`],
    ] },
  ],
  tex: (s) => (s.mode === 'series'
    ? `\\varepsilon_{eq}=n\\varepsilon=${sig(group(s).E, 3)}\\ \\text{V}\\quad r_{eq}=nr=${sig(group(s).r, 3)}\\ \\Omega`
    : `\\varepsilon_{eq}=\\varepsilon=${sig(group(s).E, 3)}\\ \\text{V}\\quad r_{eq}=\\dfrac{r}{n}=${sig(group(s).r, 3)}\\ \\Omega`),
});
tool.update();
