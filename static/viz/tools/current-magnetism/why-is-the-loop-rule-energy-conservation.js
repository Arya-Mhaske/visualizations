import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { handles } from '../../lib/stage.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { cell, resistor } from '../../lib/circuit.js';
import { fixed } from '../../lib/format.js';
import { allEdges, loopEdges, loopSteps, twoLoop, walkAt, walkMarks } from './_kirchhoff-math.js';

const CYCLE = 12; // s for one trip round
const TOP = 12; // V, the tallest height the sliders allow
const state = { t: 4.2, loop: 'left', E1: 12, E2: 9, R1: 2, R2: 2, R3: 4 };
const timeline = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });

const volts = (n) => `${fixed(n, 1)} V`;
const ohms = (n) => `${n} Ω`;
const signed = (n) => (n >= 0 ? `+${fixed(n, 2)}` : fixed(n, 2));
const walkS = (s) => Math.min(1, s.t / (CYCLE - 0.01));
const edges = () => loopEdges(state, state.loop);
const here = () => walkAt(edges(), walkS(state));

// Plan position (u across, w back) plus height V, drawn in a fixed oblique view.
function project(stage, u, w, V) {
  // Depth runs mostly sideways, so a change of height on the screen is a real change of height, and ramps look like ramps.
  const scale = (stage.h * 0.42) / TOP;
  return [stage.w * 0.06 + u * stage.w * 0.34 + w * stage.w * 0.2, stage.h * 0.61 - w * stage.h * 0.05 - V * scale];
}
const at = (stage, point) => project(stage, ...point);
const profile = (stage) => ({ x: 40, y: stage.h * 0.7, w: stage.w - 56, h: stage.h * 0.25 });
const toProfile = (box, s, V) => [box.x + s * box.w, box.y + box.h - (V / TOP) * box.h];

function drawFloor(ctx, stage, c) {
  const { VT } = twoLoop(state);
  const floor = [[0, 0], [2, 0], [2, 1], [0, 1]].map(([u, w]) => project(stage, u, w, 0));
  poly(ctx, floor, { fill: c.fillY, stroke: c.grid, width: 2 });
  for (const u of [0, 1, 2]) {
    line(ctx, ...project(stage, u, 1, 0), ...project(stage, u, 1, VT), { color: c.grid, width: 2, dash: [4, 4] });
  }
}

function drawEdge(ctx, stage, c, edge, color, width) {
  const [from, to] = [at(stage, edge.a), at(stage, edge.b)];
  if (edge.kind === 'res') resistor(ctx, ...from, ...to, { color, width, size: 6 });
  else if (edge.kind === 'cell') cell(ctx, ...from, ...to, { color, width });
  else line(ctx, ...from, ...to, { color, width });
}

function drawNames(ctx, stage, c) {
  for (const edge of allEdges(state)) {
    if (edge.kind === 'wire') continue;
    const [x1, y1] = at(stage, edge.a);
    const [x2, y2] = at(stage, edge.b);
    label(ctx, edge.name, (x1 + x2) / 2 + 20, (y1 + y2) / 2, c, { size: 11, bounds: stage });
  }
}

function drawMap(ctx, stage, c, list, spot) {
  drawFloor(ctx, stage, c);
  for (const edge of allEdges(state)) drawEdge(ctx, stage, c, edge, c.grid, 3);
  for (const edge of list) drawEdge(ctx, stage, c, edge, c.ink, 3);
  list.slice(0, spot.index).forEach((edge) => drawEdge(ctx, stage, c, edge, c.a, 4));
  const edge = list[spot.index];
  const mid = edge.a.map((v, k) => v + (edge.b[k] - v) * spot.f);
  line(ctx, ...at(stage, edge.a), ...at(stage, mid), { color: c.a, width: 4 });
  drawNames(ctx, stage, c);
  const [x, y] = project(stage, spot.u, spot.w, spot.V);
  dot(ctx, x, y, 10, c.a, c.ink);
  label(ctx, volts(spot.V), x, y - 19, c, { size: 12, bounds: stage });
  label(ctx, 'Drag the walker', 6, 12, c, { size: 11, align: 'left', bounds: stage });
}

