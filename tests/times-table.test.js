import {test} from 'node:test';
import assert from 'node:assert/strict';
import {questions,topics,checkAnswer,meta} from '../games/times-table/config.js';
import {questions as workbook} from '../questions.js';

test('82 exercises in 10 stations, unique ids, complete content, no workbook pages',()=>{
 assert.equal(questions.length,82);
 assert.equal(topics.length,10);
 assert.equal(new Set(questions.map(q=>q.id)).size,82);
 assert(topics.every(t=>questions.some(q=>q.topic===t.id)));
 assert(questions.every(q=>q.prompt&&q.display&&q.hint&&q.explanation),JSON.stringify(questions.filter(q=>!(q.prompt&&q.display&&q.hint&&q.explanation)).map(q=>q.id)));
 assert(questions.every(q=>q.page===undefined));
});

test('Every reference answer is accepted and a wrong value rejected',()=>{
 for(const q of questions){
  assert.equal(checkAnswer(q,q.answer),true,q.id);
  const wrong=q.kind==='multi'?[0]:q.kind==='pair'?[0,0]:'999983';
  assert.equal(checkAnswer(q,wrong),false,q.id);
 }
});

test('Numeric answers stay inside the multiplication table range',()=>{
 for(const q of questions.filter(q=>typeof q.answer==='number'))assert(q.answer>=1&&q.answer<=144,q.id);
});

test('Pinned answers are independently verified',()=>{
 const expected={'skips-1':12,'skips-6':36,'memory-easy-1':12,'memory-easy-5':80,'memory-hard-1':42,'memory-hard-2':64,'memory-hard-8':56,'flash-1':32,'flash-6':72,'missing-1':4,'missing-2':9,'missing-12':9,'stories-1':56,'stories-3':33,'master-1':8,'master-3':48,'master-4':5,'master-5':6,'master-6':9,'master-8':24};
 for(const [id,a] of Object.entries(expected))assert.equal(questions.find(q=>q.id===id).answer,a,id);
 assert.deepEqual(questions.find(q=>q.id==='master-2').answer,[6,9]);
});

test('Flash questions cover the display after a few seconds and belong to the flash station',()=>{
 const f=questions.filter(q=>q.flash);
 assert.equal(f.length,8);
 assert(f.every(q=>q.topic==='flash'&&q.flash>=2&&q.flash<=5));
});

test('Multiselect accepts exactly the table members among the choices',()=>{
 const ms=questions.filter(q=>q.kind==='multi');
 assert.equal(ms.length,6);
 for(const q of ms){
  assert(q.table>=2&&q.table<=10,q.id);
  const correct=q.choices.filter(v=>v%q.table===0&&v/q.table>=1&&v/q.table<=10);
  assert.deepEqual([...correct].sort((a,b)=>a-b),[...q.answer].sort((a,b)=>a-b),q.id);
  assert(q.answer.length>=3,q.id);
 }
});

test('Which-product choices have exactly one correct option; max choices have a unique maximum',()=>{
 for(const q of questions.filter(q=>q.target)){
  const hits=q.choices.filter(c=>{const[a,b]=c.split('×').map(s=>Number(s.trim()));return a*b===q.target;});
  assert.equal(hits.length,1,q.id);
  assert.equal(hits[0],q.answer,q.id);
 }
 for(const q of questions.filter(q=>q.max)){
  const products=q.choices.map(c=>{const[a,b]=c.split('×').map(s=>Number(s.trim()));return a*b;});
  const top=Math.max(...products);
  assert.equal(products.filter(p=>p===top).length,1,q.id);
  assert.equal(q.choices[products.indexOf(top)],q.answer,q.id);
 }
});

test('Judge answers agree with the real product',()=>{
 const js=questions.filter(q=>q.topic==='judge');
 assert.equal(js.length,8);
 for(const q of js)assert.equal(q.answer,q.actual===q.claimed?'נכון':'לא נכון',q.id);
 assert(js.some(q=>q.answer==='נכון')&&js.some(q=>q.answer==='לא נכון'));
});

test('Storage key is separate and the game has no workbook source',()=>{
 assert.equal(meta.key,'kids-learn-games.times-table.v1');
 assert(!workbook.some(q=>q.id.startsWith('times-table')));
 assert.notEqual(meta.key,'kids-learn-games.number-quest.v1');
 assert.notEqual(meta.key,'kids-learn-games.test-prep.v1');
 assert.strictEqual(meta.source,null);
});
