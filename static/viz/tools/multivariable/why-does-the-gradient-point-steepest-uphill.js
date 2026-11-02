import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, label, line } from '../../lib/draw.js';
import { SURF, surfaceFaces, drawLevel, levelList, fx, fy } from './_mv.js';

// The slope in direction u (angle θ) is D_u f = f_x cos θ + f_y sin θ = |∇f| cos(θ − φ), where φ is the direction of ∇f.
// A cosine peaks when its angle is 0, so the slope is greatest exactly when u points along ∇f.
const state = { surface: 'two', x: 0.3, y: -0.4, theta: 20, view: '3d' };
const S = () => SURF[state.surface];
const G = () => [fx(S().f, state.x, state.y), fy(S().f, state.x, state.y)];
const dirSlope = (deg) => { const g = G(); const t = (deg * Math.PI) / 180; return g[0] * Math.cos(t) + g[1] * Math.sin(t); };
const phi = () => { const g = G(); return ((Math.atan2(g[1], g[0]) * 180) / Math.PI + 360) % 360; };

const tool = createTool({
  state,
  label: 'A walker standing on a surface, shown in 3D or on a contour map, with a direction dial. A small chart in the lower part plots the slope in the chosen direction against the dial angle. It is a cosine that peaks where the dial points along the gradient.',
  setup(stage, c) { return { cam: createCamera(stage, { extent: 5.5, yaw: 0.7, pitch: 0.5, c }), plot: createPlot(stage, { x: [-3.4, 3.4], y: [-4.6, 3.4], c }) }; },
  draw(ctx, stage, c, { cam, plot }) {
    const { f, R } = S();
    const g = G();
    const t = (state.theta * Math.PI) / 180;
    const u = [Math.cos(t), Math.sin(t)];
    const z = f(state.x, state.y);
    const gl = Math.hypot(...g) || 1;
    if (state.view === '3d') {
      cam.faces(surfaceFaces(c, f, R, 16, { stroke: c.grid }));
      const lift = (dx, dy) => [state.x + dx, state.y + dy, f(state.x + dx, state.y + dy)];
      cam.arrow([state.x, state.y, z + 0.05], [state.x + (g[0] / gl) * 1.2, state.y + (g[1] / gl) * 1.2, z + 0.05], { color: c.a, width: 4 });
      cam.arrow([state.x, state.y, z + 0.05], [state.x + u[0] * 1.2, state.y + u[1] * 1.2, z + 0.05 + dirSlope(state.theta) * 1.2], { color: c.b, width: 4 });
      cam.point([state.x, state.y, z]);
      void lift;
    } else {
      plot.axes();
      levelList(f, R, 10).forEach((l) => drawLevel(ctx, plot, f, l, R, { color: c.grid, width: 1.5 }));
      const [px, py] = plot.toPx(state.x, state.y);
      arrow(ctx, px, py, ...plot.toPx(state.x + (g[0] / gl) * 1.2, state.y + (g[1] / gl) * 1.2), { color: c.a, width: 4 });
      arrow(ctx, px, py, ...plot.toPx(state.x + u[0] * 1.2, state.y + u[1] * 1.2), { color: c.b, width: 4 });
      plot.point(state.x, state.y);
    }
    // inset: slope against the dial angle
    const [ix, iy, iw, ih] = [10, stage.h - 96, stage.w - 20, 86];
    ctx.fillStyle = c.paper;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(ix, iy, iw, ih);
    const top = Math.max(gl, 0.2);
    const px = (deg) => ix + (deg / 360) * iw;
    const py = (v) => iy + ih / 2 - (v / top) * (ih / 2 - 10);
    line(ctx, ix, py(0), ix + iw, py(0), { color: c.grid, width: 1 });
    ctx.beginPath();
    for (let d = 0; d <= 360; d += 4) { if (d) ctx.lineTo(px(d), py(dirSlope(d))); else ctx.moveTo(px(d), py(dirSlope(d))); }
    ctx.strokeStyle = c.ink;
    ctx.stroke();
    ctx.fillStyle = c.a;
    ctx.fillRect(px(phi()) - 3, py(gl) - 3, 6, 6);
    ctx.fillStyle = c.b;
    ctx.fillRect(px(state.theta) - 4, py(dirSlope(state.theta)) - 4, 8, 8);
    label(ctx, 'slope in direction θ (0° to 360°)', ix + iw / 2, iy + 10, c, { size: 10, bounds: stage });
  },
  controls: [
    { title: 'Stand and turn' },
    { key: 'surface', label: 'Surface', options: Object.entries(SURF).filter(([k]) => k !== 'ramp').map(([k, v]) => [k, v.name]) },
    { key: 'view', label: 'View', options: [['3d', '3D'], ['map', 'Contour map']] },
    { key: 'x', label: 'Walker x', min: -2.5, max: 2.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'y', label: 'Walker y', min: -2.5, max: 2.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'theta', label: 'Direction θ', min: 0, max: 360, step: 2, format: (v) => `${v}°` },
    { readout: [
      ['∇f points at φ', () => `${phi().toFixed(0)}°`],
      ['|∇f|', () => Math.hypot(...G()).toFixed(3)],
      ['Slope D_u f', (s) => dirSlope(s.theta).toFixed(3)],
      ['|∇f| cos(θ − φ)', (s) => (Math.hypot(...G()) * Math.cos(((s.theta - phi()) * Math.PI) / 180)).toFixed(3)],
    ] },
  ],
  tex: (s) => `D_{\\mathbf u}f=|\\nabla f|\\cos(\\theta-\\varphi)=${dirSlope(s.theta).toFixed(3)}`,
});
tool.extra.cam.orbit(tool.update);
