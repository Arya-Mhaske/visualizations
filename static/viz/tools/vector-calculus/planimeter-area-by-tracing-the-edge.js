import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { SHAPES, polyArea, sweptFrom } from './_vector-calculus-math.js';
import { WINDOW, drawPoly, arrowAt } from './_vector-calculus-view.js';
import { line } from '../../lib/draw.js';

const state = { shape: 'l', u: 0.4, ox: 0, oy: 0 };
const pts = (s) => SHAPES[s.shape].pts;
const sweptNow = (s) => {
  const n = pts(s).length;
  const x = s.u * n;
  const k = Math.min(n, Math.floor(x));
  return sweptFrom(pts(s), [s.ox, s.oy], k, k >= n ? 0 : x - k);
};
const where = (s) => {
  const P = pts(s);
  const n = P.length;
  const x = Math.min(s.u, 0.999999) * n;
  const k = Math.floor(x);
  const [a, b] = [P[k], P[(k + 1) % n]];
  return [a[0] + (x - k) * (b[0] - a[0]), a[1] + (x - k) * (b[1] - a[1])];
};

const tool = createTool({
  state,
  label: 'A planimeter tracing a shape. Triangles are swept from a pivot to each bit of the edge. Counter-clockwise bits add area, clockwise bits subtract it, and the total at the end is the area of the shape.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const P = pts(state);
    const o = [state.ox, state.oy];
    plot.axes({ grid: false });
    drawPoly(ctx, plot, P, { fill: c.fillY, stroke: c.ink, width: 3 });
    // The fan swept from the pivot so far, edge by edge.
    const n = P.length;
    const x = state.u * n;
    const whole = Math.min(n, Math.floor(x));
    ctx.save();
    for (let k = 0; k <= whole && k < n; k++) {
      const frac = k === whole ? x - whole : 1;
      if (frac <= 0) continue;
      const [a, b] = [P[k], P[(k + 1) % n]];
      const e = [a[0] + frac * (b[0] - a[0]), a[1] + frac * (b[1] - a[1])];
      const sign = (a[0] - o[0]) * (e[1] - o[1]) - (a[1] - o[1]) * (e[0] - o[0]);
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = sign >= 0 ? c.c : c.a;
      ctx.beginPath();
      [o, a, e].forEach(([wx, wy], i) => (i ? ctx.lineTo(...plot.toPx(wx, wy)) : ctx.moveTo(...plot.toPx(wx, wy))));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    const here = where(state);
    line(ctx, ...plot.toPx(...o), ...plot.toPx(...here), { color: c.ink, width: 2 });
    plot.point(...o, { fill: c.ink, r: 6 });
    plot.point(...here, { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Trace the edge' },
    { key: 'shape', label: 'Shape', options: Object.entries(SHAPES).map(([k, v]) => [k, v.name]) },
    { key: 'u', label: 'Traced so far', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'ox', label: 'Pivot x', min: -4, max: 4, step: 0.5 },
    { key: 'oy', label: 'Pivot y', min: -4, max: 4, step: 0.5 },
    { readout: [
      ['Area read so far', (s) => fixed(sweptNow(s), 3)],
      ['Area of the shape', (s) => fixed(polyArea(pts(s)), 3)],
    ] },
  ],
  tex: (s) => `A = \\tfrac{1}{2}\\oint (x\\,dy - y\\,dx) = ${fixed(sweptNow(s), 3)}`,
});
