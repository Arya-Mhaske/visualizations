import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { mod, modinv } from './_aa-math.js';
import { figure, textBox } from './_aa-view.js';

// Caesar: C = P + k (mod 26). Affine: C = a·P + b (mod 26), with gcd(a, 26) = 1 so that it can be undone.
// A cipher that moves letters one-for-one keeps letter frequencies: the commonest letter in English is E.
const PLAIN = 'THE BEST WAY TO LEARN ALGEBRA IS TO PLAY WITH IT. ONE IDEA AT A TIME BUILDS A WHOLE STRUCTURE, AND EVERY SMALL PATTERN HELPS THE NEXT ONE TO MAKE SENSE. EVEN THE SIMPLEST RULE TEACHES THE MOST.';
const A_VALUES = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
const state = { mode: 'caesar', k: 3, ai: 3, b: 8 };
const key = (s) => (s.mode === 'caesar' ? { a: 1, b: s.k } : { a: A_VALUES[s.ai], b: s.b });
const encrypt = (text, { a, b }) => [...text].map((ch) => (/[A-Z]/.test(ch) ? String.fromCharCode(65 + mod(a * (ch.charCodeAt(0) - 65) + b, 26)) : ch)).join('');
const counts = (text) => { const out = Array(26).fill(0); for (const ch of text) if (/[A-Z]/.test(ch)) out[ch.charCodeAt(0) - 65]++; return out; };
const cipher = (s) => encrypt(PLAIN, key(s));
const peak = (s) => { const cs = counts(cipher(s)); return cs.indexOf(Math.max(...cs)); };

const tool = createTool({
  state,
  label: 'A bar chart of how often each letter A to Z appears in the encrypted message. The tallest bar is coral. Because the cipher only renames letters, the chart is the same shape as English, just shifted or scrambled.',
  dom(el, c) {
    el.classList.add('viz-stage--flow');
    const stage = figure(el, c, (ctx, st) => {
      const cs = counts(cipher(state));
      const top = Math.max(...cs);
      const w = (st.w - 20) / 26;
      cs.forEach((n, i) => {
        const h = (n / top) * (st.h - 60);
        ctx.fillStyle = i === peak(state) ? c.a : c.fillB;
        ctx.fillRect(10 + i * w + 1, st.h - 30 - h, w - 2, h);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(10 + i * w + 1, st.h - 30 - h, w - 2, h);
        label(ctx, String.fromCharCode(65 + i), 10 + (i + 0.5) * w, st.h - 16, c, { size: w > 12 ? 10 : 8, patch: false });
      });
      label(ctx, `commonest letter: ${String.fromCharCode(65 + peak(state))}`, st.w / 2, 14, c, { size: 12 });
    }, 'Bar chart of letter counts in the encrypted message.', false);
    const box = textBox(el);
    const refresh = () => {
      stage.invalidate();
      const k = key(state);
      const guessShift = mod(peak(state) - 4, 26);
      box.set([`Plain:   ${PLAIN.slice(0, 60)}…`, `Cipher:  ${cipher(state).slice(0, 60)}…`,
        state.mode === 'caesar' ? `If the commonest letter stands for E, the shift is ${guessShift}${guessShift === k.b ? ': correct!' : ': not this time.'}` : `If the commonest letter stands for E, then b = ${mod(peak(state) - 4 * k.a, 26)}${mod(peak(state) - 4 * k.a, 26) === k.b ? ' (it is)' : ' (not quite)'}.`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Encrypt, then break it' },
    { key: 'mode', label: 'Cipher', options: [['caesar', 'Shift'], ['affine', 'Affine']] },
    { key: 'k', label: 'Shift, k (shift cipher)', min: 0, max: 25, step: 1 },
    { key: 'ai', label: 'Multiplier, a (affine)', min: 0, max: 11, step: 1, format: (v) => String(A_VALUES[v]) },
    { key: 'b', label: 'Shift, b (affine)', min: 0, max: 25, step: 1 },
    { readout: [
      ['Key', (s) => (s.mode === 'caesar' ? `k = ${s.k}` : `a = ${key(s).a}, b = ${s.b}`)],
      ['Undo with', (s) => (s.mode === 'caesar' ? `shift by ${mod(-s.k, 26)}` : `P = ${modinv(key(s).a, 26)}(C − ${s.b})`)],
      ['Number of keys', (s) => (s.mode === 'caesar' ? '26' : '12 × 26 = 312')],
    ] },
  ],
  tex: (s) => (s.mode === 'caesar' ? `C\\equiv P+${s.k}\\pmod{26}` : `C\\equiv ${key(s).a}P+${s.b}\\pmod{26}`),
});
void tool;
