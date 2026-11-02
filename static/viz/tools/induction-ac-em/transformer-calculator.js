import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// Ideal when η = 100%: V_s/V_p = N_s/N_p, I_s/I_p = N_p/N_s, P_out = η P_in.
const state = { Np: 1000, Ns: 100, Vp: 230, Rl: 10, eta: 100 };
const Vs = (s) => (s.Vp * s.Ns) / s.Np;
const Is = (s) => Vs(s) / s.Rl;
const Pout = (s) => Vs(s) * Is(s);
const Pin = (s) => Pout(s) / (s.eta / 100);
const Ip = (s) => Pin(s) / s.Vp;

const tool = createTool({
  state,
  label: 'Four bars comparing the primary and the secondary side. One pair shows the voltages and the other pair the currents. Where the voltage bar is shorter on the secondary the current bar is taller, so the power stays nearly the same on both sides.',
  draw(ctx, stage, c) {
    const rows = [
      ['Voltage', state.Vp, Vs(state), 'V'],
      ['Current', Ip(state), Is(state), 'A'],
      ['Power', Pin(state), Pout(state), 'W'],
    ];
    const rh = stage.h / rows.length;
    rows.forEach(([name, a, b, u], i) => {
      const mx = Math.max(a, b, 1e-9);
      const wmax = stage.w - 150;
      [[a, 'primary', c.fillA, 0], [b, 'secondary', c.fillC, 1]].forEach(([v, side, fill, k]) => {
        const y = rh * i + 14 + k * (rh / 2 - 6);
        ctx.fillStyle = fill;
        ctx.fillRect(100, y, (wmax * v) / mx, rh / 2 - 14);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 3;
        ctx.strokeRect(100, y, (wmax * v) / mx, rh / 2 - 14);
        label(ctx, `${sig(v, 3)} ${u}`, 106 + (wmax * v) / mx, y + (rh / 2 - 14) / 2, c, { size: 10, align: 'left', bounds: stage, patch: false });
      });
      label(ctx, name, 10, rh * i + rh / 2 - 6, c, { size: 11, align: 'left', patch: false });
    });
  },
  controls: () => [
    { title: 'Step it up or down' },
    { key: 'Np', label: 'Primary turns', min: 100, max: 2000, step: 100 },
    { key: 'Ns', label: 'Secondary turns', min: 50, max: 4000, step: 50 },
    { key: 'Vp', label: 'Input voltage', min: 12, max: 400, step: 1, format: (v) => `${v} V` },
    { key: 'Rl', label: 'Load resistance', min: 1, max: 100, step: 1, format: (v) => `${v} Ω` },
    { key: 'eta', label: 'Efficiency', min: 80, max: 100, step: 1, format: (v) => `${v}%` },
    { readout: [
      ['Secondary V_s', (s) => `${fixed(Vs(s), 2)} V`],
      ['Secondary I_s', (s) => `${fixed(Is(s), 3)} A`],
      ['Primary I_p', (s) => `${fixed(Ip(s), 3)} A`],
      ['Power out / in', (s) => `${fixed(Pout(s), 1)} W / ${fixed(Pin(s), 1)} W`],
    ] },
  ],
  tex: (s) => `\\dfrac{V_s}{V_p}=\\dfrac{N_s}{N_p}=\\dfrac{I_p}{I_s}\\ (\\eta=1):\\ ${fixed(Vs(s), 1)}\\ \\text{V},\\ ${fixed(Is(s), 2)}\\ \\text{A}`,
});

tool.update();
