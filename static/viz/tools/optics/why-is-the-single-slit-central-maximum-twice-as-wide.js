import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { line, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { slit, firstMinimum, pairPath, rad } from './_diffraction-math.js';

const state = { aOverL: 4, theta: 10 };
const THETA_MAX = 40;
const PAIRS = 4;

const tool = createTool({
  state,
  label: 'Top: a slit with rays from its top half and bottom half going off at angle theta, drawn in matching pairs. Bottom: the pattern of brightness against angle, with a wide central peak and narrower side peaks.',
  setup: (stage, c) => createPlot(stage, { x: [-THETA_MAX, THETA_MAX], y: [0, 1.1], c, pad: 30, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const h = stage.h * 0.46;
    const cx = stage.w * 0.28;
    const a = Math.min(h * 0.78, 130);
    const top = h / 2 - a / 2;
    line(ctx, cx, 2, cx, top, { color: c.ink, width: 6 });
    line(ctx, cx, top + a, cx, h - 2, { color: c.ink, width: 6 });
    const t = rad(state.theta);
    const reach = stage.w * 0.55;
    const colors = [c.a, c.b, c.c, c.d];
    for (let j = 0; j < PAIRS; j++) {
      const frac = (j + 0.5) / PAIRS;
      for (const half of [0, 1]) {
        const y = top + (half * 0.5 + frac * 0.5) * a;
        line(ctx, cx, y, cx + Math.cos(t) * reach, y - Math.sin(t) * reach, { color: colors[j], width: 2 });
      }
    }
    // the pairs differ in path by (a/2) sin(theta): shown as the lag of the lower ray
    label(ctx, `pair gap: ${sig(pairPath(state.aOverL, 1, state.theta), 3)} λ`, stage.w * 0.7, 14, c, { color: c.ink, size: 12 });
    label(ctx, state.theta === 0 ? 'rays in step' : '', stage.w * 0.7, 30, c, { color: c.c, size: 11 });
    plot.axes({ xLabel: 'θ (°)', yLabel: 'I / I₀' });
    plot.fn((th) => slit(state.aOverL, 1, th), { color: c.b, domain: [-THETA_MAX, THETA_MAX] });
    const m = firstMinimum(state.aOverL, 1);
    if (m) for (const s of [-m, m]) plot.segment(s, 0, s, 1.05, { color: c.grid, dash: [5, 5] });
    plot.point(state.theta, slit(state.aOverL, 1, state.theta), { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'Light through a slit' },
    { key: 'aOverL', label: 'Slit width, a / λ', min: 2, max: 10, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'theta', label: 'Direction, θ', min: -THETA_MAX, max: THETA_MAX, step: 0.5, format: (n) => `${fixed(n, 1)}°` },
    { readout: [
      ['First dark at', (s) => { const m = firstMinimum(s.aOverL, 1); return m ? `±${fixed(m, 1)}°` : 'none'; }],
      ['Central peak width', (s) => { const m = firstMinimum(s.aOverL, 1); return m ? `${fixed(2 * m, 1)}°` : '—'; }],
      ['Side peak width', (s) => { const m = firstMinimum(s.aOverL, 1); const m2 = Math.asin(Math.min(1, 2 / s.aOverL)) * 180 / Math.PI; return m ? `${fixed(m2 - m, 1)}°` : '—'; }],
      ['I / I₀ here', (s) => fixed(slit(s.aOverL, 1, s.theta), 3)],
    ] },
  ],
  tex: (s) => `a\\sin\\theta=\\lambda\\ \\Rightarrow\\ \\text{first dark: }\\sin\\theta=\\dfrac{1}{${fixed(s.aOverL, 1)}}\\qquad \\text{pair gap}=\\dfrac{a}{2}\\sin\\theta=${sig(pairPath(s.aOverL, 1, s.theta), 3)}\\lambda`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.theta, slit(state.aOverL, 1, state.theta)),
  move(px) { state.theta = Math.max(-THETA_MAX, Math.min(THETA_MAX, Math.round(tool.extra.toWorld(px, 0)[0] * 2) / 2)); },
  nudge(direction) { state.theta = Math.max(-THETA_MAX, Math.min(THETA_MAX, state.theta + direction * 0.5)); },
}], { onChange: () => tool.update() });
tool.update();
