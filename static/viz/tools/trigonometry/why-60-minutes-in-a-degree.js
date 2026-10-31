import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line, wedge, TAU } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { DEG, dmsToDecimal } from './_angles-arcs-math.js';

const state = { degrees: 12, minutes: 25, seconds: 30, zoom: 'minute' };
const SPLIT = { degree: 1, minute: 60, second: 60 };
const SPREAD = 60 * DEG;   // the zoomed wedge is drawn this wide
const decimal = (s) => dmsToDecimal(s.degrees, s.minutes, s.seconds);

function fan(ctx, stage, c) {
  const [cx, cy, R] = [stage.w / 2, stage.h * 0.62, stage.h * 0.56];
  const start = -Math.PI / 2 - SPREAD / 2;
  const parts = SPLIT[state.zoom];
  const value = state.zoom === 'minute' ? state.minutes : state.seconds;
  wedge(ctx, cx, cy, R, start, start + SPREAD, { fill: c.paper, stroke: c.ink });
  if (parts > 1) {
    const width = SPREAD / parts;
    wedge(ctx, cx, cy, R, start, start + width * value, { fill: c.fillY });
    wedge(ctx, cx, cy, R, start + width * value, start + width * (value + 1), { fill: c.a });
    for (let i = 1; i < parts; i++) {
      const a = start + width * i;
      const inner = i % 5 === 0 ? R * 0.68 : R * 0.86;
      line(ctx, cx + inner * Math.cos(a), cy + inner * Math.sin(a), cx + R * Math.cos(a), cy + R * Math.sin(a), { color: c.ink, width: i % 5 === 0 ? 2 : 1 });
    }
  }
  const words = { degree: '1° wedge, greatly enlarged', minute: '1° cut into 60 minutes (60′)', second: '1′ cut into 60 seconds (60″)' };
  label(ctx, words[state.zoom], stage.w / 2, stage.h * 0.68, c, { size: 12, bounds: stage });
}

function clock(ctx, stage, c) {
  const [cx, cy, R] = [stage.w / 2, stage.h * 0.84, stage.h * 0.13];
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fillStyle = c.paper;
  ctx.fill();
  arc(ctx, cx, cy, R, 0, TAU, { color: c.ink });
  const hand = (fraction, length, color, width) => {
    const a = fraction * TAU - Math.PI / 2;
    line(ctx, cx, cy, cx + R * length * Math.cos(a), cy + R * length * Math.sin(a), { color, width });
  };
  hand(((state.degrees % 12) + state.minutes / 60) / 12, 0.55, c.ink, 4);
  hand((state.minutes + state.seconds / 60) / 60, 0.8, c.b, 3);
  hand(state.seconds / 60, 0.92, c.a, 2);
  dot(ctx, cx, cy, 3, c.ink);
  label(ctx, `${state.degrees} h ${state.minutes} min ${state.seconds} s`, cx + R + 8, cy, c, { size: 11, align: 'left', bounds: stage });
}

const count = (n) => [...Array(n).keys()].filter((d) => n % (d + 1) === 0).length;

createTool({
  state,
  label: 'A one degree wedge magnified and split into sixty parts, above a clock showing the same numbers as hours, minutes and seconds.',
  draw(ctx, stage, c) {
    fan(ctx, stage, c);
    clock(ctx, stage, c);
  },
  controls: [
    { title: 'Zoom into one degree' },
    { key: 'zoom', label: 'Zoom', options: [['degree', '1°'], ['minute', '1° ÷ 60'], ['second', '1′ ÷ 60']] },
    { key: 'degrees', label: 'Degrees', min: 0, max: 89, format: (v) => `${v}°` },
    { key: 'minutes', label: 'Minutes', min: 0, max: 59, format: (v) => `${v}′` },
    { key: 'seconds', label: 'Seconds', min: 0, max: 59, format: (v) => `${v}″` },
    { readout: [
      ['Angle', (s) => `${s.degrees}° ${s.minutes}′ ${s.seconds}″`],
      ['As a decimal', (s) => `${fixed(decimal(s), 4)}°`],
      ['In 1°', () => '60′ = 3600″'],
      ['Ways to split 60', () => `${count(60)} (100: ${count(100)})`],
    ] },
  ],
  tex: (s) => `${s.degrees} + \\frac{${s.minutes}}{60} + \\frac{${s.seconds}}{3600} = ${fixed(decimal(s), 4)}^\\circ`,
});
