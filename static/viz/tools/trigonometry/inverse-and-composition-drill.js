import { createDrill } from '../../lib/drill.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { ANGLE_TEXT, deg, rad } from './_inverses-math.js';
import { eqFrame } from './_kit.js';

const TEXT = { ...ANGLE_TEXT, 300: '5π/3', 315: '7π/4', 330: '11π/6', 360: '2π', '-120': '−2π/3', '-135': '−3π/4', '-150': '−5π/6' };
const show = (d) => `${TEXT[String(d)]} (${String(d).replace('-', '−')}°)`;

// [text, value, degrees for each inverse]
const ARCSIN = [['1/2', 0.5, 30], ['−1/2', -0.5, -30], ['√2/2', Math.SQRT1_2, 45], ['−√2/2', -Math.SQRT1_2, -45], ['√3/2', Math.sqrt(3) / 2, 60], ['−√3/2', -Math.sqrt(3) / 2, -60], ['0', 0, 0], ['1', 1, 90], ['−1', -1, -90]];
const ARCCOS = [['1/2', 0.5, 60], ['−1/2', -0.5, 120], ['√2/2', Math.SQRT1_2, 45], ['−√2/2', -Math.SQRT1_2, 135], ['√3/2', Math.sqrt(3) / 2, 30], ['−√3/2', -Math.sqrt(3) / 2, 150], ['0', 0, 90], ['1', 1, 0], ['−1', -1, 180]];
const ARCTAN = [['1', 1, 45], ['−1', -1, -45], ['√3', Math.sqrt(3), 60], ['−√3', -Math.sqrt(3), -60], ['√3/3', Math.sqrt(3) / 3, 30], ['−√3/3', -Math.sqrt(3) / 3, -30], ['0', 0, 0]];
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];

function figureFor(kind, value, answer) {
  return (ctx, stage, c) => {
    const f = eqFrame(stage, [-1.5, 1.5], [-1.3, 1.3], 8);
    const O = f.px([0, 0]);
    line(ctx, 0, O[1], stage.w, O[1], { color: c.ink, width: 1.5 });
    line(ctx, O[0], 0, O[0], stage.h, { color: c.ink, width: 1.5 });
    arc(ctx, ...O, f.k, 0, Math.PI * 2, { color: c.grid, width: 2 });
    const [a0, a1] = kind === 'cos' ? [-Math.PI, 0] : [-Math.PI / 2, Math.PI / 2]; // canvas angles of the allowed arc
    arc(ctx, ...O, f.k, a0, a1, { color: c.c, width: 7 });
    if (kind === 'sin') line(ctx, ...f.px([-1.5, value]), ...f.px([1.5, value]), { color: c.a, width: 3 });
    if (kind === 'cos') line(ctx, ...f.px([value, -1.3]), ...f.px([value, 1.3]), { color: c.a, width: 3 });
    if (kind === 'tan') {
      line(ctx, ...f.px([1, -1.3]), ...f.px([1, 1.3]), { color: c.ink, width: 2 });
      const t = Math.max(-1.2, Math.min(1.2, value));
      line(ctx, ...O, ...f.px([1, t]), { color: c.a, width: 3 });
      dot(ctx, ...f.px([1, t]), 6, c.a, c.ink, 2);
    }
    label(ctx, 'allowed arc', O[0] + (kind === 'cos' ? 0 : f.k * 0.55), O[1] + (kind === 'cos' ? -f.k * 1.12 : -f.k * 1.1), c, { size: 10, color: c.c, bounds: stage, patch: false });
    void answer; void deg; void rad;
  };
}

