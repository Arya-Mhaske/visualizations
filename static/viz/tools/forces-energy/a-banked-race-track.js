import { createTool } from '../../lib/tool.js';
import { vec, G } from '../../lib/quick.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { R: 300, th: 15 };
const rad = (d) => (d * Math.PI) / 180;
const v0 = (s) => Math.sqrt(s.R * G * Math.tan(rad(s.th)));

createTool({
  state,
  label: 'A banked road seen end-on with a car. The normal force leans inwards: its horizontal part supplies the turn and its vertical part balances the weight.',
  draw(ctx, stage, c) {
    const t = rad(state.th);
    const [cx, cy] = [stage.w * 0.5, stage.h * 0.6];
    poly(ctx, [[cx - 140, cy + 70 * Math.sin(t) * 1.6], [cx + 140, cy - 70 * Math.sin(t) * 1.6], [cx + 140, cy + 80], [cx - 140, cy + 80]], { fill: c.fillB, stroke: c.ink });
    vec(ctx, c, cx, cy - 8, 0, 70, { color: c.a, text: 'W' });
    vec(ctx, c, cx, cy - 8, Math.sin(t) * 120, -Math.cos(t) * 120, { color: c.c, text: 'N' });
    vec(ctx, c, cx, cy - 8, Math.sin(t) * 120, 0, { color: c.b, text: 'inward' });
  },
  controls: [
    { title: 'The track' },
    { key: 'R', label: 'Radius R (m)', min: 50, max: 500, step: 10 },
    { key: 'th', label: 'Bank angle θ (°)', min: 5, max: 40, step: 1 },
    { readout: [
      ['Optimum speed', (s) => `${fixed(v0(s), 1)} m/s`],
      ['In km/h', (s) => `${fixed(v0(s) * 3.6, 0)} km/h`],
    ] },
  ],
  tex: (s) => `v_0=\\sqrt{Rg\\tan\\theta}=\\sqrt{${s.R}\\times9.8\\times\\tan${s.th}^\\circ}=${fixed(v0(s), 1)}\\ \\mathrm{m/s}`,
});
