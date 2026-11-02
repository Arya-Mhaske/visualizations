import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';
import { factor, isPrime } from './_aa-math.js';

// n² + n + 41 is prime for n = 0, 1, ..., 39 and then fails at n = 40 (1681 = 41 × 41).
const f = (n) => n * n + n + 41;
const LAST = 47;
const state = { n: 20 };

createTool({
  state,
  label: 'A grid of the numbers n from 0 to 47. Each is green if n squared plus n plus 41 is prime and coral if it is not. Up to the chosen n the cells are coloured; the rest are blank.',
  draw(ctx, stage, c) {
    const cols = 12;
    const rows = Math.ceil((LAST + 1) / cols);
    const cell = Math.min((stage.w - 12) / cols, (stage.h - 70) / rows);
    const x0 = (stage.w - cell * cols) / 2;
    const y0 = 40;
    label(ctx, `n = ${state.n}:  n² + n + 41 = ${f(state.n)}`, stage.w / 2, 18, c, { size: 14, bounds: stage });
    for (let n = 0; n <= LAST; n++) {
      const x = x0 + (n % cols) * cell;
      const y = y0 + Math.floor(n / cols) * cell;
      const tested = n <= state.n;
      ctx.fillStyle = !tested ? c.paper : isPrime(f(n)) ? c.fillC : c.fillA;
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      ctx.strokeStyle = n === state.n ? c.ink : c.grid;
      ctx.lineWidth = n === state.n ? 3 : 1;
      ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
      label(ctx, String(n), x + cell / 2, y + cell / 2, c, { size: cell > 26 ? 12 : 10, patch: false, color: tested ? c.ink : c.grid });
    }
    const yEnd = y0 + rows * cell + 14;
    line(ctx, x0, yEnd - 8, x0 + cell * cols, yEnd - 8, { color: c.grid, width: 1 });
    const bad = [...Array(state.n + 1).keys()].find((n) => !isPrime(f(n)));
    label(ctx, bad === undefined ? `all ${state.n + 1} values so far are prime` : `first failure: n = ${bad}`, stage.w / 2, yEnd + 6, c, { size: 13, bounds: stage });
  },
  controls: [
    { title: 'Test the pattern' },
    { key: 'n', label: 'n', min: 0, max: LAST, step: 1 },
    { readout: [
      ['Value', (s) => String(f(s.n))],
      ['Prime?', (s) => ({ text: isPrime(f(s.n)) ? 'yes' : `no: ${factor(f(s.n)).join(' × ')}`, good: isPrime(f(s.n)) })],
    ] },
  ],
  tex: (s) => `${s.n}^2+${s.n}+41=${f(s.n)}`,
});
