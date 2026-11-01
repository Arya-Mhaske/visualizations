import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad } from './_right-triangle-math.js';
import { normalise, pointAt, turns } from './_unit-circle-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { total: 400, opposite: false };
const tan = (t) => {
  const [x, y] = pointAt(t);
  return Math.abs(x) < 1e-9 ? NaN : y / x;
};
const show = (v) => (Number.isNaN(v) ? 'undefined' : fixed(v, 4));

createTool({
  state,
  label: 'The unit circle with a point that can wind round it many times, forwards or backwards. Angles that differ by whole turns land on the same point, so sine and cosine repeat every 360 degrees. An optional opposite point shows that a half turn gives the same tangent, so the tangent repeats every 180 degrees.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.5);
    drawFrame(ctx, f, c, { ticks: false });
    const t = normalise(state.total);
    const [x, y] = pointAt(t);
    const P = f.px([x, y]);
    // one dot for every full turn made, so the winding is visible
    const n = turns(state.total);
    arc(ctx, f.cx, f.cy, f.k * 0.35, 0, -rad(t), { color: c.a, width: 4 });
    for (let i = 0; i < Math.min(Math.abs(n), 6); i++) arc(ctx, f.cx, f.cy, f.k * (0.45 + 0.07 * i), 0, Math.PI * 2 * Math.sign(n), { color: c.grid, width: 2 });
    if (state.opposite) {
      const Q = f.px([-x, -y]);
      line(ctx, f.cx - (P[0] - f.cx) * 1.4, f.cy - (P[1] - f.cy) * 1.4, f.cx + (P[0] - f.cx) * 1.4, f.cy + (P[1] - f.cy) * 1.4, { color: c.b, width: 3, dash: [6, 5] });
      dot(ctx, ...Q, 8, c.fillB, c.ink);
    }
    line(ctx, f.cx, f.cy, ...P, { color: c.a, width: 4 });
    dot(ctx, ...P, 9, c.a, c.ink);
    label(ctx, `${state.total}° = ${Math.abs(n)} turn${Math.abs(n) === 1 ? '' : 's'} + ${fixed(t, 0)}°`, stage.w / 2, 14, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Wind round the circle' },
    { key: 'total', label: 'Angle turned, θ', min: -720, max: 720, step: 5, format: (n) => `${n}°` },
    { key: 'opposite', label: 'Show the opposite point', toggle: true },
    { readout: [
      ['Lands where an angle of', (s) => `${fixed(normalise(s.total), 0)}° lands`],
      ['sin θ, sin(θ + 360°)', (s) => `${fixed(pointAt(s.total)[1], 4)}, ${fixed(pointAt(s.total + 360)[1], 4)}`],
      ['cos θ, cos(θ + 360°)', (s) => `${fixed(pointAt(s.total)[0], 4)}, ${fixed(pointAt(s.total + 360)[0], 4)}`],
      ['tan θ, tan(θ + 180°)', (s) => `${show(tan(s.total))}, ${show(tan(s.total + 180))}`],
    ] },
  ],
  tex: (s) => `\\sin\\theta=\\sin(\\theta+360^\\circ),\\quad \\tan\\theta=\\tan(\\theta+180^\\circ)=${show(tan(s.total))}`,
});
