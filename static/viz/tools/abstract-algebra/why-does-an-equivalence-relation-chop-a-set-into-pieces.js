import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { mod } from './_aa-math.js';
import { specFill } from './_aa-view.js';

// a ~ b when a and b leave the same remainder on division by m. Every integer lands in exactly one row.
const state = { m: 3, a: 4 };
const LOW = -9;
const HIGH = 9;

createTool({
  state,
  label: 'The integers from minus 9 to 9 placed in rows by their remainder on division by m. Each integer sits in exactly one row, so the rows are the equivalence classes and none overlap.',
  draw(ctx, stage, c) {
    const rows = state.m;
    const left = 46;
    const step = (stage.w - left - 12) / (HIGH - LOW);
    const top = 30;
    const gap = Math.min(54, (stage.h - top - 24) / rows);
    const mine = mod(state.a, state.m);
    for (let r = 0; r < rows; r++) {
      const y = top + gap * r + gap / 2;
      if (r === mine) {
        ctx.fillStyle = c.fillY;
        ctx.fillRect(4, y - gap / 2 + 2, stage.w - 8, gap - 4);
      }
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(4, y - gap / 2 + 2, stage.w - 8, gap - 4);
      label(ctx, `[${r}]`, 22, y, c, { size: 13, patch: false });
    }
    for (let n = LOW; n <= HIGH; n++) {
      const r = mod(n, state.m);
      const x = left + (n - LOW) * step;
      const y = top + gap * r + gap / 2;
      dot(ctx, x, y, Math.min(11, step * 0.46), specFill(c, r), c.ink, n === state.a ? 3 : 1.5);
      if (step > 17 || n % 3 === 0) label(ctx, String(n), x, y, c, { size: 9, patch: false });
    }
    label(ctx, `a = ${state.a} is in the class [${mine}]`, stage.w / 2, 14, c, { size: 13, bounds: stage });
  },
  controls: [
    { title: 'Remainder classes' },
    { key: 'm', label: 'Divide by m', min: 2, max: 6, step: 1 },
    { key: 'a', label: 'Pick a', min: LOW, max: HIGH, step: 1 },
    { readout: [
      ['Classes', (s) => String(s.m)],
      ['Remainder of a', (s) => String(mod(s.a, s.m))],
      ['Same class as a', (s) => [...Array(HIGH - LOW + 1).keys()].map((k) => k + LOW).filter((n) => mod(n, s.m) === mod(s.a, s.m)).join(', ')],
    ] },
  ],
  tex: (s) => `${s.a}\\equiv ${mod(s.a, s.m)}\\pmod{${s.m}}`,
});
