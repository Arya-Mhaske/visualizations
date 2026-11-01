import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sci, fixed } from '../../lib/format.js';

const state = { m1: -1.5, m2: 3.5 };
// Typical apparent magnitudes, rounded.
const OBJECTS = [['Sun', -26.7], ['Full Moon', -12.7], ['Venus', -4.4], ['Sirius', -1.5], ['Polaris', 2], ['Faintest by eye', 6]];
// How many times brighter object 1 is than object 2.
const times = (s) => 10 ** (0.4 * (s.m2 - s.m1));
const nearest = (m) => { const o = OBJECTS.find(([, v]) => Math.abs(v - m) < 0.6); return o ? o[0] : 'no landmark'; };

createTool({
  state,
  label: 'A ruler of apparent magnitude, with the brightest objects on the right because brighter stars have smaller, even negative, numbers. The Sun, Moon, Venus, Sirius, Polaris and the faintest star visible to the eye are marked. Two markers you place give how many times brighter one is than the other.',
  setup: (stage, c) => createPlot(stage, { x: [-7, 28], y: [0, 1], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-7.5, 28], [-0.5, 1.4]);
    plot.segment(-7.5, 0, 28, 0, { color: c.ink, width: 4 });
    for (let m = 5; m >= -25; m -= 5) {
      plot.segment(-m, 0, -m, -0.07, { color: c.ink, width: 2 });
      plot.text(`${m}`, -m, -0.2, { size: 10, patch: false });
    }
    plot.text('magnitude m (brighter →)', 10, -0.42, { size: 10, patch: false });
    OBJECTS.forEach(([name, m], i) => {
      plot.segment(-m, 0, -m, 0.1 + (i % 3) * 0.14, { color: c.c, width: 3 });
      plot.text(name, -m, 0.22 + (i % 3) * 0.14, { size: 9, color: c.c, patch: false });
    });
    plot.shade(() => 0.06, null, -state.m1, -state.m2, c.fillY);
    plot.segment(-state.m1, 0, -state.m1, 1.0, { color: c.a, width: 3 });
    plot.segment(-state.m2, 0, -state.m2, 1.0, { color: c.b, width: 3 });
    plot.point(-state.m1, 1.0, { fill: c.a, r: 8 });
    plot.point(-state.m2, 1.0, { fill: c.b, r: 8 });
  },
  controls: [
    { title: 'Compare two stars' },
    { key: 'm1', label: 'Coral object, m', min: -27, max: 7, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'm2', label: 'Blue object, m', min: -27, max: 7, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Coral is near', (s) => nearest(s.m1)],
      ['Blue is near', (s) => nearest(s.m2)],
      ['Coral is brighter by', (s) => `×${sci(times(s), 3)}`],
      ['5 magnitudes is', () => '×100'],
    ] },
  ],
  tex: (s) => `\\dfrac{b_{\\text{coral}}}{b_{\\text{blue}}}=100^{(m_2-m_1)/5}=100^{${fixed(s.m2 - s.m1, 1)}/5}=${fixed(times(s), 3)}`,
});
