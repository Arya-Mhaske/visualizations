import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { sheetZ, sheetRho, sheetMass, sheetArea } from './_vector-calculus-math.js';

const state = { n: 4 };
const FINE = sheetMass(300);

const tool = createTool({
  state,
  label: 'A curved metal sheet whose density changes from one side to the other. The sheet is chopped into patches, shaded by density. Mass is the sum of density times patch area.',
  setup: (stage, c) => createCamera(stage, { extent: 4.6, yaw: 0.9, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    const n = Number(state.n);
    const h = 4 / n;
    cam.axes({ size: 3.4 });
    const faces = [];
    const P = (x, y) => [x, y, sheetZ(x, y)];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const [x0, y0] = [-2 + i * h, -2 + j * h];
      const rho = sheetRho(x0 + h / 2, y0 + h / 2);
      faces.push({ pts: [P(x0, y0), P(x0 + h, y0), P(x0 + h, y0 + h), P(x0, y0 + h)], fill: rho < 1.7 ? c.fillB : rho < 2.4 ? c.fillY : c.fillA, stroke: c.ink, width: 1.5 });
    }
    cam.faces(faces);
  },
  controls: [
    { title: 'Chop the sheet' },
    { key: 'n', label: 'Patches per side', min: 1, max: 14, step: 1 },
    { readout: [
      ['Patches', (s) => String(s.n * s.n)],
      ['Mass estimate Σ ρ ΔS', (s) => `${fixed(sheetMass(Number(s.n)), 3)} kg`],
      ['Mass (fine grid)', () => `${fixed(FINE, 3)} kg`],
      ['Sheet area', (s) => `${fixed(sheetArea(Number(s.n)), 3)} m²`],
    ] },
  ],
  tex: (s) => `m = \\iint_S \\rho\\,dS \\approx \\sum \\rho_i\\,\\Delta S_i = ${fixed(sheetMass(Number(s.n)), 3)}`,
});
tool.extra.orbit(tool.update);
