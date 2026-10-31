// Generated practice from a config. Same seed, same questions, so a teacher can set "seed 7" for a class.
//   createDrill({ stage, panel, seed, generate });
//   generate(rng) returns a question:
//     { prompt, tex?, options: [text, ...], answer: index, hint, explain }   multiple choice
//     { prompt, tex?, answer: number, tolerance?, unit?, hint, explain }     typed number
//   Either kind may add figure(ctx, stage, c) to draw a picture above the answers.
//   Give the page the viz-stage--flow class.
import { createRng } from './rng.js';
import { bindControls } from './controls.js';
import { renderTex } from './formula.js';
import { createStage } from './stage.js';
import { readColors } from './colors.js';

function el(parent, tag, className, text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  parent.appendChild(node);
  return node;
}

export const isRight = (question, value) => (question.options
  ? value === question.answer
  : Math.abs(value - question.answer) <= (question.tolerance ?? 1e-9));

export function createDrill({ stage, panel, seed = 1, generate }) {
  const state = { seed, right: 0, tried: 0, feedback: 'Pick an answer.' };
  const box = el(stage, 'div', 'viz-drill');
  let rng = createRng(seed);
  let question = null;
  let answered = false;
  let ui = null;

  function finish(value) {
    if (answered) return;
    answered = true;
    const right = isRight(question, value);
    state.tried += 1;
    state.right += right;
    state.feedback = right ? `Correct. ${question.explain}` : `Not quite. ${question.explain}`;
    note.textContent = state.feedback;
    note.dataset.state = right ? 'good' : 'bad';
    ui.refresh();
  }

  let note = null;
  function next() {
    question = generate(rng);
    answered = false;
    box.replaceChildren();
    el(box, 'p', 'viz-drill__prompt', question.prompt);
    if (question.tex) renderTex(el(box, 'p', 'viz-drill__prompt'), question.tex);
    if (question.figure) {
      const colours = readColors();
      const shown = question;
      createStage(el(box, 'div', 'viz-drill__figure'), (ctx, size, stage) => shown.figure(ctx, stage, colours), { label: question.alt || question.prompt });
    }
    if (question.options) {
      const row = el(box, 'div', 'viz-drill__options');
      question.options.forEach((text, i) => {
        const button = el(row, 'button', 'nb-btn nb-btn--ghost', text);
        button.type = 'button';
        button.addEventListener('click', () => finish(i));
      });
    } else {
      const form = el(box, 'form', 'nb-row');
      const input = el(form, 'input', 'nb-input');
      Object.assign(input, { type: 'number', step: 'any', required: true });
      input.setAttribute('aria-label', `Your answer${question.unit ? ` in ${question.unit}` : ''}`);
      el(form, 'button', 'nb-btn', 'Check').type = 'submit';
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        finish(Number(input.value));
      });
    }
    note = el(box, 'p', 'viz-drill__note', question.hint ? `Hint: ${question.hint}` : '');
  }

  ui = bindControls(panel, state, [
    { key: 'seed', label: 'Question set (seed)', min: 1, max: 50, step: 1 },
    { row: [{ button: 'New question', onClick: next }] },
    { readout: [['Score', (s) => `${s.right} / ${s.tried}`]] },
  ], () => {
    rng = createRng(state.seed);
    state.right = 0;
    state.tried = 0;
    next();
  });
  next();
  return ui;
}
