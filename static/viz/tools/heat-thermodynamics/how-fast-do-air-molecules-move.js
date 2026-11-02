import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { GASES, vrms, vmean, vp, maxwell } from './_kt.js';
import { fixed } from '../../lib/format.js';

const state = { gas: 'N2', T: 300 };
const M = (s) => GASES[s.gas].M;

createTool({
  state,
  label: 'The spread of molecular speeds in a gas, drawn as a curve with a long tail. Three marks show the most probable speed, the mean speed and the root mean square speed. Each is about half a kilometre a second for nitrogen at room temperature.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 3000], y: [0, 1], ticks: 'auto' }),
  draw(ctx, stage, c, plot) {
    const f = maxwell(M(state), state.T);
    const top = Math.max(...Array.from({ length: 300 }, (_, i) => f((i / 299) * 3000))) * 1.15;
    plot.setRange([0, 3000], [0, top]);
    plot.axes({ xLabel: 'v (m/s)', yLabel: 'fraction per m/s' });
    plot.shade(f, null, 0, 3000, c.fillY);
    plot.fn(f, { color: c.ink });
    const marks = [[vp(M(state), state.T), c.a, 'peak'], [vmean(M(state), state.T), c.b, 'mean'], [vrms(M(state), state.T), c.d, 'rms']];
    for (const [v, col, name] of marks) {
      plot.segment(v, 0, v, f(v), { color: col, width: 4 });
      plot.text(name, v, top * 0.05 + (name === 'mean' ? top * 0.1 : name === 'rms' ? top * 0.2 : 0), { color: col, size: 11 });
    }
  },
  controls: [
    { title: 'Pick a gas' },
    { key: 'gas', label: 'Gas', options: Object.entries(GASES).map(([k, g]) => [k, g.name]) },
    { key: 'T', label: 'Temperature (K)', min: 100, max: 600, step: 10 },
    { readout: [
      ['Most probable', (s) => `${fixed(vp(M(s), s.T), 0)} m/s`],
      ['Mean', (s) => `${fixed(vmean(M(s), s.T), 0)} m/s`],
      ['rms', (s) => `${fixed(vrms(M(s), s.T), 0)} m/s`],
      ['In km/h', (s) => `${fixed(vrms(M(s), s.T) * 3.6, 0)}`],
    ] },
  ],
  tex: (s) => `v_{rms}=\\sqrt{\\dfrac{3RT}{M}}=\\sqrt{\\dfrac{3\\times 8.314\\times ${s.T}}{${fixed(M(s) / 1000, 5)}}}=${fixed(vrms(M(s), s.T), 0)}\\ \\mathrm{m/s}`,
});
