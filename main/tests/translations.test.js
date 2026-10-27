import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTranslator, translate } from '../src/lib/translations.ts';

test('all current Home, Data and Local Groups copy has Spanish coverage', () => {
  const entries = JSON.parse(readFileSync(new URL('../src/data/translations.json', import.meta.url))).entries;
  const covered = new Set(entries.map(entry => entry.en));
  const properNames = new Set(['Gas Buddy', 'IEMG TV3', 'TV']);
  function check(text) {
    if (!text?.trim() || properNames.has(text.trim())) return;
    assert.ok(covered.has(text.trim()), `Missing Spanish translation: ${text}`);
  }
  for (const file of ['homepage', 'data']) {
    const content = JSON.parse(readFileSync(new URL(`../src/data/${file}.json`, import.meta.url)));
    for (const section of content.sections) {
      for (const field of ['title', 'description', 'button_label', 'panel_title']) check(section[field]);
    }
    for (const link of content.footer_links ?? []) check(link.label);
  }
  const groups = JSON.parse(readFileSync(new URL('../src/data/local-groups.json', import.meta.url)));
  for (const category of groups.categories) {
    check(category.title);
    for (const entry of category.entries) check(entry.summary);
  }
});

test('page titles, resource labels and dynamically opened panels translate', () => {
  assert.equal(translate('Data | SB Aware', 'es'), 'Datos | SB Aware');
  assert.equal(translate('Local Groups | SB Aware', 'es'), 'Grupos locales | SB Aware');
  assert.equal(translate('Get Involved | SB Aware', 'es'), 'Participa | SB Aware');
  assert.equal(translate('Data resources', 'es'), 'Recursos de Datos');
  assert.equal(translate('Close SB Mapping', 'es'), 'Cerrar Mapas de San Bernardino');
  assert.equal(translate('Open SB Census Data', 'es'), 'Abrir Datos del censo de San Bernardino');
  assert.equal(translate('No categories have been added yet.', 'es'), 'Todavía no se han agregado categorías.');
});

test('CMS translation file and fields match the runtime data', () => {
  const config = JSON.parse(readFileSync(new URL('../public/admin/config.yml', import.meta.url)));
  const editor = config.collections.find(c => c.name === 'pages').files.find(f => f.name === 'translations');
  assert.equal(editor.file, 'main/src/data/translations.json');
  assert.deepEqual(editor.fields[0].fields.map(f => f.name), ['en', 'es']);
  assert.equal(translate('Calendar', 'es'), 'Calendario');
});

test('CMS edits and new phrases are used, including dynamic placeholders', () => {
  const { translate: t } = createTranslator([
    {en: 'Open {title}', es: 'Mostrar: {title}'},
    {en: 'Local Media', es: 'Noticias locales'},
    {en: 'All sources ({count})', es: 'Fuentes: {count}'},
    {en: 'Instagram feed from {account}', es: 'Cuenta {account}'},
    {en: 'New paragraph.', es: 'Nuevo párrafo.'},
  ]);
  assert.equal(t('Open Local Media', 'es'), 'Mostrar: Noticias locales');
  assert.equal(t('All sources (3)', 'es'), 'Fuentes: 3');
  assert.equal(t('Instagram feed from @fontana', 'es'), 'Cuenta @fontana');
  assert.equal(t(' New paragraph. ', 'es'), ' Nuevo párrafo. ');
  assert.equal(t('Missing text', 'es'), 'Missing text');
  assert.equal(t('toString', 'es'), 'toString');
});

test('invalid CMS data fails clearly', () => {
  assert.throws(() => createTranslator([{en: 'Open {title}', es: 'Abrir'}]), /placeholders/);
  assert.throws(() => createTranslator([{en: 'Date', es: 'Fecha'}, {en: 'Date', es: 'Día'}]), /Duplicate/);
  assert.throws(() => createTranslator([{en: 'Date', es: ' '}]), /non-empty/);
});
