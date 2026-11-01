import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { polarPoint, typeOf } from './_rotation-math.js';
import { curve, trace } from './_conics-view.js';

// r = ℓ / (1 − e cos θ), ℓ = e p fixed at 2, so the shape changes but the "width at the focus" does not
const state = { e: 0.6, th: 120 };
const L = 2;
const R = 8;
const rad = (d) => (d * Math.PI) / 180;
const near = (e) => Math.round(e * 100) / 100;
const point = (s = state) => polarPoint(L, s.e, rad(s.th), 100);
const dirDist = (s) => { const p = point(s); return p ? p[0] + (s.e === 0 ? Infinity : L / s.e) : NaN; };

createTool({
  state,
  label: 'The curve r equals ell over one minus e cosine theta, with the pole at the focus. Slide the eccentricity e. At 0 it is a circle. Between 0 and 1 it is an ellipse. At exactly 1 it is a parabola. Above 1 it is a hyperbola with two branches. A marker on the curve shows that its distance from the focus is always e times its distance from the directrix, the vertical line on the left.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    if (state.e > 0) plot.segment(-L / state.e, -R, -L / state.e, R, { color: c.b, width: 3, dash: [6, 5] });
    curve(plot, trace((t) => polarPoint(L, state.e, t, 40), 0.001, Math.PI * 2 - 0.001, 900), { color: c.a, width: 4 });
    plot.point(0, 0, { fill: c.c, r: 8 });
    plot.text('focus', 0.2, -0.8, { size: 11, align: 'left', patch: false });
    const p = point();
    if (p) {
      plot.segment(0, 0, p[0], p[1], { color: c.a, width: 2 });
      if (state.e > 0) plot.segment(p[0], p[1], -L / state.e, p[1], { color: c.b, width: 2 });
      plot.point(p[0], p[1], { fill: c.fillY, r: 8 });
    }
  },
  controls: [
    { title: 'Change the eccentricity' },
    { key: 'e', label: 'Eccentricity, e', min: 0, max: 3, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'th', label: 'Marker angle, θ', min: 1, max: 359, step: 1, format: (v) => `${v}°` },
    { readout: [
      ['Shape', (s) => ({ text: typeOf(near(s.e)), good: true })],
      ['Distance to focus, r', (s) => (point(s) ? fixed(Math.hypot(...point(s)), 3) : '—')],
      ['e × distance to directrix', (s) => (point(s) && s.e > 0 ? fixed(s.e * Math.abs(dirDist(s)), 3) : '—')],
    ] },
  ],
  tex: (s) => `r=\\dfrac{ep}{1-e\\cos\\theta}=\\dfrac{${fixed(L, 0)}}{1-${fixed(s.e, 2)}\\cos\\theta}\\ \\ (\\text{${typeOf(near(s.e))}})`,
});
