import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { terminal } from './_viscosity-math.js';

const state = { a: 10, u: 2 };
const fall = (a) => terminal(a * 1e-6, 1000, 1.2, 1.8e-5) * 1000; // mm/s
const state2 = state;

createTool({
  state,
  label: 'A graph of how fast a water droplet falls in air against its radius in microns, with a horizontal line for the updraft. Small droplets lie below the line and are carried upwards.',
  setup: (stage, c) => createPlot(stage, { x: [0, 60], y: [-1, 3.2], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.75 }) }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'radius a (μm)', yLabel: 'log₁₀ v (mm/s)' });
    plot.fn((x) => Math.log10(Math.max(1e-9, fall(x))), { color: c.b });
    plot.segment(0, Math.log10(state2.u * 10), 60, Math.log10(state2.u * 10), { color: c.c, width: 3 });
    plot.point(state2.a, Math.log10(fall(state2.a)), { fill: c.a });
    const [cx, cy] = [stage.w / 2, stage.h * 0.88];
    const net = state2.u * 10 - fall(state2.a);
    dot(ctx, cx, cy, 5 + state2.a / 6, c.fillB, c.ink);
    const len = Math.min(40, Math.abs(net) * 1.5 + 4);
    arrow(ctx, cx + 40, cy, cx + 40, cy - Math.sign(net) * len, { color: net > 0 ? c.c : c.a, width: 3 });
    label(ctx, net > 0 ? 'carried up' : 'falls', cx + 62, cy, c, { size: 12, align: 'left', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Droplet and updraft' },
    { key: 'a', label: 'Droplet radius a (μm)', min: 1, max: 60, step: 1 },
    { key: 'u', label: 'Updraft (cm/s)', min: 0, max: 20, step: 0.5 },
    { readout: [
      ['Fall speed', (s) => `${sig(fall(s.a), 3)} mm/s`],
      ['Updraft', (s) => `${sig(s.u * 10, 3)} mm/s`],
      ['Net motion', (s) => `${sig(Math.abs(s.u * 10 - fall(s.a)), 3)} mm/s ${s.u * 10 > fall(s.a) ? 'up' : 'down'}`],
    ] },
  ],
  tex: (s) => `v_T=\\dfrac{2a^2\\rho g}{9\\eta}=${sig(fall(s.a), 3)}\\ \\mathrm{mm/s}`,
});
