import { createTool } from '../../lib/tool.js';
import { mark, E } from './_charge.js';
import { label } from '../../lib/draw.js';

// Two surfaces of 12 atoms. Electrons hop from the surface that holds them less strongly to the one that holds them more strongly.
const state = { hA: 3, hB: 7, rub: 6 };
const moved = (s) => Math.min(12, Math.round(s.rub * Math.abs(s.hB - s.hA) / 4));
const net = (s) => (s.hB > s.hA ? 1 : s.hB < s.hA ? -1 : 0) * moved(s); // charge of A in units of e

createTool({
  state,
  label: 'Two rows of twelve atoms, surface A on the left and surface B on the right. Each atom has a fixed positive core and an outer electron. Rubbing makes outer electrons hop from the surface that holds them more loosely to the one that holds them more tightly. The atom cores never move.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const n = moved(state);
    const from = state.hB > state.hA ? 0 : 1;
    [0, 1].forEach((side) => {
      for (let k = 0; k < 12; k++) {
        const x = W * (side ? 0.62 : 0.14) + (k % 3) * W * 0.11;
        const y = H * 0.22 + Math.floor(k / 3) * H * 0.17;
        mark(ctx, x, y, 1, c, 9);
        const lost = side === from && k < n;
        const gained = side !== from && k < n;
        if (!lost) mark(ctx, x + 14, y - 12, -1, c, 5);
        if (gained) mark(ctx, x - 14, y - 12, -1, c, 5);
      }
    });
    label(ctx, `A holds: ${state.hA}`, W * 0.3, H * 0.08, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `B holds: ${state.hB}`, W * 0.78, H * 0.08, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `charge on A: ${net(state) >= 0 ? '+' : '−'}${Math.abs(net(state))} e`, W * 0.3, H * 0.92, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `charge on B: ${net(state) <= 0 ? '+' : '−'}${Math.abs(net(state))} e`, W * 0.78, H * 0.92, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Rub two surfaces' },
    { key: 'hA', label: 'How tightly A holds electrons', min: 1, max: 10, step: 1 },
    { key: 'hB', label: 'How tightly B holds electrons', min: 1, max: 10, step: 1 },
    { key: 'rub', label: 'Amount of rubbing', min: 0, max: 12, step: 1 },
    { readout: [
      ['Electrons moved', (s) => moved(s)],
      ['Protons moved', () => '0'],
      ['Charge on A', (s) => `${(net(s) * 1.6e-19 * 1e0).toExponential(1)} C`],
    ] },
  ],
  tex: () => `q=\\pm ne,\\quad e=1.6\\times 10^{-19}\\ \\mathrm{C}`,
});
void E;
