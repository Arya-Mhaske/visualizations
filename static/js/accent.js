// Gives each [data-random-accent] element a random accent colour class on every page load.
const ACCENTS = ['yellow', 'coral', 'sky', 'green', 'orange', 'lavender'];
for (const el of document.querySelectorAll('[data-random-accent]')) {
  el.classList.add(`nb-btn--${ACCENTS[Math.floor(Math.random() * ACCENTS.length)]}`);
}
