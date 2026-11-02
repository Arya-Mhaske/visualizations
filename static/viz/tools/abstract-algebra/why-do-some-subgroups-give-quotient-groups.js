import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { dihedralGroup, generated, leftCosets, rightCosets } from './_aa-math.js';
import { specFill } from './_aa-view.js';

// To collapse each coset to a point we must be able to multiply cosets: (aH)(bH) = abH, whatever representatives we pick.
// That works exactly when left cosets and right cosets are the same sets: H is normal.
const G = dihedralGroup(4);
const SUBS = { r2: ['⟨r²⟩', [2]], f: ['⟨f⟩', [4]], r: ['⟨r⟩', [1]], v4: ['⟨r², f⟩', [2, 4]] };
const state = { sub: 'r2', a: 1, b: 4 };
const H = (s) => generated(G, SUBS[s.sub][1]);
const sameSets = (A, B) => A.length === B.length && A.every((x) => B.some((y) => x.join() === y.join()));
const normal = (s) => sameSets(leftCosets(G, H(s)), rightCosets(G, H(s)));
const cosetOf = (cosets, x) => cosets.findIndex((cs) => cs.includes(x));
// All products (a h1)(b h2) over every choice of representatives, and the left cosets they land in.
function landing(s) {
  const Hs = H(s);
  const L = leftCosets(G, Hs);
  const hit = new Set();
  for (const h1 of Hs) for (const h2 of Hs) hit.add(cosetOf(L, G.mul(G.mul(s.a, h1), G.mul(s.b, h2))));
  return { L, hit: [...hit] };
}

createTool({
  state,
  label: 'The eight elements of the square group drawn twice. The top row is grouped into left cosets and the bottom row into right cosets, with lines joining equal elements. When the lines stay parallel inside the same boxes, the subgroup is normal.',
  draw(ctx, stage, c) {
    const Hs = H(state);
    const rows = [leftCosets(G, Hs), rightCosets(G, Hs)];
    const L = rows[0];
    const gap = 14;
    const step = (stage.w - 20 - gap * (rows[0].length - 1)) / G.n;
    const where = rows.map((cosets) => {
      const m = new Map();
      let x = 10;
      cosets.forEach((cs) => {
        cs.forEach((el) => { m.set(el, x + step / 2); x += step; });
        x += gap;
      });
      return m;
    });
    const [yTop, yBot] = [stage.h * 0.2, stage.h * 0.62];
    for (let el = 0; el < G.n; el++) line(ctx, where[0].get(el), yTop + 14, where[1].get(el), yBot - 14, { color: specFill(c, cosetOf(L, el)), width: 3 });
    rows.forEach((cosets, r) => {
      const y = r ? yBot : yTop;
      cosets.forEach((cs) => {
        const xs = cs.map((el) => where[r].get(el));
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(Math.min(...xs) - step / 2 + 2, y - 22, Math.max(...xs) - Math.min(...xs) + step - 4, 44);
        cs.forEach((el) => {
          dot(ctx, where[r].get(el), y, Math.min(12, step * 0.38), specFill(c, cosetOf(L, el)), c.ink, 2);
          label(ctx, G.names[el], where[r].get(el), y + 0, c, { size: step > 34 ? 10 : 8, patch: false });
        });
      });
    });
    label(ctx, 'left cosets  gH', stage.w / 2, yTop - 34, c, { size: 12 });
    label(ctx, 'right cosets  Hg', stage.w / 2, yBot - 34, c, { size: 12 });
    label(ctx, normal(state) ? 'Left and right cosets are the same sets: H is normal' : 'The boxes do not match: H is not normal', stage.w / 2, stage.h - 40, c, { size: 12, color: normal(state) ? c.ink : c.a, bounds: stage });
    const hit = landing(state).hit;
    label(ctx, `(a·H)(b·H) lands in ${hit.length} coset${hit.length === 1 ? '' : 's'}`, stage.w / 2, stage.h - 16, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Pick a subgroup' },
    { key: 'sub', label: 'H', options: Object.entries(SUBS).map(([k, v]) => [k, v[0]]) },
    { key: 'a', label: 'Representative a', min: 0, max: 7, step: 1, format: (v) => G.names[v] },
    { key: 'b', label: 'Representative b', min: 0, max: 7, step: 1, format: (v) => G.names[v] },
    { readout: [
      ['H is normal?', (s) => ({ text: normal(s) ? 'yes' : 'no', good: normal(s) })],
      ['Cosets', (s) => String(G.n / H(s).length)],
      ['Product of cosets is well defined?', (s) => { const ok = landing(s).hit.length === 1; return { text: ok ? 'yes, for this a, b' : 'no: depends on choices', good: ok }; }],
    ] },
  ],
  tex: (s) => `(aH)(bH)=abH\\ \\text{needs}\\ gHg^{-1}=H,\\quad H=${SUBS[s.sub][0].replace('⟨', '\\langle ').replace('⟩', '\\rangle ').replace('²', '^2')}`,
});
