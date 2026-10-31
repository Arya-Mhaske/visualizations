import re
from functools import lru_cache

from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

register = template.Library()


@lru_cache(maxsize=1)
def _mark():
    svg = (settings.BASE_DIR / 'static/img/muskmelon.svg').read_text(encoding='utf-8')
    svg = re.sub(r'<!--.*?-->\s*', '', svg, flags=re.DOTALL)
    svg = svg.replace('role="img" aria-label="MuskMelon"', 'class="nb-logo__mark" aria-hidden="true"')
    return mark_safe(svg.strip())


@register.simple_tag
def brand_mark():
    """static/img/muskmelon.svg, inline. Decorative: the link around it carries the name."""
    return _mark()
