import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { arcIntegral, pathLength, segment, arcPath, bump, TAU } from './_vector-calculus-math.js';

const state = { path: 'circle', height: 'rising', u: 0.6 };
const PATHS = {
  circle: { name: 'Circle', make: () => arcPath([0, 0], 2.5, 0, TAU) },
  line: { name: 'Straight line', make: () => segment([-3, -2], [3, 2]) },
  wavy: { name: 'Wavy', make: () => bump([-3, -1], [3, 1], 1.8) },
};
const HEIGHTS = {
  flat: { name: 'Same height', f: () => 1.5 },
  rising: { name: 'Rises with x', f: (x) => 1.5 + x / 3 },
  ridge: { name: 'Ridged', f: (x, y) => 1.4 + 0.8 * Math.sin(x + y) },
};
const f = (s) => HEIGHTS[s.height].f;
const path = (s) => PATHS[s.path].make();

const tool = createTool({
  state,
  label: 'A curtain standing on a curve on the floor. Its height at each point is f. The curtain is built strip by strip as you slide along the curve.',
  setup: (stage, c) => createCamera(stage, { extent: 4.6, yaw: 0.8, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    const p = path(state);
    const h = f(state);
    cam.axes({ size: 3.8 });
    const n = 80;
    const faces = [];
    const top = [];
    for (let i = 0; i < n; i++) {
      const [t0, t1] = [(i / n) * state.u, ((i + 1) / n) * state.u];
      const [a, b] = [p.r(t0), p.r(t1)];
      const [ha, hb] = [h(...a), h(...b)];
      faces.push({ pts: [[a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], hb], [a[0], a[1], ha]], fill: i % 2 ? c.fillY : c.fillA, stroke: c.fillY, width: 1 });
      top.push([a[0], a[1], ha]);
      if (i === n - 1) top.push([b[0], b[1], hb]);
    }
    cam.faces(faces);
    for (let i = 0; i + 1 < top.length; i++) cam.line(top[i], top[i + 1], { color: c.a, width: 4 });
    for (let i = 0; i <= 80; i++) {
      if (i) cam.line([...p.r(((i - 1) / 80) * state.u), 0], [...p.r((i / 80) * state.u), 0], { color: c.ink, width: 3 });
    }
  },
  controls: [
    { title: 'Raise the curtain' },
    { key: 'path', label: 'Curve on the floor', options: Object.entries(PATHS).map(([k, v]) => [k, v.name]) },
    { key: 'height', label: 'Height f', options: Object.entries(HEIGHTS).map(([k, v]) => [k, v.name]) },
    { key: 'u', label: 'How much built', min: 0.05, max: 1, step: 0.05, format: (v) => `${Math.round(v * 100)}%` },
    { readout: [
      ['Length of the curve', (s) => fixed(pathLength(path(s)), 3)],
      ['Curtain area so far', (s) => fixed(arcIntegral(f(s), path(s), s.u), 3)],
      ['Whole curtain', (s) => fixed(arcIntegral(f(s), path(s)), 3)],
    ] },
  ],
  tex: (s) => `\\int_C f\\,ds = \\int_0^1 f(\\mathbf{r}(t))\\,|\\mathbf{r}'(t)|\\,dt = ${fixed(arcIntegral(f(s), path(s)), 3)}`,
});
tool.extra.orbit(tool.update);
