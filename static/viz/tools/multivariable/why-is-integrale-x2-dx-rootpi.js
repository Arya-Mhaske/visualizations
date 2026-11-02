import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Let I = ∫ e^(−x²) dx over the whole line. Then I² = ∬ e^(−(x²+y²)) dA over the whole plane. In polar coordinates that is
// ∫₀^2π ∫₀^∞ e^(−r²) r dr dθ = 2π · ½ = π. So I = √π. Here: the volume over a disk of radius R, and over a square of half-side R.
const state = { R: 1.2 };
export const erf = (x) => { let s = 0; const n = 400; const h = x / n; for (let i = 0; i <= n; i++) { const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2; s += w * Math.exp(-((i * h) ** 2)); } return (2 / Math.sqrt(Math.PI)) * (s * h) / 3; };
export const disk = (R) => Math.PI * (1 - Math.exp(-R * R));
export const square = (R) => Math.PI * erf(R) ** 2;

createTool({
  state,
  label: 'Two curves against R: the volume under the bell surface over a disk of radius R (coral), found with polar coordinates, and over a square of half-side R (blue), which is the square of an ordinary integral. Both climb towards the same line at pi.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [0, 3.6], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'R', yLabel: 'volume' });
    plot.fn(disk, { color: c.a, domain: [0, 3] });
    plot.fn(square, { color: c.b, domain: [0, 3], dash: [6, 4] });
    plot.segment(0, Math.PI, 3, Math.PI, { color: c.ink, width: 1.5 });
    plot.text('π', 0.15, Math.PI + 0.2, { size: 12 });
    plot.point(state.R, disk(state.R), { fill: c.a });
    plot.point(state.R, square(state.R), { fill: c.b });
  },
  controls: [
    { title: 'Grow the region' },
    { key: 'R', label: 'R', min: 0.1, max: 3, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Disk: π(1 − e^(−R²))', (s) => disk(s.R).toFixed(5)],
      ['Square: (∫ e^(−x²) dx from −R to R)²', (s) => square(s.R).toFixed(5)],
      ['Square root of the square', (s) => Math.sqrt(square(s.R)).toFixed(5)],
      ['√π', () => Math.sqrt(Math.PI).toFixed(5)],
    ] },
  ],
  tex: () => '\\left(\\int_{-\\infty}^{\\infty}e^{-x^2}dx\\right)^2=\\int_0^{2\\pi}\\!\\!\\int_0^\\infty e^{-r^2}r\\,dr\\,d\\theta=\\pi',
});
