import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { degenerate, eccentricityOf, polarPoint, rad, sectionType } from './_conics-math.js';
import { drawCone } from './_conics-view.js';

const state = { beta: 60, alpha: 35, height: 0 };
const H = 0.45;

createTool({
  state,
  label: 'Top: a double cone seen from slightly above, with a flat cutting plane (coral). Slide the plane up until it passes through the apex. Bottom: the cut shape. A plane through the apex cuts a single point if it is flatter than the cone\'s side, one line if it is exactly as steep, and two crossing lines if it is steeper.',
  draw(ctx, stage, c) {
    const h = stage.h * 0.5;
    const O = [stage.w / 2, h * 0.5];
    const k = h * 0.3;
    drawCone(ctx, c, O, k, state.alpha, state.beta, H * state.height);
    dot(ctx, ...O, 6, c.fillY, c.ink);
    const C = [stage.w / 2, h + (stage.h - h) / 2];
    const scale = Math.min(stage.w, stage.h - h) / 7;
    if (state.height === 0) {
      const d = degenerate(state.alpha, state.beta);
      if (d.kind === 'point') dot(ctx, ...C, 8, c.a, c.ink);
      else if (d.kind === 'line') line(ctx, C[0] - scale * 3, C[1], C[0] + scale * 3, C[1], { color: c.a, width: 5 });
      else {
        const half = rad(d.between / 2);
        [-1, 1].forEach((s) => line(ctx, C[0] - Math.cos(half) * scale * 3, C[1] + s * Math.sin(half) * scale * 3, C[0] + Math.cos(half) * scale * 3, C[1] - s * Math.sin(half) * scale * 3, { color: c.a, width: 5 }));
      }
      label(ctx, `through the apex: ${d.kind}`, stage.w / 2, h + 14, c, { size: 13, color: c.a, bounds: stage });
    } else {
      const e = eccentricityOf(state.alpha, state.beta);
      const type = sectionType(state.alpha, state.beta);
      const l = 1.4 * state.height;
      const shift = type === 'ellipse' || type === 'circle' ? (-l * e) / (1 - e * e) : 0;
      let prev = null;
      for (let i = 0; i <= 500; i++) {
        const t = -Math.PI + (2 * Math.PI * i) / 500;
        const p = polarPoint(l, e, t, 3, type === 'hyperbola');
        const q = p ? [C[0] + (p[0] + shift) * scale, C[1] - p[1] * scale] : null;
        if (prev && q) line(ctx, ...prev, ...q, { color: c.a, width: 4 });
        prev = q;
      }
      label(ctx, `${type}: not through the apex`, stage.w / 2, h + 14, c, { size: 13, color: c.ink, bounds: stage });
    }
  },
  controls: [
    { title: 'Move the plane to the apex' },
    { key: 'height', label: 'Plane below the apex', min: 0, max: 1, step: 0.05, format: (n) => (n === 0 ? 'through it' : fixed(n, 2)) },
    { key: 'beta', label: 'Plane angle with the axis, β', min: 5, max: 90, step: 1, format: (n) => `${n}°` },
    { key: 'alpha', label: 'Cone half-angle, α', min: 20, max: 60, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Through the apex gives', (s) => degenerate(s.alpha, s.beta).kind],
      ['Compare β with α', (s) => (s.beta > s.alpha ? 'β > α' : s.beta === s.alpha ? 'β = α' : 'β < α')],
      ['Angle between the lines', (s) => (degenerate(s.alpha, s.beta).lines === 2 ? `${fixed(degenerate(s.alpha, s.beta).between, 1)}°` : 'none')],
    ] },
  ],
  tex: (s) => (s.beta > s.alpha ? '\\beta>\\alpha:\\ \\text{one point}' : s.beta === s.alpha ? '\\beta=\\alpha:\\ \\text{one line}' : '\\beta<\\alpha:\\ \\text{two lines}'),
});
