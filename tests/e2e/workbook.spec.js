import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {questions,topics} from '../../games/english-grade4/config.js';
const out=process.env.SCREENSHOT_DIR||'test-results/screens';
fs.mkdirSync(out,{recursive:true});
const stub=()=>{window.__spoken=[];window.SpeechSynthesisUtterance=function(t){this.text=t;};Object.defineProperty(window,'speechSynthesis',{value:{speak:u=>window.__spoken.push(u.text),cancel:()=>{}},configurable:true});};
for(const width of [390,1280]){
 test(`workbook read-then-play, passage return, audio and layout at ${width}px`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(stub);
  await page.setViewportSize({width,height:900});
  await page.goto('/games/english-grade4/');
  await page.reload();
  await expect(page.locator('[data-section=workbook] [data-topic]')).toHaveCount(5);
  await expect(page.locator('[data-section=review] [data-topic]')).toHaveCount(10);
  await page.locator('[data-section=workbook]').screenshot({path:`${out}/workbook-zone-${width}.png`});
  for(const topic of topics.filter(t=>t.section==='workbook')){
   await page.locator(`[data-topic=${topic.id}]`).click();
   await expect(page.locator('#reading-title')).toHaveText(topic.reading.title);
   await expect(page.locator('#answer-form')).toHaveCount(0);
   await expect(page.locator('.reading-intro .passage')).toHaveText(topic.reading.text);
   await page.locator('#read-story').click();
   expect((await page.evaluate(()=>window.__spoken)).at(-1)).toBe(topic.reading.text);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
   await page.screenshot({path:`${out}/workbook-reading-${topic.id}-${width}.png`,fullPage:true});
   await page.locator('#start-reading-challenges').click();
   const q=questions.find(q=>q.topic===topic.id);
   await expect(page.locator('.reading-source')).not.toHaveAttribute('open','');
   await page.locator('.reading-source summary').click();
   await expect(page.locator('.reading-source .passage')).toHaveText(q.passage);
   await page.screenshot({path:`${out}/workbook-open-${topic.id}-${width}.png`,fullPage:true});
   await page.locator('.reading-source summary').click();
   await page.locator('#speak').click();
   expect((await page.evaluate(()=>window.__spoken)).slice(-2)).toEqual(q.speak);
   await page.locator('.choice').filter({hasText:new RegExp('^'+q.answer+'$')}).click();
   await page.locator('#check').click();
   await expect(page.locator('.correct')).toBeVisible();
   if(q.speakAnswer){await page.locator('#speak-answer').click();expect((await page.evaluate(()=>window.__spoken)).at(-1)).toBe(q.speakAnswer);}
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
   await page.screenshot({path:`${out}/workbook-challenge-${topic.id}-${width}.png`,fullPage:true});
   await page.locator('#map').click();
  }
  expect(errors).toEqual([]);
 });
}
test('existing English progress survives workbook expansion and no-speech reading still starts',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('kids-learn-games.english-grade4.v1',JSON.stringify({'phrases-1':3,'yesno-1':2}));delete window.speechSynthesis;delete window.SpeechSynthesisUtterance;});
 await page.goto('/games/english-grade4/');
 await expect(page.locator('.score-strip')).toContainText('2 מתוך 147');
 await page.locator('[data-topic=wb-friends]').click();
 await expect(page.locator('#read-story')).toHaveCount(0);
 await page.locator('#start-reading-challenges').click();
 await page.locator('.choice[data-value=red]').click();await page.locator('#check').click();
 await expect(page.locator('.correct')).toBeVisible();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('kids-learn-games.english-grade4.v1')));
 expect(stored).toEqual({'phrases-1':3,'yesno-1':2,'wb-friends-1':3});
});
