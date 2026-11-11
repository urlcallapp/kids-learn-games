import {test} from 'node:test';
import assert from 'node:assert/strict';
import {questions,topics,meta} from '../games/test-prep/config.js';
import {readFileSync} from 'node:fs';
// config.js loads questions.js through the shared site version token (?v=...); import the
// dataset with the same specifier so both sides are the same module instance.
const version=readFileSync(new URL('../games/test-prep/config.js',import.meta.url),'utf8').match(/questions\.js\?v=([^'"]+)/)[1];
const {questions: all,topics: allTopics}=await import(`../questions.js?v=${version}`);
test('Test-prep game holds exactly the workbook exercises on printed pages up to 14',()=>{
 assert.equal(questions.length,36);
 assert(questions.every(q=>q.page<=14),JSON.stringify(questions.filter(q=>q.page>14).map(q=>[q.id,q.page])));
 assert(questions.every(q=>all.includes(q)));
 assert.deepEqual(new Set(questions.map(q=>q.id)).size,36);
 assert.equal(topics.length,6);
 assert(topics.every(t=>allTopics.includes(t)&&questions.some(q=>q.topic===t.id)));
 assert.notEqual(meta.key,'kids-learn-games.number-quest.v1');
});
