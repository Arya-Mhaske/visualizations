import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { sig, fixed } from '../../lib/format.js';
import { ALLOYS, coilLength } from './_resistance-temperature-math.js';

const V_MAINS = 230;
const ROOM = 5; // m of wire a heater can hold
const LO = -1; // log10 metres at the left
const HI = 3;
const state = { P: 1000, d: 0.3 };
const area = (s) => Math.PI * (s.d * 1e-3) ** 2 / 4;
const need = (s) => V_MAINS ** 2 / s.P;
const lengthOf = (s, alloy) => coilLength(need(s), alloy.rho, area(s));
const KEYS = ['a', 'b', 'c'];

const tool = createTool({
  state,
  label: 'Horizontal bars on a log scale showing the length of wire needed to make the chosen heater from nichrome, iron and copper. A vertical dashed line marks the 5 metres a heater can hold.',
  draw(ctx, stage, c) {
    const left = 14;
    const right = stage.w - 14;
    const x = (m) => left + ((Math.log10(Math.max(m, 0.1)) - LO) / (HI - LO)) * (right - left);
    const rowH = (stage.h - 70) / ALLOYS.length;
    ALLOYS.forEach((alloy, i) => {
      const L = lengthOf(state, alloy);
      const y = 20 + i * rowH;
      ctx.fillStyle = c[KEYS[i]];
      ctx.fillRect(left, y, Math.max(x(L) - left, 3), rowH - 22);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(left, y, Math.max(x(L) - left, 3), rowH - 22);
      label(ctx, `${alloy.name}: ${sig(L, 3)} m`, (left + right) / 2, y + (rowH - 22) / 2, c, { color: c.ink, size: 12 });
    });
    line(ctx, x(ROOM), 6, x(ROOM), stage.h - 40, { color: c.ink, width: 3, dash: [6, 5] });
    label(ctx, 'room in a heater: 5 m', x(ROOM), stage.h - 22, c, { color: c.ink, size: 11, bounds: [0, stage.w] });
  },
  controls: () => [
    { title: 'A 230 V heater' },
    { key: 'P', label: 'Power wanted, P', min: 500, max: 2000, step: 100, format: (n) => `${n} W` },
    { key: 'd', label: 'Wire thickness, d', min: 0.2, max: 1, step: 0.05, format: (n) => `${fixed(n, 2)} mm` },
    { readout: [
      ['R needed', (s) => `${sig(need(s), 3)} Ω`],
      ['Nichrome wire', (s) => `${sig(lengthOf(s, ALLOYS[0]), 3)} m`],
      ['Fits in the heater?', (s) => (lengthOf(s, ALLOYS[0]) <= ROOM ? { text: 'nichrome: yes', good: true } : { text: 'nichrome: no', good: false })],
    ] },
  ],
  tex: (s) => `R=\\dfrac{V^2}{P}=\\dfrac{${V_MAINS}^2}{${s.P}}=${sig(need(s), 3)}\\ \\Omega\\qquad l=\\dfrac{RA}{\\rho}`,
});
tool.update();
