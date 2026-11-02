import { createTool } from '../../lib/tool.js';
import { line, poly, arrow, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { LIQUIDS, capRise, G } from './_surface-tension-math.js';

const state = { liq: 'water', r: 0.5 };
const L = (s) => LIQUIDS[s.liq];
const rise = (s) => capRise(L(s)[1], L(s)[3], L(s)[2], s.r / 1000) * 1000; // mm
const pull = (s) => L(s)[1] * Math.cos((L(s)[3] * Math.PI) / 180) * 2 * Math.PI * (s.r / 1000);
const wgt = (s) => Math.PI * (s.r / 1000) ** 2 * (rise(s) / 1000) * L(s)[2] * G;

createTool({
  state,
  label: 'A thin glass tube dipped in a beaker of liquid. Water climbs inside the tube above the beaker level, and mercury is pushed below it. Arrows show the pull of the surface and the weight of the column.',
  draw(ctx, stage, c) {
    const lvl = stage.h * 0.62;
    const px = stage.h * 0.0045; // pixels per mm of rise
    const half = 6 + state.r * 10;
    const cx = stage.w * 0.4;
    const h = Math.max(-stage.h * 0.2, Math.min(stage.h * 0.5, rise(state) * px));
    poly(ctx, [[10, lvl], [stage.w - 10, lvl], [stage.w - 10, stage.h - 8], [10, stage.h - 8]], { fill: c.fillB, stroke: c.ink });
    const top = lvl - h;
    if (top > lvl) poly(ctx, [[cx - half, lvl], [cx + half, lvl], [cx + half, top], [cx - half, top]], { fill: c.paper });
    poly(ctx, [[cx - half, top], [cx + half, top], [cx + half, lvl + stage.h * 0.2], [cx - half, lvl + stage.h * 0.2]], { fill: c.fillB });
    line(ctx, cx - half, 10, cx - half, lvl + stage.h * 0.2, { color: c.ink, width: 3 });
    line(ctx, cx + half, 10, cx + half, lvl + stage.h * 0.2, { color: c.ink, width: 3 });
    arrow(ctx, cx + half + 24, top, cx + half + 24, top - Math.sign(h || 1) * 36, { color: c.c, width: 3 });
    arrow(ctx, cx + half + 50, (top + lvl) / 2, cx + half + 50, (top + lvl) / 2 + Math.sign(h || 1) * 36, { color: c.a, width: 3 });
    label(ctx, 'pull', cx + half + 24, top - 46, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'weight', cx + half + 58, (top + lvl) / 2 + 48, c, { size: 11, bounds: stage, patch: false });
    line(ctx, 10, lvl, stage.w - 10, lvl, { color: c.ink, width: 2, dash: [5, 4] });
    label(ctx, `h = ${sig(rise(state), 3)} mm`, stage.w * 0.75, stage.h * 0.18, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Dip a tube' },
    { key: 'liq', label: 'Liquid', options: [['water', 'Water'], ['mercury', 'Mercury']] },
    { key: 'r', label: 'Tube radius r (mm)', min: 0.1, max: 2, step: 0.1 },
    { readout: [
      ['θ', (s) => `${L(s)[3]}°`],
      ['Rise h', (s) => `${sig(rise(s), 3)} mm`],
      ['Upward pull', (s) => `${sig(pull(s) * 1000, 3)} mN`],
      ['Weight of column', (s) => `${sig(wgt(s) * 1000, 3)} mN`],
    ] },
  ],
  tex: (s) => `h=\\dfrac{2S\\cos\\theta}{\\rho g r}=${sig(rise(s), 3)}\\ \\mathrm{mm}`,
});
