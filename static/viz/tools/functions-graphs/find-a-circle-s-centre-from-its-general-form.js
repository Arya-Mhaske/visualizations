import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { generalCircle } from './_coordinate-plane-math.js';

const R = 10;
const state = { D: -4, E: 6, F: -12 };
const now = (s = state) => generalCircle(s.D, s.E, s.F);
const sgn = (v) => (v < 0 ? `-${fixed(-v, 2)}` : `+${fixed(v, 2)}`);

const tool = createTool({
  state,
  label: 'A coordinate plane showing the circle given by x squared plus y squared plus Dx plus Ey plus F equals zero. The centre is marked with a dot, and a radius is drawn to the right. If the radius squared is not positive, there is only a point or no circle at all, and the plane shows only the centre.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const g = now();
    const [cx, cy] = plot.toPx(g.h, g.k);
    const unit = Math.abs(plot.toPx(1, 0)[0] - plot.toPx(0, 0)[0]);
    if (g.kind === 'circle') {
      ctx.strokeStyle = c.a;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, g.r * unit, 0, Math.PI * 2);
      ctx.stroke();
      plot.segment(g.h, g.k, g.h + g.r, g.k, { color: c.ink, width: 3 });
      plot.text(`r = ${fixed(g.r, 2)}`, g.h + g.r / 2, g.k + 0.9, { size: 11 });
    }
    if (g.kind !== 'empty') plot.point(g.h, g.k, { fill: c.fillY, r: 8 });
    plot.text(g.kind === 'empty' ? 'no circle: r² < 0' : g.kind === 'point' ? 'just one point' : `(${fixed(g.h, 2)}, ${fixed(g.k, 2)})`, g.h, g.k - 1, { size: 11 });
  },
  controls: () => [
    { title: 'x² + y² + Dx + Ey + F = 0' },
    { key: 'D', label: 'D', min: -12, max: 12, step: 1 },
    { key: 'E', label: 'E', min: -12, max: 12, step: 1 },
    { key: 'F', label: 'F', min: -40, max: 20, step: 1 },
    { readout: [
      ['Add D²/4 and E²/4', (s) => `${fixed((s.D * s.D) / 4, 2)} and ${fixed((s.E * s.E) / 4, 2)}`],
      ['Centre (−D/2, −E/2)', (s) => `(${fixed(now(s).h, 2)}, ${fixed(now(s).k, 2)})`],
      ['r² = D²/4 + E²/4 − F', (s) => fixed(now(s).r2, 2)],
      ['So it is', (s) => (now(s).kind === 'circle' ? { text: `a circle, r = ${fixed(now(s).r, 2)}`, good: true } : { text: now(s).kind === 'point' ? 'a single point' : 'empty', good: false })],
    ] },
  ],
  tex: (s) => `\\left(x${sgn(s.D / 2)}\\right)^2+\\left(y${sgn(s.E / 2)}\\right)^2=${fixed(now(s).r2, 2)}`,
});

tool.update();
