import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectDictionary} from './translation-quality.mjs';
const check=(strings,entries,code='de')=>inspectDictionary({hash:'current',strings},{sourceHash:'current',entries},{code});
test('incomplete and copied paragraphs cannot pass translation checks',()=>{
 const paragraph='Public visitor information. '.repeat(10);
 assert.deepEqual(check(['Missing','Blank',paragraph],{Blank:' ',[paragraph]:paragraph}).map(i=>i.kind),['missing-text','missing-text','untranslated-paragraph']);
});
test('translation service markers and damaged placeholders are rejected',()=>{
 const issues=check(['Read the guide','Available in {{languageCount}} languages.'],{'Read the guide':'[12000001] Lesen Sie den Leitfaden','Available in {{languageCount}} languages.':'In {{count}} Sprachen verfügbar.'});
 assert.deepEqual(issues.map(i=>i.kind),['translation-batch-marker','changed-placeholder']);
});
test('emergency telephone labels must keep their actual number',()=>{
 assert.equal(check(['Call 112'],{'Call 112':'Llamar al 122'},'es')[0].kind,'changed-emergency-number');
 assert.deepEqual(check(['Call 112'],{'Call 112':'１１２に電話'},'ja'),[]);
});
test('Latin-script variants reject Cyrillic while names and short shared terms remain valid',()=>{
 assert.equal(check(['Read guide'],{'Read guide':'Прочитајте водич'},'sr')[0].kind,'unexpected-cyrillic');
 assert.deepEqual(check(['BEMU','SIM'],{BEMU:'BEMU',SIM:'SIM'},'cnr'),[]);
});
