import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { solveCase } from './_triangle-math.js';
import { triangleFigure } from './_tri-view.js';

const state = { kind: 'ASA', A: 40, B: 65, C: 60, a: 6, b: 8, c: 7 };
const SHOWN = { ASA: ['A', 'B', 'c'], AAS: ['A', 'B', 'a'], SSA: ['A', 'a', 'b'], SAS: ['a', 'b', 'C'], SSS: ['a', 'b', 'c'] };
const ORDER = ['A', 'B', 'C', 'a', 'b', 'c'];
const n = (x) => fixed(x, 2);
const d = (x) => `${fixed(x, 1)}^\\circ`;
const all = (s) => solveCase(s.kind, s);

const figure = triangleFigure(document.querySelector('#stage'), () => all(state), { label: 'The triangle that fits the numbers you chose, or two triangles when the case is SSA' });

function steps(s) {
  const sol = all(s);
  const t = sol[0];
  if (!sol.length) return [{ text: s.kind === 'SSS' ? 'The longest side must be shorter than the other two added together. No triangle fits.' : s.kind === 'SSA' ? 'Law of sines: sin B = b sin A ÷ a is bigger than 1, so no triangle fits.' : 'The angles must add to less than 180°. No triangle fits.' }];
  if (s.kind === 'ASA' || s.kind === 'AAS') {
    const pair = s.kind === 'ASA' ? ['c', 'C'] : ['a', 'A'];
    return [
      { text: `${s.kind}: two angles and a side. The angles of a triangle add to 180°, so the third angle comes first.`, tex: `C=180^\\circ-A-B=180^\\circ-${d(s.A)}-${d(s.B)}=${d(t.C)}` },
      { text: `Now the side ${pair[0]} and its opposite angle ${pair[1]} are both known: a complete pair. That is exactly what the law of sines needs.`, tex: `\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=\\dfrac{c}{\\sin C}=\\dfrac{${n(t[pair[0]])}}{\\sin ${d(t[pair[1]])}}=${n(t[pair[0]] / Math.sin((t[pair[1]] * Math.PI) / 180))}` },
      { text: 'Multiply by the sine of each angle to get the other two sides:', tex: `a=${n(t.a)},\\quad b=${n(t.b)},\\quad c=${n(t.c)}` },
    ];
  }
  if (s.kind === 'SAS') {
    const small = t.a <= t.b ? ['A', 'a'] : ['B', 'b'];
    return [
      { text: 'SAS: two sides and the angle between them. No side is paired with its opposite angle yet, so the law of sines cannot start. The law of cosines can:', tex: `c^2=a^2+b^2-2ab\\cos C=${n(s.a * s.a)}+${n(s.b * s.b)}-${n(2 * s.a * s.b * Math.cos((s.C * Math.PI) / 180))}=${n(t.c * t.c)}\\ \\Rightarrow\\ c=${n(t.c)}` },
      { text: `Now c and C form a pair. Use the law of sines for the angle opposite the shorter of a and b (here ${small[1]}), because that angle cannot be obtuse and there is no ambiguity:`, tex: `\\sin ${small[0]}=\\dfrac{${small[1]}\\sin C}{c}\\ \\Rightarrow\\ ${small[0]}=${d(t[small[0]])}` },
      { text: 'The last angle comes from the 180° total:', tex: `A=${d(t.A)},\\quad B=${d(t.B)},\\quad C=${d(t.C)}` },
    ];
  }
  if (s.kind === 'SSS') {
    const sides = ['a', 'b', 'c'];
    const big = sides.reduce((m, k) => (t[k] >= t[m] ? k : m), 'a');
    const rest = sides.filter((k) => k !== big).sort((p, q) => t[p] - t[q]);
    const small = rest[0];
    const BIG = big.toUpperCase();
    const SMALL = small.toUpperCase();
    return [
      { text: 'SSS: three sides, no angle. No side has its opposite angle yet, so use the law of cosines. Start with the largest angle, opposite the longest side, because only a large angle can be obtuse:', tex: `\\cos ${BIG}=\\dfrac{${rest[0]}^2+${rest[1]}^2-${big}^2}{2${rest[0]}${rest[1]}}=\\dfrac{${n(t[rest[0]] ** 2)}+${n(t[rest[1]] ** 2)}-${n(t[big] ** 2)}}{${n(2 * t[rest[0]] * t[rest[1]])}}\\ \\Rightarrow\\ ${BIG}=${d(t[BIG])}` },
      { text: `Now ${big} and ${BIG} are a pair, so the law of sines is quicker for the smallest angle (${SMALL}), which cannot be obtuse:`, tex: `\\sin ${SMALL}=\\dfrac{${small}\\sin ${BIG}}{${big}}=\\dfrac{${n(t[small])}\\sin ${d(t[BIG])}}{${n(t[big])}}\\ \\Rightarrow\\ ${SMALL}=${d(t[SMALL])}` },
      { text: 'The last angle makes the total 180°:', tex: `${d(t.A)}+${d(t.B)}+${d(t.C)}=${d(t.A + t.B + t.C)}` },
    ];
  }
  const out = [
    { text: 'SSA: two sides and an angle not between them. The pair a and A is known, so the law of sines starts, but it may give two angles:', tex: `\\sin B=\\dfrac{b\\sin A}{a}=\\dfrac{${n(s.b)}\\sin ${d(s.A)}}{${n(s.a)}}=${fixed((s.b * Math.sin((s.A * Math.PI) / 180)) / s.a, 4)}` },
    { text: sol.length === 2 ? 'Both B and 180° − B fit, because each leaves room for a positive angle C. Two triangles:' : 'Only one of B and 180° − B leaves room for the angle C, so one triangle fits:', tex: sol.map((x, i) => `B_${i + 1}=${d(x.B)},\\ C_${i + 1}=${d(x.C)},\\ c_${i + 1}=${n(x.c)}`).join(',\\quad ') },
  ];
  if (sol.length === 2) out.push({ text: 'The second triangle is drawn dashed in the figure. Both match every number you were given.' });
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => {
  const sol = all(s);
  return sol.length ? sol.map((t) => `A=${d(t.A)},B=${d(t.B)},C=${d(t.C)};\\ a=${n(t.a)},b=${n(t.b)},c=${n(t.c)}`).join('\\ \\ \\text{or}\\ \\ ') : '\\text{no triangle}';
});
formula.update(state);

