import { createTool } from '../../lib/tool.js';
import { bmat, inverse, matVec, mul } from './_sm-math.js';

// A = 1 … Z = 26. The message is cut into pairs, each pair is a column vector, and the key matrix multiplies it.
// A key with determinant 1 or −1 has a whole-number inverse, so decoding needs no fractions.
const KEYS = {
  a: { name: 'Key [[2, 1], [1, 1]]', K: [[2, 1], [1, 1]] },
  b: { name: 'Key [[3, 2], [1, 1]]', K: [[3, 2], [1, 1]] },
  c: { name: 'Key [[1, 1], [0, 1]]', K: [[1, 1], [0, 1]] },
};
const MESSAGES = { hi: 'MATH', cat: 'MELON', sun: 'SCHOOL' };
const state = { key: 'a', msg: 'hi' };
const text = (s) => (MESSAGES[s.msg].length % 2 ? `${MESSAGES[s.msg]}Z` : MESSAGES[s.msg]);
const nums = (s) => [...text(s)].map((ch) => ch.charCodeAt(0) - 64);
const pairs = (v) => v.reduce((out, x, i) => (i % 2 ? out : [...out, [x, v[i + 1]]]), []);
const encode = (s) => pairs(nums(s)).map((p) => matVec(KEYS[s.key].K, p));
const decode = (s) => encode(s).map((p) => matVec(inverse(KEYS[s.key].K), p).map(Math.round));
const letters = (v) => v.map((n) => (n >= 1 && n <= 26 ? String.fromCharCode(64 + n) : '·')).join('');

createTool({
  state,
  label: 'A message turned into numbers, scrambled by multiplying pairs of them by a key matrix, and then unscrambled by multiplying by the inverse of the key. The lines show the message, its numbers, the coded numbers and the decoded message.',
  dom(el) {
    const box = document.createElement('div');
    box.className = 'viz-worked';
    el.appendChild(box);
    return {
      refresh() {
        const rows = [
          ['Message', text(state)],
          ['Numbers (A = 1 … Z = 26)', nums(state).join(' ')],
          ['After multiplying by the key', encode(state).map((p) => p.join(' ')).join('  |  ')],
          ['Decoded with the inverse key', `${decode(state).flat().join(' ')}  →  ${letters(decode(state).flat())}`],
        ];
        box.replaceChildren(...rows.map(([name, value]) => {
          const d = document.createElement('div');
          d.className = 'nb-callout';
          d.textContent = `${name}:  ${value}`;
          return d;
        }));
      },
    };
  },
  controls: [
    { title: 'Choose a key' },
    { key: 'key', label: 'Key', options: Object.entries(KEYS).map(([k, v]) => [k, v.name]) },
    { key: 'msg', label: 'Message', options: [['hi', 'MATH'], ['cat', 'MELON'], ['sun', 'SCHOOL']] },
    { readout: [
      ['Inverse key', (s) => inverse(KEYS[s.key].K).map((r) => r.map(Math.round).join(' ')).join(' | ')],
      ['K × K⁻¹', (s) => mul(KEYS[s.key].K, inverse(KEYS[s.key].K)).map((r) => r.map((v) => Math.round(v)).join(' ')).join(' | ')],
    ] },
  ],
  tex: (s) => `C=K\\,M:\\quad K=${bmat(KEYS[s.key].K, (v) => String(v))},\\ \\ M=K^{-1}C`,
});
