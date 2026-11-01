import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed, sig } from '../../lib/format.js';
import { current, terminal } from './_cells-emf-power-math.js';

const E = 12;
const state = { r: 1, R: 5 };
const I = (s) => current(E, s.r, s.R);
const V = (s) => terminal(E, s.r, I(s));

const tool = createTool({
  state,
  label: 'A graph of terminal voltage against the current drawn from a 12 volt cell. A straight line falls from 12 volts at zero current. A coral point shows the present load, and a dashed vertical drop shows the volts lost inside the cell.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 13], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, (E / state.r) * 1.05], [0, 13]);
    plot.axes({ xLabel: 'I (A)', yLabel: 'V (V)' });
    plot.fn((i) => terminal(E, state.r, i), { color: c.b, domain: [0, E / state.r] });
    plot.segment(0, E, I(state), E, { color: c.grid, dash: [6, 5] });
    plot.segment(I(state), E, I(state), V(state), { color: c.d, width: 5 });
    plot.point(I(state), V(state), { fill: c.a, r: 8 });
    plot.text('emf', 0, E, { patch: false });
  },
  controls: () => [
    { title: 'A 12 V cell and its load' },
    { key: 'r', label: 'Internal resistance, r', min: 0.2, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} Ω` },
    { key: 'R', label: 'Load, R', min: 0.2, max: 20, step: 0.1, format: (n) => `${fixed(n, 1)} Ω` },
    { readout: [
      ['Current, I', (s) => `${sig(I(s), 3)} A`],
      ['Lost inside, Ir', (s) => `${sig(I(s) * s.r, 3)} V`],
      ['Terminal, V', (s) => `${sig(V(s), 3)} V`],
    ] },
  ],
  tex: (s) => `V=\\varepsilon-Ir=${E}-(${sig(I(s), 3)})(${fixed(s.r, 1)})=${sig(V(s), 3)}\\ \\text{V}`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(I(state), V(state)),
  move(px) {
    const i = Math.max(0.01, Math.min(E / state.r - 0.001, tool.extra.toWorld(px, 0)[0]));
    state.R = Math.max(0.2, Math.min(20, Math.round((E / i - state.r) * 10) / 10));
  },
  nudge(direction) { state.R = Math.max(0.2, Math.min(20, Math.round((state.R - direction * 0.1) * 10) / 10)); },
}], { onChange: () => tool.update() });
tool.update();
