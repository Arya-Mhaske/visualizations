"""Load live tools in a real browser and fail on anything a student would hit.

    python manage.py smoke_tools --box trigonometry/angles-arcs
    python manage.py smoke_tools --changed      tools touched since the last commit
    python manage.py smoke_tools --all
    python manage.py smoke_tools --all --offline   blocks the KaTeX CDN, proving the plain-text fallback

Each tool is checked at 360 px, 1280 px and 360 px with reduced motion, for: console and page errors,
horizontal scroll, a blank stage, missing §5 sections, an H1 that differs from the catalogue title, a
stage with no aria-label, unlabelled inputs, and JS over the 25 KB budget. At 1280 px it also moves the
first slider and presses arrow keys on a focusable stage (something must respond), presses Play (the
stage must move), answers a drill question (feedback must appear) and presses every button (nothing may
throw). Needs requirements-dev.txt.
"""
import base64
import json
import socket
import subprocess
import sys
import time

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from catalogue.models import Tile
from catalogue.paths import LiveChecker

VIEWS = [(360, 800, 'no-preference'), (1280, 800, 'no-preference'), (360, 800, 'reduce')]
MANIFEST = settings.BASE_DIR / 'docs/build/manifest.json'
MAX_JS_BYTES = 25 * 1024
MIN_INK_SHARE = 0.002

# Runs in the page: how much of a PNG differs from its most common colour.
INK_SHARE = """async (png) => {
  const image = new Image();
  image.src = 'data:image/png;base64,' + png;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.width; canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const counts = new Map();
  for (let i = 0; i < data.length; i += 16) {
    const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return 1 - Math.max(...counts.values()) / (data.length / 16);
}"""

# Runs in the page: every structural rule at once, returned as a list of problems.
AUDIT = """(needsFormula) => {
  const problems = [];
  const text = (sel) => (document.querySelector(sel)?.textContent || '').trim();
  const need = { '.viz-head__lead': 'lead', '.viz-why .nb-callout--why': 'So why', '.viz-source': 'source' };
  for (const [sel, name] of Object.entries(need)) if (!text(sel)) problems.push('empty section: ' + name);
  for (const sel of ['.viz-stage', '.viz-panel', '.viz-next']) {
    if (!document.querySelector(sel)) problems.push('missing ' + sel);
  }
  if (needsFormula && !text('.viz-formula')) problems.push('empty .viz-formula');
  const tries = document.querySelectorAll('.viz-try li').length;
  if (tries < 2 || tries > 4) problems.push(tries + ' Try this prompts (want 2 to 4)');
  const stage = document.querySelector('#stage');
  if (stage && !stage.querySelector('[aria-label]') && !stage.hasAttribute('aria-label')) {
    problems.push('stage has no aria-label');
  }
  if (!document.querySelector('.viz-readout') && !stage?.querySelector('.viz-worked, .viz-drill')) {
    problems.push('no live .viz-readout');
  }
  for (const input of document.querySelectorAll('input, select, textarea')) {
    if (input.closest('[role="search"], .nb-nav, nav')) continue;
    if (!input.labels?.length && !input.getAttribute('aria-label')) problems.push('unlabelled input ' + (input.id || input.type));
  }
  const root = document.documentElement;
  if (root.scrollWidth > root.clientWidth) problems.push('horizontal scroll: ' + root.scrollWidth + ' > ' + root.clientWidth);
  return problems;
}"""


# Runs in the page: a fingerprint of everything a student can see change.
SIGNATURE = """() => [...document.querySelectorAll('#stage canvas')].map((c) => c.toDataURL()).join()
  + document.querySelector('#stage').innerText + (document.querySelector('.viz-formula')?.textContent || '')
  + [...document.querySelectorAll('.viz-readout')].map((r) => r.innerText).join()"""

MOVE_SLIDER = """() => {
  const input = [...document.querySelectorAll('#panel input[type=range]')].find((el) => el.offsetParent);
  if (!input) return false;
  input.value = input.value === input.max ? input.min : input.max;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}"""


def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def manifest_exempt(manifest):
    """Multi-view tools whose stage only responds in a later view."""
    return {path for path, entry in manifest.items() if entry.get('no_response_check')}


def changed_files():
    listed = subprocess.run(['git', 'status', '--porcelain', '-uall'], capture_output=True, text=True,
                            cwd=settings.BASE_DIR, check=True).stdout
    return [line[3:].strip().strip('"') for line in listed.splitlines()]


