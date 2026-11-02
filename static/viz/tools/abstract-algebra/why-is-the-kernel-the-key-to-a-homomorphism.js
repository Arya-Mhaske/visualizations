import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { cyclicGroup, dihedralGroup } from './_aa-math.js';
import { specFill } from './_aa-view.js';

// A homomorphism sends each element of G to some element of H. The elements sent to the identity form the kernel.
// Every other fibre is a coset of the kernel, so all fibres have the same size: |G| = |kernel| × |image|.
const Z12 = cyclicGroup(12);
const D3 = dihedralGroup(3);
const D4 = dihedralGroup(4);
const HOMS = {
  mod4: { name: 'ℤ₁₂ → ℤ₄, x ↦ x mod 4', G: Z12, to: (x) => x % 4, target: (y) => `${y}` },
  mod3: { name: 'ℤ₁₂ → ℤ₃, x ↦ x mod 3', G: Z12, to: (x) => x % 3, target: (y) => `${y}` },
  mod6: { name: 'ℤ₁₂ → ℤ₆, x ↦ x mod 6', G: Z12, to: (x) => x % 6, target: (y) => `${y}` },
  mod2: { name: 'ℤ₁₂ → ℤ₂, x ↦ x mod 2', G: Z12, to: (x) => x % 2, target: (y) => `${y}` },
  sign: { name: 'Triangle → ℤ₂: rotation 0, flip 1', G: D3, to: (x) => (x >= 3 ? 1 : 0), target: (y) => `${y}` },
  d4: { name: 'Square → ℤ₂: r ↦ 1, f ↦ 0', G: D4, to: (x) => (x % 4) % 2, target: (y) => `${y}` },
  id: { name: 'ℤ₁₂ → ℤ₁₂: x ↦ x (an isomorphism)', G: Z12, to: (x) => x, target: (y) => `${y}` },
};
const state = { hom: 'mod4' };
const fibres = (s) => {
  const h = HOMS[s.hom];
  const map = new Map();
  for (let x = 0; x < h.G.n; x++) { const y = h.to(x); if (!map.has(y)) map.set(y, []); map.get(y).push(x); }
  return [...map].sort((a, b) => a[0] - b[0]);
};

createTool({
  state,
  label: 'The elements of a group sorted into columns by where the homomorphism sends them. The column that goes to the identity is the kernel and is highlighted. Every column has the same number of elements.',
  draw(ctx, stage, c) {
    const h = HOMS[state.hom];
    const cols = fibres(state);
    const cw = (stage.w - 16) / cols.length;
    const maxSize = Math.max(...cols.map(([, xs]) => xs.length));
    const r = Math.min(13, cw * 0.4, (stage.h - 110) / maxSize / 2.2);
    cols.forEach(([y, xs], i) => {
      const x0 = 8 + i * cw;
      ctx.fillStyle = y === 0 ? c.fillY : c.paper;
      ctx.fillRect(x0 + 2, 40, cw - 4, stage.h - 90);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = y === 0 ? 4 : 2;
      ctx.strokeRect(x0 + 2, 40, cw - 4, stage.h - 90);
      xs.forEach((x, k) => {
        const yy = 40 + 14 + r + k * (r * 2.3);
        dot(ctx, x0 + cw / 2, yy, r, specFill(c, i), c.ink, 2);
        label(ctx, h.G.names[x], x0 + cw / 2, yy, c, { size: Math.max(7, Math.round(r * 0.8)), patch: false });
      });
      label(ctx, `→ ${h.target(y)}`, x0 + cw / 2, stage.h - 30, c, { size: 12, bounds: stage });
    });
    label(ctx, 'elements of G, grouped by their image', stage.w / 2, 18, c, { size: 12 });
  },
  controls: [
    { title: 'Pick a homomorphism' },
    { key: 'hom', label: 'Map', options: Object.entries(HOMS).map(([k, v]) => [k, v.name]) },
    { readout: [
      ['|G|', (s) => String(HOMS[s.hom].G.n)],
      ['|kernel|', (s) => String(fibres(s).find(([y]) => y === 0)[1].length)],
      ['|image|', (s) => String(fibres(s).length)],
      ['Check', (s) => { const k = fibres(s).find(([y]) => y === 0)[1].length; return `${k} × ${fibres(s).length} = ${k * fibres(s).length}`; }],
      ['All fibres equal in size?', (s) => { const sizes = new Set(fibres(s).map(([, xs]) => xs.length)); return { text: sizes.size === 1 ? 'yes' : 'no', good: sizes.size === 1 }; }],
    ] },
  ],
  tex: (s) => { const k = fibres(s).find(([y]) => y === 0)[1].length; return `|G|=|\\ker\\varphi|\\cdot|\\operatorname{im}\\varphi|:\\ ${HOMS[s.hom].G.n}=${k}\\cdot ${fibres(s).length}`; },
});
