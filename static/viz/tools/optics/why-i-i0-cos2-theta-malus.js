import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { arrow, line, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { malus, rad } from './_diffraction-math.js';

// Polarised light with E along the vertical hits an analyser whose axis is turned by theta.
const state = { theta: 35 };

const tool = createTool({
  state,
  label: 'Top: the electric vector of the light, drawn upright, and the analyser axis turned by theta. A dashed line drops from the tip of the vector onto the axis, and the length along the axis is E zero cos theta. Bottom: the intensity against theta, a cosine squared curve.',
  setup: (stage, c) => createPlot(stage, { x: [0, 180], y: [0, 1.1], c, pad: 30, ticks: 'auto', box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const cx = stage.w / 2;
    const cy = stage.h * 0.26;
    const R = Math.min(stage.w * 0.34, stage.h * 0.22);
    const t = rad(state.theta);
    // the analyser axis
    line(ctx, cx - Math.sin(t) * R * 1.15, cy + Math.cos(t) * R * 1.15, cx + Math.sin(t) * R * 1.15, cy - Math.cos(t) * R * 1.15, { color: c.d, width: 2, dash: [6, 5] });
    // E-vector
    arrow(ctx, cx, cy, cx, cy - R, { color: c.b, width: 5, head: 12 });
    label(ctx, 'E₀', cx + 18, cy - R + 8, c, { color: c.b, size: 12 });
    // its projection onto the axis
    const along = R * Math.cos(t);
    const px = cx + Math.sin(t) * along;
    const py = cy - Math.cos(t) * along;
    line(ctx, cx, cy - R, px, py, { color: c.ink, width: 2, dash: [4, 4] });
    arrow(ctx, cx, cy, px, py, { color: c.a, width: 5, head: 12 });
    label(ctx, 'E₀ cos θ', px + (Math.sin(t) >= 0 ? 32 : -32), py - 6, c, { color: c.a, size: 11, bounds: stage });
    plot.axes({ xLabel: 'θ (°)', yLabel: 'I / I₀' });
    plot.fn((d) => malus(1, d), { color: c.a, domain: [0, 180] });
    plot.fn((d) => Math.cos(rad(d)), { color: c.grid, dash: [5, 5], domain: [0, 90] });
    plot.point(state.theta, malus(1, state.theta), { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'Turn the analyser' },
    { key: 'theta', label: 'Angle, θ', min: 0, max: 180, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['E after / E₀', (s) => fixed(Math.cos(rad(s.theta)), 3)],
      ['I / I₀ = (E / E₀)²', (s) => fixed(malus(1, s.theta), 3)],
    ] },
  ],
  tex: (s) => `E=E_0\\cos\\theta\\ \\Rightarrow\\ I\\propto E^2:\\ I=I_0\\cos^2\\theta=${sig(malus(1, s.theta), 3)}\\,I_0`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.theta, malus(1, state.theta)),
  move(px) { state.theta = Math.max(0, Math.min(180, Math.round(tool.extra.toWorld(px, 0)[0]))); },
  nudge(direction) { state.theta = Math.max(0, Math.min(180, state.theta + direction)); },
}], { onChange: () => tool.update() });
tool.update();
