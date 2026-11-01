import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { CURVES, frame, add, scale } from './_space-curves-math.js';
import { drawCurve, curveOptions } from './_space-curves-view.js';

const state = { curve: 'spiral', u: 0.2 };
const timeOf = (s) => { const [lo, hi] = CURVES[s.curve].range; return lo + s.u * (hi - lo); };
const MAX_R = 9;

const tool = createTool({
  state,
  label: 'A point on a space curve and the circle that best fits the curve there. The tighter the turn, the smaller the circle.',
  setup: (stage, c) => createCamera(stage, { extent: 6, yaw: 0.7, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    const curve = CURVES[state.curve];
    const t = timeOf(state);
    const p = curve.r(t);
    const f = frame(curve, t);
    cam.axes({ size: 4.2 });
    drawCurve(cam, curve, { color: c.grid, width: 3 });
    if (f.N && 1 / f.kappa < MAX_R) {
      const R = 1 / f.kappa;
      const centre = add(p, scale(f.N, R));
      let last = p;
      for (let i = 1; i <= 64; i++) {
        const ph = (i / 64) * 2 * Math.PI;
        const q = add(centre, add(scale(f.N, -R * Math.cos(ph)), scale(f.T, R * Math.sin(ph))));
        cam.line(last, q, { color: c.a, width: 3 });
        last = q;
      }
      cam.line(p, centre, { color: c.a, width: 2, dash: [4, 4] });
      cam.point(centre, { fill: c.a, r: 4 });
    }
    cam.arrow(p, add(p, scale(f.T, 1.5)), { color: c.b, width: 4 });
    cam.point(p, { fill: c.ink, r: 6 });
  },
  controls: [
    { title: 'Move along the curve' },
    { key: 'curve', label: 'Curve', options: curveOptions },
    { key: 'u', label: 'Position along the curve', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { readout: [
      ['Curvature κ', (s) => fixed(frame(CURVES[s.curve], timeOf(s)).kappa, 4)],
      ['Radius 1/κ', (s) => { const k = frame(CURVES[s.curve], timeOf(s)).kappa; return k < 1e-6 ? 'straight' : fixed(1 / k, 3); }],
    ] },
  ],
  tex: (s) => {
    const k = frame(CURVES[s.curve], timeOf(s)).kappa;
    return `\\kappa = \\dfrac{|\\mathbf{r}'\\times\\mathbf{r}''|}{|\\mathbf{r}'|^3} = ${fixed(k, 4)},\\quad R = \\dfrac{1}{\\kappa} = ${k < 1e-6 ? '\\infty' : fixed(1 / k, 3)}`;
  },
});
tool.extra.orbit(tool.update);
