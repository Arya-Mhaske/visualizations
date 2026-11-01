import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { fromSpherical, rad } from './_cylindrical-spherical-math.js';
import { sphereWire, arcPhi, arcXY, trace } from './_cylindrical-spherical-view.js';

const RHO = 3.5;
const state = { phi: 60, theta: 40 };

const tool = createTool({
  state,
  label: 'A sphere with a point on it. The angle φ is measured down from the north pole, and the ring through the point has radius ρ sin φ. Latitude is measured up from the equator.',
  setup: (stage, c) => createCamera(stage, { extent: 5.5, yaw: 0.7, pitch: 0.35, c }),
  draw(ctx, stage, c, cam) {
    const phi = rad(state.phi);
    const theta = rad(state.theta);
    cam.axes({ size: 4.6 });
    sphereWire(cam, RHO, { color: c.grid, width: 1 });
    const p = fromSpherical(RHO, theta, phi);
    const ring = RHO * Math.sin(phi);
    trace(cam, (u) => fromSpherical(RHO, u * Math.PI * 2, phi), 48, { color: c.c, width: 3 });
    cam.line([0, 0, p[2]], p, { color: c.c, width: 3, dash: [4, 4] });
    arcPhi(cam, 1.6, theta, phi, { color: c.a, width: 4 });
    // Latitude: from the equator (at the point's meridian) up to the point.
    trace(cam, (u) => fromSpherical(RHO * 1.02, theta, Math.PI / 2 - u * (Math.PI / 2 - phi)), 24, { color: c.b, width: 4 });
    arcXY(cam, 1.2, theta, 0, { color: c.ink, width: 2 });
    cam.line([0, 0, 0], p, { color: c.ink, width: 3 });
    cam.point(p, { fill: c.a, r: 8 });
    cam.label('φ', fromSpherical(2.1, theta, phi / 2), { size: 13, color: c.a });
    cam.label('lat', fromSpherical(RHO * 1.15, theta, (Math.PI / 2 + phi) / 2), { size: 11, color: c.b });
    cam.label(`r = ${fixed(ring, 2)}`, [ring / 2, 0, p[2] + 0.3], { size: 11, color: c.c });
  },
  controls: [
    { title: 'Sweep φ' },
    { key: 'phi', label: 'φ (from the north pole)', min: 0, max: 180, step: 5, format: (v) => `${v}°` },
    { key: 'theta', label: 'θ', min: 0, max: 355, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['φ', (s) => `${s.phi}°`],
      ['Latitude 90° − φ', (s) => `${90 - s.phi}°`],
      ['r = ρ sin φ', (s) => fixed(RHO * Math.sin(rad(s.phi)), 3)],
      ['z = ρ cos φ', (s) => fixed(RHO * Math.cos(rad(s.phi)), 3)],
    ] },
  ],
  tex: (s) => `\\phi = ${s.phi}^\\circ,\\quad \\text{latitude} = 90^\\circ-\\phi = ${90 - s.phi}^\\circ,\\quad r = \\rho\\sin\\phi \\ge 0`,
});
tool.extra.orbit(tool.update);
