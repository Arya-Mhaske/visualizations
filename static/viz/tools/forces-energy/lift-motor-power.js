import { createTool } from '../../lib/tool.js';
import { box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { F: 22, v: 2 };

createTool({
  state,
  label: 'A rectangle whose width is the force and whose height is the speed. Its area is the power.',
  draw(ctx, stage, c) {
    const [x0, y0, w, h] = [40, stage.h - 40, ((stage.w - 70) * state.F) / 40, ((stage.h - 80) * state.v) / 5];
    box(ctx, c, x0, y0 - h, w, h, c.fillA);
    label(ctx, `F = ${state.F} kN`, x0 + w / 2, y0 + 16, c, { size: 12, patch: false });
    label(ctx, `v = ${state.v} m/s`, 24, y0 - h / 2, c, { size: 12, patch: false });
    label(ctx, `P = ${fixed(state.F * state.v, 0)} kW`, x0 + w / 2, y0 - h / 2, c, { size: 14, patch: false });
  },
  controls: [
    { title: 'The lift' },
    { key: 'F', label: 'Force F (kN)', min: 5, max: 40, step: 1 },
    { key: 'v', label: 'Speed v (m/s)', min: 0.5, max: 5, step: 0.5 },
    { readout: [
      ['Power', (s) => `${fixed(s.F * s.v, 1)} kW`],
      ['In horsepower', (s) => `${fixed((s.F * s.v * 1000) / 746, 1)} hp`],
    ] },
  ],
  tex: (s) => `P=Fv=${s.F * 1000}\\times${s.v}=${fixed(s.F * s.v * 1000, 0)}\\ \\mathrm{W}`,
});
