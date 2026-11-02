import { createTool } from '../../lib/tool.js';
import { box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';

const state = { mode: 'pin', d: 4, rep: true };
function slots(s) {
  const kinds = s.mode === 'pin' ? Array(s.d).fill('D') : ['L', 'L', 'D', 'D', 'L', 'L', 'D', 'D', 'D', 'D'];
  const used = { D: 0, L: 0 };
  return kinds.map((k) => {
    const pool = k === 'D' ? 10 : 26;
    const n = s.rep ? pool : pool - used[k];
    used[k] += 1;
    return [k, n];
  });
}
const total = (s) => slots(s).reduce((t, [, n]) => t * n, 1);

createTool({
  state,
  label: 'A row of slots, each showing how many choices it has. The product of the numbers is the count of possible codes.',
  draw(ctx, stage, c) {
    const list = slots(state);
    const w = Math.min(34, (stage.w - 16) / list.length);
    list.forEach(([k, n], i) => box(ctx, c, 8 + i * w, stage.h * 0.3, w - 4, 52, k === 'D' ? c.fillB : c.fillA, String(n)));
    label(ctx, state.mode === 'pin' ? 'digits 0–9' : 'letters (coral) and digits (blue)', stage.w / 2, stage.h * 0.2, c, { size: 12, patch: false });
    label(ctx, sig(total(state), 4), stage.w / 2, stage.h * 0.7, c, { size: 22, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Build a code' },
    { key: 'mode', label: 'Kind', options: [['pin', 'PIN'], ['plate', 'Number plate']] },
    { key: 'd', label: 'PIN digits', min: 2, max: 8, step: 1 },
    { key: 'rep', label: 'Characters may repeat', toggle: true },
    { readout: [
      ['Slots', (s) => String(slots(s).length)],
      ['Total codes', (s) => String(total(s))],
    ] },
  ],
  tex: (s) => slots(s).map(([, n]) => n).join('\\times') + `=${total(s)}`,
  onChange: (s) => sync(s),
});
function sync(s) {
  const fields = [...document.querySelectorAll('#panel .nb-field')];
  if (fields[1]) fields[1].hidden = s.mode !== 'pin';
}
sync(state);
