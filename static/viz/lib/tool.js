// The wiring every tool page repeats: stage in #stage, controls in #panel, live formula in #formula.
//   const tool = createTool({
//     state: { r: 2 },
//     label: 'What the stage shows, for screen readers',
//     setup: (stage, c) => createPlot(stage, { c }),   // optional; its result reaches draw as `extra`
//     draw: (ctx, stage, c, extra) => { ... },
//     dom: (el, c) => ({ refresh() {} }),              // instead of draw: an HTML stage, built in el
//     controls: [ ...bindControls spec... ],
//     tex: (state) => 's = r\\theta',                  // optional
//     onChange: (state) => {},                         // optional; runs when a control changes
//   });
//   tool.update()  after changing state from the stage (a drag or a frame). tool.stage, tool.c, tool.ui.
import { readColors } from './colors.js';
import { createStage } from './stage.js';
import { bindControls } from './controls.js';
import { liveFormula } from './formula.js';

const find = (selector) => document.querySelector(selector);

export function createTool({ state, label, setup = null, draw = null, dom = null, controls = [], tex = null, onChange = () => {} }) {
  const c = readColors();
  const tool = { state, c, extra: null };
  let paint = () => {};
  if (dom) {
    const el = find('#stage');
    el.setAttribute('aria-label', label);
    el.setAttribute('role', 'group');
    const view = dom(el, c);
    tool.stage = { invalidate: () => view.refresh(), redraw: () => view.refresh() };
  } else {
    tool.stage = createStage(find('#stage'), (ctx, size, stage) => paint(ctx, stage), { label });
    if (setup) tool.extra = setup(tool.stage, c);
    paint = (ctx, stage) => draw(ctx, stage, c, tool.extra);
  }
  const formula = tex ? liveFormula(find('#formula'), tex) : null;
  const repaint = () => {
    if (formula) formula.update(state);
    tool.stage.invalidate();
  };
  const list = typeof controls === 'function' ? controls(tool) : controls;
  tool.ui = bindControls(find('#panel'), state, list, () => {
    onChange(state);
    repaint();
  });
  tool.update = () => {
    tool.ui.refresh();
    repaint();
  };
  if (formula) formula.update(state);
  tool.stage.redraw();
  return tool;
}
