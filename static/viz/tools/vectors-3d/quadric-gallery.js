import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { KINDS, traceName } from './_quadric-surfaces-math.js';
import { drawTraces } from './_quadric-surfaces-view.js';

const state = { kind: 'ellipsoid', a: 3, b: 2, c: 2.5 };
const KS = [-3, -2, -1, 0, 1, 2, 3];
const EQUATIONS = {
  ellipsoid: '\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} + \\dfrac{z^2}{c^2} = 1',
  hyper1: '\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} - \\dfrac{z^2}{c^2} = 1',
  hyper2: '-\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} + \\dfrac{z^2}{c^2} = 1',
  paraboloid: 'z = \\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2}',
  saddle: 'z = \\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2}',
  cone: '\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = \\dfrac{z^2}{c^2}',
};
const abc = (s) => [s.a, s.b, s.c];

const tool = createTool({
  state,
  label: 'One of six quadric surfaces drawn as slices: coral for slices by z, blue for slices by x and green for slices by y.',
  setup: (stage, c) => createCamera(stage, { extent: 6.5, yaw: 0.8, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 4.4 });
    for (const k of KS) {
      drawTraces(cam, state.kind, 2, k, abc(state), { color: c.a, width: 2.5 });
      drawTraces(cam, state.kind, 0, k, abc(state), { color: c.b, width: 1.5 });
      drawTraces(cam, state.kind, 1, k, abc(state), { color: c.c, width: 1.5 });
    }
  },
  controls: [
    { title: 'Pick a surface' },
    { key: 'kind', label: 'Surface', options: Object.entries(KINDS).map(([key, v]) => [key, v.name]) },
    { key: 'a', label: 'a', min: 1, max: 4, step: 0.5 },
    { key: 'b', label: 'b', min: 1, max: 4, step: 0.5 },
    { key: 'c', label: 'c', min: 1, max: 4, step: 0.5 },
    { readout: [
      ['Slices z = k', (s) => `${traceName(s.kind, 2, 1, abc(s))} (k = 1)`],
      ['Slices x = k', (s) => `${traceName(s.kind, 0, 1, abc(s))} (k = 1)`],
      ['Slices y = k', (s) => `${traceName(s.kind, 1, 1, abc(s))} (k = 1)`],
    ] },
  ],
  tex: (s) => EQUATIONS[s.kind],
});
tool.extra.orbit(tool.update);
