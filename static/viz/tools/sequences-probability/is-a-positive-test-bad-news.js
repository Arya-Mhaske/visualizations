import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { fixed, frac } from '../../lib/format.js';
import { illGivenPositive } from './_conditional-probability-bayes-math.js';

const PEOPLE = 100000;
const state = { prevalence: 0.1, detect: 99, falsePositive: 0.5, tests: 1 };
const rates = (s) => [s.prevalence / 100, s.detect / 100, s.falsePositive / 100];
const counts = (s) => {
  const [p, d, f] = rates(s);
  const ill = PEOPLE * p;
  const well = PEOPLE - ill;
  return { ill, well, illPlus: ill * d, wellPlus: well * f };
};
const once = (s) => illGivenPositive(...rates(s));
const twice = (s) => illGivenPositive(once(s), rates(s)[1], rates(s)[2]);
const shown = (s) => (s.tests === 2 ? twice(s) : once(s));
const n = (x) => fixed(x, 1);
const TABLE = (s) => {
  const k = counts(s);
  return [
    ['', 'Test +', 'Test −', 'All'],
    ['Ill', n(k.illPlus), n(k.ill - k.illPlus), n(k.ill)],
    ['Healthy', n(k.wellPlus), n(k.well - k.wellPlus), n(k.well)],
    ['All', n(k.illPlus + k.wellPlus), n(PEOPLE - k.illPlus - k.wellPlus), String(PEOPLE)],
  ];
};

createTool({
  state,
  label: 'A table of 100000 people sorted by illness and test result. The positive column is highlighted.',
  dom: (el) => cellGrid(el, {
    rows: 4,
    cols: 4,
    cell: (r, c) => ({ text: TABLE(state)[r][c], state: c === 1 && r === 1 ? 'both' : c === 1 && r === 2 ? 'mark' : '' }),
  }),
  controls: [
    { title: 'Count 100000 people' },
    { key: 'prevalence', label: 'Ill', min: 0.1, max: 20, step: 0.1, format: (v) => `${fixed(v, 1)}%` },
    { key: 'detect', label: 'Detected', min: 50, max: 100, step: 1, format: (v) => `${v}%` },
    { key: 'falsePositive', label: 'False positive', min: 0.1, max: 10, step: 0.1, format: (v) => `${fixed(v, 1)}%` },
    { key: 'tests', label: 'Positive tests in a row', options: [[1, 'One'], [2, 'Two']] },
    { readout: [
      ['P(ill | positive)', (s) => `${fixed(shown(s) * 100, 1)}%`],
      ['As a fraction', (s) => { const f = frac(once(s), 1000); return s.tests === 1 && f ? `${f.p}/${f.q}` : '—'; }],
      ['Healthy among positives', (s) => `${fixed((1 - shown(s)) * 100, 1)}%`],
    ] },
  ],
  tex: (s) => { const k = counts(s); return `P(\\text{ill} \\mid +) = \\frac{${n(k.illPlus)}}{${n(k.illPlus)} + ${n(k.wellPlus)}} = ${fixed(once(s), 4)}`; },
});
