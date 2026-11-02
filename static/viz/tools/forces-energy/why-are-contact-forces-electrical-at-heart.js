import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { d: 3.5 };
const force = (d) => Math.exp(-(d - 2) / 0.35);

createTool({
  state,
  label: 'Top: two atoms drawn with soft electron clouds that overlap as they approach. Bottom: a graph of the repulsive force against separation, which rises very steeply.',
  setup: (stage, c) => createPlot(stage, { x: [1.5, 5], y: [0, 6], c, box: (st) => ({ x: 0, y: st.h * 0.4, w: st.w, h: st.h * 0.6 }) }),
  draw(ctx, stage, c, plot) {
    const k = stage.w / 8;
    const y = stage.h * 0.2;
    [stage.w / 2 - (state.d * k) / 2, stage.w / 2 + (state.d * k) / 2].forEach((x) => {
      ctx.save();
      ctx.globalAlpha = 0.35;
      dot(ctx, x, y, 1.1 * k, c.fillB, null);
      ctx.restore();
      dot(ctx, x, y, 7, c.a, c.ink);
    });
    label(ctx, state.d < 2.2 ? 'clouds overlap: strong repulsion' : 'clouds apart: tiny force', stage.w / 2, 14, c, { size: 12, bounds: stage, patch: false });
    plot.axes({ xLabel: 'separation (Å)', yLabel: 'force (arb.)' });
    plot.fn(force, { color: c.a });
    plot.point(state.d, Math.min(force(state.d), 5.9), { fill: c.a });
  },
  controls: [
    { title: 'Push two atoms' },
    { key: 'd', label: 'Separation (Å)', min: 1.5, max: 5, step: 0.1 },
    { readout: [
      ['Repulsive force (model)', (s) => fixed(force(s.d), 3)],
      ['Squeeze by 0.35 Å', (s) => `force ×${fixed(Math.E, 2)}`],
    ] },
  ],
  tex: (s) => `F\\propto e^{-(d-2)/0.35}=${fixed(force(s.d), 3)}`,
});
