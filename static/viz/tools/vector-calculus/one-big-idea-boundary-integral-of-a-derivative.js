import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { BIG, TAU } from './_vector-calculus-math.js';

const state = { thm: 'ftc', s: 2 };
const INFO = {
  ftc: { name: 'Fundamental theorem of calculus', dim: '1D', bd: 'F(b) − F(a)', in: '∫ F′ dx', tex: '\\int_a^b F\'(x)\\,dx = F(b) - F(a)', boundary: 'the two end points', interior: 'the interval' },
  green: { name: 'Green\'s theorem', dim: '2D', bd: '∮ F · dr', in: '∬ (Q_x − P_y) dA', tex: '\\iint_R (Q_x - P_y)\\,dA = \\oint_{\\partial R}\\mathbf{F}\\cdot d\\mathbf{r}', boundary: 'the loop round the region', interior: 'the region' },
  stokes: { name: 'Stokes\' theorem', dim: '3D', bd: '∮ F · dr', in: '∬ curl F · n dS', tex: '\\iint_S (\\nabla\\times\\mathbf{F})\\cdot\\mathbf{n}\\,dS = \\oint_{\\partial S}\\mathbf{F}\\cdot d\\mathbf{r}', boundary: 'the rim of the surface', interior: 'the surface' },
  gauss: { name: 'Divergence (Gauss\'s) theorem', dim: '3D', bd: '∯ F · n dS', in: '∭ div F dV', tex: '\\iiint_V \\nabla\\cdot\\mathbf{F}\\,dV = \\oiint_{\\partial V}\\mathbf{F}\\cdot\\mathbf{n}\\,dS', boundary: 'the closed skin', interior: 'the solid' },
};
const values = (s) => BIG[s.thm](s.s);

const tool = createTool({
  state,
  label: 'One picture for each of four theorems: the boundary is drawn in green and the interior in coral. The integral of a derivative over the interior equals the integral of the original over the boundary.',
  setup: (stage, c) => createCamera(stage, { extent: 4.2, yaw: 0.8, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    const s = state.s;
    cam.axes({ size: 3.6 });
    const edge = (a, b, color, width) => cam.line(a, b, { color, width });
    if (state.thm === 'ftc') {
      let last = [0, 0, 0];
      for (let i = 1; i <= 40; i++) { const x = (i / 40) * s; const p = [x, 0, 0.18 * x ** 3]; cam.line(last, p, { color: c.grid, width: 3 }); last = p; }
      edge([0, 0, 0], [s, 0, 0], c.a, 8);
      cam.point([0, 0, 0], { fill: c.c, r: 9 });
      cam.point([s, 0, 0], { fill: c.c, r: 9 });
      cam.label('F(a)', [0, 0, -0.5], { size: 11 });
      cam.label('F(b)', [s, 0, -0.5], { size: 11 });
    } else if (state.thm === 'green') {
      cam.faces([{ pts: [[0, 0, 0], [s, 0, 0], [s, s, 0], [0, s, 0]], fill: c.fillA, stroke: c.fillA, width: 1 }]);
      const q = [[0, 0, 0], [s, 0, 0], [s, s, 0], [0, s, 0]];
      for (let k = 0; k < 4; k++) cam.arrow(q[k], q[(k + 1) % 4], { color: c.c, width: 5 });
    } else if (state.thm === 'stokes') {
      const P = (r, t) => [r * Math.cos(t), r * Math.sin(t), 0];
      const Q = (p, t) => [s * Math.sin(p) * Math.cos(t), s * Math.sin(p) * Math.sin(t), s * Math.cos(p)];
      const faces = [];
      for (let i = 0; i < 6; i++) for (let j = 0; j < 24; j++) {
        const [p0, p1, t0, t1] = [(i / 6) * (Math.PI / 2), ((i + 1) / 6) * (Math.PI / 2), (j / 24) * TAU, ((j + 1) / 24) * TAU];
        faces.push({ pts: [Q(p0, t0), Q(p1, t0), Q(p1, t1), Q(p0, t1)], fill: (i + j) % 2 ? c.fillA : c.fillY, stroke: c.fillY, width: 1 });
      }
      cam.faces(faces);
      let last = P(s, 0);
      for (let j = 1; j <= 64; j++) { const p = P(s, (j / 64) * TAU); cam.line(last, p, { color: c.c, width: 6 }); last = p; }
    } else {
      const v = [[0, 0, 0], [s, 0, 0], [s, s, 0], [0, s, 0], [0, 0, s], [s, 0, s], [s, s, s], [0, s, s]];
      const quads = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]];
      cam.faces(quads.map((q) => ({ pts: q.map((i) => v[i]), fill: c.fillC, stroke: c.c, width: 3 })));
      for (let i = 1; i < 4; i++) for (let j = 1; j < 4; j++) for (let k = 1; k < 4; k++) cam.point([(i * s) / 4, (j * s) / 4, (k * s) / 4], { fill: c.a, r: 3 });
    }
  },
  controls: [
    { title: 'One pattern, four theorems' },
    { key: 'thm', label: 'Theorem', options: Object.entries(INFO).map(([k, v]) => [k, `${v.dim} ${v.name}`]) },
    { key: 's', label: 'Size', min: 1, max: 3, step: 0.5 },
    { readout: [
      ['Boundary is', (s) => `${INFO[s.thm].boundary}`],
      ['Boundary integral', (s) => `${INFO[s.thm].bd} = ${fixed(values(s)[0], 3)}`],
      ['Interior integral', (s) => `${INFO[s.thm].in} = ${fixed(values(s)[1], 3)}`],
    ] },
  ],
  tex: (s) => INFO[s.thm].tex.replace('\\oiint', '\\oint'),
});
tool.extra.orbit(tool.update);
