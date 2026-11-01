import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, label } from '../../lib/draw.js';
import { fixed, sci, sig } from '../../lib/format.js';
import { LOG_T_MAX, LOG_T_MIN, junctionAt } from './_p-n-junction-diode-math.js';
import { drawStrip } from './_p-n-junction-diode-view.js';

const state = { logT: LOG_T_MAX, V: 0 };
const now = (s) => junctionAt(s.logT, s.V);
const um = (m) => m * 1e6;
const ratio = (s) => now(s).diffusion / now(s).drift;
const show = (x) => (x >= 1e4 ? sci(x, 2) : sig(x, 2));

function verdict(s) {
  const r = ratio(s);
  if (s.V > 0.005) return { text: 'diffusion wins', good: true };
  if (s.V < -0.005) return { text: 'drift wins', good: false };
  return r > 1.02 ? { text: 'layer grows', good: false } : { text: 'balanced', good: true };
}

const tool = createTool({
  state,
  label: 'Top: a strip of p-type material (left) joined to n-type (right) with the depletion layer shaded, where only the fixed ion cores are left. Middle: a coral arrow for the diffusion current and a blue arrow for the drift current. Bottom: a graph of the size of each current against time on a log scale; diffusion falls until it meets the flat drift line.',
  setup: (stage, c) => createPlot(stage, {
    x: [LOG_T_MIN, LOG_T_MAX], y: [-1, 13], c, pad: 26,
    box: (g) => ({ x: 0, y: g.h * 0.56, w: g.w, h: g.h * 0.44 }),
  }),
  draw(ctx, stage, c, plot) {
    const j = now(state);
    drawStrip(ctx, c, { x: 6, y: 6, w: stage.w - 12, h: stage.h * 0.3 }, { width: j.width, field: true });
    const mid = stage.w / 2;
    const long = 36 + 4.5 * Math.log10(Math.max(j.diffusion, 1));
    const rowA = stage.h * 0.39;
    const rowB = stage.h * 0.47;
    arrow(ctx, mid - long / 2, rowA, mid + long / 2, rowA, { color: c.a, width: 5, head: 13 });
    arrow(ctx, mid + 18, rowB, mid - 18, rowB, { color: c.b, width: 5, head: 13 });
    label(ctx, 'diffusion current (length grows with its log)', 6, rowA - 14, c, { size: 10, align: 'left', bounds: stage, patch: false });
    label(ctx, 'drift current', 6, rowB - 14, c, { size: 10, align: 'left', bounds: stage, patch: false });

    plot.axes({ xLabel: 'k, where t = 10^k', yLabel: 'log₁₀ (current ÷ drift)' });
    plot.fn((x) => Math.log10(junctionAt(x, state.V).diffusion), { color: c.a });
    plot.segment(LOG_T_MIN, 0, LOG_T_MAX, 0, { color: c.b, width: 3, dash: [7, 5] });
    plot.point(state.logT, Math.max(-1, Math.log10(j.diffusion)), { fill: c.a, r: 7 });
    plot.text('drift', LOG_T_MIN + 1.2, 0.8, { size: 11 });
    plot.text('diffusion', LOG_T_MIN + 3, 11.4, { size: 11 });
  },
  controls: () => [
    { title: 'Join the two sides' },
    { row: [
      { button: '1 Just joined', onClick() { state.logT = 0; tool.update(); } },
      { button: '2 Cores exposed', ghost: true, onClick() { state.logT = 6; tool.update(); } },
      { button: '3 Balance', ghost: true, onClick() { state.logT = LOG_T_MAX; tool.update(); } },
    ] },
    { key: 'logT', label: 'Time since joining', min: LOG_T_MIN, max: LOG_T_MAX, step: 0.25, format: (n) => `10^${fixed(n, 2)} units` },
    { text: 'The unit is arbitrary. Joining is far too quick to watch, so each step multiplies the time.' },
    { key: 'V', label: 'Battery, V (+ to p side)', min: -5, max: 0.65, step: 0.05, format: (n) => `${fixed(n, 2)} V` },
    { readout: [
      ['Barrier, V_b', (s) => `${fixed(now(s).Vb, 3)} V`],
      ['Layer width', (s) => `${fixed(um(now(s).width), 2)} μm`],
      ['Diffusion ÷ drift', (s) => show(ratio(s))],
      ['So', verdict],
    ] },
  ],
  tex: (s) => {
    const j = now(s);
    return `V_j=V_b-V=${fixed(j.Vb, 2)}-(${fixed(s.V, 2)})=${fixed(j.Vj, 2)}\\ \\text{V},\\quad W=\\sqrt{\\dfrac{2\\varepsilon V_j}{e}\\left(\\dfrac{1}{N_A}+\\dfrac{1}{N_D}\\right)}=${fixed(um(j.width), 2)}\\ \\mu\\text{m}`;
  },
});
