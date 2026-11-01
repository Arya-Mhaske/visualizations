import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, piFrac } from '../../lib/format.js';
import { crossing, tanAt } from './_tan-cot-math.js';

const state = { A: 1, H: 4, compare: true };
const show = (x) => piFrac(x) ?? fixed(x, 3);

createTool({
  state,
  label: 'The graph of A times tangent x between its asymptotes at minus and plus pi over 2. A horizontal line at height H tries to catch the highest point, but the curve always passes it and goes higher. A switch adds the graph of A times sine x, which has a real highest point at height A. A changes how steeply the tangent climbs, not how high it reaches.',
  setup: (stage, c) => createPlot(stage, { x: [-1.8, 1.8], y: [-8, 8], c, ticks: 'pi' }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.segment(Math.PI / 2, -8, Math.PI / 2, 8, { color: c.a, width: 2, dash: [6, 5] });
    plot.segment(-Math.PI / 2, -8, -Math.PI / 2, 8, { color: c.a, width: 2, dash: [6, 5] });
    if (state.compare) {
      plot.fn((x) => state.A * Math.sin(x), { color: c.c, width: 3, domain: [-1.8, 1.8] });
      plot.segment(-1.8, state.A, 1.8, state.A, { color: c.c, width: 1, dash: [3, 4] });
    }
    plot.fn((x) => tanAt(state.A, x), { color: c.b, width: 4, domain: [-1.55, 1.55] });
    plot.segment(-1.8, state.H, 1.8, state.H, { color: c.ink, width: 2, dash: [6, 5] });
    const x = crossing(state.A, state.H);
    plot.point(x, state.H, { fill: c.fillY, r: 7 });
    plot.point(Math.PI / 4, state.A, { fill: c.b, r: 6 });
    plot.text(`passes ${fixed(state.H, 1)} here`, Math.min(1.1, x) + 0.05, state.H + 0.9, { size: 11 });
  },
  controls: [
    { title: 'Try to catch the top' },
    { key: 'A', label: 'Stretch, A', min: 0.5, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'H', label: 'Height to catch, H', min: 1, max: 7, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'compare', label: 'Compare with A sin x', toggle: true },
    { readout: [
      ['A tan x passes H at x =', (s) => `${show(crossing(s.A, s.H))} = ${fixed(crossing(s.A, s.H), 3)}`],
      ['Highest value of A tan x', () => 'none: it passes every H'],
      ['Highest value of A sin x', (s) => fixed(s.A, 1)],
      ['A tan(π/4)', (s) => fixed(tanAt(s.A, Math.PI / 4), 2)],
    ] },
  ],
  tex: (s) => `A\\tan x=H\\ \\Rightarrow\\ x=\\tan^{-1}\\dfrac{H}{A}=\\tan^{-1}\\dfrac{${fixed(s.H, 1)}}{${fixed(s.A, 1)}}=${fixed(crossing(s.A, s.H), 3)}`,
});
