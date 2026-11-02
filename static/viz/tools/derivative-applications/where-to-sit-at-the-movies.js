import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, dot } from '../../lib/draw.js';
import { num } from './_da.js';

// The screen's bottom edge is a metres and its top edge b metres above your eye level, x metres away.
// The angle it fills is θ = arctan(b/x) − arctan(a/x). Maximise: θ′(x) = 0 at x = √(ab).
const state = { a: 1.5, b: 5, x: 3 };
const th = (x, a = state.a, b = state.b) => Math.atan(b / x) - Math.atan(a / x);
const best = () => Math.sqrt(state.a * state.b);
const deg = (r) => (r * 180) / Math.PI;

createTool({
  state,
  label: 'Top: a side view of a cinema screen above eye level and the angle it fills from where you sit. Bottom: the angle against seat distance, with a maximum at the geometric mean of the two heights.',
  setup: (stage, c) => createPlot(stage, { x: [0, 15], y: [0, 60], c, box: (s) => ({ x: 0, y: s.h * 0.5, w: s.w, h: s.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const H = stage.h * 0.5;
    const X = 15; const Ymax = state.b + 1;
    const sc = Math.min((stage.w - 30) / X, (H - 20) / (Ymax + 1.5));
    const eyeY = H - 14 - 1.5 * sc;
    // screen on the left, viewer moves right: distance x from the screen
    const screenX = 16;
    const Q = (y) => [screenX, eyeY - y * sc];
    const ex = screenX + state.x * sc;
    line(ctx, ...Q(state.a), ...Q(state.b), { color: c.ink, width: 8 });
    line(ctx, ex, eyeY, ...Q(state.a), { color: c.b, width: 2 });
    line(ctx, ex, eyeY, ...Q(state.b), { color: c.b, width: 2 });
    line(ctx, screenX, eyeY, stage.w - 10, eyeY, { color: c.grid, width: 1.5, dash: [4, 4] });
    dot(ctx, ex, eyeY, 7, c.a, c.ink);
    ctx.fillStyle = c.fillB;
    ctx.beginPath(); ctx.moveTo(ex, eyeY); ctx.lineTo(...Q(state.a)); ctx.lineTo(...Q(state.b)); ctx.closePath(); ctx.fill();
    plot.setRange([0, 15], [0, Math.max(30, deg(th(best())) * 1.3)]);
    plot.axes({ xLabel: 'distance x (m)', yLabel: 'angle θ (°)' });
    plot.fn((x) => deg(th(Math.max(x, 0.05))), { color: c.ink, width: 3, domain: [0.05, 15] });
    plot.point(best(), deg(th(best())), { fill: c.c, r: 8 });
    plot.point(state.x, deg(th(state.x)), { fill: c.a });
  },
  controls: [
    { title: 'Choose a seat' },
    { key: 'a', label: 'Screen bottom above your eyes', min: 0.25, max: 3, step: 0.25, format: (v) => `${v} m` },
    { key: 'b', label: 'Screen top above your eyes', min: 3.5, max: 8, step: 0.25, format: (v) => `${v} m` },
    { key: 'x', label: 'Seat distance x', min: 0.5, max: 15, step: 0.25, format: (v) => `${v} m` },
    { readout: [
      ['Angle at your seat', () => `${num(deg(th(state.x)), 4)}°`],
      ['Best seat  x = √(ab)', () => `${num(best(), 4)} m`],
      ['Best angle', () => `${num(deg(th(best())), 4)}°`],
    ] },
  ],
  tex: (s) => `\\theta(x)=\\arctan\\frac{${s.b}}{x}-\\arctan\\frac{${s.a}}{x},\\quad \\theta'(x)=0\\Rightarrow x=\\sqrt{ab}`,
});
