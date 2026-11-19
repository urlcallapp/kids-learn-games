import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {questions} from '../../games/english-grade4/config.js';
const out=process.env.SCREENSHOT_DIR||'test-results/screens';
fs.mkdirSync(out,{recursive:true});

test('portal card, direct URL, scope and no workbook link for the English game',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await page.locator('[data-filter="אנגלית"]').click();
 await expect(page.locator('.game-card')).toHaveCount(1);
 await expect(page.locator('.game-card h2')).toHaveText('מסע באנגלית');
 await page.screenshot({path:`${out}/english-portal-390.png`,fullPage:true});
 await page.getByRole('link',{name:/מתחילים באנגלית/}).click();
 await page.reload();
 await expect(page.locator('h1')).toHaveText('מסע באנגלית');
 await expect(page.locator('[data-topic]')).toHaveCount(10);
 await expect(page.locator('.score-strip')).toContainText(String(questions.length));
 await expect(page.locator('.workbook-link')).toHaveCount(0);
 await expect(page.locator('.hero')).toContainText('החוברת הצהובה');
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});await page.goto('/games/english-grade4/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:`${out}/english-map-${width}.png`,fullPage:true});}
 expect(errors).toEqual([]);
});

test('every English question can be solved through the real UI, wrong answers are rejected',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 const shots=new Set();
 for(const topic of [...new Set(questions.map(q=>q.topic))]){
  await page.goto('/games/english-grade4/');
  await page.locator(`[data-topic=${topic}]`).click();
  const qs=questions.filter(q=>q.topic===topic);
  for(let i=0;i<qs.length;i++){
   const q=qs[i];
   if(q.input==='text'){
    await page.locator('#answer').fill('zzz');await page.locator('#check').click();
    await expect(page.locator('.incorrect')).toBeVisible();
    if(!shots.has(topic)){shots.add(topic);await page.screenshot({path:`${out}/english-${topic}-wrong-390.png`,fullPage:true});}
    await page.locator('#answer').fill(q.answer.toUpperCase()+' ');
   }else{
    const wrong=q.choices.find(c=>c!==q.answer);
    await page.locator('.choice',{hasText:new RegExp('^\\s*'+wrong.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).click();await page.locator('#check').click();
    await expect(page.locator('.incorrect')).toBeVisible();
    if(!shots.has(topic)){shots.add(topic);await page.screenshot({path:`${out}/english-${topic}-390.png`,fullPage:true});}
    await page.locator('.choice').filter({has:page.locator(`xpath=self::*[@data-value=${JSON.stringify(q.answer).replace(/"/g,"'")}]`)}).first().click().catch(()=>{});
    await page.locator(`.choice[data-value="${q.answer.replace(/"/g,'&quot;')}"]`).click();
   }
   await page.locator('#check').click();
   await expect(page.locator('.correct')).toBeVisible();
   await page.locator('#next').click();
  }
  await expect(page.locator('.summary')).toContainText(`פתרנו ${qs.length} מתוך ${qs.length}`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
 expect(await page.evaluate(()=>Object.keys(localStorage))).toContain('kids-learn-games.english-grade4.v1');
 expect(errors).toEqual([]);
});

const stub=()=>{window.__spoken=[];window.__cancels=0;window.SpeechSynthesisUtterance=function(t){this.text=t;};Object.defineProperty(window,'speechSynthesis',{value:{speak:u=>window.__spoken.push({text:u.text,lang:u.lang,rate:u.rate}),cancel:()=>{window.__cancels++;}},configurable:true});};

test('read-aloud buttons speak English text with an English voice and the correct answer after solving',async({page})=>{
 await page.addInitScript(stub);
 await page.setViewportSize({width:390,height:844});
 await page.goto('/games/english-grade4/');
 await page.locator('[data-topic=phrases]').click();
 await page.locator('#speak').click();
 let s=await page.evaluate(()=>window.__spoken);
 expect(s).toEqual([{text:"What's your name?",lang:'en-US',rate:.85}]);
 await page.locator('#speak-choices').count();
 await page.screenshot({path:`${out}/english-speak-390.png`,fullPage:true});
 await page.goto('/games/english-grade4/');
 await page.locator('[data-topic=dialogue]').click();
 await page.locator('#speak-choices').click();
 s=await page.evaluate(()=>window.__spoken);
 expect(s.map(x=>x.text)).toEqual(questions.find(q=>q.id==='dialogue-1').choices);
 await page.locator(`.choice[data-value="My name is Dan."]`).click();await page.locator('#check').click();
 await page.locator('#speak-answer').click();
 s=await page.evaluate(()=>window.__spoken);
 expect(s.at(-1).text).toBe('My name is Dan.');
 await page.screenshot({path:`${out}/english-speak-answer-390.png`,fullPage:true});
 await page.goto('/games/english-grade4/');
 await page.locator('[data-topic=spell]').click();
 await expect(page.locator('#speak')).toHaveCount(0);
 await page.locator('#answer').fill('teacher');await page.locator('#check').click();
 await expect(page.locator('#speak-answer')).toBeVisible();
});

test('without speech support the game works and shows no audio buttons',async({page})=>{
 await page.addInitScript(()=>{delete window.speechSynthesis;delete window.SpeechSynthesisUtterance;});
 await page.setViewportSize({width:390,height:844});
 await page.goto('/games/english-grade4/');
 await page.locator('[data-topic=phrases]').click();
 await expect(page.locator('#speak')).toHaveCount(0);
 await page.locator(`.choice[data-value="איך קוראים לך?"]`).click();await page.locator('#check').click();
 await expect(page.locator('.correct')).toBeVisible();
 await expect(page.locator('#speak-answer')).toHaveCount(0);
});
