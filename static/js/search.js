// Navbar search: fetches the catalogue index on first use, then filters it in the browser as the student types.
const MAX_RESULTS = 25;
const KIND_LABELS = { subject: 'Subject', box: 'Topic' };

const form = document.querySelector('.nb-search');
if (form) {
  const input = form.querySelector('.nb-search__input');
  const panel = form.querySelector('.nb-search__panel');
  const list = form.querySelector('.nb-search__list');
  const status = form.querySelector('.nb-search__status');
  let index = null;
  let loading = null;
  let active = -1;

  const normalise = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function load() {
    loading ??= fetch(form.dataset.index)
      .then((response) => {
        if (!response.ok) throw new Error(`search index: ${response.status}`);
        return response.json();
      })
      .then((entries) => {
        index = entries.map((entry) => ({
          ...entry,
          titleText: normalise(entry.title),
          allText: normalise(`${entry.title} ${entry.where}`),
        }));
        update();
      })
      .catch(() => {
        loading = null;
        showStatus('Search isn\'t available right now. Try again in a moment.');
      });
  }

  // 0 = title starts with the query, 1 = every word is in the title, 2 = matched through its subject or topic.
  function rank(entry, query, words) {
    if (entry.titleText.startsWith(query)) return 0;
    return words.every((word) => entry.titleText.includes(word)) ? 1 : 2;
  }

  function search(text) {
    const query = normalise(text.trim());
    const words = query.split(/\s+/);
    return index
      .filter((entry) => words.every((word) => entry.allText.includes(word)))
      .map((entry, i) => ({ entry, i, score: rank(entry, query, words) }))
      .sort((a, b) => a.score - b.score || a.i - b.i)
      .map(({ entry }) => entry);
  }

  function badge(text, modifier) {
    const el = document.createElement('span');
    el.className = modifier ? `nb-badge nb-badge--${modifier}` : 'nb-badge';
    el.textContent = text;
    return el;
  }

  function resultLink(entry, i) {
    const link = document.createElement('a');
    link.className = 'nb-search__result';
    link.id = `nb-search-${i}`;
    link.href = entry.url;
    link.setAttribute('role', 'option');
    link.setAttribute('aria-selected', 'false');
    link.tabIndex = -1;

    const title = document.createElement('span');
    title.className = 'nb-search__title';
    title.textContent = entry.title;

    const meta = document.createElement('span');
    meta.className = 'nb-search__meta';
    if (entry.kind === 'tool') {
      meta.append(badge(entry.tag, entry.tag.toLowerCase()));
      if (entry.live) meta.append(badge('Live', 'live'));
    } else {
      meta.append(badge(KIND_LABELS[entry.kind]));
    }
    if (entry.where) {
      const where = document.createElement('span');
      where.textContent = entry.where;
      meta.append(where);
    }
    link.append(title, meta);
    return link;
  }

  function open() {
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    form.classList.add('is-open');
  }

  function close() {
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    form.classList.remove('is-open');
    active = -1;
  }

  function showStatus(message) {
    list.replaceChildren();
    status.textContent = message;
    open();
  }

  function update() {
    active = -1;
    input.removeAttribute('aria-activedescendant');
    if (!input.value.trim()) {
      close();
      return;
    }
    if (!index) {
      showStatus('Loading…');
      load();
      return;
    }
    const matches = search(input.value);
    if (!matches.length) {
      showStatus('No matches. Try a different word.');
      return;
    }
    list.replaceChildren(...matches.slice(0, MAX_RESULTS).map(resultLink));
    status.textContent = matches.length > MAX_RESULTS
      ? `Showing ${MAX_RESULTS} of ${matches.length}. Type more to narrow it down.`
      : `${matches.length} ${matches.length === 1 ? 'result' : 'results'}`;
    open();
  }

  function move(step) {
    const links = [...list.children];
    if (!links.length) return;
    links[active]?.setAttribute('aria-selected', 'false');
    active = (active + step + links.length) % links.length;
    links[active].setAttribute('aria-selected', 'true');
    links[active].scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', links[active].id);
  }

  input.addEventListener('focus', () => {
    load();
    if (input.value.trim()) update();
  });
  input.addEventListener('input', update);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (panel.hidden) update();
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Escape') {
      close();
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const target = list.children[Math.max(active, 0)];
    if (!panel.hidden && target) window.location.assign(target.href);
  });
  document.addEventListener('pointerdown', (event) => {
    if (!form.contains(event.target)) close();
  });
}
