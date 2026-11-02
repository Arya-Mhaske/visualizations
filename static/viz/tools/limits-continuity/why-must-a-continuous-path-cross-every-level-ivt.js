import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// A climber's height (m) over 10 hours. From 1000 m to 3000 m. With a jump (a broken path) the path leaps by J at t = 5.
const state = { level: 2000, jump: false, J: 600 };
const height = (s, t) => 1000 + (2000 - (s.jump ? s.J : 0)) * (t / 10) + 300 * Math.sin((Math.PI * t) / 2.5) + (s.jump && t >= 5 ? s.J : 0);
function crossings(s) {
  const out = [];
  let skipped = false;
  const n = 4000;
  let prev = height(s, 0) - s.level;
  for (let i = 1; i <= n; i++) {
    const t = (10 * i) / n;
    const cur = height(s, t) - s.level;
    if (prev === 0) out.push((10 * (i - 1)) / n);
    else if (prev * cur < 0) {
      if (s.jump && t >= 5 && t - 10 / n < 5 + 1e-9) skipped = true;
      else {
        let [lo, hi] = [t - 10 / n, t];
        for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if ((height(s, lo) - s.level) * (height(s, m) - s.level) <= 0) hi = m; else lo = m; }
        out.push((lo + hi) / 2);
      }
    }
    prev = cur;
  }
  return { out, skipped };
}

createTool({
  state,
  label: 'The height of a hiker against time, from 1000 metres to 3000 metres. A horizontal line marks a chosen level. With an unbroken path the line must cross the graph at least once. If the path jumps, a level inside the jump is skipped and the hiker never stands at that height.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 10], y: [800, 3200] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (h)', yLabel: 'height (m)' });
    plot.fn(() => state.level, { color: c.b, width: 2, dash: [6, 5] });
    plot.fn((t) => height(state, t), { color: c.a, domain: [0, state.jump ? 4.9999 : 10] });
    if (state.jump) {
      plot.fn((t) => height(state, t), { color: c.a, domain: [5, 10] });
      plot.point(5, height(state, 4.9999), { fill: c.a, r: 5 });
      plot.point(5, height(state, 5), { fill: c.paper, r: 5 });
    }
    for (const t of crossings(state).out) plot.point(t, state.level, { fill: c.c });
  },
  controls: [
    { title: 'Hike from 1000 m to 3000 m' },
    { key: 'level', label: 'Level you ask about (m)', min: 1000, max: 3000, step: 100 },
    { key: 'jump', label: 'Break the path with a jump', toggle: true },
    { key: 'J', label: 'Size of the jump (m)', min: 200, max: 1000, step: 200 },
    { readout: [
      ['Times at that level', (s) => (crossings(s).out.length ? crossings(s).out.map((t) => `${t.toFixed(1)} h`).join(', ') : 'never')],
      ['Verdict', (s) => (crossings(s).out.length ? { text: 'crossed it', good: true } : { text: 'jumped over it', good: false })],
    ] },
  ],
  tex: () => 'f\\ \\text{continuous on}\\ [a,b],\\ f(a)<N<f(b)\\ \\Rightarrow\\ f(c)=N\\ \\text{for some}\\ c',
});
