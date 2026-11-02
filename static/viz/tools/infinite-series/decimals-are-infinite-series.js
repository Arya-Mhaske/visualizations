import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';

// 0.d₁d₂d₃… = d₁/10 + d₂/100 + …  A repeating block P of m digits sums to P/(10^m − 1).
const PATTERNS = { 3: '3', 9: '9', 142857: '142857', 12: '12', 6: '6' };
const state = { pat: '3', D: 4 };
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
const info = () => {
  const P = BigInt(state.pat);
  const m = state.pat.length;
  const den = 10n ** BigInt(m) - 1n;
  const digits = state.pat.repeat(Math.ceil(state.D / m) + 1).slice(0, state.D);
  const ND = BigInt(digits);
  const scale = 10n ** BigInt(state.D);
  // gap · 10^D = (P·10^D − N_D·den) / den, a number between 0 and 1 (or exactly 1 for 0.999…)
  const t = Number(P * scale - ND * den) / Number(den);
  const g = gcd(P, den);
  const [n, d] = [P / g, den / g];
  return { digits, frac: d === 1n ? `${n}` : `${n}/${d}`, tex: d === 1n ? `${n}` : `\\frac{${n}}{${d}}`, t, value: Number(P) / Number(den) };
};

createTool({
  state,
  label: 'Two number strips. The top strip from 0 to 1 shows the digits added so far as blocks. The bottom strip magnifies the gap between the partial sum and the true value, which always fits inside one step of the last digit.',
  draw(ctx, stage, c) {
    const f = info();
    const x0 = 14;
    const w = stage.w - 28;
    const topY = stage.h * 0.2;
    const h = stage.h * 0.14;
    label(ctx, '0', x0, topY - 14, c, { size: 11 });
    label(ctx, '1', x0 + w, topY - 14, c, { size: 11 });
    let at = 0;
    for (let k = 1; k <= state.D; k++) {
      const d = Number(f.digits[k - 1]);
      const bw = (d / 10 ** k) * w;
      if (bw >= 0.5) {
        ctx.fillStyle = k % 2 ? c.fillA : c.fillB;
        ctx.fillRect(x0 + at * w, topY, bw, h);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(x0 + at * w, topY, bw, h);
      }
      at += d / 10 ** k;
    }
    line(ctx, x0, topY + h, x0 + w, topY + h, { color: c.ink, width: 3 });
    line(ctx, x0 + f.value * w, topY - 8, x0 + f.value * w, topY + h + 8, { color: c.c, width: 4 });
    label(ctx, `true value ${f.frac}`, Math.min(x0 + f.value * w, stage.w - 60), topY + h + 24, c, { size: 12, color: c.c });
    // Zoom: the interval from S_D to S_D + 10^-D, drawn full width.
    const zy = stage.h * 0.62;
    label(ctx, 'Zoom: one step of the last digit', stage.w / 2, zy - 50, c, { size: 12 });
    line(ctx, x0, zy, x0 + w, zy, { color: c.ink, width: 4 });
    line(ctx, x0, zy - 10, x0, zy + 10, { color: c.ink, width: 3 });
    line(ctx, x0 + w, zy - 10, x0 + w, zy + 10, { color: c.ink, width: 3 });
    label(ctx, 'Sᴅ', x0, zy + 26, c, { size: 12, align: 'left' });
    label(ctx, 'Sᴅ + 10⁻ᴰ', x0 + w, zy + 26, c, { size: 12, align: 'right' });
    line(ctx, x0 + f.t * w, zy - 22, x0 + f.t * w, zy + 12, { color: c.c, width: 5 });
    label(ctx, 'true value', Math.max(46, Math.min(x0 + f.t * w, stage.w - 46)), zy - 32, c, { size: 12, color: c.c, patch: false });
  },
  controls: [
    { title: 'Write the digits' },
    { key: 'pat', label: 'Repeating digits', options: Object.keys(PATTERNS).map((k) => [k, `0.${k}…`]) },
    { key: 'D', label: 'Digits added D', min: 1, max: 20, step: 1 },
    { readout: [
      ['Partial sum', () => `0.${info().digits}`],
      ['True value', () => info().frac],
      ['Gap ÷ 10⁻ᴰ', () => info().t.toFixed(4)],
    ] },
  ],
  tex: (s) => `0.\\overline{${s.pat}}=\\sum_{k=1}^{\\infty}\\frac{${s.pat}}{10^{${s.pat.length}k}}=${info().tex}`,
});
