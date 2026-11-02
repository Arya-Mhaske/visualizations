import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const SH = { rod: ['Rod', 0], ring: ['Ring', 0], disc: ['Disc', 0], halfring: ['Semicircular wire', 2 / Math.PI], halfdisc: ['Semicircular plate', 4 / (3 * Math.PI)] };
const state = { s: 'ring' };

createTool({
  state,
  label: 'A shape drawn with a dot at its centre of mass. For a ring the dot sits in the empty middle, and for a semicircular wire it floats above the centre.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w / 2, stage.h * 0.55, Math.min(stage.w, stage.h) * 0.3];
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.fillStyle = c.fillB;
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (state.s === 'rod') { ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke(); }
    else if (state.s === 'ring') { ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); }
    else if (state.s === 'disc') { ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 3; ctx.stroke(); }
    else if (state.s === 'halfring') { ctx.arc(cx, cy, R, Math.PI, 0); ctx.stroke(); }
    else { ctx.arc(cx, cy, R, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 3; ctx.stroke(); }
    ctx.restore();
    const off = SH[state.s][1] * R;
    line(ctx, cx, cy, cx, cy - off, { color: c.grid, width: 1, dash: [3, 3] });
    dot(ctx, cx, cy - off, 8, c.a, c.ink);
    label(ctx, `${SH[state.s][0]}: centre of mass ${fixed(SH[state.s][1], 3)} R from the centre`, stage.w / 2, 20, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'A shape' },
    { key: 's', label: 'Shape', options: Object.entries(SH).map(([k, v]) => [k, v[0]]) },
    { readout: [
      ['Offset from the centre', (s) => `${fixed(SH[s.s][1], 3)} R`],
      ['On the material?', (s) => (s.s === 'rod' || s.s === 'disc' ? 'yes' : s.s === 'halfdisc' ? 'yes' : 'no: empty space')],
    ] },
  ],
  tex: (s) => (s.s === 'halfring' ? '\\bar y=\\dfrac{2R}{\\pi}' : s.s === 'halfdisc' ? '\\bar y=\\dfrac{4R}{3\\pi}' : '\\bar y=0\\ \\text{(by symmetry)}'),
});
