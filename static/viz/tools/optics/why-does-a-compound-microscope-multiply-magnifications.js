import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { microscope } from './_instruments-math.js';

const state = { fo: 1, fe: 4, L: 16, near: false };
const calc = (s) => microscope({ fo: s.fo, fe: s.fe, L: s.L, atNear: s.near });

const tool = createTool({
  state,
  label: 'Three arrows of increasing height. The first is the object. The second is the real image made by the objective, which is m_o times bigger. The third is the final image made by the eyepiece, which is bigger again by M_e. The heights are on a log scale so the product shows as a sum of steps.',
  draw(ctx, stage, c) {
    const r = calc(state);
    if (!r) {
      label(ctx, 'No real image: lengthen the tube', stage.w / 2, stage.h / 2, c, { color: c.ink, size: 14 });
      return;
    }
    const sizes = [1, r.mo, r.M];
    const names = ['object', 'image from the objective', 'final image'];
    const top = Math.log10(Math.max(...sizes, 10)) + 0.15;
    const base = stage.h - 40;
    const room = base - 20;
    const w = (stage.w - 40) / 3;
    sizes.forEach((s, k) => {
      const h = Math.max(4, (Math.log10(s) / top) * room + 6);
      const x = 20 + k * w;
      ctx.fillStyle = [c.fillY, c.fillB, c.fillA][k];
      ctx.fillRect(x + 8, base - h, w - 16, h);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 8, base - h, w - 16, h);
      label(ctx, `× ${sig(s, 3)}`, x + w / 2, base - h - 12, c, { color: c.ink, size: 12 });
      label(ctx, names[k], x + w / 2, base + 18, c, { color: c.ink, size: 10, bounds: stage });
    });
  },
  controls: () => [
    { title: 'Two lenses' },
    { key: 'fo', label: 'Objective, f₀', min: 0.5, max: 2, step: 0.1, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'fe', label: 'Eyepiece, fₑ', min: 2, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'L', label: 'Distance between lenses', min: 8, max: 30, step: 1, format: (n) => `${n} cm` },
    { key: 'near', label: 'Final image at the near point (not infinity)', toggle: true },
    { readout: [
      ['Objective, m₀', (s) => { const r = calc(s); return r ? sig(r.mo, 3) : '—'; }],
      ['Eyepiece, Mₑ', (s) => { const r = calc(s); return r ? sig(r.me, 3) : '—'; }],
      ['Total, m₀ × Mₑ', (s) => { const r = calc(s); return r ? sig(r.M, 3) : '—'; }],
    ] },
  ],
  tex: (s) => { const r = calc(s); return r ? `M=m_o\\times M_e=${sig(r.mo, 3)}\\times ${sig(r.me, 3)}=${sig(r.M, 3)}` : 'M=\\text{no real image}'; },
});
tool.update();
