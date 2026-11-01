import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { rectsOn, sumOn } from './_exp-log-math.js';

const state = { view: 'area', c: 3, N: 8, a: 2, b: 3 };
const inv = (x) => 1 / x;
const lo = (s) => Math.min(1, s.c);
const hi = (s) => Math.max(1, s.c);

function outline(plot, x0, x1, h, color, width = 3) {
  plot.segment(x0, 0, x0, h, { color, width });
  plot.segment(x1, 0, x1, h, { color, width });
  plot.segment(x0, h, x1, h, { color, width });
}

const tool = createTool({
  state,
  label: 'The graph of one over x. In the area view the region under it between 1 and c is shaded, and its area is the natural logarithm of c, negative when c is less than 1. In the rectangles view upper and lower rectangles trap that area. In the product view two regions placed side by side show that ln a plus ln b equals ln of a times b.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [0, 3], c }),
  draw(ctx, stage, c, plot) {
    const right = state.view === 'product' ? Math.max(8, state.a * state.b * 1.1) : 8;
    plot.setRange([0, right], [0, 3]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    if (state.view === 'area') {
      plot.shade(inv, null, lo(state), hi(state), state.c < 1 ? c.fillB : c.fillA);
      plot.segment(state.c, 0, state.c, inv(state.c), { color: c.ink, width: 3 });
    } else if (state.view === 'sums') {
      const upper = rectsOn(lo(state), hi(state), state.N, 'upper');
      const lower = rectsOn(lo(state), hi(state), state.N, 'lower');
      for (const r of lower) plot.shade(() => r.h, null, r.x0, r.x1, c.fillA);
      for (const r of upper) outline(plot, r.x0, r.x1, r.h, c.b, 2);
      for (const r of lower) outline(plot, r.x0, r.x1, r.h, c.ink, 1);
    } else {
      plot.shade(inv, null, 1, state.a, c.fillA);
      plot.shade(inv, null, state.a, state.a * state.b, c.fillB);
      plot.segment(state.a, 0, state.a, inv(state.a), { color: c.ink, width: 3 });
      plot.segment(state.a * state.b, 0, state.a * state.b, inv(state.a * state.b), { color: c.ink, width: 3 });
    }
    plot.fn(inv, { color: c.ink, width: 4, domain: [0.12, right] });
    plot.segment(1, 0, 1, 1, { color: c.ink, width: 3 });
    if (state.view !== 'product') plot.point(state.c, 0, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Measure the area under 1/x' },
    { key: 'view', label: 'View', options: [['area', 'Area'], ['sums', 'Rectangles'], ['product', 'ln a + ln b']] },
    { key: 'c', label: 'Right end, c', min: 0.25, max: 8, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'N', label: 'Rectangles', min: 1, max: 40, step: 1 },
    { key: 'a', label: 'a', min: 1.2, max: 4, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'b', label: 'b', min: 1.2, max: 4, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['ln c, signed area', (s) => (s.view === 'product' ? '—' : fixed(Math.log(s.c), 4))],
      ['Lower sum', (s) => (s.view === 'sums' ? fixed(sumOn(lo(s), hi(s), s.N, 'lower'), 4) : '—')],
      ['Upper sum', (s) => (s.view === 'sums' ? fixed(sumOn(lo(s), hi(s), s.N, 'upper'), 4) : '—')],
      ['Blue + coral areas', (s) => (s.view === 'product' ? `${fixed(Math.log(s.a), 3)} + ${fixed(Math.log(s.b), 3)} = ${fixed(Math.log(s.a * s.b), 3)}` : '—')],
    ] },
  ],
  tex: (s) => (s.view === 'product'
    ? `\\ln a+\\ln b=${fixed(Math.log(s.a), 3)}+${fixed(Math.log(s.b), 3)}=${fixed(Math.log(s.a * s.b), 3)}=\\ln(ab)`
    : `\\ln ${fixed(s.c, 2)}=\\displaystyle\\int_1^{${fixed(s.c, 2)}}\\dfrac{dt}{t}=${fixed(Math.log(s.c), 4)}`),
  onChange: (s) => show(s),
});

const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 5) return;
  fields[1].hidden = s.view === 'product';
  fields[2].hidden = s.view !== 'sums';
  fields[3].hidden = s.view !== 'product';
  fields[4].hidden = s.view !== 'product';
}
show(state);
void tool;
