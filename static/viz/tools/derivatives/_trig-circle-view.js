// Shared by the sin and cos derivative tools: a point on the unit circle (top) and the graph being traced (bottom).
//   makeCircleTool('sin') or makeCircleTool('cos')
import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const lower = (stage) => ({ x: 0, y: stage.h * 0.5, w: stage.w, h: stage.h * 0.5 });
const rad = (d) => (d * Math.PI) / 180;

export function makeCircleTool(kind) {
  const state = { t: 50 };
  const isSin = kind === 'sin';
  const value = (t) => (isSin ? Math.sin(rad(t)) : Math.cos(rad(t)));
  const slope = (t) => (isSin ? Math.cos(rad(t)) : -Math.sin(rad(t)));
  createTool({
    state,
    label: isSin
      ? 'Top: a point moving round the unit circle at steady speed, with an arrow for its velocity, which points along the tangent. The arrow\'s vertical part is its upward speed, and it equals the cosine of the angle, the point\'s horizontal position. Bottom: the sine graph, which is the height of the point, with its tangent line. The tangent\'s slope is the point\'s vertical speed, cosine.'
      : 'Top: a point moving round the unit circle at steady speed, with an arrow for its velocity. The arrow\'s horizontal part is its sideways speed, and it equals minus the sine of the angle, minus the point\'s height. Bottom: the cosine graph, which is the horizontal position of the point, with its tangent line. Its slope is minus the sine.',
    setup: (stage, c) => createPlot(stage, { x: [0, 2 * Math.PI], y: [-1.6, 1.6], ticks: 'pi', c, box: lower, pad: 22 }),
    draw(ctx, stage, c, plot) {
      const R = Math.min(stage.w * 0.3, stage.h * 0.2);
      const O = [stage.w * 0.5, stage.h * 0.24];
      const P = [O[0] + R * Math.cos(rad(state.t)), O[1] - R * Math.sin(rad(state.t))];
      arc(ctx, ...O, R, 0, Math.PI * 2, { color: c.ink, width: 3 });
      line(ctx, O[0] - R * 1.3, O[1], O[0] + R * 1.3, O[1], { color: c.grid, width: 1 });
      line(ctx, O[0], O[1] - R * 1.3, O[0], O[1] + R * 1.3, { color: c.grid, width: 1 });
      line(ctx, ...O, ...P, { color: c.ink, width: 2 });
      // velocity: the tangent direction, (−sin t, cos t), drawn at a length of 0.6 R
      const v = [-Math.sin(rad(state.t)), Math.cos(rad(state.t))];
      const tip = [P[0] + v[0] * R * 0.7, P[1] - v[1] * R * 0.7];
      arrow(ctx, ...P, ...tip, { color: c.a, width: 4 });
      if (isSin) {
        arrow(ctx, ...P, P[0], P[1] - v[1] * R * 0.7, { color: c.b, width: 4 });
        line(ctx, P[0], P[1], O[0], P[1], { color: c.grid, width: 1, dash: [4, 4] });
        label(ctx, 'upward speed', P[0] + (v[1] > 0 ? 8 : -8), P[1] - v[1] * R * 0.35, c, { size: 10, color: c.b, align: v[1] > 0 ? 'left' : 'right', bounds: stage, patch: false });
      } else {
        arrow(ctx, ...P, P[0] + v[0] * R * 0.7, P[1], { color: c.b, width: 4 });
        line(ctx, P[0], P[1], P[0], O[1], { color: c.grid, width: 1, dash: [4, 4] });
        label(ctx, 'sideways speed', P[0] + v[0] * R * 0.35, P[1] + 14, c, { size: 10, color: c.b, bounds: stage, patch: false });
      }
      dot(ctx, ...P, 7, c.fillY, c.ink);
      plot.axes({ xLabel: 't', yLabel: '' });
      plot.fn(isSin ? Math.sin : Math.cos, { color: c.a, width: 4 });
      const t = rad(state.t);
      const m = slope(state.t);
      plot.segment(t - 1, value(state.t) - m, t + 1, value(state.t) + m, { color: c.b, width: 3 });
      plot.point(t, value(state.t), { fill: c.fillY, r: 8 });
    },
    controls: [
      { title: 'Move the point' },
      { key: 't', label: 'Angle, t', min: 0, max: 360, step: 1, format: (v) => `${v}°` },
      { readout: [
        [isSin ? 'Height, sin t' : 'Position across, cos t', (s) => fixed(value(s.t), 4)],
        [isSin ? 'Upward speed' : 'Sideways speed', (s) => fixed(slope(s.t), 4)],
        [isSin ? 'cos t' : '−sin t', (s) => ({ text: fixed(slope(s.t), 4), good: true })],
      ] },
    ],
    tex: (s) => (isSin ? `(\\sin t)'=\\cos t=${fixed(slope(s.t), 3)}` : `(\\cos t)'=-\\sin t=${fixed(slope(s.t), 3)}`),
  });
}
