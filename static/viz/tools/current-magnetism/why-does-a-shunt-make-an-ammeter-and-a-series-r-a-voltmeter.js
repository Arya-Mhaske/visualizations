import { createTool } from '../../lib/tool.js';
import { arc, arrow, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { G_COIL, I_FULL, shunt, seriesR } from './_loops-meters-math.js';

const state = { kind: 'ammeter', fit: true, range: 1, x: 0.6 };
// range: A for the ammeter, V for the voltmeter. x: the amount really being measured.
const unit = (s) => (s.kind === 'ammeter' ? 'A' : 'V');
const extra = (s) => (s.kind === 'ammeter' ? shunt(G_COIL, I_FULL, s.range) : seriesR(G_COIL, I_FULL, s.range));
// current through the coil
function coilCurrent(s) {
  if (s.kind === 'ammeter') {
    if (!s.fit) return s.x; // the whole current goes through the coil
    const S = extra(s);
    return (s.x * S) / (S + G_COIL);
  }
  if (!s.fit) return s.x / G_COIL;
  return s.x / (G_COIL + extra(s));
}
const frac = (s) => coilCurrent(s) / I_FULL;

const tool = createTool({
  state,
  label: 'A meter dial with a needle, and below it two bars showing how the measured current or voltage splits between the coil and the added resistor. The needle sits at full scale when the coil carries two milliamps.',
  draw(ctx, stage, c) {
    const cx = stage.w / 2;
    const cy = stage.h * 0.5;
    const R = Math.min(stage.w * 0.4, stage.h * 0.42);
    arc(ctx, cx, cy, R, Math.PI, 2 * Math.PI, { color: c.ink, width: 3 });
    line(ctx, cx - R, cy, cx + R, cy, { color: c.ink });
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI + (i / 10) * Math.PI;
      line(ctx, cx + Math.cos(a) * R * 0.88, cy + Math.sin(a) * R * 0.88, cx + Math.cos(a) * R, cy + Math.sin(a) * R, { color: c.ink, width: 2 });
    }
    label(ctx, 'full scale', cx + R * 0.78, cy - 8, c, { color: c.grid, size: 10, patch: false });
    const f = Math.min(frac(state), 1.08);
    const a = Math.PI + Math.min(f, 1.08) * Math.PI;
    arrow(ctx, cx, cy, cx + Math.cos(a) * R * 0.85, cy + Math.sin(a) * R * 0.85, { color: frac(state) > 1.0001 ? c.a : c.b, width: 5, head: 12 });
    label(ctx, frac(state) > 1.0001 ? 'OFF SCALE' : `${fixed(frac(state) * 100, 0)}% of full scale`, cx, cy + 22, c, { color: c.ink, size: 12 });
    // split bars: how the quantity is shared
    const barY = cy + 56;
    const w = stage.w - 40;
    const coilShare = state.kind === 'ammeter'
      ? Math.min(1, coilCurrent(state) / Math.max(state.x, 1e-9))
      : Math.min(1, G_COIL / (G_COIL + (state.fit ? extra(state) : 0)));
    ctx.lineWidth = 3;
    ctx.strokeStyle = c.ink;
    ctx.fillStyle = c.a;
    ctx.fillRect(20, barY, w * coilShare, 28);
    ctx.fillStyle = c.b;
    ctx.fillRect(20 + w * coilShare, barY, w * (1 - coilShare), 28);
    ctx.strokeRect(20, barY, w, 28);
    label(ctx, `coil: ${fixed(coilShare * 100, 2)}%`, 20 + w * coilShare / 2, barY + 46, c, { color: c.a, size: 11, bounds: [0, stage.w] });
    if (coilShare < 0.97) label(ctx, `${state.kind === 'ammeter' ? 'shunt' : 'series R'}: ${fixed((1 - coilShare) * 100, 2)}%`, 20 + w * (coilShare + (1 - coilShare) / 2), barY + 46, c, { color: c.b, size: 11, bounds: [0, stage.w] });
    label(ctx, state.kind === 'ammeter' ? 'How the current divides' : 'How the voltage divides', stage.w / 2, barY - 14, c, { color: c.ink, size: 11 });
  },
  controls: () => [
    { title: 'Coil: 50 Ω, full scale 2 mA' },
    { key: 'kind', label: 'Meter', options: [['ammeter', 'Ammeter'], ['voltmeter', 'Voltmeter']] },
    { key: 'fit', label: 'Fit the shunt or series resistor', toggle: true },
    { key: 'range', label: 'Range wanted', min: 0.5, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} ${unit(state)}` },
    { key: 'x', label: 'Quantity measured', min: 0, max: 5, step: 0.1, format: (n) => `${fixed(n, 1)} ${unit(state)}` },
    { readout: [
      ['Added resistance', (s) => (s.fit ? `${sig(extra(s), 3)} Ω` : 'none')],
      ['Current in the coil', (s) => `${sig(coilCurrent(s) * 1000, 3)} mA`],
      ['Needle', (s) => (frac(s) > 1.0001 ? { text: 'off scale: coil burns', good: false } : { text: `${fixed(frac(s) * 100, 0)}% of full scale`, good: true })],
    ] },
  ],
  tex: (s) => (s.kind === 'ammeter'
    ? `S=\\dfrac{I_gG}{I-I_g}=${sig(extra(s), 3)}\\ \\Omega`
    : `R=\\dfrac{V}{I_g}-G=${sig(extra(s), 3)}\\ \\Omega`),
});
tool.update();
