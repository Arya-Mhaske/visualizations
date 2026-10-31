import { createTool } from '../../lib/tool.js';
import { arc, arrow, dot, label, line, wedge, TAU } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { circumference, DEG } from './_angles-arcs-math.js';

const state = { shadow: 7.2, distance: 800 };
const REAL = 40075;

createTool({
  state,
  label: 'Earth with parallel sunlight. A stick at Syene casts no shadow and a stick at Alexandria casts one, and the shadow angle equals the angle at the centre of the Earth.',
  draw(ctx, stage, c) {
    const R = stage.size * 0.34;
    const [cx, cy] = [stage.w * 0.42, stage.h * 0.58];
    const shown = state.shadow * 3 * DEG;     // the drawing exaggerates the angle three times
    dot(ctx, cx, cy, R, c.fillC, c.ink);
    wedge(ctx, cx, cy, R * 0.45, -Math.PI / 2, -Math.PI / 2 - shown, { fill: c.a });
    const at = (a, r) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const syene = -Math.PI / 2;
    const alex = syene - shown;
    line(ctx, cx, cy, ...at(syene, R), { color: c.ink, width: 2 });
    line(ctx, cx, cy, ...at(alex, R), { color: c.ink, width: 2 });
    line(ctx, ...at(syene, R), ...at(syene, R + 24), { color: c.ink, width: 4 });
    const top = at(alex, R + 24);
    line(ctx, ...at(alex, R), ...top, { color: c.ink, width: 4 });
    arc(ctx, cx, cy, R, syene, alex, { color: c.b, width: 6 });
    for (const x of [top[0], at(syene, R)[0], stage.w * 0.8]) {
      arrow(ctx, x, 6, x, x === top[0] ? top[1] : Math.min(at(syene, R + 24)[1], stage.h * 0.2), { color: c.d, width: 2 });
    }
    label(ctx, 'Syene', at(syene, R)[0] + 34, at(syene, R)[1] - 12, c, { size: 11, bounds: stage });
    label(ctx, 'Alexandria', top[0] - 8, top[1] + 4, c, { size: 11, align: 'right', bounds: stage });
    label(ctx, 'sunlight', stage.w * 0.8, stage.h * 0.25, c, { size: 11, color: c.d, bounds: stage });
    label(ctx, 'angle drawn 3× larger', stage.w / 2, stage.h - 12, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Measure a planet with a stick' },
    { key: 'shadow', label: 'Shadow angle at Alexandria', min: 2, max: 20, step: 0.1, format: (v) => `${fixed(v, 1)}°` },
    { key: 'distance', label: 'Alexandria to Syene', min: 400, max: 1200, step: 10, format: (v) => `${v} km` },
    { readout: [
      ['Share of a full turn', (s) => `1/${fixed(360 / s.shadow, 1)}`],
      ['Circumference', (s) => `${sig(circumference(s.shadow, s.distance), 4)} km`],
      ['Radius', (s) => `${sig(circumference(s.shadow, s.distance) / (2 * Math.PI), 4)} km`],
      ['Modern value', () => `${sig(REAL, 5)} km`],
      ['Error', (s) => `${fixed((Math.abs(circumference(s.shadow, s.distance) - REAL) / REAL) * 100, 1)}%`],
    ] },
  ],
  tex: (s) => `C = \\frac{360^\\circ}{${fixed(s.shadow, 1)}^\\circ} \\times ${s.distance} = ${sig(circumference(s.shadow, s.distance), 4)}\\ \\text{km}`,
});
