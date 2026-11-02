import { createTool } from '../../lib/tool.js';
import { box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { P: 8, I: 200, eta: 20 };
const area = (s) => (s.P * 1000) / (s.I * (s.eta / 100));

createTool({
  state,
  label: 'A square sized by the roof area needed. A bigger demand or lower efficiency makes it larger.',
  draw(ctx, stage, c) {
    const side = Math.sqrt(area(state));
    const k = Math.min(stage.w * 0.7, stage.h * 0.6) / Math.sqrt(1000);
    const s = side * k;
    box(ctx, c, (stage.w - s) / 2, (stage.h - s) / 2 - 10, s, s, c.fillA);
    label(ctx, `${fixed(area(state), 0)} m²`, stage.w / 2, stage.h / 2 - 10, c, { size: 16, patch: false });
    label(ctx, `${fixed(state.I * (state.eta / 100), 0)} W of electricity per m²`, stage.w / 2, stage.h - 16, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Size the panels' },
    { key: 'P', label: 'Demand (kW)', min: 1, max: 15, step: 1 },
    { key: 'I', label: 'Sunshine (W/m²)', min: 100, max: 400, step: 10 },
    { key: 'eta', label: 'Efficiency (%)', min: 10, max: 30, step: 1 },
    { readout: [
      ['Power per m²', (s) => `${fixed(s.I * (s.eta / 100), 1)} W`],
      ['Roof area needed', (s) => `${fixed(area(s), 0)} m²`],
    ] },
  ],
  tex: (s) => `A=\\dfrac{P}{I\\eta}=\\dfrac{${s.P * 1000}}{${s.I}\\times${s.eta / 100}}=${fixed(area(s), 0)}\\ \\mathrm{m^2}`,
});
