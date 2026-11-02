import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { SURF, surfaceFaces, fx, fy } from './_mv.js';

// Hold y fixed and the surface is cut by a vertical wall. On that wall f is a curve of one variable, and f_x is its slope.
const state = { surface: 'waves', dir: 'x', x: 0.6, y: 0.8 };
const S = () => SURF[state.surface];
const slope = () => (state.dir === 'x' ? fx : fy)(S().f, state.x, state.y);

const tool = createTool({
  state,
  label: 'A 3D surface cut by a vertical wall. The cut is a curve drawn in coral, and a straight line touching that curve at the probe shows its slope. That slope is the partial derivative in the direction of the cut.',
  setup: (stage, c) => createCamera(stage, { extent: 5.5, yaw: 0.8, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    const { f, R } = S();
    cam.faces(surfaceFaces(c, f, R, 18, { stroke: c.grid }));
    cam.axes({ size: 3.6 });
    const along = state.dir === 'x';
    const at = (t) => (along ? [t, state.y, f(t, state.y)] : [state.x, t, f(state.x, t)]);
    for (let i = 0; i < 60; i++) cam.line(at(-R + (2 * R * i) / 60), at(-R + (2 * R * (i + 1)) / 60), { color: c.a, width: 4 });
    const t0 = along ? state.x : state.y;
    const [p, m] = [at(t0), slope()];
    const tan = (s) => (along ? [state.x + s, state.y, p[2] + m * s] : [state.x, state.y + s, p[2] + m * s]);
    cam.line(tan(-1.2), tan(1.2), { color: c.b, width: 4 });
    cam.point(p);
    cam.label(`slope ${m.toFixed(2)}`, tan(1.2), { size: 11 });
  },
  controls: [
    { title: 'Cut the surface' },
    { key: 'surface', label: 'Surface', options: Object.entries(SURF).filter(([k]) => k !== 'ramp').map(([k, v]) => [k, v.name]) },
    { key: 'dir', label: 'Hold fixed', options: [['x', 'y fixed (find f_x)'], ['y', 'x fixed (find f_y)']] },
    { key: 'x', label: 'x', min: -2.5, max: 2.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'y', label: 'y', min: -2.5, max: 2.5, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [['f_x', (s) => fx(SURF[s.surface].f, s.x, s.y).toFixed(3)], ['f_y', (s) => fy(SURF[s.surface].f, s.x, s.y).toFixed(3)]] },
  ],
  tex: (s) => `f_${s.dir}(${Number(s.x).toFixed(1)},${Number(s.y).toFixed(1)})=${slope().toFixed(3)}`,
});
tool.extra.orbit(tool.update);
