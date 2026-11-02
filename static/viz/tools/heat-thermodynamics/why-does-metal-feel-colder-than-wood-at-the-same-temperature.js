import { createTool } from '../../lib/tool.js';
import { line, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Effusivity e = sqrt(k rho c). Two bodies touching: contact temperature = (e1 T1 + e2 T2)/(e1 + e2).
const SKIN = { name: 'hand', k: 0.37, rho: 1100, c: 3400 };
const THINGS = [
  { name: 'Wood', k: 0.12, rho: 600, c: 1700 },
  { name: 'Plastic', k: 0.2, rho: 1200, c: 1500 },
  { name: 'Glass', k: 1.0, rho: 2500, c: 840 },
  { name: 'Steel', k: 50, rho: 7800, c: 490 },
  { name: 'Aluminium', k: 237, rho: 2700, c: 900 },
];
const eff = (m) => Math.sqrt(m.k * m.rho * m.c);
const contact = (m, th, to) => (eff(SKIN) * th + eff(m) * to) / (eff(SKIN) + eff(m));
const flux = (m, th, to, t) => (eff(SKIN) * (th - contact(m, th, to))) / Math.sqrt(Math.PI * t);
const state = { To: 20, Th: 34, t: 2 };

createTool({
  state,
  label: 'Five objects, all at the same temperature. For each, a bar runs from the object temperature to the hand temperature, with a dot at the contact temperature when the hand touches it. Metals pull the dot close to the object temperature and draw much more heat per second out of the hand.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [x0, x1] = [W * 0.27, W * 0.78];
    const px = (T) => x0 + ((T - (state.To - 2)) / (state.Th - state.To + 4)) * (x1 - x0);
    const rowH = H / (THINGS.length + 1);
    label(ctx, `object ${state.To}°C`, px(state.To), rowH * 0.45, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `hand ${state.Th}°C`, px(state.Th), rowH * 0.45, c, { size: 11, bounds: stage, patch: false });
    THINGS.forEach((m, i) => {
      const y = rowH * (i + 1.1);
      line(ctx, px(state.To), y, px(state.Th), y, { color: c.grid, width: 6 });
      line(ctx, px(state.To), y - 10, px(state.To), y + 10, { color: c.b, width: 3 });
      line(ctx, px(state.Th), y - 10, px(state.Th), y + 10, { color: c.ink, width: 3 });
      dot(ctx, px(contact(m, state.Th, state.To)), y, 8, c.a, c.ink);
      label(ctx, m.name, 6, y, c, { size: 12, align: 'left', bounds: stage, patch: false });
      label(ctx, `${Math.round(flux(m, state.Th, state.To, state.t))}`, W - 6, y, c, { size: 12, align: 'right', bounds: stage, patch: false });
    });
    label(ctx, 'W/m² at the skin', W - 6, rowH * 0.45, c, { size: 10, align: 'right', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Touch things at one temperature' },
    { key: 'To', label: 'Object temperature (°C)', min: 5, max: 30, step: 1 },
    { key: 'Th', label: 'Hand temperature (°C)', min: 31, max: 37, step: 1 },
    { key: 't', label: 'Time since touching (s)', min: 1, max: 10, step: 1 },
    { readout: [
      ['Wood contact', (s) => `${fixed(contact(THINGS[0], s.Th, s.To), 1)} °C`],
      ['Aluminium contact', (s) => `${fixed(contact(THINGS[4], s.Th, s.To), 1)} °C`],
      ['Heat drawn: Al ÷ wood', (s) => `${fixed(flux(THINGS[4], s.Th, s.To, s.t) / flux(THINGS[0], s.Th, s.To, s.t), 1)} ×`],
    ] },
  ],
  tex: (s) => `T_c=\\dfrac{e_{hand}T_{hand}+e\\,T_{obj}}{e_{hand}+e},\\quad e=\\sqrt{K\\rho c}`,
});
