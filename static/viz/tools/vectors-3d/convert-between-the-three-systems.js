import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { toCylindrical, toSpherical, deg } from './_cylindrical-spherical-math.js';
import { arcXY, arcPhi } from './_cylindrical-spherical-view.js';

const state = { x: 2, y: 3, z: 4 };
const P = (s) => [s.x, s.y, s.z];

const tool = createTool({
  state,
  label: 'A point with its drop to the floor. Its distance r from the z axis, the angle θ in the floor, the angle φ down from the z axis and the distance ρ from the origin are all marked.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const p = P(state);
    const cy = toCylindrical(...p);
    const sp = toSpherical(...p);
    cam.axes({ size: 5.6 });
    const foot = [p[0], p[1], 0];
    cam.line([0, 0, 0], foot, { color: c.b, width: 4 });
    cam.line(foot, p, { color: c.c, width: 4 });
    cam.line([0, 0, 0], p, { color: c.a, width: 4 });
    cam.line([p[0], 0, 0], foot, { color: c.grid, width: 1.5, dash: [3, 3] });
    cam.line([0, p[1], 0], foot, { color: c.grid, width: 1.5, dash: [3, 3] });
    if (cy.r > 0) arcXY(cam, Math.min(1.4, cy.r * 0.6), cy.theta >= 0 ? cy.theta : cy.theta + Math.PI * 2, 0, { color: c.ink, width: 2 });
    if (sp.rho > 0) arcPhi(cam, 1.9, cy.theta, sp.phi, { color: c.d, width: 3 });
    cam.point(p, { fill: c.a, r: 8 });
    cam.label('r', [p[0] / 2, p[1] / 2, 0.3], { size: 12, color: c.b });
    cam.label('ρ', p.map((v) => v * 0.55 + 0.25), { size: 12, color: c.a });
  },
  controls: [
    { title: 'Place the point (x, y, z)' },
    { key: 'x', label: 'x', min: -5, max: 5, step: 1 },
    { key: 'y', label: 'y', min: -5, max: 5, step: 1 },
    { key: 'z', label: 'z', min: -5, max: 5, step: 1 },
    { readout: [
      ['Rectangular', (s) => `(${s.x}, ${s.y}, ${s.z})`],
      ['Cylindrical (r, θ, z)', (s) => { const c = toCylindrical(...P(s)); return `(${fixed(c.r, 2)}, ${fixed(deg(c.theta), 1)}°, ${s.z})`; }],
      ['Spherical (ρ, θ, φ)', (s) => { const q = toSpherical(...P(s)); return `(${fixed(q.rho, 2)}, ${fixed(deg(q.theta), 1)}°, ${fixed(deg(q.phi), 1)}°)`; }],
    ] },
  ],
  tex: (s) => {
    const q = toSpherical(...P(s));
    return `r = \\sqrt{x^2+y^2} = ${fixed(Math.hypot(s.x, s.y), 3)},\\quad \\rho = \\sqrt{x^2+y^2+z^2} = ${fixed(q.rho, 3)},\\quad \\tan\\theta = \\dfrac{y}{x}`;
  },
});
tool.extra.orbit(tool.update);
