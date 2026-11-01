import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const CURVES = {
  cardioid: { name: 'r = 1 + cos θ', r: (t) => 1 + Math.cos(t), dr: (t) => -Math.sin(t), tex: '1+\\cos\\theta', span: 2 * Math.PI },
  rose: { name: 'r = cos 2θ', r: (t) => Math.cos(2 * t), dr: (t) => -2 * Math.sin(2 * t), tex: '\\cos2\\theta', span: 2 * Math.PI },
  spiral: { name: 'r = θ/3', r: (t) => t / 3, dr: () => 1 / 3, tex: '\\theta/3', span: 2 * Math.PI },
};
const state = { curve: 'cardioid', th: 1 };
const K = () => CURVES[state.curve];
const pt = (k, t) => [k.r(t) * Math.cos(t), k.r(t) * Math.sin(t)];
const parts = (s) => {
  const k = CURVES[s.curve];
  const r = k.r(s.th);
  const dr = k.dr(s.th);
  return { num: dr * Math.sin(s.th) + r * Math.cos(s.th), den: dr * Math.cos(s.th) - r * Math.sin(s.th), r, dr };
};

createTool({
  state,
  label: 'A polar curve with a moving point. The point is written as x equals r cos theta and y equals r sin theta, and the parametric slope rule gives the slope of the tangent line, which is drawn through the point.',
  setup: (stage, c) => createPlot(stage, { x: [-2.6, 2.6], y: [-2.6, 2.6], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    for (let i = 1; i <= 300; i++) plot.segment(...pt(k, (k.span * (i - 1)) / 300), ...pt(k, (k.span * i) / 300), { color: c.ink, width: 3 });
    const { num, den } = parts(state);
    const [x, y] = pt(k, state.th);
    const n = Math.hypot(num, den) || 1;
    if (n > 1e-9) plot.segment(x - (den / n) * 1.3, y - (num / n) * 1.3, x + (den / n) * 1.3, y + (num / n) * 1.3, { color: c.a, width: 4 });
    plot.segment(0, 0, x, y, { color: c.b, width: 2, dash: [4, 4] });
    plot.point(x, y, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Slide along the curve' },
    { key: 'curve', label: 'Curve', options: Object.entries(CURVES).map(([k, v]) => [k, v.name]) },
    { key: 'th', label: 'Angle θ', min: 0, max: 6.28, step: 0.02, format: (v) => `${fixed(v, 2)} rad` },
    { readout: [
      ['r', (s) => fixed(parts(s).r, 3)],
      ['dr/dθ', (s) => fixed(parts(s).dr, 3)],
      ['dy/dx', (s) => (Math.abs(parts(s).den) < 1e-6 ? 'vertical' : fixed(parts(s).num / parts(s).den, 4))],
    ] },
  ],
  tex: (s) => `\\dfrac{dy}{dx}=\\dfrac{r'\\sin\\theta+r\\cos\\theta}{r'\\cos\\theta-r\\sin\\theta}=\\dfrac{${fixed(parts(s).num, 3)}}{${fixed(parts(s).den, 3)}}`,
});
