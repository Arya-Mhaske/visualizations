import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow } from '../../lib/draw.js';
import { SURF, drawLevel, levelList, fx, fy } from './_mv.js';

// Walk a short step s in a direction making angle α with the contour. Along the contour f does not change. Away from it the change is
// about s·|∇f| sin α, so the biggest change is at α = 90°: straight across, which is the direction of ∇f.
const state = { surface: 'saddle', x: 1.2, y: 0.8, alpha: 0, s: 0.2 };
const S = () => SURF[state.surface];
const G = () => [fx(S().f, state.x, state.y), fy(S().f, state.x, state.y)];
const tangentAngle = () => Math.atan2(-G()[0], G()[1]); // 90° clockwise from the gradient
const dirAngle = () => tangentAngle() + (state.alpha * Math.PI) / 180;
const delta = () => S().f(state.x + state.s * Math.cos(dirAngle()), state.y + state.s * Math.sin(dirAngle())) - S().f(state.x, state.y);

createTool({
  state,
  label: 'A contour map with a point, the gradient arrow in coral, and a step in blue whose angle from the contour you choose. At zero degrees the step runs along the contour and f barely changes; at 90 degrees it runs along the gradient and f changes most.',
  setup: (stage, c) => createPlot(stage, { x: [-3.4, 3.4], y: [-3.4, 3.4], c }),
  draw(ctx, stage, c, plot) {
    const { f, R } = S();
    plot.axes();
    levelList(f, R, 10).forEach((l) => drawLevel(ctx, plot, f, l, R, { color: c.grid, width: 1.5 }));
    drawLevel(ctx, plot, f, f(state.x, state.y), R, { color: c.ink, width: 3 });
    const g = G();
    const gl = Math.hypot(...g) || 1;
    const [px, py] = plot.toPx(state.x, state.y);
    arrow(ctx, px, py, ...plot.toPx(state.x + (g[0] / gl) * 1.1, state.y + (g[1] / gl) * 1.1), { color: c.a, width: 4 });
    arrow(ctx, px, py, ...plot.toPx(state.x + 1.1 * Math.cos(dirAngle()), state.y + 1.1 * Math.sin(dirAngle())), { color: c.b, width: 3 });
    plot.point(state.x, state.y);
  },
  controls: [
    { title: 'Step across the contour' },
    { key: 'surface', label: 'Surface', options: Object.entries(SURF).filter(([k]) => k !== 'ramp').map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'x', min: -2.5, max: 2.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'y', label: 'y', min: -2.5, max: 2.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'alpha', label: 'Angle from the contour, α', min: -90, max: 90, step: 1, format: (v) => `${v}°` },
    { key: 's', label: 'Step size', min: 0.02, max: 0.5, step: 0.01, format: (v) => v.toFixed(2) },
    { readout: [
      ['Change in f', () => delta().toFixed(4)],
      ['|∇f| · s · sin α', () => (Math.hypot(...G()) * state.s * Math.sin((state.alpha * Math.PI) / 180)).toFixed(4)],
    ] },
  ],
  tex: () => '\\nabla f\\cdot\\mathbf T=0\\ \\text{along a level curve}',
});
