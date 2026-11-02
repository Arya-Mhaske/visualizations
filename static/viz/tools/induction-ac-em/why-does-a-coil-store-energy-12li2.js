import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

// Raising the current by dI against the back-emf L dI/dt costs dW = ε·I dt = L I dI. Add up: W = ∫₀ᴵ L i di = ½LI².
// On a graph of (L·i) against i, that is the area of a triangle.
const state = { L: 0.5, I: 2 };
const W = (s) => 0.5 * s.L * s.I * s.I;

const tool = createTool({
  state,
  label: 'A graph of L times i, the back-emf factor, against the current i. It is a straight line through the origin. The area under the line up to the chosen current is a triangle, shaded, and its area is the energy stored. Thin vertical strips mark the small steps of work L i d i.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5], y: [0, 5], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 5.2], [0, Math.max(2.6 * 1, 5.2 * 1.0)]);
    plot.setRange([0, 5.2], [0, 5.2 * 1.0]);
    plot.axes({ xLabel: 'i (A)', yLabel: 'L·i (V·s = Wb turns)' });
    plot.shade((i) => state.L * i, null, 0, state.I, c.fillB);
    const n = 12;
    for (let k = 0; k < n; k++) {
      const i0 = (state.I * k) / n;
      plot.segment(i0, 0, i0, state.L * i0, { color: c.ink, width: 1 });
    }
    plot.fn((i) => state.L * i, { color: c.a, domain: [0, 5.2] });
    plot.point(state.I, state.L * state.I, { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Build up the current' },
    { key: 'L', label: 'Inductance L', min: 0.1, max: 1, step: 0.05, format: (v) => `${fixed(v, 2)} H` },
    { key: 'I', label: 'Final current I', min: 0.5, max: 5, step: 0.1, format: (v) => `${fixed(v, 1)} A` },
    { readout: [
      ['Triangle: ½ × base × height', (s) => `${fixed(0.5 * s.I * s.L * s.I, 3)} J`],
      ['Energy ½ L I²', (s) => `${fixed(W(s), 3)} J`],
      ['Double the current', (s) => `${fixed(4 * W(s), 3)} J (×4)`],
      ['Energy per volume (NCERT solenoid)', () => 'B²/2μ₀'],
    ] },
  ],
  tex: (s) => `W=\\int_0^{I}L\\,i\\,di=\\dfrac12LI^2=\\dfrac12\\times${fixed(s.L, 2)}\\times${fixed(s.I, 1)}^2=${sig(W(s), 3)}\\ \\text{J}`,
});

tool.update();
