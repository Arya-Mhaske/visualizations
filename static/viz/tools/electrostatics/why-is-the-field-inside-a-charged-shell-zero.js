import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';

// Thin shell of radius 1.5 m carrying Q µC. A Gaussian sphere of radius r. E = k Q_enc / r², with k = 8.988 × 10⁹ and Q in µC giving N/C × 10⁻⁶.
const SHELL = 1.5;
const state = { r: 0.8, Q: 3 };
const enc = (s) => (s.r > SHELL ? s.Q : 0);
const E = (s, r = s.r) => (r > SHELL ? (8988 * s.Q) / (r * r) : 0);

createTool({
  state,
  label: 'Top: a charged spherical shell with a dashed Gaussian sphere of adjustable radius. Bottom: a graph of the field against distance from the centre. The field is zero everywhere inside the shell. It jumps up at the shell and then falls as one over r squared.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 3], y: [0, 14000], box: (st) => ({ x: 0, y: st.h * 0.4, w: st.w, h: st.h * 0.6 }) }),
  draw(ctx, stage, c, plot) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min(W * 0.14, H * 0.16);
    const [cx, cy] = [W / 2, H * 0.2];
    ctx.beginPath();
    ctx.arc(cx, cy, SHELL * s, 0, Math.PI * 2);
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, state.r * s, 0, Math.PI * 2);
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]);
    dot(ctx, cx, cy, 3, c.ink, c.ink, 1);
    plot.axes({ xLabel: 'r (m)', yLabel: 'E (N/C)' });
    plot.segment(0, 0, SHELL, 0, { color: c.b, width: 5 });
    plot.fn((r) => (8988 * state.Q) / (r * r), { color: c.b, domain: [SHELL, 3] });
    plot.segment(SHELL, 0, SHELL, (8988 * state.Q) / (SHELL * SHELL), { color: c.grid, width: 1.5, dash: [4, 4] });
    plot.point(state.r, E(state), { fill: c.a });
  },
  controls: [
    { title: 'Draw a Gaussian sphere' },
    { key: 'r', label: 'Radius of Gaussian sphere r (m)', min: 0.1, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'Q', label: 'Shell charge Q (µC)', min: 1, max: 5, step: 1 },
    { readout: [
      ['Charge inside', (s) => `${enc(s)} µC`],
      ['E on the sphere', (s) => `${E(s).toFixed(0)} N/C`],
    ] },
  ],
  tex: (s) => `E\\cdot 4\\pi r^{2}=\\dfrac{q_{enc}}{\\varepsilon_0}=\\dfrac{${enc(s)}\\ \\mu\\mathrm{C}}{\\varepsilon_0}\\ \\Rightarrow\\ E=${E(s).toFixed(0)}\\ \\mathrm{N/C}`,
});
