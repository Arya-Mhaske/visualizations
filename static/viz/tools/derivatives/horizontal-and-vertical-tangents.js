import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const CURVES = {
  cubic: { name: 'x = t² − 3t, y = t³ − 3t', x: (t) => t * t - 3 * t, y: (t) => t ** 3 - 3 * t, dx: (t) => 2 * t - 3, dy: (t) => 3 * t * t - 3, t0: -2, t1: 2.8, view: [[-3, 11], [-4, 15]], horiz: [-1, 1], vert: [1.5], tex: 'x=t^2-3t,\\ y=t^3-3t' },
  ellipse: { name: 'x = 3cos t, y = 2sin t', x: (t) => 3 * Math.cos(t), y: (t) => 2 * Math.sin(t), dx: (t) => -3 * Math.sin(t), dy: (t) => 2 * Math.cos(t), t0: 0, t1: 2 * Math.PI, view: [[-4.5, 4.5], [-3.5, 3.5]], horiz: [Math.PI / 2, 3 * Math.PI / 2], vert: [0, Math.PI, 2 * Math.PI], tex: 'x=3\\cos t,\\ y=2\\sin t' },
};
const state = { curve: 'cubic', t: 0.5, jump: 0 };
const C = () => CURVES[state.curve];
const kind = (s) => {
  const k = CURVES[s.curve];
  const v = Math.hypot(k.dx(s.t), k.dy(s.t));
  if (Math.abs(k.dy(s.t)) < 0.02 * v) return 'horizontal';
  if (Math.abs(k.dx(s.t)) < 0.02 * v) return 'vertical';
  return 'sloping';
};

createTool({
  state,
  label: 'A parametric curve with a moving point and its tangent line. Dots mark every place where the tangent is horizontal, because dy by dt is zero, in coral, and every place where it is vertical, because dx by dt is zero, in blue. A button jumps the point to each special place in turn.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 11], y: [-4, 15], c }),
  draw(ctx, stage, c, plot) {
    const k = C();
    plot.setRange(k.view[0], k.view[1]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    for (let i = 1; i <= 240; i++) {
      const a = k.t0 + ((k.t1 - k.t0) * (i - 1)) / 240;
      const b = k.t0 + ((k.t1 - k.t0) * i) / 240;
      plot.segment(k.x(a), k.y(a), k.x(b), k.y(b), { color: c.ink, width: 3 });
    }
    k.horiz.forEach((t) => plot.point(k.x(t), k.y(t), { fill: c.a, r: 6 }));
    k.vert.forEach((t) => plot.point(k.x(t), k.y(t), { fill: c.b, r: 6 }));
    const { t } = state;
    const len = 3;
    const v = Math.hypot(k.dx(t), k.dy(t)) || 1;
    plot.segment(k.x(t) - (k.dx(t) / v) * len, k.y(t) - (k.dy(t) / v) * len, k.x(t) + (k.dx(t) / v) * len, k.y(t) + (k.dy(t) / v) * len, { color: kind(state) === 'horizontal' ? c.a : kind(state) === 'vertical' ? c.b : c.c, width: 4 });
    plot.point(k.x(t), k.y(t), { fill: c.fillY, r: 8 });
  },
  controls: (tool) => [
    { title: 'Scrub the time' },
    { key: 'curve', label: 'Curve', options: Object.entries(CURVES).map(([k, v]) => [k, v.name]) },
    { key: 't', label: 'Time t', min: -2, max: 6.3, step: 0.05, format: (v) => fixed(v, 2) },
    { button: 'Jump to the next special point', onClick: () => {
      const k = C();
      const list = [...k.horiz, ...k.vert].sort((p, q) => p - q);
      const next = list.find((v) => v > state.t + 1e-6) ?? list[0];
      state.t = next;
      tool.update();
    } },
    { readout: [
      ['dx/dt', (s) => fixed(C().dx(s.t), 3)],
      ['dy/dt', (s) => fixed(C().dy(s.t), 3)],
      ['Tangent is', (s) => ({ text: kind(s), good: kind(s) !== 'sloping' })],
    ] },
  ],
  tex: () => `${C().tex}`,
  onChange: (s) => {
    const k = CURVES[s.curve];
    if (s.t < k.t0) s.t = k.t0;
    if (s.t > k.t1) s.t = k.t1;
  },
});
