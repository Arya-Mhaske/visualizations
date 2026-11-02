import { createTool } from '../../lib/tool.js';
import { arrow, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { NUCLIDES, nuclide, partsMass, massDefect, bindingMeV, U_MEV } from './_nucleus.js';
import { bar } from './_mp-view.js';

// Two bars: the free protons and neutrons, and the nucleus. The scale starts at a floor that rises as you magnify,
// so the gap Δm (tiny against the whole mass) grows until it can be seen.
const state = { key: 'He4', lz: 2 };
const dispFor = (n, z) => {
  const parts = partsMass(n);
  const W = Math.max(parts / 10 ** z, 1.6 * massDefect(n));
  return { lo: parts - W, hi: parts + 0.12 * W, W };
};

const tool = createTool({
  state,
  label: 'Two bars. The left bar is the mass of the separate protons and neutrons, the right bar is the mass of the nucleus built from them. Magnify the scale and the right bar is seen to be shorter, with a bracket showing the missing mass.',
  draw(ctx, stage, c) {
    const n = nuclide(state.key);
    const { lo, hi } = dispFor(n, state.lz);
    const top = 40;
    const bottom = stage.h - 30;
    const rect = (x) => ({ x, y: top, w: stage.w * 0.2, h: bottom - top });
    const barOf = (m, x, fill) => {
      const r = rect(x);
      const frac = (m - lo) / (hi - lo);
      bar(ctx, c, r, frac, 1, fill);
      return r.y + r.h - r.h * frac;
    };
    const x1 = stage.w * 0.18;
    const x2 = stage.w * 0.58;
    const yp = barOf(partsMass(n), x1, c.fillB);
    const yn = barOf(n.M, x2, c.fillA);
    label(ctx, 'free parts', x1 + stage.w * 0.1, bottom + 14, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'the nucleus', x2 + stage.w * 0.1, bottom + 14, c, { size: 11, bounds: stage, patch: false });
    line(ctx, x1 + stage.w * 0.2, yp, x2 + stage.w * 0.2 + 12, yp, { color: c.ink, width: 2, dash: [5, 4] });
    if (yn - yp > 4) {
      const xm = x2 + stage.w * 0.2 + 12;
      arrow(ctx, xm, yp, xm, yn, { color: c.a, width: 3, head: 8 });
      label(ctx, 'Δm', xm + 16, (yp + yn) / 2, c, { size: 12, align: 'left', bounds: stage });
    }
    label(ctx, `scale shows ${sig(hi - lo, 2)} u`, stage.w / 2, 16, c, { size: 10, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Weigh a nucleus' },
    { key: 'key', label: 'Nucleus', options: NUCLIDES.filter((n) => ['H2', 'He4', 'C12', 'Fe56', 'U235'].includes(n.key)).map((n) => [n.key, n.name]) },
    { key: 'lz', label: 'Magnify the gap', min: 0, max: 5, step: 0.1, format: (v) => `×${sig(10 ** v, 2)}` },
    { readout: [
      ['Mass of the parts', (s) => `${fixed(partsMass(nuclide(s.key)), 5)} u`],
      ['Mass of the nucleus', (s) => `${fixed(nuclide(s.key).M, 5)} u`],
      ['Mass defect Δm', (s) => `${fixed(massDefect(nuclide(s.key)), 5)} u`],
      ['Energy Δm c²', (s) => `${fixed(bindingMeV(nuclide(s.key)), 1)} MeV`],
    ] },
  ],
  tex: (s) => { const n = nuclide(s.key); return `\\Delta E=\\Delta m\\times${U_MEV}=${fixed(massDefect(n), 5)}\\times${U_MEV}=${fixed(bindingMeV(n), 1)}\\ \\text{MeV}`; },
});

tool.update();
