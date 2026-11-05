import test from 'node:test';
import assert from 'node:assert/strict';
import {translateSchema} from './localize.mjs';

test('translation revisions update modification dates without changing publication dates',()=>{
 const dictionary={translatedAt:'2026-11-06',entries:{}},language={code:'de',lang:'de'};
 const result=translateSchema({datePublished:'2026-10-27',dateModified:'2026-10-27',url:'https://montenegrofaq.org/en/kotor/'},dictionary,language);
 assert.equal(result.dateModified,'2026-11-06');
 assert.equal(result.datePublished,'2026-10-27');
 assert.equal(result.url,'https://montenegrofaq.org/de/kotor/');
});
test('a newer source revision keeps its own modification date',()=>{
 assert.equal(translateSchema('2026-11-07',{translatedAt:'2026-11-06'},{code:'de',lang:'de'},'dateModified'),'2026-11-07');
});
