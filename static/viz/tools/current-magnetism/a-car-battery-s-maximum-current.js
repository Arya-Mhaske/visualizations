import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig, fixed } from '../../lib/format.js';
import { current } from './_cells-emf-power-math.js';

const E = 12;
const state = { r: 0.4, R: 0.4 };
const I = (R) => current(E, state.r, R);

const tool = createTool({
  state,
  label: 'A graph of current against load resistance for a 12 volt car battery. The curve falls from its highest value at zero load. A dashed horizontal line marks that highest current, epsilon over r. A coral point shows the chosen load.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5], y: [0, 125], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 5], [0, (E / state.r) * 1.15]);
    plot.axes({ xLabel: 'R (Ω)', yLabel: 'I (A)' });
    plot.segment(0, E / state.r, 5, E / state.r, { color: c.grid, dash: [6, 5] });
    plot.fn(I, { color: c.b, domain: [0, 5] });
    plot.point(state.R, I(state.R), { fill: c.a, r: 8 });
    plot.text('I max = ε/r', 3.4, (E / state.r) * 1.06, { patch: false });
  },
  controls: () => [
    { title: 'A 12 V car battery' },
    { key: 'r', label: 'Internal resistance, r', min: 0.05, max: 1, step: 0.05, format: (n) => `${fixed(n, 2)} Ω` },
    { key: 'R', label: 'Load, R', min: 0, max: 5, step: 0.05, format: (n) => `${fixed(n, 2)} Ω` },
    { readout: [
      ['Current, I', (s) => `${sig(I(s.R), 3)} A`],
      ['Most it can give', (s) => `${sig(E / s.r, 3)} A`],
      ['Volts lost inside', (s) => `${sig(I(s.R) * s.r, 3)} V`],
    ] },
  ],
  tex: (s) => `I_{max}=\\dfrac{\\varepsilon}{r}=\\dfrac{${E}}{${fixed(s.r, 2)}}=${sig(E / s.r, 3)}\\ \\text{A}`,
});
tool.update();
