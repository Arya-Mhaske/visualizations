from django.db.models import Count
from django.http import Http404
from django.shortcuts import render

from .models import Tile
from .paths import LiveChecker, tool_template_name

ACCENTS = ['yellow', 'coral', 'sky', 'green', 'orange', 'lavender']
TAG_ORDER = {'WHY': 0, 'HOW': 1, 'APP': 2}


def _pad(count):
    """Empty slots so the grid fills whole rows of 4 on desktop."""
    return range((-count) % 4)


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
        else:
            item['accent'] = ACCENTS[i % len(ACCENTS)]
            if tile.kind == Tile.SUBJECT:
                n = Tile.objects.filter(kind=Tile.TOOL, parent__parent=tile).count()
            else:
                n = tile.children.count()
            item['count'] = _plural(n, 'tool')
        items.append(item)
    return items


def resolve(request, path):
    """One view for /, /<subject>/, /<subject>/<box>/ and /<subject>/<box>/<tool>/."""
    slugs = [s for s in path.split('/') if s]
    live = LiveChecker()
    tile = None
    for depth, slug in enumerate(slugs):
        tile = Tile.objects.filter(parent=tile, slug=slug).select_related('parent__parent').first()
        if tile is None:
            raise Http404('No such page')
    if tile is not None and tile.kind == Tile.TOOL:
        return _tool(request, tile, live)

    if tile is None:
        children = list(Tile.objects.filter(parent=None))
        context = {'is_landing': True, 'crumbs': []}
    else:
        children = list(tile.children.all())
        context = {'tile': tile, 'crumbs': _crumbs(tile),
                   'subject': _crumbs(tile)[0]}
    if tile is not None and tile.kind == Tile.BOX:
        children.sort(key=lambda t: (TAG_ORDER.get(t.tag, 9), t.order))
    items = _grid_items(children, live)
    context.update(items=items, empty_slots=_pad(len(items)))
    return render(request, 'catalogue/grid.html', context)


def _tool(request, tool, live):
    box = tool.parent
    siblings = list(box.children.all())
    siblings.sort(key=lambda t: (TAG_ORDER.get(t.tag, 9), t.order))
    index = siblings.index(tool)
    crumbs = _crumbs(tool)
    context = {
        'tile': tool, 'box': box, 'subject': crumbs[0], 'crumbs': crumbs,
        'prev_tool': siblings[index - 1] if index > 0 else None,
        'next_tool': siblings[index + 1] if index + 1 < len(siblings) else None,
    }
    if live(tool):
        return render(request, tool_template_name(tool), context)
    return render(request, 'tools/placeholder.html', context)
