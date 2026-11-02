import { createTool } from '../../lib/tool.js';
import { dotGrid } from '../../lib/discrete.js';
import { fixed } from '../../lib/format.js';
import { noneSix, atLeastOne, exactly } from './_probability-math.js';

const state = { n: 3, show: true };
const sixes = (n) => {
  const out = [];
  for (let i = 0; i < 6 ** n; i++) {
    let x = i;
    let k = 0;
    for (let d = 0; d < n; d++) {
      if (x % 6 === 5) k++;
      x = Math.floor(x / 6);
    }
    out.push(k);
  }
  return out.sort((a, b) => a - b);
};

createTool({
  state,
  label: 'One dot for every possible result of rolling n dice. Green dots have no six, coral dots have at least one.',
  draw(ctx, stage, c) {
    const list = sixes(state.n);
    dotGrid(ctx, { x: 8, y: 8, w: stage.w - 16, h: stage.h - 16 }, list.length, (i) => (list[i] === 0 ? c.c : state.show ? c.a : c.fillA), c.ink);
  },
  controls: [
    { title: 'Roll n dice' },
    { key: 'n', label: 'Dice n', min: 1, max: 4, step: 1 },
    { key: 'show', label: 'Colour the "at least one" dots', toggle: true },
    { readout: [
      ['All results 6ⁿ', (s) => String(6 ** s.n)],
      ['No six: 5ⁿ', (s) => String(noneSix(s.n))],
      ['At least one', (s) => String(atLeastOne(s.n))],
      ['Cases to add up', (s) => Array.from({ length: s.n }, (_, k) => exactly(s.n, k + 1)).join(' + ')],
      ['P(at least one)', (s) => fixed(atLeastOne(s.n) / 6 ** s.n, 3)],
    ] },
  ],
  tex: (s) => `P=1-\\left(\\dfrac56\\right)^{${s.n}}=1-\\dfrac{${noneSix(s.n)}}{${6 ** s.n}}=${fixed(atLeastOne(s.n) / 6 ** s.n, 3)}`,
});
