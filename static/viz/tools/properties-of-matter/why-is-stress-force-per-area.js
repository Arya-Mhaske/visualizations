import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { F: 600, d1: 1, d2: 3 };
const st = (F, d) => F / (Math.PI * (d / 2000) ** 2) / 1e6;
const LIM = 400;

barTool({
  state,
  label: 'Bars of the stress in a thin wire and a thick wire carrying the same load, with a bar for the breaking stress of steel. A wire whose stress exceeds the limit snaps.',
  rows: (s, c) => [['thin wire', st(s.F, s.d1), st(s.F, s.d1) > LIM ? c.fillA : c.fillC, `${sig(st(s.F, s.d1), 3)} MPa`], ['thick wire', st(s.F, s.d2), st(s.F, s.d2) > LIM ? c.fillA : c.fillC, `${sig(st(s.F, s.d2), 3)} MPa`], ['breaking stress', LIM, c.fillB, `${LIM} MPa`]],
  max: 800,
  left: 0.3,
  controls: [
    { title: 'Two wires, one load' },
    { key: 'F', label: 'Load (N)', min: 100, max: 2000, step: 50 },
    { key: 'd1', label: 'Thin wire diameter (mm)', min: 0.5, max: 2, step: 0.25 },
    { key: 'd2', label: 'Thick wire diameter (mm)', min: 2, max: 5, step: 0.25 },
    { readout: [['Thin wire', (s) => (st(s.F, s.d1) > LIM ? 'breaks' : 'holds')], ['Thick wire', (s) => (st(s.F, s.d2) > LIM ? 'breaks' : 'holds')]] },
  ],
  tex: (s) => `\\sigma=\\dfrac FA:\\ ${sig(st(s.F, s.d1), 3)}\\ \\text{vs}\\ ${sig(st(s.F, s.d2), 3)}\\ \\mathrm{MPa}`,
});
