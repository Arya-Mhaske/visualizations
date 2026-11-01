import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { CURVES, frame, add, scale, dot, cross, norm } from './_space-curves-math.js';
import { drawCurve, curveOptions } from './_space-curves-view.js';

const state = { curve: 'bend', u: 0.5, plane: 'on' };
const timeOf = (s) => { const [lo, hi] = CURVES[s.curve].range; return lo + s.u * (hi - lo); };

const tool = createTool({
  state,
  label: 'A rider on a space curve with three arrows: T forward, N into the turn and B, the axis the turn spins about. A sheet shows the plane of T and N.',
  setup: (stage, c) => createCamera(stage, { extent: 6, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const curve = CURVES[state.curve];
    const p = curve.r(timeOf(state));
    const f = frame(curve, timeOf(state));
    cam.axes({ size: 4.2 });
    drawCurve(cam, curve, { color: c.grid, width: 3 });
    if (!f.N) { cam.arrow(p, add(p, scale(f.T, 2)), { color: c.a, width: 5 }); cam.point(p, { fill: c.ink, r: 6 }); return; }
    if (state.plane === 'on') {
      const [s, q] = [1.8, 1.8];
      const at = (x, y) => add(p, add(scale(f.T, x), scale(f.N, y)));
      cam.faces([{ pts: [at(-s, -q), at(s, -q), at(s, q), at(-s, q)], fill: c.fillY, stroke: c.grid }]);
    }
    cam.arrow(p, add(p, scale(f.T, 2)), { color: c.a, width: 5 });
    cam.arrow(p, add(p, scale(f.N, 2)), { color: c.b, width: 5 });
    cam.arrow(p, add(p, scale(f.B, 2)), { color: c.c, width: 5 });
    cam.point(p, { fill: c.ink, r: 6 });
    cam.label('T', add(p, scale(f.T, 2.4)), { size: 13, color: c.a });
    cam.label('N', add(p, scale(f.N, 2.4)), { size: 13, color: c.b });
    cam.label('B', add(p, scale(f.B, 2.4)), { size: 13, color: c.c });
  },
  controls: [
    { title: 'Ride the curve' },
    { key: 'curve', label: 'Curve', options: curveOptions },
    { key: 'u', label: 'Position along the curve', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'plane', label: 'Plane of T and N', options: [['on', 'Show'], ['off', 'Hide']] },
    { readout: [
      ['T · N', (s) => { const f = frame(CURVES[s.curve], timeOf(s)); return f.N ? fixed(dot(f.T, f.N) + 0, 3) : '–'; }],
      ['|T × N|', (s) => { const f = frame(CURVES[s.curve], timeOf(s)); return f.N ? fixed(norm(cross(f.T, f.N)), 3) : '–'; }],
      ['B · T', (s) => { const f = frame(CURVES[s.curve], timeOf(s)); return f.B ? fixed(dot(f.B, f.T) + 0, 3) : '–'; }],
    ] },
  ],
  tex: () => '\\mathbf{B} = \\mathbf{T}\\times\\mathbf{N}',
});
tool.extra.orbit(tool.update);
