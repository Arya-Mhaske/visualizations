import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { arrow, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { energyCentre, pulse, pulseVel } from './_wave-basics-math.js';

const LENGTH = 10; // metres of water shown
const SPACING = 0.25;
const XS = Array.from({ length: LENGTH / SPACING + 1 }, (_, i) => i * SPACING);
const state = { v: 1, A: 2, cork: 6, trail: true };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const params = (s) => ({ A: s.A / 100, v: s.v, w: 0.7, x0: 1.5 }); // A in cm on screen, metres in the maths
const wrap = (s) => LENGTH / s.v; // the pulse starts at 1.5 m and runs off the far end at 11.5 m
const time = (s) => clock.state.t % wrap(s);
const centre = (s) => params(s).x0 + s.v * time(s);

const tool = createTool({
  state,
  label: 'A row of floating corks on water with a pulse travelling along it. Each cork only bobs up and down. A blue bar chart underneath shows the energy of motion moving along with the pulse.',
  draw(ctx, stage, c) {
    const p = params(state);
    const t = time(state);
    const px = (x) => stage.w * 0.04 + (x / LENGTH) * stage.w * 0.92;
    const base = stage.h * 0.38;
    const scale = (stage.h * 0.16) / 0.03; // pixels per metre of height
    const vmax = p.A * p.v * (2 / p.w) * 0.4289;

    // the water surface, joined through the corks
    const surface = XS.map((x) => [px(x), base - pulse(x, t, p) * scale]);
    line(ctx, px(0), base, px(LENGTH), base, { color: c.grid, width: 1, dash: [4, 4] });
    poly(ctx, [...surface, [px(LENGTH), base + 28], [px(0), base + 28]], { fill: c.fillB, stroke: null });
    poly(ctx, surface, { stroke: c.ink, closed: false, width: 3 });
    XS.forEach((x, i) => dot(ctx, surface[i][0], surface[i][1], 3, c.paper, c.ink, 2));

    // the cork we follow: its whole path is a short vertical line
    const cx = px(state.cork);
    if (state.trail) {
      line(ctx, cx, base - p.A * scale, cx, base + p.A * scale, { color: c.a, width: 3, dash: [3, 4] });
    }
    const cy = base - pulse(state.cork, t, p) * scale;
    dot(ctx, cx, cy, 9, c.a, c.ink);
    label(ctx, 'cork', cx, base - p.A * scale - 14, c, { size: 11, bounds: stage });

    // where the pulse is: it has travelled, the cork has not
    const pc = centre(state);
    const ground = stage.h * 0.2;
    arrow(ctx, px(p.x0), ground, px(Math.min(pc, LENGTH)), ground, { color: c.b, width: 4 });
    label(ctx, `pulse moved ${fixed(pc - p.x0, 1)} m`, Math.min(px(p.x0) + 70, stage.w - 70), ground - 14, c, { size: 11, bounds: stage });
    label(ctx, 'cork moved 0 m sideways', cx, stage.h * 0.56, c, { size: 11, bounds: stage });

    // energy of motion of each cork: it travels with the pulse
    const top = stage.h * 0.68;
    const floor = stage.h * 0.94;
    line(ctx, px(0), floor, px(LENGTH), floor, { color: c.ink, width: 2 });
    for (const x of XS) {
      const e = (pulseVel(x, t, p) / vmax) ** 2;
      const h = Math.min(1.05, e) * (floor - top);
      ctx.fillStyle = c.b;
      ctx.fillRect(px(x) - 3, floor - h, 6, h);
    }
    label(ctx, 'energy of motion of each cork', stage.w / 2, top - 8, c, { size: 11, bounds: stage });
    const ec = energyCentre(XS, t, p);
    line(ctx, px(ec), top, px(ec), floor, { color: c.ink, width: 2, dash: [3, 3] });
  },
  controls: [
    { title: 'Send a pulse along the water' },
    { key: 'cork', label: 'Cork to follow, at', min: 1, max: 9, step: SPACING, format: (n) => `${fixed(n, 2)} m` },
    { key: 'v', label: 'Wave speed, v', min: 0.5, max: 2, step: 0.25, format: (n) => `${fixed(n, 2)} m/s` },
    { key: 'A', label: 'Height of pulse', min: 1, max: 3, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'trail', label: 'Show the cork’s path', toggle: true },
    transport(clock),
    { readout: [
      ['Pulse is at', (s) => `${fixed(centre(s), 2)} m`],
      ['Energy is at', (s) => `${fixed(energyCentre(XS, time(s), params(s)), 2)} m`],
      ['Cork is at', (s) => `${fixed(s.cork, 2)} m (never changes)`],
      ['Cork height', (s) => `${fixed(pulse(s.cork, time(s), params(s)) * 100, 2)} cm`],
    ] },
  ],
  tex: (s) => `x_{\\text{pulse}} = x_0 + vt = ${fixed(params(s).x0, 1)} + ${fixed(s.v, 2)}\\times ${fixed(time(s), 2)} = ${fixed(centre(s), 2)}\\ \\text{m}`,
});

clock.step(1.5);
