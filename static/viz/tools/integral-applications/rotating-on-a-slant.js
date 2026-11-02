import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// A rectangle [1, 3] × [1, 2.5] is spun about a tilted line through (0, c) at angle φ.
// Method 1: slice at right angles to the axis (washers) in the line's own coordinates.  Method 2: Pappus, V = area × 2π × (distance of centroid to the line).
const RECT = [[1, 1], [3, 1], [3, 2.5], [1, 2.5]];
const state = { phi: 20, c: -1 };
const axis = () => { const p = (state.phi * Math.PI) / 180; return { d: [Math.cos(p), Math.sin(p)], n: [-Math.sin(p), Math.cos(p)] }; };
// To the axis frame: s along the line, u across it.
const toSU = ([x, y]) => { const { d, n } = axis(); const px = x; const py = y - state.c; return [px * d[0] + py * d[1], px * n[0] + py * n[1]]; };
const pts = () => RECT.map(toSU);
const sameSide = () => { const us = pts().map((p) => p[1]); return us.every((u) => u > 1e-9) || us.every((u) => u < -1e-9); };
// Cross-section at s: the segment of the rectangle perpendicular to the axis.
function extent(s) {
  const P = pts(); const us = [];
  for (let i = 0; i < 4; i++) {
    const [a, b] = [P[i], P[(i + 1) % 4]];
    if ((a[0] - s) * (b[0] - s) <= 0 && a[0] !== b[0]) us.push(a[1] + ((b[1] - a[1]) * (s - a[0])) / (b[0] - a[0]));
  }
  return us.length ? [Math.min(...us), Math.max(...us)] : null;
}
function volume() {
  const P = pts(); const s0 = Math.min(...P.map((p) => p[0])); const s1 = Math.max(...P.map((p) => p[0]));
  return simpson((s) => { const e = extent(s); return e ? Math.PI * Math.abs(e[1] ** 2 - e[0] ** 2) : 0; }, s0 + 1e-9, s1 - 1e-9, 2000);
}
const centroidDist = () => { const cs = [2, 1.75]; return Math.abs(toSU(cs)[1]); };
const AREA = 2 * 1.5;

createTool({
  state,
  label: 'A rectangle and a tilted straight line it will be spun about. The line can be tilted and moved. Two readouts give the volume by slicing perpendicular to the line and by Pappus rule, and they agree while the line stays clear of the rectangle.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 5], y: [-2, 5], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-1, 5], [-2, 5]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const poly = RECT.map(([x, y]) => [x, y]);
    for (let i = 0; i < 4; i++) plot.segment(...poly[i], ...poly[(i + 1) % 4], { color: c.ink, width: 3 });
    plot.shade(() => 2.5, () => 1, 1, 3, c.fillB);
    const t = Math.tan((state.phi * Math.PI) / 180);
    plot.segment(-1, state.c - t, 5, state.c + 5 * t, { color: c.a, width: 3 });
    plot.point(2, 1.75, { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Tilt the axis' },
    { key: 'phi', label: 'Tilt of the axis', min: -30, max: 60, step: 1, format: (v) => `${v}°` },
    { key: 'c', label: 'Axis crosses y-axis at', min: -3, max: 0, step: 0.25, format: (v) => v.toFixed(2) },
    { readout: [
      ['Axis clear of the rectangle?', () => (sameSide() ? { text: 'yes', good: true } : { text: 'no: the rectangle crosses the axis', good: false })],
      ['Distance of centroid to axis', () => num(centroidDist(), 5)],
      ['Pappus  A × 2π × d', () => num(AREA * 2 * Math.PI * centroidDist(), 6)],
      ['By slicing across the axis', () => num(volume(), 6)],
    ] },
  ],
  tex: () => 'V=2\\pi\\,\\bar d\\,A\\quad(\\text{centroid distance }\\bar d,\\ \\text{area }A=3)',
});
