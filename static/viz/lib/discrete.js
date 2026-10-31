// Finite, countable pictures: dot grids, clickable cell grids and probability trees.
//   dotLayout(n, w, h)                  rows and spacing for n dots; dotGrid(ctx, box, n, paint) draws them
//   cellGrid(root, { rows, cols, cell, onPress }) real <button> cells, so keyboards work; .refresh()
//   drawTree(ctx, box, tree, c)         tree = { label, value?, kids: [{ edge, ...tree }], fill? }
//   venn(ctx, box, c, { a, b, both, none }, { names, counts })  two sets; each of the four regions gets a fill
//   drawRelation(ctx, box, c, items, has, opts)  dots with arrows; has(a, b) says if the arrow is there
import { arc, arrow, dot, line, label, TAU } from './draw.js';

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

// Regions are painted one at a time on opaque paper, so each one shows exactly its own fill.
export function venn(ctx, box, c, fills, { names = ['A', 'B'], counts = null } = {}) {
  const r = Math.min(box.w * 0.27, box.h * 0.38);
  const [ax, bx, y] = [box.x + box.w / 2 - r * 0.62, box.x + box.w / 2 + r * 0.62, box.y + box.h / 2];
  const disc = (x) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
  };
  const paint = (fill) => {
    ctx.fillStyle = c.paper;
    ctx.fill();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
  };
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  paint(fills.none);
  disc(ax);
  paint(fills.a);
  disc(bx);
  paint(fills.b);
  ctx.save();
  disc(ax);
  ctx.clip();
  disc(bx);
  paint(fills.both);
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  disc(ax);
  ctx.stroke();
  disc(bx);
  ctx.stroke();
  label(ctx, names[0], ax - r * 0.7, y - r * 0.92, c, { size: 13 });
  label(ctx, names[1], bx + r * 0.7, y - r * 0.92, c, { size: 13 });
  if (counts) {
    label(ctx, String(counts.a), ax - r * 0.55, y, c, { size: 15 });
    label(ctx, String(counts.both), box.x + box.w / 2, y, c, { size: 15 });
    label(ctx, String(counts.b), bx + r * 0.55, y, c, { size: 15 });
    if (counts.none !== undefined) label(ctx, String(counts.none), box.x + box.w - 10, box.y + box.h - 16, c, { size: 14, align: 'right' });
  }
}

export function drawRelation(ctx, box, c, items, has, { highlight = () => false } = {}) {
  const r = Math.min(box.w, box.h) * 0.34;
  const [cx, cy] = [box.x + box.w / 2, box.y + box.h / 2];
  const at = (i) => {
    const a = -Math.PI / 2 + (i * TAU) / items.length;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a), a];
  };
  items.forEach((p, i) => items.forEach((q, j) => {
    if (!has(p, q)) return;
    const color = highlight(p, q) ? c.a : c.ink;
    const [x1, y1, angle] = at(i);
    if (i === j) {
      arc(ctx, x1 + 26 * Math.cos(angle), y1 + 26 * Math.sin(angle), 15, 0, TAU, { color, width: 2 });
      return;
    }
    const [x2, y2] = at(j);
    const [dx, dy] = [x2 - x1, y2 - y1];
    const size = Math.hypot(dx, dy);
    const [ux, uy, nx, ny] = [dx / size, dy / size, -dy / size * 7, dx / size * 7];   // two-way arrows sit side by side
    arrow(ctx, x1 + ux * 20 + nx, y1 + uy * 20 + ny, x2 - ux * 20 + nx, y2 - uy * 20 + ny, { color, width: 2 });
  }));
  items.forEach((p, i) => {
    const [x, y] = at(i);
    dot(ctx, x, y, 16, c.fillY, c.ink);
    label(ctx, String(p), x, y, c, { size: 14, patch: false });
  });
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
