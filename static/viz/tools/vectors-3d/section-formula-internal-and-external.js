import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { internal, external } from './_vectors-in-space-math.js';

const P = [-2, -1, 1];
const Q = [2, 2, 3];
const state = { mode: 'in', m: 2, n: 1 };
const point = (s) => (s.mode === 'in' ? internal(P, Q, s.m, s.n) : external(P, Q, s.m, s.n));

const tool = createTool({
  state,
  label: 'A segment PQ extended into a long line. R divides PQ internally, between P and Q, or externally, on the extended line.',
  setup: (stage, c) => createCamera(stage, { extent: 9, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const R = point(state);
    const d = Q.map((v, i) => v - P[i]);
    cam.axes({ size: 8 });
    cam.line(P.map((v, i) => v - 4 * d[i]), Q.map((v, i) => v + 4 * d[i]), { color: c.grid, width: 2, dash: [6, 4] });
    cam.line(P, Q, { color: c.ink, width: 4 });
    cam.point(P, { fill: c.a, r: 7 });
    cam.point(Q, { fill: c.b, r: 7 });
    cam.label('P', P.map((v, i) => v + (i === 2 ? 0.8 : 0.3)), { size: 13, color: c.a });
    cam.label('Q', Q.map((v, i) => v + (i === 2 ? 0.8 : 0.3)), { size: 13, color: c.b });
    if (R) {
      cam.point(R, { fill: c.c, r: 8 });
      cam.label('R', R.map((v, i) => v + (i === 2 ? 0.8 : 0.3)), { size: 13, color: c.c });
    }
  },
  controls: [
    { title: 'Divide PQ in the ratio m : n' },
    { key: 'mode', label: 'Divide', options: [['in', 'Internally'], ['out', 'Externally']] },
    { key: 'm', label: 'm', min: 1, max: 6, step: 1 },
    { key: 'n', label: 'n', min: 1, max: 6, step: 1 },
    { readout: [
      ['R', (s) => { const r = point(s); return r ? `(${r.map((v) => fixed(v, 2)).join(', ')})` : 'none: m = n'; }],
      ['Where', (s) => (s.mode === 'in' ? 'between P and Q' : s.m > s.n ? 'beyond Q' : s.m < s.n ? 'beyond P' : 'nowhere')],
    ] },
  ],
  tex: (s) => (s.mode === 'in'
    ? `\\mathbf{r} = \\dfrac{${s.n}\\,\\mathbf{p} + ${s.m}\\,\\mathbf{q}}{${s.m} + ${s.n}}`
    : (s.m === s.n ? '\\text{m = n: the line PQ never meets itself, so no external point.}'
      : `\\mathbf{r} = \\dfrac{${s.m}\\,\\mathbf{q} - ${s.n}\\,\\mathbf{p}}{${s.m} - ${s.n}}`)),
});
tool.extra.orbit(tool.update);
