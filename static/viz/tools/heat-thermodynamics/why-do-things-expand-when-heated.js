import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { lj, harmonic, turning } from './_expansion-math.js';

const state = { E: -0.6, sym: false };

createTool({
  state,
  label: 'A graph of the potential energy between two atoms against their separation, with a horizontal line at the atom energy. The atom swings between where the line meets the curve on the left and on the right, and its mean position is marked.',
  setup: (stage, c) => createPlot(stage, { x: [0.8, 1.7], y: [-1.1, 0.5], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.78 }) }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'r', yLabel: 'U(r)' });
    plot.fn(state.sym ? harmonic : lj, { color: c.b });
    const t = turning(state.E, state.sym);
    plot.segment(t.left, state.E, t.right, state.E, { color: c.a, width: 4 });
    plot.segment(t.mean, state.E - 0.1, t.mean, state.E + 0.1, { color: c.ink, width: 3 });
    plot.segment(1, -1.1, 1, 0.5, { color: c.ink, dash: [5, 4], width: 1 });
    const y = stage.h * 0.9;
    for (let i = 0; i < 6; i++) {
      const x = 20 + i * ((stage.w - 40) / 5.5) * (t.mean / 1.3);
      dot(ctx, Math.min(x, stage.w - 12), y, 8, c.fillB, c.ink, 2);
    }
    line(ctx, 20, y + 14, 20 + 5 * ((stage.w - 40) / 5.5) * (t.mean / 1.3), y + 14, { color: c.ink, width: 1 });
    label(ctx, `average spacing ${fixed(t.mean, 3)}`, stage.w / 2, stage.h - 4, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Heat the atom' },
    { key: 'E', label: 'Atom energy E', min: -0.9, max: -0.2, step: 0.05 },
    { key: 'sym', label: 'Symmetric well', toggle: true },
    { readout: [
      ['Closest', (s) => fixed(turning(s.E, s.sym).left, 3)],
      ['Furthest', (s) => fixed(turning(s.E, s.sym).right, 3)],
      ['Average spacing', (s) => fixed(turning(s.E, s.sym).mean, 3)],
    ] },
  ],
  tex: (s) => `\\bar r=\\dfrac{r_{\\min}+r_{\\max}}{2}=${fixed(turning(s.E, s.sym).mean, 3)}`,
});
