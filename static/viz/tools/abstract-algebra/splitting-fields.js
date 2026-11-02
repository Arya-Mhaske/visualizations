import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// The splitting field of a polynomial over ℚ is the smallest field containing all its roots. Add roots one at a time
// (adjoin them) until the polynomial factors into linear factors. Each stage shows the field reached and its degree over ℚ.
const R2 = Math.SQRT2;
const C3 = 2 ** (1 / 3);
const POLYS = {
  a: { name: 'x² − 2', tex: 'x^2-2', roots: [[R2, 0, '√2'], [-R2, 0, '−√2']], known: [], steps: [{ adjoin: '√2', field: 'ℚ(√2)', degree: 2, gain: [0, 1] }] },
  b: { name: 'x³ − 1', tex: 'x^3-1', roots: [[1, 0, '1'], [-0.5, Math.sqrt(3) / 2, 'ω'], [-0.5, -Math.sqrt(3) / 2, 'ω²']], known: [0], steps: [{ adjoin: 'ω', field: 'ℚ(ω)', degree: 2, gain: [1, 2] }] },
  c: { name: 'x³ − 2', tex: 'x^3-2', roots: [[C3, 0, '∛2'], [-C3 / 2, (C3 * Math.sqrt(3)) / 2, '∛2·ω'], [-C3 / 2, -(C3 * Math.sqrt(3)) / 2, '∛2·ω²']], known: [], steps: [{ adjoin: '∛2', field: 'ℚ(∛2)', degree: 3, gain: [0] }, { adjoin: 'ω', field: 'ℚ(∛2, ω)', degree: 6, gain: [1, 2] }] },
  d: { name: 'x⁴ − 4', tex: 'x^4-4', roots: [[R2, 0, '√2'], [-R2, 0, '−√2'], [0, R2, 'i√2'], [0, -R2, '−i√2']], known: [], steps: [{ adjoin: '√2', field: 'ℚ(√2)', degree: 2, gain: [0, 1] }, { adjoin: 'i', field: 'ℚ(√2, i)', degree: 4, gain: [2, 3] }] },
  e: { name: 'x⁴ + 1', tex: 'x^4+1', roots: [[R2 / 2, R2 / 2, 'ζ'], [-R2 / 2, R2 / 2, 'ζ³'], [-R2 / 2, -R2 / 2, 'ζ⁵'], [R2 / 2, -R2 / 2, 'ζ⁷']], known: [], steps: [{ adjoin: 'ζ = (1 + i)/√2', field: 'ℚ(ζ)', degree: 4, gain: [0, 1, 2, 3] }] },
};
const state = { poly: 'c', stage: 1 };
const reached = (P, stage) => ({ roots: new Set([...P.known, ...P.steps.slice(0, stage).flatMap((st) => st.gain)]), field: stage ? P.steps[stage - 1].field : 'ℚ', degree: stage ? P.steps[stage - 1].degree : 1 });

createTool({
  state,
  label: 'The complex plane with the roots of a polynomial. A root already in the current field is a filled green dot. A root not yet reached is a hollow coral ring with a question mark. Adjoining roots one step at a time fills in all of them.',
  draw(ctx, stage, c) {
    const P = POLYS[state.poly];
    const { roots, field } = reached(P, Math.min(state.stage, P.steps.length));
    const s = Math.min(stage.w, stage.h) / 4.2;
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    line(ctx, 8, cy, stage.w - 8, cy, { color: c.grid, width: 1.5 });
    line(ctx, cx, 8, cx, stage.h - 8, { color: c.grid, width: 1.5 });
    P.roots.forEach(([x, y, name], i) => {
      const [px, py] = [cx + x * s, cy - y * s];
      if (roots.has(i)) {
        dot(ctx, px, py, 11, c.fillC, c.ink);
        label(ctx, name, px, py + (y >= 0 ? -24 : 24), c, { size: 11, bounds: stage });
      } else {
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.strokeStyle = c.a;
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        label(ctx, '?', px, py, c, { size: 13, color: c.a, patch: false });
      }
    });
    label(ctx, `field so far: ${field}`, stage.w / 2, 16, c, { size: 13 });
    label(ctx, roots.size === P.roots.length ? 'all roots are in: the polynomial splits' : `${roots.size} of ${P.roots.length} roots in the field`, stage.w / 2, stage.h - 16, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Adjoin roots' },
    { key: 'poly', label: 'Polynomial over ℚ', options: Object.entries(POLYS).map(([k, v]) => [k, v.name]) },
    { key: 'stage', label: 'Roots adjoined (steps)', min: 0, max: 2, step: 1, format: (v) => String(Math.min(v, POLYS[state.poly].steps.length)) },
    { readout: [
      ['Field reached', (s) => reached(POLYS[s.poly], Math.min(s.stage, POLYS[s.poly].steps.length)).field],
      ['Degree [K : ℚ]', (s) => String(reached(POLYS[s.poly], Math.min(s.stage, POLYS[s.poly].steps.length)).degree)],
      ['Next to adjoin', (s) => { const P = POLYS[s.poly]; const k = Math.min(s.stage, P.steps.length); return k < P.steps.length ? P.steps[k].adjoin : 'nothing: done'; }],
      ['Degree of the splitting field', (s) => String(POLYS[s.poly].steps.at(-1).degree)],
    ] },
  ],
  tex: (s) => { const P = POLYS[s.poly]; return `${P.tex}\\ \\text{splits over a field of degree}\\ ${P.steps.at(-1).degree}`; },
});
