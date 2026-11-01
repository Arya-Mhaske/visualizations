import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { KINDS, traceName } from './_quadric-surfaces-math.js';
import { drawTraces, planeFace } from './_quadric-surfaces-view.js';

const state = { kind: 'ellipsoid', axis: 2, k: 1, stack: 'on' };
const ABC = [3, 2, 2.5];
const AXIS_NAMES = ['x', 'y', 'z'];
const STACK = [-3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];

const tool = createTool({
  state,
  label: 'A surface seen as a stack of slices. A cutting plane can be moved, and the curve where it meets the surface is drawn thick.',
  setup: (stage, c) => createCamera(stage, { extent: 6.5, yaw: 0.8, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 4.4 });
    if (state.stack === 'on') {
      for (const k of STACK) {
        if (Math.abs(k - state.k) > 0.01) drawTraces(cam, state.kind, state.axis, k, ABC, { color: c.grid, width: 1.5 });
      }
    }
    cam.faces([{ ...planeFace(state.axis, state.k), fill: c.fillY, stroke: c.grid }]);
    drawTraces(cam, state.kind, state.axis, state.k, ABC, { color: c.a, width: 5 });
  },
  controls: [
    { title: 'Cut the surface' },
    { key: 'kind', label: 'Surface', options: Object.entries(KINDS).map(([key, v]) => [key, v.name]) },
    { key: 'axis', label: 'Cut by the plane', options: [[2, 'z = k'], [0, 'x = k'], [1, 'y = k']] },
    { key: 'k', label: 'k', min: -3.5, max: 3.5, step: 0.5 },
    { key: 'stack', label: 'Earlier slices', options: [['on', 'Show the stack'], ['off', 'Hide']] },
    { readout: [
      ['Slice is', (s) => traceName(s.kind, Number(s.axis), s.k, ABC)],
      ['Plane', (s) => `${AXIS_NAMES[Number(s.axis)]} = ${fixed(s.k, 1)}`],
    ] },
  ],
  tex: (s) => `\\text{The slice } ${AXIS_NAMES[Number(s.axis)]} = ${fixed(s.k, 1)} \\text{ is } \\text{${traceName(s.kind, Number(s.axis), s.k, ABC)}}`,
});
tool.extra.orbit(tool.update);
