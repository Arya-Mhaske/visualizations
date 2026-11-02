import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// Long division of polynomials (divisor monic, so every coefficient stays an integer) next to long division of whole numbers.
// Integers: keep going until the remainder is smaller than the divisor. Polynomials: until its degree is smaller.
const PRESETS = {
  a: { name: '(x³ + 2x² − 5x + 6) ÷ (x − 1)', p: [6, -5, 2, 1], d: [-1, 1] },
  b: { name: '(2x³ − 3x² + 4x − 5) ÷ (x² + 1)', p: [-5, 4, -3, 2], d: [1, 0, 1] },
  c: { name: '(x⁴ + 3x³ + x + 2) ÷ (x² + x + 1)', p: [2, 1, 0, 3, 1], d: [1, 1, 1] },
};
const state = { which: 'a', a: 2847, b: 12 };

export const degree = (p) => { for (let i = p.length - 1; i >= 0; i--) if (p[i] !== 0) return i; return -1; };
export function polyTex(p) {
  const parts = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const k = p[i];
    if (!k) continue;
    const mag = Math.abs(k);
    const body = i === 0 ? `${mag}` : `${mag === 1 ? '' : mag}x${i > 1 ? `^{${i}}` : ''}`;
    parts.push(`${parts.length ? (k < 0 ? '-' : '+') : (k < 0 ? '-' : '')}${body}`);
  }
  return parts.length ? parts.join('') : '0';
}
export function polyDivide(p, d) {
  let r = [...p];
  const q = Array(Math.max(degree(p) - degree(d) + 1, 1)).fill(0);
  const log = [];
  while (degree(r) >= degree(d)) {
    const shift = degree(r) - degree(d);
    const k = r[degree(r)];
    q[shift] = k;
    const sub = d.map((v) => v * k);
    const before = [...r];
    for (let i = 0; i < sub.length; i++) r[i + shift] -= sub[i];
    log.push({ shift, k, before, after: [...r], sub: Array(shift).fill(0).concat(sub) });
  }
  return { q, r, log };
}
export function intDivide(a, b) {
  const rows = [];
  let rem = 0;
  let quotient = '';
  for (const ch of String(a)) {
    const cur = rem * 10 + Number(ch);
    const digit = Math.floor(cur / b);
    rem = cur - digit * b;
    quotient += digit;
    rows.push({ bring: ch, cur, digit, rem });
  }
  return { rows, q: Number(quotient), r: rem };
}

function steps(s) {
  const P = PRESETS[s.which];
  const out = polyDivide(P.p, P.d);
  const list = [{ text: 'Polynomials. Divide the leading term of what is left by the leading term of the divisor.', tex: `\\dfrac{${polyTex(P.p)}}{${polyTex(P.d)}}` }];
  out.log.forEach((st) => {
    list.push({ text: `Divide ${st.k}x^${degree(st.before)} by x^${degree(P.d)}: next quotient term ${st.k}x^${st.shift}. Subtract ${st.k}x^${st.shift} times the divisor. The degree drops from ${degree(st.before)} to ${degree(st.after)}.`, tex: `\\text{left: }${polyTex(st.after)}` });
  });
  list.push({ text: 'Stop when the degree of what is left is below the degree of the divisor.', tex: `${polyTex(P.p)}=(${polyTex(P.d)})(${polyTex(out.q)})+(${polyTex(out.r)})` });
  const ints = intDivide(s.a, s.b);
  list.push({ text: `Whole numbers. Divide ${s.a} by ${s.b} one digit at a time.` });
  ints.rows.forEach((r) => list.push({ text: `Bring down ${r.bring}: ${r.cur} ÷ ${s.b} gives ${r.digit}, remainder ${r.rem}.` }));
  list.push({ text: 'Stop when nothing is left to bring down: the remainder is smaller than the divisor.', tex: `${s.a}=${s.b}\\cdot ${ints.q}+${ints.r},\\quad 0\\le ${ints.r}<${s.b}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => { const P = PRESETS[s.which]; const out = polyDivide(P.p, P.d); return `p=dq+r,\\ \\deg r<\\deg d:\\ ${polyTex(out.q)},\\ ${polyTex(out.r)}`; });
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Divide both kinds' },
    { key: 'which', label: 'Polynomials', options: Object.entries(PRESETS).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'Whole number a', min: 100, max: 9999, step: 1 },
    { key: 'b', label: 'Divisor b', min: 2, max: 99, step: 1 },
    { readout: [
      ['Polynomial remainder', (s) => { const P = PRESETS[s.which]; return polyTex(polyDivide(P.p, P.d).r).replaceAll('^{', '^').replaceAll('}', ''); }],
      ['Integer remainder', (s) => String(intDivide(s.a, s.b).r)],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
