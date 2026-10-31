// HOW tools from a config: inputs in the panel, a worked procedure on the stage, revealed one step at a time.
//   createStepper({ stage, panel, state, controls, steps, readout, onChange });
//     controls  a bindControls spec (the student's inputs)
//     steps     state => [{ text, tex? }, ...]; the numbers come from the live state
//   stage is the .viz-stage element; give the page the viz-stage--flow class so it grows with the steps.
import { bindControls } from './controls.js';
import { renderTex } from './formula.js';

export function createStepper({ stage, panel, state, controls = [], steps, onChange = () => {} }) {
  const list = document.createElement('ol');
  list.className = 'viz-worked';
  list.setAttribute('aria-label', 'Worked steps');
  stage.appendChild(list);
  let shown = 2;

  function render() {
    const all = steps(state);
    shown = Math.min(shown, all.length);
    list.replaceChildren(...all.slice(0, shown).map(({ text, tex }) => {
      const item = document.createElement('li');
      if (text) item.append(text);
      if (tex) {
        const math = document.createElement('span');
        math.className = 'viz-worked__tex';
        renderTex(math, tex);
        item.append(math);
      }
      return item;
    }));
  }

  const ui = bindControls(panel, state, [...controls, {
    row: [
      { button: 'Next step', onClick() { shown++; render(); } },
      { button: 'Show all', ghost: true, onClick() { shown = Infinity; render(); } },
      { button: 'Start again', ghost: true, onClick() { shown = 2; render(); } },
    ],
  }], () => {
    onChange(state);
    render();
  });
  render();
  return { ...ui, render };
}
