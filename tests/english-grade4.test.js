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

test('yes/no statements are consistent with the passage text',()=>{
 const yn=questions.filter(q=>q.topic==='yesno');
 const p=yn[0].passage;
 assert(yn.every(q=>q.passage===p));
 assert(/nine years old/.test(p)&&/2 brothers/.test(p)&&/rabbit/.test(p)&&/parrot/.test(p)&&/Sunday/.test(p));
 assert(!/ten years old|Monday|dog|3 brothers/.test(p));
 const get=t=>yn.find(q=>q.display===t).answer;
 assert.equal(get('Maya is nine years old.'),'Yes');
 assert.equal(get('Maya has a rabbit.'),'Yes');
 assert.equal(get('Maya wants a rabbit.'),'No');
 assert.equal(get('Maya has 2 sisters.'),'No');
 assert.equal(get('Maya has a test on Sunday.'),'Yes');
 assert.equal(get('Maya is in grade five.'),'No');
 assert.equal(get('Maya has one brother.'),'No');
 assert.equal(get('Maya lives in Blue Town.'),'Yes');
});
test('Dan card texts agree with each other',()=>{
 const card=questions.filter(q=>q.topic==='card'&&q.display.startsWith('My name is Dan'));
 assert(card.length>=3&&card.every(q=>q.display.includes('ten years old')&&q.display.includes('two sisters')&&!/brother/.test(q.display)));
});

test('read-aloud data: English text is speakable, Hebrew-only items are not, answers are spoken after solving',()=>{
 const by=id=>questions.find(q=>q.id===id);
 assert.deepEqual(by('phrases-1').speak,["What's your name?"]);
 assert(by('words-a-1').speakChoices===undefined&&by('words-b-1').speak);
 assert.equal(by('fill-1').speak[0],'My blank is big and has a red door.');
 assert.equal(by('fill-1').speakAnswer,'My house is big and has a red door.');
 assert.equal(by('spell-1').speak,undefined);
 assert.equal(by('spell-1').speakAnswer,'teacher');
 assert.equal(by('yesno-1').speakAnswer,undefined);
 assert(by('yesno-1').speak.length===2&&by('yesno-1').speak[0].includes('Maya'));
 assert(by('dialogue-1').speakChoices===true);
 for(const q of questions){for(const t of [].concat(q.speak||[],q.speakAnswer||[]))assert(!/[\u0590-\u05ff_]/.test(t)&&t.length>0,q.id);}
});
