// Finite, countable pictures: dot grids, clickable cell grids and probability trees.
//   dotLayout(n, w, h)                  rows and spacing for n dots; dotGrid(ctx, box, n, paint) draws them
//   cellGrid(root, { rows, cols, cell, onPress }) real <button> cells, so keyboards work; .refresh()
//   drawTree(ctx, box, tree, c)         tree = { label, value?, kids: [{ edge, ...tree }], fill? }
// Venn diagrams and table grids arrive with the first box that needs them (numbers-algebra/sets).
import { dot, line, label } from './draw.js';

export function dotLayout(n, w, h) {
  const cols = Math.max(1, Math.ceil(Math.sqrt((n * w) / h)));
  const rows = Math.ceil(n / cols);
  return { cols, rows, step: Math.min(w / cols, h / rows) };
}

// paint(i) -> a fill colour for dot i. box: { x, y, w, h }. An outline shows only when dots are large enough.
export function dotGrid(ctx, box, n, paint, ink) {
  const { cols, rows, step } = dotLayout(n, box.w, box.h);
  const left = box.x + (box.w - cols * step) / 2;
  const top = box.y + (box.h - rows * step) / 2;
  const radius = step * 0.4;
  for (let i = 0; i < n; i++) {
    const x = left + ((i % cols) + 0.5) * step;
    const y = top + (Math.floor(i / cols) + 0.5) * step;
    dot(ctx, x, y, radius, paint(i), radius > 5 ? ink : null, 1.5);
  }
}

// cell(r, c) -> { text, state, label }; state is '', 'on', 'off' or 'mark', styled by .viz-cell in brutal.css.
export function cellGrid(root, { rows, cols, cell, onPress = null }) {
  const grid = document.createElement('div');
  grid.className = 'viz-cells';
  grid.dataset.cols = cols;
  root.appendChild(grid);
  const nodes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const node = document.createElement(onPress ? 'button' : 'div');
      node.className = 'viz-cell';
      if (onPress) {
        node.type = 'button';
        node.addEventListener('click', () => onPress(r, c));
      }
      grid.appendChild(node);
      nodes.push([node, r, c]);
    }
  }
  const refresh = () => {
    for (const [node, r, c] of nodes) {
      const { text = '', state = '', label: name = '' } = cell(r, c);
      node.textContent = text;
      node.dataset.state = state;
      if (name) node.setAttribute('aria-label', name);
    }
  };
  refresh();
  return { refresh };
}

function leaves(tree) {
  return tree.kids?.length ? tree.kids.reduce((sum, kid) => sum + leaves(kid), 0) : 1;
}

function depth(tree) {
  return tree.kids?.length ? 1 + Math.max(...tree.kids.map(depth)) : 0;
}

// A left-to-right tree. Each kid's `edge` text sits on its branch.
export function drawTree(ctx, box, tree, c) {
  const across = box.w / (depth(tree) + 0.9);
  const place = (node, x, top, height) => {
    const y = top + height / 2;
    let next = top;
    for (const kid of node.kids || []) {
      const share = (height * leaves(kid)) / leaves(node);
      const kx = x + across;
      const ky = next + share / 2;
      line(ctx, x, y, kx, ky, { color: kid.color || c.ink, width: kid.width ?? 2 });
      if (kid.edge) label(ctx, kid.edge, (x + kx) / 2, (y + ky) / 2, c, { size: 11 });
      place(kid, kx, next, share);
      next += share;
    }
    dot(ctx, x, y, 6, node.fill || c.paper, c.ink, 2);
    if (node.label) {
      const leaf = !node.kids?.length;
      label(ctx, node.label, x + (leaf ? 10 : 0), leaf ? y : y - 14, c, { size: 11, align: leaf ? 'left' : 'center', bounds: { w: box.x + box.w } });
    }
  };
  place(tree, box.x + 12, box.y, box.h);
}
