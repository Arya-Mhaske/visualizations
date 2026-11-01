import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { CURVES, frame, add, sub, scale, norm, dot } from './_space-curves-math.js';
import { drawCurve, curveOptions } from './_space-curves-view.js';

const state = { curve: 'helix', u: 0.55, h: 1 };
const cur = () => CURVES[state.curve];
const timeOf = (s) => { const [lo, hi] = CURVES[s.curve].range; return lo + s.u * (hi - lo); };
const pos = (s) => CURVES[s.curve].r(timeOf(s));

const tool = createTool({
  state,
  label: 'A point on a space curve with its velocity arrow, acceleration arrow, and a chord to a later point. Shrink the time gap h and the chord lines up with the velocity.',
  setup: (stage, c) => createCamera(stage, { extent: 6, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const curve = cur();
    const p = pos(state);
    const f = frame(curve, timeOf(state));
    cam.axes({ size: 4.2 });
    drawCurve(cam, curve, { color: c.grid, width: 3 });
    const q = curve.r(timeOf(state) + state.h);
    cam.line(p, q, { color: c.d, width: 3, dash: [5, 4] });
    cam.point(q, { fill: c.d, r: 5 });
    cam.arrow(p, add(p, f.v), { color: c.a, width: 5 });
    cam.arrow(p, add(p, f.a), { color: c.b, width: 5 });
    cam.point(p, { fill: c.ink, r: 6 });
    cam.label('v', add(p, scale(f.v, 1.15)), { size: 13, color: c.a });
    cam.label('a', add(p, scale(f.a, 1.15)), { size: 13, color: c.b });
  },
  controls: [
    { title: 'Move along the curve' },
    { key: 'curve', label: 'Curve', options: curveOptions },
    { key: 'u', label: 'Position along the curve', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'h', label: 'Gap h (chord)', min: 0.05, max: 2, step: 0.05 },
    { readout: [
      ['v', (s) => `(${frame(CURVES[s.curve], timeOf(s)).v.map((v) => fixed(v, 2)).join(', ')})`],
      ['a', (s) => `(${frame(CURVES[s.curve], timeOf(s)).a.map((v) => fixed(v, 2)).join(', ')})`],
      ['Chord vs v', (s) => {
        const curve = CURVES[s.curve];
        const chord = sub(curve.r(timeOf(s) + s.h), curve.r(timeOf(s)));
        const v = curve.v(timeOf(s));
        return `${fixed(Math.acos(Math.min(1, dot(chord, v) / (norm(chord) * norm(v)))) * 180 / Math.PI, 1)}° apart`;
      }],
    ] },
  ],
  tex: (s) => `\\mathbf{v} = \\lim_{h\\to 0}\\dfrac{\\mathbf{r}(t+h)-\\mathbf{r}(t)}{h}`,
});
tool.extra.orbit(tool.update);
