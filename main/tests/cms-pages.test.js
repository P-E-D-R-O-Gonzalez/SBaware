import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readHomepage } from '../src/lib/homepage.ts';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const config = JSON.parse(read('public/admin/config.yml'));
const pages = config.collections.find(collection => collection.name === 'pages');

test('CMS exposes Home and Data editors backed by existing page content', () => {
  for (const [name, file] of [['homepage', 'homepage'], ['data', 'data']]) {
    const editor = pages.files.find(entry => entry.name === name);
    assert.ok(editor, `${name} editor must be visible in Pages`);
    assert.equal(editor.file, `main/src/data/${file}.json`);
    assert.equal(editor.format, 'json');
    const content = JSON.parse(read(editor.file.replace(/^main\//, '')));
    assert.ok(readHomepage(content).sections.length > 0);
    const sections = editor.fields.find(field => field.name === 'sections');
    assert.equal(sections.widget, 'list');
    assert.deepEqual(sections.fields.find(field => field.name === 'type').options.map(option => option.value), ['link', 'embed', 'text', 'media']);
    for (const field of ['enabled', 'title', 'description', 'button_label', 'url', 'embed_url', 'panel_title']) {
      assert.ok(sections.fields.some(item => item.name === field), `${name}: ${field}`);
    }
  }
});

test('Data route reads the CMS content and shares the Home footer', () => {
  const route = read('src/pages/data.astro');
  assert.match(route, /import content from '..\/data\/data.json'/);
  assert.match(route, /footer_links: homepage.footer_links/);
  assert.deepEqual(pages.files.find(entry => entry.name === 'data').fields.map(field => field.name), ['sections']);
  assert.ok(pages.files.find(entry => entry.name === 'homepage').fields.some(field => field.name === 'footer_links'));
});
