import { createTool } from '../../lib/tool.js';
import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { R: 5, v: 10, phi: 40 };
const rad = (d) => (d * Math.PI) / 180;
const dr = (s) => 2 * s.R * Math.sin(rad(s.phi / 2));
const dv = (s) => 2 * s.v * Math.sin(rad(s.phi / 2));
const dt = (s) => (s.R * rad(s.phi)) / s.v;

function triangle(ctx, c, cx, cy, len, fill, rotate, name, stage) {
  const h = rad(state.phi / 2);
  const pts = [[0, 0], [len * Math.cos(rotate - h), len * Math.sin(rotate - h)], [len * Math.cos(rotate + h), len * Math.sin(rotate + h)]].map(([x, y]) => [cx + x, cy - y]);
  poly(ctx, pts, { fill, stroke: c.ink });
  label(ctx, name, cx + len * 0.5, cy + 22, c, { size: 11, bounds: stage, patch: false });
}

{
  createTool({
    state,
    label: 'Two similar triangles. The first has two sides of length R and a base equal to the chord of the position change. The second has two sides of length v and a base equal to the change in velocity.',
    draw(ctx, stage, c) {
      const k = (stage.w * 0.3) / Math.max(state.R, state.v);
      triangle(ctx, c, stage.w * 0.1, stage.h * 0.5, state.R * k, c.fillB, 0, 'position: sides R, base Δr', stage);
      triangle(ctx, c, stage.w * 0.58, stage.h * 0.5, state.v * k, c.fillA, Math.PI / 2, 'velocity: sides v, base Δv', stage);
    },
    controls: [
      { title: 'The two triangles' },
      { key: 'R', label: 'Radius R (m)', min: 1, max: 10, step: 1 },
      { key: 'v', label: 'Speed v (m/s)', min: 2, max: 20, step: 1 },
      { key: 'phi', label: 'Angle Δφ (°)', min: 5, max: 120, step: 5 },
      { readout: [
        ['Δr / R  |  Δv / v', (s) => `${fixed(dr(s) / s.R, 3)}  |  ${fixed(dv(s) / s.v, 3)}`],
        ['Average a = Δv/Δt', (s) => `${fixed(dv(s) / dt(s), 3)} m/s²`],
        ['v²/R', (s) => `${fixed((s.v * s.v) / s.R, 3)} m/s²`],
      ] },
    ],
    tex: (s) => `\\dfrac{\\Delta v}{v}=\\dfrac{\\Delta r}{R}\\ \\Rightarrow\\ a=\\dfrac{v^2}{R}=${fixed((s.v * s.v) / s.R, 2)}\\ \\mathrm{m/s^2}`,
  });
}
