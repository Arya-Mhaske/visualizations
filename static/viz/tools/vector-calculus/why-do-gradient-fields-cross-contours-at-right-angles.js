import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { SCALARS, gradient, levelTangent, dot, norm } from './_vector-calculus-math.js';
import { WINDOW, fieldArrows, arrowAt, drawContours } from './_vector-calculus-view.js';

const state = { surface: 'bowl', px: 2, py: 1, show: 'on' };
const LEVELS = [-9, -7, -5, -3, -1, 1, 3, 5, 7, 9].map((v) => v / 2);
const tangent = (s) => levelTangent(SCALARS[s.surface], s.px, s.py);
const angleBetween = (s) => {
  const g = gradient(SCALARS[s.surface], s.px, s.py);
  const t = tangent(s);
  if (!t || norm(g) < 1e-9) return null;
  return (Math.acos(Math.max(-1, Math.min(1, Math.abs(dot(g, t)) / norm(g)))) * 180) / Math.PI;
};

const tool = createTool({
  state,
  label: 'A contour map of a surface with the gradient arrows over it. At the probe, the contour tangent and the gradient arrow are drawn, and they meet at a right angle.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const S = SCALARS[state.surface];
    plot.axes();
    drawContours(ctx, plot, S.f, LEVELS, { color: c.grid, width: 1.5 });
    if (state.show === 'on') fieldArrows(ctx, plot, (x, y) => gradient(S, x, y), c, { step: 1, color: c.b, soft: 3 });
    const level = S.f(state.px, state.py);
    drawContours(ctx, plot, S.f, [level], { color: c.c, width: 4 });
    const t = tangent(state);
    if (t) {
      const [a, b] = [plot.toPx(state.px - t[0] * 0.9, state.py - t[1] * 0.9), plot.toPx(state.px + t[0] * 0.9, state.py + t[1] * 0.9)];
      line(ctx, ...a, ...b, { color: c.ink, width: 3 });
    }
    const g = gradient(S, state.px, state.py);
    arrowAt(ctx, plot, state.px, state.py, g[0], g[1], { k: 50, cap: 80, color: c.a, width: 4, head: 12 });
    plot.point(state.px, state.py, { fill: c.ink, r: 5 });
  },
  controls: [
    { title: 'Stand on the map' },
    { key: 'surface', label: 'Surface f', options: Object.entries(SCALARS).map(([k, v]) => [k, v.name]) },
    { key: 'px', label: 'Probe x', min: -4, max: 4, step: 0.5 },
    { key: 'py', label: 'Probe y', min: -4, max: 4, step: 0.5 },
    { key: 'show', label: 'All gradient arrows', options: [['on', 'Show'], ['off', 'Hide']] },
    { readout: [
      ['∇f at probe', (s) => `(${gradient(SCALARS[s.surface], s.px, s.py).map((v) => fixed(v, 2)).join(', ')})`],
      ['Angle to the contour', (s) => { const a = angleBetween(s); return a === null ? '∇f = 0: flat spot' : `${fixed(a, 1)}°`; }],
    ] },
  ],
  tex: () => '\\nabla f \\perp \\text{level curve}\\quad\\Longleftrightarrow\\quad \\nabla f \\cdot \\mathbf{T} = 0',
});
