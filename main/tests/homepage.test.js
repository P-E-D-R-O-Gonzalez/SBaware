import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readHomepage } from '../src/lib/homepage.ts';
const content = JSON.parse(readFileSync(new URL('../src/data/homepage.json', import.meta.url)));

test('homepage content retains a dedicated Data page link', () => {
  const home = readHomepage(content);
  const data = home.sections.find(section => /^\/data\/?$/.test(section.url));
  assert.ok(data);
  assert.equal(data.type, 'link');
  assert.match(data.url, /^\/data\/?$/);
  assert.equal(data.embed_url, '');
});

test('editors can reorder, hide, add text and remove all cards', () => {
  const home = readHomepage({ sections: [content.sections.find(section => section.type === 'media'), { enabled: false }, { type: 'text', title: 'Notice', description: 'Community update' }, content.sections[0]] });
  assert.deepEqual(home.sections.map(s => s.title), ['Local Media', 'Notice', 'Calendar']);
  assert.deepEqual(readHomepage({ sections: [], footer_links: [] }), { sections: [], footer_links: [] });
});

test('unsafe URLs and incomplete interactive cards fail the build', () => {
  for (const url of ['javascript:alert(1)', '//evil.example', '/\\evil.example', 'https://user:password@example.com', 'http://example.com']) {
    assert.throws(() => readHomepage({ sections: [{ ...content.sections[0], url }] }));
  }
  assert.throws(() => readHomepage({ sections: [{ ...content.sections[1], embed_url: '/admin/' }] }));
  assert.throws(() => readHomepage({ sections: [{ ...content.sections[0], button_label: '' }] }));
  assert.throws(() => readHomepage({ sections: [content.sections.find(section => section.type === 'media'), content.sections.find(section => section.type === 'media')] }));
});
