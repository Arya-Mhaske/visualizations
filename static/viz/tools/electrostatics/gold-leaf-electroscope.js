import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';

// Rod charge q (units). Steps: 1 rod far, 2 rod near cap, 3 rod touches cap, 4 rod removed, 5 a + test rod brought near.
const STEPS = ['Rod far away', 'Rod near the cap', 'Rod touches the cap', 'Rod taken away', 'A + test rod brought near'];
const state = { step: 3, q: 3 };
// Charge on the leaves, signed. Near: the leaves get the rod's sign (cap gets the opposite). Touch and after: shared charge stays.
const leafCharge = (s) => {
  const shared = 0.6 * s.q;
  return [0, 0.5 * s.q, shared, shared, shared + 0.8][s.step - 1];
};
const angle = (s) => Math.min(70, 16 * Math.abs(leafCharge(s)));

createTool({
  state,
  label: 'A gold-leaf electroscope: a metal cap, a rod, and two thin leaves that hang together when uncharged. When the leaves carry like charge they repel and spread apart. The step control moves through a charged rod being brought near, touching, taken away, and then a test rod showing the sign.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [cx, top, bot] = [W * 0.6, H * 0.28, H * 0.55];
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - W * 0.18, H * 0.2, W * 0.36, H * 0.7);
    line(ctx, cx, top, cx, bot, { color: c.ink, width: 5 });
    ctx.beginPath();
    ctx.arc(cx, top - 8, 14, 0, Math.PI * 2);
    ctx.fillStyle = c.fillY;
    ctx.fill();
    ctx.stroke();
    const a = (angle(state) * Math.PI) / 180;
    const len = H * 0.26;
    for (const side of [-1, 1]) line(ctx, cx, bot, cx + side * Math.sin(a) * len, bot + Math.cos(a) * len, { color: c.a, width: 6 });
    const rodX = state.step === 1 ? W * 0.14 : state.step === 4 ? -99 : state.step === 3 ? cx - 30 : W * 0.3;
    if (rodX > 0) {
      const sign = state.step === 5 ? 1 : Math.sign(state.q) || 1;
      ctx.fillStyle = sign > 0 ? c.fillA : c.fillB;
      ctx.fillRect(rodX - W * 0.2, H * 0.08, W * 0.2, 20);
      ctx.strokeRect(rodX - W * 0.2, H * 0.08, W * 0.2, 20);
      label(ctx, sign > 0 ? '+' : '−', rodX - W * 0.1, H * 0.08 + 10, c, { size: 13, bounds: stage, patch: false });
    }
    label(ctx, `leaves open ${Math.round(angle(state))}°`, cx, H * 0.95, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Charge the electroscope' },
    { key: 'step', label: 'Step', min: 1, max: 5, step: 1, format: (v) => `${v}: ${STEPS[v - 1]}` },
    { key: 'q', label: 'Rod charge (− to +)', min: -5, max: 5, step: 1 },
    { readout: [
      ['Leaf charge', (s) => leafCharge(s).toFixed(1)],
      ['Leaf angle', (s) => `${Math.round(angle(s))}°`],
      ['Stays charged after?', (s) => (s.step >= 3 ? 'yes: charge was shared' : 'no: only induced')],
    ] },
  ],
  tex: (s) => `\\text{angle}\\ \\propto\\ |q_{leaves}|=${Math.abs(leafCharge(s)).toFixed(1)}`,
});
