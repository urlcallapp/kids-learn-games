import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questions,topics,checkAnswer,meta} from '../games/english-grade4/config.js';
import {workbookReadings} from '../games/english-grade4/workbook.js';
const wb=questions.filter(q=>q.reading);
const get=(topic,display)=>questions.find(q=>q.topic===topic&&q.display===display);
test('original 99 questions, IDs and speech data are unchanged',async()=>{
 const original=JSON.parse(readFileSync(new URL('./fixtures/english-original.json',import.meta.url),'utf8'));
 assert.deepEqual(questions.filter(q=>!q.reading),original.questions);
 assert.deepEqual(topics.slice(0,10),original.topics);
 assert.equal(meta.key,original.key);
});
test('workbook is a separate five-station reading area with all new questions grounded',()=>{
 assert.equal(wb.length,48);assert.equal(questions.length,147);
 assert.equal(topics.filter(t=>t.section==='workbook').length,5);
 assert.deepEqual(meta.sections.map(s=>s.id),['workbook','review']);
 for(const t of topics.filter(t=>t.section==='workbook'))assert(t.reading.title&&t.reading.text);
 for(const q of wb){assert(q.passage&&q.speak&&checkAnswer(q,q.answer),q.id);assert(!q.page);}
});
test('Karen dialogue house colors and answers agree exactly',()=>{
 const p=workbookReadings.friends.text;
 for(const [person,color] of [['Pam','red'],['Max','blue'],['Ned','brown'],['Karen','green']]){
  assert(p.includes(`${person}: I live in the ${color} house.`));
  assert.equal(get('wb-friends',`${person}: I live in the ____ house.`).answer,color);
 }
 assert(p.includes('The teacher lives in the orange house.'));
 assert.equal(get('wb-friends','The teacher: I live in the ____ house.').answer,'orange');
 assert(p.includes('I am in grade 4.'));
 assert.equal(get('wb-friends','What grade is Karen in?').answer,'Grade 4');
 assert.equal(get('wb-friends','Where is the school?').answer,'In town');
});
test('Shira and Shelly retain the actual passage facts, not each other’s details',()=>{
 const p=workbookReadings.profiles.text;
 const [shira,shelly]=p.split('\n\n');
 for(const term of ['Orange Town','ten years old','Orange School','four brothers and two sisters','a dog','like English lessons'])assert(shira.includes(term),term);
 for(const term of ['Yellow Town','nine years old','Yellow School','have a sister','want a brother','a bird','It can fly and talk'])assert(shelly.includes(term),term);
 assert(!shelly.includes('have a brother'));assert(!shira.includes('nine years old'));
 for(const [stmt,answer] of [['Shira has two sisters.','Yes'],['Shira likes English lessons.','Yes'],['Shelly can fly.','No'],['Shelly has a brother.','No'],['Shira and Shelly are nine years old.','No']]){
  const q=get('wb-yesno',stmt);assert.equal(q.answer,answer);assert.equal(q.passage,p);
 }
 assert.equal(get('wb-profiles','Who has four brothers?').answer,'Shira');
 assert.equal(get('wb-profiles','Who wants a brother?').answer,'Shelly');
 assert.equal(get('wb-card','Shira — Family: ____ brothers').answer,'Four');
 assert.equal(get('wb-card','Shira — Family: ____ sisters').answer,'Two');
 assert.equal(get('wb-card','Shelly — Family: ____ sister').answer,'One');
});
test('house bank, alphabetical names, and matching answers match the workbook',()=>{
 for(const [name,color] of [['Lisa','yellow'],['Tom','white'],['Eden','gray']]){
  const q=get('wb-houses',`${name}: I live in a ____ house.`);
  assert.equal(q.answer,color);assert(q.passage.includes(`${name} lives in a ${color} house.`));
  assert.deepEqual(q.choices,['big','small','green','white','yellow','gray']);
  assert.equal(q.speakAnswer,`${name}: I live in a ${color} house.`);
 }
 assert.equal(get('wb-houses','Pam · Karen · Ben · Max').answer,'Ben, Karen, Max, Pam');
 for(const q of wb.filter(q=>q.prompt.includes('ABC'))){assert.equal(q.answer,q.display.split(' · ').sort().join(', '));}
 for(const [question,answer] of [['How old are you?','I’m nine years old.'],['What’s your name?','My name is Bar.'],['Where do you live?','I live in Afula.']])assert.equal(get('wb-card',question).answer,answer);
});
