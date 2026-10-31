"""Behavior checks for the objective-tree exporter; no third-party dependencies."""

from html.parser import HTMLParser
from pathlib import Path
import tempfile
import unittest

from export import export


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.depth = 0
        self.article_depths = []
        self.links = []
        self.attention = 0
        self.scripts = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'article':
            self.depth += 1
            self.article_depths.append(self.depth)
        if tag == 'a':
            self.links.append(attrs.get('href'))
        if tag == 'section' and attrs.get('class') == 'attention':
            self.attention += 1
        if tag == 'script':
            self.scripts += 1

    def handle_endtag(self, tag):
        if tag == 'article':
            self.depth -= 1


class ExportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.output = self.root / 'oasis.html'
        self.source = 'https://github.com/example/project/blob/main'

    def objective(self, name, text='## Current\nStarting.\n\n## Desired\nFinished.\n'):
        path = self.root / name / 'objective.md'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
        return path

    def render(self):
        count = export(self.root, self.output, self.source)
        text = self.output.read_text(encoding='utf-8')
        return count, text, Page(text)

    def test_nested_objectives_skip_nonobjective_folders_and_hidden_files(self):
        self.objective('')
        self.objective('coordination')
        self.objective('coordination/intermediate/view')
        self.objective('.hidden')
        count, text, page = self.render()
        self.assertEqual(count, 3)
        self.assertEqual(page.article_depths, [1, 2, 3])
        self.assertIn('3 objectives', text)
        self.assertEqual(page.links[-1], self.source + '/coordination/intermediate/view/objective.md')

    def test_links_resolve_against_each_objective_and_encode_paths(self):
        self.objective('space here', '## Current\n[Evidence](evidence.md) [Parent](../objective.md) [Web](https://example.com/?x=1&y=2)')
        _, text, page = self.render()
        self.assertIn(self.source + '/space%20here/evidence.md', page.links)
        self.assertIn(self.source + '/objective.md', page.links)
        self.assertIn('https://example.com/?x=1&y=2', page.links)
        self.assertIn('x=1&amp;y=2', text)

    def test_html_and_unsafe_links_remain_text(self):
        self.objective('', '## Current\n<script>alert(1)</script> [Run](javascript:alert) [Local](file:///tmp/secret) [Data](data:text/html,hello)')
        _, text, page = self.render()
        self.assertEqual(page.scripts, 0)
        self.assertIn('&lt;script&gt;', text)
        self.assertEqual(len(page.links), 1)  # Only the source link.

    def test_only_nonempty_blocker_and_permission_sections_get_attention(self):
        self.objective('', '## Blockers\nWaiting.\n## Permission needed\nFounder decision.\n## Blocked\n\n## Desired\nReady.')
        _, _, page = self.render()
        self.assertEqual(page.attention, 2)

    def test_empty_repository_does_not_write_output(self):
        with self.assertRaisesRegex(ValueError, 'No objective'):
            self.render()
        self.assertFalse(self.output.exists())

    def test_output_cannot_overwrite_objective(self):
        path = self.objective('')
        original = path.read_bytes()
        with self.assertRaisesRegex(ValueError, 'must not overwrite'):
            export(self.root, path, self.source)
        self.assertEqual(path.read_bytes(), original)


if __name__ == '__main__':
    unittest.main()
