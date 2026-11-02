import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FUNS, roots, num } from './_da.js';

// Closed-interval method: candidates are the critical points inside [a, b] and the two endpoints. The biggest and smallest f among them win.
const state = { fn: 'quartic', a: -3, b: 1.5 };
const K = () => FUNS[state.fn];
const cands = () => {
  const [a, b] = [Math.min(state.a, state.b), Math.max(state.a, state.b)];
  const inside = roots(K().d, a, b).filter((r) => r > a + 1e-9 && r < b - 1e-9).map((x) => ({ x, kind: 'critical' }));
  return [{ x: a, kind: 'endpoint' }, ...inside, { x: b, kind: 'endpoint' }].map((p) => ({ ...p, y: K().f(p.x) }));
};
const win = () => { const c = cands(); return { hi: c.reduce((m, p) => (p.y > m.y ? p : m)), lo: c.reduce((m, p) => (p.y < m.y ? p : m)) }; };

createTool({
  state,
  label: 'A graph with an interval marked. Purple dots are critical points inside it, black dots are the endpoints. The highest candidate is ringed in coral and the lowest in blue.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-3, 3], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    plot.setRange(k.x, k.y);
    plot.axes({ xLabel: 'x', yLabel: 'f' });
    const [a, b] = [Math.min(state.a, state.b), Math.max(state.a, state.b)];
    plot.shade(() => k.y[1], () => k.y[0], a, b, c.fillC);
    plot.fn(k.f, { color: c.ink, width: 3 });
    const w = win();
    plot.segment(a, k.y[0], a, k.y[1], { color: c.c, width: 2 });
    plot.segment(b, k.y[0], b, k.y[1], { color: c.c, width: 2 });
    for (const p of cands()) plot.point(p.x, p.y, { fill: p.kind === 'critical' ? c.d : c.ink, r: p.x === w.hi.x || p.x === w.lo.x ? 9 : 5 });
    plot.point(w.hi.x, w.hi.y, { fill: c.a, r: 6 });
    plot.point(w.lo.x, w.lo.y, { fill: c.b, r: 6 });
  },
  controls: [
    { title: 'Choose the interval' },
    { key: 'fn', label: 'Function', options: Object.entries(FUNS).filter(([k]) => k !== 'hill').map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'Left end a', min: -3, max: 3, step: 0.25, format: (v) => v.toFixed(2).replace('-', '−') },
    { key: 'b', label: 'Right end b', min: -3, max: 3, step: 0.25, format: (v) => v.toFixed(2).replace('-', '−') },
    { readout: [
      ['Candidates (x → f)', () => cands().map((p) => `${num(p.x, 2)}→${num(p.y, 2)}`).join('  ')],
      ['Absolute maximum', () => ({ text: `${num(win().hi.y, 4)} at x = ${num(win().hi.x, 3)} (${win().hi.kind})`, good: true })],
      ['Absolute minimum', () => ({ text: `${num(win().lo.y, 4)} at x = ${num(win().lo.x, 3)} (${win().lo.kind})`, good: true })],
    ] },
  ],
  tex: () => '\\text{solve } f\'(x)=0 \\text{ in } [a,b];\\ \\text{compare } f \\text{ at those } x \\text{ and at } a, b',
});
