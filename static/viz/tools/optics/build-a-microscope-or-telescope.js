import { createTool } from '../../lib/tool.js';
import { label, line, dot } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { microscope, telescope } from './_instruments-math.js';

const state = { kind: 'telescope', fo: 30, fe: 3, d: 33, mfo: 1, mfe: 4, L: 16 };
const tele = (s) => telescope({ fo: s.fo, fe: s.fe, d: s.d });
const micro = (s) => microscope({ fo: s.mfo, fe: s.mfe, L: s.L, atNear: false });

const tool = createTool({
  state,
  label: 'An optical bench seen from the side: the objective lens at the left, the eyepiece at the right, and a dot where the objective forms its image. The positions are to scale. For a telescope in normal adjustment, the image sits exactly at the eyepiece\'s focal point.',
  draw(ctx, stage, c) {
    const y = stage.h * 0.42;
    const telescopeMode = state.kind === 'telescope';
    const span = telescopeMode ? state.d : state.L;
    const x0 = 30;
    const sc = (stage.w - 60) / (span * 1.12);
    const X = (v) => x0 + v * sc;
    line(ctx, x0 - 10, y, stage.w - 14, y, { color: c.ink, width: 2, dash: [8, 4] });
    const tick = (v, color, name, up = true) => {
      line(ctx, X(v), y - 34, X(v), y + 34, { color, width: 5 });
      label(ctx, name, X(v), y + (up ? -50 : 52), c, { color, size: 11, bounds: stage });
    };
    tick(0, c.b, 'objective');
    tick(span, c.a, 'eyepiece');
    if (telescopeMode) {
      const r = tele(state);
      dot(ctx, X(state.fo), y, 7, c.fillY, c.ink);
      label(ctx, 'image from objective', X(state.fo), y + 24, c, { color: c.ink, size: 11, bounds: stage });
      line(ctx, X(state.d - state.fe), y - 12, X(state.d - state.fe), y + 12, { color: c.c, width: 3 });
      label(ctx, 'focal point of eyepiece', X(state.d - state.fe), y + 70, c, { color: c.c, size: 10, bounds: stage });
      label(ctx, r.normal ? 'Normal adjustment: the final image is at infinity' : 'Not in normal adjustment', stage.w / 2, stage.h - 22, c, { color: r.normal ? c.c : c.a, size: 12 });
    } else {
      const r = micro(state);
      if (!r) {
        label(ctx, 'No real image: lengthen the tube', stage.w / 2, stage.h - 22, c, { color: c.a, size: 12 });
        return;
      }
      dot(ctx, X(r.vo), y, 7, c.fillY, c.ink);
      label(ctx, 'image from objective', X(r.vo), y + 24, c, { color: c.ink, size: 11, bounds: stage });
      label(ctx, `Put the slide ${fixed(r.uo, 2)} cm in front of the objective`, stage.w / 2, stage.h - 22, c, { color: c.ink, size: 12, bounds: stage });
    }
  },
  controls: () => [
    { title: 'Place two lenses' },
    { key: 'kind', label: 'Build a', options: [['telescope', 'Telescope'], ['microscope', 'Microscope']] },
    { key: 'fo', label: 'Objective, f₀', min: 10, max: 50, step: 1, format: (n) => `${n} cm` },
    { key: 'fe', label: 'Eyepiece, fₑ', min: 1, max: 6, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'd', label: 'Distance between lenses', min: 12, max: 60, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'mfo', label: 'Objective, f₀', min: 0.5, max: 2, step: 0.1, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'mfe', label: 'Eyepiece, fₑ', min: 2, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'L', label: 'Distance between lenses', min: 8, max: 30, step: 1, format: (n) => `${n} cm` },
    { row: [{ button: 'Normal adjustment', onClick: () => { state.d = Math.min(60, state.fo + state.fe); tool.update(); } }] },
    { readout: [
      ['Magnification', (s) => { if (s.kind === 'telescope') return sig(tele(s).M, 3); const r = micro(s); return r ? sig(r.M, 3) : '—'; }],
      ['Check', (s) => { if (s.kind === 'telescope') return `f₀ / fₑ = ${sig(s.fo / s.fe, 3)}`; const r = micro(s); return r ? `m₀ × Mₑ = ${sig(r.mo, 3)} × ${sig(r.me, 3)}` : '—'; }],
      ['Final image', (s) => { if (s.kind !== 'telescope') return 'at infinity'; const v = tele(s).v; return Number.isFinite(v) ? `${sig(Math.abs(v), 3)} cm ${v < 0 ? 'in front (virtual)' : 'behind (real)'}` : 'at infinity'; }],
    ] },
  ],
  tex: (s) => (s.kind === 'telescope'
    ? `m=\\dfrac{f_o}{u_e}=\\dfrac{${s.fo}}{${fixed(s.d - s.fo, 1)}}=${sig(tele(s).M, 3)}`
    : `M=\\dfrac{v_o}{u_o}\\cdot\\dfrac{25}{f_e}=${micro(s) ? sig(micro(s).M, 3) : '?'}`),
  onChange: () => show(),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
const buttons = document.querySelector('#panel .nb-row');
const show = () => {
  // fields: kind, fo, fe, d, mfo, mfe, L
  const t = state.kind === 'telescope';
  [1, 2, 3].forEach((i) => { fields[i].hidden = !t; });
  [4, 5, 6].forEach((i) => { fields[i].hidden = t; });
  if (buttons) buttons.hidden = !t;
};
show();
tool.update();
