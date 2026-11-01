import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { pendulumDim, pendulumOk, kFrom, dimText } from './_dimensions-math.js';

// Guess T = k l^x g^y m^z. Dimensions of the right side must equal [T].
const state = { x: 1, y: 0, z: 1 };
const target = [0, 0, 1];
// Two virtual pendulums: (l = 1 m, m = 1 kg) and (l = 4 m, m = 2 kg).
const kA = (s) => kFrom(s.x, s.y, s.z, 1, 1);
const kB = (s) => kFrom(s.x, s.y, s.z, 4, 2);
const consistent = (s) => Math.abs(kA(s) / kB(s) - 1) < 1e-6;

const tool = createTool({
  state,
  label: 'Three rows of bars for the exponents of mass, length and time in the guessed formula, each beside a marker for the value needed to make a time. When all three bars match their markers the formula is dimensionally possible. Only one choice of x, y and z does that.',
  draw(ctx, stage, c) {
    const d = pendulumDim(state.x, state.y, state.z);
    const rows = [['[M]', d[0], target[0]], ['[L]', d[1], target[1]], ['[T]', d[2], target[2]]];
    const mid = stage.w / 2;
    const unit = (stage.w * 0.4) / 4; // four exponent steps either side
    rows.forEach(([name, have, want], k) => {
      const y = 24 + k * (stage.h * 0.2);
      const hgt = stage.h * 0.11;
      const ok = Math.abs(have - want) < 1e-9;
      ctx.fillStyle = ok ? c.c : c.a;
      const x0 = mid;
      const x1 = mid + have * unit;
      ctx.fillRect(Math.min(x0, x1), y, Math.max(Math.abs(x1 - x0), 3), hgt);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(Math.min(x0, x1), y, Math.max(Math.abs(x1 - x0), 3), hgt);
      ctx.beginPath();
      ctx.moveTo(mid + want * unit, y - 6);
      ctx.lineTo(mid + want * unit, y + hgt + 6);
      ctx.strokeStyle = c.ink;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      label(ctx, `${name} ${fixed(have, 1)} (need ${want})`, 52, y + hgt / 2, c, { color: c.ink, size: 11, patch: false });
    });
    const ok = pendulumOk(state.x, state.y, state.z);
    const by = stage.h * 0.68;
    ctx.fillStyle = ok ? c.fillC : c.fillA;
    ctx.fillRect(14, by, stage.w - 28, stage.h * 0.27);
    ctx.strokeStyle = c.ink;
    ctx.strokeRect(14, by, stage.w - 28, stage.h * 0.27);
    label(ctx, ok ? 'Dimensions balance' : 'Dimensions do not balance', stage.w / 2, by + stage.h * 0.06, c, { color: c.ink, size: 13, patch: false });
    label(ctx, `k from l = 1 m, m = 1 kg:  ${sig(kA(state), 4)}`, stage.w / 2, by + stage.h * 0.14, c, { color: c.ink, size: 11, patch: false, bounds: stage });
    label(ctx, `k from l = 4 m, m = 2 kg:  ${sig(kB(state), 4)}`, stage.w / 2, by + stage.h * 0.21, c, { color: c.ink, size: 11, patch: false, bounds: stage });
  },
  controls: () => [
    { title: 'Guess T = k lˣ gʸ mᶻ' },
    { key: 'x', label: 'Exponent of l, x', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'y', label: 'Exponent of g, y', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'z', label: 'Exponent of m, z', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Dimension of the right side', (s) => dimText(pendulumDim(s.x, s.y, s.z))],
      ['Needed', () => '[T]'],
      ['Does k come out the same for both pendulums?', (s) => (consistent(s) ? { text: `yes: k = ${sig(kA(s), 4)}`, good: true } : { text: 'no: so the guess is wrong', good: false })],
    ] },
  ],
  tex: (s) => `T=k\\,l^{${fixed(s.x, 1)}}g^{${fixed(s.y, 1)}}m^{${fixed(s.z, 1)}}`,
});
tool.update();
