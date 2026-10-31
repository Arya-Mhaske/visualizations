"""Every number the Sets & Relations tools show, worked out in Python, then checked against the JS module."""
from itertools import chain, combinations, product

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/numbers-algebra/_sets-math.js'
ITEMS = (1, 2, 3)
PAIRS = list(product(ITEMS, repeat=2))


def is_equivalence(relation):
    return (all((a, a) in relation for a in ITEMS)
            and all((b, a) in relation for a, b in relation)
            and all((a, d) in relation for a, b in relation for c, d in relation if b == c))


def equivalences():
    subsets = chain.from_iterable(combinations(PAIRS, k) for k in range(len(PAIRS) + 1))
    return [set(s) for s in subsets if is_equivalence(set(s))]


class FactTests(SimpleTestCase):
    def test_relations_on_three_items(self):
        self.assertEqual(2 ** len(PAIRS), 512)

    def test_five_equivalence_relations_two_with_1_2(self):
        found = equivalences()
        self.assertEqual(len(found), 5)
        self.assertEqual(sum((1, 2) in r for r in found), 2)
        self.assertEqual(sorted(len(r) for r in found), [3, 5, 5, 5, 9])

    def test_survey_default(self):
        self.assertEqual(60 + 45 - 20, 85)
        self.assertEqual(100 - 85, 15)

    def test_ten_elements(self):
        self.assertEqual(2 ** 10, 1024)


@needs_node
class ModuleTests(SimpleTestCase):
    def test_subsets(self):
        self.assertEqual(js(MATH, '[m.isSubset([],[]),m.isSubset([],[1]),m.isSubset([4],[1,2])]'), [True, True, False])
        self.assertEqual(js(MATH, '[0,1,2,3,4].map(m.subsetCount)'), [1, 2, 4, 8, 16])
        got = js(MATH, '[0,1,2,3,4,5,6,7].map(k=>m.subsetFromCode(["a","b","c"],k).join(""))')
        self.assertEqual(sorted(got), sorted(''.join(s) for k in range(4) for s in combinations('abc', k)))

    def test_inclusion_exclusion(self):
        self.assertEqual(js(MATH, '[m.inclusionExclusion(17,13,5),m.union(12,5,8)]'), [25, 25])

    def test_preset_relations_fail_exactly_one_test(self):
        got = js(MATH, '[["11","22","33","12","13","23"],["11","22","33","12","21","23","32"],["11","22","12","21"]]'
                       '.map(p=>{const r=new Set(p);return [m.reflexiveGaps(r).length>0,m.symmetricGaps(r).length>0,m.transitiveGaps(r).length>0]})')
        self.assertEqual(got, [[False, True, False], [False, False, True], [True, False, False]])

    def test_closure_matches_python_search(self):
        got = js(MATH, '[...m.equivalenceClosure(new Set(["12","23"]))].length')
        smallest = min((r for r in equivalences() if {(1, 2), (2, 3)} <= r), key=len)
        self.assertEqual(got, len(smallest))
        self.assertEqual(js(MATH, '[...m.equivalenceClosure(new Set(["12"]))].length'), 5)

    def test_partitions_are_exactly_the_equivalences(self):
        got = js(MATH, 'm.PARTITIONS.map(p=>m.partitionPairs(p).sort().join())')
        expected = [','.join(sorted(f'{a}{b}' for a, b in r)) for r in equivalences()]
        self.assertEqual(sorted(got), sorted(expected))

    def test_roster(self):
        got = js(MATH, '[m.roster("even",12),m.roster("square",30),m.roster("prime",30),m.roster("odd",9)]')
        self.assertEqual(got, [[2, 4, 6, 8, 10, 12], [1, 4, 9, 16, 25], [2, 3, 5, 7, 11, 13, 17, 19, 23, 29], [1, 3, 5, 7, 9]])

    def test_interval_ends(self):
        shape = '{a:-2,b:3,closedA:true,closedB:false,toMinus:false,toPlus:false}'
        self.assertEqual(js(MATH, f'[-2,3,0,4].map(x=>m.inInterval(x,{shape}))'), [True, False, True, False])

    def test_survey_regions(self):
        self.assertEqual(js(MATH, 'm.surveyRegions(100,60,45,20)'), {'teaOnly': 40, 'coffeeOnly': 25, 'neither': 15})
        self.assertEqual(js(MATH, '[m.surveyValid(100,60,45,20),m.surveyValid(100,60,45,50),m.surveyValid(50,60,45,20)]'), [True, False, False])

    def test_mod_7(self):
        self.assertEqual(js(MATH, '[m.mod7(-4),m.related(3,24),m.related(3,5),m.weekday(1,3),m.weekday(1,24)]'), [3, True, False, 3, 3])
