import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad, deg, dropDeviation, dropMinimum, bowAngle } from './_prism-math.js';

// Water: Cauchy fit n = 1.3235 + 0.0033 / lambda^2 (lambda in micrometres), 1.3312 at 656 nm.
const nWater = (nm) => 1.3235 + 0.0033 / (nm / 1000) ** 2;
const state = { i: 50, nm: 580 };
const n = (s) => nWater(s.nm);
const idx = (nm) => Math.round(((700 - nm) / 290) * 6);

const tool = createTool({
  state,
  label: 'Top: sunlight, coming from the left, enters a raindrop, reflects once inside and leaves. Rays entering at many heights are drawn in grey, and they bunch up near the ray that is turned least. Bottom: the total turn D against the angle of incidence, with a lowest point near 138 degrees.',
  setup: (stage, c) => createPlot(stage, { x: [0, 90], y: [130, 200], c, pad: 32, box: (g) => ({ x: 0, y: g.h * 0.55, w: g.w, h: g.h * 0.45 }) }),
  draw(ctx, stage, c, plot) {
    const R = Math.min(stage.w * 0.28, stage.h * 0.22);
    const cx = stage.w * 0.42;
    const cy = stage.h * 0.27;
    const at = (deg_) => [cx + R * Math.cos(rad(deg_)), cy - R * Math.sin(rad(deg_))];
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = c.fillB;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    const path = (i, color, width) => {
      const r = deg(Math.asin(Math.sin(rad(i)) / n(state)));
      const p1 = 180 - i;
      const p2 = p1 - (180 - 2 * r);
      const p3 = p2 - (180 - 2 * r);
      const [a, b, d, e] = [[cx - R * 1.6, cy - R * Math.sin(rad(i))], at(p1), at(p2), at(p3)];
      line(ctx, a[0], a[1], b[0], b[1], { color, width });
      line(ctx, b[0], b[1], d[0], d[1], { color, width });
      line(ctx, d[0], d[1], e[0], e[1], { color, width });
      const D = dropDeviation(n(state), i, 1);
      const dir = rad(-D);
      line(ctx, e[0], e[1], e[0] + Math.cos(dir) * R * 1.6, e[1] - Math.sin(dir) * R * 1.6, { color, width });
    };
    for (let i = 20; i <= 85; i += 5) path(i, c.grid, 2);
    path(state.i, c.spec[idx(state.nm)], 4);
    plot.axes({ xLabel: 'i (°)', yLabel: 'D (°)' });
    plot.fn((i) => dropDeviation(n(state), i, 1), { color: c.spec[idx(state.nm)], domain: [1, 89] });
    const m = dropMinimum(n(state), 1);
    plot.point(m.i, m.D, { fill: c.fillC, r: 6 });
    plot.point(state.i, dropDeviation(n(state), state.i, 1), { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'A raindrop' },
    { key: 'i', label: 'Angle of incidence, i', min: 10, max: 85, step: 0.5, format: (v) => `${fixed(v, 1)}°` },
    { key: 'nm', label: 'Colour (wavelength)', min: 410, max: 700, step: 10, format: (v) => `${v} nm` },
    { readout: [
      ['Index of water, n', (s) => fixed(n(s), 4)],
      ['Turn at this i, D', (s) => `${fixed(dropDeviation(n(s), s.i, 1), 1)}°`],
      ['Least turn, D min', (s) => `${fixed(dropMinimum(n(s), 1).D, 1)}°`],
      ['Rainbow angle, 180° − D min', (s) => `${fixed(bowAngle(n(s)), 1)}°`],
    ] },
  ],
  tex: (s) => `D=180^\\circ+2i-4r\\qquad 180^\\circ-D_{min}=${fixed(bowAngle(n(s)), 1)}^\\circ`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.i, dropDeviation(n(state), state.i, 1)),
  move(px) { state.i = Math.max(10, Math.min(85, Math.round(tool.extra.toWorld(px, 0)[0] * 2) / 2)); },
  nudge(direction) { state.i = Math.max(10, Math.min(85, state.i + direction * 0.5)); },
}], { onChange: () => tool.update() });
tool.update();
