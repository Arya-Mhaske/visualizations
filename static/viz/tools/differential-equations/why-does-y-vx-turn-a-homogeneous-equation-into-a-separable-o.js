import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { slopeTicks } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';
import { HOMOGENEOUS } from './_separable-math.js';

// In a homogeneous equation the slope depends only on v = y/x. So along any ray y = vx every slope mark is the same,
// and zooming in or out leaves the picture unchanged. That is why v = y/x makes the equation separable.
const EQS = Object.fromEntries(Object.entries(HOMOGENEOUS).filter(([, e]) => e.F));
const state = { eq: 'a', v: 0.5, zoom: 4 };
const pts = (s) => [1, 2, 3].map((i) => { const x = (s.zoom * i) / (4 * Math.max(1, Math.abs(s.v))); return [x, s.v * x]; });
const slopeAtPoint = (s, [x, y]) => EQS[s.eq].f(x, y);
const show = (m) => (Number.isFinite(m) ? fixed(m, 3) : 'vertical');

createTool({
  state,
  label: 'A direction field of short slope marks for a homogeneous equation. A straight ray through the origin, y equals v x, is drawn with three marked points on it. The slope at all three points is the same, because the slope depends only on y over x. Changing the zoom does not change the pattern.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-4, 4], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    const z = state.zoom;
    plot.setRange([-z, z], [-z, z]);
    plot.axes({ grid: false });
    slopeTicks(ctx, plot, EQS[state.eq].f, [-z, z], [-z, z], 14, 14, { len: 11, color: c.grid, width: 2 });
    const far = z * 1.5;
    plot.segment(-far, -far * state.v, far, far * state.v, { color: c.b, width: 3, dash: [6, 5] });
    for (const [x, y] of pts(state)) {
      const m = slopeAtPoint(state, [x, y]);
      const [px, py] = plot.toPx(x, y);
      const [qx, qy] = plot.toPx(x + 1, y + (Number.isFinite(m) ? m : 1e6));
      const n = Math.hypot(qx - px, qy - py) || 1;
      ctx.save();
      ctx.strokeStyle = c.a;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(px - ((qx - px) / n) * 16, py - ((qy - py) / n) * 16);
      ctx.lineTo(px + ((qx - px) / n) * 16, py + ((qy - py) / n) * 16);
      ctx.stroke();
      ctx.restore();
      plot.point(x, y, { fill: c.fillY, r: 5 });
    }
  },
  controls: [
    { title: 'Look along a ray' },
    { key: 'eq', label: 'Equation', options: Object.entries(EQS).map(([key, v]) => [key, v.name]) },
    { key: 'v', label: 'Ray y = vx, v', min: -1.5, max: 1.5, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'zoom', label: 'Window half-width', min: 2, max: 8, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Slope at point 1', (s) => show(slopeAtPoint(s, pts(s)[0]))],
      ['Slope at point 2', (s) => show(slopeAtPoint(s, pts(s)[1]))],
      ['Slope at point 3', (s) => show(slopeAtPoint(s, pts(s)[2]))],
      ['F(v) from v alone', (s) => ({ text: Math.abs(s.v) < 1e-9 && s.eq !== 'a' ? 'vertical' : show(EQS[s.eq].F(s.v)), good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{dy}{dx}=F\\!\\left(\\dfrac{y}{x}\\right)=F(${fixed(s.v, 1)})\\quad\\text{on the whole ray } y=${fixed(s.v, 1)}x`,
});
