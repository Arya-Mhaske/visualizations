import { createTool } from '../../lib/tool.js';
import { stepsView } from './_steps-view.js';
import { synthetic, tex, evalP } from './_poly.js';

const PRE = [{ p: [1, -6, 11, -6], r: 1 }, { p: [2, 3, -8, 3], r: 1 }, { p: [1, 0, -3, 1, -5], r: 2 }];
const state = { i: 0, step: 2 };
const cur = (s) => PRE[s.i];
let view;
function lines(s) {
  const { p, r } = cur(s);
  const sd = synthetic(p, r);
  const out = [{ tex: `\\text{coefficients: } ${p.join(',\\ ')}\\quad r=${r}`, note: 'divide by (x − r); write the coefficients, with a 0 for any missing power' }, { tex: `\\text{bring down } ${p[0]}`, note: `long division: ${tex([p[0], ...Array(p.length - 1).fill(0)])} ÷ x gives the first quotient term` }];
  for (let k = 1; k < p.length; k++) out.push({ tex: `${sd.b[k - 1]}\\times ${r}=${sd.b[k - 1] * r};\\quad ${p[k]}+${sd.b[k - 1] * r}=${sd.b[k]}`, note: k < p.length - 1 ? `long division: multiply, subtract, bring down the next term` : 'the last number is the remainder' });
  out.push({ tex: `p(x)=(x-${r})\\left(${tex(sd.q)}\\right)+${sd.rem}`, note: `remainder ${sd.rem} equals p(${r}) = ${evalP(p, r)}` });
  return out;
}
let tool;

tool = createTool({
  state,
  label: 'The worked steps of synthetic division beside the matching steps of long division, revealed one at a time.',
  dom: (el) => {
    view = stepsView(el);
    return { refresh: () => view.show(lines(state), state.step) };
  },
  controls: [
    { title: 'Divide by (x − r)' },
    { key: 'i', label: 'Problem', options: PRE.map((q, k) => [k, `${tex(q.p)} ÷ (x − ${q.r})`]) },
    { key: 'step', label: 'Steps shown', min: 1, max: 7, step: 1 },
    { readout: [['Remainder', (s) => String(synthetic(cur(s).p, cur(s).r).rem)], ['p(r)', (s) => String(evalP(cur(s).p, cur(s).r))]] },
  ],
  tex: (s) => `p(${cur(s).r})=${evalP(cur(s).p, cur(s).r)}`,
  onChange: (s) => {
    s.step = Math.min(s.step, lines(s).length);
    tool?.ui.refresh();
  },
});
