import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { cometHalfAngle, polarPoint } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

// The Sun is at the origin; the nearest approach q is fixed, so r = q(1 + e) / (1 + e cos θ)
const state = { e: 1.6, nu: 40 };
const Q = 1;
const R = 8;
const kind = (e) => (e < 1 ? 'ellipse: returns again' : e === 1 ? 'parabola: only just escapes' : 'hyperbola: passes once and never returns');
const l = (e) => Q * (1 + e);

createTool({
  state,
  label: 'The Sun at the focus, and a comet\'s path drawn for a chosen eccentricity with the same closest approach. Below 1 the path is a closed ellipse and the comet returns. At exactly 1 the path is a parabola. Above 1 it is one branch of a hyperbola: the comet swings round the Sun once and goes off along a straight line for ever. A marker shows the comet at an angle you choose.',
  setup: (stage, c) => createPlot(stage, { x: [-R * 0.4, R * 1.6], y: [-R, R], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '', grid: false });
    curve(plot, trace((t) => polarPoint(l(state.e), state.e, t, 40), -Math.PI, Math.PI, 600), { color: c.a, width: 4 });
    const limit = state.e > 1 ? cometHalfAngle(state.e) - 2 : 180;
    const nu = Math.max(-limit, Math.min(limit, state.nu));
    const p = polarPoint(l(state.e), state.e, (nu * Math.PI) / 180, 60);
    if (p) plot.point(p[0], p[1], { fill: c.fillY, r: 8 });
    plot.point(0, 0, { fill: c.c, r: 10 });
    plot.text('Sun', 0.1, -0.9, { size: 11, patch: false });
  },
  controls: [
    { title: 'Change the eccentricity' },
    { key: 'e', label: 'Eccentricity, e', min: 0.3, max: 3, step: 0.1, format: (n) => n.toFixed(1) },
    { key: 'nu', label: 'Comet angle from the Sun, θ', min: -170, max: 170, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Path', (s) => ({ text: kind(Math.round(s.e * 10) / 10), good: s.e < 1 })],
      ['Farthest angle the comet reaches', (s) => (s.e > 1 ? `±${fixed(cometHalfAngle(s.e), 1)}°` : 'all the way round')],
      ['Comes back?', (s) => ({ text: s.e < 1 ? 'yes' : 'no', good: s.e < 1 })],
    ] },
  ],
  tex: (s) => (s.e > 1
    ? `1+e\\cos\\theta>0\\Rightarrow|\\theta|<\\cos^{-1}\\!\\left(-\\dfrac1e\\right)=${fixed(cometHalfAngle(s.e), 1)}^\\circ`
    : `r=\\dfrac{q(1+e)}{1+e\\cos\\theta}\\ \\text{stays finite for every }\\theta`),
});