function angleQuestion(rng, kind) {
  const table = kind === 'sin' ? ARCSIN : kind === 'cos' ? ARCCOS : ARCTAN;
  const [t, v, d] = rng.pick(table);
  const name = kind === 'sin' ? 'sin⁻¹' : kind === 'cos' ? 'cos⁻¹' : 'tan⁻¹';
  const pool = [d, -d, 180 - d, 180 + d, 90 - d, d - 90, 360 - d].filter((x) => TEXT[String(x)] !== undefined);
  const wrong = rng.shuffle([...new Set(pool.filter((x) => x !== d))]).slice(0, 3);
  while (wrong.length < 3) { const extra = rng.pick([30, 45, 60, 120, 135, 150]); if (extra !== d && !wrong.includes(extra)) wrong.push(extra); }
  const options = rng.shuffle([d, ...wrong]);
  const range = kind === 'cos' ? '0 to π' : '−π/2 to π/2';
  return {
    prompt: `What is ${name}(${t}) in radians?`,
    options: options.map(show),
    answer: options.indexOf(d),
    hint: `Look for the angle in ${range} (the green arc) where the red line meets the circle.`,
    explain: `${name} only answers in ${range}, so ${name}(${t}) = ${TEXT[String(d)]}.`,
    figure: figureFor(kind, v, d),
    alt: 'A unit circle with the allowed arc for the inverse function and the line for the given value',
  };
}

function foldQuestion(rng) {
  const sinSide = rng.next() < 0.5;
  const theta = rng.pick(sinSide ? [120, 135, 150, 210, 225, 240, 300, 315, 330] : [210, 225, 240, 300, 315, 330]);
  const d = sinSide ? Math.round(deg(Math.asin(Math.sin(rad(theta))))) : Math.round(deg(Math.acos(Math.cos(rad(theta)))));
  const name = sinSide ? 'sin⁻¹(sin' : 'cos⁻¹(cos';
  const pool = [theta, d, 180 - d, -d, theta - 360, 360 - theta].filter((x) => TEXT[String(x)] !== undefined);
  const wrong = [...new Set(pool.filter((x) => x !== d))].slice(0, 3);
  while (wrong.length < 3) { const extra = rng.pick([30, 45, 60, 120, 135, 150]); if (extra !== d && !wrong.includes(extra)) wrong.push(extra); }
  const options = rng.shuffle([d, ...wrong]);
  return {
    prompt: `Find ${name} ${TEXT[String(theta)]}) in radians.`,
    options: options.map(show),
    answer: options.indexOf(d),
    hint: 'The inner function gives a number. The outer one answers only in its own range.',
    explain: `${name} ${TEXT[String(theta)]}) is not ${TEXT[String(theta)]}, because that angle is outside the range of the inverse. The answer is ${TEXT[String(d)]}.`,
  };
}

function triangleQuestion(rng) {
  const [p, q, h] = rng.pick(TRIPLES); // p, q legs, h hypotenuse
  const [opp, adj] = rng.next() < 0.5 ? [p, q] : [q, p];
  const ratios = { 'sin': [opp, h], 'cos': [adj, h], 'tan': [opp, adj] };
  const inner = rng.pick(['sin', 'cos', 'tan']);
  const outer = rng.pick(['sin', 'cos', 'tan'].filter((k) => k !== inner));
  const frac = ([a, b]) => `${a}/${b}`;
  const given = frac(ratios[inner]);
  const answer = frac(ratios[outer]);
  const all = ['sin', 'cos', 'tan'].map((k) => frac(ratios[k])).concat([frac([adj, opp]), frac([h, adj])]);
  const wrong = rng.shuffle([...new Set(all.filter((x) => x !== answer))]).slice(0, 3);
  const options = rng.shuffle([answer, ...wrong]);
  return {
    prompt: `Evaluate ${outer}(${inner}⁻¹(${given})).`,
    options,
    answer: options.indexOf(answer),
    hint: 'Draw the right triangle that the inverse describes, then read off the missing side.',
    explain: `${inner}⁻¹(${given}) describes a ${opp}-${adj}-${h} triangle (sides ${p}, ${q}, ${h}). Its ${outer} is ${answer}.`,
  };
}

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 3,
  generate(rng) {
    const r = rng.next();
    if (r < 0.2) return angleQuestion(rng, 'sin');
    if (r < 0.4) return angleQuestion(rng, 'cos');
    if (r < 0.55) return angleQuestion(rng, 'tan');
    if (r < 0.8) return foldQuestion(rng);
    return triangleQuestion(rng);
  },
});
