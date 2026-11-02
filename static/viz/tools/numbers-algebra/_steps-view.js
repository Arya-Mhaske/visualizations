// A worked-steps panel for HTML stages: show(lines, count) renders the first `count` lines with KaTeX.
//   const view = stepsView(el); view.show([{ tex, note }], count)
import { renderTex } from '../../lib/formula.js';

export function stepsView(el) {
  const box = document.createElement('div');
  box.className = 'viz-steps-list';
  el.appendChild(box);
  return {
    show(lines, count) {
      box.textContent = '';
      lines.slice(0, count).forEach((line, i) => {
        const row = document.createElement('div');
        row.className = `nb-callout${i === count - 1 ? ' nb-callout--why' : ''}`;
        const math = document.createElement('div');
        row.appendChild(math);
        renderTex(math, line.tex);
        if (line.note) {
          const note = document.createElement('small');
          note.textContent = line.note;
          row.appendChild(note);
        }
        box.appendChild(row);
      });
    },
  };
}
