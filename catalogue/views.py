from dataclasses import dataclass

from django.conf import settings
from django.db.models import Count
from django.http import Http404, JsonResponse
from django.shortcuts import render
from django.views.decorators.cache import cache_control
from django.views.decorators.gzip import gzip_page

from .models import Tile
from .paths import LiveChecker, tool_template_name

ACCENTS = ['yellow', 'coral', 'sky', 'green', 'orange', 'lavender']
TAG_ORDER = {'WHY': 0, 'HOW': 1, 'APP': 2}
KINDS = [Tile.SUBJECT, Tile.BOX, Tile.TOOL]


@dataclass(frozen=True)
class Group:
    """A landing page option. Holds subjects up to order `last`; a last of None takes everything left."""
    slug: str
    title: str
    accent: str
    last: int | None

    @property
    def url(self):
        return f'/{self.slug}/'


GROUPS = [Group('physics-part-i', 'Physics Part I', 'yellow', 6),
          Group('physics-part-ii', 'Physics Part II', 'coral', 11),
          Group('math', 'Math', 'sky', None)]
GROUPS_BY_SLUG = {group.slug: group for group in GROUPS}


def _crumbs(tile):
    crumbs, node = [], tile
    while node is not None:
        crumbs.append(node)
        node = node.parent
    return list(reversed(crumbs))


def _plural(n, word):
    return f'{n} {word}' if n == 1 else f'{n} {word}s'


def _grid_items(tiles, live):
    items = []
    for i, tile in enumerate(tiles):
        item = {'tile': tile, 'num': i + 1, 'url': tile.url}
        if tile.kind == Tile.TOOL:
            item['is_live'] = live(tile)
            item['aids'] = _plural(tile.count, 'aid') if tile.count else ''
        else:
            item['accent'] = ACCENTS[i % len(ACCENTS)]
            item['count'] = _plural(tile.count, 'tool')
        items.append(item)
    return items


def _group_of(subject):
    return next(group for group in GROUPS if group.last is None or subject.order <= group.last)


def _page_crumbs(tile):
    """The breadcrumb trail for a page: its landing group, then the tile's own ancestors."""
    chain = _crumbs(tile)
    return [_group_of(chain[0]), *chain]


def _find(slugs):
    """The tile at a slug path, with its ancestors, in one query. None if there isn't one."""
    lookups, field = {'kind': KINDS[len(slugs) - 1]}, 'slug'
    for slug in reversed(slugs):
        lookups[field] = slug
        field = f'parent__{field}'
    return Tile.objects.select_related('parent__parent').filter(**lookups).first()


def _sorted_tools(box):
    tools = box.children.annotate(count=Count('aid_links'))
    return sorted(tools, key=lambda t: (TAG_ORDER.get(t.tag, 9), t.order))


@gzip_page
@cache_control(public=True, max_age=3600)
def search_index(request):
    """Every subject, box and tool, for static/js/search.js to filter in the browser."""
    live = LiveChecker()
    tiles = Tile.objects.select_related('parent__parent')
    return JsonResponse([{
        'title': tile.title,
        'url': tile.url,
        'kind': tile.kind,
        'tag': tile.tag,
        'where': ' / '.join(crumb.title for crumb in _crumbs(tile)[:-1]),
        'live': tile.kind == Tile.TOOL and live(tile),
    } for tile in sorted(tiles, key=lambda t: KINDS.index(t.kind))], safe=False)


def resolve(request, path):
    """One view for /, /<group>/, /<subject>/, /<subject>/<box>/ and /<subject>/<box>/<tool>/."""
    slugs = [s for s in path.split('/') if s]
    live = LiveChecker()
    if not slugs:
        return render(request, 'catalogue/landing.html', {'is_landing': True, 'groups': GROUPS})
    if len(slugs) == 1 and slugs[0] in GROUPS_BY_SLUG:
        return _group(request, GROUPS_BY_SLUG[slugs[0]], live)

    tile = _find(slugs)
    if tile is None:
        raise Http404('No such page')
    if tile.kind == Tile.TOOL:
        return _tool(request, tile, live)

    if tile.kind == Tile.BOX:
        children = _sorted_tools(tile)
    else:
        children = tile.children.annotate(count=Count('children')).order_by('order')
    return render(request, 'catalogue/grid.html', {
        'tile': tile, 'crumbs': _page_crumbs(tile), 'items': _grid_items(children, live),
    })


def _group(request, group, live):
    subjects = Tile.objects.filter(parent=None).annotate(count=Count('children__children')).order_by('order')
    tiles = [subject for subject in subjects if _group_of(subject) == group]
    return render(request, 'catalogue/grid.html', {
        'tile': group, 'crumbs': [group], 'items': _grid_items(tiles, live),
    })


def _aids(tool, live):
    aids = []
    for link in tool.aid_links.select_related('aid__parent__parent'):
        aid = link.aid
        aids.append({'tile': aid, 'url': aid.url, 'subject': _crumbs(aid)[0],
                     'is_live': aid.kind == Tile.BOX or live(aid)})
    return aids


def _tool(request, tool, live):
    box = tool.parent
    siblings = _sorted_tools(box)
    index = siblings.index(tool)
    context = {
        'tile': tool, 'box': box, 'subject': _crumbs(tool)[0], 'crumbs': _page_crumbs(tool),
        'aids': _aids(tool, live),
        'prev_tool': siblings[index - 1] if index > 0 else None,
        'next_tool': siblings[index + 1] if index + 1 < len(siblings) else None,
        'show_build_notes': settings.DEBUG,
        'tool_js': f'viz/tools/{tool.slug_path[0]}/{tool.slug}.js',
    }
    if live(tool):
        return render(request, tool_template_name(tool), context)
    return render(request, 'tools/placeholder.html', context)
