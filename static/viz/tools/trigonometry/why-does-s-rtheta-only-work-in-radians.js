import { createTool } from '../../lib/tool.js';
import { arc as drawArc, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { arc, DEG } from './_angles-arcs-math.js';

const state = { r: 5, degrees: 60, unit: 'rad' };
const number = (s) => (s.unit === 'rad' ? s.degrees * DEG : s.degrees);
const real = (s) => arc(s.r, s.degrees * DEG);
const claim = (s) => s.r * number(s);
const agrees = (s) => Math.abs(claim(s) - real(s)) < 1e-9;

createTool({
  state,
  label: 'An arc of a circle above two bars: the true arc length and the value of r times theta.',
  draw(ctx, stage, c) {
    const R = stage.h * 0.05 * state.r + stage.h * 0.08;
    const [cx, cy] = [stage.w * 0.5, stage.h * 0.62];
    const end = -state.degrees * DEG;
    line(ctx, cx, cy, cx + R, cy, { color: c.ink });
    line(ctx, cx, cy, cx + R * Math.cos(end), cy + R * Math.sin(end), { color: c.ink });
    drawArc(ctx, cx, cy, R, 0, end, { color: c.a, width: 6 });
    drawArc(ctx, cx, cy, R * 0.3, 0, end, { color: c.ink, width: 2 });
    dot(ctx, cx, cy, 5, c.ink);
    label(ctx, 'θ', cx + R * 0.42 * Math.cos(end / 2), cy + R * 0.42 * Math.sin(end / 2), c, { size: 13 });
    label(ctx, 'r', cx + R / 2, cy + 12, c, { size: 13 });
    const scale = (stage.w * 0.28) / real(state);    // both bars share this scale; a longer bar runs off the stage
    const top = stage.h * 0.76;
    const bar = (value, y, color, text) => {
      const width = Math.min(value * scale, stage.w * 0.86);
      line(ctx, stage.w * 0.07, y, stage.w * 0.07 + width, y, { color, width: 10 });
      label(ctx, text, stage.w * 0.07, y + 15, c, { size: 11, align: 'left', bounds: stage });
    };
    bar(real(state), top, c.a, `true arc ${sig(real(state), 3)}`);
    bar(claim(state), top + 40, agrees(state) ? c.c : c.b, `r × θ ${sig(claim(state), 3)}`);
  },
  controls: [
    { title: 'Test the formula' },
    { text: 'The arc never changes when you switch units. Does r × θ agree with it?' },
    { key: 'r', label: 'Radius, r', min: 1, max: 8, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'degrees', label: 'Angle', min: 5, max: 270, step: 5, format: (v) => `${v}°` },
    { key: 'unit', label: 'Put θ into s = rθ as', options: [['rad', 'radians'], ['deg', 'degrees']] },
    { readout: [
      ['θ as a number', (s) => fixed(number(s), 3)],
      ['True arc', (s) => sig(real(s), 4)],
      ['r × θ', (s) => sig(claim(s), 4)],
      ['Match?', (s) => ({ text: agrees(s) ? 'yes' : `no: out by ${fixed(claim(s) / real(s), 2)} times`, good: agrees(s) })],
    ] },
  ],
  tex: (s) => (s.unit === 'rad'
    ? `s = r\\theta = ${fixed(s.r, 1)} \\times ${fixed(number(s), 3)} = ${sig(real(s), 4)}`
    : `s = r \\cdot \\theta^\\circ \\cdot \\frac{\\pi}{180} = ${fixed(s.r, 1)} \\times ${s.degrees} \\times \\frac{\\pi}{180} = ${sig(real(s), 4)}`),
});
