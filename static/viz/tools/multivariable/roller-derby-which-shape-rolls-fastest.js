import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// Rolling without slipping: energy goes into moving and into spinning. With I = k m r², a = g sin θ / (1 + k).
// The smaller k is (mass closer to the axis), the less energy is spent on spinning, and the faster the shape descends.
const SHAPES = [
  { name: 'Solid ball', k: 2 / 5, fill: 'fillC' },
  { name: 'Solid cylinder', k: 1 / 2, fill: 'fillB' },
  { name: 'Hollow ball', k: 2 / 3, fill: 'fillY' },
  { name: 'Hoop', k: 1, fill: 'fillA' },
];
const G = 9.8;
const state = { angle: 20, t: 0.8 };
export const accel = (k, deg) => (G * Math.sin((deg * Math.PI) / 180)) / (1 + k);
const LEN = 3;
const dist = (k, s) => Math.min(0.5 * accel(k, s.angle) * s.t * s.t, LEN);

createTool({
  state,
  label: 'Four shapes racing down the same slope, one lane each: solid ball, solid cylinder, hollow ball and hoop. Move the time slider to see where each is. The shape with its mass closest to the centre wins.',
  draw(ctx, stage, c) {
    const lane = stage.h / 5;
    SHAPES.forEach((sh, i) => {
      const y = lane * (i + 0.8);
      line(ctx, 20, y + 14, stage.w - 20, y + 14, { color: c.ink, width: 3 });
      line(ctx, stage.w - 30, y - 8, stage.w - 30, y + 14, { color: c.a, width: 3 });
      const x = 30 + (dist(sh.k, state) / LEN) * (stage.w - 80);
      dot(ctx, x, y, 12, c[sh.fill], c.ink);
      line(ctx, x, y, x + 12 * Math.cos(dist(sh.k, state) * 3), y + 12 * Math.sin(dist(sh.k, state) * 3), { color: c.ink, width: 2 });
      label(ctx, sh.name, 70, y - 14, c, { size: 10, bounds: stage });
    });
  },
  controls: [
    { title: 'Start the race' },
    { key: 'angle', label: 'Slope angle', min: 5, max: 40, step: 1, format: (v) => `${v}°` },
    { key: 't', label: 'Time (s)', min: 0, max: 3, step: 0.02, format: (v) => v.toFixed(2) },
    { readout: SHAPES.map((sh) => [`${sh.name}: I = ${sh.k.toFixed(2)} m r²`, (s) => `a = ${accel(sh.k, s.angle).toFixed(2)} m/s², ${dist(sh.k, s).toFixed(2)} m`]) },
  ],
  tex: (s) => `a=\\dfrac{g\\sin\\theta}{1+I/(mr^2)},\\ \\theta=${s.angle}^\\circ`,
});
