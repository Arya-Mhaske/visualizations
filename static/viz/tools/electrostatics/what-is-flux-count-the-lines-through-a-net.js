import { createTool } from '../../lib/tool.js';
import { arrow, line, label } from '../../lib/draw.js';

// Uniform field to the right. A flat net of area A, with its normal at angle θ from the field. Flux = E A cos θ.
const state = { th: 0, E: 200, A: 1 };
const flux = (s) => s.E * s.A * Math.cos((s.th * Math.PI) / 180);
const LINES = 13;

createTool({
  state,
  label: 'Thirteen parallel field lines run left to right. A flat net, drawn edge-on, can be tilted. The lines that pass through the net are coloured. Face-on, the net catches the most lines. Edge-on it catches none. Past a right angle, the lines pass through the other face and the flux changes sign.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [cx, cy] = [W * 0.5, H * 0.5];
    const th = (state.th * Math.PI) / 180;
    const half = H * 0.3 * Math.sqrt(state.A);
    const gap = (H * 0.84) / (LINES - 1);
    const dy = half * Math.cos(th);
    for (let i = 0; i < LINES; i++) {
      const y = H * 0.08 + i * gap;
      const through = Math.abs(y - cy) < Math.abs(dy);
      const col = through ? (Math.cos(th) >= 0 ? c.a : c.b) : c.grid;
      arrow(ctx, W * 0.04, y, W * 0.96, y, { color: col, width: through ? 3 : 1.5, head: 9 });
    }
    const [sx, sy] = [-Math.sin(th) * half, Math.cos(th) * half];
    line(ctx, cx - sx, cy - sy, cx + sx, cy + sy, { color: c.ink, width: 7 });
    arrow(ctx, cx, cy, cx + Math.cos(th) * H * 0.18, cy + Math.sin(th) * H * 0.18, { color: c.c, width: 3, head: 9 });
    label(ctx, 'normal', cx + Math.cos(th) * H * 0.2 + 18, cy + Math.sin(th) * H * 0.2, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Tilt the net' },
    { key: 'th', label: 'Angle θ between normal and field', min: 0, max: 180, step: 10, format: (v) => `${v}°` },
    { key: 'E', label: 'Field E (N/C)', min: 100, max: 500, step: 100 },
    { key: 'A', label: 'Net area A (m²)', min: 0.5, max: 2, step: 0.5, format: (v) => v.toFixed(1) },
    { readout: [
      ['cos θ', (s) => Math.cos((s.th * Math.PI) / 180).toFixed(2)],
      ['Flux Φ', (s) => `${flux(s).toFixed(0)} N·m²/C`],
    ] },
  ],
  tex: (s) => `\\Phi=EA\\cos\\theta=${s.E}\\times ${s.A.toFixed(1)}\\times\\cos ${s.th}^\\circ=${flux(s).toFixed(0)}`,
});
