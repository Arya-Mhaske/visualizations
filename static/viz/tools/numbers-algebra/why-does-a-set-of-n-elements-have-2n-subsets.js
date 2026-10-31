import { createTool } from '../../lib/tool.js';
import { drawTree } from '../../lib/discrete.js';
import { subsetCount, subsetFromCode } from './_sets-math.js';

const NAMES = ['a', 'b', 'c', 'd'];
const state = { n: 3, code: 5 };
const names = (s) => NAMES.slice(0, s.n);
const code = (s) => Math.min(s.code, subsetCount(s.n) - 1);
const show = (list) => (list.length ? `{${list.join(',')}}` : '∅');

// Branch "in" first at each level. onPath marks the branch matching the chosen subset.
function build(s, c, depth, prefix, onPath) {
  const list = names(s);
  if (depth === s.n) return { label: show(subsetFromCode(list, prefix)), fill: onPath ? c.a : c.paper };
  const wanted = (code(s) >> (s.n - 1 - depth)) & 1;
  const branch = (bit, word) => {
    const next = onPath && wanted === bit;
    return {
      ...build(s, c, depth + 1, prefix * 2 + bit, next),
      edge: s.n < 4 ? `${list[depth]} ${word}` : '',
      color: next ? c.a : c.ink,
      width: next ? 4 : 2,
    };
  };
  return { kids: [branch(1, 'in'), branch(0, 'out')] };
}

createTool({
  state,
  label: 'A decision tree. At each element the path splits into in or out, so every extra element doubles the ends, and each end is one subset.',
  draw: (ctx, stage, c) => drawTree(ctx, { x: 4, y: 8, w: stage.w - 8, h: stage.h - 16 }, build(state, c, 0, 0, true), c),
  controls: [
    { title: 'In or out?' },
    { text: 'Each element makes one independent yes-or-no choice.' },
    { key: 'n', label: 'Elements, n', min: 1, max: 4 },
    { key: 'code', label: 'Follow subset number', min: 0, max: 15, format: (v) => String(v) },
    { readout: [
      ['Set', (s) => show(names(s))],
      ['Choices', (s) => Array(s.n).fill(2).join(' × ')],
      ['Subsets', (s) => String(subsetCount(s.n))],
      ['This path', (s) => show(subsetFromCode(names(s), code(s)))],
    ] },
  ],
  tex: (s) => `${Array(s.n).fill(2).join(' \\times ')} = 2^{${s.n}} = ${subsetCount(s.n)}`,
});
