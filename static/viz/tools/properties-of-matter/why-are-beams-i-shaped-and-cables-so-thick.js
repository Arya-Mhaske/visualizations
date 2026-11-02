import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { view: 'beam', F: 20000, L: 3, sf: 10 };
// Same cross-section area 0.01 m²: flat plank 0.4 x 0.025, upright plank 0.025 x 0.4, I-beam (flanges 0.2 x 0.02 and web 0.02 x 0.3 = 0.0092 + ... scaled).
const I = { flat: (0.4 * 0.025 ** 3) / 12, upright: (0.025 * 0.4 ** 3) / 12, ibeam: 2 * ((0.2 * 0.02 ** 3) / 12 + 0.2 * 0.02 * 0.16 ** 2) + (0.02 * 0.3 ** 3) / 12 };
const defl = (s, i) => (s.F * s.L ** 3) / (48 * 2e11 * i) * 1000;
const dia = (s) => 2 * Math.sqrt((s.F * s.sf) / (4e8 * Math.PI)) * 1000;
let sync = () => {};

barTool({
  state,
  label: 'Either bars for the sag of three beams of similar weight under the same load, or the cable diameter needed to carry the load with a safety factor.',
  rows: (s, c) => (s.view === 'beam' ? [['flat plank', defl(s, I.flat), c.fillA, `${sig(defl(s, I.flat), 3)} mm`], ['upright plank', defl(s, I.upright), c.fillB, `${sig(defl(s, I.upright), 3)} mm`], ['I-beam', defl(s, I.ibeam), c.fillC, `${sig(defl(s, I.ibeam), 3)} mm`]] : [['load', s.F, c.fillA, `${s.F} N`], ['cable diameter', dia(s), c.fillB, `${sig(dia(s), 3)} mm`]]),
  max: (s) => (s.view === 'beam' ? defl(s, I.flat) : Math.max(s.F, 1)),
  left: 0.3,
  controls: [
    { title: 'Design' },
    { key: 'view', label: 'Design', options: [['beam', 'Beam'], ['cable', 'Cable']] },
    { key: 'F', label: 'Load F (N)', min: 1000, max: 100000, step: 1000 },
    { key: 'L', label: 'Beam span (m)', min: 1, max: 5, step: 0.5 },
    { key: 'sf', label: 'Safety factor', min: 2, max: 20, step: 1 },
    { readout: [['Second moment: flat | upright | I', () => `${sig(I.flat, 2)} | ${sig(I.upright, 2)} | ${sig(I.ibeam, 2)} m⁴`], ['Cable stress', (s) => `${sig(4e8 / s.sf / 1e6, 3)} MPa allowed`]] },
  ],
  tex: (s) => (s.view === 'beam' ? `\\delta=\\dfrac{FL^3}{48YI}` : `A=\\dfrac{F\\times\\text{SF}}{\\sigma_b}`),
  onChange: (s) => sync(s),
});
sync = (s) => {
  const f = [...document.querySelectorAll('#panel .nb-field')];
  f[2].hidden = s.view !== 'beam';
  f[3].hidden = s.view !== 'cable';
};
sync(state);
void G;
