import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { circleGap, circlePoint } from './_coordinate-plane-math.js';

const R = 12;
const state = { h: 1, k: -1, r: 4, mode: 'on', angle: 40, px: 4, py: 3 };
const centre = (s = state) => [s.h, s.k];
const rad = (d) => (d * Math.PI) / 180;
const point = (s = state) => (s.mode === 'on' ? circlePoint(centre(s), s.r, rad(s.angle)) : [s.px, s.py]);
const gap = (s = state) => circleGap(point(s), centre(s), s.r);

function verdict(s) {
  const g = gap(s);
  if (Math.abs(g) < 0.05) return { text: 'on the circle', good: true };
  return g < 0 ? 'inside' : 'outside';
}

const tool = createTool({
  state,
  label: 'A coordinate plane with a circle of radius r around a centre (h, k). A point P can be dragged. A right triangle joins the centre to P, with legs x minus h and y minus k, and the hypotenuse is the distance from the centre. When P is on the circle, the hypotenuse equals r, so the squares of the legs add to r squared.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const [h, k] = centre();
    const [x, y] = point();
    const [cx, cy] = plot.toPx(h, k);
    const unit = Math.abs(plot.toPx(1, 0)[0] - plot.toPx(0, 0)[0]);
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, state.r * unit, 0, Math.PI * 2);
    ctx.stroke();
    plot.segment(h, k, x, k, { color: c.b, width: 3 });
    plot.segment(x, k, x, y, { color: c.c, width: 3 });
    plot.segment(h, k, x, y, { color: c.ink, width: 3 });
    plot.text(`x − h = ${fixed(x - h, 1)}`, (h + x) / 2, k + (y > k ? -0.8 : 0.8), { size: 11 });
    plot.text(`y − k = ${fixed(y - k, 1)}`, x + (x > h ? 1.6 : -1.6), (k + y) / 2, { size: 11 });
    plot.point(h, k, { fill: c.fillY, r: 7 });
    plot.point(x, y, { fill: Math.abs(gap()) < 0.05 ? c.c : c.fillA, r: 9 });
  },
  controls: () => [
    { title: 'The circle' },
    { key: 'r', label: 'Radius, r', min: 1, max: 7, step: 1 },
    { key: 'h', label: 'Centre, h', min: -4, max: 4, step: 1 },
    { key: 'k', label: 'Centre, k', min: -4, max: 4, step: 1 },
    { title: 'The point P' },
    { key: 'mode', label: 'P moves', options: [['on', 'Round the circle'], ['free', 'Anywhere']] },
    { key: 'angle', label: 'Angle round the circle', min: 0, max: 359, step: 1, format: (n) => `${n}°` },
    { text: 'Drag P, or use the arrow keys when it is focused.' },
    { readout: [
      ['(x − h)² + (y − k)²', (s) => fixed((point(s)[0] - s.h) ** 2 + (point(s)[1] - s.k) ** 2, 2)],
      ['r²', (s) => String(s.r * s.r)],
      ['So P is', verdict],
    ] },
  ],
  tex: (s) => `(x-h)^2+(y-k)^2=(${fixed(point(s)[0] - s.h, 1)})^2+(${fixed(point(s)[1] - s.k, 1)})^2=${fixed((point(s)[0] - s.h) ** 2 + (point(s)[1] - s.k) ** 2, 2)}\\ \\ (r^2=${s.r * s.r})`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(...point()),
  move(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    if (state.mode === 'on') state.angle = ((Math.round((Math.atan2(y - state.k, x - state.h) * 180) / Math.PI) % 360) + 360) % 360;
    else { state.px = Math.max(-R + 1, Math.min(R - 1, Math.round(x * 2) / 2)); state.py = Math.max(-R + 1, Math.min(R - 1, Math.round(y * 2) / 2)); }
  },
  get nudge() {
    return state.mode === 'on' ? (direction) => { state.angle = (state.angle + direction * 5 + 360) % 360; } : undefined;
  },
  get keyStep() { return Math.abs(tool.extra.toPx(0.5, 0)[0] - tool.extra.toPx(0, 0)[0]); },
}], { onChange: () => tool.update(), radius: 28 });
tool.update();
