import { createTool } from '../../lib/tool.js';
import { line, arrow, poly, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { FLUIDS, plateSpeed } from './_viscosity-math.js';

const state = { fluid: 'honey', F: 0.5, d: 4, A: 200 };
const speed = (s, key) => plateSpeed(s.F, s.d / 1000, FLUIDS[key][1], s.A / 10000);
// Arrow length on a log scale, so water and honey both fit: 0.1 mm/s .. 10 m/s.
const lenOf = (v) => Math.min(1, Math.max(0.04, (Math.log10(v) + 4) / 5));

function block(ctx, stage, c, y, h, key) {
  const v = speed(state, key);
  const [x0, x1] = [stage.w * 0.08, stage.w * 0.62];
  const [top, bottom] = [y + 16, y + h - 8];
  const gap = bottom - top - 8;
  poly(ctx, [[x0, top], [x1, top], [x1, bottom], [x0, bottom]], { fill: c.fillB, stroke: c.ink });
  poly(ctx, [[x0 - 6, bottom], [x1 + 6, bottom], [x1 + 6, bottom + 8], [x0 - 6, bottom + 8]], { fill: c.ink, stroke: c.ink, width: 1 });
  poly(ctx, [[x0 - 6, top - 10], [x1 + 6, top - 10], [x1 + 6, top], [x0 - 6, top]], { fill: c.a, stroke: c.ink });
  const maxLen = stage.w * 0.3;
  const total = lenOf(v) * maxLen;
  const n = 5;
  for (let i = 0; i <= n; i++) {
    const yy = top + (gap * i) / n + 4;
    const f = 1 - i / n;
    if (f > 0) arrow(ctx, x0 + 10, yy, x0 + 10 + total * f, yy, { color: c.ink, width: 2, head: 6 });
    line(ctx, x0, yy, x1, yy, { color: c.grid, width: 1 });
  }
  label(ctx, FLUIDS[key][0], stage.w * 0.82, y + h * 0.35, c, { size: 12, bounds: stage, patch: false });
  label(ctx, `v = ${sig(v, 2)} m/s`, stage.w * 0.82, y + h * 0.35 + 18, c, { size: 12, bounds: stage, patch: false });
}

createTool({
  state,
  label: 'Two layers of fluid between a fixed plate and a moving plate. The arrows in each layer show its speed, which grows from zero at the fixed plate to the full speed at the moving plate. The chosen fluid is above and water is below for comparison.',
  draw(ctx, stage, c) {
    const half = stage.h / 2;
    block(ctx, stage, c, 0, half, state.fluid);
    block(ctx, stage, c, half, half, 'water');
  },
  controls: [
    { title: 'Same push, different fluid' },
    { key: 'fluid', label: 'Fluid', options: [['honey', 'Honey'], ['glycerine', 'Glycerine'], ['oil', 'Oil']] },
    { key: 'F', label: 'Force F (N)', min: 0.1, max: 2, step: 0.1 },
    { key: 'd', label: 'Gap d (mm)', min: 1, max: 10, step: 1 },
    { key: 'A', label: 'Plate area A (cm²)', min: 50, max: 500, step: 50 },
    { readout: [
      ['η (Pa·s)', (s) => String(FLUIDS[s.fluid][1])],
      ['Plate speed', (s) => `${sig(speed(s, s.fluid), 2)} m/s`],
      ['Water, same push', (s) => `${sig(speed(s, 'water'), 2)} m/s`],
      ['Water is faster by', (s) => `×${sig(speed(s, 'water') / speed(s, s.fluid), 2)}`],
    ] },
  ],
  tex: (s) => `\\dfrac{F}{A}=\\eta\\dfrac{v}{d}\\ \\Rightarrow\\ v=\\dfrac{Fd}{\\eta A}=${sig(speed(s, s.fluid), 2)}\\ \\mathrm{m/s}`,
});
