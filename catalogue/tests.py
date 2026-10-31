import json
import shutil
import subprocess
import tempfile
from io import StringIO
from pathlib import Path
from unittest import mock, skipUnless

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings

from .models import Tile

LOADER = 'catalogue.management.commands.load_catalogue.DATA_DIR'
PLAIN_STATIC = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
}


def load():
    out = StringIO()
    call_command('load_catalogue', stdout=out)
    return out.getvalue()


def tool(slug, tag='WHY', **extra):
    return {'slug': slug, 'title': slug.title(), 'tag': tag, **extra}


@override_settings(STORAGES=PLAIN_STATIC)
class CatalogueTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        load()

    def test_catalogue_loads(self):
        trig = Tile.objects.get(slug='trigonometry', parent=None)
        self.assertEqual(trig.children.count(), 12)
        self.assertEqual(Tile.objects.filter(kind='tool').count(), 124)

    def test_summary_line(self):
        self.assertIn('trigonometry: 12 boxes, 124 tools (1 live, 123 placeholders)', load())

    def test_loader_is_idempotent(self):
        before = list(Tile.objects.order_by('pk').values_list('pk', 'slug', 'title'))
        load()
        load()
        after = list(Tile.objects.order_by('pk').values_list('pk', 'slug', 'title'))
        self.assertEqual(before, after)

    def test_max_twelve_children(self):
        box = Tile.objects.get(slug='angles-arcs')
        self.assertEqual(box.children.count(), 12)
        extra = Tile(parent=box, slug='thirteenth', title='Too many', kind='tool', tag='WHY')
        with self.assertRaises(ValidationError):
            extra.full_clean()

    def test_every_url_returns_200(self):
        urls = ['/', '/trigonometry/'] + [t.url for t in Tile.objects.exclude(parent=None)]
        self.assertEqual(len(urls), 2 + 12 + 124)
        for url in urls:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)

    def test_live_and_placeholder(self):
        live = self.client.get('/trigonometry/angles-arcs/why-360-degrees/')
        self.assertTemplateUsed(live, 'tools/trigonometry/angles-arcs/why-360-degrees.html')
        self.assertTemplateNotUsed(live, 'tools/placeholder.html')
        self.assertContains(live, 'katex@0.16.11')
        other = self.client.get('/trigonometry/angles-arcs/what-is-an-angle-really/')
        self.assertTemplateUsed(other, 'tools/placeholder.html')
        self.assertNotContains(other, 'katex')

    def test_unknown_paths_404(self):
        for url in ['/nope/', '/trigonometry/nope/', '/trigonometry/angles-arcs/nope/',
                    '/trigonometry/angles-arcs/why-360-degrees/extra/', '/trigonometry/unit-circle/why-360-degrees/']:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 404)

    def test_landing_and_grid_content(self):
        landing = self.client.get('/')
        self.assertContains(landing, 'MuskMelon')
        self.assertNotContains(landing, 'nb-nav')
        self.assertNotContains(landing, 'See why')
        self.assertContains(landing, '124 tools')
        self.assertEqual(landing.content.decode().count('is-empty'), 3)
        box = self.client.get('/trigonometry/angles-arcs/')
        self.assertContains(box, 'nb-badge--live')
        self.assertContains(box, 'is-soon')
        self.assertNotContains(box, 'IN: ')
        self.assertNotContains(box, 'empty slot')
        self.assertNotContains(box, 'nb-logo')
        self.assertContains(box, 'nb-nav')


class DivisorFactTests(TestCase):
    """The counts the 360° tool displays (CLAUDE.md §7)."""
    EXPECTED = {360: (16, 24), 365: (2, 4), 100: (7, 9), 400: (9, 15)}

    @staticmethod
    def divisors(total):
        return [d for d in range(1, total + 1) if total % d == 0]

    def test_python_counts(self):
        for total, (clean, every) in self.EXPECTED.items():
            with self.subTest(total=total):
                divs = self.divisors(total)
                self.assertEqual(len([d for d in divs if d <= 36]), clean)
                self.assertEqual(len(divs), every)

    @skipUnless(shutil.which('node'), 'node not installed')
    def test_js_module_agrees(self):
        math_js = Path(settings.BASE_DIR) / 'static/viz/tools/trigonometry/why-360-math.js'
        script = (f"import * as m from {json.dumps(math_js.as_uri())};"
                  "const o={};for(const t of m.TOTALS)o[t]=[m.cleanSplits(t),m.divisorCount(t)];"
                  "console.log(JSON.stringify(o));")
        result = subprocess.run(['node', '--input-type=module', '-e', script],
                                capture_output=True, text=True, check=True)
        got = {int(k): tuple(v) for k, v in json.loads(result.stdout).items()}
        self.assertEqual(got, self.EXPECTED)


class LoaderErrorTests(TestCase):
    def run_with(self, data):
        tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, tmp)
        (tmp / 'x.json').write_text(json.dumps(data), encoding='utf-8')
        with mock.patch(LOADER, tmp):
            return load()

    def subject(self, children):
        return {'slug': 'x', 'title': 'X', 'children': children}

    def box(self, tools, slug='b'):
        return {'slug': slug, 'title': 'B', 'children': tools}

    def test_too_many_children(self):
        tools = [tool(f't{i}') for i in range(13)]
        with self.assertRaisesRegex(CommandError, '13 children'):
            self.run_with(self.subject([self.box(tools)]))
        self.assertEqual(Tile.objects.count(), 0)

    def test_duplicate_sibling_slugs(self):
        with self.assertRaisesRegex(CommandError, 'duplicate sibling slug "t"'):
            self.run_with(self.subject([self.box([tool('t'), tool('t')])]))

    def test_missing_title_or_slug(self):
        with self.assertRaisesRegex(CommandError, 'missing a title'):
            self.run_with(self.subject([self.box([{'slug': 't', 'tag': 'WHY'}])]))
        with self.assertRaisesRegex(CommandError, 'missing a slug'):
            self.run_with(self.subject([self.box([{'title': 'T', 'tag': 'WHY'}])]))

    def test_bad_tag(self):
        with self.assertRaisesRegex(CommandError, 'WHY, HOW, APP'):
            self.run_with(self.subject([self.box([tool('t', tag='FUN')])]))

    def test_stale_tiles_deleted_and_failure_rolls_back(self):
        self.run_with(self.subject([self.box([tool('a'), tool('b')])]))
        self.assertEqual(Tile.objects.filter(kind='tool').count(), 2)
        self.run_with(self.subject([self.box([tool('a')])]))
        self.assertEqual(Tile.objects.filter(kind='tool').count(), 1)
        with self.assertRaises(CommandError):
            self.run_with(self.subject([self.box([tool('a', tag='NOPE')])]))
        self.assertEqual(Tile.objects.filter(kind='tool').count(), 1)
