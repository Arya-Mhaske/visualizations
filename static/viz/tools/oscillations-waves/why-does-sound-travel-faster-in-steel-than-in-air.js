import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { label, line } from '../../lib/draw.js';
import { fixed, sci, texSci } from '../../lib/format.js';
import { MATERIALS, materialSpeed, pulseY } from './_travelling-waves-math.js';

const L = 100; // metres of medium shown
const SLOW = 20; // the animation runs this many times slower than real life
const AIR = MATERIALS.air;
const state = { m: 'steel' };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const mat = () => MATERIALS[state.m];
const tau = () => (clock.state.t / SLOW) % ((L + 15) / materialSpeed(AIR)); // real seconds since the push

function lane(ctx, stage, c, y, m, color, name) {
  const left = stage.w * 0.06;
  const span = stage.w * 0.88;
  const amp = stage.h * 0.05;
  const v = materialSpeed(m);
  ctx.beginPath();
  for (let i = 0; i <= 140; i++) {
    const x = (i / 140) * L;
    const px = left + (x / L) * span;
    const py = y - amp * pulseY(x, tau(), v, 5, 4);
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  line(ctx, left, y - amp * 1.2, left, y + amp * 0.5, { color: c.ink, width: 4 });
  line(ctx, left + span, y - amp * 1.2, left + span, y + amp * 0.5, { color: c.ink, width: 4 });
  label(ctx, `${name}: ${fixed(v, 0)} m/s`, left + span / 2, y + amp * 1.4, c, { size: 11, bounds: stage });
}

// A bar on a log scale: 10^lo to 10^hi spans the full width.
function bar(ctx, stage, c, y, value, lo, hi, color, text) {
  const left = stage.w * 0.06;
  const full = stage.w * 0.88;
  const len = ((Math.log10(value) - lo) / (hi - lo)) * full;
  const h = stage.h * 0.04;
  ctx.fillStyle = color;
  ctx.fillRect(left, y, Math.max(len, 3), h);
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(left, y, Math.max(len, 3), h);
  const inside = len > full * 0.55; // a long bar carries its own label, so it never runs off the stage
  label(ctx, text, inside ? left + len - 6 : left + Math.max(len, 3) + 6, y + h / 2, c, { size: 10, align: inside ? 'right' : 'left', bounds: stage });
}

const tool = createTool({
  state,
  label: 'A push travels along a column of air and along a column of the material you pick, each 100 metres long. Below, bars on a logarithmic scale compare the stiffness and the density of the two. Steel is a million times stiffer than air but only 6000 times denser, so sound runs about 15 times faster.',
  draw(ctx, stage, c) {
    const m = mat();
    lane(ctx, stage, c, stage.h * 0.1, AIR, c.b, 'air');
    lane(ctx, stage, c, stage.h * 0.25, m, c.a, m.name.toLowerCase());
    label(ctx, 'Stiffness (pascals, log scale)', stage.w * 0.5, stage.h * 0.4, c, { size: 11, bounds: stage });
    bar(ctx, stage, c, stage.h * 0.43, AIR.stiffness, 4, 12, c.b, `air ${sci(AIR.stiffness, 2)}`);
    bar(ctx, stage, c, stage.h * 0.49, m.stiffness, 4, 12, c.a, `${m.name.toLowerCase()} ${sci(m.stiffness, 2)}`);
    label(ctx, 'Density (kg/m³, log scale)', stage.w * 0.5, stage.h * 0.62, c, { size: 11, bounds: stage });
    bar(ctx, stage, c, stage.h * 0.65, AIR.rho, -1, 4, c.b, `air ${sci(AIR.rho, 2)}`);
    bar(ctx, stage, c, stage.h * 0.71, m.rho, -1, 4, c.a, `${m.name.toLowerCase()} ${sci(m.rho, 2)}`);
    label(ctx, 'stiffness ÷ density, then √', stage.w * 0.5, stage.h * 0.86, c, { size: 10, bounds: stage });
    label(ctx, `${sci(m.stiffness / AIR.stiffness, 2)} ÷ ${sci(m.rho / AIR.rho, 2)} → √ = ${fixed(materialSpeed(m) / materialSpeed(AIR), 1)}`, stage.w * 0.5, stage.h * 0.92, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Pick the solid or liquid' },
    { key: 'm', label: 'Compare air with', options: [['water', 'Water'], ['aluminium', 'Aluminium'], ['steel', 'Steel']] },
    transport(clock),
    { readout: [
      ['Stiffness of air, γP', () => `${sci(AIR.stiffness, 3)} Pa`],
      ['Stiffness of it', (s) => `${sci(MATERIALS[s.m].stiffness, 3)} Pa`],
      ['Stiffer by', (s) => `× ${sci(MATERIALS[s.m].stiffness / AIR.stiffness, 2)}`],
      ['Denser by', (s) => `× ${sci(MATERIALS[s.m].rho / AIR.rho, 2)}`],
      ['Speed in air', () => `${fixed(materialSpeed(AIR), 0)} m/s`],
      ['Speed in it', (s) => `${fixed(materialSpeed(MATERIALS[s.m]), 0)} m/s`],
      ['Faster by', (s) => `× ${fixed(materialSpeed(MATERIALS[s.m]) / materialSpeed(AIR), 1)}`],
    ] },
  ],
  tex: (s) => {
    const m = MATERIALS[s.m];
    return `v_{\\text{air}} = \\sqrt{\\dfrac{\\gamma P}{\\rho}} = ${fixed(materialSpeed(AIR), 0)}\\ \\text{m/s} \\qquad v_{\\text{${m.name.toLowerCase()}}} = \\sqrt{\\dfrac{${m.modulus === 'γP' ? '\\gamma P' : m.modulus}}{\\rho}} = \\sqrt{\\dfrac{${texSci(m.stiffness, 2)}}{${fixed(m.rho, 0)}}} = ${fixed(materialSpeed(m), 0)}\\ \\text{m/s}`;
  },
});

clock.step(1);
