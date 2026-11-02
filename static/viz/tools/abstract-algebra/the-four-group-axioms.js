import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { host, textBox } from './_aa-view.js';

// Test the four axioms by checking every case in a sample of the set. A failure prints the case that breaks it.
const range = (a, b) => { const out = []; for (let k = a; k <= b; k++) out.push(k); return out; };
const SETS = {
  zplus: { name: 'ℤ with +', symbol: '+', has: Number.isInteger, op: (a, b) => a + b, sample: range(-5, 5) },
  nplus: { name: '{0, 1, 2, …} with +', symbol: '+', has: (x) => Number.isInteger(x) && x >= 0, op: (a, b) => a + b, sample: range(0, 7) },
  zminus: { name: 'ℤ with −', symbol: '−', has: Number.isInteger, op: (a, b) => a - b, sample: range(-5, 5) },
  ztimes: { name: 'ℤ with ×', symbol: '×', has: Number.isInteger, op: (a, b) => a * b, sample: range(-5, 5) },
  odd: { name: 'odd integers with +', symbol: '+', has: (x) => Number.isInteger(x) && Math.abs(x) % 2 === 1, op: (a, b) => a + b, sample: [-5, -3, -1, 1, 3, 5] },
  pm1: { name: '{1, −1} with ×', symbol: '×', has: (x) => x === 1 || x === -1, op: (a, b) => a * b, sample: [1, -1] },
  z6plus: { name: 'ℤ₆ with + mod 6', symbol: '+', has: (x) => x >= 0 && x < 6, op: (a, b) => (a + b) % 6, sample: range(0, 5) },
  z6times: { name: 'ℤ₆ with × mod 6', symbol: '×', has: (x) => x >= 0 && x < 6, op: (a, b) => (a * b) % 6, sample: range(0, 5) },
  z7times: { name: 'ℤ₇ without 0, with × mod 7', symbol: '×', has: (x) => x >= 1 && x < 7, op: (a, b) => (a * b) % 7, sample: range(1, 6) },
};
const state = { set: 'zplus' };

export function checkAxioms(S) {
  const xs = S.sample;
  const search = range(-30, 30).filter(S.has);
  let closed = { ok: true, text: 'Every product of two members is a member.' };
  for (const a of xs) for (const b of xs) if (closed.ok && !S.has(S.op(a, b))) closed = { ok: false, text: `Not closed: ${a} ${S.symbol} ${b} = ${S.op(a, b)}, which is not in the set.` };
  let assoc = { ok: true, text: 'Bracketing never changes the answer.' };
  for (const a of xs) for (const b of xs) for (const c of xs) {
    if (assoc.ok && S.op(S.op(a, b), c) !== S.op(a, S.op(b, c))) assoc = { ok: false, text: `Not associative: (${a} ${S.symbol} ${b}) ${S.symbol} ${c} = ${S.op(S.op(a, b), c)}, but ${a} ${S.symbol} (${b} ${S.symbol} ${c}) = ${S.op(a, S.op(b, c))}.` };
  }
  const e = search.find((cand) => xs.every((x) => S.op(cand, x) === x && S.op(x, cand) === x));
  const identity = e === undefined ? { ok: false, text: 'No member leaves every member unchanged.' } : { ok: true, text: `The identity is ${e}.` };
  let inverses = { ok: false, text: 'There is no identity, so inverses make no sense.' };
  if (identity.ok) {
    inverses = { ok: true, text: 'Every member has a partner that gives the identity.' };
    for (const x of xs) {
      if (inverses.ok && !search.some((y) => S.op(x, y) === e && S.op(y, x) === e)) inverses = { ok: false, text: `${x} has no inverse: nothing in the set combines with it to give ${e}.` };
    }
  }
  return { closed, assoc, identity, inverses, group: closed.ok && assoc.ok && identity.ok && inverses.ok };
}

const tool = createTool({
  state,
  label: 'Four boxes for closure, associativity, identity and inverses. Each turns green if the chosen set passes and coral if it fails, and a line below says which case fails.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    const rows = ['Closed', 'Brackets', 'Identity', 'Inverses'];
    const grid = cellGrid(host(el), {
      rows: 1, cols: 4,
      cell: (r, col) => {
        const res = checkAxioms(SETS[state.set]);
        const ok = [res.closed, res.assoc, res.identity, res.inverses][col].ok;
        return { text: `${ok ? '✓' : '✗'} ${rows[col]}`, state: ok ? 'on' : 'both' };
      },
    });
    const box = textBox(el);
    const refresh = () => {
      grid.refresh();
      const res = checkAxioms(SETS[state.set]);
      box.set([`${SETS[state.set].name}:`, res.closed.text, res.assoc.text, res.identity.text, res.inverses.text, res.group ? 'All four hold, so this is a group.' : 'At least one axiom fails, so this is not a group.']);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Pick a set and an operation' },
    { key: 'set', label: 'Set', options: Object.entries(SETS).map(([k, v]) => [k, v.name]) },
    { readout: [['Group?', (s) => ({ text: checkAxioms(SETS[s.set]).group ? 'yes' : 'no', good: checkAxioms(SETS[s.set]).group })]] },
  ],
});
void tool;
