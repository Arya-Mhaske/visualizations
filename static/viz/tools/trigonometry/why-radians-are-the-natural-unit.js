import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line, TAU } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { arc as arcLength, DEG } from './_angles-arcs-math.js';

const state = { strings: 1, radius: 75 };
const R_PX = (stage) => (stage.size * 0.42 * state.radius) / 100;

createTool({
  state,
  label: 'A circle with lengths of string equal to its radius laid along the edge, one after another.',
  draw(ctx, stage, c) {
    const [cx, cy, r] = [stage.w / 2, stage.h / 2, R_PX(stage)];
    arc(ctx, cx, cy, r, 0, TAU, { color: c.grid, width: 6 });
    const whole = Math.floor(state.strings);
    for (let i = 0; i < Math.ceil(state.strings); i++) {
      const end = Math.min(i + 1, state.strings);
      arc(ctx, cx, cy, r, -i, -end, { color: i % 2 ? c.b : c.a, width: 7 });
      if (end - i > 0.25) {
        const a = -(i + (end - i) / 2);
        label(ctx, String(i + 1), cx + (r + 14) * Math.cos(a), cy + (r + 14) * Math.sin(a), c, { size: 12, bounds: stage });
      }
    }
    line(ctx, cx, cy, cx + r, cy, { color: c.ink });
    line(ctx, cx, cy, cx + r * Math.cos(-whole), cy + r * Math.sin(-whole), { color: c.ink, width: 1 });
    label(ctx, 'r', cx + r / 2, cy + 12, c, { size: 13 });
    dot(ctx, cx, cy, 5, c.ink);
    dot(ctx, cx + r * Math.cos(-state.strings), cy + r * Math.sin(-state.strings), 7, c.c, c.ink);
  },
  controls: [
    { title: 'Measure with the radius' },
    { text: 'Lay radius-length strings round the edge. Then change the circle.' },
    { key: 'strings', label: 'Strings laid', min: 0, max: 6.5, step: 0.01, format: (v) => fixed(v, 2) },
    { key: 'radius', label: 'Radius', min: 25, max: 100, format: (v) => `${v} cm` },
    { readout: [
      ['Arc length', (s) => `${sig(arcLength(s.radius, s.strings), 4)} cm`],
      ['Arc ÷ radius', (s) => `${fixed(s.strings, 2)} rad`],
      ['Same turn in degrees', (s) => `${fixed(s.strings / DEG, 1)}°`],
      ['Strings in a full circle', () => `2π ≈ ${fixed(2 * Math.PI, 2)}`],
      ['1 radian', () => `${fixed(1 / DEG, 1)}°`],
      ['Past a full circle?', (s) => (s.strings >= 2 * Math.PI ? { text: 'yes', good: true } : 'not yet')],
    ] },
  ],
  tex: (s) => `\\theta = \\frac{s}{r} = \\frac{${sig(arcLength(s.radius, s.strings), 4)}}{${s.radius}} = ${fixed(s.strings, 2)}\\ \\text{rad}`,
});
