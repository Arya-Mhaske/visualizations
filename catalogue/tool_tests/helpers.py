"""Shared helpers for per-box maths tests (CLAUDE.md §7).

Each test states the expected facts in Python, worked out independently of the JS. js() then runs the
real module under Node and returns the value, so the shown numbers are checked and not only a mirror of them.
Node is a test aid only, so those tests skip without it.
"""
import json
import shutil
import subprocess
from pathlib import Path
from unittest import skipUnless

from django.conf import settings

needs_node = skipUnless(shutil.which('node'), 'node not installed')
STATIC = Path(settings.BASE_DIR) / 'static/viz'


def js(module, expression):
    """Evaluate `expression` with `m` bound to static/viz/<module> and return it, decoded from JSON."""
    script = (f'import * as m from {json.dumps((STATIC / module).as_uri())};'
              f'console.log(JSON.stringify({expression}));')
    result = subprocess.run(['node', '--input-type=module', '-e', script],
                            capture_output=True, text=True, check=True, encoding='utf-8')
    return json.loads(result.stdout)
