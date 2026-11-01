import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { run: 4, rise: 2, turn: 90 };
const R = 7;
const rot = (p, deg) => { const t = (deg * Math.PI) / 180; return [p[0] * Math.cos(t) - p[1] * Math.sin(t), p[0] * Math.sin(t) + p[1] * Math.cos(t)]; };
const second = (s = state) => rot([s.run, s.rise], s.turn);
const slope = (p) => (Math.abs(p[0]) < 1e-9 ? NaN : p[1] / p[0]);

createTool({
  state,
  label: 'A slope triangle with run and rise, drawn from the origin, and a copy of it turned about the origin. At a quarter-turn, 90 degrees, the run and rise swap places and one changes sign. The new line is perpendicular to the old one, and the product of the two slopes is minus 1.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const A = [state.run, state.rise];
    const B = second();
    const tri = (p, fill) => poly(ctx, [plot.toPx(0, 0), plot.toPx(p[0], 0), plot.toPx(p[0], p[1])], { fill, stroke: c.ink, width: 2 });
    tri(A, c.fillB);
    tri(B, c.fillA);
    arrow(ctx, ...plot.toPx(0, 0), ...plot.toPx(...A), { color: c.b, width: 4 });
    arrow(ctx, ...plot.toPx(0, 0), ...plot.toPx(...B), { color: c.a, width: 4 });
    plot.point(...A, { fill: c.b, r: 7 });
    plot.point(...B, { fill: c.a, r: 7 });
    plot.text(`(${fixed(B[0], 1)}, ${fixed(B[1], 1)})`, B[0] + 0.5, B[1] + 0.5, { size: 11, patch: false, align: 'left' });
  },
  controls: [
    { title: 'Turn the triangle' },
    { key: 'turn', label: 'Turn by', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { key: 'run', label: 'Run', min: 1, max: 6, step: 1 },
    { key: 'rise', label: 'Rise', min: -5, max: 5, step: 1 },
    { readout: [
      ['Blue slope', (s) => fixed(s.rise / s.run, 3)],
      ['Coral slope', (s) => (Number.isNaN(slope(second(s))) ? 'undefined (vertical)' : fixed(slope(second(s)), 3))],
      ['Product', (s) => { const p = (s.rise / s.run) * slope(second(s)); return { text: Number.isNaN(p) ? '—' : fixed(p, 3), good: Math.abs(p + 1) < 1e-9 }; }],
    ] },
  ],
  tex: (s) => (s.turn === 90 ? `(\\text{run},\\text{rise})=(${s.run},${s.rise})\\to(${-s.rise},${s.run})\\Rightarrow m_1m_2=\\dfrac{${s.rise}}{${s.run}}\\cdot\\dfrac{${s.run}}{${-s.rise}}=-1` : `\\text{turn by }90^\\circ\\text{ to see }m_1m_2=-1`),
});
