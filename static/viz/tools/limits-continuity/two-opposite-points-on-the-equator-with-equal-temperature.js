import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Temperature round the equator, angle θ in degrees. D(θ) = T(θ) − T(θ + 180°). D(θ + 180°) = −D(θ), so D changes sign: it has a root.
const PATTERNS = {
  one: [8, 0.5, 4, 2.0, 3, 4.2],
  two: [6, 1.0, 5, 0.3, 4, 3.1],
  three: [10, 2.2, 2, 1.1, 5, 0.4],
};
const state = { pat: 'one', th: 40 };
const T = (s, deg) => { const [a1, p1, a2, p2, a3, p3] = PATTERNS[s.pat]; const x = (deg * Math.PI) / 180; return 25 + a1 * Math.sin(x + p1) + a2 * Math.sin(2 * x + p2) + a3 * Math.sin(3 * x + p3); };
const D = (s, deg) => T(s, deg) - T(s, deg + 180);
function root(s) {
  let [lo, hi] = [0, 180];
  if (D(s, lo) * D(s, hi) > 0) return null;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (D(s, lo) * D(s, m) <= 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
}

const tool = createTool({
  state,
  label: 'Top: the temperature all the way round the equator, with two opposite points marked. Bottom: the difference between the temperatures at a point and the point opposite it, for starting points from 0 to 180 degrees. The difference starts as the negative of what it ends as, so the continuous curve must cross zero: somewhere two opposite points have the same temperature.',
  setup: (stage, c) => [
    createPlot(stage, { c, x: [0, 360], y: [5, 45], pad: 24, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.5 }) }),
    createPlot(stage, { c, x: [0, 180], y: [-30, 30], pad: 24, box: (st) => ({ x: 0, y: st.h * 0.5, w: st.w, h: st.h * 0.5 }) }),
  ],
  draw(ctx, stage, c, [top, bottom]) {
    top.axes({ xLabel: 'θ°', yLabel: 'T °C' });
    top.fn((x) => T(state, x), { color: c.a });
    top.segment(state.th, 5, state.th, 45, { color: c.b, width: 2, dash: [4, 4] });
    top.segment(state.th + 180, 5, state.th + 180, 45, { color: c.d, width: 2, dash: [4, 4] });
    top.point(state.th, T(state, state.th), { fill: c.b });
    top.point(state.th + 180, T(state, state.th + 180), { fill: c.d });
    bottom.axes({ xLabel: 'θ°', yLabel: 'D' });
    bottom.fn((x) => D(state, x), { color: c.ink });
    bottom.fn(() => 0, { color: c.grid, width: 1.5 });
    bottom.point(state.th, D(state, state.th), { fill: c.b });
    const r = root(state);
    if (r !== null) bottom.point(r, 0, { fill: c.c, r: 8 });
  },
  controls: [
    { title: 'Compare opposite points' },
    { key: 'th', label: 'Angle θ (°)', min: 0, max: 180, step: 5 },
    { key: 'pat', label: 'Weather pattern', options: [['one', 'A'], ['two', 'B'], ['three', 'C']] },
    { button: 'Go to equal temperatures', onClick() { const r = root(state); if (r !== null) { state.th = Math.round(r / 5) * 5; tool.update(); } } },
    { readout: [
      ['T at θ', (s) => `${T(s, s.th).toFixed(1)} °C`],
      ['T at θ + 180°', (s) => `${T(s, s.th + 180).toFixed(1)} °C`],
      ['Difference D', (s) => D(s, s.th).toFixed(2)],
      ['Equal at θ ≈', (s) => (root(s) === null ? '—' : `${root(s).toFixed(1)}°`)],
    ] },
  ],
  tex: (s) => `D(\\theta)=T(\\theta)-T(\\theta+180^\\circ),\\quad D(0)=-D(180^\\circ)\\ \\Rightarrow\\ D(\\theta^*)=0`,
});
