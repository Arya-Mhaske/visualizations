import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { FULL, REACH, airLayout, relay } from './_wave-basics-math.js';

const HOP = 0.3; // seconds per hand-off on screen
const ALL = airLayout(FULL);
const state = { air: 100, show: 'both' };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });

let cache = { n: -1 };
function chain(s) {
  const n = Math.round((FULL * s.air) / 100);
  if (cache.n !== n) {
    const points = ALL.slice(0, n);
    const { hops, depth } = relay(points, REACH);
    cache = { n, points, hops, depth, deepest: Math.max(0, ...depth) };
  }
  return cache;
}
const front = (s) => {
  const { deepest } = chain(s);
  const cycle = (deepest + 4) * HOP;
  return Math.floor((clock.state.t % cycle) / HOP) + 1;
};

const tool = createTool({
  state,
  label: 'A glass jar with a bell on its left and an ear outside on the right. Dots are air molecules. Sound is passed from molecule to molecule, so as air is pumped out the chain breaks and the bell goes silent. Blue light rays cross the jar whatever the air.',
  draw(ctx, stage, c) {
    const jar = { x: stage.w * 0.1, y: stage.h * 0.14, w: stage.w * 0.66, h: stage.h * 0.58 };
    const at = ([u, v]) => [jar.x + u * jar.w, jar.y + v * jar.h];
    const { points, hops, depth } = chain(state);
    const wave = front(state);
    const [bellX, bellY] = [jar.x, jar.y + jar.h / 2];

    ctx.fillStyle = c.fillY;
    ctx.fillRect(jar.x - 4, jar.y + jar.h, jar.w + 8, 14);
    ctx.fillStyle = c.paper;
    ctx.fillRect(jar.x, jar.y, jar.w, jar.h);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(jar.x, jar.y, jar.w, jar.h);

    if (state.show !== 'light' && points.length) {
      const [rx, ry] = at(points[0]);
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rx, ry, REACH * jar.w, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    points.forEach((p, i) => {
      const [x, y] = at(p);
      const lit = state.show !== 'light' && depth[i] > 0 && depth[i] <= wave;
      dot(ctx, x, y, lit ? 5 : 4, lit ? c.a : c.fillB, c.ink, 2);
    });

    // bell: shakes while it rings
    const shake = Math.sin(clock.state.t * 40) * 3;
    dot(ctx, bellX + 16 + shake, bellY, 11, c.d, c.ink);
    label(ctx, 'bell', bellX + 16, bellY - 24, c, { size: 11, bounds: stage });

    // ear
    const heard = hops !== null && state.show !== 'light';
    const earX = jar.x + jar.w + stage.w * 0.12;
    dot(ctx, earX, bellY, 14, heard ? c.c : c.paper, c.ink);
    label(ctx, heard ? 'hears it' : 'silence', earX, bellY + 28, c, { size: 11, bounds: stage });

    if (state.show !== 'sound') {
      for (let k = -2; k <= 2; k++) {
        const y1 = bellY + k * 14;
        const y2 = bellY + k * 22;
        arrow(ctx, bellX + 34, y1, jar.x + jar.w + 8, y2, { color: c.b, width: 3, head: 8 });
        line(ctx, jar.x + jar.w + 8, y2, earX - 20, bellY + k * 5, { color: c.b, width: 2, dash: [4, 4] });
      }
      label(ctx, 'light rays', jar.x + jar.w / 2, jar.y - 14, c, { size: 11, bounds: stage });
    }
    label(ctx, 'to the pump', jar.x + jar.w / 2, jar.y + jar.h + 32, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Pump the air out' },
    { key: 'air', label: 'Air left in the jar', min: 0, max: 100, step: 5, format: (n) => `${n}%` },
    { key: 'show', label: 'Send', options: [['both', 'Both'], ['sound', 'Sound'], ['light', 'Light']] },
    transport(clock),
    { readout: [
      ['Molecules', (s) => String(chain(s).points.length)],
      ['Hand-offs, bell to glass', (s) => (chain(s).hops === null ? 'chain broken' : String(chain(s).hops))],
      ['Sound reaches the ear?', (s) => ({ text: chain(s).hops === null ? 'No' : 'Yes', good: chain(s).hops !== null })],
      ['Light reaches the ear?', () => ({ text: 'Yes', good: true })],
    ] },
  ],
  tex: (s) => (chain(s).hops === null
    ? '\\text{sound: no chain of molecules from bell to glass}'
    : `\\text{sound: } ${chain(s).hops}\\text{ hand-offs from bell to glass}`),
});

clock.step(0.1);
clock.play();
