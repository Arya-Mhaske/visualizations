import { createTool } from '../../lib/tool.js';
import { mark } from './_charge.js';
import { label } from '../../lib/draw.js';

// Each process: particles before and after, with charge in units of e.
const PROCESSES = {
  rub: { name: 'Rubbing', note: 'Glass loses electrons, silk gains them.', before: [['glass', 0], ['silk', 0]], after: (s) => [['glass', s.n], ['silk', -s.n]] },
  pair: { name: 'Pair creation', note: 'A gamma ray makes an electron and a positron.', before: [['γ ray', 0]], after: () => [['e⁻', -1], ['e⁺', 1]] },
  beta: { name: 'Beta decay', note: 'A neutron becomes a proton, an electron and an antineutrino.', before: [['n', 0]], after: () => [['p', 1], ['e⁻', -1], ['ν̄', 0]] },
  anni: { name: 'Annihilation', note: 'An electron meets a positron and both become light.', before: [['e⁻', -1], ['e⁺', 1]], after: () => [['γ', 0], ['γ', 0]] },
};
const state = { p: 'rub', n: 3 };
const total = (list) => list.reduce((p, a) => p + a[1], 0);

createTool({
  state,
  label: 'Two boxes, before and after a process, each listing the particles or objects with their charges. A total is written under each box and the two totals are always equal.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const P = PROCESSES[state.p];
    const sets = [P.before, P.after(state)];
    sets.forEach((list, side) => {
      const x0 = W * (side ? 0.54 : 0.04);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0, H * 0.14, W * 0.42, H * 0.6);
      label(ctx, side ? 'after' : 'before', x0 + W * 0.21, H * 0.08, c, { size: 12, bounds: stage, patch: false });
      list.forEach(([name, q], i) => {
        const y = H * 0.24 + i * H * 0.15;
        label(ctx, `${name}  ${q > 0 ? '+' : q < 0 ? '−' : ''}${Math.abs(q)}`, x0 + W * 0.12, y, c, { size: 12, bounds: stage, patch: false });
        for (let k = 0; k < Math.min(5, Math.abs(q)); k++) mark(ctx, x0 + W * 0.24 + k * 16, y, q, c, 6);
      });
      label(ctx, `total charge ${total(list)} e`, x0 + W * 0.21, H * 0.84, c, { size: 13, bounds: stage, patch: false });
    });
    label(ctx, '→', W * 0.5, H * 0.4, c, { size: 22, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Choose a process' },
    { key: 'p', label: 'Process', options: Object.entries(PROCESSES).map(([k, v]) => [k, v.name.split(' ')[0]]) },
    { key: 'n', label: 'Electrons moved (rubbing)', min: 1, max: 5, step: 1 },
    { readout: [
      ['What happens', (s) => PROCESSES[s.p].note],
      ['Before', (s) => `${total(PROCESSES[s.p].before)} e`],
      ['After', (s) => `${total(PROCESSES[s.p].after(s))} e`],
    ] },
  ],
  tex: (s) => `\\sum q_{before}=${total(PROCESSES[s.p].before)}\\,e=\\sum q_{after}=${total(PROCESSES[s.p].after(s))}\\,e`,
});
