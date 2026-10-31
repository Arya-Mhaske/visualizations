import { readColors } from '../../lib/colors.js';
import { createStage, enableDrag } from '../../lib/stage.js';
import { bindRange, bindChoice } from '../../lib/controls.js';
import { createLoop, reducedMotion } from '../../lib/anim.js';
import {
  MAX_N, divides, cleanSplits, divisorCount, fmt, piFraction, compassStep,
} from './why-360-math.js';

const C = readColors();
const $ = (sel) => document.querySelector(sel);
const TAU = Math.PI * 2;
const UNIT = { 360: '°', 365: ' d', 100: '', 400: ' g' };
const VIEW_LABELS = {
  1: 'A circle cut into equal slices',
  2: 'A circle with chords equal to its radius marked off around it',
  3: 'The Sun on its yearly path around Earth, against fixed stars',
  4: 'An angle drawn as a wedge; drag the dot to change it',
};

const state = {
  view: 1,
  n: 8, total: 360,
  radiusPct: 80, steps: 3,
  day: 0, year360: false,
  theta: 45,
};

const stageEl = $('#stage');

// ---------- helpers ----------
function text(ctx, str, x, y, size, align = 'center', color = C.ink) {
  ctx.font = `700 ${size}px ${C.fontMono}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function stroke(ctx, width = C.line) {
  ctx.lineWidth = width;
  ctx.strokeStyle = C.ink;
  ctx.lineJoin = 'miter';
  ctx.stroke();
}

const rad = (deg) => (deg * Math.PI) / 180;

// ---------- view 1: divisibility ----------
function drawDivisibility(ctx, S) {
  const cx = S / 2, cy = S / 2, R = S * 0.42;
  const { n, total } = state;
  const slice = total / n;
  const whole = divides(total, n);
  const exact = Math.abs(slice - Number(slice.toFixed(3))) < 1e-9;
  const label = `${whole || exact ? '' : '≈'}${fmt(slice)}${UNIT[total]}`;
  const size = n <= 12 ? Math.max(11, S * 0.045) : n <= 24 ? Math.max(9, S * 0.03) : 0;

  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + (i * TAU) / n;
    const a1 = -Math.PI / 2 + ((i + 1) * TAU) / n;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, a0, a1);
    ctx.closePath();
    ctx.fillStyle = whole ? C.fillC : C.fillA;
    ctx.fill();
    stroke(ctx, n > 24 ? 2 : C.line);
    if (size && n > 1) {
      const mid = (a0 + a1) / 2;
      const r = R * (n <= 4 ? 0.6 : 0.68);
      text(ctx, label, cx + r * Math.cos(mid), cy + r * Math.sin(mid), size);
    }
  }
  if (n === 1) text(ctx, label, cx, cy + R * 0.45, Math.max(14, S * 0.06));
}

function updateDivisibility() {
  const { n, total } = state;
  const slice = total / n;
  const whole = divides(total, n);
  $('#r1-slice').textContent = `${fmt(slice)}${UNIT[total]}`;
  const wholeEl = $('#r1-whole');
  wholeEl.textContent = whole ? 'yes' : 'no';
  wholeEl.className = whole ? 'is-good' : 'is-bad';
  $('#r1-clean').textContent = `${cleanSplits(total)} of ${MAX_N}`;
  $('#r1-divisors').textContent = String(divisorCount(total));
  chips.forEach((chip, i) => {
    chip.classList.toggle('is-good', divides(total, i + 1));
    chip.setAttribute('aria-pressed', String(i + 1 === n));
  });
}

// ---------- view 2: the hexagon ----------
function hexagonPoints(R) {
  const pts = [{ x: R, y: 0 }];
  for (let k = 1; k <= 6; k++) pts.push(compassStep(pts[k - 1], R));
  return pts;
}

function drawHexagon(ctx, S) {
  const cx = S / 2, cy = S / 2, R = S * 0.42 * (state.radiusPct / 100);
  const pts = hexagonPoints(R);
  const at = (p) => [cx + p.x, cy - p.y];

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fillStyle = C.paper;
  ctx.fill();
  stroke(ctx);

  for (let k = 1; k <= state.steps; k++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(...at(pts[k - 1]));
    ctx.lineTo(...at(pts[k]));
    ctx.closePath();
    ctx.fillStyle = k % 2 ? C.fillY : C.fillB;
    ctx.fill();
    stroke(ctx);
    const mid = rad((k - 0.5) * 60);
    text(ctx, '60°', cx + R * 0.55 * Math.cos(mid), cy - R * 0.55 * Math.sin(mid), Math.max(10, R * 0.13));
  }
  for (let k = 0; k <= state.steps; k++) {
    const [x, y] = at(pts[k]);
    ctx.fillStyle = k === 0 ? C.a : C.ink;
    ctx.fillRect(x - 5, y - 5, 10, 10);
  }
}

function updateHexagon() {
  const { steps } = state;
  $('#r2-steps').textContent = `${steps} of 6`;
  $('#r2-angle').textContent = '60°';
  $('#r2-total').textContent = `${60 * steps}°`;
  const pts = hexagonPoints(100);
  const gap = Math.hypot(pts[6].x - pts[0].x, pts[6].y - pts[0].y);
  $('#r2-gap').textContent = steps === 6 ? (gap < 1e-9 ? '0 (closed)' : gap.toFixed(6)) : 'keep stepping';
  $('#step-btn').disabled = steps >= 6;
}

// ---------- view 3: the sky ----------
const yearLength = () => (state.year360 ? 360 : 365.25);
const sunDegrees = () => (state.day * 360) / yearLength();

function starAt(i) {
  const a = i * 9 + 4 * Math.sin(i * 7.3);
  const f = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  return { a, r: 0.37 + 0.05 * Math.abs(f), s: 2 + (i % 3) };
}

function drawSky(ctx, S) {
  const cx = S / 2, cy = S / 2, ring = S * 0.27;
  const deg = sunDegrees();
  const pos = (a, r) => [cx + r * Math.cos(rad(a)), cy - r * Math.sin(rad(a))];

  for (let i = 0; i < 40; i++) {
    const star = starAt(i);
    const [x, y] = pos(star.a, star.r * S);
    ctx.fillStyle = C.ink;
    ctx.fillRect(x - star.s, y - star.s, star.s * 2, star.s * 2);
  }

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, ring * 0.7, -rad(Math.min(deg, 360)), 0);
  ctx.closePath();
  ctx.fillStyle = C.fillY;
  ctx.fill();
  stroke(ctx, 2);

  ctx.beginPath();
  ctx.arc(cx, cy, ring, 0, TAU);
  ctx.setLineDash([6, 6]);
  stroke(ctx, 2);
  ctx.setLineDash([]);

  const [x0, y0] = pos(0, S * 0.44);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x0, y0);
  stroke(ctx, 2);
  text(ctx, 'day 0', cx + S * 0.38, cy - 14, Math.max(10, S * 0.03));

  const [sx, sy] = pos(deg, ring);
  const [lx, ly] = pos(deg, S * 0.44);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(lx, ly);
  ctx.strokeStyle = C.a;
  ctx.lineWidth = C.line;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.045, 0, TAU);
  ctx.fillStyle = C.b;
  ctx.fill();
  stroke(ctx);
  text(ctx, 'Earth', cx, cy + S * 0.085, Math.max(10, S * 0.03));

  ctx.beginPath();
  ctx.arc(sx, sy, S * 0.04, 0, TAU);
  ctx.fillStyle = C.fillY;
  ctx.fill();
  ctx.fillStyle = C.a;
  ctx.fill();
  stroke(ctx);
  const [tx, ty] = pos(deg + 12, ring + S * 0.075);
  text(ctx, 'Sun', tx, ty, Math.max(10, S * 0.03));
  text(ctx, `${fmt(deg, 1)}°`, cx + S * 0.1, cy - S * 0.03 - 0, Math.max(10, S * 0.032), 'left');
}

function updateSky() {
  const deg = sunDegrees();
  const perDay = 360 / yearLength();
  $('#r3-day').textContent = String(Math.round(state.day));
  $('#r3-deg').textContent = `${fmt(deg, 1)}°`;
  $('#r3-perday').textContent = `${perDay.toFixed(3)}°`;
}

// ---------- view 4: it's a convention ----------
function drawConvention(ctx, S) {
  const cx = S / 2, cy = S / 2, R = S * 0.38;
  const t = rad(state.theta);
  const tip = [cx + R * Math.cos(t), cy - R * Math.sin(t)];

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fillStyle = C.paper;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = C.grid;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + R, cy);
  ctx.arc(cx, cy, R, 0, -t, true);
  ctx.closePath();
  ctx.fillStyle = C.fillA;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + R, cy);
  ctx.lineTo(cx, cy);
  ctx.lineTo(...tip);
  stroke(ctx);

  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.25, 0, -t, true);
  stroke(ctx, 2);

  ctx.beginPath();
  ctx.arc(...tip, 11, 0, TAU);
  ctx.fillStyle = C.a;
  ctx.fill();
  stroke(ctx);
  text(ctx, `${state.theta}°`, cx, cy + R + 22, Math.max(12, S * 0.04));
}

function radianText() {
  const frac = piFraction(state.theta);
  const dec = rad(state.theta).toFixed(4);
  if (!frac) return { dec, plain: dec };
  const { p, q } = frac;
  if (p === 0) return { dec, plain: '0' };
  const num = p === 1 ? '' : String(p);
  return {
    dec,
    plain: q === 1 ? `${num}π` : `${num}π/${q}`,
  };
}

function updateConvention() {
  const th = state.theta;
  const grad = fmt((th * 400) / 360, 2);
  const turn = fmt(th / 360, 4);
  const r = radianText();
  $('#r4-deg').textContent = `${th}°`;
  $('#r4-grad').textContent = `${grad} grad`;
  $('#r4-turn').textContent = `${turn} turn`;
  $('#r4-rad').textContent = r.plain === r.dec ? `${r.dec} rad` : `${r.dec} rad (${r.plain})`;
}

// ---------- drawing and view plumbing ----------
const DRAW = { 1: drawDivisibility, 2: drawHexagon, 3: drawSky, 4: drawConvention };
const UPDATE = { 1: updateDivisibility, 2: updateHexagon, 3: updateSky, 4: updateConvention };

const stage = createStage(stageEl, (ctx, S) => DRAW[state.view](ctx, S), { label: VIEW_LABELS[1] });

function refresh() {
  UPDATE[state.view]();
  stage.redraw();
}

// chips for n = 1..36
const chips = [];
const chipRow = $('#chips');
for (let i = 1; i <= MAX_N; i++) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'nb-chip';
  chip.textContent = String(i);
  chip.setAttribute('aria-label', `n = ${i}`);
  chip.addEventListener('click', () => { nRange.set(i); state.n = i; refresh(); });
  chipRow.appendChild(chip);
  chips.push(chip);
}

const nRange = bindRange($('#n-range'), $('#n-out'), (v) => { state.n = v; refresh(); });
bindChoice(document, 'total', (v) => { state.total = Number(v); refresh(); });
bindRange($('#radius-range'), $('#radius-out'), (v) => { state.radiusPct = v; refresh(); }, (v) => `${v}%`);
$('#step-btn').addEventListener('click', () => { state.steps = Math.min(6, state.steps + 1); refresh(); });
$('#reset-btn').addEventListener('click', () => { state.steps = 0; refresh(); });

const dayRange = bindRange($('#day-range'), $('#day-out'), (v) => { state.day = v; refresh(); });
$('#year360').addEventListener('change', (e) => { state.year360 = e.target.checked; refresh(); });

const playBtn = $('#play-btn');
const loop = createLoop(stageEl, (dt) => {
  state.day += dt * 40;
  if (state.day > 365) state.day = 0;
  dayRange.set(Math.round(state.day));
  refresh();
});
const stepMode = reducedMotion();
if (stepMode) playBtn.textContent = 'Step +15 days';
playBtn.addEventListener('click', () => {
  if (stepMode) {
    state.day = state.day + 15 > 365 ? 0 : state.day + 15;
    dayRange.set(state.day);
    refresh();
    return;
  }
  if (loop.playing) { loop.stop(); playBtn.textContent = 'Play'; }
  else { loop.start(); playBtn.textContent = 'Pause'; }
});

const thetaRange = bindRange($('#theta-range'), $('#theta-out'), (v) => { state.theta = v; refresh(); }, (v) => `${v}°`);
function setTheta(v) {
  state.theta = Math.max(0, Math.min(360, Math.round(v)));
  thetaRange.set(state.theta);
  refresh();
}
function angleFromPoint(x, y) {
  const S = stage.size;
  const a = (Math.atan2(S / 2 - y, x - S / 2) * 180) / Math.PI;
  const deg = (a + 360) % 360;
  if (Math.abs(deg - state.theta) > 180) return state.theta > 180 ? 360 : 0;
  return deg;
}
enableDrag(stage.canvas, {
  start(x, y) { if (state.view !== 4) return false; setTheta(angleFromPoint(x, y)); return true; },
  move(x, y) { setTheta(angleFromPoint(x, y)); },
  key(name, e) {
    if (state.view !== 4) return false;
    const step = e.shiftKey ? 10 : 1;
    if (name === 'ArrowRight' || name === 'ArrowUp') setTheta(state.theta + step);
    else if (name === 'ArrowLeft' || name === 'ArrowDown') setTheta(state.theta - step);
    else return false;
    return true;
  },
});

// tabs + URL hash
const tabs = [...document.querySelectorAll('.viz-steps button')];
function showView(v, { updateHash = true } = {}) {
  state.view = v;
  tabs.forEach((tab, i) => tab.setAttribute('aria-selected', String(i + 1 === v)));
  document.querySelectorAll('[data-view]').forEach((el) => { el.hidden = Number(el.dataset.view) !== v; });
  stage.canvas.setAttribute('aria-label', VIEW_LABELS[v]);
  if (v !== 4) stage.canvas.removeAttribute('tabindex'); else stage.canvas.tabIndex = 0;
  if (v !== 3 && loop.playing) { loop.stop(); playBtn.textContent = stepMode ? 'Step +15 days' : 'Play'; }
  if (updateHash) history.replaceState(null, '', `#view-${v}`);
  refresh();
}
tabs.forEach((tab, i) => tab.addEventListener('click', () => showView(i + 1)));
const fromHash = () => {
  const m = /^#view-([1-4])$/.exec(location.hash);
  return m ? Number(m[1]) : 1;
};
window.addEventListener('hashchange', () => showView(fromHash(), { updateHash: false }));
showView(fromHash(), { updateHash: false });
