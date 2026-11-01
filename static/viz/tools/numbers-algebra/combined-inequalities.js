import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { combined, intervalTex, intervalText } from './_inequalities-math.js';
import { lineFigure } from './_inequalities-view.js';

const state = { lo: 3, hi: 9, m: 2, k: 1 };
const n = (v) => fixed(v, 2);
const sol = (s = state) => combined(s.lo, s.hi, s.m, s.k);
const sg = (v) => (v < 0 ? `-${Math.abs(v)}` : `+${v}`);
const expr = (s) => `${s.m === 1 ? '' : s.m === -1 ? '-' : s.m}x${sg(s.k)}`;

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'A number line with the solution interval of the combined inequality shaded, followed by the worked steps');
const figure = lineFigure(stageEl, 'A number line with the solution interval shaded', [-10, 10], (ctx, nl, c) => {
  const s = sol();
  nl.span(s.from, s.to, { color: c.c, openA: s.openFrom, openB: s.openTo, width: 12 });
  nl.text(n(s.from), s.from, 40, { color: c.ink });
  nl.text(n(s.to), s.to, 40, { color: c.ink });
}, { step: 2 });

function steps(s) {
  const r = sol(s);
  const out = [
    { text: 'Do the same to all three parts. First undo the +k by subtracting it from each part:', tex: `${s.lo}<${expr(s)}\\le ${s.hi}\\ \\Rightarrow\\ ${s.lo - s.k}<${s.m === 1 ? '' : s.m === -1 ? '-' : s.m}x\\le ${s.hi - s.k}` },
  ];
  if (s.m !== 1) {
    out.push({
      text: s.m < 0 ? `Divide all three parts by ${s.m}. It is negative, so every inequality sign flips.` : `Divide all three parts by ${s.m}. It is positive, so the signs stay.`,
      tex: s.m < 0 ? `${n((s.lo - s.k) / s.m)}\\ge x>${n((s.hi - s.k) / s.m)}` : `${n((s.lo - s.k) / s.m)}<x\\le ${n((s.hi - s.k) / s.m)}`,
    });
  }
  out.push({ text: 'Write it with the smaller number on the left:', tex: `${n(r.from)}${r.openFrom ? '<' : '\\le'}x${r.openTo ? '<' : '\\le'}${n(r.to)}` });
  out.push({ text: 'As an interval. A round bracket means the end is not included, a square one means it is:', tex: `x\\in ${intervalTex([r])}` });
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `${s.lo}<${expr(s)}\\le ${s.hi}\\ \\Rightarrow\\ x\\in ${intervalTex([sol(s)])}`);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'a < m x + k ≤ b' },
    { key: 'lo', label: 'Lower end, a', min: -10, max: 10, step: 1 },
    { key: 'hi', label: 'Upper end, b', min: -8, max: 14, step: 1 },
    { key: 'm', label: 'Multiplier, m', min: -3, max: 3, step: 1 },
    { key: 'k', label: 'Added number, k', min: -6, max: 6, step: 1 },
    { readout: [
      ['Solution', (s) => intervalText([sol(s)])],
      ['Signs flipped?', (s) => ({ text: s.m < 0 ? 'yes' : 'no', good: s.m > 0 })],
    ] },
  ],
  onChange(s) {
    if (s.m === 0) s.m = 1;
    if (s.hi <= s.lo) s.hi = s.lo + 1;
    formula.update(s);
    figure.invalidate();
  },
});
