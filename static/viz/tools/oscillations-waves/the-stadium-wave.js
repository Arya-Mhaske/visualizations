import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { standing, standingCount } from './_wave-basics-math.js';

const PEOPLE = 24;
const GAP = 0.5; // metres between neighbouring seats
const state = { delay: 0.2, stand: 1, seat: 12 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const cycle = (s) => (PEOPLE - 1) * s.delay + s.stand + 1;
const now = (s) => clock.state.t % cycle(s);
const speed = (s) => GAP / s.delay;

const tool = createTool({
  state,
  label: 'A row of people in a stadium. Each stands up a moment after the person on their left, so a wave of standing people runs along the row, while nobody leaves their seat. A graph below shows one person’s height against time.',
  draw(ctx, stage, c) {
    const t = now(state);
    const px = (i) => stage.w * 0.05 + ((i + 0.5) / PEOPLE) * stage.w * 0.9;
    const seatY = stage.h * 0.4;
    const unit = Math.min(14, (stage.w * 0.9) / PEOPLE / 2);

    line(ctx, stage.w * 0.03, seatY + 4, stage.w * 0.97, seatY + 4, { color: c.ink, width: 3 });
    for (let i = 0; i < PEOPLE; i++) {
      const up = standing(i, t, state.delay, state.stand);
      const mine = i + 1 === state.seat;
      const colour = mine ? c.a : up ? c.c : c.fillB;
      const top = seatY - (up ? 52 : 22);
      line(ctx, px(i), seatY, px(i), top, { color: c.ink, width: 4 });
      dot(ctx, px(i), top - unit * 0.7, unit * 0.7, colour, c.ink, 2);
      if (up) {
        line(ctx, px(i) - unit * 0.7, top - unit * 1.9, px(i), top + 8, { color: c.ink, width: 2 });
        line(ctx, px(i) + unit * 0.7, top - unit * 1.9, px(i), top + 8, { color: c.ink, width: 2 });
      }
    }
    // where the front of the wave is, in seats
    const frontSeat = Math.min(PEOPLE - 1, Math.max(0, t / state.delay));
    if (t < (PEOPLE - 1) * state.delay) {
      const fx = px(frontSeat);
      arrow(ctx, fx - 30, seatY - 86, fx + 10, seatY - 86, { color: c.b, width: 4 });
    }
    label(ctx, 'the wave runs this way →', stage.w / 2, stage.h * 0.1, c, { size: 11, bounds: stage });
    label(ctx, `your seat: ${state.seat} (coral)`, px(state.seat - 1), seatY + 24, c, { size: 11, bounds: stage });

    // one person's height against time
    const g = { x: stage.w * 0.1, y: stage.h * 0.64, w: stage.w * 0.84, h: stage.h * 0.26 };
    const tx = (s) => g.x + (s / cycle(state)) * g.w;
    line(ctx, g.x, g.y + g.h, g.x + g.w, g.y + g.h, { color: c.ink, width: 2 });
    line(ctx, g.x, g.y, g.x, g.y + g.h, { color: c.ink, width: 2 });
    const start = (state.seat - 1) * state.delay;
    ctx.fillStyle = c.a;
    ctx.fillRect(tx(start), g.y + g.h * 0.1, tx(start + state.stand) - tx(start), g.h * 0.9);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(tx(start), g.y + g.h * 0.1, tx(start + state.stand) - tx(start), g.h * 0.9);
    line(ctx, tx(t), g.y - 6, tx(t), g.y + g.h, { color: c.ink, width: 2, dash: [3, 3] });
    label(ctx, 'standing', g.x + 28, g.y + 6, c, { size: 11, bounds: stage });
    label(ctx, 'time →', g.x + g.w - 28, g.y + g.h + 14, c, { size: 11, bounds: stage });
    label(ctx, 'your seat’s height', stage.w / 2, g.y - 16, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Start a stadium wave' },
    { key: 'delay', label: 'Each person waits', min: 0.1, max: 0.5, step: 0.05, format: (n) => `${fixed(n, 2)} s` },
    { key: 'stand', label: 'Each stays standing', min: 0.5, max: 2, step: 0.25, format: (n) => `${fixed(n, 2)} s` },
    { key: 'seat', label: 'Follow seat', min: 1, max: PEOPLE, step: 1 },
    transport(clock),
    { readout: [
      ['Wave speed', (s) => `${fixed(speed(s), 2)} m/s`],
      ['Standing now', (s) => String(standingCount(PEOPLE, now(s), s.delay, s.stand))],
      ['Time to cross the row', (s) => `${fixed((PEOPLE - 1) * s.delay, 2)} s`],
      ['Distance any person moves along the row', () => '0 m'],
    ] },
  ],
  tex: (s) => `v = \\dfrac{\\text{seat gap}}{\\text{wait}} = \\dfrac{${GAP}\\ \\text{m}}{${fixed(s.delay, 2)}\\ \\text{s}} = ${fixed(speed(s), 2)}\\ \\text{m/s}`,
});

clock.step(1);
