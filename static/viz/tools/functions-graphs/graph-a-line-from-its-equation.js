import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { equalFigure } from '../conics-curves/_conics-view.js';

// y = (rise / run) x + b
const state = { rise: 2, run: 3, b: -2 };
const m = (s = state) => s.rise / s.run;
const sg = (v) => (v < 0 ? `-${Math.abs(v)}` : `+${v}`);
const stepsFrom = (s) => [0, 1, 2, 3].map((i) => [i * s.run, s.b + i * s.rise]);
const left = (s) => [-1, -2].map((i) => [i * s.run, s.b + i * s.rise]);

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'A coordinate plane with the line, its y-intercept and the points reached by stepping the run and rise, followed by the worked steps');
const figure = equalFigure(stageEl, 'The line with its intercept and the points found by stepping', 8, (ctx, plot, c) => {
  plot.fn((x) => m() * x + state.b, { color: c.a, width: 3 });
  const pts = stepsFrom(state);
  pts.forEach((p, i) => {
    if (i) plot.segment(pts[i - 1][0], pts[i - 1][1], p[0], pts[i - 1][1], { color: c.b, width: 3 });
    if (i) plot.segment(p[0], pts[i - 1][1], p[0], p[1], { color: c.c, width: 3 });
    plot.point(p[0], p[1], { fill: i ? c.fillY : c.c, r: 6 });
  });
  left(state).forEach((p) => plot.point(p[0], p[1], { fill: c.fillY, r: 5 }));
});

function steps(s) {
  const pts = stepsFrom(s);
  return [
    { text: 'Read the equation as y = mx + b. The slope m is the number with x, and b is the y-intercept.', tex: `m=\\dfrac{${s.rise}}{${s.run}},\\ b=${s.b}` },
    { text: 'Plot the y-intercept first: the point where x = 0.', tex: `(0,\\ ${s.b})` },
    { text: `Step by the slope: go right ${s.run}, then ${s.rise < 0 ? 'down' : 'up'} ${Math.abs(s.rise)}. That lands on a new point.`, tex: `(${pts[1][0]},\\ ${pts[1][1]})` },
    { text: 'Repeat. Every step is the same rise for the same run, which is why the points line up.', tex: pts.slice(1).map((p) => `(${p[0]},\\ ${p[1]})`).join(',\\ ') },
    { text: 'Join the points with a straight line, and extend it in both directions. Check a point: x = 0 gives y = b.', tex: `y=\\dfrac{${s.rise}}{${s.run}}x${sg(s.b)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `y=\\dfrac{${s.rise}}{${s.run}}x${s.b ? sg(s.b) : ''}\\ \\ (m=${fixed(m(s), 3)})`);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a line' },
    { key: 'rise', label: 'Rise (top of the slope)', min: -6, max: 6, step: 1 },
    { key: 'run', label: 'Run (bottom of the slope)', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'y-intercept, b', min: -6, max: 6, step: 1 },
    { readout: [
      ['Slope', (s) => fixed(m(s), 3)],
      ['Next points', (s) => stepsFrom(s).slice(1, 3).map((p) => `(${p[0]}, ${p[1]})`).join(' ')],
    ] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
