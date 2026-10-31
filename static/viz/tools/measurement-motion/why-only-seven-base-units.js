import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { BASES, DERIVED, derivedName, unitString } from './_units-measurement-math.js';

const state = { kg: 1, m: 1, s: -2 };
let tool = null;

const set = (item) => () => { Object.assign(state, { kg: item.kg, m: item.m, s: item.s }); tool.update(); };
const USED = ['kg', 'm', 's'];
const cap = (text) => text[0].toUpperCase() + text.slice(1);
const SHORT = { length: 'length', mass: 'mass', time: 'time', 'electric current': 'current', temperature: 'temp.', 'amount of substance': 'amount', 'luminous intensity': 'light' };

tool = createTool({
  state,
  label: 'The seven SI base units in a row, with the three for mass, length and time lit. Below, stacks of tiles show the power of each used in the unit being built.',
  draw(ctx, stage, c) {
    const pad = 10;
    const cell = (stage.w - 2 * pad) / BASES.length;
    BASES.forEach(([symbol, quantity], i) => {
      const x = pad + i * cell;
      const lit = USED.includes(symbol);
      ctx.fillStyle = lit ? c.fillY : c.paper;
      ctx.fillRect(x + 2, pad, cell - 4, 44);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = lit ? c.line : 1.5;
      ctx.strokeRect(x + 2, pad, cell - 4, 44);
      label(ctx, symbol, x + cell / 2, pad + 14, c, { size: 14, patch: false });
      label(ctx, SHORT[quantity], x + cell / 2, pad + 33, c, { size: 9, patch: false, bounds: stage });
    });
    const zero = stage.h * 0.62;
    const tile = Math.min(44, stage.h * 0.058);
    USED.forEach((symbol, i) => {
      const p = state[symbol];
      const cx = stage.w * (0.2 + 0.3 * i);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 36, zero);
      ctx.lineTo(cx + 36, zero);
      ctx.stroke();
      for (let k = 0; k < Math.abs(p); k++) {
        ctx.fillStyle = p > 0 ? c.fillA : c.fillB;
        const y = p > 0 ? zero - (k + 1) * tile : zero + k * tile;
        ctx.fillRect(cx - 28, y, 56, tile);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 28, y, 56, tile);
      }
      label(ctx, `${symbol} to the ${p}`, cx, stage.h * 0.9, c, { size: 12, bounds: stage });
    });
    label(ctx, 'above the line: top, below: bottom', stage.w / 2, stage.h * 0.3, c, { size: 10, bounds: stage });
    label(ctx, unitString(state), stage.w / 2, stage.h * 0.4, c, { size: 18, bounds: stage });
  },
  controls: [
    { title: 'Build a unit from kg, m and s' },
    { row: DERIVED.slice(0, 4).map((d) => ({ button: cap(d.key), onClick: set(d), ghost: true })) },
    { row: DERIVED.slice(4).map((d) => ({ button: cap(d.key), onClick: set(d), ghost: true })) },
    { key: 'kg', label: 'Power of kg', min: -3, max: 3, step: 1 },
    { key: 'm', label: 'Power of m', min: -3, max: 3, step: 1 },
    { key: 's', label: 'Power of s', min: -4, max: 3, step: 1 },
    { readout: [
      ['Unit', (s) => unitString(s)],
      ['Name', (s) => (derivedName(s) ? `${derivedName(s).unit}: ${derivedName(s).name}` : 'no special name')],
      ['Recipe', (s) => (derivedName(s) ? derivedName(s).recipe : '—')],
    ] },
  ],
  tex: (s) => {
    const p = (name, n) => (n === 0 ? '' : n === 1 ? `\\text{${name}}` : `\\text{${name}}^{${n}}`);
    const text = [p('kg', s.kg), p('m', s.m), p('s', s.s)].filter(Boolean).join('\\,');
    return `[\\,\\cdot\\,] = ${text || '1'}`;
  },
});
