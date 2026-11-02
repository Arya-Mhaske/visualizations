import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { a: 2, b: 8 };

plotTool({
  state,
  label: 'A semicircle on a diameter of length a plus b. A radius is drawn to the top, and a vertical line from the point where a meets b up to the circle, which is shorter than the radius.',
  x: [-1, 11],
  y: [-1, 6],
  range: (s) => { const R = (s.a + s.b) / 2; return [[-0.1 * R, 2.1 * R], [-0.1 * R, 1.1 * R]]; },
  draw: (ctx, stage, c, plot) => {
    const R = (state.a + state.b) / 2;
    const arc = Array.from({ length: 81 }, (_, k) => [R + R * Math.cos(Math.PI - (k / 80) * Math.PI), R * Math.sin((k / 80) * Math.PI)]);
    arc.slice(1).forEach((p, k) => plot.segment(arc[k][0], arc[k][1], p[0], p[1], { color: c.ink, width: 3 }));
    plot.segment(0, 0, 2 * R, 0, { color: c.ink, width: 3 });
    plot.segment(state.a, 0, state.a, Math.sqrt(state.a * state.b), { color: c.a, width: 5 });
    plot.segment(R, 0, state.a, Math.sqrt(state.a * state.b), { color: c.b, width: 2, dash: [4, 4] });
    plot.segment(R, 0, R, R, { color: c.c, width: 5 });
    plot.point(state.a, 0, { fill: c.ink, r: 5 });
  },
  controls: [
    { title: 'Two numbers' },
    { key: 'a', label: 'a', min: 1, max: 10, step: 1 },
    { key: 'b', label: 'b', min: 1, max: 10, step: 1 },
    { readout: [['AM = (a + b)/2 (green)', (s) => fixed((s.a + s.b) / 2, 3)], ['GM = √(ab) (coral)', (s) => fixed(Math.sqrt(s.a * s.b), 3)], ['AM − GM', (s) => fixed((s.a + s.b) / 2 - Math.sqrt(s.a * s.b), 3)]] },
  ],
  tex: (s) => `\\dfrac{a+b}{2}=${fixed((s.a + s.b) / 2, 3)}\\ \\ge\\ \\sqrt{ab}=${fixed(Math.sqrt(s.a * s.b), 3)}`,
});
