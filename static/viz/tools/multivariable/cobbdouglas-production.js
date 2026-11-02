import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Cobb–Douglas output P = b L^α K^(1−α). Holding capital K fixed, ∂P/∂L = αP/L is the extra output from one more unit of labour.
const state = { L: 100, K: 60, alpha: 0.75 };
const B = 1.01;
export const P = (L, K, a) => B * L ** a * K ** (1 - a);
export const dPdL = (L, K, a) => (a * P(L, K, a)) / L;
export const dPdK = (L, K, a) => ((1 - a) * P(L, K, a)) / K;

createTool({
  state,
  label: 'Output plotted against labour with capital held fixed (coral) and against capital with labour held fixed (blue). Straight segments show the slope at the chosen point: the extra output from one more unit of each input.',
  setup: (stage, c) => createPlot(stage, { x: [0, 250], y: [0, 260], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'input', yLabel: 'output P' });
    plot.fn((L) => P(Math.max(L, 0.01), state.K, state.alpha), { color: c.a, domain: [0.5, 250] });
    plot.fn((K) => P(state.L, Math.max(K, 0.01), state.alpha), { color: c.b, domain: [0.5, 250] });
    const out = P(state.L, state.K, state.alpha);
    const tl = dPdL(state.L, state.K, state.alpha);
    const tk = dPdK(state.L, state.K, state.alpha);
    plot.segment(state.L - 50, out - 50 * tl, state.L + 50, out + 50 * tl, { color: c.a, width: 2 });
    plot.segment(state.K - 50, out - 50 * tk, state.K + 50, out + 50 * tk, { color: c.b, width: 2 });
    plot.point(state.L, out, { fill: c.a });
    plot.point(state.K, out, { fill: c.b });
  },
  controls: [
    { title: 'Labour and capital' },
    { key: 'L', label: 'Labour, L', min: 20, max: 230, step: 5 },
    { key: 'K', label: 'Capital, K', min: 20, max: 230, step: 5 },
    { key: 'alpha', label: 'Labour share, α', min: 0.2, max: 0.9, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Output P', (s) => P(s.L, s.K, s.alpha).toFixed(1)],
      ['∂P/∂L (one more worker)', (s) => dPdL(s.L, s.K, s.alpha).toFixed(3)],
      ['∂P/∂K (one more unit of capital)', (s) => dPdK(s.L, s.K, s.alpha).toFixed(3)],
    ] },
  ],
  tex: (s) => `P=1.01\\,L^{${Number(s.alpha).toFixed(2)}}K^{${(1 - s.alpha).toFixed(2)}},\\quad L\\,P_L+K\\,P_K=P`,
});
