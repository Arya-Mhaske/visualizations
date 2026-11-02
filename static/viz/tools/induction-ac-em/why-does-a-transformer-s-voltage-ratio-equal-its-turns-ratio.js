import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// The same changing flux Φ(t) threads every turn of both coils, so each turn has the same emf −dΦ/dt: e per turn.
// Primary: V_p = N_p e. Secondary: V_s = N_s e. So V_s/V_p = N_s/N_p.
const state = { Np: 100, Ns: 40, Vp: 230 };
const per = (s) => s.Vp / s.Np;

const tool = createTool({
  state,
  label: 'Top: an iron core drawn as a rectangle with a primary coil on the left and a secondary coil on the right. A dashed loop through the core shows the shared flux. Each coil’s turns are drawn as short bars. Bottom: a graph of the two voltages over one cycle, the secondary the same shape as the primary but taller or shorter by the turns ratio.',
  setup: (stage, c) => createPlot(stage, { x: [0, 2 * Math.PI], y: [-1.2, 1.2], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const x0 = stage.w * 0.2;
    const x1 = stage.w * 0.8;
    const y0 = stage.h * 0.06;
    const y1 = stage.h * 0.42;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 8;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = c.b;
    ctx.lineWidth = 3;
    ctx.strokeRect(x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16);
    ctx.setLineDash([]);
    const turns = (x, n, colour) => {
      const shown = Math.min(Math.max(2, Math.round(n / 8)), 16);
      for (let k = 0; k < shown; k++) {
        const y = y0 + 14 + ((y1 - y0 - 28) * k) / Math.max(shown - 1, 1);
        line(ctx, x - 14, y, x + 14, y, { color: colour, width: 3 });
      }
    };
    turns(x0, state.Np, state.Np >= state.Ns ? c.a : c.c);
    turns(x1, state.Ns, c.c);
    label(ctx, `N_p = ${state.Np}`, x0, y1 + 14, c, { size: 10, bounds: stage, patch: false });
    label(ctx, `N_s = ${state.Ns}`, x1, y1 + 14, c, { size: 10, bounds: stage, patch: false });
    label(ctx, `${fixed(per(state), 2)} V per turn, both sides`, stage.w / 2, (y0 + y1) / 2, c, { size: 11, bounds: stage });
    plot.setRange([0, 2 * Math.PI], [-1.2, 1.2]);
    plot.axes({ xLabel: 'ωt', yLabel: 'V ÷ V_p' });
    plot.fn(Math.sin, { color: c.a });
    plot.fn((x) => (state.Ns / state.Np) * Math.sin(x), { color: c.c });
  },
  controls: () => [
    { title: 'Wind the coils' },
    { key: 'Np', label: 'Primary turns N_p', min: 20, max: 400, step: 10 },
    { key: 'Ns', label: 'Secondary turns N_s', min: 10, max: 400, step: 10 },
    { key: 'Vp', label: 'Primary voltage', min: 50, max: 400, step: 10, format: (v) => `${v} V` },
    { readout: [
      ['Volts per turn', (s) => `${fixed(per(s), 3)} V`],
      ['Secondary voltage', (s) => `${fixed(per(s) * s.Ns, 1)} V`],
      ['V_s ÷ V_p', (s) => fixed(s.Ns / s.Np, 3)],
      ['Type', (s) => (s.Ns > s.Np ? 'step-up' : s.Ns < s.Np ? 'step-down' : 'one to one')],
    ] },
  ],
  tex: (s) => `\\dfrac{V_s}{V_p}=\\dfrac{N_s\\,(d\\Phi/dt)}{N_p\\,(d\\Phi/dt)}=\\dfrac{N_s}{N_p}=\\dfrac{${s.Ns}}{${s.Np}}`,
});

tool.update();
