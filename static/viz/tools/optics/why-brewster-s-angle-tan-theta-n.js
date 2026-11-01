import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { fresnel, brewster, rad } from './_diffraction-math.js';

// Air above, glass below. Light comes in from the upper left at incidence i.
const state = { i: 40, n: 1.5 };

const tool = createTool({
  state,
  label: 'Top: a ray hitting glass at angle i, with a reflected ray and a refracted ray. At Brewster\'s angle the two are at right angles. Bottom: reflectance against angle for light vibrating in the plane of the page and for light vibrating across it. The in-plane curve falls to zero at Brewster\'s angle.',
  setup: (stage, c) => createPlot(stage, { x: [0, 90], y: [0, 1], c, pad: 30, box: (g) => ({ x: 0, y: g.h * 0.55, w: g.w, h: g.h * 0.45 }) }),
  draw(ctx, stage, c, plot) {
    const top = stage.h * 0.53;
    const y0 = top * 0.5;
    const cx = stage.w / 2;
    const R = Math.min(stage.w * 0.36, top * 0.46);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(0, y0, stage.w, top - y0);
    line(ctx, 0, y0, stage.w, y0, { color: c.ink, width: 3 });
    const i = rad(state.i);
    const f = fresnel(1, state.n, state.i);
    const w = (x) => 2 + 6 * Math.sqrt(x);
    line(ctx, cx, y0 - R, cx, y0 + R * 0.8, { color: c.ink, width: 2, dash: [6, 5] });
    arrow(ctx, cx - Math.sin(i) * R, y0 - Math.cos(i) * R, cx, y0, { color: c.ink, width: 5, head: 12 });
    arrow(ctx, cx, y0, cx + Math.sin(i) * R, y0 - Math.cos(i) * R, { color: c.b, width: w((f.Rs + f.Rp) / 2), head: 12 });
    const t = rad(f.t);
    arrow(ctx, cx, y0, cx + Math.sin(t) * R * 0.8, y0 + Math.cos(t) * R * 0.8, { color: c.a, width: 3, head: 12 });
    const between = 180 - state.i - f.t;
    label(ctx, `angle between reflected and refracted: ${fixed(between, 1)}°`, stage.w / 2, 14, c, { color: Math.abs(between - 90) < 0.6 ? c.c : c.ink, size: 11, bounds: stage });
    dot(ctx, cx, y0, 4, c.ink, c.ink, 1);
    plot.axes({ xLabel: 'i (°)', yLabel: 'reflectance' });
    plot.fn((d) => fresnel(1, state.n, d).Rs, { color: c.b, domain: [0, 89.5] });
    plot.fn((d) => fresnel(1, state.n, d).Rp, { color: c.a, domain: [0, 89.5] });
    plot.point(brewster(1, state.n), 0, { fill: c.fillC, r: 7 });
    plot.point(state.i, f.Rp, { fill: c.a, r: 7 });
    plot.point(state.i, f.Rs, { fill: c.b, r: 7 });
  },
  controls: () => [
    { title: 'Light meets glass' },
    { key: 'i', label: 'Angle of incidence, i', min: 0, max: 89, step: 0.5, format: (n) => `${fixed(n, 1)}°` },
    { key: 'n', label: 'Index of glass, n', min: 1.2, max: 2.2, step: 0.01, format: (n) => fixed(n, 2) },
    { readout: [
      ['Brewster angle, tan⁻¹ n', (s) => `${fixed(brewster(1, s.n), 1)}°`],
      ['Refracted angle, r', (s) => `${fixed(fresnel(1, s.n, s.i).t, 1)}°`],
      ['i + r', (s) => `${fixed(s.i + fresnel(1, s.n, s.i).t, 1)}°`],
      ['In-plane light reflected', (s) => `${fixed(fresnel(1, s.n, s.i).Rp * 100, 2)} %`],
    ] },
  ],
  tex: (s) => `\\tan\\theta_B=n\\ \\Rightarrow\\ \\theta_B=\\tan^{-1}(${fixed(s.n, 2)})=${fixed(brewster(1, s.n), 1)}^\\circ`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.i, fresnel(1, state.n, state.i).Rp),
  move(px) { state.i = Math.max(0, Math.min(89, Math.round(tool.extra.toWorld(px, 0)[0] * 2) / 2)); },
  nudge(direction) { state.i = Math.max(0, Math.min(89, state.i + direction * 0.5)); },
}], { onChange: () => tool.update() });
tool.update();
