import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig, texSci } from '../../lib/format.js';
import { CONSTANTS, convert, dimText } from './_dimensions-math.js';

// New base units: mass in 10^a kg, length in 10^b m, time in `time` seconds.
const state = { which: 0, a: -3, b: -2, time: 1 };
const TIMES = [[1, 's'], [60, 'min'], [3600, 'h']];
const C = (s) => CONSTANTS[s.which];
const unitsText = (s) => {
  const mass = { '-3': 'g', '-2': '10 g', '-1': '100 g', 0: 'kg', 1: '10 kg', 2: '100 kg', 3: 'tonne' }[s.a] ?? `10^${s.a} kg`;
  const length = { '-3': 'mm', '-2': 'cm', '-1': 'dm', 0: 'm', 1: '10 m', 2: '100 m', 3: 'km' }[s.b] ?? `10^${s.b} m`;
  return { mass, length, time: TIMES.find((t) => t[0] === s.time)[1] };
};
const converted = (s) => convert(C(s).value, C(s).dim, [1, 1, 1], [10 ** s.a, 10 ** s.b, s.time]);

const tool = createTool({
  state,
  label: 'The chosen quantity written in SI units on the left and in your new units on the right, with each base unit shown as a size relative to the SI one. The number in the new units is the old number times the unit ratios raised to the powers in the dimension.',
  draw(ctx, stage, c) {
    const u = unitsText(state);
    const q = C(state);
    label(ctx, q.name, stage.w / 2, 24, c, { color: c.ink, size: 15 });
    label(ctx, dimText(q.dim), stage.w / 2, 52, c, { color: c.ink, size: 14 });
    const boxes = [[`${sig(q.value, 4)} ${q.si}`, 'in SI', c.fillB], [`${sig(converted(state), 4)}`, `in ${u.mass}, ${u.length}, ${u.time}`, c.fillA]];
    boxes.forEach(([big, small, fill], k) => {
      const x = 14 + k * (stage.w / 2);
      const w = stage.w / 2 - 28;
      ctx.fillStyle = fill;
      ctx.fillRect(x, stage.h * 0.28, w, stage.h * 0.3);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, stage.h * 0.28, w, stage.h * 0.3);
      label(ctx, big, x + w / 2, stage.h * 0.38, c, { color: c.ink, size: 14, patch: false, bounds: stage });
      label(ctx, small, x + w / 2, stage.h * 0.50, c, { color: c.ink, size: 10, patch: false, bounds: stage });
    });
    label(ctx, `1 ${u.mass} = ${sig(10 ** state.a, 3)} kg`, stage.w / 2, stage.h * 0.7, c, { color: c.ink, size: 12, bounds: stage });
    label(ctx, `1 ${u.length} = ${sig(10 ** state.b, 3)} m`, stage.w / 2, stage.h * 0.79, c, { color: c.ink, size: 12, bounds: stage });
    label(ctx, `1 ${u.time} = ${state.time} s`, stage.w / 2, stage.h * 0.88, c, { color: c.ink, size: 12, bounds: stage });
  },
  controls: () => [
    { title: 'Change the base units' },
    { key: 'which', label: 'Quantity', min: 0, max: CONSTANTS.length - 1, step: 1, format: (n) => CONSTANTS[n].name },
    { key: 'a', label: 'Unit of mass', min: -3, max: 3, step: 1, format: (n) => unitsText({ a: n, b: 0, time: 1 }).mass },
    { key: 'b', label: 'Unit of length', min: -3, max: 3, step: 1, format: (n) => unitsText({ a: 0, b: n, time: 1 }).length },
    { key: 'time', label: 'Unit of time', options: TIMES.map(([v, name]) => [v, name]) },
    { readout: [
      ['SI value', (s) => `${sig(C(s).value, 4)} ${C(s).si}`],
      ['New value', (s) => sig(converted(s), 4)],
    ] },
  ],
  tex: (s) => `n_2=n_1\\left(\\dfrac{M_1}{M_2}\\right)^{${C(s).dim[0]}}\\left(\\dfrac{L_1}{L_2}\\right)^{${C(s).dim[1]}}\\left(\\dfrac{T_1}{T_2}\\right)^{${C(s).dim[2]}}=${texSci(converted(s), 4)}`,
});
tool.update();
