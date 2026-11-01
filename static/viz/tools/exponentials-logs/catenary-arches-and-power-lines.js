import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { catenaryA } from './_exp-log-math.js';

const state = { mode: 'cable', span: 100, h: 8, stretch: false };
const a = (s) => catenaryA(s.span / 2, s.h);
const cat = (s, x) => a(s) * (Math.cosh(x / a(s)) - 1);
const y = (s, x) => (s.mode === 'cable' ? cat(s, x) : s.h - cat(s, x));
const length = (s) => 2 * a(s) * Math.sinh(s.span / 2 / a(s));
const parabolaLength = (s) => s.span + (8 * s.h * s.h) / (3 * s.span);

createTool({
  state,
  label: 'A catenary fitted to a power line sagging between two poles, or flipped over to make an arch. You set the span and the sag or rise in metres. The shape number, the true length of cable and the length from the common parabola shortcut are read out. An option stretches the height so a shallow sag can be seen.',
  setup: (stage, c) => createPlot(stage, { x: [-60, 60], y: [-10, 110], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const { span, h } = state;
    const half = span / 2;
    if (state.stretch) {
      plot.setRange([-half * 1.2, half * 1.2], [-h * 0.2, h * 1.3]);
    } else {
      const size = Math.max(span * 1.2, h * 1.3);
      plot.setRange([-size / 2, size / 2], [h / 2 - size / 2, h / 2 + size / 2]);
    }
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)', grid: true });
    plot.fn((x) => y(state, x), { color: c.a, width: 5, domain: [-half, half] });
    if (state.mode === 'cable') {
      plot.point(-half, h, { fill: c.ink, r: 7 });
      plot.point(half, h, { fill: c.ink, r: 7 });
    } else {
      plot.point(-half, 0, { fill: c.ink, r: 7 });
      plot.point(half, 0, { fill: c.ink, r: 7 });
      plot.point(0, h, { fill: c.fillY, r: 7 });
    }
  },
  controls: [
    { title: 'Fit the curve' },
    { key: 'mode', label: 'Shape', options: [['cable', 'Hanging cable'], ['arch', 'Arch (flipped)']] },
    { key: 'span', label: 'Span', min: 20, max: 400, step: 10, format: (v) => `${v} m` },
    { key: 'h', label: 'Sag or rise', min: 1, max: 200, step: 1, format: (v) => `${v} m` },
    { key: 'stretch', label: 'Stretch the height', toggle: true },
    { readout: [
      ['Shape number a', (s) => `${fixed(a(s), 1)} m`],
      ['True length', (s) => `${fixed(length(s), 2)} m`],
      ['Extra over the span', (s) => `${fixed(length(s) - s.span, 2)} m`],
      ['Parabola shortcut', (s) => `${fixed(parabolaLength(s), 2)} m`],
    ] },
  ],
  tex: (s) => `y=a\\left(\\cosh\\dfrac{x}{a}-1\\right),\\ \\ a=${fixed(a(s), 1)}\\text{ m},\\ \\ s=2a\\sinh\\dfrac{L}{a}=${fixed(length(s), 2)}\\text{ m}`,
});
