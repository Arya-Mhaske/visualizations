import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { A: 60, B: 20 };
const R = 6;
const rad = (d) => (d * Math.PI) / 180;
const m = (deg) => Math.tan(rad(deg));
// tan of the angle between the lines from the two slopes (null when 1 + m1·m2 = 0: the lines are perpendicular)
const formula = (s = state) => {
  const [m1, m2] = [m(s.B), m(s.A)];
  const bottom = 1 + m1 * m2;
  return Math.abs(bottom) < 1e-9 ? null : Math.abs((m2 - m1) / bottom);
};
const gap = (s = state) => { const d = Math.abs(s.A - s.B); return d > 90 ? 180 - d : d; };

createTool({
  state,
  label: 'Two lines through the origin. Each makes an angle with the x-axis, its inclination, and its slope is the tangent of that angle. The angle between the lines is the difference of the two inclinations. Applying the formula for the tangent of a difference gives the angle between the lines from the two slopes alone.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const line = (deg, color) => {
      const dx = Math.cos(rad(deg));
      const dy = Math.sin(rad(deg));
      plot.segment(-dx * 10, -dy * 10, dx * 10, dy * 10, { color, width: 4 });
    };
    line(state.B, c.b);
    line(state.A, c.a);
    const O = plot.toPx(0, 0);
    const k = Math.abs(plot.toPx(1, 0)[0] - O[0]);
    arc(ctx, ...O, k * 1.3, -rad(state.B), 0, { color: c.b, width: 3 });
    arc(ctx, ...O, k * 1.8, -rad(state.A), 0, { color: c.a, width: 3 });
    arc(ctx, ...O, k * 2.4, -rad(Math.max(state.A, state.B)), -rad(Math.min(state.A, state.B)), { color: c.c, width: 5 });
  },
  controls: [
    { title: 'Tilt the two lines' },
    { key: 'A', label: 'Inclination of line 2, A', min: 0, max: 179, step: 1, format: (n) => `${n}°` },
    { key: 'B', label: 'Inclination of line 1, B', min: 0, max: 179, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Slopes m₁, m₂', (s) => `${s.B === 90 ? '∞' : fixed(m(s.B), 3)}, ${s.A === 90 ? '∞' : fixed(m(s.A), 3)}`],
      ['Angle between the lines', (s) => `${gap(s)}°`],
      ['|(m₂ − m₁)/(1 + m₁m₂)|', (s) => (s.A === 90 || s.B === 90 ? 'a line is vertical' : formula(s) === null ? 'undefined: 90°' : fixed(formula(s), 3))],
      ['tan of the angle', (s) => (gap(s) === 90 ? 'undefined' : fixed(Math.tan(rad(gap(s))), 3))],
    ] },
  ],
  tex: (s) => `\\tan(A-B)=\\dfrac{\\tan A-\\tan B}{1+\\tan A\\tan B}=\\dfrac{m_2-m_1}{1+m_1m_2}`,
});
