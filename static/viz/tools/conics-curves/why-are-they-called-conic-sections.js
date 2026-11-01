import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { eccentricityOf, polarPoint, rad, sectionType } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { alpha: 35, beta: 60 };
const NAMES = { circle: 'circle', ellipse: 'ellipse', parabola: 'parabola', hyperbola: 'hyperbola' };
const L = 1.4;

createTool({
  state,
  label: 'Top: a side view of a double cone with a cutting plane seen edge-on as a line. Bottom: the shape the plane cuts out of the cone. Tilt the plane from flat to steep. Flat gives a circle. Less steep than the cone\'s side gives an ellipse. Exactly as steep as the side gives a parabola. Steeper gives a hyperbola, which cuts both halves of the cone.',
  draw(ctx, stage, c) {
    const h = stage.h * 0.5;
    const O = [stage.w / 2, h * 0.5];
    const k = h * 0.42;
    const a = rad(state.alpha);
    [-1, 1].forEach((s) => {
      line(ctx, O[0] - s * Math.tan(a) * k * 1.1, O[1] - k * 1.1, O[0] + s * Math.tan(a) * k * 1.1, O[1] + k * 1.1, { color: c.ink, width: 3 });
    });
    // the plane crosses the axis a little below the apex
    const P0 = [O[0], O[1] + k * 0.45];
    const b = rad(state.beta);
    const u = [Math.sin(b), -Math.cos(b)];
    line(ctx, P0[0] - u[0] * k * 2, P0[1] - u[1] * k * 2, P0[0] + u[0] * k * 2, P0[1] + u[1] * k * 2, { color: c.a, width: 4 });
    dot(ctx, ...O, 5, c.ink, c.ink);
    label(ctx, 'apex', O[0] + 24, O[1] - 8, c, { size: 10, bounds: stage, patch: false });
    // the cut shape, from the conic's polar equation with a focus at the origin
    const e = eccentricityOf(state.alpha, state.beta);
    const type = sectionType(state.alpha, state.beta);
    const C = [stage.w / 2, h + (stage.h - h) / 2];
    const scale = Math.min(stage.w, stage.h - h) / 7;
    const shift = type === 'ellipse' || type === 'circle' ? -L * e / (1 - e * e) : 0;
    const pts = trace((t) => {
      const p = polarPoint(L, e, t, 2.7, type === 'hyperbola');
      return p ? [C[0] + (p[0] + shift) * scale, C[1] - p[1] * scale] : null;
    }, -Math.PI, Math.PI, 500);
    let run = [];
    const flush = () => { for (let i = 1; i < run.length; i++) line(ctx, ...run[i - 1], ...run[i], { color: c.a, width: 4 }); run = []; };
    pts.forEach((p) => (p ? run.push(p) : flush()));
    flush();
    label(ctx, NAMES[type], stage.w / 2, h + 12, c, { size: 14, color: c.a, bounds: stage });
  },
  controls: [
    { title: 'Tilt the plane' },
    { key: 'beta', label: 'Plane angle with the axis, β', min: 5, max: 90, step: 1, format: (n) => `${n}°` },
    { key: 'alpha', label: 'Cone half-angle, α', min: 20, max: 60, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Cut shape', (s) => ({ text: NAMES[sectionType(s.alpha, s.beta)], good: true })],
      ['Compare β with α', (s) => (s.beta > s.alpha ? 'β > α' : s.beta === s.alpha ? 'β = α' : 'β < α')],
      ['Eccentricity, e', (s) => fixed(eccentricityOf(s.alpha, s.beta), 3)],
    ] },
  ],
  tex: (s) => `e=\\dfrac{\\cos\\beta}{\\cos\\alpha}=\\dfrac{\\cos ${s.beta}^\\circ}{\\cos ${s.alpha}^\\circ}=${fixed(eccentricityOf(s.alpha, s.beta), 3)}`,
});
