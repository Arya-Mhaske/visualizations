import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { deriv, stackBoxes } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

// The trick "separate, then integrate both sides" is the chain rule read backwards:
//   d/dx G(y(x)) = G'(y) y'   so   the integral of G'(y) y' dx from a to b is G(y(b)) - G(y(a)).
// y y' = x  (G = y²/2)       solution y = √(x² + C)
// y'/y = 1  (G = ln y)       solution y = C e^x
const MODES = {
  circle: { name: "y y′ = x", y: (C, x) => Math.sqrt(x * x + C), Gp: (y) => y, G: (y) => (y * y) / 2, gName: '\\dfrac{y^2}{2}', integrand: "y\\,y'", yTop: 4, gRange: [-3, 3], right: (a, b) => (b * b - a * a) / 2, rightTex: (a, b) => `\\displaystyle\\int_{${fixed(a, 1)}}^{${fixed(b, 1)}}x\\,dx` },
  expo: { name: "y′/y = 1", y: (C, x) => C * Math.exp(x), Gp: (y) => 1 / y, G: (y) => Math.log(y), gName: '\\ln y', integrand: "\\frac{y'}{y}", yTop: 25, gRange: [-0.5, 2], right: (a, b) => b - a, rightTex: (a, b) => `\\displaystyle\\int_{${fixed(a, 1)}}^{${fixed(b, 1)}}1\\,dx` },
};
const state = { mode: 'circle', C: 1, a: -1, b: 1.5 };
const g = (s, x) => { const m = MODES[s.mode]; const yv = m.y(s.C, x); return m.Gp(yv) * deriv((t) => m.y(s.C, t), x); };
function area(s) {
  const n = 400;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x0 = s.a + ((s.b - s.a) * i) / n;
    const x1 = s.a + ((s.b - s.a) * (i + 1)) / n;
    sum += ((g(s, x0) + g(s, x1)) / 2) * (x1 - x0);
  }
  return sum;
}
const jump = (s) => { const m = MODES[s.mode]; return m.G(m.y(s.C, s.b)) - m.G(m.y(s.C, s.a)); };

createTool({
  state,
  label: 'Two graphs, one above the other. The top graph is a solution curve y of x. The bottom graph is G prime of y times y prime, the left side after multiplying by dx. The area under the bottom graph between a and b equals the change in G of y between those points, which is the chain rule run backwards.',
  setup: (stage, c) => {
    const [top, bottom] = stackBoxes(2);
    return [createPlot(stage, { x: [-2.5, 2.5], y: [0, 4], c, pad: 22, box: top }), createPlot(stage, { x: [-2.5, 2.5], y: [-3, 3], c, pad: 22, box: bottom })];
  },
  draw(ctx, stage, c, [upper, lower]) {
    const m = MODES[state.mode];
    upper.setRange([-2.5, 2.5], [0, m.yTop]);
    upper.axes({ xLabel: 'x', yLabel: 'y' });
    upper.fn((x) => m.y(state.C, x), { color: c.a, width: 4 });
    for (const x of [state.a, state.b]) {
      upper.segment(x, 0, x, m.y(state.C, x), { color: c.grid, width: 2, dash: [4, 3] });
      upper.point(x, m.y(state.C, x), { fill: c.fillY });
    }
    lower.setRange([-2.5, 2.5], m.gRange);
    lower.axes({ xLabel: 'x', yLabel: 'G′(y)·y′' });
    lower.shade((x) => g(state, x), null, Math.min(state.a, state.b), Math.max(state.a, state.b), c.fillB);
    lower.fn((x) => g(state, x), { color: c.b, width: 4 });
  },
  controls: [
    { title: 'Integrate the left side' },
    { key: 'mode', label: 'Equation', options: Object.entries(MODES).map(([key, v]) => [key, v.name]) },
    { key: 'C', label: 'Solution constant C', min: 0.5, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'a', label: 'From x = a', min: -2, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'b', label: 'To x = b', min: -2, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { readout: [
      ['Area under the lower graph', (s) => fixed(area(s), 4)],
      ['G(y(b)) − G(y(a))', (s) => fixed(jump(s), 4)],
      ['Right side, integral of dx-part', (s) => ({ text: fixed(MODES[s.mode].right(s.a, s.b), 4), good: true })],
    ] },
  ],
  tex: (s) => `\\displaystyle\\int ${MODES[s.mode].integrand}\\,dx=\\Big[${MODES[s.mode].gName}\\Big]_a^b=${fixed(jump(s), 3)}=${MODES[s.mode].rightTex(s.a, s.b)}`,
});
