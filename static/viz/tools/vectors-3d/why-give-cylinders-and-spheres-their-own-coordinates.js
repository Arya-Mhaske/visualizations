import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { fromCylindrical, fromSpherical, rad } from './_cylindrical-spherical-math.js';
import { cylinderWire, sphereWire } from './_cylindrical-spherical-view.js';

const R = 3;
const RHO = 2;
const state = { shape: 'cyl', theta: 50, z: 1, phi: 60 };
const point = (s) => (s.shape === 'cyl' ? fromCylindrical(R, rad(s.theta), s.z) : fromSpherical(RHO, rad(s.theta), rad(s.phi)));

const tool = createTool({
  state,
  label: 'A cylinder or a sphere with a point that moves on it. The readout shows that x, y and z all change as it moves, but r (cylinder) or ρ (sphere) stays fixed.',
  setup: (stage, c) => createCamera(stage, { extent: 5.5, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 4.4 });
    if (state.shape === 'cyl') cylinderWire(cam, R, 3, { color: c.grid, width: 1.5 });
    else sphereWire(cam, RHO, { color: c.grid, width: 1.5 });
    const p = point(state);
    cam.line([0, 0, p[2]], [p[0], p[1], p[2]], { color: c.a, width: 3, dash: [4, 4] });
    cam.line([0, 0, 0], p, { color: c.b, width: 3 });
    cam.point(p, { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Walk on the surface' },
    { key: 'shape', label: 'Surface', options: [['cyl', 'Cylinder'], ['sph', 'Sphere']] },
    { key: 'theta', label: 'θ', min: 0, max: 355, step: 5, format: (v) => `${v}°` },
    { key: 'z', label: 'z (cylinder)', min: -3, max: 3, step: 0.5 },
    { key: 'phi', label: 'φ (sphere)', min: 0, max: 180, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['x', (s) => fixed(point(s)[0], 2)],
      ['y', (s) => fixed(point(s)[1], 2)],
      ['z', (s) => fixed(point(s)[2], 2)],
      ['Fixed one', (s) => (s.shape === 'cyl' ? 'r = 3' : 'ρ = 2')],
    ] },
  ],
  tex: (s) => (s.shape === 'cyl'
    ? 'x^2 + y^2 = 9\\quad\\text{becomes}\\quad r = 3'
    : 'x^2 + y^2 + z^2 = 4\\quad\\text{becomes}\\quad \\rho = 2'),
});
tool.extra.orbit(tool.update);
