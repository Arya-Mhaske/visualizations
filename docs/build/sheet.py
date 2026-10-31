"""Contact sheet of a box's stages, for looking at the pictures. Run from the repo root.

    python docs/build/sheet.py measurement-motion/units-measurement          stages at 1280 px
    python docs/build/sheet.py measurement-motion/units-measurement 360      stages at 360 px
    python docs/build/sheet.py measurement-motion/units-measurement 360 unit stage and panel, slugs with "unit"

Writes screenshots/sheet.png. Open it and look: smoke_tools can't tell a wrong picture from a right one.
"""
import base64
import json
import socket
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

PORT = 8765
ROOT = Path(__file__).resolve().parents[2]


def main():
    box = sys.argv[1]
    width = int(sys.argv[2]) if len(sys.argv) > 2 else 1280
    only = sys.argv[3] if len(sys.argv) > 3 else None
    subject, name = box.split('/')
    data = json.loads((ROOT / f'catalogue/data/{subject}.json').read_text(encoding='utf-8'))
    slugs = [tool['slug'] for child in data['children'] if child['slug'] == name for tool in child['children']
             if only is None or only in tool['slug']]
    slugs = [slug for slug in slugs if (ROOT / f'templates/tools/{box}/{slug}.html').exists()]
    server = subprocess.Popen([sys.executable, 'manage.py', 'runserver', '--noreload', f'127.0.0.1:{PORT}'],
                              cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        with socket.socket() as sock:
            if sock.connect_ex(('127.0.0.1', PORT)) == 0:
                break
        time.sleep(0.1)
    try:
        cells = []
        with sync_playwright() as driver:
            browser = driver.chromium.launch()
            page = browser.new_page(viewport={'width': width, 'height': 800})
            for slug in slugs:
                page.goto(f'http://127.0.0.1:{PORT}/{box}/{slug}/', wait_until='load')
                page.add_style_tag(content='.nb-nav{position:static!important}')   # sticky bar would cover the stage
                page.wait_for_timeout(450)
                png = page.locator('.viz-body' if only is not None else '#stage').screenshot()
                formula = page.locator('.viz-formula')
                text = formula.text_content() if formula.count() else ''
                cells.append((slug, base64.b64encode(png).decode(), text.strip()[:60]))
            sheet = browser.new_page(viewport={'width': 1400, 'height': 900})
            sheet.set_content(
                f'<body style="margin:6px;font:11px monospace"><div style="display:grid;gap:6px;'
                f'grid-template-columns:repeat({2 if only is not None else 4},1fr)">'
                + ''.join(f'<div><div>{slug[:44]}</div><img style="width:100%" src="data:image/png;base64,{png}">'
                          f'<div>{text}</div></div>' for slug, png, text in cells) + '</div>')
            sheet.wait_for_timeout(200)
            (ROOT / 'screenshots').mkdir(exist_ok=True)
            sheet.screenshot(path=str(ROOT / 'screenshots/sheet.png'), full_page=True)
            browser.close()
    finally:
        server.terminate()


if __name__ == '__main__':
    main()
