import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { QUANTITIES, dimText, dimTex, matches } from './_dimensions-math.js';

const state = { q: 11, M: 1, L: 1, T: -2 };
let last = state.q;
const dim = (s) => [s.M, s.L, s.T];
const names = (s) => matches(dim(s)).map((q) => q.name);

const tool = createTool({
  state,
  label: 'Three columns of blocks for the exponents of mass, length and time. Each block above the line adds one to the exponent, each below subtracts one. The dimension is written underneath, with the names of any quantities that match it.',
  draw(ctx, stage, c) {
    const cols = [['M', state.M, c.a], ['L', state.L, c.b], ['T', state.T, c.c]];
    const colW = stage.w / 3;
    const unit = Math.min(colW * 0.5, (stage.h * 0.5) / 7);
    const base = stage.h * 0.4;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, base);
    ctx.lineTo(stage.w - 10, base);
    ctx.stroke();
    cols.forEach(([name, e, color], k) => {
      const x = colW * k + colW / 2 - unit * 0.8;
      const sign = e >= 0 ? -1 : 1;
      for (let i = 0; i < Math.abs(e); i++) {
        const y = base + sign * unit * (i + 1) - (sign > 0 ? 0 : 0);
        ctx.fillStyle = color;
        ctx.fillRect(x, sign < 0 ? y : y - unit, unit * 1.6, unit);
        ctx.lineWidth = 3;
        ctx.strokeRect(x, sign < 0 ? y : y - unit, unit * 1.6, unit);
      }
      label(ctx, name, colW * k + colW / 2, 16, c, { color: c.ink, size: 15 });
      label(ctx, `${e}`, colW * k + colW / 2, base + unit * 3.6, c, { color: c.ink, size: 13 });
    });
    label(ctx, dimText(dim(state)), stage.w / 2, stage.h * 0.82, c, { color: c.ink, size: 18 });
    const n = names(state);
    label(ctx, n.length ? n.join(', ') : 'no named quantity', stage.w / 2, stage.h * 0.92, c, { color: n.length ? c.ink : c.grid, size: 12, bounds: stage });
  },
  controls: () => [
    { title: 'Build a dimension' },
    { key: 'q', label: 'Load a quantity', min: 0, max: QUANTITIES.length, step: 1, format: (n) => (n === 0 ? 'none' : QUANTITIES[n - 1].name) },
    { key: 'M', label: 'Mass, [M]', min: -3, max: 3, step: 1 },
    { key: 'L', label: 'Length, [L]', min: -3, max: 3, step: 1 },
    { key: 'T', label: 'Time, [T]', min: -3, max: 3, step: 1 },
    { readout: [
      ['Dimension', (s) => dimText(dim(s))],
      ['Quantities with it', (s) => (names(s).length ? names(s).join(', ') : 'none named')],
      ['SI unit', (s) => { const m = matches(dim(s)); return m.length ? m[0].unit : '—'; }],
    ] },
  ],
  tex: (s) => dimTex(dim(s)),
  onChange: (s) => {
    if (s.q !== last) {
      last = s.q;
      if (s.q > 0) [s.M, s.L, s.T] = QUANTITIES[s.q - 1].dim;
    }
  },
});
tool.update();