function drawProfile(ctx, stage, c, list, spot, s) {
  const box = profile(stage);
  const marks = [0, ...walkMarks(list)];
  label(ctx, 'Height on the walk', box.x, box.y - 12, c, { size: 11, align: 'left', bounds: stage });
  line(ctx, box.x, box.y, box.x, box.y + box.h, { color: c.ink, width: 2 });
  line(ctx, box.x, box.y + box.h, box.x + box.w, box.y + box.h, { color: c.ink, width: 2 });
  label(ctx, `${TOP} V`, box.x - 5, box.y + 2, c, { size: 10, align: 'right', bounds: stage });
  label(ctx, '0', box.x - 9, box.y + box.h, c, { size: 10, align: 'right', bounds: stage });
  list.forEach((edge, i) => {
    line(ctx, ...toProfile(box, marks[i], edge.a[2]), ...toProfile(box, marks[i + 1], edge.b[2]), { color: c.ink, width: 3 });
  });
  list.slice(0, spot.index + 1).forEach((edge, i) => {
    const end = i === spot.index ? s : marks[i + 1];
    const V = i === spot.index ? spot.V : edge.b[2];
    line(ctx, ...toProfile(box, marks[i], edge.a[2]), ...toProfile(box, end, V), { color: c.a, width: 4 });
  });
  dot(ctx, ...toProfile(box, s, spot.V), 6, c.a, c.ink, 2);
  dot(ctx, ...toProfile(box, 0, 0), 5, c.c, c.ink, 2);
  dot(ctx, ...toProfile(box, 1, 0), 5, c.c, c.ink, 2);
}

const tool = createTool({
  state,
  label: 'A two-loop circuit drawn as a height map, where height is potential. Cells are lifts and resistors are ramps. A walker follows one loop, and a graph below shows its height along the walk, ending at the height it started from.',
  draw(ctx, stage, c) {
    const list = edges();
    const s = walkS(state);
    const spot = walkAt(list, s);
    drawMap(ctx, stage, c, list, spot);
    drawProfile(ctx, stage, c, list, spot, s);
  },
  controls: () => [
    { title: 'Walk the loop' },
    { key: 't', label: 'Walk', min: 0, max: CYCLE, step: 0.05, format: (n) => `${fixed(walkS({ t: n }) * 100, 0)}%` },
    transport(timeline.clock),
    { key: 'loop', label: 'Loop', options: [['left', 'Left'], ['right', 'Right'], ['outer', 'Outer']] },
    { key: 'E1', label: 'Cell E₁', min: 1, max: TOP, format: (n) => `${n} V` },
    { key: 'E2', label: 'Cell E₂', min: 1, max: TOP, format: (n) => `${n} V` },
    { key: 'R1', label: 'R₁', min: 1, max: 10, format: ohms },
    { key: 'R2', label: 'R₂', min: 1, max: 10, format: ohms },
    { key: 'R3', label: 'R₃', min: 1, max: 10, format: ohms },
    { readout: [
      ['Height now', () => volts(here().V)],
      ['Climbed so far', () => volts(here().up)],
      ['Fallen so far', () => volts(here().down)],
      ['Energy gained by 1 C', () => `${fixed(here().up - here().down, 1)} J`],
      ['I₁, I₂, I₃', (s) => { const { I1, I2, I3 } = twoLoop(s); return `${fixed(I1, 2)}, ${fixed(I2, 2)}, ${fixed(I3, 2)} A`; }],
    ] },
  ],
  tex: () => {
    const steps = loopSteps(edges());
    const total = steps.reduce((sum, step) => sum + step.dV, 0);
    return `\\sum\\Delta V=${steps.map((step) => signed(step.dV)).join('\\,')}=${fixed(total, 2)}\\ \\text{V}`;
  },
  onChange: () => timeline.sync(),
});

// Nearest place on the loop to the pointer.
function nearest(px, py) {
  const list = edges();
  let [best, bestD] = [0, Infinity];
  for (let i = 0; i <= 300; i++) {
    const s = i / 300;
    const spot = walkAt(list, s);
    const [x, y] = project(tool.stage, spot.u, spot.w, spot.V);
    const d = Math.hypot(x - px, y - py);
    if (d < bestD) [best, bestD] = [s, d];
  }
  return best;
}

const setWalk = (s) => {
  state.t = Math.max(0, Math.min(CYCLE, s * CYCLE));
  timeline.sync();
};

handles(tool.stage, [{
  at() { const spot = here(); return project(tool.stage, spot.u, spot.w, spot.V); },
  move(px, py) { setWalk(nearest(px, py)); },
  nudge(direction) { setWalk(walkS(state) + direction * 0.01); },
}], { onChange: () => tool.update(), radius: 30 });
timeline.sync();
tool.update();
