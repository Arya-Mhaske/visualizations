import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { inverseSquare, norm } from './_vector-calculus-math.js';
import { WINDOW, fieldArrows, arrowAt } from './_vector-calculus-view.js';

const state = { kind: 'gravity', q: 2, r: 1.5 };
const sourceStrength = (s) => (s.kind === 'gravity' ? -Math.abs(s.q) : s.q);
const strength = (s, r) => norm(inverseSquare(sourceStrength(s), [0, 0], r, 0));

const tool = createTool({
  state,
  label: 'Arrows around a mass or a charge at the centre. Two coral arrows at distance r and 2r show that doubling the distance cuts the field to a quarter.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const q = sourceStrength(state);
    plot.axes({ grid: false });
    fieldArrows(ctx, plot, (x, y) => (Math.hypot(x, y) < 0.7 ? [0, 0] : inverseSquare(q, [0, 0], x, y)), c, { step: 1, color: c.grid, width: 2, soft: 0.5 });
    plot.point(0, 0, { fill: state.kind === 'gravity' ? c.d : q >= 0 ? c.a : c.b, r: 11 });
    for (const r of [state.r, 2 * state.r]) {
      if (r > 4.8) continue;
      const v = inverseSquare(q, [0, 0], r, 0);
      arrowAt(ctx, plot, r, 0, v[0], v[1], { k: 70, cap: 130, color: c.a, width: 4, head: 12 });
      plot.point(r, 0, { fill: c.ink, r: 4 });
      plot.text(`r = ${fixed(r, 1)}`, r, -0.7, { size: 11 });
    }
  },
  controls: [
    { title: 'The source at the centre' },
    { key: 'kind', label: 'Field of', options: [['gravity', 'A mass (always pulls in)'], ['electric', 'A charge (sign matters)']] },
    { key: 'q', label: 'Strength', min: -4, max: 4, step: 1 },
    { key: 'r', label: 'Distance r', min: 1, max: 2.5, step: 0.25 },
    { readout: [
      ['|F| at r', (s) => fixed(strength(s, s.r), 3)],
      ['|F| at 2r', (s) => fixed(strength(s, 2 * s.r), 3)],
      ['Ratio', (s) => (strength(s, s.r) === 0 ? '–' : fixed(strength(s, 2 * s.r) / strength(s, s.r), 3))],
    ] },
  ],
  tex: (s) => `|\\mathbf{F}| = \\dfrac{k|q|}{r^2}:\\quad \\dfrac{|\\mathbf{F}(2r)|}{|\\mathbf{F}(r)|} = \\dfrac{1}{4}`,
});
