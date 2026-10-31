// The relation editor shared by two tools: nine pair toggles, a dot-and-arrow picture and the three tests.
import { createTool } from '../../lib/tool.js';
import { drawRelation } from '../../lib/discrete.js';
import { ALL_PAIRS, ELEMENTS, key, reflexiveGaps, symmetricGaps, transitiveGaps } from './_sets-math.js';

export const toState = (pairs) => Object.fromEntries(ALL_PAIRS.map(([a, b]) => [key(a, b), pairs.includes(key(a, b))]));
export const relationOf = (state) => new Set(ALL_PAIRS.map(([a, b]) => key(a, b)).filter((k) => state[k]));
const pair = ([a, b]) => `(${a}, ${b})`;
const verdict = (gaps) => ({ text: gaps.length ? `no: needs ${pair(gaps[0])}` : 'yes', good: !gaps.length });

export function relationTool(state, { label, title, extra = () => [], rows = [], onDraw = () => [] }) {
  return createTool({
    state,
    label,
    draw(ctx, stage, c) {
      const r = relationOf(state);
      const missing = new Set(onDraw());
      drawRelation(ctx, { x: 0, y: 0, w: stage.w, h: stage.h }, c, ELEMENTS, (a, b) => r.has(key(a, b)), {
        highlight: (a, b) => missing.has(key(a, b)),
      });
    },
    controls: (tool) => [
      { title },
      ...ELEMENTS.map((a) => ({
        row: ELEMENTS.map((b) => ({ key: key(a, b), label: `(${a}, ${b})`, toggle: true })),
      })),
      ...extra(tool),
      { readout: [
        ['Reflexive?', (s) => verdict(reflexiveGaps(relationOf(s)))],
        ['Symmetric?', (s) => verdict(symmetricGaps(relationOf(s)))],
        ['Transitive?', (s) => verdict(transitiveGaps(relationOf(s)))],
        ...rows,
      ] },
    ],
    tex: (s) => {
      const list = [...relationOf(s)].map((k) => `(${k[0]},${k[1]})`).join(',\\,');
      return `R = \\{${list}\\}`;
    },
  });
}
