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
