import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { grab } from './_fx.js';

// A parabola through three points (Lagrange form). x values must differ.
const state = { x1: -6, y1: 1, x2: 0, y2: 6, x3: 6, y3: 1 };
const R = 8;
let tool;
const pts = (s = state) => [[s.x1, s.y1], [s.x2, s.y2], [s.x3, s.y3]];
function fit(s = state) {
  const P = pts(s);
  if (P[0][0] === P[1][0] || P[1][0] === P[2][0] || P[0][0] === P[2][0]) return null;
  let [A, B, C] = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const [j, k] = [(i + 1) % 3, (i + 2) % 3];
    const w = P[i][1] / ((P[i][0] - P[j][0]) * (P[i][0] - P[k][0]));
    A += w;
    B -= w * (P[j][0] + P[k][0]);
    C += w * P[j][0] * P[k][0];
  }
  return { a: A, b: B, c: C };
}

tool = createTool({
  state,
  label: 'Three points that you can drag, such as the two ends of a bridge arch and its top, or three positions of a thrown ball. Exactly one parabola passes through any three points that are at different x positions, and it is drawn with its equation. Move the points to fit an arch or a flight path.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R + 2, R + 2], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const f = fit();
    if (f) plot.fn((x) => f.a * x * x + f.b * x + f.c, { color: c.a, width: 4 });
    pts().forEach(([x, y], i) => { plot.point(x, y, { fill: c.fillY, r: 9 }); plot.text(`P${i + 1}`, x + 0.5, y + 0.7, { size: 12, patch: false }); });
  },
  controls: [
    { title: 'Drag the three points' },
    { text: 'Drag P1, P2 or P3. Enter switches point; arrow keys nudge.' },
    { readout: [
      ['a, b, c', (s) => (fit(s) ? `${fixed(fit(s).a, 3)}, ${fixed(fit(s).b, 3)}, ${fixed(fit(s).c, 3)}` : 'two points share an x')],
      ['Opens', (s) => (fit(s) ? (fit(s).a > 0 ? 'upward' : fit(s).a < 0 ? 'downward' : 'it is a line') : '—')],
      ['Vertex', (s) => (fit(s) && fit(s).a ? `(${fixed(-fit(s).b / (2 * fit(s).a), 2)}, ${fixed(fit(s).c - fit(s).b ** 2 / (4 * fit(s).a), 2)})` : '—')],
    ] },
  ],
  tex: (s) => (fit(s) ? `y=${fixed(fit(s).a, 3)}x^2${fit(s).b < 0 ? '' : '+'}${fixed(fit(s).b, 3)}x${fit(s).c < 0 ? '' : '+'}${fixed(fit(s).c, 3)}` : '\\text{move the points to different x positions}'),
});

handles(tool.stage, [grab(tool, state, 'x1', 'y1', { lo: -7, hi: 9 }), grab(tool, state, 'x2', 'y2', { lo: -7, hi: 9 }), grab(tool, state, 'x3', 'y3', { lo: -7, hi: 9 })], { onChange: () => tool.update(), radius: 26 });
tool.update();
