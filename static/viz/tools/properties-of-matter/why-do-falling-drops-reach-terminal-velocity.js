import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { terminal, tau, netWeight, dragForce, approach } from './_viscosity-math.js';

const MEDIA = {
  air: { name: 'Water drop in air', rho: 1000, sigma: 1.2, eta: 1.8e-5, base: 1e-5 },
  gly: { name: 'Steel ball in glycerine', rho: 7800, sigma: 1260, eta: 1.4, base: 5e-4 },
};
const state = { m: 'air', k: 5, t: 1 };
const radius = (s) => MEDIA[s.m].base * s.k;
const vt = (s) => terminal(radius(s), MEDIA[s.m].rho, MEDIA[s.m].sigma, MEDIA[s.m].eta);
const tc = (s) => tau(radius(s), MEDIA[s.m].rho, MEDIA[s.m].eta);
const speedAt = (s) => vt(s) * approach(s.t);

createTool({
  state,
  label: 'A graph of falling speed over time rising and levelling off at the terminal speed. Below it, two bars compare the weight with the drag, which grows until they are equal.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6], y: [0, 1.15], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.66 }) }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't / τ', yLabel: 'v / v_T' });
    plot.segment(0, 1, 6, 1, { color: c.ink, dash: [6, 5], width: 2 });
    plot.fn((x) => approach(x), { color: c.b });
    plot.point(state.t, approach(state.t), { fill: c.a });
    const m = MEDIA[state.m];
    const W = netWeight(radius(state), m.rho, m.sigma);
    const D = dragForce(radius(state), m.eta, speedAt(state));
    const [x0, bw, y0] = [stage.w * 0.3, stage.w * 0.64, stage.h * 0.74];
    [['weight', W, c.c], ['drag', D, c.a]].forEach(([name, f, col], i) => {
      const y = y0 + i * 30;
      poly(ctx, [[x0, y], [x0 + bw * (f / W), y], [x0 + bw * (f / W), y + 20], [x0, y + 20]], { fill: col, stroke: c.ink });
      label(ctx, name, x0 - 8, y + 10, c, { size: 12, align: 'right', patch: false });
    });
  },
  controls: [
    { title: 'Drop a drop' },
    { key: 'm', label: 'Falling in', options: [['air', 'Water in air'], ['gly', 'Steel in glycerine']] },
    { key: 'k', label: 'Radius (×base)', min: 1, max: 10, step: 1 },
    { key: 't', label: 'Time (in units of τ)', min: 0, max: 6, step: 0.1 },
    { readout: [
      ['Radius a', (s) => `${sig(radius(s) * 1e6, 3)} μm`],
      ['Terminal speed', (s) => `${sig(vt(s), 3)} m/s`],
      ['τ = m/6πηa', (s) => `${sig(tc(s), 3)} s`],
      ['Speed now', (s) => `${sig(speedAt(s), 3)} m/s`],
      ['Net force', (s) => `${sig(100 * (1 - approach(s.t)), 2)}% of weight`],
    ] },
  ],
  tex: (s) => `6\\pi\\eta a v_T=\\tfrac43\\pi a^3(\\rho-\\sigma)g\\ \\Rightarrow\\ v_T=${sig(vt(s), 3)}\\ \\mathrm{m/s}`,
});
