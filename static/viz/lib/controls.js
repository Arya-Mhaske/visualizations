// Controls bound to one state object, so no value is ever hidden.
//   const ui = bindControls(panelEl, state, spec, onChange);
//   ui.refresh()        re-reads state into the inputs and readouts (call after the stage changes state)
// spec is a list of:
//   { title }                                     panel heading
//   { text }                                      one short line
//   { key, label, min, max, step, format? }       slider with a live number
//   { key, label, toggle: true }                  checkbox switch
//   { key, label, options: [[value, text], ...] } segmented control
//   { button, onClick, ghost?, id? }              button (a row of them: { row: [...] })
//   { readout: [[label, state => value], ...] }   live .viz-readout; a value may be {text, good: bool}
// bindRange and bindChoice are the older one-input helpers, still used by the 360° tool.
let nextId = 0;

function field(parent, tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (parent) parent.appendChild(node);
  return node;
}

function slider(parent, item, state, changed) {
  const wrap = field(parent, 'div', 'nb-field');
  const id = `ctl-${++nextId}`;
  const label = field(wrap, 'label', 'nb-label');
  label.htmlFor = id;
  label.append(`${item.label} `);
  const output = field(label, 'output');
  const input = field(wrap, 'input', 'nb-range');
  Object.assign(input, { id, type: 'range', min: item.min, max: item.max, step: item.step ?? 1 });
  const format = item.format || String;
  const show = () => {
    input.value = state[item.key];
    output.textContent = format(state[item.key]);
  };
  input.addEventListener('input', () => {
    state[item.key] = Number(input.value);
    output.textContent = format(state[item.key]);
    changed();
  });
  return show;
}

function toggle(parent, item, state, changed) {
  const label = field(parent, 'label', 'nb-switch');
  const input = field(label, 'input');
  input.type = 'checkbox';
  label.append(` ${item.label}`);
  input.addEventListener('change', () => {
    state[item.key] = input.checked;
    changed();
  });
  return () => { input.checked = Boolean(state[item.key]); };
}

function segmented(parent, item, state, changed) {
  const wrap = field(parent, 'div', 'nb-field');
  const heading = field(wrap, 'span', 'nb-label');
  heading.id = `ctl-${++nextId}`;
  heading.textContent = item.label;
  const group = field(wrap, 'div', 'nb-segmented');
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-labelledby', heading.id);
  const name = `seg-${nextId}`;
  const inputs = item.options.map(([value, text], i) => {
    const input = field(group, 'input');
    Object.assign(input, { type: 'radio', name, id: `${name}-${i}` });
    const label = field(group, 'label');
    label.htmlFor = input.id;
    label.textContent = text;
    input.addEventListener('change', () => {
      if (input.checked) {
        state[item.key] = value;
        changed();
      }
    });
    return [input, value];
  });
  return () => { for (const [input, value] of inputs) input.checked = state[item.key] === value; };
}

function button(parent, item) {
  const node = field(parent, 'button', item.ghost ? 'nb-btn nb-btn--ghost' : 'nb-btn');
  node.type = 'button';
  node.textContent = item.button;
  node.addEventListener('click', item.onClick);
  if (item.id) node.id = item.id;
  return node;
}

export function readout(parent, rows, state) {
  const list = field(parent, 'dl', 'viz-readout');
  const cells = rows.map(([name, value]) => {
    field(list, 'dt').textContent = name;
    return [field(list, 'dd'), value];
  });
  const update = () => {
    for (const [cell, value] of cells) {
      const shown = value(state);
      if (shown !== null && typeof shown === 'object') {
        const span = document.createElement('span');
        span.className = shown.good ? 'is-good' : 'is-bad';
        span.textContent = shown.text;
        cell.replaceChildren(span);
      } else {
        cell.textContent = shown;
      }
    }
  };
  update();
  return update;
}

export function bindControls(panel, state, spec, onChange = () => {}) {
  const updates = [];
  const stack = field(panel, 'div', 'nb-stack');
  const refresh = () => updates.forEach((update) => update());
  const changed = () => {
    onChange(state);
    refresh();
  };
  for (const item of spec) {
    if (item.title) field(stack, 'h2', 'viz-panel__title').textContent = item.title;
    else if (item.text) field(stack, 'p', 'nb-mb-0').textContent = item.text;
    else if (item.readout) updates.push(readout(stack, item.readout, state));
    else if (item.button) button(stack, item);
    else if (item.row) {
      const row = field(stack, 'div', 'nb-row');
      item.row.forEach((entry) => {
        if (entry.toggle) updates.push(toggle(row, entry, state, changed));
        else button(row, entry);
      });
    } else if (item.toggle) updates.push(toggle(stack, item, state, changed));
    else if (item.options) updates.push(segmented(stack, item, state, changed));
    else updates.push(slider(stack, item, state, changed));
  }
  refresh();
  return { refresh, changed };
}

// Binds a range input to its <output>; onChange(value) runs on every input event.
export function bindRange(input, output, onChange, format = (v) => String(v)) {
  const update = () => {
    const value = Number(input.value);
    output.textContent = format(value);
    onChange(value);
  };
  input.addEventListener('input', update);
  output.textContent = format(Number(input.value));
  return {
    set(value) {
      input.value = value;
      output.textContent = format(Number(input.value));
    },
  };
}

// Binds a radio group (by name) and calls onChange(value) when the choice changes.
export function bindChoice(root, name, onChange) {
  const inputs = root.querySelectorAll(`input[name="${name}"]`);
  for (const input of inputs) {
    input.addEventListener('change', () => { if (input.checked) onChange(input.value); });
  }
}
