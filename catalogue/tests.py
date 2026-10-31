import json
import re
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
from django.db import connection
from django.db.models import Count
from django.test import TestCase, override_settings
from django.test.utils import CaptureQueriesContext

from .management.commands.load_catalogue import DATA_DIR
from .models import Tile, TileAid
from .views import GROUPS, GROUPS_BY_SLUG

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
    return {'slug': slug, 'title': slug.title(), 'tag': tag, 'summary': 'S', 'sections': '1.1',
            'extension': False, 'order': 1, 'aids': [], **extra}


@override_settings(STORAGES=PLAIN_STATIC)
class CatalogueTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        load()

    def test_catalogue_loads(self):
        trig = Tile.objects.get(slug='trigonometry', parent=None)
        self.assertEqual(trig.children.count(), 12)
        self.assertTrue(trig.source.startswith('Barnett'))
        self.assertEqual(Tile.objects.filter(kind='subject').count(), 30)
        self.assertEqual(Tile.objects.filter(kind='tool').count(), 1538)

    def test_summary_line(self):
        output = load()
        self.assertIn('trigonometry: 12 boxes, 135 tools (1 live, 134 placeholders)', output)
        self.assertIn('30 subjects, 256 boxes, 1538 tools (1 live, 1537 placeholders), '
                      '1385 aid links, 0 broken aids', output)

    def test_every_aid_resolves_in_json_order(self):
        self.assertEqual(TileAid.objects.count(), 1385)
        for path in sorted(DATA_DIR.glob('*.json')):
            subject = json.loads(path.read_text(encoding='utf-8'))
            for box in subject['children']:
                for entry in box['children']:
                    if not entry['aids']:
                        continue
                    tile = Tile.objects.get(slug=entry['slug'], parent__slug=box['slug'],
                                            parent__parent__slug=subject['slug'])
                    links = tile.aid_links.select_related('aid__parent__parent')
                    self.assertEqual(['/'.join(link.aid.slug_path) for link in links], entry['aids'])

    def test_loader_is_idempotent(self):
        before = list(Tile.objects.order_by('pk').values_list('pk', 'slug', 'title'))
        links = TileAid.objects.count()
        load()
        load()
        after = list(Tile.objects.order_by('pk').values_list('pk', 'slug', 'title'))
        self.assertEqual(before, after)
        self.assertEqual(TileAid.objects.count(), links)

    def test_max_twelve_children(self):
        box = Tile.objects.get(slug='angles-arcs')
        self.assertEqual(box.children.count(), 12)
        extra = Tile(parent=box, slug='thirteenth', title='Too many', kind='tool', tag='WHY')
        with self.assertRaises(ValidationError):
            extra.full_clean()

    def test_every_url_returns_200(self):
        urls = ['/', *(group.url for group in GROUPS)]
        urls += [t.url for t in Tile.objects.select_related('parent__parent')]
        self.assertEqual(len(urls), 1 + 3 + 30 + 256 + 1538)
        for url in urls:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)

    def test_live_and_placeholder(self):
        live = self.client.get('/trigonometry/angles-arcs/why-360-degrees/')
        self.assertTemplateUsed(live, 'tools/trigonometry/angles-arcs/why-360-degrees.html')
        self.assertTemplateNotUsed(live, 'tools/placeholder.html')
        self.assertNotContains(live, 'viz-formula')
        other = self.client.get('/trigonometry/angles-arcs/what-is-an-angle-really/')
        self.assertTemplateUsed(other, 'tools/placeholder.html')
        self.assertNotContains(other, 'katex')

    def test_unknown_paths_404(self):
        for url in ['/nope/', '/trigonometry/nope/', '/trigonometry/angles-arcs/nope/',
                    '/trigonometry/angles-arcs/why-360-degrees/extra/', '/trigonometry/unit-circle/why-360-degrees/']:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 404)

    def test_landing_shows_only_the_three_options(self):
        landing = self.client.get('/')
        html = landing.content.decode()
        self.assertEqual(re.findall(r'<a class="nb-door[^>]*href="([^"]+)">([^<]+)</a>', html), [
            ('/physics-part-i/', 'Physics Part I'), ('/physics-part-ii/', 'Physics Part II'), ('/math/', 'Math')])
        self.assertContains(landing, 'nb-logo__word')
        self.assertContains(landing, '<title>MuskMelon</title>', html=True)
        self.assertContains(landing, '<h1 class="visually-hidden">MuskMelon</h1>', html=True)
        for absent in ['nb-tile', 'nb-search', 'nb-crumbs', 'nb-footer', 'tools']:
            self.assertNotContains(landing, absent)

    def test_group_pages_list_every_subject_once_in_order(self):
        seen = []
        for url, count in [('/physics-part-i/', 6), ('/physics-part-ii/', 5), ('/math/', 19)]:
            html = self.client.get(url).content.decode()
            links = re.findall(r'<a class="nb-tile[^>]*href="/([^"]+)/"', html)
            self.assertEqual(len(links), count)
            seen += links
        self.assertEqual(seen, list(Tile.objects.filter(parent=None).values_list('slug', flat=True)))
        self.assertContains(self.client.get('/physics-part-i/'), 'href="/measurement-motion/"')
        self.assertContains(self.client.get('/physics-part-ii/'), 'href="/optics/"')
        self.assertContains(self.client.get('/math/'), '135 tools')

    def test_group_page_title_and_breadcrumb(self):
        group = self.client.get('/physics-part-i/')
        self.assertContains(group, '<title>Physics Part I · MuskMelon</title>', html=True)
        self.assertContains(group, '<span aria-current="page">Physics Part I</span>', html=True)
        for url, link in [('/optics/', '/physics-part-ii/'), ('/trigonometry/angles-arcs/', '/math/'),
                          ('/trigonometry/angles-arcs/why-360-degrees/', '/math/'),
                          ('/trigonometry/angles-arcs/what-is-an-angle-really/', '/math/')]:
            with self.subTest(url=url):
                self.assertContains(self.client.get(url), f'<a href="{link}">')

    def test_group_slugs_are_reserved(self):
        self.assertFalse(Tile.objects.filter(parent=None, slug__in=GROUPS_BY_SLUG).exists())

    def test_brand_on_every_level(self):
        for url in ['/', '/trigonometry/', '/trigonometry/angles-arcs/',
                    '/trigonometry/angles-arcs/why-360-degrees/',
                    '/trigonometry/angles-arcs/what-is-an-angle-really/']:
            with self.subTest(url=url):
                page = self.client.get(url)
                self.assertContains(page, 'nb-logo__mark')
                self.assertContains(page, 'nb-logo__word')
                self.assertContains(page, 'img/muskmelon.svg')
                self.assertContains(page, 'og:title')
                self.assertNotContains(page, 'Visualisations')

    def test_titles(self):
        tool_page = self.client.get('/trigonometry/angles-arcs/why-360-degrees/')
        self.assertContains(tool_page, '<title>Why is a full turn 360°? · MuskMelon</title>', html=True)

    def test_grids_show_only_real_tiles(self):
        box = self.client.get('/trigonometry/angles-arcs/')
        self.assertContains(box, 'nb-badge--live')
        self.assertContains(box, 'is-soon')
        self.assertNotContains(box, 'nb-location')
        self.assertContains(box, 'nb-crumbs')
        subject = Tile.objects.get(slug='numbers-algebra')
        page = self.client.get(subject.url)
        self.assertEqual(subject.children.count(), 10)
        self.assertEqual(page.content.decode().count('class="nb-tile '), 10)
        self.assertNotContains(page, 'is-empty')
        self.assertNotContains(page, 'empty slot')

    def test_aid_count_badge(self):
        tile = Tile.objects.annotate(n=Count('aid_links')).filter(kind='tool', n__gte=2).first()
        page = self.client.get(tile.parent.url)
        self.assertContains(page, f'{tile.n} aids')

    def test_aids_strip_live_and_placeholder_across_subjects(self):
        tool = Tile.objects.get(slug='what-is-an-angle-really')
        live = Tile.objects.get(slug='why-360-degrees')
        other = Tile.objects.filter(kind='tool').exclude(parent__parent__slug='trigonometry').first()
        box = Tile.objects.get(slug='polar-complex')
        TileAid.objects.filter(tile=tool).delete()
        for i, aid in enumerate([live, other, box], start=1):
            TileAid.objects.create(tile=tool, aid=aid, order=i)
        response = self.client.get(tool.url)
        self.assertContains(response, 'Understand these first')
        self.assertEqual([a['is_live'] for a in response.context['aids']], [True, False, True])
        self.assertContains(response, f'<a class="nb-aid" href="{live.url}">')
        self.assertContains(response, f'<a class="nb-aid is-soon" href="{other.url}">')
        self.assertContains(response, f'<a class="nb-aid" href="{box.url}">')

    def test_live_tool_with_no_aids_has_no_strip(self):
        self.assertNotContains(self.client.get('/trigonometry/angles-arcs/why-360-degrees/'), 'Understand these first')

    def test_placeholder_marks_extensions(self):
        tile = Tile.objects.filter(kind='tool', extension=True).exclude(sections='').first()
        self.assertContains(self.client.get(tile.url), '(ext.)')

    def test_spec_needs_debug(self):
        tile = Tile.objects.filter(kind='tool').exclude(spec='').exclude(slug='why-360-degrees').first()
        self.assertNotContains(self.client.get(tile.url), 'Build notes')
        with self.settings(DEBUG=True):
            self.assertContains(self.client.get(tile.url), 'Build notes')

    def test_search_box_below_the_landing_page(self):
        for url in ['/math/', '/trigonometry/', '/trigonometry/angles-arcs/',
                    '/trigonometry/angles-arcs/why-360-degrees/',
                    '/trigonometry/angles-arcs/what-is-an-angle-really/']:
            with self.subTest(url=url):
                page = self.client.get(url)
                self.assertContains(page, 'class="nb-search"')
                self.assertContains(page, 'data-index="/search-index.json"')

    def test_search_index_lists_every_tile(self):
        with self.assertNumQueries(1):
            response = self.client.get('/search-index.json')
        self.assertEqual(response.status_code, 200)
        entries = response.json()
        self.assertEqual(len(entries), 30 + 256 + 1538)
        by_url = {entry['url']: entry for entry in entries}
        self.assertEqual(len(by_url), len(entries))
        self.assertEqual(by_url['/trigonometry/angles-arcs/why-360-degrees/'], {
            'title': 'Why is a full turn 360°?', 'url': '/trigonometry/angles-arcs/why-360-degrees/',
            'kind': 'tool', 'tag': 'WHY', 'where': 'Trigonometry / Angles & Arcs', 'live': True})
        self.assertEqual(by_url['/trigonometry/angles-arcs/']['where'], 'Trigonometry')
        self.assertEqual(by_url['/trigonometry/']['kind'], 'subject')
        self.assertEqual(sum(entry['live'] for entry in entries), 1)

    def test_query_budget(self):
        tile = Tile.objects.annotate(n=Count('aid_links')).filter(kind='tool', n__gte=2).first()
        urls = ['/', '/math/', tile.parent.parent.url, tile.parent.url, tile.url,
                '/trigonometry/angles-arcs/why-360-degrees/']
        for url in urls:
            with self.subTest(url=url), CaptureQueriesContext(connection) as queries:
                self.client.get(url)
            self.assertLessEqual(len(queries), 10)


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
    def run_files(self, *subjects):
        tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, tmp)
        for i, data in enumerate(subjects):
            (tmp / f'{i}.json').write_text(json.dumps(data), encoding='utf-8')
        with mock.patch(LOADER, tmp):
            return load()

    def run_with(self, data):
        return self.run_files(data)

    def subject(self, children, slug='x', order=1):
        return {'slug': slug, 'title': 'X', 'source': 'Book', 'order': order, 'children': children}

    def box(self, tools, slug='b'):
        return {'slug': slug, 'title': 'B', 'order': 1, 'children': tools}

    def test_too_many_children(self):
        tools = [tool(f't{i}') for i in range(13)]
        with self.assertRaisesRegex(CommandError, r'0\.json: x/b: 13 children'):
            self.run_with(self.subject([self.box(tools)]))
        self.assertEqual(Tile.objects.count(), 0)

    def test_bad_tag_order(self):
        with self.assertRaisesRegex(CommandError, r'0\.json: x/b: .*WHY, then HOW, then APP; got HOW, WHY'):
            self.run_with(self.subject([self.box([tool('a', 'HOW'), tool('b', 'WHY')])]))
        self.assertEqual(Tile.objects.count(), 0)

    def test_duplicate_sibling_slugs(self):
        with self.assertRaisesRegex(CommandError, 'duplicate sibling slug "t"'):
            self.run_with(self.subject([self.box([tool('t'), tool('t')])]))

    def test_missing_title_or_slug(self):
        with self.assertRaisesRegex(CommandError, 'missing a title'):
            self.run_with(self.subject([self.box([{'slug': 't', 'tag': 'WHY'}])]))
        with self.assertRaisesRegex(CommandError, 'missing a slug'):
            self.run_with(self.subject([self.box([{'title': 'T', 'tag': 'WHY'}])]))

    def test_missing_required_field(self):
        broken = tool('t')
        del broken['summary']
        with self.assertRaisesRegex(CommandError, r'0\.json: x/b/t: tile is missing a summary'):
            self.run_with(self.subject([self.box([broken])]))
        no_source = self.subject([self.box([tool('t')])])
        del no_source['source']
        with self.assertRaisesRegex(CommandError, 'x: tile is missing a source'):
            self.run_with(no_source)

    def test_bad_tag(self):
        with self.assertRaisesRegex(CommandError, 'WHY, HOW, APP'):
            self.run_with(self.subject([self.box([tool('t', tag='FUN')])]))

    def test_duplicate_subject_order(self):
        with self.assertRaisesRegex(CommandError, r'1\.json: y: subject order 1 is already used by 0\.json'):
            self.run_files(self.subject([self.box([tool('t')])]),
                           self.subject([self.box([tool('t')])], slug='y'))
        self.assertEqual(Tile.objects.count(), 0)

    def test_duplicate_subject_slug(self):
        with self.assertRaisesRegex(CommandError, 'duplicate subject slug'):
            self.run_files(self.subject([self.box([tool('t')])]),
                           self.subject([self.box([tool('t')])], order=2))

    def test_missing_aid(self):
        with self.assertRaisesRegex(CommandError, r'0\.json: x/b/t: aid "x/b/nope" does not exist'):
            self.run_with(self.subject([self.box([tool('t', aids=['x/b/nope'])])]))
        self.assertEqual(Tile.objects.count(), 0)

    def test_self_aid(self):
        with self.assertRaisesRegex(CommandError, 'x/b/t: a tool cannot list itself'):
            self.run_with(self.subject([self.box([tool('t', aids=['x/b/t'])])]))

    def test_aid_listed_twice_or_pointing_at_a_subject(self):
        with self.assertRaisesRegex(CommandError, 'listed twice'):
            self.run_with(self.subject([self.box([tool('a'), tool('t', aids=['x/b/a', 'x/b/a'])])]))
        with self.assertRaisesRegex(CommandError, 'must be a tool or a box'):
            self.run_with(self.subject([self.box([tool('t', aids=['x'])])]))

    def test_aids_cross_subjects_in_order_and_forward(self):
        self.run_files(
            self.subject([self.box([tool('a', aids=['y/c/z', 'y/c']), tool('b')])]),
            self.subject([self.box([tool('z')], slug='c')], slug='y', order=2))
        links = Tile.objects.get(slug='a').aid_links.all()
        self.assertEqual([link.aid.slug for link in links], ['z', 'c'])

    def test_stale_tiles_deleted_and_failure_rolls_back(self):
        self.run_with(self.subject([self.box([tool('a'), tool('b')])]))
        self.assertEqual(Tile.objects.filter(kind='tool').count(), 2)
        self.run_with(self.subject([self.box([tool('a')])]))
        self.assertEqual(Tile.objects.filter(kind='tool').count(), 1)
        with self.assertRaises(CommandError):
            self.run_with(self.subject([self.box([tool('a', tag='NOPE')])]))
        self.assertEqual(Tile.objects.filter(kind='tool').count(), 1)

    def test_changed_fields_are_updated(self):
        self.run_with(self.subject([self.box([tool('a')])]))
        self.run_with(self.subject([self.box([tool('a', title='New title')])]))
        self.assertEqual(Tile.objects.get(slug='a').title, 'New title')
