import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readHomepage } from '../src/lib/homepage.ts';
import { readInstagramSources } from '../src/lib/instagram.ts';
const read = p => JSON.parse(readFileSync(new URL('../'+p, import.meta.url)));
const ice = read('src/data/ice.json');
test('ICE resources validate and tracking services remain outbound only', () => {
 const sections = readHomepage(ice).sections;
 assert.equal(sections.length,10);
 for (const title of ['Flock Map','ICE Plate Tracker','Alert Network','ICE Out','ICE Activity Tracker']) {
   const section = sections.find(s=>s.title===title);
   assert.equal(section.type,'link');
   assert.equal(section.embed_url,'');
 }
 assert.deepEqual(readInstagramSources(ice), ['fontana.decolonized','we_keep_us_safe_ie','ic4ij','stopicenet']);
});
test('ICE navigation and Spanish copy are available', () => {
 const home = readHomepage(read('src/data/homepage.json'));
 assert.ok(home.sections.some(s=>s.url==='/ice/'));
 assert.ok(home.footer_links.some(s=>s.url==='/ice/'));
 const translated = new Set(read('src/data/translations.json').entries.map(e=>e.en));
 for (const section of readHomepage(ice).sections) for (const field of ['title','description','button_label','panel_title']) {
   if(section[field]) assert.ok(translated.has(section[field]), section[field]);
 }
});
