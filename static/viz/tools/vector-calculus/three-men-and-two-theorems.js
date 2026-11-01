import { createTool } from '../../lib/tool.js';
import { line, dot, label } from '../../lib/draw.js';

// Dates as given in standard histories of vector calculus. Who "first" proved what is partly a matter of convention.
const EVENTS = [
  { year: 1813, who: 'gauss', text: 'Gauss: ellipsoid paper' },
  { year: 1826, who: 'gauss', text: 'Ostrogradsky: proof' },
  { year: 1828, who: 'green', text: 'Green: Essay printed' },
  { year: 1845, who: 'green', text: 'Kelvin finds the Essay' },
  { year: 1850, who: 'stokes', text: 'Kelvin writes to Stokes' },
  { year: 1854, who: 'stokes', text: 'Stokes: exam question' },
];
const PEOPLE = {
  all: { name: 'All three', life: '1777–1855, 1793–1841, 1819–1903', fame: 'Each has a theorem of vector calculus named after them', gap: 'Names follow later convention, not always who came first' },
  green: { name: 'George Green', life: '1793–1841', fame: 'Self-taught Nottingham miller. His 1828 Essay, printed privately for subscribers, contains the plane theorem and the potential function', gap: 'Few saw the Essay until Kelvin found it in 1845' },
  stokes: { name: 'George Stokes', life: '1819–1903', fame: 'Cambridge professor. Set the surface theorem as a Smith\'s Prize question in 1854', gap: 'Kelvin stated it to Stokes in a letter in 1850' },
  gauss: { name: 'Carl Friedrich Gauss', life: '1777–1855', fame: 'Used special cases of the divergence theorem in his 1813 work on attraction', gap: 'Ostrogradsky gave a general proof in 1826, so the theorem also bears his name' },
};
const state = { who: 'all' };
const Y0 = 1805;
const Y1 = 1860;

const tool = createTool({
  state,
  label: 'A vertical timeline from 1805 to 1860 with six events: Gauss in 1813, Ostrogradsky in 1826, Green in 1828, Kelvin finding Green in 1845, Kelvin writing to Stokes in 1850 and Stokes setting the exam question in 1854.',
  draw(ctx, stage, c) {
    const top = 30;
    const bottom = stage.h - 24;
    const x = stage.w * 0.42;
    const yOf = (year) => top + ((year - Y0) / (Y1 - Y0)) * (bottom - top);
    line(ctx, x, top - 10, x, bottom + 8, { color: c.ink, width: 3 });
    for (let yr = 1810; yr <= 1860; yr += 10) {
      line(ctx, x - 7, yOf(yr), x + 7, yOf(yr), { color: c.ink, width: 2 });
      label(ctx, String(yr), x - 12, yOf(yr), c, { size: 10, align: 'right', bounds: stage });
    }
    const colour = { gauss: c.b, green: c.c, stokes: c.a };
    for (const e of EVENTS) {
      const on = state.who === 'all' || state.who === e.who;
      dot(ctx, x, yOf(e.year), on ? 9 : 5, on ? colour[e.who] : c.grid, c.ink);
      if (on) {
        label(ctx, `${e.year}`, x + 16, yOf(e.year) - 8, c, { size: 11, align: 'left', bounds: stage });
        label(ctx, e.text, x + 16, yOf(e.year) + 7, c, { size: 11, align: 'left', bounds: stage });
      }
    }
  },
  controls: [
    { title: 'Meet the three' },
    { key: 'who', label: 'Person', options: Object.entries(PEOPLE).map(([k, v]) => [k, v.name]) },
    { readout: [
      ['Lived', (s) => PEOPLE[s.who].life],
      ['Known for', (s) => PEOPLE[s.who].fame],
      ['The twist', (s) => PEOPLE[s.who].gap],
    ] },
  ],
});
