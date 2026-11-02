import { createDrill } from '../../lib/drill.js';
import { bmat, classifyMatrix } from './_sm-math.js';

const TYPES = [
  ['row', 'Row matrix'],
  ['column', 'Column matrix'],
  ['square', 'Square matrix (not diagonal)'],
  ['diagonal', 'Diagonal matrix (not scalar)'],
  ['scalar', 'Scalar matrix (not identity)'],
  ['identity', 'Identity matrix'],
  ['zero', 'Zero matrix'],
];
const WHY = {
  row: 'It has just one row.',
  column: 'It has just one column.',
  square: 'It has as many rows as columns, and some entry off the main diagonal is not zero.',
  diagonal: 'Every entry off the main diagonal is 0, but the diagonal entries are not all equal.',
  scalar: 'It is diagonal with all diagonal entries equal to the same number, which is not 1.',
  identity: 'It is diagonal with 1 on every diagonal place.',
  zero: 'Every entry is 0.',
};

function build(rng, kind) {
  const nz = () => rng.int(1, 9) * (rng.next() < 0.3 ? -1 : 1);
  if (kind === 'row') return [Array.from({ length: rng.int(2, 4) }, () => rng.int(-5, 9))].map((r) => (r.every((v) => v === 0) ? [1, ...r.slice(1)] : r));
  if (kind === 'column') { const col = Array.from({ length: rng.int(2, 4) }, () => rng.int(-5, 9)); if (col.every((v) => v === 0)) col[0] = 3; return col.map((v) => [v]); }
  const n = rng.int(2, 3);
  if (kind === 'zero') { const r = rng.int(1, 3); const k = rng.int(1, 3); return Array.from({ length: r }, () => new Array(k).fill(0)); }
  if (kind === 'identity') return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
  if (kind === 'scalar') { const k = rng.int(2, 7); return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? k : 0))); }
  if (kind === 'diagonal') { const d = Array.from({ length: n }, () => nz()); if (d.every((v) => v === d[0])) d[1] = d[0] + 1; return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? d[i] : 0))); }
  const M = Array.from({ length: n }, () => Array.from({ length: n }, () => rng.int(-3, 9)));
  M[0][1] = nz();
  return M;
}

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 9,
  generate(rng) {
    const [kind] = rng.pick(TYPES);
    const M = build(rng, kind);
    const actual = classifyMatrix(M);
    const answer = TYPES.findIndex(([k]) => k === actual);
    return {
      prompt: 'What is the most specific name for this matrix?',
      tex: `A=${bmat(M, (v) => String(v))}`,
      options: TYPES.map(([, name]) => name),
      answer,
      hint: 'Count the rows and columns first. Then look at the main diagonal.',
      explain: `${TYPES[answer][1]}. ${WHY[actual]}`,
    };
  },
});
