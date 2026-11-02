import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { curve, NAMES } from './_phase.js';
import { heatPlot, energyBar } from './_phase-view.js';

const state = { m: 100, T0: -20, T1: 120 };
const run = (s) => curve(s.m / 1000, s.T0, Math.max(s.T1, s.T0 + 1), 1);

createTool({
  state,
  label: 'A heating curve built from the chosen start and end temperatures, with a coloured bar underneath showing how much heat each stage needs.',
  setup: (stage, c) => createPlot(stage, { x: [0, 300], y: [-40, 140], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.7 }) }),
  draw(ctx, stage, c, plot) {
    const r = run(state);
    heatPlot(plot, c, r.segs, r.total);
    energyBar(ctx, stage, c, r.segs, r.total, { x: 16, y: stage.h * 0.82, w: stage.w - 32, h: 28 });
  },
  controls: [
    { title: 'Build the curve' },
    { key: 'T0', label: 'Start T (°C)', min: -40, max: 100, step: 5 },
    { key: 'T1', label: 'Final T (°C)', min: 0, max: 140, step: 5 },
    { key: 'm', label: 'Mass (g)', min: 50, max: 500, step: 50 },
    { readout: [
      ...['ice', 'melt', 'water', 'boil', 'steam'].map((k) => [NAMES[k], (s) => { const g = run(s).segs.find((x) => x.kind === k); return g ? `${fixed(g.Q / 1000, 1)} kJ` : '—'; }]),
      ['Total', (s) => `${fixed(run(s).total / 1000, 1)} kJ`],
    ] },
  ],
  tex: (s) => `Q_{\\text{total}}=${fixed(run(s).total / 1000, 1)}\\ \\mathrm{kJ}`,
});
