import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { fixed } from '../../lib/format.js';

// Each family F(x, y; k) = 0, with the slope formula in TeX and the range of its parameter.
const FAMILIES = {
  conic: { name: 'x² + k·y² = 4', g: (x, y, k) => x * x + k * y * y - 4, k: [-2, 3, 0.25, 1], ghosts: [-2, -1, 0.5, 1, 2, 3],
    slope: (k) => `y'=-\\dfrac{x}{${fixed(k, 2)}\\,y}`, tex: (k) => `x^2+${fixed(k, 2)}y^2=4` },
  cubic: { name: 'y² = x³ + k·x', g: (x, y, k) => y * y - x ** 3 - k * x, k: [-3, 3, 0.25, -1], ghosts: [-3, -2, -1, 0, 1, 2, 3],
    slope: (k) => `y'=\\dfrac{3x^2+${fixed(k, 2)}}{2y}`, tex: (k) => `y^2=x^3+${fixed(k, 2)}x` },
  folium: { name: 'x³ + y³ = k·xy', g: (x, y, k) => x ** 3 + y ** 3 - k * x * y, k: [0.5, 6, 0.25, 3], ghosts: [0.5, 1.5, 3, 4.5, 6],
    slope: (k) => `y'=\\dfrac{${fixed(k, 2)}y-3x^2}{3y^2-${fixed(k, 2)}x}`, tex: (k) => `x^3+y^3=${fixed(k, 2)}xy` },
};
const state = { family: 'cubic', k: -1, ghosts: true };
const HALF = 4;

function curveSegments(f, k) {
  return contour((x, y) => f.g(x, y, k), -HALF, HALF, 110);
}

const tool = createTool({
  state,
  label: 'A family of implicit curves drawn in a square window. A slider changes the parameter k, and the curve bends, splits or joins up as k changes. The other members of the family are drawn faintly behind it.',
  setup: (stage, c) => createPlot(stage, { x: [-HALF, HALF], y: [-HALF, HALF], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const f = FAMILIES[state.family];
    plot.axes();
    if (state.ghosts) {
      for (const k of f.ghosts) {
        for (const [a, b] of curveSegments(f, k)) plot.segment(a[0], a[1], b[0], b[1], { color: c.grid, width: 2 });
      }
    }
    for (const [a, b] of curveSegments(f, state.k)) plot.segment(a[0], a[1], b[0], b[1], { color: c.a, width: 4 });
  },
  controls: [
    { title: 'Pick a family' },
    { key: 'family', label: 'Family', options: Object.entries(FAMILIES).map(([key, v]) => [key, v.name]) },
    { key: 'k', label: 'Parameter k', min: -3, max: 3, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'ghosts', label: 'Show other members of the family', toggle: true },
    { readout: [
      ['Curve', (s) => FAMILIES[s.family].name.replace('k', fixed(s.k, 2))],
    ] },
  ],
  tex: (s) => `${FAMILIES[s.family].tex(s.k)}\\ \\Rightarrow\\ ${FAMILIES[s.family].slope(s.k)}`,
  onChange: (s) => limit(s),
});

// Each family has its own range for k: move the slider's limits when the family changes.
const slider = document.querySelector('#panel input[type=range]');
function limit(s) {
  const [lo, hi, step, start] = FAMILIES[s.family].k;
  if (s.family !== limit.last) {
    limit.last = s.family;
    Object.assign(slider, { min: lo, max: hi, step });
    s.k = start;
    tool.ui.refresh();
  }
  s.k = Math.min(hi, Math.max(lo, s.k));
}
limit.last = null;
limit(state);
tool.update();
