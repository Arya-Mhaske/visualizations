import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { m: 5, mu: 0.4, A: 200 };
const f = (s) => s.mu * s.m * G;
const p = (s, A) => (s.m * G) / (A / 10000) / 1000;

createTool({
  state,
  label: 'Two graphs against contact area. Friction stays flat while the pressure on the surface falls as the area grows.',
  setup: (stage, c) => [
    createPlot(stage, { x: [0, 500], y: [0, 40], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.5 }) }),
    createPlot(stage, { x: [0, 500], y: [0, 40], c, box: (st) => ({ x: 0, y: st.h * 0.5, w: st.w, h: st.h * 0.5 }) }),
  ],
  draw(ctx, stage, c, [top, bottom]) {
    top.setRange([0, 500], [0, 60]);
    top.axes({ xLabel: '', yLabel: 'f (N)' });
    top.fn(() => f(state), { color: c.b });
    top.point(state.A, f(state), { fill: c.a });
    bottom.setRange([0, 500], [0, 60]);
    bottom.axes({ xLabel: 'contact area (cm²)', yLabel: 'p (kPa)' });
    bottom.fn((A) => p(state, Math.max(A, 20)), { color: c.c });
    bottom.point(state.A, p(state, state.A), { fill: c.a });
  },
  controls: [
    { title: 'Turn the brick' },
    { key: 'm', label: 'Mass (kg)', min: 1, max: 10, step: 1 },
    { key: 'mu', label: 'μ', min: 0.1, max: 0.8, step: 0.05 },
    { key: 'A', label: 'Contact area (cm²)', min: 50, max: 500, step: 10 },
    { readout: [
      ['Friction μN', (s) => `${fixed(f(s), 1)} N`],
      ['Pressure N/A', (s) => `${fixed(p(s, s.A), 1)} kPa`],
    ] },
  ],
  tex: (s) => `f=\\mu N=${s.mu}\\times${fixed(s.m * G, 1)}=${fixed(f(s), 1)}\\ \\mathrm{N}\\ (\\text{no }A)`,
});
