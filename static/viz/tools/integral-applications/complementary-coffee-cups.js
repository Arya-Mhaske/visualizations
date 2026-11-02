import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Inside a cylinder of radius 1 and height 1 (volume π), spin the curve y = x^p about the y-axis.
// The bowl above the curve is cup A, the solid below it is cup B. They fit together to fill the cylinder.
const state = { p: 2 };
const bowl = () => simpson((x) => 2 * Math.PI * x * (1 - x ** state.p), 0, 1, 2000); // shells of height 1 − x^p
const under = () => simpson((x) => 2 * Math.PI * x * x ** state.p, 0, 1, 2000);

createTool({
  state,
  label: 'A unit square split by the curve y equals x to the power p. Spun about the vertical axis, the part above the curve is a bowl (cup A) and the part below is a solid core (cup B). Two bars show their volumes, which always add up to pi.',
  setup: (stage, c) => createPlot(stage, { x: [-0.1, 1.1], y: [-0.1, 1.1], c, box: (s) => ({ x: 0, y: 0, w: s.w, h: s.h * 0.7 }) }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(() => 1, (x) => x ** state.p, 0, 1, c.fillB);
    plot.shade((x) => x ** state.p, null, 0, 1, c.fillA);
    plot.fn((x) => x ** state.p, { color: c.ink, width: 3 });
    const y0 = stage.h * 0.76; const w = stage.w - 40; const hh = 22;
    const A = bowl() / Math.PI; const B = under() / Math.PI;
    ctx.fillStyle = c.fillB; ctx.fillRect(20, y0, w * A, hh); ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.strokeRect(20, y0, w * A, hh);
    ctx.fillStyle = c.fillA; ctx.fillRect(20 + w * A, y0, w * B, hh); ctx.strokeRect(20 + w * A, y0, w * B, hh);
    ctx.fillStyle = c.ink; ctx.font = `12px ${c.fontMono}`;
    ctx.fillText(`A (bowl) ${num(A, 3)} of the cylinder`, 20, y0 + hh + 18);
    ctx.fillText(`B (core) ${num(B, 3)}`, 20, y0 + hh + 36);
  },
  controls: [
    { title: 'Choose the curve' },
    { key: 'p', label: 'Power p in y = xᵖ', min: 0.5, max: 4, step: 0.25, format: (v) => v.toFixed(2) },
    { readout: [
      ['Volume of cup A (bowl)', () => num(bowl(), 6)],
      ['Volume of cup B (core)', () => num(under(), 6)],
      ['A + B', () => `${num(bowl() + under(), 6)} = π`],
      ['Equal when', () => (Math.abs(state.p - 2) < 1e-9 ? { text: 'p = 2: both are π/2', good: true } : 'p = 2')],
    ] },
  ],
  tex: (s) => `V_A=\\pi\\frac{p}{p+2},\\qquad V_B=\\frac{2\\pi}{p+2}\\quad(p=${s.p})`,
});
