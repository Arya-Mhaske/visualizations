import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { curve, at, NAMES } from './_phase.js';
import { heatPlot, energyBar, molecules } from './_phase-view.js';

const state = { m: 100, P: 1, q: 40 };
const run = (s) => curve(s.m / 1000, -20, 120, s.P);
const Qnow = (s) => (s.q / 100) * run(s).total;

createTool({
  state,
  label: 'A graph of temperature against heat added for ice warmed from minus twenty degrees to steam. It rises and has two flat parts, at melting and at boiling. Below it, a picture of the molecules and a bar showing how the heat is shared between warming and changing state.',
  setup: (stage, c) => createPlot(stage, { x: [0, 300], y: [-40, 140], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.58 }) }),
  draw(ctx, stage, c, plot) {
    const r = run(state);
    heatPlot(plot, c, r.segs, r.total);
    const now = at(r.segs, Qnow(state));
    plot.point(Qnow(state) / 1000, now.T, { fill: c.c });
    molecules(ctx, c, { x: 14, y: stage.h * 0.68, w: stage.w * 0.34, h: stage.h * 0.24 }, now.kind, now.f);
    energyBar(ctx, stage, c, r.segs, r.total, { x: stage.w * 0.42, y: stage.h * 0.74, w: stage.w * 0.54, h: 26 });
  },
  controls: [
    { title: 'Heat steadily' },
    { key: 'q', label: 'Heat added (% of total)', min: 0, max: 100, step: 1 },
    { key: 'm', label: 'Mass (g)', min: 50, max: 500, step: 50 },
    { key: 'P', label: 'Pressure (atm)', min: 0.5, max: 2, step: 0.1 },
    { readout: [
      ['Now', (s) => NAMES[at(run(s).segs, Qnow(s)).kind]],
      ['Temperature', (s) => `${fixed(at(run(s).segs, Qnow(s)).T, 1)} °C`],
      ['Heat added', (s) => `${fixed(Qnow(s) / 1000, 1)} kJ`],
      ['Boils at', (s) => `${fixed(run(s).Tb, 1)} °C`],
    ] },
  ],
  tex: (s) => `Q=mc\\Delta T\\ \\text{(warming)}\\qquad Q=mL\\ \\text{(changing state)}`,
});
