import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, dot, label } from '../../lib/draw.js';

// Flash: C charged to V, dumped through a lamp of resistance R. Touchscreen: a finger adds capacitance near it on a 7 × 5 grid.
const state = { view: 'flash', C: 100, V: 300, R: 10, fx: 3, fy: 2 };
const U = (s) => 0.5 * s.C * 1e-6 * s.V * s.V;
const tau = (s) => s.R * s.C * 1e-6;
const dC = (s, i, j) => 1.2 * Math.exp(-((i - s.fx) ** 2 + (j - s.fy) ** 2) / 1.2);

const tool = createTool({
  state,
  label: 'Flash view: the voltage on a flash capacitor falls exponentially as it dumps its stored energy through the lamp in about a millisecond. Touchscreen view: a grid of sensing points where a fingertip adds extra capacitance, strongest right under the finger, so the screen can tell where it is.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 5], y: [0, 450], box: () => ({ x: 0, y: 0, w: stage.w, h: stage.h }) }),
  draw(ctx, stage, c, plot) {
    if (state.view === 'flash') {
      plot.setRange([0, 5 * tau(state) * 1e3], [0, 450]);
      plot.axes({ xLabel: 't (ms)', yLabel: 'V' });
      plot.fn((t) => state.V * Math.exp(-t / (tau(state) * 1e3)), { color: c.a });
      plot.fn(() => state.V * 0.37, { color: c.grid, width: 1.5, dash: [5, 4] });
      plot.point(tau(state) * 1e3, state.V * Math.exp(-1), { fill: c.b });
      plot.text('τ = RC', tau(state) * 1e3, state.V * 0.37 + 28, { size: 11, patch: false });
    } else {
      const [W, H] = [stage.w, stage.h];
      const [cw, ch] = [W / 8, H / 6];
      for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) {
        const x = (i + 1) * cw;
        const y = (j + 0.8) * ch;
        const v = dC(state, i, j);
        ctx.globalAlpha = 0.15 + 0.85 * (v / 1.2);
        dot(ctx, x, y, 8 + 12 * (v / 1.2), c.a, c.ink, 1.5);
        ctx.globalAlpha = 1;
      }
      dot(ctx, (state.fx + 1) * cw, (state.fy + 0.8) * ch, 6, c.ink, c.ink, 1);
      label(ctx, 'finger', (state.fx + 1) * cw, (state.fy + 0.8) * ch - 18, c, { size: 11, bounds: stage, patch: false });
    }
  },
  controls: [
    { title: 'Flash or touchscreen' },
    { key: 'view', label: 'View', options: [['flash', 'Flash'], ['touch', 'Touchscreen']] },
    { key: 'C', label: 'Flash capacitor (µF)', min: 100, max: 1000, step: 100 },
    { key: 'V', label: 'Charged to (V)', min: 200, max: 400, step: 50 },
    { key: 'R', label: 'Lamp resistance (Ω)', min: 1, max: 10, step: 1 },
    { key: 'fx', label: 'Finger column', min: 0, max: 6, step: 1 },
    { key: 'fy', label: 'Finger row', min: 0, max: 4, step: 1 },
    { readout: [
      ['Energy stored ½CV²', (s) => (s.view === 'flash' ? `${U(s).toFixed(2)} J` : '—')],
      ['Time constant RC', (s) => (s.view === 'flash' ? `${(tau(s) * 1e3).toFixed(2)} ms` : '—')],
      ['Peak power V²/R', (s) => (s.view === 'flash' ? `${((s.V * s.V) / s.R / 1e3).toFixed(1)} kW` : '—')],
      ['Strongest signal at', (s) => (s.view === 'touch' ? `column ${s.fx + 1}, row ${s.fy + 1}` : '—')],
    ] },
  ],
  onChange: () => hide(),
  tex: (s) => (s.view === 'flash' ? `U=\\tfrac12CV^{2}=${U(s).toFixed(2)}\\ \\mathrm{J},\\quad \\tau=RC=${(tau(s) * 1e3).toFixed(2)}\\ \\mathrm{ms}` : `C_{finger}>C_0\\ \\Rightarrow\\ \\text{position}=\\text{largest change}`),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
function hide() {
  fields.forEach((f, i) => { if (i >= 1 && i <= 3) f.hidden = state.view !== 'flash'; if (i >= 4) f.hidden = state.view !== 'touch'; });
}
hide();
void tool;
