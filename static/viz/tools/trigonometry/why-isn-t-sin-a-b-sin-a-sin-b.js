import { createTool } from '../../lib/tool.js';
import { label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { cosD, sinD } from './_identities-math.js';

const state = { A: 30, B: 30 };
const values = (s = state) => [
  ['sin(A + B)', sinD(s.A + s.B), 'a'],
  ['sin A + sin B', sinD(s.A) + sinD(s.B), 'b'],
  ['sin A cos B + cos A sin B', sinD(s.A) * cosD(s.B) + cosD(s.A) * sinD(s.B), 'c'],
];
let tool;

createTool({
  state,
  label: 'Three horizontal bars. The coral bar is sine of A plus B. The blue bar is sine A plus sine B, the tempting wrong answer. The green bar is the correct formula, which always matches the coral bar. The blue bar usually disagrees, and can even be longer than 1, which no sine can be.',
  draw(ctx, stage, c) {
    const x0 = stage.w * 0.06;
    const unit = (stage.w * 0.88) / 2;
    const zero = x0 + (stage.w * 0.88) / 4;
    const rowH = stage.h / 4.2;
    line(ctx, zero, 8, zero, stage.h - 8, { color: c.ink, width: 2 });
    line(ctx, zero + unit / 2, 8, zero + unit / 2, stage.h - 8, { color: c.grid, width: 1, dash: [4, 4] });
    line(ctx, zero - unit / 2, 8, zero - unit / 2, stage.h - 8, { color: c.grid, width: 1, dash: [4, 4] });
    label(ctx, '1', zero + unit / 2, stage.h - 10, c, { size: 10, bounds: stage, patch: false });
    label(ctx, '−1', zero - unit / 2, stage.h - 10, c, { size: 10, bounds: stage, patch: false });
    values().forEach(([name, v, col], i) => {
      const y = rowH * (i + 0.9);
      const x1 = zero + v * (unit / 2);
      poly(ctx, [[zero, y], [x1, y], [x1, y + rowH * 0.55], [zero, y + rowH * 0.55]], { fill: c[`fill${col.toUpperCase()}`], stroke: c.ink, width: 2 });
      label(ctx, `${name} = ${fixed(v, 3)}`, stage.w / 2, y - 9, c, { size: 11, bounds: stage, patch: false });
    });
  },
  controls: (t) => {
    tool = t;
    return [
      { title: 'Choose two angles' },
      { key: 'A', label: 'Angle A', min: 0, max: 180, step: 1, format: (n) => `${n}°` },
      { key: 'B', label: 'Angle B', min: 0, max: 180, step: 1, format: (n) => `${n}°` },
      { row: [
        { button: 'A = B = 30°', onClick: () => { state.A = 30; state.B = 30; tool.update(); } },
        { button: 'A = 90°, B = 0°', ghost: true, onClick: () => { state.A = 90; state.B = 0; tool.update(); } },
      ] },
      { readout: [
        ['Wrong rule', (s) => fixed(sinD(s.A) + sinD(s.B), 3)],
        ['Real sin(A + B)', (s) => fixed(sinD(s.A + s.B), 3)],
        ['Do they agree?', (s) => { const ok = Math.abs(sinD(s.A) + sinD(s.B) - sinD(s.A + s.B)) < 5e-4; return { text: ok ? 'yes, by luck' : 'no', good: ok }; }],
      ] },
    ];
  },
  tex: (s) => `\\sin(${s.A}^\\circ+${s.B}^\\circ)=${fixed(sinD(s.A + s.B), 3)}\\ne ${fixed(sinD(s.A), 3)}+${fixed(sinD(s.B), 3)}=${fixed(sinD(s.A) + sinD(s.B), 3)}`,
});
