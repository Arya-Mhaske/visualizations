import { createTool } from '../../lib/tool.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { mark } from './_charge.js';

// A neutral hollow shell. A + charge is placed outside it or inside its cavity. Probe A is inside the cavity, away from the charge; probe B is outside.
const state = { where: 'out', earth: false };
const inner = (s) => (s.where === 'in' ? 1 : 0); // field at probe A: 1 = present, 0 = none
const outer = (s) => (s.where === 'out' ? 1 : s.earth ? 0 : 1);

createTool({
  state,
  label: 'A hollow metal shell with a positive charge either outside it or inside its cavity. Induced charges appear on the metal surfaces. Two probe points show the field inside the cavity and outside the shell. A charge outside gives no field in the cavity. A charge inside gives a field outside, unless the shell is earthed.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [cx, cy, R, r] = [W * 0.5, H * 0.5, Math.min(W, H) * 0.3, Math.min(W, H) * 0.17];
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = c.fillY; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = c.paper; ctx.fill();
    ctx.strokeStyle = c.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    const q = state.where === 'in' ? [cx - r * 0.3, cy] : [cx - R - 50, cy];
    dot(ctx, q[0], q[1], 10, c.a, c.ink);
    if (state.where === 'in') {
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; mark(ctx, cx + Math.cos(a) * (r + 8), cy + Math.sin(a) * (r + 8), -1, c, 5); }
      if (!state.earth) for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; mark(ctx, cx + Math.cos(a) * (R + 8), cy + Math.sin(a) * (R + 8), 1, c, 5); }
    } else {
      for (let k = 0; k < 4; k++) { mark(ctx, cx - R - 8 + 0, cy - 12 + k * 8, -1, c, 4); mark(ctx, cx + R + 8, cy - 12 + k * 8, 1, c, 4); }
    }
    const probe = (x, y, on, name) => {
      dot(ctx, x, y, 5, c.c, c.ink, 2);
      if (on) arrow(ctx, x, y, x + 36, y, { color: c.ink, width: 3, head: 8 });
      label(ctx, `${name}: ${on ? 'field' : 'no field'}`, x, y + (name === 'A' ? 16 : -14), c, { size: 11, bounds: stage, patch: false });
    };
    probe(cx + r * 0.45, cy - r * 0.2, !!inner(state), 'A');
    probe(cx + R + 20, cy - R * 0.5, !!outer(state), 'B');
  },
  controls: [
    { title: 'Place a charge' },
    { key: 'where', label: 'Positive charge is', options: [['out', 'Outside the shell'], ['in', 'Inside the cavity']] },
    { key: 'earth', label: 'Earth the shell', toggle: true },
    { readout: [
      ['Field in cavity (A)', (s) => (inner(s) ? 'yes' : 'none: shielded')],
      ['Field outside (B)', (s) => (outer(s) ? 'yes' : 'none: shielded')],
    ] },
  ],
});
