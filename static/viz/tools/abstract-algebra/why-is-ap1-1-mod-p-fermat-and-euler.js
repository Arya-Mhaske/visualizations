import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { gcd, mod, modpow, phi, units } from './_aa-math.js';
import { spec } from './_aa-view.js';

// Multiply every unit mod n by a. When gcd(a, n) = 1 the answers are the same units in a new order, so the products agree:
// a^φ(n) × (product of units) = (product of units), which forces a^φ(n) ≡ 1.
const state = { n: 13, a: 5 };
const prod = (list, n) => list.reduce((p, x) => (p * x) % n, 1);

createTool({
  state,
  label: 'Two rows of the numbers that have no common factor with n. The top row is the units, the bottom row is each one multiplied by a, reduced mod n. When a is a unit the bottom row holds the same numbers in a different order.',
  draw(ctx, stage, c) {
    const U = units(state.n);
    const out = U.map((u) => (u * state.a) % state.n);
    const x = (i) => 20 + ((stage.w - 40) * (i + 0.5)) / U.length;
    const [yTop, yBot] = [stage.h * 0.2, stage.h * 0.72];
    const r = Math.min(13, (stage.w - 40) / U.length / 2.2);
    const index = new Map(U.map((u, i) => [u, i]));
    U.forEach((u, i) => {
      const j = index.has(out[i]) ? index.get(out[i]) : null;
      if (j !== null) line(ctx, x(i), yTop, x(j), yBot, { color: spec(c, i), width: 2.5 });
    });
    U.forEach((u, i) => {
      dot(ctx, x(i), yTop, r, c.fillB, c.ink, 2);
      if (r > 7) label(ctx, String(u), x(i), yTop, c, { size: Math.round(r * 0.9), patch: false });
    });
    U.forEach((u, i) => {
      const unit = index.has(out[i]);
      dot(ctx, x(index.get(out[i]) ?? i), yBot, r, unit ? c.fillC : c.a, c.ink, 2);
      if (r > 7 && unit) label(ctx, String(out[i]), x(index.get(out[i])), yBot, c, { size: Math.round(r * 0.9), patch: false });
    });
    label(ctx, 'units mod n', stage.w / 2, yTop - 20, c, { size: 12 });
    label(ctx, `each times ${state.a}, mod ${state.n}`, stage.w / 2, yBot + 28, c, { size: 12, bounds: stage });
    if (gcd(state.a, state.n) > 1) label(ctx, `gcd(a, n) = ${gcd(state.a, state.n)}: a is not a unit`, stage.w / 2, stage.h / 2, c, { size: 13, color: c.a, bounds: stage });
  },
  controls: [
    { title: 'Multiply the units' },
    { key: 'n', label: 'Modulus, n', min: 2, max: 30, step: 1 },
    { key: 'a', label: 'Multiplier, a', min: 1, max: 30, step: 1 },
    { readout: [
      ['φ(n)', (s) => String(phi(s.n))],
      ['Same set reordered?', (s) => { const U = units(s.n); const ok = new Set(U.map((u) => (u * s.a) % s.n)).size === U.length && U.every((u) => gcd((u * s.a) % s.n, s.n) === 1); return { text: ok ? 'yes' : 'no', good: ok }; }],
      ['a^φ(n) mod n', (s) => String(modpow(s.a, phi(s.n), s.n))],
      ['Product of units mod n', (s) => String(prod(units(s.n), s.n))],
    ] },
  ],
  tex: (s) => `a^{\\varphi(n)}=${s.a}^{${phi(s.n)}}\\equiv ${modpow(s.a, phi(s.n), s.n)}\\pmod{${s.n}}`,
});
void mod;
