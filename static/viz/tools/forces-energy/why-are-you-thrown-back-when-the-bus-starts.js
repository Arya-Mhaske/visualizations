import { createTool } from '../../lib/tool.js';
import { line, dot, label } from '../../lib/draw.js';
import { box } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { a: 2, t: 1, rail: false };
const lag = (s) => (s.rail ? 0 : 0.5 * s.a * s.t * s.t);

createTool({
  state,
  label: 'A bus moves forward and a stick figure inside. The feet move with the bus floor but the head lags behind, so the figure leans back.',
  draw(ctx, stage, c) {
    const bx = stage.w * 0.15 + (0.5 * state.a * state.t * state.t) * 6;
    const y = stage.h * 0.62;
    box(ctx, c, bx, y - 90, 140, 90, c.fillB);
    const lean = Math.min(lag(state) * 12, 50);
    const fx = bx + 70;
    line(ctx, fx, y, fx - lean, y - 50, { color: c.ink, width: 5 });
    dot(ctx, fx - lean, y - 60, 9, c.a, c.ink);
    line(ctx, 0, y, stage.w, y, { color: c.ink, width: 3 });
    label(ctx, state.rail ? 'a force on the upper body too: no lean' : 'no force on the upper body: it stays behind', stage.w / 2, 24, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'The bus starts' },
    { key: 'a', label: 'Bus acceleration (m/s²)', min: 0, max: 4, step: 0.5 },
    { key: 't', label: 'Time (s)', min: 0, max: 2, step: 0.1 },
    { key: 'rail', label: 'Hold the rail', toggle: true },
    { readout: [
      ['Bus has moved', (s) => `${fixed(0.5 * s.a * s.t * s.t, 2)} m`],
      ['Body lags by', (s) => `${fixed(lag(s), 2)} m`],
    ] },
  ],
  tex: (s) => `\\Delta x=\\tfrac12at^2=${fixed(0.5 * s.a * s.t * s.t, 2)}\\ \\mathrm{m}`,
});
