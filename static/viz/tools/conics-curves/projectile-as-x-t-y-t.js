import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { flight, projectile } from './_rotation-math.js';
import { curve, fitEqual, trace } from './_conics-view.js';

const state = { v0: 20, angle: 45, t: 1 };
const G = 9.8;
const rad = (d) => (d * Math.PI) / 180;
const F = (s = state) => flight(s.v0, s.angle, G);

createTool({
  state,
  label: 'The path of a ball thrown at a chosen speed and angle, drawn from its two parametric equations: x grows steadily with time and y goes up and then comes down. A marker shows the ball at the chosen moment. Eliminating the time gives y as a quadratic function of x, which is why the path is a parabola.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 45], y: [-5, 25], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    const f = F();
    const ratio = stage.w / stage.h;
    const half = Math.max((f.range * 0.62) / ratio, f.height * 0.95, 1.5);
    fitEqual(plot, stage, f.range / 2, half * 0.45, half);
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    curve(plot, trace((t) => projectile(state.v0, state.angle, G, t), 0, f.time, 200), { color: c.grid, width: 3, dash: [5, 4] });
    const t = Math.min(state.t, f.time);
    curve(plot, trace((u) => projectile(state.v0, state.angle, G, u), 0, t, Math.max(2, Math.round(t * 40))), { color: c.a, width: 4 });
    const p = projectile(state.v0, state.angle, G, t);
    plot.segment(p[0], p[1], p[0], 0, { color: c.grid, width: 2, dash: [3, 4] });
    plot.point(p[0], p[1], { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Throw the ball' },
    { key: 'v0', label: 'Launch speed, v₀', min: 5, max: 30, step: 1, format: (v) => `${v} m/s` },
    { key: 'angle', label: 'Launch angle, θ', min: 10, max: 80, step: 1, format: (v) => `${v}°` },
    { key: 't', label: 'Time, t', min: 0, max: 6, step: 0.1, format: (v) => `${v.toFixed(1)} s` },
    { readout: [
      ['x(t), y(t)', (s) => { const p = projectile(s.v0, s.angle, G, Math.min(s.t, F(s).time)); return `${fixed(p[0], 2)}, ${fixed(p[1], 2)}`; }],
      ['Time in the air', (s) => `${fixed(F(s).time, 2)} s`],
      ['Range', (s) => `${fixed(F(s).range, 1)} m`],
      ['Greatest height', (s) => `${fixed(F(s).height, 1)} m`],
    ] },
  ],
  tex: (s) => `x=${s.v0}\\cos ${s.angle}^\\circ\\,t,\\ y=${s.v0}\\sin ${s.angle}^\\circ\\,t-4.9t^2\\ \\Rightarrow\\ y=x\\tan ${s.angle}^\\circ-\\dfrac{4.9\\,x^2}{(${s.v0}\\cos ${s.angle}^\\circ)^2}`,
});
