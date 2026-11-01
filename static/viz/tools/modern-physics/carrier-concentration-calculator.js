import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';
import { sci, sig, texSci } from '../../lib/format.js';
import { NI_GE, NI_SI, carriers } from './_intrinsic-extrinsic-semiconductors-math.js';

const state = { host: 'si', kind: 'n', logN: 22 };
const LO = 8;
const HI = 26;
const ni = (s) => (s.host === 'si' ? NI_SI : NI_GE);
const dop = (s) => 10 ** s.logN;
const now = (s) => carriers(s.kind === 'n' ? dop(s) : -dop(s), ni(s));

const tool = createTool({
  state,
  label: 'Three horizontal bars on a log scale from 10 to the 8 up to 10 to the 26 per cubic metre: the doping level in yellow, the electron count in coral and the hole count in blue, with a dashed vertical line at the intrinsic concentration n sub i. The majority bar follows the doping and the minority bar is far shorter.',
  draw(ctx, stage, c) {
    const x0 = 14;
    const x1 = stage.w - 14;
    const at = (v) => x0 + ((Math.log10(Math.max(v, 1e8)) - LO) / (HI - LO)) * (x1 - x0);
    const r = now(state);
    for (let e = LO; e <= HI; e += 6) {
      line(ctx, at(10 ** e), stage.h * 0.06, at(10 ** e), stage.h * 0.9, { color: c.grid, width: 1 });
      label(ctx, `10^${e}`, at(10 ** e), stage.h * 0.95, c, { size: 10, bounds: stage, patch: false });
    }
    const rows = [
      [state.kind === 'n' ? 'Donors N_D' : 'Acceptors N_A', dop(state), c.fillY, 0.14],
      ['Electrons n_e', r.n, c.a, 0.4],
      ['Holes n_h', r.p, c.b, 0.66],
    ];
    for (const [name, value, fill, fy] of rows) {
      const y = stage.h * fy;
      ctx.fillStyle = fill;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      const w = Math.max(2, at(value) - x0);
      ctx.fillRect(x0, y, w, 24);
      ctx.strokeRect(x0, y, w, 24);
      label(ctx, `${name} = ${sci(value, 2)}`, x0, y - 11, c, { size: 11, align: 'left', bounds: stage, patch: false });
    }
    line(ctx, at(ni(state)), stage.h * 0.06, at(ni(state)), stage.h * 0.9, { color: c.ink, width: 2, dash: [6, 4] });
    label(ctx, 'nᵢ', at(ni(state)) + 10, stage.h * 0.84, c, { size: 11, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Set the doping' },
    { key: 'host', label: 'Crystal', options: [['si', 'Si, nᵢ = 1.5×10¹⁶'], ['ge', 'Ge, nᵢ = 2.4×10¹⁹']] },
    { key: 'kind', label: 'Dopant', options: [['n', 'donors'], ['p', 'acceptors']] },
    { key: 'logN', label: 'Doping, log₁₀ N', min: 12, max: 25, step: 0.25, format: (n) => `${sci(10 ** n, 2)} m⁻³` },
    { readout: [
      ['Electrons, nₑ', (s) => `${sci(now(s).n, 3)} m⁻³`],
      ['Holes, nₕ', (s) => `${sci(now(s).p, 3)} m⁻³`],
      ['nₑ·nₕ ÷ nᵢ²', (s) => sig(now(s).n * now(s).p / ni(s) ** 2, 3)],
      ['Majority ÷ minority', (s) => `× ${sig(Math.max(now(s).n, now(s).p) / Math.min(now(s).n, now(s).p), 2)}`],
    ] },
  ],
  tex: (s) => {
    const r = now(s);
    return s.kind === 'n'
      ? `n_e\\approx N_D=${texSci(dop(s), 3)},\\quad n_h=\\dfrac{n_i^2}{n_e}=${texSci(r.p, 3)}`
      : `n_h\\approx N_A=${texSci(dop(s), 3)},\\quad n_e=\\dfrac{n_i^2}{n_h}=${texSci(r.n, 3)}`;
  },
});

tool.update();
