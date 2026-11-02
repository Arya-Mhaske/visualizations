import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { direction } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

const R = 5;
const state = { theta: 50, half: false };
const at = (s) => [R * Math.cos((s.theta * Math.PI) / 180), R * Math.sin((s.theta * Math.PI) / 180)];
const flat = (v) => Math.abs(v) < 1e-9;

createTool({
  state,
  label: 'The circle x squared plus y squared equals 25 with a point P that moves around it and the tangent line at P. A switch shows the graph of a single function y equals the square root of 25 minus x squared, which only covers the upper half. The slope at P is minus x over y everywhere, even on the lower half and where the tangent is vertical.',
  setup: (stage, c) => createPlot(stage, { x: [-7, 7], y: [-7, 7], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const [x, y] = at(state);
    plot.axes();
    plot.fn((t) => Math.sqrt(R * R - t * t), { color: c.a, width: 4, domain: [-R, R] });
    if (!state.half) plot.fn((t) => -Math.sqrt(R * R - t * t), { color: c.a, width: 4, domain: [-R, R] });
    if (state.half && y < -1e-9) {
      plot.text('No single y = f(x) reaches this half', 0, -6.3, { size: 11, color: c.ink });
    }
    direction(plot, x, y, -y / R, x / R, 3.2, { color: c.ink, width: 4 });
    plot.point(x, y, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Walk round the circle' },
    { key: 'theta', label: 'Position on the circle', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { key: 'half', label: 'Use only y = √(25 − x²)', toggle: true },
    { readout: [
      ['Point (x, y)', (s) => `(${fixed(at(s)[0], 2)}, ${fixed(at(s)[1], 2)})`],
      ['Slope dy/dx', (s) => (flat(at(s)[1]) ? 'vertical tangent' : fixed(-at(s)[0] / at(s)[1], 3))],
      ['Slope from y = √(25 − x²)', (s) => (at(s)[1] > 1e-9 ? fixed(-at(s)[0] / at(s)[1], 3) : 'does not reach here')],
    ] },
  ],
  tex: (s) => {
    const [x, y] = at(s);
    return flat(y) ? "x^2+y^2=25\\ \\Rightarrow\\ \\text{vertical tangent: } y'\\text{ does not exist}" : `x^2+y^2=25\\ \\Rightarrow\\ \\dfrac{dy}{dx}=-\\dfrac{x}{y}=-\\dfrac{${fixed(x, 2)}}{${fixed(y, 2)}}=${fixed(-x / y, 3)}`;
  },
});
