import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { th: 30, p: 100, A: 1 };

createTool({
  state,
  label: 'A small plate in a fluid that can be turned. Arrows from both sides show the push of the fluid, always at right angles to the plate. The direction turns with the plate but the pressure does not change.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const t = (state.th * Math.PI) / 180;
    const [px, py] = [Math.cos(t), -Math.sin(t)];
    line(ctx, cx - 50 * px, cy - 50 * py, cx + 50 * px, cy + 50 * py, { color: c.ink, width: 6 });
    const f = state.p * state.A * 0.4;
    vec(ctx, c, cx + 70 * -py, cy + 70 * px, py * f, -px * f, { color: c.a, text: 'F' });
    vec(ctx, c, cx - 70 * -py, cy - 70 * px, -py * f, px * f, { color: c.a });
    label(ctx, `p = ${state.p} kPa  (same at every angle)`, stage.w / 2, 20, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Turn the plate' },
    { key: 'th', label: 'Angle of the plate (°)', min: 0, max: 180, step: 5 },
    { key: 'p', label: 'Pressure (kPa)', min: 10, max: 200, step: 10 },
    { key: 'A', label: 'Area (cm²)', min: 0.5, max: 5, step: 0.5 },
    { readout: [['Force F = pA', (s) => `${fixed(s.p * 1000 * s.A * 1e-4, 2)} N`], ['Direction of F', (s) => `${(s.th + 90) % 360}° (perpendicular to the plate)`]] },
  ],
  tex: (s) => `\\vec F=p\\,\\vec A,\\quad p=${s.p}\\ \\mathrm{kPa}`,
});
