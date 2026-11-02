import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_da.js';

// Fixed volume V = 1000 cm³, so h = V/(π r²). Metal only: S = 2πr² + 2πrh is least when h = 2r.
// Add a cost per cm of seam (two rims of length 2πr and one side seam of length h) and the best can is taller.
// Prices are made up for illustration.
const V = 1000;
const METAL = 0.05; // ₹ per cm²
const state = { seam: 0.4, r: 5.4 };
const h = (r) => V / (Math.PI * r * r);
const metal = (r) => METAL * (2 * Math.PI * r * r + 2 * Math.PI * r * h(r));
const total = (r) => metal(r) + state.seam * (4 * Math.PI * r + h(r));
const argmin = (f) => { let b = 2; for (let r = 2; r <= 10; r += 0.005) if (f(r) < f(b)) b = r; return b; };

createTool({
  state,
  label: 'Top: the shape of a can that holds one litre, at the chosen radius. Bottom: cost against radius for metal alone (blue) and for metal plus seams (coral), with the cheapest radius marked on each.',
  setup: (stage, c) => createPlot(stage, { x: [2, 10], y: [0, 25], c, box: (s) => ({ x: 0, y: s.h * 0.45, w: s.w, h: s.h * 0.55 }) }),
  draw(ctx, stage, c, plot) {
    const H = stage.h * 0.45;
    const sc = (H - 14) / 20;
    const w = Math.min(2 * state.r * sc, stage.w * 0.9);
    const ht = Math.min(h(state.r) * sc, H - 10);
    ctx.fillStyle = c.fillB; ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
    ctx.fillRect(stage.w / 2 - w / 2, H / 2 - ht / 2, w, ht);
    ctx.strokeRect(stage.w / 2 - w / 2, H / 2 - ht / 2, w, ht);
    const m = argmin(metal); const t = argmin(total);
    const top = Math.max(metal(2), total(2), 10) * 0.55;
    plot.setRange([2, 10], [0, Math.min(40, top * 1.3)]);
    plot.axes({ xLabel: 'radius r (cm)', yLabel: 'cost (₹)' });
    plot.fn(metal, { color: c.b, width: 3, dash: [6, 4] });
    plot.fn(total, { color: c.a, width: 3 });
    plot.point(m, metal(m), { fill: c.b, r: 7 });
    plot.point(t, total(t), { fill: c.a, r: 7 });
    plot.segment(state.r, 0, state.r, 100, { color: c.ink, width: 1.5, dash: [4, 4] });
  },
  controls: [
    { title: 'Price the seams' },
    { key: 'seam', label: 'Seam cost per cm', min: 0, max: 1, step: 0.05, format: (v) => `₹${v.toFixed(2)}` },
    { key: 'r', label: 'Radius of the can', min: 2, max: 10, step: 0.1, format: (v) => `${v.toFixed(1)} cm` },
    { readout: [
      ['This can: height h', () => `${num(h(state.r), 3)} cm (h / r = ${num(h(state.r) / state.r, 3)})`],
      ['Least metal at', () => `r = ${num(argmin(metal), 3)}, h/r = ${num(h(argmin(metal)) / argmin(metal), 3)}`],
      ['Least total cost at', () => `r = ${num(argmin(total), 3)}, h/r = ${num(h(argmin(total)) / argmin(total), 3)}`],
    ] },
  ],
  tex: () => 'S=2\\pi r^2+2\\pi r h\\ \\text{is least when } h=2r',
});
