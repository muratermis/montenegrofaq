import test from 'node:test';
import assert from 'node:assert/strict';
import {normal} from './translation-source.mjs';
test('published language counts do not invalidate translation source keys',()=>{
 assert.equal(normal('The platform offers 22 languages.'),normal('The platform offers {{languageCount}} languages.'));
 assert.equal(normal('The platform offers 23 languages.'),normal('The platform offers 22 languages.'));
 assert.equal(normal('Call 112 for emergencies.'),'Call 112 for emergencies.');
});
