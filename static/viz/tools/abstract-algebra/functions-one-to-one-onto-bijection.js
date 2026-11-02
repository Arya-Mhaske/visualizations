import { createTool } from '../../lib/tool.js';
import { arrow, dot, label } from '../../lib/draw.js';

// A = {1, 2, 3, 4} maps into B = {a, b, ...}. One arrow leaves each element of A.
const state = { nB: 4, f1: 1, f2: 2, f3: 3, f4: 4 };
const LETTERS = 'abcdef';
const image = (s) => [s.f1, s.f2, s.f3, s.f4].map((v) => Math.min(v, s.nB) - 1);
const facts = (s) => {
  const img = image(s);
  const hit = new Set(img);
  const oneToOne = hit.size === 4;
  const onto = hit.size === s.nB;
  return { img, oneToOne, onto, bijection: oneToOne && onto, hit };
};

createTool({
  state,
  label: 'Two columns of dots joined by arrows. The left column A has four elements, each with one arrow to the right column B. Elements of B that are hit are green; elements with no arrow are grey.',
  draw(ctx, stage, c) {
    const { img, hit } = facts(state);
    const [xa, xb] = [stage.w * 0.22, stage.w * 0.78];
    const place = (count, k) => 34 + ((stage.h - 68) * (k + 0.5)) / count;
    label(ctx, 'A', xa, 14, c, { size: 14 });
    label(ctx, 'B', xb, 14, c, { size: 14 });
    img.forEach((j, i) => arrow(ctx, xa + 14, place(4, i), xb - 14, place(state.nB, j), { color: c.a, width: 3 }));
    for (let i = 0; i < 4; i++) {
      dot(ctx, xa, place(4, i), 13, c.fillA, c.ink);
      label(ctx, String(i + 1), xa, place(4, i), c, { size: 13, patch: false });
    }
    for (let j = 0; j < state.nB; j++) {
      const count = img.filter((v) => v === j).length;
      dot(ctx, xb, place(state.nB, j), 13, count === 0 ? c.grid : count === 1 ? c.fillC : c.fillY, c.ink);
      label(ctx, LETTERS[j], xb, place(state.nB, j), c, { size: 13, patch: false });
    }
    void hit;
  },
  controls: [
    { title: 'Draw the arrows' },
    { key: 'nB', label: 'Size of B', min: 2, max: 6, step: 1 },
    { key: 'f1', label: 'f(1)', min: 1, max: 6, step: 1, format: (v) => LETTERS[Math.min(v, state.nB) - 1] },
    { key: 'f2', label: 'f(2)', min: 1, max: 6, step: 1, format: (v) => LETTERS[Math.min(v, state.nB) - 1] },
    { key: 'f3', label: 'f(3)', min: 1, max: 6, step: 1, format: (v) => LETTERS[Math.min(v, state.nB) - 1] },
    { key: 'f4', label: 'f(4)', min: 1, max: 6, step: 1, format: (v) => LETTERS[Math.min(v, state.nB) - 1] },
    { readout: [
      ['One-to-one', (s) => ({ text: facts(s).oneToOne ? 'yes: no two arrows meet' : 'no: two arrows meet', good: facts(s).oneToOne })],
      ['Onto', (s) => ({ text: facts(s).onto ? 'yes: every b is hit' : 'no: some b is missed', good: facts(s).onto })],
      ['Bijection', (s) => ({ text: facts(s).bijection ? 'yes' : 'no', good: facts(s).bijection })],
    ] },
  ],
  tex: (s) => `|A|=4,\\ |B|=${s.nB}\\quad\\text{bijection}\\iff\\text{one-to-one and onto}`,
});
