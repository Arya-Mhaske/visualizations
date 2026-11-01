import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';
import { sci, texSci, sig } from '../../lib/format.js';
import { N_SI, NI_SI, donorsFromPpm } from './_intrinsic-extrinsic-semiconductors-math.js';

const state = { k: 0 }; // ppm = 10^k
const LO = 10;
const HI = 30;
const donors = (s) => donorsFromPpm(10 ** s.k);
const swamp = (s) => donors(s) / NI_SI;

const tool = createTool({
  state,
  label: 'Three horizontal bars on a log scale from 10 to the power 10 up to 10 to the power 30, per cubic metre. Top: silicon atoms, 5 times 10 to the 28. Middle: arsenic donors you add, coral. Bottom: thermal electrons already free, 1.5 times 10 to the 16, blue. The donor bar reaches far past the thermal bar.',
  draw(ctx, stage, c) {
    const x0 = 14;
    const x1 = stage.w - 14;
    const at = (v) => x0 + ((Math.log10(Math.max(v, 1e10)) - LO) / (HI - LO)) * (x1 - x0);
    const rows = [
      ['Si atoms', N_SI, c.fillY, 0.2],
      ['As donors', donors(state), c.a, 0.45],
      ['Thermal electrons', NI_SI, c.b, 0.7],
    ];
    for (let e = LO; e <= HI; e += 5) {
      const gx = at(10 ** e);
      line(ctx, gx, stage.h * 0.08, gx, stage.h * 0.9, { color: c.grid, width: 1 });
      label(ctx, `10^${e}`, gx, stage.h * 0.95, c, { size: 10, bounds: stage, patch: false });
    }
    for (const [name, value, fill, fy] of rows) {
      const y = stage.h * fy;
      ctx.fillStyle = fill;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      const w = Math.max(2, at(value) - x0);
      ctx.fillRect(x0, y, w, 26);
      ctx.strokeRect(x0, y, w, 26);
      label(ctx, `${name}: ${sci(value, 2)}`, x0, y - 11, c, { size: 11, align: 'left', bounds: stage, patch: false });
    }
  },
  controls: () => [
    { title: 'How much arsenic?' },
    { key: 'k', label: 'Doping, ppm = 10^k', min: -8, max: 1, step: 0.5, format: (n) => `${sig(10 ** n, 2)} ppm` },
    { readout: [
      ['Donors added', (s) => `${sci(donors(s), 2)} m⁻³`],
      ['Thermal electrons', () => `${sci(NI_SI, 2)} m⁻³`],
      ['Donors ÷ thermal', (s) => `× ${sig(swamp(s), 2)}`],
      ['So', (s) => (swamp(s) > 10 ? { text: 'donors swamp', good: true } : swamp(s) > 0.1 ? { text: 'about equal', good: false } : { text: 'thermal wins', good: false })],
    ] },
  ],
  tex: (s) => `N_D=${texSci(10 ** s.k * 1e-6, 2)}\\times${texSci(N_SI, 2)}=${texSci(donors(s), 3)},\\quad \\dfrac{N_D}{n_i}=${texSci(swamp(s), 2)}`,
});

tool.update();
