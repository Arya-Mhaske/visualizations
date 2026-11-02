import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const SHAPES = { straight: ['Straight', (u) => 1 - u, (u) => -1], steep: ['Steep then flat', (u) => (1 - u) ** 2, (u) => -2 * (1 - u)], flat: ['Flat then steep', (u) => 1 - u ** 1.5, (u) => -1.5 * Math.sqrt(u)] };
const state = { h: 5, shape: 'straight', u: 0.6 };
function time(s, key) {
  const [, y, dy] = SHAPES[key];
  const L = 2 * s.h;
  const n = 4000;
  let t = 0;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const drop = s.h * (1 - y(u));
    const ds = Math.hypot(L / n, (s.h * dy(u) * L) / n / L);
    t += ds / Math.sqrt(2 * G * Math.max(drop, 1e-9));
  }
  return t;
}
const vat = (s, u) => Math.sqrt(2 * G * s.h * (1 - SHAPES[s.shape][1](u)));

createTool({
  state,
  label: 'Three slope shapes from the same height to the same bottom, with a ball on the chosen one. The speed at the bottom is the same for every shape.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [0, 1.1], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-0.05, 1.05], [-0.1, 1.15]);
    plot.axes({ xLabel: '', yLabel: '' });
    Object.entries(SHAPES).forEach(([k, [, y]], i) => plot.fn(y, { color: [c.ink, c.a, c.b][i], width: k === state.shape ? 4 : 2, dash: k === state.shape ? [] : [5, 4] }));
    plot.point(state.u, SHAPES[state.shape][1](state.u), { fill: c.c, r: 8 });
  },
  controls: [
    { title: 'Release from the top' },
    { key: 'shape', label: 'Slope shape', options: Object.entries(SHAPES).map(([k, v]) => [k, v[0]]) },
    { key: 'h', label: 'Height h (m)', min: 1, max: 20, step: 1 },
    { key: 'u', label: 'Ball position along the slope', min: 0, max: 1, step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    { readout: [
      ['Speed at the bottom √(2gh)', (s) => `${fixed(Math.sqrt(2 * G * s.h), 2)} m/s`],
      ['Speed of the ball now', (s) => `${fixed(vat(s, s.u), 2)} m/s`],
      ['Time: straight | steep | flat', (s) => ['straight', 'steep', 'flat'].map((k) => fixed(time(s, k), 2)).join(' | ') + ' s'],
    ] },
  ],
  tex: (s) => `v=\\sqrt{2gh}=\\sqrt{2\\times9.8\\times${s.h}}=${fixed(Math.sqrt(2 * G * s.h), 2)}\\ \\mathrm{m/s}`,
});
