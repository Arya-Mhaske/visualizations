import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { dot, norm, cross, scale, add } from './_lines-planes-math.js';

// The normal n is set by two angles; the plane is every point whose arrow from P is square to n.
const state = { yaw: 40, tilt: 55, probe: 0 };
const P = [0, 0, 0];
const rad = (d) => (d * Math.PI) / 180;
const normal = (s) => [Math.sin(rad(s.tilt)) * Math.cos(rad(s.yaw)), Math.sin(rad(s.tilt)) * Math.sin(rad(s.yaw)), Math.cos(rad(s.tilt))];
// Two perpendicular in-plane directions.
function basis(n) {
  const helper = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const u = cross(n, helper);
  const e1 = scale(u, 1 / norm(u));
  return [e1, cross(n, e1)];
}

const tool = createTool({
  state,
  label: 'A plane through the origin drawn as a square sheet, with its normal vector standing out of it. A probe arrow lies in the sheet, and its dot product with the normal is zero.',
  setup: (stage, c) => createCamera(stage, { extent: 6, yaw: 0.8, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const n = normal(state);
    const [e1, e2] = basis(n);
    const S = 4;
    const corner = (a, b) => add(scale(e1, a * S), scale(e2, b * S));
    cam.axes({ size: 5 });
    cam.faces([{ pts: [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], fill: c.fillB, stroke: c.b, width: 3 }]);
    const t = rad(state.probe);
    const probe = add(scale(e1, 3 * Math.cos(t)), scale(e2, 3 * Math.sin(t)));
    cam.arrow(P, probe, { color: c.a, width: 4 });
    cam.arrow(P, scale(n, 4.5), { color: c.c, width: 6 });
    cam.point(P, { fill: c.ink, r: 5 });
    cam.label('n', scale(n, 5.1), { size: 13, color: c.c });
    cam.label('r − p', scale(probe, 1.15), { size: 11, color: c.a });
  },
  controls: [
    { title: 'Aim the normal' },
    { key: 'yaw', label: 'Normal: turn', min: 0, max: 355, step: 5, format: (v) => `${v}°` },
    { key: 'tilt', label: 'Normal: tilt from z', min: 0, max: 180, step: 5, format: (v) => `${v}°` },
    { key: 'probe', label: 'Arrow in the sheet', min: 0, max: 355, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['n', (s) => `(${normal(s).map((v) => fixed(v, 2)).join(', ')})`],
      ['n · (r − p)', (s) => {
        const n = normal(s);
        const [e1, e2] = basis(n);
        const t = rad(s.probe);
        return fixed(dot(n, add(scale(e1, Math.cos(t)), scale(e2, Math.sin(t)))), 3);
      }],
    ] },
  ],
  tex: (s) => {
    const n = normal(s).map((v) => fixed(v, 2));
    return `${n[0]}x + ${n[1]}y + ${n[2]}z = 0`;
  },
});
tool.extra.orbit(tool.update);
