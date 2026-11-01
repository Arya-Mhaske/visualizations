import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sci, texSci, fixed } from '../../lib/format.js';

const state = { a: 2, b: 7 };
// Typical values, rounded. Real samples vary.
const THINGS = [['stomach acid', 1.5], ['lemon juice', 2], ['coffee', 5], ['pure water', 7], ['sea water', 8], ['bleach', 12.5]];
const conc = (ph) => 10 ** -ph;
const near = (ph) => { const t = THINGS.find(([, v]) => Math.abs(v - ph) < 0.3); return t ? t[0] : 'between'; };

createTool({
  state,
  label: 'A pH ruler from 0 to 14 with everyday liquids marked. Two markers sit at pH values you choose. The readouts give the hydrogen ion concentration at each, and how many times larger one is than the other: every pH step is a factor of ten.',
  setup: (stage, c) => createPlot(stage, { x: [0, 14], y: [0, 1], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 14], [-0.5, 1.2]);
    for (let v = 0; v < 14; v++) plot.shade(() => 0.2, null, v, v + 1, v < 7 ? c.fillA : v === 7 ? c.fillC : c.fillB);
    plot.segment(0, 0, 14, 0, { color: c.ink, width: 3 });
    plot.segment(0, 0.2, 14, 0.2, { color: c.ink, width: 3 });
    for (let v = 0; v <= 14; v++) {
      plot.segment(v, 0, v, -0.07, { color: c.ink, width: 2 });
      plot.text(`${v}`, v, -0.2, { size: 10, patch: false });
    }
    THINGS.forEach(([name, v], i) => plot.text(name, v, 0.34 + (i % 2) * 0.13, { size: 9, color: c.ink, patch: false }));
    plot.segment(state.a, 0.2, state.a, 0.95, { color: c.a, width: 3 });
    plot.segment(state.b, 0.2, state.b, 0.95, { color: c.b, width: 3 });
    plot.point(state.a, 0.95, { fill: c.a, r: 8 });
    plot.point(state.b, 0.95, { fill: c.b, r: 8 });
  },
  controls: [
    { title: 'Compare two liquids' },
    { key: 'a', label: 'Coral marker, pH', min: 0, max: 14, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'b', label: 'Blue marker, pH', min: 0, max: 14, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Coral is close to', (s) => near(s.a)],
      ['[H⁺], coral', (s) => `${sci(conc(s.a), 2)} mol/L`],
      ['Blue is close to', (s) => near(s.b)],
      ['[H⁺], blue', (s) => `${sci(conc(s.b), 2)} mol/L`],
      ['Coral has', (s) => `${sci(10 ** (s.b - s.a), 3)} × the H⁺`],
    ] },
  ],
  tex: (s) => `\\dfrac{[\\mathrm{H}^+]_{\\text{coral}}}{[\\mathrm{H}^+]_{\\text{blue}}}=10^{${fixed(s.b, 1)}-${fixed(s.a, 1)}}=${texSci(10 ** (s.b - s.a), 3)}`,
});
