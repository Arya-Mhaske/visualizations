import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { internal, swapped } from './_vectors-in-space-math.js';

const P = [-3, -2, 1];
const Q = [5, 4, 5];
const state = { m: 1, n: 3, wrong: 'off' };
const fmt = (p) => `(${p.map((v) => fixed(v, 2)).join(', ')})`;

const tool = createTool({
  state,
  label: 'A segment from P to Q in space, cut into m + n equal parts. R sits m parts from P. A hollow marker shows the point you get by weighting the wrong way round.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const { m, n } = state;
    const R = internal(P, Q, m, n);
    cam.axes({ size: 6 });
    cam.line(P, R, { color: c.a, width: 6 });
    cam.line(R, Q, { color: c.b, width: 6 });
    const total = m + n;
    for (let i = 1; i < total; i++) {
      cam.point(internal(P, Q, i, total - i), { fill: c.grid, r: 3 });
    }
    cam.point(P, { fill: c.a, r: 7 });
    cam.point(Q, { fill: c.b, r: 7 });
    cam.point(R, { fill: c.c, r: 8 });
    cam.label('P', P.map((v, i) => v + (i === 2 ? 0.7 : 0.4)), { size: 13, color: c.a });
    cam.label('Q', Q.map((v, i) => v + (i === 2 ? 0.7 : 0.4)), { size: 13, color: c.b });
    cam.label('R', R.map((v, i) => v + (i === 2 ? 0.8 : 0.3)), { size: 13, color: c.c });
    if (state.wrong === 'on') {
      const W = swapped(P, Q, m, n);
      cam.point(W, { fill: c.fillY ?? c.grid, r: 7 });
      cam.label("R′ (weights swapped)", W.map((v, i) => v + (i === 2 ? 0.8 : 0)), { size: 11 });
    }
  },
  controls: [
    { title: 'Cut PQ in the ratio m : n' },
    { key: 'm', label: 'm (PR parts)', min: 1, max: 6, step: 1 },
    { key: 'n', label: 'n (RQ parts)', min: 1, max: 6, step: 1 },
    { key: 'wrong', label: 'Weights swapped?', options: [['off', 'Hide'], ['on', 'Show the slip']] },
    { readout: [
      ['PR : RQ', (s) => `${s.m} : ${s.n}`],
      ['Weight on p', (s) => `n/(m+n) = ${fixed(s.n / (s.m + s.n), 3)}`],
      ['Weight on q', (s) => `m/(m+n) = ${fixed(s.m / (s.m + s.n), 3)}`],
      ['R', (s) => fmt(internal(P, Q, s.m, s.n))],
      ['Slip R′', (s) => fmt(swapped(P, Q, s.m, s.n))],
    ] },
  ],
  tex: (s) => `\\mathbf{r} = \\dfrac{${s.n}\\,\\mathbf{p} + ${s.m}\\,\\mathbf{q}}{${s.m + s.n}}`,
});
tool.extra.orbit(tool.update);
