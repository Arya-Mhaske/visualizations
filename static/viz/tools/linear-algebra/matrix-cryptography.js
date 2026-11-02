import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { bmat, mul } from './_la-math.js';

// Hill cipher: letters A..Z are 0..25. Take them two at a time, multiply by a 2 × 2 key matrix, and reduce mod 26.
// To decode you need the key's inverse mod 26, which exists only when det K shares no factor with 26.
const MESSAGES = { help: 'HELP', matrix: 'MATRIX', melon: 'MUSKMELON' };
const state = { msg: 'help', a: 3, b: 3, c: 2, d: 5 };
const K = (s) => [[s.a, s.b], [s.c, s.d]];
const mod = (n) => ((n % 26) + 26) % 26;
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const detK = (s) => mod(s.a * s.d - s.b * s.c);
const invertible = (s) => gcd(detK(s), 26) === 1;
function inverseKey(s) {
  if (!invertible(s)) return null;
  const inv = [...Array(26).keys()].find((x) => (x * detK(s)) % 26 === 1);
  return [[mod(inv * s.d), mod(-inv * s.b)], [mod(-inv * s.c), mod(inv * s.a)]];
}
const toNums = (text) => [...text].map((ch) => ch.charCodeAt(0) - 65);
const toText = (nums) => nums.map((n) => String.fromCharCode(65 + n)).join('');
function apply(Key, text) {
  const nums = toNums(text.length % 2 ? `${text}X` : text);
  const out = [];
  for (let i = 0; i < nums.length; i += 2) {
    const r = mul(Key, [[nums[i]], [nums[i + 1]]]);
    out.push(mod(r[0][0]), mod(r[1][0]));
  }
  return toText(out);
}
const plain = (s) => (MESSAGES[s.msg].length % 2 ? `${MESSAGES[s.msg]}X` : MESSAGES[s.msg]);
const cipher = (s) => apply(K(s), MESSAGES[s.msg]);
const decoded = (s) => (inverseKey(s) ? apply(inverseKey(s), cipher(s)) : null);

createTool({
  state,
  label: 'A message scrambled two letters at a time by multiplying with a two by two key matrix and reducing mod 26. If the key has an inverse mod 26 the same message can be decoded by multiplying with that inverse. If the determinant of the key shares a factor with 26, there is no inverse and the scrambled message cannot be read back.',
  dom(el, c) {
    el.classList.add('viz-stage--flow');
    const box = document.createElement('div');
    box.className = 'viz-worked';
    el.appendChild(box);
    void c;
    return {
      refresh() {
        const rows = [
          ['Message', plain(state)],
          ['Scrambled', cipher(state)],
          ['Decoded', decoded(state) ?? 'impossible: the key has no inverse mod 26'],
        ];
        box.replaceChildren(...rows.map(([name, value]) => {
          const li = document.createElement('div');
          li.className = 'nb-callout';
          li.textContent = `${name}:  ${value}`;
          return li;
        }));
      },
    };
  },
  controls: [
    { title: 'Choose a key' },
    { key: 'msg', label: 'Message', options: [['help', 'HELP'], ['matrix', 'MATRIX'], ['melon', 'MUSKMELON']] },
    { key: 'a', label: 'Key: top-left', min: 0, max: 25, step: 1, format: (n) => `${n}` },
    { key: 'b', label: 'Key: top-right', min: 0, max: 25, step: 1, format: (n) => `${n}` },
    { key: 'c', label: 'Key: bottom-left', min: 0, max: 25, step: 1, format: (n) => `${n}` },
    { key: 'd', label: 'Key: bottom-right', min: 0, max: 25, step: 1, format: (n) => `${n}` },
    { readout: [
      ['det K mod 26', (s) => fixed(detK(s), 0)],
      ['Invertible mod 26?', (s) => ({ text: invertible(s) ? 'yes (det shares no factor with 26)' : 'no', good: invertible(s) })],
      ['Inverse key', (s) => (inverseKey(s) ? inverseKey(s).map((r) => r.join(' ')).join(' | ') : 'none')],
    ] },
  ],
  tex: (s) => `\\mathbf c\\equiv K\\mathbf m\\pmod{26},\\quad K=${bmat(K(s), (v) => fixed(v, 0))},\\ \\det K\\equiv${detK(s)}`,
});
