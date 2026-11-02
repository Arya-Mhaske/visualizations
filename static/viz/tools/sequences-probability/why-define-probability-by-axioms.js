import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { FACES, EVENTS6, normalise } from './_probability-math.js';

const state = { w1: 1, w2: 1, w3: 1, w4: 1, w5: 3, w6: 3, ev: 'high' };
const probs = (s) => normalise([s.w1, s.w2, s.w3, s.w4, s.w5, s.w6]);
const inEv = (s, f) => EVENTS6[s.ev][1](f);
const pEvent = (s) => probs(s).reduce((sum, p, i) => sum + (inEv(s, i + 1) ? p : 0), 0);
const classical = (s) => FACES.filter((f) => inEv(s, f)).length / 6;

createTool({
  state,
  label: 'Six bars, one per face of a die, with heights equal to the face probabilities. The faces in the chosen event are coloured coral. The bars always add to 1.',
  draw(ctx, stage, c) {
    const { w: W, h: H } = stage;
    const p = probs(state);
    const [left, top, bw, bh] = [16, 22, W - 32, H - 66];
    const slot = bw / 6;
    FACES.forEach((f, i) => {
      const h = (p[i] / 0.6) * bh;
      poly(ctx, [[left + i * slot + 6, top + bh - h], [left + (i + 1) * slot - 6, top + bh - h], [left + (i + 1) * slot - 6, top + bh], [left + i * slot + 6, top + bh]], { fill: inEv(state, f) ? c.a : c.fillB, stroke: c.ink });
      label(ctx, fixed(p[i], 2), left + (i + 0.5) * slot, top + bh - h - 10, c, { size: 11, bounds: stage, patch: false });
      label(ctx, String(f), left + (i + 0.5) * slot, top + bh + 16, c, { size: 13, patch: false });
    });
    label(ctx, `P(${EVENTS6[state.ev][0]}) = ${fixed(pEvent(state), 3)}`, W / 2, H - 14, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Weight each face' },
    ...FACES.map((f) => ({ key: `w${f}`, label: `Face ${f}`, min: 1, max: 10, step: 1 })),
    { key: 'ev', label: 'Event', options: Object.entries(EVENTS6).map(([k, v]) => [k, v[0]]) },
    { readout: [
      ['Each p ≥ 0', () => ({ text: 'yes', good: true })],
      ['Sum of all six', (s) => fixed(probs(s).reduce((a, b) => a + b, 0), 3)],
      ['Favourable ÷ total', (s) => fixed(classical(s), 3)],
      ['Axioms: add the p', (s) => fixed(pEvent(s), 3)],
    ] },
  ],
  tex: (s) => `P(E)=\\sum_{f\\in E}p_f=${fixed(pEvent(s), 3)}\\quad\\text{not}\\ \\dfrac{|E|}{6}=${fixed(classical(s), 3)}`,
});
