import { createTool } from '../../lib/tool.js';
import { createRng } from '../../lib/rng.js';
import { poly, line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { loaded, FACES } from './_probability-math.js';

const rng = createRng(11);
const U = Array.from({ length: 3000 }, () => rng.next());
const state = { w: 4, n: 600 };
const counts = (s) => {
  const p = loaded(s.w);
  const out = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < s.n; i++) {
    let acc = 0;
    let k = 0;
    while (k < 5 && U[i] >= acc + p[k]) acc += p[k++];
    out[k]++;
  }
  return out;
};

createTool({
  state,
  label: 'Bars show how often each face of a die came up in the rolls. A dashed line marks one sixth. When face six is heavy its bar rises above the line.',
  draw(ctx, stage, c) {
    const { w: W, h: H } = stage;
    const cnt = counts(state);
    const [left, top, bw, bh] = [18, 24, W - 36, H - 70];
    const slot = bw / 6;
    const max = Math.max(0.5, ...cnt.map((x) => x / state.n)) * 1.05;
    FACES.forEach((f, i) => {
      const share = cnt[i] / state.n;
      const h = (share / max) * bh;
      poly(ctx, [[left + i * slot + 6, top + bh - h], [left + (i + 1) * slot - 6, top + bh - h], [left + (i + 1) * slot - 6, top + bh], [left + i * slot + 6, top + bh]], { fill: f === 6 ? c.a : c.fillB, stroke: c.ink });
      label(ctx, String(f), left + (i + 0.5) * slot, top + bh + 16, c, { size: 13, patch: false });
      label(ctx, fixed(share, 2), left + (i + 0.5) * slot, top + bh - h - 10, c, { size: 11, bounds: stage, patch: false });
    });
    const y = top + bh - (1 / 6 / max) * bh;
    line(ctx, left, y, left + bw, y, { color: c.ink, width: 2, dash: [6, 5] });
    label(ctx, '1/6', left + bw - 16, y - 9, c, { size: 11, patch: false });
    line(ctx, left, top + bh, left + bw, top + bh, { color: c.ink, width: 3 });
    label(ctx, `${state.n} rolls`, W / 2, H - 14, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Load the die' },
    { key: 'w', label: 'Weight of face 6 (others 1)', min: 1, max: 8, step: 1 },
    { key: 'n', label: 'Rolls', min: 60, max: 3000, step: 60 },
    { readout: [
      ['Favourable ÷ total', () => '1/6 = 0.167'],
      ['Share of sixes', (s) => fixed(counts(s)[5] / s.n, 3)],
      ['True P(6)', (s) => fixed(s.w / (s.w + 5), 3)],
      ['Formula right?', (s) => ({ text: s.w === 1 ? 'yes' : 'no', good: s.w === 1 })],
    ] },
  ],
  tex: (s) => `\\dfrac{1}{6}\\ \\text{vs}\\ P(6)=\\dfrac{${s.w}}{${s.w + 5}}=${fixed(s.w / (s.w + 5), 3)}`,
});
