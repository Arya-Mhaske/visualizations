import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { domeZ, domeFlux, rimCirculation, TAU } from './_vector-calculus-math.js';

const state = { h: 1.5, k: 0 };
const RIM = 2;
const rimValue = rimCirculation();

const tool = createTool({
  state,
  label: 'A butterfly net over a circular rim. The rim is fixed. The net can be raised into a dome or tilted. The circulation round the rim and the curl through the net stay equal.',
  setup: (stage, c) => createCamera(stage, { extent: 3.6, yaw: 0.8, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    const { h, k } = state;
    cam.axes({ size: 3.2 });
    const rings = 8;
    const sectors = 28;
    const P = (r, t) => [r * Math.cos(t), r * Math.sin(t), domeZ(h, k, r * Math.cos(t), r * Math.sin(t))];
    const faces = [];
    for (let i = 0; i < rings; i++) for (let j = 0; j < sectors; j++) {
      const [r0, r1] = [(i / rings) * RIM, ((i + 1) / rings) * RIM];
      const [t0, t1] = [(j / sectors) * TAU, ((j + 1) / sectors) * TAU];
      faces.push({ pts: [P(r0, t0), P(r1, t0), P(r1, t1), P(r0, t1)], fill: (i + j) % 2 ? c.fillY : c.fillA, stroke: c.fillY, width: 1 });
    }
    cam.faces(faces);
    let last = P(RIM, 0);
    for (let j = 1; j <= 64; j++) {
      const q = P(RIM, (j / 64) * TAU);
      cam.line(last, q, { color: c.ink, width: 5 });
      last = q;
    }
    // curl F = (1, 1, 2), drawn from the middle of the net.
    const top = P(0, 0);
    cam.arrow(top, [top[0] + 0.7, top[1] + 0.7, top[2] + 1.4], { color: c.a, width: 4 });
    cam.label('curl F', [top[0] + 0.9, top[1] + 0.9, top[2] + 1.8], { size: 11, color: c.a });
  },
  controls: [
    { title: 'Reshape the net, keep the rim' },
    { key: 'h', label: 'Height of the net', min: 0, max: 3, step: 0.25 },
    { key: 'k', label: 'Lean to one side', min: -1, max: 1, step: 0.5 },
    { readout: [
      ['∮ F · dr round the rim', () => fixed(rimValue, 3)],
      ['∬ curl F · n dS over the net', (s) => fixed(domeFlux(s.h, s.k), 3)],
      ['8π', () => fixed(8 * Math.PI, 3)],
    ] },
  ],
  tex: () => '\\oint_{\\partial S}\\mathbf{F}\\cdot d\\mathbf{r} = \\iint_S (\\nabla\\times\\mathbf{F})\\cdot\\mathbf{n}\\,dS',
});
tool.extra.orbit(tool.update);
