import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { direction } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

const state = { theta: 40, r: 5, step: 1 };
const at = (s) => [s.r * Math.cos((s.theta * Math.PI) / 180), s.r * Math.sin((s.theta * Math.PI) / 180)];
const flat = (v) => Math.abs(v) < 1e-9;
// A step along the tangent: (dx, dy) = step · (−y, x) / r
const stepOf = (s) => { const [x, y] = at(s); return [(-y / s.r) * s.step, (x / s.r) * s.step]; };

createTool({
  state,
  label: 'A circle centred at the origin, the radius to a point P, and the tangent at P. A step along the tangent is drawn too. The radius and the tangent meet at a right angle, so the slope of the tangent is minus x over y, the negative reciprocal of the radius slope y over x.',
  setup: (stage, c) => createPlot(stage, { x: [-7, 7], y: [-7, 7], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const [x, y] = at(state);
    const [dx, dy] = stepOf(state);
    plot.axes();
    plot.fn((t) => Math.sqrt(state.r ** 2 - t * t), { color: c.grid, width: 3, domain: [-state.r, state.r] });
    plot.fn((t) => -Math.sqrt(state.r ** 2 - t * t), { color: c.grid, width: 3, domain: [-state.r, state.r] });
    plot.segment(0, 0, x, y, { color: c.a, width: 4 });
    direction(plot, x, y, -y / state.r, x / state.r, 3.2, { color: c.ink, width: 3 });
    plot.segment(x, y, x + dx, y + dy, { color: c.b, width: 6 });
    plot.segment(x + dx, y + dy, x + dx, y, { color: c.b, width: 3, dash: [4, 3] });
    plot.segment(x, y, x + dx, y, { color: c.b, width: 3, dash: [4, 3] });
    // right-angle corner at P
    const [px, py] = plot.toPx(x, y);
    const [ax, ay] = plot.toPx(x - (x / state.r) * 0.5, y - (y / state.r) * 0.5);
    const [bx, by] = plot.toPx(x + (-y / state.r) * 0.5, y + (x / state.r) * 0.5);
    const [qx, qy] = [ax + bx - px, ay + by - py];
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(qx, qy);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.restore();
    plot.point(x, y, { fill: c.fillY, r: 8 });
    plot.point(0, 0, { fill: c.ink, r: 4 });
  },
  controls: [
    { title: 'Radius and tangent' },
    { key: 'theta', label: 'Position on the circle', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { key: 'r', label: 'Radius', min: 2, max: 6, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'step', label: 'Step along the tangent', min: -2, max: 2, step: 0.1, format: (n) => fixed(n, 1) },
    { readout: [
      ['Radius slope y/x', (s) => (flat(at(s)[0]) ? 'vertical' : fixed(at(s)[1] / at(s)[0], 3))],
      ['Tangent slope', (s) => (flat(at(s)[1]) ? 'vertical' : fixed(-at(s)[0] / at(s)[1], 3))],
      ['Product of the two', (s) => (flat(at(s)[0]) || flat(at(s)[1]) ? 'vertical × horizontal' : { text: fixed((at(s)[1] / at(s)[0]) * (-at(s)[0] / at(s)[1]), 3), good: true })],
      ['x·dx + y·dy', (s) => ({ text: fixed(at(s)[0] * stepOf(s)[0] + at(s)[1] * stepOf(s)[1], 3), good: true })],
    ] },
  ],
  tex: (s) => {
    const [x, y] = at(s);
    const [dx, dy] = stepOf(s);
    return `x\\,dx+y\\,dy=${fixed(x, 2)}(${fixed(dx, 2)})+${fixed(y, 2)}(${fixed(dy, 2)})=0\\ \\Rightarrow\\ \\dfrac{dy}{dx}=-\\dfrac{x}{y}`;
  },
});
