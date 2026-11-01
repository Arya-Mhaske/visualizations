import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// Sizes in metres, rounded. Each is a typical value, not an exact one.
const THINGS = [
  ['proton', 1e-15], ['atom', 1e-10], ['virus', 1e-7], ['human cell', 1e-5], ['ant', 5e-3], ['person', 1.7], ['Mount Everest', 8.8e3],
  ['Earth', 1.27e7], ['Sun', 1.39e9], ['Earth to Sun', 1.5e11], ['one light-year', 9.46e15], ['Milky Way', 9.5e20], ['observable universe', 8.8e26],
];
const state = { centre: 0 };
const sup = (n) => String(n).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);

createTool({
  state,
  label: 'A scale of lengths from the size of a proton to the size of the observable universe, in metres. Each step along the scale is a factor of ten. A window of five powers of ten is shown at a time. Slide the window to see which familiar objects fall inside it and how many tens separate them.',
  draw(ctx, stage, c) {
    const lo = state.centre - 3;
    const hi = state.centre + 3;
    const y = stage.h * 0.72;
    const px = (e) => 24 + ((e - lo) / (hi - lo)) * (stage.w - 48);
    line(ctx, 14, y, stage.w - 14, y, { color: c.ink, width: 3 });
    for (let e = Math.ceil(lo); e <= hi; e++) {
      line(ctx, px(e), y - 7, px(e), y + 7, { color: c.ink, width: 2 });
      label(ctx, `10${sup(e)}`, px(e), y + 22, c, { size: 10, bounds: stage, patch: false });
    }
    let lane = 0;
    THINGS.forEach(([name, size]) => {
      const e = Math.log10(size);
      if (e < lo - 0.2 || e > hi + 0.2) return;
      dot(ctx, px(e), y, 7, c.a, c.ink);
      label(ctx, name, px(e), y - 22 - (lane++ % 3) * 20, c, { size: 11, bounds: stage, patch: false });
    });
    label(ctx, 'metres', stage.w - 18, y + 40, c, { size: 10, align: 'right', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Slide the window' },
    { key: 'centre', label: 'Centre of the window, 10ˣ m', min: -14, max: 25, step: 1, format: (v) => `10${sup(v)}` },
    { readout: [
      ['Window', (s) => `10${sup(s.centre - 3)} m to 10${sup(s.centre + 3)} m`],
      ['In the window', (s) => THINGS.filter(([, size]) => Math.abs(Math.log10(size) - s.centre) <= 3.2).map(([n]) => n).join(', ') || 'nothing familiar'],
    ] },
  ],
  tex: (s) => `\\text{each tick is}\\times10:\\ 10^{${s.centre - 3}}\\to10^{${s.centre + 3}}\\ \\text{is a factor of}\\ 10^{6}`,
});
