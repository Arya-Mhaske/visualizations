import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label } from '../../lib/draw.js';

// The volume of the unit ball in n dimensions follows V_n = (2π/n) V_(n−2), with V_0 = 1 and V_1 = 2. It peaks at n = 5, then collapses.
// The part of the ball within ε of the surface is 1 − (1 − ε)^n of the whole: in high dimensions almost all of it is skin.
const state = { n: 3, eps: 0.1 };
export const unitVolume = (n) => { const V = [1, 2]; for (let k = 2; k <= n; k++) V[k] = ((2 * Math.PI) / k) * V[k - 2]; return V[n]; };
export const skin = (n, eps) => 1 - (1 - eps) ** n;

createTool({
  state,
  label: 'Dots showing the volume of the unit ball in each dimension from 0 to 30. The dots rise to a peak at five dimensions and then fall towards zero. A bar underneath shows what fraction of the ball lies in the outer skin, which approaches the whole ball in high dimensions.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 31], y: [-0.4, 6], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'dimension n', yLabel: 'volume of the unit ball' });
    for (let k = 0; k <= 30; k++) plot.point(k, unitVolume(k), { fill: k === state.n ? c.a : c.fillB, r: k === state.n ? 8 : 5 });
    const w = stage.w - 40;
    const y = stage.h - 30;
    ctx.fillStyle = c.paper;
    ctx.fillRect(20, y, w, 18);
    ctx.fillStyle = c.fillA;
    ctx.fillRect(20, y, w * skin(state.n, state.eps), 18);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, y, w, 18);
    label(ctx, `${(skin(state.n, state.eps) * 100).toFixed(1)}% of the ball is within ${(state.eps * 100).toFixed(0)}% of the surface`, stage.w / 2, y - 12, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Raise the dimension' },
    { key: 'n', label: 'Dimension n', min: 0, max: 30, step: 1 },
    { key: 'eps', label: 'Skin thickness (fraction of radius)', min: 0.01, max: 0.3, step: 0.01, format: (v) => `${(v * 100).toFixed(0)}%` },
    { readout: [
      ['Volume of the unit ball', (s) => unitVolume(s.n).toFixed(5)],
      ['Share in the skin', (s) => `${(skin(s.n, s.eps) * 100).toFixed(2)} %`],
      ['Biggest at n =', () => String([...Array(31).keys()].reduce((b, k) => (unitVolume(k) > unitVolume(b) ? k : b), 0))],
    ] },
  ],
  tex: (s) => `V_{${s.n}}=${unitVolume(s.n).toFixed(4)},\\quad V_n=\\dfrac{2\\pi}{n}V_{n-2}`,
});
