import { createTool } from '../../lib/tool.js';
import { label, line, arrow } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { diameterError, diameterEstimate, ruleReading, windLength } from './_units-measurement-math.js';

const state = { turns: 50, diameter: 0.12, count: 1 };
const length = () => windLength(state.turns, state.diameter);
const reading = () => ruleReading(length(), state.count);

createTool({
  state,
  label: 'A pencil with a thread wound side by side along it, above a millimetre ruler. The ruler reads the length of the whole wound stretch, and dividing by the number of turns gives the thread\'s thickness.',
  draw(ctx, stage, c) {
    const windowMm = Math.max(8, Math.ceil(length()) + 2);
    const x0 = 24;
    const x1 = stage.w - 24;
    const scale = (x1 - x0) / windowMm;
    const top = stage.h * 0.2;
    const bar = stage.h * 0.22;
    ctx.fillStyle = c.fillY;
    ctx.fillRect(x0 - 12, top, x1 - x0 + 24, bar);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = c.line;
    ctx.strokeRect(x0 - 12, top, x1 - x0 + 24, bar);
    const wide = Math.max(1, state.diameter * scale);
    for (let i = 0; i < state.turns; i++) {
      ctx.fillStyle = i % 2 ? c.a : c.fillA;
      ctx.fillRect(x0 + i * state.diameter * scale, top - 5, wide, bar + 10);
    }
    const ruler = stage.h * 0.6;
    line(ctx, x0, ruler, x1, ruler, { color: c.ink, width: 3 });
    for (let mm = 0; mm <= windowMm; mm++) {
      const long = mm % 5 === 0;
      line(ctx, x0 + mm * scale, ruler, x0 + mm * scale, ruler + (long ? 16 : 9), { color: c.ink, width: 2 });
      if (long || windowMm <= 12) label(ctx, String(mm), x0 + mm * scale, ruler + 28, c, { size: 10, bounds: stage });
    }
    if (state.count === 0.5) {
      for (let mm = 0; mm < windowMm; mm++) line(ctx, x0 + (mm + 0.5) * scale, ruler, x0 + (mm + 0.5) * scale, ruler + 5, { color: c.ink, width: 1.5 });
    }
    line(ctx, x0, top + bar, x0, ruler, { color: c.grid, width: 1 });
    line(ctx, x0 + length() * scale, top + bar, x0 + length() * scale, ruler, { color: c.a, width: 2, dash: [4, 3] });
    arrow(ctx, x0 + reading() * scale, ruler + 52, x0 + reading() * scale, ruler + 34, { color: c.b, width: 3, head: 10 });
    label(ctx, `ruler reads ${fixed(reading(), 1)} mm`, Math.min(x1 - 60, x0 + reading() * scale), ruler + 66, c, { bounds: stage, size: 12 });
    label(ctx, `${state.turns} turns side by side`, stage.w / 2, top - 14, c, { bounds: stage, size: 12 });
  },
  controls: [
    { title: 'Wind a thread on a pencil' },
    { key: 'turns', label: 'Turns wound', min: 1, max: 100, step: 1 },
    { key: 'diameter', label: 'True thickness', min: 0.05, max: 0.5, step: 0.01, format: (v) => `${fixed(v, 2)} mm` },
    { key: 'count', label: 'Ruler\'s least count', options: [[1, '1 mm'], [0.5, '0.5 mm']] },
    { readout: [
      ['Wound length', () => `${fixed(reading(), 1)} mm`],
      ['Thickness d = L ÷ N', () => `${fixed(diameterEstimate(state.turns, reading()), 3)} mm`],
      ['Uncertainty', () => `± ${fixed(diameterError(state.turns, state.count), 3)} mm`],
      ['One turn alone would be', () => `± ${fixed(state.count, 1)} mm`],
      ['True thickness', () => `${fixed(state.diameter, 2)} mm`],
    ] },
  ],
  tex: () => `d = \\frac{L}{N} = \\frac{${fixed(reading(), 1)}\\ \\text{mm}}{${state.turns}} = ${fixed(diameterEstimate(state.turns, reading()), 3)} \\pm ${fixed(diameterError(state.turns, state.count), 3)}\\ \\text{mm}`,
});
