import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { createTone } from '../../lib/tone.js';
import { transport } from '../../lib/sim.js';
import { dot, label, line as stroke } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import {
  TAU, airSpeed, endCorrection, endFromTwo, loudness, resonanceLengths, speedFromOne, speedFromTwo,
} from './_standing-waves-math.js';

const TUBE_CM = 110;
const CYCLE = 2;
const state = { nu: 512, theta: 20, r: 2, l: 30, t: 0.4, sound: false, marks: [] };
const tone = createTone();
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const v = (s) => airSpeed(s.theta);
const loud = (s) => loudness(s.l / 100, s.nu, s.theta, s.r / 100);
const loudAt = (s, l) => loudness(l / 100, s.nu, s.theta, s.r / 100);
const found = (s) => resonanceLengths(s.nu, s.theta, s.r / 100, 4).map((l) => l * 100).filter((l) => l <= TUBE_CM);
const sorted = (s) => [...s.marks].sort((a, b) => a - b);
const pair = (s) => (s.marks.length >= 2 ? sorted(s) : null);
const listMarks = (s) => (s.marks.length ? sorted(s).map((l) => `${fixed(l, 1)} cm`).join(', ') : 'none yet');
const sync = () => {
  tone.level(loud(state));
  tone.set(state.sound ? state.nu : 0);
};

