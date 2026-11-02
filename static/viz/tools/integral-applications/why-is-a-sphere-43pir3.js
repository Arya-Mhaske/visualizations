import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_ia.js';

// Stack n discs of radius √(r² − x²) between x = −r and r. Their volumes (midpoint) add to ⁴⁄₃πr³ as n grows.
const state = { r: 2, n: 6 };
const disc = (x) => Math.PI * (state.r ** 2 - x * x);
const sum = (n) => { const h = (2 * state.r) / n; let s = 0; for (let i = 0; i < n; i++) s += disc(-state.r + (i + 0.5) * h) * h; return s; };
const exact = () => (4 / 3) * Math.PI * state.r ** 3;

createTool({
  state,
  label: 'A circle of radius r seen from the side with n flat discs stacked across it. The discs fill the sphere more closely as n grows.',
  setup: (stage, c) => createPlot(stage, { x: [-2.4, 2.4], y: [-2.4, 2.4], c }),
  draw(ctx, stage, c, plot) {
    const r = state.r;
    plot.setRange([-r * 1.25, r * 1.25], [-r * 1.25, r * 1.25]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const h = (2 * r) / state.n;
    for (let i = 0; i < state.n; i++) {
      const xm = -r + (i + 0.5) * h; const ry = Math.sqrt(r * r - xm * xm);
      const [x1, y1] = plot.toPx(xm - h / 2, ry); const [x2, y2] = plot.toPx(xm + h / 2, -ry);
      ctx.fillStyle = i % 2 ? c.fillA : c.fillB; ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
    plot.fn((x) => Math.sqrt(Math.max(0, r * r - x * x)), { color: c.ink, width: 3, domain: [-r, r] });
    plot.fn((x) => -Math.sqrt(Math.max(0, r * r - x * x)), { color: c.ink, width: 3, domain: [-r, r] });
  },
  controls: [
    { title: 'Stack the discs' },
    { key: 'r', label: 'Radius r', min: 1, max: 3, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'n', label: 'Number of discs n', min: 1, max: 60, step: 1 },
    { readout: [
      ['Sum of the discs', () => num(sum(state.n), 6)],
      ['⁴⁄₃ π r³', () => num(exact(), 6)],
      ['Error', () => `${num(((sum(state.n) - exact()) / exact()) * 100, 3)}%`],
    ] },
  ],
  tex: (s) => `V=\\int_{-r}^{r}\\pi(r^2-x^2)\\,dx=\\pi\\left(2r^3-\\tfrac{2r^3}{3}\\right)=\\tfrac43\\pi r^3`,
});
