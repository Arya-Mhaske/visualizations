import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { carnotEta } from './_engines.js';
import { fixed } from '../../lib/format.js';

// Typical figures, rounded and illustrative: hot-side temperature of the working fluid in K and the real efficiency.
const MACHINES = [
  { name: 'Petrol car', Th: 1200, real: 0.25 },
  { name: 'Diesel truck', Th: 1500, real: 0.35 },
  { name: 'Coal station', Th: 800, real: 0.38 },
  { name: 'Gas + steam', Th: 1700, real: 0.58 },
  { name: 'Nuclear', Th: 600, real: 0.33 },
];
const state = { pick: 0, Tc: 300 };

createTool({
  state,
  label: 'Bars for five machines. For each, a wide outline shows the Carnot limit set by its hot and cold temperatures, and a filled bar shows the typical real efficiency. Every real bar is shorter than its limit.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [x0, x1] = [W * 0.3, W * 0.96];
    const px = (e) => x0 + e * (x1 - x0);
    const rowH = H / (MACHINES.length + 0.5);
    MACHINES.forEach((m, i) => {
      const y = rowH * (i + 0.6);
      const lim = carnotEta(m.Th, state.Tc);
      const on = i === state.pick;
      ctx.fillStyle = on ? c.fillA : c.fillY;
      ctx.fillRect(x0, y - 11, (x1 - x0) * m.real, 22);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = on ? 4 : 2;
      ctx.strokeRect(x0, y - 11, (x1 - x0) * lim, 22);
      label(ctx, m.name, 6, y, c, { size: 11, align: 'left', bounds: stage, patch: false });
      label(ctx, `${Math.round(m.real * 100)}%`, px(m.real) - 4, y, c, { size: 11, align: 'right', bounds: stage, patch: false });
      label(ctx, `${Math.round(lim * 100)}%`, px(lim) + 4, y, c, { size: 11, align: 'left', bounds: stage, patch: false });
    });
    line(ctx, x0, 0, x0, H, { color: c.ink, width: 2 });
  },
  controls: [
    { title: 'Compare machines' },
    { key: 'pick', label: 'Machine', options: MACHINES.map((m, i) => [i, m.name.split(' ')[0]]) },
    { key: 'Tc', label: 'Cold side temperature (K)', min: 270, max: 330, step: 10 },
    { readout: [
      ['Hot side', (s) => `${MACHINES[s.pick].Th} K`],
      ['Carnot limit', (s) => `${fixed(carnotEta(MACHINES[s.pick].Th, s.Tc) * 100, 1)} %`],
      ['Typical real', (s) => `${fixed(MACHINES[s.pick].real * 100, 0)} %`],
      ['Real ÷ limit', (s) => `${fixed((MACHINES[s.pick].real / carnotEta(MACHINES[s.pick].Th, s.Tc)) * 100, 0)} %`],
      ['Waste per 1 kWh of work', (s) => `${fixed((1 / MACHINES[s.pick].real - 1), 1)} kWh`],
    ] },
  ],
  tex: (s) => `\\eta_{max}=1-\\dfrac{T_c}{T_h}=1-\\dfrac{${s.Tc}}{${MACHINES[s.pick].Th}}=${fixed(carnotEta(MACHINES[s.pick].Th, s.Tc), 3)}`,
});
