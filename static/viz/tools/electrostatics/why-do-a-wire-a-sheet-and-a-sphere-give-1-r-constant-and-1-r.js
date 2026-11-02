import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, dot, label } from '../../lib/draw.js';

// k = 8988 for Q in µC; the density is a multiplier. Sphere E = kQ/r², wire E = 2kλ/r, sheet E = 2πkσ.
const SHAPES = {
  sphere: { name: 'Sphere', E: (m, r) => (8988 * m) / (r * r), power: 2, surface: 'a sphere of radius r', tex: (m, r, e) => `E\\cdot4\\pi r^{2}=\\dfrac{Q}{\\varepsilon_0}\\Rightarrow E=\\dfrac{kQ}{r^{2}}=${e}` },
  wire: { name: 'Wire', E: (m, r) => (17976 * m) / r, power: 1, surface: 'a cylinder of radius r', tex: (m, r, e) => `E\\cdot2\\pi rL=\\dfrac{\\lambda L}{\\varepsilon_0}\\Rightarrow E=\\dfrac{\\lambda}{2\\pi\\varepsilon_0 r}=${e}` },
  sheet: { name: 'Sheet', E: (m) => 56500 * m, power: 0, surface: 'a pillbox', tex: (m, r, e) => `E\\cdot2A=\\dfrac{\\sigma A}{\\varepsilon_0}\\Rightarrow E=\\dfrac{\\sigma}{2\\varepsilon_0}=${e}` },
};
const state = { shape: 'sphere', m: 1, r: 1 };
const E = (s, r = s.r) => SHAPES[s.shape].E(s.m, r);

createTool({
  state,
  label: 'Top: a sketch of the Gaussian surface matched to each charge shape, a sphere around a point, a cylinder around a wire, and a pillbox through a sheet. Bottom: the field against distance. It falls as one over r squared for the sphere, as one over r for the wire, and stays constant for the sheet.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 4], y: [0, 1], box: (st) => ({ x: 0, y: st.h * 0.42, w: st.w, h: st.h * 0.58 }) }),
  draw(ctx, stage, c, plot) {
    const [W, H] = [stage.w, stage.h];
    const [cx, cy] = [W / 2, H * 0.2];
    const k = H * 0.06 * state.r;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 5]);
    if (state.shape === 'sphere') { ctx.beginPath(); ctx.arc(cx, cy, k + 6, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); dot(ctx, cx, cy, 8, c.a, c.ink); }
    else if (state.shape === 'wire') { ctx.strokeRect(cx - k - 6, H * 0.04, 2 * (k + 6), H * 0.32); ctx.setLineDash([]); line(ctx, cx, H * 0.02, cx, H * 0.38, { color: c.a, width: 6 }); }
    else { ctx.strokeRect(cx - H * 0.1, cy - k - 6, H * 0.2, 2 * (k + 6)); ctx.setLineDash([]); line(ctx, W * 0.15, cy, W * 0.85, cy, { color: c.a, width: 6 }); }
    ctx.setLineDash([]);
    label(ctx, SHAPES[state.shape].surface, W * 0.5, H * 0.4, c, { size: 11, bounds: stage, patch: false });
    const top = Math.max(...[0.25, 4].map((r) => E(state, r))) * 1.1 || 1;
    const hi = Math.max(E(state, 0.25), E(state, 4)) * 1.1;
    plot.setRange([0, 4], [0, state.shape === 'sphere' ? E(state, 0.5) * 1.1 : hi]);
    void top;
    plot.axes({ xLabel: 'r (m)', yLabel: 'E (N/C)' });
    plot.fn((r) => E(state, r), { color: c.b, domain: [0.25, 4] });
    plot.point(state.r, E(state), { fill: c.a });
  },
  controls: [
    { title: 'Match the surface' },
    { key: 'shape', label: 'Charge shape', options: Object.entries(SHAPES).map(([k, v]) => [k, v.name]) },
    { key: 'r', label: 'Distance r (m)', min: 0.5, max: 4, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'm', label: 'Charge amount (× µC, µC/m, µC/m²)', min: 1, max: 5, step: 1 },
    { readout: [
      ['E at r', (s) => `${E(s).toFixed(0)} N/C`],
      ['E at 2r ÷ E at r', (s) => (E(s, 2 * s.r) / E(s)).toFixed(2)],
      ['Falls as', (s) => ['constant', '1/r', '1/r²'][SHAPES[s.shape].power]],
    ] },
  ],
  tex: (s) => SHAPES[s.shape].tex(s.m, s.r, `${E(s).toFixed(0)}\\ \\mathrm{N/C}`),
});
