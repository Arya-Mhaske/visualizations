import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { BULB_PHASES, averaged, contrast, twoWave } from './_interference-math.js';

const state = { mode: 'bulbs', n: 8 };
const coherent = (s) => s.mode === 'slits';
const LIM = 3; // screen window, in wavelengths of path difference
const darkest = (s) => Math.min(...Array.from({ length: 121 }, (_, i) => averaged(-LIM + (i * 2 * LIM) / 120, 1, s.n, coherent(s))));

const tool = createTool({
  state,
  label: 'A graph of brightness across a screen against path difference in wavelengths. Thin blue curves are snapshots of two sources, each a cosine fringe pattern. For two bulbs each snapshot has a different phase, so the curves shift, and the thick coral average flattens as more snapshots are added. For two slits fed by one source every snapshot is identical, so the fringes stay sharp.',
  setup: (stage, c) => createPlot(stage, { x: [-LIM, LIM], y: [0, 4.4], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'Δ ÷ λ', yLabel: 'brightness' });
    for (let k = 0; k < state.n; k++) plot.fn((x) => twoWave(x, 1, coherent(state) ? 0 : BULB_PHASES[k]), { color: c.b });
    plot.fn((x) => averaged(x, 1, state.n, coherent(state)), { color: c.a });
    plot.segment(-LIM, 2, LIM, 2, { color: c.ink, width: 2, dash: [6, 4] });
    plot.text('average', LIM * 0.72, 4.15, { size: 11 });
  },
  controls: () => [
    { title: 'What lights the screen?' },
    { key: 'mode', label: 'Sources', options: [['bulbs', 'Two bulbs'], ['slits', 'Two slits, one source']] },
    { key: 'n', label: 'Snapshots averaged', min: 1, max: 12, step: 1 },
    { readout: [
      ['Fringe contrast', (s) => ({ text: fixed(contrast(s.n, coherent(s)), 2), good: contrast(s.n, coherent(s)) > 0.5 })],
      ['Darkest point', (s) => fixed(darkest(s), 2)],
    ] },
  ],
  tex: (s) => `\\dfrac{I_{\\max}-I_{\\min}}{I_{\\max}+I_{\\min}}=${fixed(contrast(s.n, coherent(s)), 2)}`,
});

tool.update();
