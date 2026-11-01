import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { curve, equalFigure, trace } from './_conics-view.js';

// Four orientations of a parabola with vertex (h, k) and focal distance a (the equation uses 4a)
const state = { form: 'right', a: 2, h: 1, k: -1 };
const n = (v) => fixed(v, 2);
const sg = (v) => (v < 0 ? `+${Math.abs(v)}` : `-${v}`);
const sx = (v) => (v === 0 ? 'x' : `(x${sg(v)})`);
const sy = (v) => (v === 0 ? 'y' : `(y${sg(v)})`);
const DIR = { right: [1, 0], left: [-1, 0], up: [0, 1], down: [0, -1] };

function geometry(s = state) {
  const [dx, dy] = DIR[s.form];
  const V = [s.h, s.k];
  return {
    V,
    F: [s.h + dx * s.a, s.k + dy * s.a],
    vertical: dx === 0,
    directrix: dx === 0 ? { y: s.k - dy * s.a } : { x: s.h - dx * s.a },
    point: (t) => (dx === 0 ? [s.h + 2 * s.a * t, s.k + dy * s.a * t * t] : [s.h + dx * s.a * t * t, s.k + 2 * s.a * t]),
    equation: dx === 0
      ? `(x${s.h ? sg(s.h) : ''})^2=${dy > 0 ? '' : '-'}${4 * s.a}(y${s.k ? sg(s.k) : ''})`
      : `(y${s.k ? sg(s.k) : ''})^2=${dx > 0 ? '' : '-'}${4 * s.a}(x${s.h ? sg(s.h) : ''})`,
  };
}

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The parabola with its vertex, focus and directrix marked, followed by the worked reading of the equation');
const figure = equalFigure(stageEl, 'The parabola with vertex, focus and directrix', 5.5, (ctx, plot, c) => {
  const g = geometry();
  curve(plot, trace(g.point, -3, 3, 160), { color: c.a, width: 4 });
  if (g.vertical) plot.segment(-20, g.directrix.y, 20, g.directrix.y, { color: c.b, width: 3 });
  else plot.segment(g.directrix.x, -20, g.directrix.x, 20, { color: c.b, width: 3 });
  plot.point(g.F[0], g.F[1], { fill: c.c, r: 7 });
  plot.point(g.V[0], g.V[1], { fill: c.fillY, r: 7 });
  plot.text('F', g.F[0] + 0.5, g.F[1] + 0.5, { size: 12, patch: false });
  plot.text('V', g.V[0] + 0.5, g.V[1] - 0.6, { size: 12, patch: false });
}, () => { const g = geometry(); return [(g.V[0] + g.F[0]) / 2, (g.V[1] + g.F[1]) / 2]; });

function steps(s) {
  const g = geometry(s);
  const std = g.vertical ? 'x^2=\\pm4ay' : 'y^2=\\pm4ax';
  return [
    { text: `Match the equation to a standard form. The squared letter is ${g.vertical ? 'x, so the parabola opens up or down' : 'y, so it opens left or right'}.`, tex: `${g.equation}\\ \\leftrightarrow\\ ${g.vertical ? '(x-h)^2=\\pm4a(y-k)' : '(y-k)^2=\\pm4a(x-h)'}` },
    { text: `The vertex is where each bracket is zero: (h, k) = (${s.h}, ${s.k}).`, tex: `V=(${s.h},\\ ${s.k})` },
    { text: `The number multiplying the other bracket is 4a = ${4 * s.a}, so a = ${n(s.a)}. The sign says which way it opens: ${s.form}.`, tex: `4a=${4 * s.a}\\ \\Rightarrow\\ a=${n(s.a)}` },
    { text: `The focus is a = ${n(s.a)} from the vertex, inside the curve.`, tex: `F=(${n(g.F[0])},\\ ${n(g.F[1])})` },
    { text: `The directrix is a from the vertex on the other side, at right angles to the axis.`, tex: g.vertical ? `y=${n(g.directrix.y)}` : `x=${n(g.directrix.x)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => geometry(s).equation);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a parabola' },
    { key: 'form', label: 'Opens', options: [['right', 'Right'], ['left', 'Left'], ['up', 'Up'], ['down', 'Down']] },
    { key: 'a', label: 'a (focus distance)', min: 0.5, max: 4, step: 0.5 },
    { key: 'h', label: 'Vertex x, h', min: -4, max: 4, step: 1 },
    { key: 'k', label: 'Vertex y, k', min: -4, max: 4, step: 1 },
    { readout: [
      ['Vertex', (s) => `(${s.h}, ${s.k})`],
      ['Focus', (s) => `(${n(geometry(s).F[0])}, ${n(geometry(s).F[1])})`],
      ['Directrix', (s) => { const d = geometry(s).directrix; return d.x !== undefined ? `x = ${n(d.x)}` : `y = ${n(d.y)}`; }],
    ] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
