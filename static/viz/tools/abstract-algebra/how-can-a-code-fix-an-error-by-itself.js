import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { host, textBox } from './_aa-view.js';

// Hamming (7,4): positions 1..7 hold p1 p2 d1 p4 d2 d3 d4. Check c1 covers positions 1,3,5,7, check c2 covers 2,3,6,7,
// check c4 covers 4,5,6,7 (the positions whose binary number has that bit). The failed checks spell the bad position in binary.
const state = { d1: true, d2: false, d3: true, d4: true, err: 5 };
const CHECKS = [1, 2, 4];
const bitOf = (v) => (v ? 1 : 0);
const covers = (check, pos) => (pos & check) !== 0;

export function encode(d1, d2, d3, d4) {
  const w = [0, 0, 0, d1, 0, d2, d3, d4].map(bitOf);
  w[1] = w[3] ^ w[5] ^ w[7];
  w[2] = w[3] ^ w[6] ^ w[7];
  w[4] = w[5] ^ w[6] ^ w[7];
  return w.slice(1);
}
export function receive(sent, err) {
  const r = [...sent];
  if (err >= 1) r[err - 1] ^= 1;
  return r;
}
export const checkResult = (r, check) => r.reduce((x, bit, i) => (covers(check, i + 1) ? x ^ bit : x), 0);
export const syndrome = (r) => CHECKS.reduce((acc, ch) => acc + (checkResult(r, ch) ? ch : 0), 0);
const sentWord = (s) => encode(s.d1, s.d2, s.d3, s.d4);
const gotWord = (s) => receive(sentWord(s), s.err);

const tool = createTool({
  state,
  label: 'Seven bits of a Hamming codeword, with one possibly flipped. Below them three parity checks each cover some of the bits. A failed check is coral. The failed checks, read as a binary number, name the flipped bit.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Received bits (position 1 to 7). Parity bits sit at 1, 2 and 4.';
    const bitsGrid = cellGrid(host(el), {
      rows: 2, cols: 7,
      cell: (r, c) => {
        if (r === 0) return { text: String(c + 1), state: 'off' };
        const wrong = gotWord(state)[c] !== sentWord(state)[c];
        return { text: String(gotWord(state)[c]), state: wrong ? 'both' : [0, 1, 3].includes(c) ? 'mark' : 'on', label: `position ${c + 1}` };
      },
    });
    host(el, 'nb-label').textContent = 'Which bits each check adds up (coral = the check fails).';
    const checkGrid = cellGrid(host(el), {
      rows: 3, cols: 7,
      cell: (r, c) => {
        const check = CHECKS[r];
        if (!covers(check, c + 1)) return { text: '', state: 'off' };
        return { text: String(gotWord(state)[c]), state: checkResult(gotWord(state), check) ? 'both' : 'on' };
      },
    });
    const box = textBox(el);
    const refresh = () => {
      bitsGrid.refresh();
      checkGrid.refresh();
      const s = syndrome(gotWord(state));
      const fixed = receive(gotWord(state), s);
      box.set([s === 0 ? 'All three checks pass: no single error is detected.' : `Failed checks add up to ${s} = ${s.toString(2).padStart(3, '0')} in binary, so bit ${s} is wrong.`, `Flip bit ${s || '—'} back: ${fixed.join('')} ${fixed.join('') === sentWord(state).join('') ? '(the message that was sent)' : ''}`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Send a message' },
    { key: 'd1', label: 'Data bit 1', toggle: true },
    { key: 'd2', label: 'Data bit 2', toggle: true },
    { key: 'd3', label: 'Data bit 3', toggle: true },
    { key: 'd4', label: 'Data bit 4', toggle: true },
    { key: 'err', label: 'Flip the bit at position (0 = none)', min: 0, max: 7, step: 1 },
    { readout: [
      ['Sent', (s) => sentWord(s).join('')],
      ['Received', (s) => gotWord(s).join('')],
      ['Syndrome', (s) => String(syndrome(gotWord(s)))],
      ['Diagnosis', (s) => { const k = syndrome(gotWord(s)); return { text: k === 0 ? 'no error found' : `bit ${k} is wrong`, good: k === s.err }; }],
    ] },
  ],
  tex: (s) => `s=(c_4c_2c_1)_2=${syndrome(gotWord(s)).toString(2).padStart(3, '0')}_2=${syndrome(gotWord(s))}`,
});
void tool;
