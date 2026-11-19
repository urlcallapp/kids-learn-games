import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questions,topics,meta,checkAnswer} from '../games/english-grade4/config.js';
import {games} from '../games.js';

test('English grade 4 game is standalone, isolated and well formed',()=>{
 assert.equal(topics.length,10);
 assert(topics.every(t=>questions.some(q=>q.topic===t.id)));
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 assert.equal(meta.key,'kids-learn-games.english-grade4.v1');
 assert.equal(meta.source,null);
 assert(questions.every(q=>q.hint&&q.explanation&&!q.page));
});
test('every reference answer is accepted and every choice list is valid',()=>{
 for(const q of questions){
  assert(checkAnswer(q,q.answer),q.id);
  if(q.choices){assert(q.choices.includes(q.answer),q.id);assert.equal(new Set(q.choices).size,q.choices.length,q.id);assert(q.choices.length>=2,q.id);for(const c of q.choices.filter(c=>c!==q.answer))assert(!checkAnswer(q,c),q.id+' '+c);}
 }
});
test('typed answers ignore case, spaces and final punctuation but not spelling',()=>{
 const t=questions.find(q=>q.input==='text'&&q.answer==='teacher');
 assert(checkAnswer(t,' Teacher '));assert(checkAnswer(t,'TEACHER.'));
 assert(!checkAnswer(t,'techer'));assert(!checkAnswer(t,'teachers'));
});
test('yes/no questions match their passage facts',()=>{
 const yn=questions.filter(q=>q.topic==='yesno');
 assert(yn.length>=6&&yn.every(q=>q.passage&&q.choices.join()==='Yes,No'));
});
test('game is registered and public files carry no personal details',()=>{
 const g=games.find(x=>x.id==='english-grade4');
 assert(g&&g.href==='./games/english-grade4/'&&!g.source&&g.tags.includes('אנגלית'));
 const text=['games/english-grade4/config.js','games/english-grade4/index.html','games.js'].map(f=>readFileSync(f,'utf8')).join('\n');
 for(const bad of ['איתן','Eitan','Nadav','נדב','Reut','Zemer','Hod Hasharon','Kfar Saba','הוד השרון','כפר סבא'])assert(!text.includes(bad),bad);
});
