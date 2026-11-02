import { createTool } from '../../lib/tool.js';
import { line, arrow, poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { youngCos } from './_surface-tension-math.js';

const PAIRS = { glass: ['Water on glass', 8], wax: ['Water on wax', 107], mercury: ['Mercury on glass', 138] };
const state = { pair: 'glass', th: 8 };
let tool;
let [lastPair, lastTh] = ['glass', 8];
const rad = (d) => (d * Math.PI) / 180;

tool = createTool({
  state,
  label: 'A liquid drop on a flat surface. A small drop with an acute contact angle spreads out, and a drop with an obtuse angle stands up like a bead. Arrows at the edge show the three surface tensions.',
  draw(ctx, stage, c) {
    const th = rad(state.th);
    const yL = stage.h * 0.62;
    const A0 = (stage.w * 0.2) ** 2;
    const R = Math.sqrt(A0 / (th - Math.sin(th) * Math.cos(th)));
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const phi = -th + (2 * th * i) / 60;
      pts.push([stage.w / 2 + R * Math.sin(phi), yL - (R * Math.cos(phi) - R * Math.cos(th))]);
    }
    poly(ctx, [[0, yL], [stage.w, yL], [stage.w, stage.h], [0, stage.h]], { fill: c.fillA, stroke: c.ink });
    poly(ctx, pts, { fill: c.fillB, stroke: c.ink });
    const [ex, ey] = [Math.min(stage.w - 30, stage.w / 2 + R * Math.sin(th)), yL];
    const Slg = 56;
    const Ssl = 36;
    const Ssg = Ssl + Slg * youngCos(state.th);
    arrow(ctx, ex, ey - 2, ex + Ssg * 0.8, ey - 2, { color: c.c, width: 3 });
    arrow(ctx, ex, ey - 2, ex - Ssl * 0.8, ey - 2, { color: c.b, width: 3 });
    arrow(ctx, ex, ey - 2, ex - Slg * 0.8 * Math.cos(th), ey - 2 - Slg * 0.8 * Math.sin(th), { color: c.a, width: 3 });
    label(ctx, 'S_sg', ex + Math.max(Ssg, 8) * 0.8 - 4, ey + 16, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'S_sl', ex - Ssl * 0.8 - 10, ey + 16, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'S_lg', ex - Slg * 0.8 * Math.cos(th) - 14, ey - 8 - Slg * 0.8 * Math.sin(th), c, { size: 11, bounds: stage, patch: false });
    label(ctx, `θ = ${state.th}°`, stage.w / 2, 24, c, { size: 14, bounds: stage, patch: false });
    label(ctx, state.th < 90 ? 'wets the surface' : 'beads up', stage.w / 2, 46, c, { size: 12, bounds: stage, patch: false });
    line(ctx, 0, yL, stage.w, yL, { color: c.ink, width: 3 });
  },
  controls: [
    { title: 'Choose the pair' },
    { key: 'pair', label: 'Liquid and solid', options: [...Object.entries(PAIRS).map(([k, v]) => [k, v[0]]), ['custom', 'Custom']] },
    { key: 'th', label: 'Angle of contact θ (°)', min: 5, max: 175, step: 1 },
    { readout: [
      ['cos θ', (s) => fixed(youngCos(s.th), 2)],
      ['(S_sg − S_sl) / S_lg', (s) => fixed(youngCos(s.th), 2)],
      ['Wets?', (s) => ({ text: s.th < 90 ? 'yes' : 'no', good: s.th < 90 })],
    ] },
  ],
  tex: (s) => `S_{sg}=S_{sl}+S_{lg}\\cos\\theta\\ \\Rightarrow\\ \\cos\\theta=${fixed(youngCos(s.th), 2)}\\ (\\theta=${s.th}^\\circ)`,
  onChange: (s) => {
    if (s.pair !== lastPair && s.pair !== 'custom') s.th = PAIRS[s.pair][1];
    else if (s.th !== lastTh) s.pair = 'custom';
    [lastPair, lastTh] = [s.pair, s.th];
    tool?.ui.refresh();
  },
});
