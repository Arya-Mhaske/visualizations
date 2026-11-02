import { createTool } from '../../lib/tool.js';
import { poly, line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { cToF, fToC, cToK, kToC } from './_temperature-math.js';

const RANGES = { C: [-273, 300], F: [-459, 572], K: [0, 573] };
const state = { unit: 'C', v: 37 };
let last = 'C';
let tool;
const celsius = (s) => (s.unit === 'C' ? s.v : s.unit === 'F' ? fToC(s.v) : kToC(s.v));

tool = createTool({
  state,
  label: 'Three thermometers side by side for Celsius, Fahrenheit and kelvin. The liquid level is the same height in all three.',
  draw(ctx, stage, c) {
    const C = celsius(state);
    const top = 24;
    const bot = stage.h - 36;
    const frac = Math.max(0, Math.min(1, (C + 273.15) / 573.15));
    const items = [['°C', C, c.a], ['°F', cToF(C), c.b], ['K', cToK(C), c.c]];
    items.forEach(([name, v, col], i) => {
      const x = stage.w * (0.2 + 0.3 * i);
      poly(ctx, [[x - 9, top], [x + 9, top], [x + 9, bot], [x - 9, bot]], { fill: c.paper, stroke: c.ink });
      const y = bot - frac * (bot - top);
      line(ctx, x, y, x, bot, { color: col, width: 12 });
      label(ctx, `${fixed(v, 1)} ${name}`, x, bot + 18, c, { size: 13, bounds: stage, patch: false });
    });
  },
  controls: [
    { title: 'Enter a temperature' },
    { key: 'unit', label: 'Enter in', options: [['C', '°C'], ['F', '°F'], ['K', 'K']] },
    { key: 'v', label: 'Value', min: -273, max: 300, step: 1 },
    { readout: [
      ['°C', (s) => fixed(celsius(s), 2)],
      ['°F', (s) => fixed(cToF(celsius(s)), 2)],
      ['K', (s) => fixed(cToK(celsius(s)), 2)],
    ] },
  ],
  tex: (s) => `F=1.8C+32=${fixed(cToF(celsius(s)), 1)}\\qquad K=C+273.15=${fixed(cToK(celsius(s)), 2)}`,
  onChange: (s) => {
    if (s.unit !== last) {
      const C = celsius({ unit: last, v: s.v });
      s.v = Math.round(s.unit === 'C' ? C : s.unit === 'F' ? cToF(C) : cToK(C));
      last = s.unit;
    }
    const [lo, hi] = RANGES[s.unit];
    s.v = Math.max(lo, Math.min(hi, s.v));
    const input = document.querySelector('#panel input[type=range]');
    input.min = lo;
    input.max = hi;
    tool?.ui.refresh();
  },
});
