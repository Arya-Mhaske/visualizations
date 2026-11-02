import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

// ε = NBAω sin ωt. Change any of N, B, A, f and compare with the default (dashed).
const state = { N: 100, B: 0.5, A: 0.02, f: 50 };
const REF = { N: 100, B: 0.5, A: 0.02, f: 50 };
const e0 = (s) => s.N * s.B * s.A * 2 * Math.PI * s.f;
const e = (s, ms) => e0(s) * Math.sin(2 * Math.PI * s.f * (ms / 1000));

const tool = createTool({
  state,
  label: 'A graph of emf in volts against time over 40 milliseconds. A solid coral sine wave is the generator you have set. A dashed grey sine wave is the starting generator for comparison. Changing N, B or A raises the wave; changing the frequency also squeezes it sideways.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [-700, 700], c, pad: 32 }),
  draw(ctx, stage, c, plot) {
    const top = Math.max(e0(state), e0(REF)) * 1.15;
    plot.setRange([0, 40], [-top, top]);
    plot.axes({ xLabel: 't (ms)', yLabel: 'ε (V)' });
    plot.fn((ms) => e(REF, ms), { color: c.grid, dash: [6, 4], width: 2 });
    plot.fn((ms) => e(state, ms), { color: c.a });
    plot.segment(0, e0(state), 40, e0(state), { color: c.ink, width: 1, dash: [3, 4] });
  },
  controls: () => [
    { title: 'Design a generator' },
    { key: 'N', label: 'Turns N', min: 10, max: 300, step: 10 },
    { key: 'B', label: 'Field B', min: 0.1, max: 1, step: 0.05, format: (v) => `${fixed(v, 2)} T` },
    { key: 'A', label: 'Coil area A', min: 0.005, max: 0.05, step: 0.005, format: (v) => `${fixed(v, 3)} m²` },
    { key: 'f', label: 'Frequency f', min: 10, max: 100, step: 5, format: (v) => `${v} Hz` },
    { readout: [
      ['Peak emf NBAω', (s) => `${sig(e0(s), 4)} V`],
      ['rms emf', (s) => `${sig(e0(s) / Math.SQRT2, 4)} V`],
      ['Period', (s) => `${fixed(1000 / s.f, 1)} ms`],
      ['Compared with the dashed', (s) => `×${fixed(e0(s) / e0(REF), 2)}`],
    ] },
  ],
  tex: (s) => `\\varepsilon_0=NBA\\omega=${s.N}\\times${fixed(s.B, 2)}\\times${fixed(s.A, 3)}\\times${fixed(2 * Math.PI * s.f, 1)}=${sig(e0(s), 4)}\\ \\text{V}`,
});

tool.update();
