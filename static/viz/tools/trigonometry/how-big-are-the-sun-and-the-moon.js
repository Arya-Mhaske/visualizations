import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig, texSci } from '../../lib/format.js';
import { DEG, smallAngleDiameter, trueDiameter } from './_angles-arcs-math.js';

const BODIES = {
  moon: { name: 'Moon', distance: 384400, angle: 0.52, actual: 3474 },
  sun: { name: 'Sun', distance: 149600000, angle: 0.53, actual: 1391400 },
};
const state = { body: 'moon', angle: 0.52, scale: 0 };
const body = (s) => BODIES[s.body];
const distance = (s) => body(s).distance * 10 ** s.scale;

createTool({
  state,
  label: 'An eye with two sight lines that open by the angular size and just touch a disc in the distance.',
  draw(ctx, stage, c) {
    const [ex, ey] = [stage.w * 0.08, stage.h * 0.5];
    const [dx, reach] = [stage.w * 0.82, stage.w * 0.74];
    const half = Math.min(stage.h * 0.42, reach * Math.tan((state.angle * 12 * DEG) / 2));  // angle drawn 12× larger
    dot(ctx, dx, ey, half, state.body === 'sun' ? c.fillY : c.fillB, c.ink);
    line(ctx, ex, ey, dx, ey - half, { color: c.a });
    line(ctx, ex, ey, dx, ey + half, { color: c.a });
    line(ctx, ex, ey, dx, ey, { color: c.grid, width: 2, dash: [6, 6] });
    dot(ctx, ex, ey, 8, c.paper, c.ink);
    label(ctx, `distance D = ${sig(distance(state), 3)} km`, stage.w * 0.42, ey + 16, c, { size: 11, bounds: stage });
    label(ctx, `α = ${fixed(state.angle, 2)}°`, stage.w * 0.3, ey - half * 0.5 - 12, c, { size: 12, color: c.a });
    label(ctx, body(state).name, dx, ey, c, { size: 12 });
    label(ctx, 'angle drawn 12× larger', stage.w / 2, stage.h - 12, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Angle + distance = size' },
    { key: 'body', label: 'Look at', options: [['moon', 'Moon'], ['sun', 'Sun']] },
    { key: 'angle', label: 'Angular size, α', min: 0.1, max: 1, step: 0.01, format: (v) => `${fixed(v, 2)}°` },
    { key: 'scale', label: 'Distance scale (10ˣ × true)', min: -1, max: 1, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Distance, D', (s) => `${sig(distance(s), 4)} km`],
      ['α in radians', (s) => fixed(s.angle * DEG, 5)],
      ['Diameter, Dα', (s) => `${sig(smallAngleDiameter(distance(s), s.angle), 4)} km`],
      ['Exact, 2D tan(α/2)', (s) => `${sig(trueDiameter(distance(s), s.angle), 4)} km`],
      ['Measured diameter', (s) => `${sig(body(s).actual, 4)} km`],
      ['Sun ÷ Moon, distance', () => fixed(BODIES.sun.distance / BODIES.moon.distance, 0)],
      ['Sun ÷ Moon, diameter', () => fixed(BODIES.sun.actual / BODIES.moon.actual, 0)],
    ] },
  ],
  tex: (s) => `d \\approx D\\alpha = ${texSci(distance(s), 4)} \\times ${fixed(s.angle * DEG, 5)} = ${texSci(smallAngleDiameter(distance(s), s.angle), 4)}\\ \\text{km}`,
});
