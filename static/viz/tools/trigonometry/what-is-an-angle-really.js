import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label, line, poly, TAU } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { coterminals, DEG, fullTurns, principal } from './_angles-arcs-math.js';

const LIMIT = 1080;
const state = { theta: 405 };
const ray = (s, r) => [s.w / 2 + r * Math.cos(state.theta * DEG), s.h / 2 - r * Math.sin(state.theta * DEG)];

function spiral(ctx, stage, degrees, r0, options) {
  const points = [];
  const steps = Math.max(2, Math.ceil(Math.abs(degrees) / 4));
  for (let i = 0; i <= steps; i++) {
    const t = (degrees * i) / steps;
    const r = r0 + (Math.abs(t) / 360) * stage.size * 0.05;
    points.push([stage.w / 2 + r * Math.cos(t * DEG), stage.h / 2 - r * Math.sin(t * DEG)]);
  }
  poly(ctx, points, { closed: false, ...options });
}

const tool = createTool({
  state,
  label: 'A ray from the centre. The angle is the turn from the starting ray, shown as a spiral that can pass one full turn.',
  draw(ctx, stage, c) {
    const R = stage.size * 0.44;
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 2;
    ctx.stroke();
    for (const ghost of coterminals(state.theta)) {
      if (ghost !== state.theta) spiral(ctx, stage, ghost, stage.size * 0.1, { stroke: c.grid, width: 2, dash: [5, 5] });
    }
    line(ctx, cx, cy, cx + R, cy, { color: c.ink, width: 3 });
    label(ctx, 'start', cx + R * 0.72, cy + 13, c, { size: 11 });
    if (state.theta) spiral(ctx, stage, state.theta, stage.size * 0.1, { stroke: state.theta > 0 ? c.a : c.b, width: 4 });
    arrow(ctx, cx, cy, ...ray(stage, R), { color: c.ink, width: 3, head: 14 });
    dot(ctx, ...ray(stage, R), 9, c.a, c.ink);
    dot(ctx, cx, cy, 5, c.ink);
  },
  controls: [
    { title: 'An angle is a turn' },
    { text: 'Drag the dot round and round. It remembers every turn.' },
    { key: 'theta', label: 'Angle, θ', min: -LIMIT, max: LIMIT, step: 1, format: (v) => `${fixed(v, 0)}°` },
    { readout: [
      ['Direction', (s) => (s.theta === 0 ? 'none' : s.theta > 0 ? 'anticlockwise (+)' : 'clockwise (−)')],
      ['Full turns', (s) => String(Math.abs(fullTurns(s.theta)))],
      ['Ends where', (s) => `${fixed(principal(s.theta), 0)}° ends`],
      ['Same end as', (s) => coterminals(s.theta).filter((g) => g !== s.theta).map((g) => `${fixed(g, 0)}°`).join(', ')],
    ] },
  ],
  tex: (s) => {
    const k = (s.theta - principal(s.theta)) / 360;
    return `\\theta = ${fixed(principal(s.theta), 0)}^\\circ ${k < 0 ? '-' : '+'} ${Math.abs(k)} \\times 360^\\circ = ${fixed(s.theta, 0).replace('−', '-')}^\\circ`;
  },
});

handles(tool.stage, [{
  at: () => ray(tool.stage, tool.stage.size * 0.44),
  nudge(direction) { state.theta = Math.max(-LIMIT, Math.min(LIMIT, state.theta + direction * 5)); },
  move(px, py) {
    const pointer = Math.atan2(tool.stage.h / 2 - py, px - tool.stage.w / 2) / DEG;
    const delta = ((pointer - state.theta + 540) % 360 + 360) % 360 - 180;
    state.theta = Math.max(-LIMIT, Math.min(LIMIT, Math.round(state.theta + delta)));
  },
}], { onChange: tool.update });