const tool = createTool({
  state,
  label: 'A vertical glass tube with water at the bottom and a tuning fork above its open top. Beside it a curve shows how loud the tube is as the water level changes, with peaks at the resonance lengths. A wave drawn inside the tube grows when the air column resonates with the fork.',
  draw(ctx, stage, c) {
    const { w, h } = stage;
    const top = 48;
    const bottom = h - 18;
    const s = (bottom - top) / TUBE_CM; // px per cm
    const tubeX = Math.min(70, w * 0.2);
    const tubeW = 36;
    const cx = tubeX + tubeW / 2;
    const waterY = top + state.l * s;
    // tube and water
    ctx.fillStyle = c.fillB;
    ctx.fillRect(tubeX, waterY, tubeW, bottom - waterY);
    stroke(ctx, tubeX, top - 6, tubeX, bottom, { color: c.ink, width: 4 });
    stroke(ctx, tubeX + tubeW, top - 6, tubeX + tubeW, bottom, { color: c.ink, width: 4 });
    stroke(ctx, tubeX, bottom, tubeX + tubeW, bottom, { color: c.ink, width: 4 });
    stroke(ctx, tubeX, waterY, tubeX + tubeW, waterY, { color: c.b, width: 4 });
    // fork
    const buzz = Math.sin((TAU * state.t * 8) / CYCLE);
    stroke(ctx, cx - 6 - buzz, 8, cx - 6 + buzz * 0.5, 26, { color: c.ink, width: 4 });
    stroke(ctx, cx + 6 + buzz, 8, cx + 6 - buzz * 0.5, 26, { color: c.ink, width: 4 });
    stroke(ctx, cx - 6, 26, cx + 6, 26, { color: c.ink, width: 4 });
    stroke(ctx, cx, 26, cx, 36, { color: c.ink, width: 4 });
    label(ctx, `${state.nu} Hz`, cx + 40, 18, c, { size: 11, bounds: stage });
    // the standing wave in the air column: water is a node, the antinode is e above the rim
    const k = (TAU * state.nu) / v(state) / 100; // rad per cm
    const e = endCorrection(state.r);
    const amp = 3 + 15 * loud(state);
    const swing = Math.cos((TAU * state.t) / CYCLE);
    const reach = state.l + e;
    const wave = (factor) => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const d = (reach * i) / 120; // cm up from the water
        const x = cx + factor * amp * Math.sin(k * d);
        if (i) ctx.lineTo(x, waterY - d * s); else ctx.moveTo(x, waterY - d * s);
      }
      ctx.stroke();
    };
    ctx.save();
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    wave(1);
    wave(-1);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = c.c;
    ctx.lineWidth = 4;
    wave(swing);
    ctx.restore();
    dot(ctx, cx, waterY, 5, c.ink);
    label(ctx, 'node', tubeX - 6, waterY, c, { align: 'right', size: 10, bounds: stage });
    stroke(ctx, tubeX - 10, top - e * s, tubeX + tubeW + 10, top - e * s, { color: c.a, width: 2, dash: [4, 3] });
    label(ctx, 'antinode', tubeX + tubeW + 14, top - e * s - 8, c, { align: 'left', size: 10, color: c.a, bounds: stage });
    // loudness against water level, drawn level with the tube
    const gx = Math.max(tubeX + tubeW + 96, w * 0.5);
    const gw = w - gx - 14;
    stroke(ctx, gx, top, gx, bottom, { color: c.ink, width: 2 });
    stroke(ctx, gx + gw, top, gx + gw, bottom, { color: c.grid, width: 1 });
    ctx.save();
    ctx.strokeStyle = c.c;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 220; i++) {
      const l = (TUBE_CM * i) / 220;
      const x = gx + gw * loudAt(state, l);
      if (i) ctx.lineTo(x, top + l * s); else ctx.moveTo(x, top + l * s);
    }
    ctx.stroke();
    ctx.restore();
    found(state).forEach((l, i) => {
      stroke(ctx, gx, top + l * s, gx + gw, top + l * s, { color: c.grid, width: 1, dash: [3, 4] });
      label(ctx, `l${i + 1}`, gx + gw - 8, top + l * s - 9, c, { size: 10, bounds: stage });
    });
    state.marks.forEach((l) => stroke(ctx, gx - 6, top + l * s, gx + gw, top + l * s, { color: c.d, width: 3 }));
    stroke(ctx, gx - 8, waterY, gx + gw, waterY, { color: c.a, width: 3 });
    dot(ctx, gx + gw * loud(state), waterY, 7, c.a, c.ink);
    label(ctx, 'loudness', gx + gw / 2, top - 22, c, { size: 11, bounds: stage });
    label(ctx, 'water level ↓', gx + 2, bottom + 8, c, { align: 'left', size: 10, bounds: stage });
  },
  controls: [
    { title: 'Find the resonances' },
    { key: 'l', label: 'Air column, l (rim to water)', min: 0, max: TUBE_CM, step: 0.1, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'nu', label: 'Tuning fork', options: [[256, '256 Hz'], [320, '320 Hz'], [384, '384 Hz'], [512, '512 Hz']] },
    { row: [
      { button: 'Record this length', onClick() { if (state.marks.length < 3) state.marks.push(Math.round(state.l * 10) / 10); tool.update(); } },
      { button: 'Clear', ghost: true, onClick() { state.marks = []; tool.update(); } },
    ] },
    { key: 'theta', label: 'Air temperature', min: 0, max: 40, step: 1, format: (n) => `${n} °C` },
    { key: 'r', label: 'Tube radius, r', min: 1, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 't', label: 'Slowed-down time', min: 0, max: CYCLE, step: 0.02, format: (n) => `${fixed(n, 2)} s` },
    transport(line.clock),
    { key: 'sound', label: 'Hear the tube', toggle: true },
    { readout: [
      ['Loudness now', (st) => ({ text: `${fixed(loud(st) * 100, 0)}%`, good: loud(st) > 0.9 })],
      ['Recorded lengths', listMarks],
      ['v from 2ν(l₂ − l₁)', (st) => (pair(st) ? `${fixed(speedFromTwo(st.nu, pair(st)[0] / 100, pair(st)[1] / 100), 0)} m/s` : 'record two')],
      ['v from 4ν·l₁ alone', (st) => (st.marks.length ? `${fixed(speedFromOne(st.nu, sorted(st)[0] / 100), 0)} m/s` : 'record one')],
      ['End correction from l₁, l₂', (st) => (pair(st) ? `${fixed(endFromTwo(pair(st)[0], pair(st)[1]), 1)} cm` : 'record two')],
      ['True speed of sound', (st) => `${fixed(v(st), 0)} m/s`],
    ] },
  ],
  tex: (st) => (pair(st)
    ? `v=2\\nu(l_2-l_1)=2(${st.nu})(${fixed(pair(st)[1] / 100, 3)}-${fixed(pair(st)[0] / 100, 3)})=${fixed(speedFromTwo(st.nu, pair(st)[0] / 100, pair(st)[1] / 100), 0)}\\ \\text{m/s}`
    : `l_1+e=\\dfrac{\\lambda}{4},\\quad l_2+e=\\dfrac{3\\lambda}{4}\\ \\Rightarrow\\ \\lambda=${fixed(v(st) / st.nu, 3)}\\ \\text{m}`),
  onChange: sync,
});

line.sync();
