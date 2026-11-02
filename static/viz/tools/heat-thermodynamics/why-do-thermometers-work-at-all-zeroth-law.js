import { createTool } from '../../lib/tool.js';
import { poly, line, label, arrow } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { A: 40, B: 40 };

createTool({
  state,
  label: 'Two bodies A and B with a thermometer C between them. The thermometer takes the temperature of whichever body it touches. If both readings agree, A and B are in equilibrium.',
  draw(ctx, stage, c) {
    const [w, h] = [stage.w, stage.h];
    const body = (x, name, T, col) => {
      poly(ctx, [[x, h * 0.3], [x + w * 0.24, h * 0.3], [x + w * 0.24, h * 0.62], [x, h * 0.62]], { fill: col, stroke: c.ink });
      label(ctx, `${name} = ${fixed(T, 0)} °C`, x + w * 0.12, h * 0.46, c, { size: 13, bounds: stage, patch: false });
    };
    body(10, 'A', state.A, c.fillA);
    body(w - 10 - w * 0.24, 'B', state.B, c.fillB);
    const [tx, top, bot] = [w / 2, h * 0.16, h * 0.7];
    poly(ctx, [[tx - 8, top], [tx + 8, top], [tx + 8, bot], [tx - 8, bot]], { fill: c.paper, stroke: c.ink });
    [['A', state.A], ['B', state.B]].forEach(([name, T], i) => {
      const y = bot - ((T - 0) / 100) * (bot - top);
      const x = i === 0 ? tx - 30 : tx + 30;
      line(ctx, x, y, x, bot, { color: i === 0 ? c.a : c.b, width: 8 });
      label(ctx, `C with ${name}: ${fixed(T, 0)}`, x, bot + 18 + i * 16, c, { size: 11, bounds: stage, patch: false });
    });
    const eq = Math.abs(state.A - state.B) < 0.5;
    arrow(ctx, w * 0.35, h * 0.9, w * 0.65, h * 0.9, { color: c.ink, width: 2 });
    label(ctx, eq ? 'same reading: A ~ B (equilibrium)' : `readings differ: heat flows ${state.A > state.B ? 'A → B' : 'B → A'}`, w / 2, h * 0.97, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two bodies' },
    { key: 'A', label: 'Temperature of A (°C)', min: 0, max: 100, step: 1 },
    { key: 'B', label: 'Temperature of B (°C)', min: 0, max: 100, step: 1 },
    { readout: [
      ['C touches A: reads', (s) => `${s.A} °C`],
      ['C touches B: reads', (s) => `${s.B} °C`],
      ['A ~ C and B ~ C', (s) => ({ text: s.A === s.B ? 'yes: so A ~ B' : 'no', good: s.A === s.B })],
    ] },
  ],
  tex: (s) => `T_A=${s.A}\\,^\\circ\\mathrm{C},\\ T_B=${s.B}\\,^\\circ\\mathrm{C}`,
});
