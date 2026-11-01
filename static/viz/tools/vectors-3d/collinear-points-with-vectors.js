import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { add, scale, sub, collinear } from './_vectors-in-space-math.js';

const A = [-2, -1, 0];
const B = [2, 1, 2];
const state = { t: 1.5, lift: 0 };
const AB = sub(B, A);
const C = (s) => add(add(A, scale(AB, s.t)), [0, 0, s.lift]);

const tool = createTool({
  state,
  label: 'Points A and B, and a third point C that can be slid along the line AB or lifted off it.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const P = C(state);
    const res = collinear(A, B, P);
    cam.axes({ size: 6 });
    cam.line(A.map((v, i) => v - 2 * AB[i]), B.map((v, i) => v + 2 * AB[i]), { color: c.grid, width: 2, dash: [6, 4] });
    cam.arrow(A, B, { color: c.b, width: 4 });
    cam.arrow(A, P, { color: res.yes ? c.c : c.a, width: 4 });
    cam.point(A, { fill: c.ink, r: 6 });
    cam.point(B, { fill: c.b, r: 7 });
    cam.point(P, { fill: res.yes ? c.c : c.a, r: 8 });
    cam.label('A', A.map((v, i) => v + (i === 2 ? 0.8 : 0.3)), { size: 13 });
    cam.label('B', B.map((v, i) => v + (i === 2 ? 0.8 : 0.3)), { size: 13, color: c.b });
    cam.label('C', P.map((v, i) => v + (i === 2 ? 0.8 : 0.3)), { size: 13, color: res.yes ? c.c : c.a });
  },
  controls: [
    { title: 'Slide C along the line, or lift it off' },
    { key: 't', label: 'Slide C', min: -2, max: 3, step: 0.5 },
    { key: 'lift', label: 'Lift C up', min: 0, max: 3, step: 1 },
    { readout: [
      ['AB', () => `(${AB.join(', ')})`],
      ['AC', (s) => `(${sub(C(s), A).map((v) => fixed(v, 1)).join(', ')})`],
      ['Ratios AB/AC', (s) => { const ac = sub(C(s), A); return ac.map((v, i) => (v === 0 ? '–' : fixed(AB[i] / v, 2))).join(' , '); }],
      ['Collinear?', (s) => (collinear(A, B, C(s)).yes ? 'yes' : 'no')],
    ] },
  ],
  tex: (s) => {
    const r = collinear(A, B, C(s));
    if (r.yes && r.lambda !== null) return `\\overrightarrow{AB} = ${fixed(r.lambda, 2)}\\,\\overrightarrow{AC}`;
    if (r.yes) return '\\text{C = A: any line through A works.}';
    return '\\overrightarrow{AB} \\ne \\lambda\\,\\overrightarrow{AC}\\ \\text{for any } \\lambda';
  },
});
tool.extra.orbit(tool.update);
