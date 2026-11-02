import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, dU } from './_thermo.js';
import { fixed } from '../../lib/format.js';

// A = (200 kPa, 10 L). B is chosen. Monatomic gas: U = 1.5 P V.
const [P1, V1] = [200, 10];
const state = { path: 'top', P2: 100, V2: 30, amp: 40 };
const lin = (s) => (V) => P1 + ((s.P2 - P1) * (V - V1)) / (s.V2 - V1);
const pathFn = (s) => {
  if (s.path === 'top') return () => P1;
  if (s.path === 'bottom') return () => s.P2;
  if (s.path === 'line') return lin(s);
  return (V) => lin(s)(V) + s.amp * Math.sin((2 * Math.PI * (V - V1)) / (s.V2 - V1));
};
const work = (s) => simpson(pathFn(s), V1, s.V2, 400);
const dUof = (s) => dU(3, P1, V1, s.P2, s.V2);

createTool({
  state,
  label: 'A pressure against volume graph with a start point A and an end point B. Four different paths join them. The shaded area under the chosen path is the work. The work changes with the path, but the change in internal energy does not.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 45], y: [0, 450] }),
  draw(ctx, stage, c, plot) {
    const f = pathFn(state);
    plot.axes({ xLabel: 'V (L)', yLabel: 'P (kPa)' });
    plot.shade(f, null, V1, state.V2, c.fillB);
    if (state.path === 'top') {
      plot.segment(V1, P1, state.V2, P1, { color: c.a, width: 4 });
      plot.segment(state.V2, P1, state.V2, state.P2, { color: c.a, width: 4 });
    } else if (state.path === 'bottom') {
      plot.segment(V1, P1, V1, state.P2, { color: c.a, width: 4 });
      plot.segment(V1, state.P2, state.V2, state.P2, { color: c.a, width: 4 });
    } else plot.fn(f, { color: c.a, domain: [V1, state.V2] });
    plot.point(V1, P1, { fill: c.c });
    plot.point(state.V2, state.P2, { fill: c.d });
    plot.text('A', V1 - 2, P1 + 20, { size: 12, patch: false });
    plot.text('B', state.V2 + 2, state.P2 + 20, { size: 12, patch: false });
  },
  controls: [
    { title: 'Choose a path from A to B' },
    { key: 'path', label: 'Path', options: [['top', 'Top'], ['bottom', 'Bottom'], ['line', 'Line'], ['wiggle', 'Wiggle']] },
    { key: 'V2', label: 'End volume V_B (L)', min: 15, max: 40, step: 5 },
    { key: 'P2', label: 'End pressure P_B (kPa)', min: 100, max: 300, step: 50 },
    { key: 'amp', label: 'Wiggle size (Wiggle path)', min: 0, max: 60, step: 10 },
    { readout: [
      ['W (area)', (s) => `${fixed(work(s), 0)} J`],
      ['ΔU (any path)', (s) => `${fixed(dUof(s), 0)} J`],
      ['Q = ΔU + W', (s) => `${fixed(dUof(s) + work(s), 0)} J`],
    ] },
  ],
  tex: (s) => `\\Delta U=\\tfrac32(P_BV_B-P_AV_A)=${fixed(dUof(s), 0)}\\ \\mathrm{J},\\quad Q=\\Delta U+W=${fixed(dUof(s), 0)}+${fixed(work(s), 0)}`,
});
