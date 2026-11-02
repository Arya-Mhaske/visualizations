import { createTool } from '../../lib/tool.js';
import { mark } from './_charge.js';
import { label, line } from '../../lib/draw.js';

// A metal sphere has 8 fixed + cores and a sea of mobile electrons. Steps: 1 rod near, 2 earthed, 3 earth removed, 4 rod removed.
const STEPS = ['Neutral sphere, rod brought near', 'Sphere connected to earth', 'Earth connection removed', 'Rod taken away'];
const state = { step: 1, rod: 1 };
const extra = (s) => (s.step >= 2 ? -s.rod * 3 : 0); // net charge in e: − for a + rod
const electrons = (s) => 8 - extra(s);

createTool({
  state,
  label: 'A metal sphere with a charged rod brought near it on the left. The step control moves through four stages: charges separate in the sphere, the sphere is earthed so charge flows, the earth wire is removed, and the rod is taken away. The sphere ends up with charge opposite to the rod.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [cx, cy, r] = [W * 0.58, H * 0.5, Math.min(W, H) * 0.26];
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = c.fillY;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    for (let k = 0; k < 8; k++) mark(ctx, cx + Math.cos((k * Math.PI) / 4) * r * 0.72, cy + Math.sin((k * Math.PI) / 4) * r * 0.72, 1, c, 7);
    const n = electrons(state);
    const rodSide = state.step === 4 ? null : Math.PI; // rod on the left
    const near = state.rod > 0 ? Math.PI : 0;
    for (let k = 0; k < n; k++) {
      const spread = rodSide === null ? 2 * Math.PI : Math.PI * 0.75;
      const a = rodSide === null ? ((k + 0.5) / n) * spread : near + spread * ((k + 0.5) / n - 0.5);
      mark(ctx, cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45, -1, c, 7);
    }
    if (state.step !== 4) {
      ctx.fillStyle = state.rod > 0 ? c.fillA : c.fillB;
      ctx.fillRect(W * 0.04, cy - 16, W * 0.22, 32);
      ctx.strokeRect(W * 0.04, cy - 16, W * 0.22, 32);
      label(ctx, state.rod > 0 ? '+ rod' : '− rod', W * 0.15, cy, c, { size: 12, bounds: stage, patch: false });
    }
    if (state.step === 2) {
      line(ctx, cx, cy + r, cx, H * 0.92, { color: c.ink, width: 3 });
      label(ctx, 'earth', cx, H * 0.96, c, { size: 11, bounds: stage, patch: false });
    }
    label(ctx, STEPS[state.step - 1], W * 0.5, H * 0.06, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Induction, step by step' },
    { key: 'step', label: 'Step', min: 1, max: 4, step: 1, format: (v) => `${v}: ${STEPS[v - 1]}` },
    { key: 'rod', label: 'Rod charge', options: [[1, '+ rod'], [-1, '− rod']] },
    { readout: [
      ['Mobile electrons', (s) => electrons(s)],
      ['Positive cores', () => '8'],
      ['Net charge on sphere', (s) => `${extra(s) === 0 ? '0' : (extra(s) > 0 ? '+' : '−') + Math.abs(extra(s))} e`],
    ] },
  ],
  tex: (s) => `q_{sphere}=\\left(\\text{cores}-\\text{electrons}\\right)e=(8-${electrons(s)})e=${8 - electrons(s)}\\,e`,
});
