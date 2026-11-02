import { createTool } from '../../lib/tool.js';
import { poly, line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { SUBSTANCES, finalTemp, heat } from './_heat-capacity-math.js';

const state = { a: 'iron', ma: 0.2, Ta: 100, b: 'water', mb: 0.5, Tb: 20 };
const opts = Object.entries(SUBSTANCES).map(([k, v]) => [k, v[0]]);
const ca = (s) => SUBSTANCES[s.a][1];
const cb = (s) => SUBSTANCES[s.b][1];
const Tf = (s) => finalTemp(s.ma, ca(s), s.Ta, s.mb, cb(s), s.Tb);

createTool({
  state,
  label: 'Three vertical bars: the starting temperature of each substance and the final temperature they share, which lies between the two.',
  draw(ctx, stage, c) {
    const base = stage.h - 40;
    const k = (stage.h - 80) / 120;
    [['A', state.Ta, c.a], ['B', state.Tb, c.b], ['final', Tf(state), c.c]].forEach(([name, T, col], i) => {
      const x = stage.w * (0.2 + 0.3 * i);
      poly(ctx, [[x - 22, base], [x + 22, base], [x + 22, base - T * k], [x - 22, base - T * k]], { fill: col, stroke: c.ink });
      label(ctx, `${fixed(T, 1)} °C`, x, base - T * k - 12, c, { size: 12, bounds: stage, patch: false });
      label(ctx, name, x, base + 16, c, { size: 12, patch: false });
    });
    line(ctx, 10, base, stage.w - 10, base, { color: c.ink, width: 2 });
  },
  controls: [
    { title: 'Substance A' },
    { key: 'a', label: 'A is', options: opts },
    { key: 'ma', label: 'Mass of A (kg)', min: 0.05, max: 1, step: 0.05 },
    { key: 'Ta', label: 'T of A (°C)', min: 0, max: 100, step: 1 },
    { title: 'Substance B' },
    { key: 'b', label: 'B is', options: opts },
    { key: 'mb', label: 'Mass of B (kg)', min: 0.05, max: 1, step: 0.05 },
    { key: 'Tb', label: 'T of B (°C)', min: 0, max: 100, step: 1 },
    { readout: [
      ['Final T', (s) => `${fixed(Tf(s), 2)} °C`],
      ['Heat A gives', (s) => `${fixed(-heat(s.ma, ca(s), s.Ta, Tf(s)), 0)} J`],
      ['Heat B takes', (s) => `${fixed(heat(s.mb, cb(s), s.Tb, Tf(s)), 0)} J`],
    ] },
  ],
  tex: (s) => `T_f=\\dfrac{m_1c_1T_1+m_2c_2T_2}{m_1c_1+m_2c_2}=${fixed(Tf(s), 2)}\\,^\\circ\\mathrm{C}`,
});
