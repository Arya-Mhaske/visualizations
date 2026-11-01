import { createTool } from '../../lib/tool.js';
import { line, label, dot } from '../../lib/draw.js';
import { resistor } from '../../lib/circuit.js';
import { fixed, sig } from '../../lib/format.js';
import { shunt, seriesR, ammeterResistance, voltmeterResistance } from './_loops-meters-math.js';

const state = { kind: 'ammeter', G: 50, Ig: 2, range: 1 };
const Ig = (s) => s.Ig / 1000;
const extra = (s) => (s.kind === 'ammeter' ? shunt(s.G, Ig(s), s.range) : seriesR(s.G, Ig(s), s.range));
const total = (s) => (s.kind === 'ammeter' ? ammeterResistance(s.G, extra(s)) : voltmeterResistance(s.G, extra(s)));
const unit = (s) => (s.kind === 'ammeter' ? 'A' : 'V');
const valid = (s) => extra(s) > 0 && Number.isFinite(extra(s));

const tool = createTool({
  state,
  label: 'A circuit sketch of the converted meter. For an ammeter, the galvanometer coil has a small shunt resistor in parallel. For a voltmeter, the coil has a large resistor in series. The resistances are written beside each part.',
  draw(ctx, stage, c) {
    const x0 = 24;
    const x1 = stage.w - 24;
    const mid = stage.h / 2;
    const ink = { color: c.ink };
    if (state.kind === 'ammeter') {
      const top = mid - stage.h * 0.2;
      const bottom = mid + stage.h * 0.2;
      const a = stage.w * 0.28;
      const b = stage.w * 0.72;
      line(ctx, x0, mid, a, mid, ink);
      line(ctx, a, top, a, bottom, ink);
      line(ctx, b, top, b, bottom, ink);
      line(ctx, b, mid, x1, mid, ink);
      resistor(ctx, a, top, b, top, { color: c.a });
      resistor(ctx, a, bottom, b, bottom, { color: c.b });
      dot(ctx, a, mid, 5, c.ink, c.ink, 1);
      dot(ctx, b, mid, 5, c.ink, c.ink, 1);
      label(ctx, `Coil G = ${sig(state.G, 3)} Ω`, (a + b) / 2, top - 22, c, { color: c.a, size: 12 });
      label(ctx, valid(state) ? `Shunt S = ${sig(extra(state), 3)} Ω` : 'range too small', (a + b) / 2, bottom + 24, c, { color: c.b, size: 12 });
      label(ctx, `${sig(state.range, 3)} A in`, x0 + 34, mid - 14, c, { color: c.ink, size: 11 });
      label(ctx, `${sig(state.Ig, 3)} mA`, (a + b) / 2, top + 24, c, { color: c.a, size: 11 });
    } else {
      const a = stage.w * 0.36;
      const b = stage.w * 0.64;
      line(ctx, x0, mid, x1, mid, ink);
      resistor(ctx, x0 + 10, mid, a, mid, { color: c.b });
      resistor(ctx, b - 10, mid, x1 - 10, mid, { color: c.a });
      label(ctx, valid(state) ? `Series R = ${sig(extra(state), 3)} Ω` : 'range too small', (x0 + a) / 2 + 20, mid - 30, c, { color: c.b, size: 12 });
      label(ctx, `Coil G = ${sig(state.G, 3)} Ω`, (b + x1) / 2, mid - 30, c, { color: c.a, size: 12 });
      label(ctx, `${sig(state.range, 3)} V across both`, stage.w / 2, mid + 50, c, { color: c.ink, size: 11 });
    }
    label(ctx, `The meter itself: ${valid(state) ? sig(total(state), 3) : '—'} Ω`, stage.w / 2, stage.h - 20, c, { color: c.ink, size: 12 });
  },
  controls: () => [
    { title: 'Convert the galvanometer' },
    { key: 'kind', label: 'Make a', options: [['ammeter', 'Ammeter'], ['voltmeter', 'Voltmeter']] },
    { key: 'G', label: 'Coil resistance, G', min: 10, max: 200, step: 5, format: (n) => `${n} Ω` },
    { key: 'Ig', label: 'Full-scale current, Iɡ', min: 0.5, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} mA` },
    { key: 'range', label: 'Range wanted', min: 0.5, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} ${unit(state)}` },
    { readout: [
      ['Added resistor', (s) => (valid(s) ? `${sig(extra(s), 4)} Ω` : 'range too small')],
      ['Resistance of the meter', (s) => (valid(s) ? `${sig(total(s), 3)} Ω` : '—')],
    ] },
  ],
  tex: (s) => (s.kind === 'ammeter'
    ? `S=\\dfrac{I_gG}{I-I_g}=\\dfrac{(${fixed(s.Ig / 1000, 4)})(${s.G})}{${fixed(s.range, 1)}-${fixed(s.Ig / 1000, 4)}}=${valid(s) ? sig(extra(s), 4) : '?'}\\ \\Omega`
    : `R=\\dfrac{V}{I_g}-G=\\dfrac{${fixed(s.range, 1)}}{${fixed(s.Ig / 1000, 4)}}-${s.G}=${valid(s) ? sig(extra(s), 4) : '?'}\\ \\Omega`),
});
tool.update();
