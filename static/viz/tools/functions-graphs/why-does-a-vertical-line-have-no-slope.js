import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { run: 3, rise: 3 };
const R = 6;

createTool({
  state,
  label: 'A line through the origin with a slope triangle at its end. Shrink the run towards zero while the rise stays the same. The line gets steeper and the ratio rise over run grows without limit. When the run reaches zero the line is vertical, and the ratio would need a division by zero, so there is no slope.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const vertical = state.run === 0;
    if (vertical) plot.segment(0, -R, 0, R, { color: c.a, width: 4 });
    else plot.segment(-R, (-R * state.rise) / state.run, R, (R * state.rise) / state.run, { color: c.a, width: 4 });
    poly(ctx, [plot.toPx(0, 0), plot.toPx(state.run, 0), plot.toPx(state.run, state.rise)], { fill: c.fillC, stroke: c.ink, width: 3 });
    plot.point(state.run, state.rise, { fill: c.fillY, r: 8 });
    plot.text(`run ${fixed(state.run, 1)}`, state.run / 2 + 0.2, -0.7, { size: 11, patch: false });
    plot.text(`rise ${state.rise}`, state.run + 0.4, state.rise / 2, { size: 11, align: 'left', patch: false });
  },
  controls: [
    { title: 'Squeeze the run' },
    { key: 'run', label: 'Run', min: 0, max: 5, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'rise', label: 'Rise', min: 1, max: 5, step: 1 },
    { readout: [
      ['Rise ÷ run', (s) => (s.run === 0 ? { text: 'undefined', good: false } : fixed(s.rise / s.run, 2))],
      ['Line', (s) => (s.run === 0 ? 'vertical: x = 0' : 'not vertical')],
    ] },
  ],
  tex: (s) => (s.run === 0 ? `m=\\dfrac{${s.rise}}{0}\\ \\text{is undefined}` : `m=\\dfrac{${s.rise}}{${fixed(s.run, 1)}}=${fixed(s.rise / s.run, 2)}`),
});
