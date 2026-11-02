import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { createPlot } from '../../lib/plot.js';
import { SURF, surfaceFaces, drawLevel3d, drawLevel, levelList } from './_mv.js';

// Match a surface with its contour map: the same probe point and its level curve are marked on both views.
const state = { surface: 'saddle', view: 'map', x: 1, y: 0.5 };
const S = () => SURF[state.surface];

const tool = createTool({
  state,
  label: 'A surface z equals f of x and y, shown either as a 3D picture or as a contour map. A probe point at (x, y) and the level curve through it are highlighted in coral in whichever view is chosen.',
  setup(stage, c) { return { cam: createCamera(stage, { extent: 5.5, yaw: 0.7, pitch: 0.5, c }), plot: createPlot(stage, { x: [-3.4, 3.4], y: [-3.4, 3.4], c }) }; },
  draw(ctx, stage, c, { cam, plot }) {
    const { f, R } = S();
    const z = f(state.x, state.y);
    if (state.view === '3d') {
      cam.faces(surfaceFaces(c, f, R, 18, { stroke: c.grid }));
      cam.axes({ size: 3.6 });
      drawLevel3d(cam, f, z, R, { color: c.a, width: 4 });
      cam.point([state.x, state.y, z]);
    } else {
      plot.axes();
      levelList(f, R, 11).forEach((l) => drawLevel(ctx, plot, f, l, R, { color: c.grid, width: 1.5 }));
      drawLevel(ctx, plot, f, z, R, { color: c.a, width: 4 });
      plot.point(state.x, state.y);
    }
  },
  controls: [
    { title: 'Surface and map' },
    { key: 'surface', label: 'Surface', options: Object.entries(SURF).map(([k, v]) => [k, v.name]) },
    { key: 'view', label: 'View', options: [['3d', '3D surface'], ['map', 'Contour map']] },
    { key: 'x', label: 'x', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'y', label: 'y', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [['z = f(x, y)', (s) => SURF[s.surface].f(s.x, s.y).toFixed(2)]] },
  ],
  tex: (s) => `f(${Number(s.x).toFixed(1)},${Number(s.y).toFixed(1)})=${SURF[s.surface].f(s.x, s.y).toFixed(2)}`,
});
tool.extra.cam.orbit(tool.update);
