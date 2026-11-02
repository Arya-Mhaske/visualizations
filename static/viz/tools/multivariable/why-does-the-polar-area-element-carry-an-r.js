import { createTool } from '../../lib/tool.js';
import { wedge, label } from '../../lib/draw.js';

// A polar rectangle has radial width Δr and angular width Δθ. Its sides are NOT equal: the arc at radius r has length r Δθ.
// Its area is about r Δr Δθ, so the same Δr Δθ covers more ground further out. Adding all the pieces gives the whole disk.
const state = { rings: 5, sectors: 12, pick: 4 };
const R = 1;
const cellArea = (s, k) => { const dr = R / s.rings; const dth = (2 * Math.PI) / s.sectors; return 0.5 * ((((k + 1) * dr) ** 2) - ((k * dr) ** 2)) * dth; };
const approx = (s, k) => { const dr = R / s.rings; const dth = (2 * Math.PI) / s.sectors; return (k + 0.5) * dr * dr * dth; };

createTool({
  state,
  label: 'A disk cut into polar rectangles by rings and rays. Every cell has the same radial width and the same angle, yet the cells further out are visibly bigger. One cell near the centre is blue and one in the chosen ring is coral, to compare their areas.',
  draw(ctx, stage, c) {
    const [cx, cy, r] = [stage.w / 2, stage.h / 2, Math.min(stage.w, stage.h) * 0.45];
    const pick = Math.min(state.pick, state.rings - 1);
    for (let k = 0; k < state.rings; k++) for (let j = 0; j < state.sectors; j++) {
      const a0 = (j * 2 * Math.PI) / state.sectors;
      const a1 = ((j + 1) * 2 * Math.PI) / state.sectors;
      const inner = (k * r) / state.rings;
      const outer = ((k + 1) * r) / state.rings;
      const mark = j === 0 && (k === pick || k === 0);
      ctx.beginPath();
      ctx.arc(cx, cy, outer, a0, a1);
      ctx.arc(cx, cy, inner, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = mark ? (k === 0 ? c.fillB : c.fillA) : c.paper;
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = mark ? 3 : 1.2;
      ctx.stroke();
    }
    void wedge;
    label(ctx, `blue cell: ${cellArea(state, 0).toFixed(4)}   coral cell: ${cellArea(state, pick).toFixed(4)}`, stage.w / 2, 14, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Cut the disk' },
    { key: 'rings', label: 'Rings', min: 2, max: 12, step: 1 },
    { key: 'sectors', label: 'Sectors', min: 4, max: 32, step: 1 },
    { key: 'pick', label: 'Compare with ring number', min: 0, max: 11, step: 1, format: (v) => String(Math.min(v, state.rings - 1) + 1) },
    { readout: [
      ['Δr and Δθ', (s) => `${(R / s.rings).toFixed(3)}, ${((2 * Math.PI) / s.sectors).toFixed(3)} rad`],
      ['Area, ring 1 cell', (s) => cellArea(s, 0).toFixed(5)],
      ['Area, chosen cell', (s) => cellArea(s, Math.min(s.pick, s.rings - 1)).toFixed(5)],
      ['r Δr Δθ at its middle', (s) => approx(s, Math.min(s.pick, s.rings - 1)).toFixed(5)],
      ['All cells added', (s) => [...Array(s.rings).keys()].reduce((t, k) => t + cellArea(s, k) * s.sectors, 0).toFixed(5)],
    ] },
  ],
  tex: () => 'dA=r\\,dr\\,d\\theta,\\qquad \\text{disk}=\\int_0^{2\\pi}\\!\\!\\int_0^1 r\\,dr\\,d\\theta=\\pi',
});
