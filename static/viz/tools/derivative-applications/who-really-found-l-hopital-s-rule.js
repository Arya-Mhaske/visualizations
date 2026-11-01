import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';

// A short timeline, kept to well-documented events. Details of the private arrangement come from surviving letters.
const EVENTS = [
  ['1691–92', 'Johann Bernoulli, a young Swiss mathematician, teaches calculus to the Marquis de l\'Hôpital in Paris.'],
  ['1694', 'Letters show an arrangement: l\'Hôpital pays Bernoulli a regular sum, and Bernoulli sends him his mathematical discoveries.'],
  ['1696', 'l\'Hôpital publishes the first calculus textbook, Analyse des infiniment petits. It contains the 0/0 rule now called by his name.'],
  ['1704', 'l\'Hôpital dies. Bernoulli later claims the rule and much else in the book as his own work.'],
  ['1921', 'Bernoulli\'s lecture notes from the Paris years are found and studied. Historians generally agree they show the rule was Bernoulli\'s.'],
];
const state = { i: 0 };

function wrap(ctx, text, width) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = w; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

createTool({
  state,
  label: 'A five-step timeline of how the rule now called l Hopital rule came to carry that name. Move the slider to step through the dates and read what happened at each one.',
  draw(ctx, stage, c) {
    const pad = 16;
    const y = 36;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(stage.w - pad, y);
    ctx.stroke();
    EVENTS.forEach(([year], i) => {
      const x = pad + ((stage.w - pad * 2) * i) / (EVENTS.length - 1);
      ctx.fillStyle = i === state.i ? c.a : c.paper;
      ctx.fillRect(x - 9, y - 9, 18, 18);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 9, y - 9, 18, 18);
      label(ctx, year, Math.min(stage.w - 28, Math.max(28, x)), y + 28, c, { size: 10, patch: false });
    });
    ctx.font = `700 14px ${c.fontMono}`;
    ctx.fillStyle = c.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    label(ctx, EVENTS[state.i][0], pad, 100, c, { size: 18, align: 'left', patch: false });
    ctx.font = `700 13px ${c.fontMono}`;
    wrap(ctx, EVENTS[state.i][1], stage.w - pad * 2).forEach((line, k) => {
      ctx.fillStyle = c.ink;
      ctx.fillText(line, pad, 140 + k * 22);
    });
  },
  controls: [
    { title: 'Walk through the story' },
    { key: 'i', label: 'Event', min: 0, max: EVENTS.length - 1, step: 1, format: (v) => EVENTS[v][0] },
  ],
});
