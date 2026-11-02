import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// A message is a polynomial over ℤ₂ (bits are coefficients). Divide M(x)·x^r by the generator G(x); the remainder is the check
// bits. Sending M followed by the remainder makes the whole word divisible by G. Receiver: divide again; a non-zero remainder is an error.
const MESSAGES = { a: '11010011101100', b: '1101', c: '101101' };
const GENS = { p: ['1011', 'x³ + x + 1'], q: ['111', 'x² + x + 1'], r: ['10011', 'x⁴ + x + 1'] };
const state = { msg: 'a', gen: 'p', flip: 3 };

const xor = (a, b) => [...a].map((x, i) => (x === b[i] ? '0' : '1')).join('');
export function crc(bits, g) {
  const r = g.length - 1;
  let work = bits + '0'.repeat(r);
  const log = [];
  for (let i = 0; i < bits.length; i++) {
    if (work[i] !== '1') continue;
    const aligned = '0'.repeat(i) + g + '0'.repeat(work.length - i - g.length);
    const after = xor(work, aligned);
    log.push({ i, before: work, aligned, after });
    work = after;
  }
  return { remainder: work.slice(bits.length), log };
}
export function check(word, g) {
  let work = word;
  for (let i = 0; i + g.length <= word.length; i++) if (work[i] === '1') work = xor(work, '0'.repeat(i) + g + '0'.repeat(work.length - i - g.length));
  return work.slice(word.length - g.length + 1);
}
const word = (s) => MESSAGES[s.msg] + crc(MESSAGES[s.msg], GENS[s.gen][0]).remainder;
const received = (s) => { const w = word(s); return s.flip >= 1 && s.flip <= w.length ? w.slice(0, s.flip - 1) + (w[s.flip - 1] === '1' ? '0' : '1') + w.slice(s.flip) : w; };
const mono = (t) => `\\mathtt{${t}}`;

function steps(s) {
  const g = GENS[s.gen][0];
  const m = MESSAGES[s.msg];
  const out = crc(m, g);
  const list = [
    { text: `The bits are coefficients of a polynomial over ℤ₂. The generator ${GENS[s.gen][1]} is the bit string ${g}.`, tex: `M=${mono(m)},\\quad G=${mono(g)}` },
    { text: `Add ${g.length - 1} zeros to the message: this multiplies M(x) by x^${g.length - 1}.`, tex: mono(m + '0'.repeat(g.length - 1)) },
  ];
  out.log.forEach((st) => list.push({ text: `A 1 sits at place ${st.i + 1}. Subtract (XOR) the generator from there. In ℤ₂, subtracting is the same as adding.`, tex: `${mono(st.before)}\\oplus ${mono(st.aligned)}=${mono(st.after)}` }));
  list.push({ text: `No 1 is left in the message part. The last ${g.length - 1} bits are the remainder.`, tex: `\\text{check bits}=${mono(out.remainder)}` });
  list.push({ text: 'Send the message followed by the check bits.', tex: mono(word(s)) });
  const rem = check(received(s), g);
  list.push({ text: s.flip >= 1 ? `The channel flips bit ${s.flip}. The receiver divides what arrived by the generator.` : 'Nothing is flipped. The receiver divides what arrived by the generator.', tex: `${mono(received(s))}\\ \\to\\ \\text{remainder}\\ ${mono(rem)}` });
  list.push({ text: /^0*$/.test(rem) ? 'Remainder zero: the word looks fine.' : 'Remainder not zero: an error is detected.' });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `M(x)\\,x^{${GENS[s.gen][0].length - 1}}=Q(x)G(x)+R(x),\\quad R=${mono(crc(MESSAGES[s.msg], GENS[s.gen][0]).remainder)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Send a message' },
    { key: 'msg', label: 'Message bits', options: Object.entries(MESSAGES) },
    { key: 'gen', label: 'Generator', options: Object.entries(GENS).map(([k, v]) => [k, v[1]]) },
    { key: 'flip', label: 'Flip bit number (0 = none)', min: 0, max: 20, step: 1, format: (v) => (v > word(state).length ? 'none' : String(v)) },
    { readout: [
      ['Check bits', (s) => crc(MESSAGES[s.msg], GENS[s.gen][0]).remainder],
      ['Sent', (s) => word(s)],
      ['Received', (s) => received(s)],
      ['Receiver\'s remainder', (s) => { const r = check(received(s), GENS[s.gen][0]); return { text: r, good: /^0*$/.test(r) }; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
