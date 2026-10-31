import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arc, dot, label, line, wedge } from '../../lib/draw.js';
import { fixed, piFrac } from '../../lib/format.js';
import { angleClass, DEG, decimalToDms, dmsToDecimal } from './_angles-arcs-math.js';

const state = { d: 135, m: 0, s: 0 };
const decimal = (s) => dmsToDecimal(s.d, s.m, s.s);
const origin = (stage) => [stage.w / 2, stage.h * 0.8];
const radius = (stage) => Math.min(stage.w * 0.44, stage.h * 0.68);
const tip = (stage) => {
  const [cx, cy] = origin(stage);
  const a = decimal(state) * DEG;
  return [cx + radius(stage) * Math.cos(a), cy - radius(stage) * Math.sin(a)];
};

const tool = createTool({
  state,
  label: 'A protractor with degrees on the outer scale and radians on the inner scale, and a ray that marks the angle.',
  draw(ctx, stage, c) {
    const [cx, cy] = origin(stage);
    const R = radius(stage);
    wedge(ctx, cx, cy, R * 0.45, 0, -decimal(state) * DEG, { fill: c.fillA });
    arc(ctx, cx, cy, R, 0, -Math.PI, { color: c.ink });
    line(ctx, cx - R, cy, cx + R, cy, { color: c.ink });
    for (let v = 0; v <= 180; v += 10) {
      const a = -v * DEG;
      const size = v % 30 === 0 ? 12 : 6;
      line(ctx, cx + (R - size) * Math.cos(a), cy + (R - size) * Math.sin(a), cx + R * Math.cos(a), cy + R * Math.sin(a), { color: c.ink, width: 2 });
      if (v % 30 === 0) label(ctx, `${v}°`, cx + (R - 24) * Math.cos(a), cy + (R - 24) * Math.sin(a), c, { size: 10 });
      if (v % 45 === 0 || v % 30 === 0) {
        if (v % 30 === 0 && v % 90 !== 0 && v !== 180 && v !== 0) {
          label(ctx, piFrac(v * DEG), cx + (R * 0.62) * Math.cos(a), cy + (R * 0.62) * Math.sin(a), c, { size: 10, color: c.b });
        } else if (v === 90 || v === 180) {
          label(ctx, piFrac(v * DEG), cx + (R * 0.62) * Math.cos(a), cy + (R * 0.62) * Math.sin(a), c, { size: 10, color: c.b });
        }
      }
    }
    line(ctx, cx, cy, ...tip(stage), { color: c.a, width: 4 });
    dot(ctx, ...tip(stage), 9, c.a, c.ink);
    dot(ctx, cx, cy, 5, c.ink);
  },
  controls: [
    { title: 'Three ways to write one angle' },
    { key: 'd', label: 'Degrees', min: 0, max: 180, format: (v) => `${v}°` },
    { key: 'm', label: 'Minutes', min: 0, max: 59, format: (v) => `${v}′` },
    { key: 's', label: 'Seconds', min: 0, max: 59, format: (v) => `${v}″` },
    { readout: [
      ['DMS', (s) => `${s.d}° ${s.m}′ ${s.s}″`],
      ['Decimal degrees', (s) => `${fixed(decimal(s), 4)}°`],
      ['Radians', (s) => piFrac(decimal(s) * DEG) ?? fixed(decimal(s) * DEG, 4)],
      ['Type', (s) => angleClass(decimal(s))],
      ['Complement', (s) => (decimal(s) <= 90 ? `${fixed(90 - decimal(s), 4)}°` : 'none (over 90°)')],
      ['Supplement', (s) => (decimal(s) <= 180 ? `${fixed(180 - decimal(s), 4)}°` : 'none (over 180°)')],
    ] },
  ],
  tex: (s) => `${fixed(decimal(s), 4)}^\\circ \\times \\frac{\\pi}{180} = ${fixed(decimal(s) * DEG, 4)}\\ \\text{rad}`,
});

handles(tool.stage, [{
  at: () => tip(tool.stage),
  move(px, py) {
    const [cx, cy] = origin(tool.stage);
    const a = Math.atan2(cy - py, px - cx) / DEG;
    const clamped = a < -90 ? 180 : Math.max(0, Math.min(180, a));
    [state.d, state.m, state.s] = decimalToDms(Math.round(clamped));
  },
}], { onChange: tool.update });
