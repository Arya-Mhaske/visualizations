import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { SURF, fx, fy, zRange } from './_mv.js';

// Zoom in on (a, b): plot the surface and its tangent plane in coordinates scaled by the window width w, so both fill the same size on screen.
// The gap between them, measured in those scaled units, shrinks in proportion to w.
const state = { surface: 'waves', a: 0.8, b: 0.4, zoom: 0 };
const S = () => SURF[state.surface];
const width = () => 2 * 0.5 ** state.zoom;
const plane = (x, y) => { const { f } = S(); return f(state.a, state.b) + fx(f, state.a, state.b) * (x - state.a) + fy(f, state.a, state.b) * (y - state.b); };
export function worstGap(f, a, b, w) {
  const L = (x, y) => f(a, b) + fx(f, a, b) * (x - a) + fy(f, a, b) * (y - b);
  let worst = 0;
  for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) {
    const x = a - w / 2 + (w * i) / 10;
    const y = b - w / 2 + (w * j) / 10;
    worst = Math.max(worst, Math.abs(f(x, y) - L(x, y)));
  }
  return worst;
}

const tool = createTool({
  state,
  label: 'A small window of a curved surface, drawn together with its tangent plane. At the widest zoom the two are visibly apart. As the window shrinks they become the same picture.',
  setup: (stage, c) => createCamera(stage, { extent: 3.4, yaw: 0.8, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    const { f } = S();
    const w = width();
    const n = 12;
    const z0 = f(state.a, state.b);
    const P = (g, i, j) => { const x = state.a - w / 2 + (w * i) / n; const y = state.b - w / 2 + (w * j) / n; return [(x - state.a) / w * 3, (y - state.b) / w * 3, ((g(x, y) - z0) / w) * 3]; };
    const faces = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      faces.push({ pts: [P(plane, i, j), P(plane, i + 1, j), P(plane, i + 1, j + 1), P(plane, i, j + 1)], fill: c.fillY, stroke: c.grid, width: 1 });
      faces.push({ pts: [P(f, i, j), P(f, i + 1, j), P(f, i + 1, j + 1), P(f, i, j + 1)], fill: c.fillB, stroke: c.ink, width: 1 });
    }
    cam.faces(faces);
    cam.point([0, 0, 0]);
  },
  controls: [
    { title: 'Zoom in' },
    { key: 'surface', label: 'Surface', options: Object.entries(SURF).filter(([k]) => ['waves', 'two', 'hill', 'saddle'].includes(k)).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'Point x', min: -2, max: 2, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'b', label: 'Point y', min: -2, max: 2, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'zoom', label: 'Zoom (halvings)', min: 0, max: 7, step: 0.25, format: (v) => v.toFixed(2) },
    { readout: [
      ['Window width', () => width().toFixed(3)],
      ['Largest gap', () => worstGap(S().f, state.a, state.b, width()).toFixed(5)],
      ['Gap ÷ width', () => (worstGap(S().f, state.a, state.b, width()) / width()).toFixed(4)],
    ] },
  ],
  tex: () => 'f(x,y)\\approx f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)',
});
tool.extra.orbit(tool.update);
void zRange;