const fields = [];
function showFields() {
  fields.forEach((field, i) => { field.hidden = i > 0 && !SHOWN[state.kind].includes(ORDER[i - 1]); });
}

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'What are you given?' },
    { key: 'kind', label: 'Case', options: [['ASA', 'ASA'], ['AAS', 'AAS'], ['SSA', 'SSA'], ['SAS', 'SAS'], ['SSS', 'SSS']] },
    { key: 'A', label: 'Angle A', min: 10, max: 150, step: 1, format: (v) => `${v}°` },
    { key: 'B', label: 'Angle B', min: 10, max: 150, step: 1, format: (v) => `${v}°` },
    { key: 'C', label: 'Angle C', min: 10, max: 150, step: 1, format: (v) => `${v}°` },
    { key: 'a', label: 'Side a', min: 2, max: 12, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'b', label: 'Side b', min: 2, max: 12, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'c', label: 'Side c', min: 2, max: 12, step: 0.5, format: (v) => fixed(v, 1) },
    { readout: [
      ['Rule of thumb', (s) => ({ ASA: 'Third angle, then sines', AAS: 'Third angle, then sines', SSA: 'Sines (watch for two)', SAS: 'Cosines, then sines', SSS: 'Cosines' }[s.kind])],
      ['Triangles that fit', (s) => String(all(s).length)],
    ] },
  ],
  onChange(s) {
    showFields();
    formula.update(s);
    figure.invalidate();
  },
});
fields.push(...document.querySelectorAll('#panel .nb-field'));
showFields();
