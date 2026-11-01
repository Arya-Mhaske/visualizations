// Pure maths for the Unit Circle box. Angles are in degrees unless a name says radians. No DOM.
import { rad } from './_right-triangle-math.js';

export const TAU_DEG = 360;
export const normalise = (theta) => ((theta % 360) + 360) % 360;
export const turns = (theta) => Math.floor(theta / 360);
// The point at angle θ on a circle of radius r. Values this small are rounding noise, so they print as exact zeros.
const clean = (v) => (Math.abs(v) < 1e-12 ? 0 : v);
export const pointAt = (theta, r = 1) => [clean(r * Math.cos(rad(theta))), clean(r * Math.sin(rad(theta)))];

// ---- quadrants, signs and the reference angle ----
export function quadrant(theta) {
  const t = normalise(theta);
  if (t % 90 === 0) return 0; // on an axis
  return Math.floor(t / 90) + 1;
}
export const signOf = (v) => (v > 0 ? '+' : v < 0 ? '−' : '0');
// A, S, T, C: which of sin, cos, tan are positive in each quadrant
export const ASTC = { 1: 'All', 2: 'Sin', 3: 'Tan', 4: 'Cos' };
export function referenceAngle(theta) {
  const t = normalise(theta);
  if (t <= 90) return t;
  if (t <= 180) return 180 - t;
  if (t <= 270) return t - 180;
  return 360 - t;
}
// Which functions are positive at θ, read from the quadrant rather than from the values
export function positives(theta) {
  const q = quadrant(theta);
  return { sin: q === 1 || q === 2, cos: q === 1 || q === 4, tan: q === 1 || q === 3 };
}

// ---- exact values ----
export const SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
// Values for the reference angle 0, 30, 45, 60, 90, in order: [text, number]. null means undefined.
const SIN = [['0', 0], ['1/2', 0.5], ['√2/2', Math.SQRT2 / 2], ['√3/2', Math.sqrt(3) / 2], ['1', 1]];
const COS = [...SIN].reverse();
const TAN = [['0', 0], ['√3/3', Math.sqrt(3) / 3], ['1', 1], ['√3', Math.sqrt(3)], null];
const COT = [...TAN].reverse();
const SEC = [['1', 1], ['2√3/3', 2 / Math.sqrt(3)], ['√2', Math.SQRT2], ['2', 2], null];
const CSC = [...SEC].reverse();
const REFS = [0, 30, 45, 60, 90];
const flip = (entry, minus) => (entry === null ? null : minus && entry[1] !== 0 ? [`−${entry[0]}`, -entry[1]] : entry);
// All six exact values at one of the special angles (a multiple of 30° or 45°)
export function exact(theta) {
  const t = normalise(theta);
  const ref = referenceAngle(t);
  const i = REFS.indexOf(ref);
  if (i < 0) throw new Error(`not a special angle: ${theta}`);
  const q = quadrant(t);
  const onAxis = q === 0;
  // signs from the actual point, which is correct on the axes too
  const [x, y] = pointAt(t);
  const sinNeg = y < 0;
  const cosNeg = x < 0;
  const tanNeg = sinNeg !== cosNeg;
  // On an axis the reference angle is 0 or 90 but the roles may swap: read the values from the point instead
  const sin = onAxis ? [String(Math.round(y)).replace('-', '−'), Math.round(y)] : flip(SIN[i], sinNeg);
  const cos = onAxis ? [String(Math.round(x)).replace('-', '−'), Math.round(x)] : flip(COS[i], cosNeg);
  const tan = Math.abs(x) < 1e-9 ? null : onAxis ? ['0', 0] : flip(TAN[i], tanNeg);
  const cot = Math.abs(y) < 1e-9 ? null : onAxis ? ['0', 0] : flip(COT[i], tanNeg);
  const sec = Math.abs(x) < 1e-9 ? null : onAxis ? [String(Math.round(1 / x)).replace('-', '−'), Math.round(1 / x)] : flip(SEC[i], cosNeg);
  const csc = Math.abs(y) < 1e-9 ? null : onAxis ? [String(Math.round(1 / y)).replace('-', '−'), Math.round(1 / y)] : flip(CSC[i], sinNeg);
  return { sin, cos, tan, cot, sec, csc };
}

// '−√3/2' as TeX: -\dfrac{\sqrt{3}}{2}. Handles a sign, one slash and roots such as 2√3.
export function texOf(text) {
  const negative = text.startsWith('−');
  const body = negative ? text.slice(1) : text;
  const root = (s) => s.replace(/√(\d+)/g, '\\sqrt{$1}');
  const [top, bottom] = body.split('/');
  const core = bottom === undefined ? root(top) : `\\dfrac{${root(top)}}{${root(bottom)}}`;
  return negative ? `-${core}` : core;
}

// ---- half an equilateral triangle, half a square ----
export const HALVES = {
  equilateral: { text: 'Equilateral, side 2', legs: { short: 1, long: Math.sqrt(3) }, hyp: 2, angles: [30, 60] },
  square: { text: 'Square, side 1', legs: { short: 1, long: 1 }, hyp: Math.SQRT2, angles: [45] },
};
// sin θ in a triangle with these sides (opposite over hypotenuse) for the angle that faces the given leg
export const sinFrom = (half, opposite) => opposite / half.hyp;
// The sides of the half-triangle, seen from the 30°, 45° or 60° corner: text for the label, number for the tests
export const SIDES_AT = {
  30: { shape: 'equilateral', opp: ['1', 1], adj: ['√3', Math.sqrt(3)], hyp: ['2', 2] },
  60: { shape: 'equilateral', opp: ['√3', Math.sqrt(3)], adj: ['1', 1], hyp: ['2', 2] },
  45: { shape: 'square', opp: ['1', 1], adj: ['1', 1], hyp: ['√2', Math.SQRT2] },
};

// ---- sin² + cos² ----
export const squares = (theta) => ({ sin2: Math.sin(rad(theta)) ** 2, cos2: Math.cos(rad(theta)) ** 2 });

// ---- circle outputs for one input ----
// An angle gives one point; an x-coordinate gives the two (or one at x = ±1, none beyond) points with that x.
export const pointsAtX = (x) => (Math.abs(x) > 1 ? [] : Math.abs(x) === 1 ? [0] : [Math.sqrt(1 - x * x), -Math.sqrt(1 - x * x)]);

// ---- the calculator in degree or radian mode ----
export const FNS = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
export const evaluate = (fn, n, mode) => FNS[fn](mode === 'deg' ? rad(n) : n);
// The angle the calculator really used, in degrees from 0 to 360
export const usedAngle = (n, mode) => normalise(mode === 'deg' ? n : (n * 180) / Math.PI);