class Command(BaseCommand):
    help = 'Browser smoke test for live tools at 360 and 1280 px.'

    def add_arguments(self, parser):
        parser.add_argument('--box', action='append', default=[], help='subject/box; may repeat')
        parser.add_argument('--tool', action='append', default=[], help='subject/box/tool; may repeat')
        parser.add_argument('--changed', action='store_true')
        parser.add_argument('--all', action='store_true')
        parser.add_argument('--offline', action='store_true')

    def choose(self, options):
        call_command('load_catalogue', verbosity=0, stdout=open('nul' if sys.platform == 'win32' else '/dev/null', 'w'))
        live = LiveChecker()
        tools = [tile for tile in Tile.objects.filter(kind='tool').select_related('parent__parent') if live(tile)]
        if options['all']:
            return tools
        changed = ' '.join(changed_files()) if options['changed'] else ''
        chosen = []
        for tile in tools:
            path = '/'.join(tile.slug_path)
            if (path.rsplit('/', 1)[0] in options['box'] or path in options['tool']
                    or f'{tile.slug_path[0]}/{tile.slug}.' in changed or f'{tile.slug}-math' in changed
                    or f'{path}.html' in changed):
                chosen.append(tile)
        return chosen

    def handle(self, *args, **options):
        try:
            from playwright.sync_api import sync_playwright
        except ImportError as error:
            raise CommandError('Install the dev tools: pip install -r requirements-dev.txt') from error
        tools = self.choose(options)
        if not tools:
            raise CommandError('No live tools matched.')
        manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
        port = free_port()
        server = subprocess.Popen([sys.executable, 'manage.py', 'runserver', '--noreload', f'127.0.0.1:{port}'],
                                  cwd=settings.BASE_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        failures = []
        try:
            self.wait_for(port)
            with sync_playwright() as driver:
                browser = driver.chromium.launch()
                for tile in tools:
                    failures += self.check_tool(browser, port, tile, manifest, options['offline'])
                browser.close()
        finally:
            server.terminate()
        for failure in failures:
            self.stdout.write(self.style.ERROR(failure))
        self.stdout.write(f'{len(tools)} tools, {len(VIEWS)} views each, {len(failures)} problems')
        if failures:
            raise CommandError('Smoke test failed.')

    @staticmethod
    def wait_for(port):
        for _ in range(100):
            with socket.socket() as sock:
                if sock.connect_ex(('127.0.0.1', port)) == 0:
                    return
            time.sleep(0.1)
        raise CommandError('The test server did not start.')

    @staticmethod
    def responds(page):
        problems = []
        before = page.evaluate(SIGNATURE)
        if page.evaluate(MOVE_SLIDER):
            page.wait_for_timeout(150)
            after = page.evaluate(SIGNATURE)
            if after == before:
                problems.append('moving the first slider changed nothing')
            before = after
        canvas = page.locator('#stage canvas[tabindex]')
        if canvas.count():
            canvas.first.focus()
            # The slider above may have left a value at its limit, so try both directions.
            for keys in (('ArrowLeft', 'ArrowDown'), ('ArrowRight', 'ArrowUp')):
                for key in keys * 2:
                    page.keyboard.press(key)
                page.wait_for_timeout(150)
                if page.evaluate(SIGNATURE) != before:
                    break
            else:
                problems.append('arrow keys on the stage changed nothing')
        play = page.get_by_role('button', name='Play', exact=True)
        if play.count():
            before = page.evaluate(SIGNATURE)
            play.first.click()
            page.wait_for_timeout(500)
            if page.evaluate(SIGNATURE) == before:
                problems.append('Play changed nothing')
        option = page.locator('.viz-drill__options button')
        if option.count():
            option.first.click()
            if not page.locator('.viz-drill__note[data-state]').count():
                problems.append('answering a drill question gave no feedback')
        page.evaluate("""() => document.querySelectorAll('#panel button, #stage button').forEach((b) => b.click())""")
        page.wait_for_timeout(150)
        return problems

    def check_tool(self, browser, port, tile, manifest, offline):
        path = '/'.join(tile.slug_path)
        script = settings.BASE_DIR / 'static/viz/tools' / tile.slug_path[0] / f'{tile.slug}.js'
        failures = []
        if script.exists() and script.stat().st_size > MAX_JS_BYTES:
            failures.append(f'{path}: JS is {script.stat().st_size // 1024} KB')
        needs_formula = manifest.get(path, {}).get('formula', True)
        for width, height, motion in VIEWS:
            context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion=motion)
            page = context.new_page()
            problems = []
            page.on('console', lambda msg: problems.append(f'console: {msg.text}')
                    if msg.type == 'error' and 'net::ERR_FAILED' not in msg.text else None)
            page.on('pageerror', lambda error: problems.append(f'page error: {error}'))
            page.on('response', lambda r: problems.append(f'{r.status}: {r.url}') if r.status >= 400 else None)
            page.route('**/fonts.g*/**', lambda route: route.abort())
            if offline:
                page.route('**/cdn.jsdelivr.net/**', lambda route: route.abort())
            page.goto(f'http://127.0.0.1:{port}/{path}/', wait_until='load')
            page.wait_for_timeout(350)
            heading = (page.text_content('h1') or '').strip()
            if heading != tile.title:
                problems.append(f'H1 is {heading!r}')
            problems += page.evaluate(AUDIT, needs_formula)
            png = page.locator('#stage').screenshot()
            ink = page.evaluate(INK_SHARE, base64.b64encode(png).decode('ascii'))
            if ink < MIN_INK_SHARE:
                problems.append(f'blank stage ({ink:.4f} ink)')
            if width > 1000 and path not in manifest_exempt(manifest):
                problems += self.responds(page)
            failures += [f'{path} @{width}{" reduced" if motion == "reduce" else ""}: {p}' for p in problems]
            context.close()
        self.stdout.write(f"{'FAIL' if failures else 'ok  '} {path}")
        return failures
