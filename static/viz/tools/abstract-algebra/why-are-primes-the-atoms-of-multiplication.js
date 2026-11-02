import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { divisors, factor, isPrime } from './_aa-math.js';

// Break n into two factors again and again. Whatever the first split, the leaves are the same primes.
const state = { n: 360, rule: 'small' };
const RULES = { small: 'Smallest first', middle: 'Most even split', large: 'Largest first' };

function split(n, rule) {
  const ds = divisors(n).filter((d) => d > 1 && d < n);
  if (!ds.length) return null;
  let d;
  if (rule === 'small') d = factor(n)[0];
  else if (rule === 'large') d = n / factor(n)[0];
  else d = [...ds].filter((x) => x * x <= n).pop();
  return [d, n / d];
}
function tree(n, rule) {
  const parts = split(n, rule);
  return { n, kids: parts ? parts.map((p) => tree(p, rule)) : [] };
}
function layout(node, depth, leaves) {
  node.depth = depth;
  if (!node.kids.length) { node.col = leaves.length; leaves.push(node); } else node.kids.forEach((k) => layout(k, depth + 1, leaves));
  if (node.kids.length) node.col = (node.kids[0].col + node.kids[node.kids.length - 1].col) / 2;
  return node;
}
const primesOf = (n) => factor(n);

createTool({
  state,
  label: 'A factor tree for n. Each number splits into two factors until only primes are left, shown green at the bottom. Choosing a different first split gives a different tree with the same prime leaves.',
  draw(ctx, stage, c) {
    const leaves = [];
    const root = layout(tree(state.n, state.rule), 0, leaves);
    const maxDepth = Math.max(...leaves.map((l) => l.depth), 1);
    const px = (col) => 24 + ((stage.w - 48) * (col + 0.5)) / Math.max(leaves.length, 1);
    const py = (d) => 28 + ((stage.h - 100) * d) / maxDepth;
    const walk = (node) => {
      node.kids.forEach((k) => { line(ctx, px(node.col), py(node.depth), px(k.col), py(k.depth), { color: c.ink, width: 2 }); walk(k); });
    };
    walk(root);
    const draw = (node) => {
      node.kids.forEach(draw);
      dot(ctx, px(node.col), py(node.depth), 15, isPrime(node.n) ? c.fillC : c.fillA, c.ink);
      label(ctx, String(node.n), px(node.col), py(node.depth), c, { size: node.n > 99 ? 10 : 12, patch: false });
    };
    draw(root);
    label(ctx, `${state.n} = ${primesOf(state.n).join(' × ')}`, stage.w / 2, stage.h - 20, c, { size: 14, bounds: stage });
  },
  controls: [
    { title: 'Factor tree' },
    { key: 'n', label: 'n', min: 2, max: 512, step: 1 },
    { key: 'rule', label: 'First split', options: Object.entries(RULES) },
    { readout: [
      ['Prime leaves', (s) => primesOf(s.n).join(', ')],
      ['Is n prime?', (s) => (isPrime(s.n) ? 'yes: it has no split' : 'no')],
    ] },
  ],
  tex: (s) => `${s.n}=${primesOf(s.n).join('\\cdot ')}`,
});
