import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawGrid, eqFrame, rad } from './_kit.js';

const state = { s: 240, h: 0, w: 60, from: 270 };
const air = () => [state.s * Math.sin(rad(state.h)), state.s * Math.cos(rad(state.h))];
const wind = () => [-state.w * Math.sin(rad(state.from)), -state.w * Math.cos(rad(state.from))]; // blows toward from + 180
const ground = () => [air()[0] + wind()[0], air()[1] + wind()[1]];
const bearing = (v) => (((Math.atan2(v[0], v[1]) * 180) / Math.PI) + 360) % 360;
const drift = () => { const d = ((bearing(ground()) - state.h + 540) % 360) - 180; return d; };
const named = (b) => `${fixed(b, 0)}°`;

createTool({
  state,
  label: 'A map with north at the top. A blue arrow shows the plane pointing along its heading at its airspeed. A coral arrow starting at its tip shows the wind blowing it sideways. The green arrow from the start to the end is the ground velocity, the vector sum, and it points somewhere different from the nose.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-380, 380], [-380, 380], 8);
    drawGrid(ctx, f, c, stage, { step: 100, labels: false });
    label(ctx, 'N', f.px([0, 360])[0], f.px([0, 360])[1], c, { size: 12, bounds: stage, patch: false });
    label(ctx, 'E', f.px([360, 0])[0], f.px([360, 0])[1], c, { size: 12, bounds: stage, patch: false });
    arrowW(ctx, f, [0, 0], air(), { color: c.b, width: 5, head: 12 });
    arrowW(ctx, f, air(), ground(), { color: c.a, width: 5, head: 12 });
    arrowW(ctx, f, [0, 0], ground(), { color: c.c, width: 7, head: 13 });
    dot(ctx, ...f.px([0, 0]), 6, c.ink, c.ink);
    label(ctx, 'air', ...f.px([air()[0] / 2 - 25, air()[1] / 2]), c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, 'wind', ...f.px([air()[0] + wind()[0] / 2 + 10, air()[1] + wind()[1] / 2 + 28]), c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, 'ground', ...f.px([ground()[0] / 2 + 30, ground()[1] / 2 - 10]), c, { size: 11, color: c.c, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Fly the plane' },
    { key: 's', label: 'Airspeed', min: 100, max: 300, step: 10, format: (n) => `${n} km/h` },
    { key: 'h', label: 'Heading (bearing)', min: 0, max: 355, step: 5, format: (n) => `${n}°` },
    { key: 'w', label: 'Wind speed', min: 0, max: 100, step: 5, format: (n) => `${n} km/h` },
    { key: 'from', label: 'Wind blowing from', min: 0, max: 355, step: 5, format: (n) => `${n}°` },
    { readout: [
      ['Ground velocity', () => `⟨${fixed(ground()[0], 0)}, ${fixed(ground()[1], 0)}⟩ km/h`],
      ['Ground speed', () => `${fixed(Math.hypot(...ground()), 1)} km/h`],
      ['Track (bearing)', () => named(bearing(ground()))],
      ['Drift from heading', () => `${fixed(drift(), 1)}°`],
    ] },
  ],
  tex: () => `\\vec{g}=\\vec{a}+\\vec{w}=\\langle ${fixed(air()[0], 0)},${fixed(air()[1], 0)}\\rangle+\\langle ${fixed(wind()[0], 0)},${fixed(wind()[1], 0)}\\rangle=\\langle ${fixed(ground()[0], 0)},${fixed(ground()[1], 0)}\\rangle`,
});
