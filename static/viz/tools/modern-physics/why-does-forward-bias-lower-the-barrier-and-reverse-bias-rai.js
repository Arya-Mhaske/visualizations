import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { LOG_T_MAX, V0, VT, diodeCurrent, electronEnergy, junctionAt } from './_p-n-junction-diode-math.js';
import { amps, drawStrip } from './_p-n-junction-diode-view.js';

const state = { V: 0.3 };
const now = (s) => junctionAt(LOG_T_MAX, s.V);
const um = (m) => m * 1e6;
// Energy of an electron (eV): the p bulk is fixed at V0, the n bulk sits at V.
const energy = (x, V) => {
  const j = junctionAt(LOG_T_MAX, V);
  return V + electronEnergy(x * 1e-6, j.Vj, j.width / 2);
};
const climbers = (s) => Math.exp(s.V / VT);

const tool = createTool({
  state,
  label: 'Top: a graph of the energy of an electron across the junction. The p side is a fixed upper level, the n side a lower level that the battery moves, and a smooth step joins them; a dashed outline shows the step at zero battery. Bottom: the junction strip with the depletion layer shaded, narrower or wider as the battery changes.',
  setup: (stage, c) => createPlot(stage, {
    x: [-0.75, 0.75], y: [-5.4, 1.3], c, pad: 26,
    box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.62 }),
  }),
  draw(ctx, stage, c, plot) {
    const j = now(state);
    plot.setRange([-0.75, 0.75], [Math.min(0, state.V) - 0.6, V0 + 0.6]);
    plot.axes({ xLabel: 'x (μm)', yLabel: 'electron energy (eV)', grid: false });
    plot.fn((x) => energy(x, 0), { color: c.grid, width: 3, dash: [6, 5] });
    plot.fn((x) => energy(x, state.V), { color: c.a, width: 4 });
    for (const x of [0.28, 0.4, 0.52, 0.64]) plot.point(x, state.V, { fill: c.a, r: 5 });
    plot.segment(0.72, state.V, 0.72, V0, { color: c.b, width: 3 });
    plot.text(`${fixed(j.Vj, 2)} eV`, 0.58, (state.V + V0) / 2, { size: 11, color: c.b });
    plot.text('p bulk', -0.55, V0 + 0.25, { size: 11 });
    plot.text('n bulk', 0.45, state.V - 0.3, { size: 11 });
    plot.text(state.V >= 0 ? 'battery: + to p side' : 'battery: + to n side', -0.35, Math.min(0, state.V) - 0.4, { size: 11 });
    drawStrip(ctx, c, { x: 6, y: stage.h * 0.66, w: stage.w - 12, h: stage.h * 0.32 }, { width: j.width, field: true });
  },
  controls: () => [
    { title: 'Connect a battery' },
    { key: 'V', label: 'Bias, V (+ is forward)', min: -5, max: 0.65, step: 0.05, format: (n) => `${fixed(n, 2)} V` },
    { readout: [
      ['Barrier', (s) => `${fixed(now(s).Vj, 2)} V`],
      ['Layer width', (s) => `${fixed(um(now(s).width), 2)} μm`],
      ['Climbers vs 0 V', (s) => `× ${sig(climbers(s), 3)}`],
      ['Current', (s) => (Math.abs(s.V) < 0.005 ? '0' : amps(diodeCurrent(s.V)))],
    ] },
  ],
  tex: (s) => `\\text{barrier}=e(V_0-V)=e(0.7-(${fixed(s.V, 2)}))=${fixed(now(s).Vj, 2)}\\ \\text{eV}`,
});

tool.update();
