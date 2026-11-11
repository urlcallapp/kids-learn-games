import {test,expect} from '@playwright/test';
import {questions,topics} from '../../questions.js';
import fs from 'node:fs';
const out=process.env.SCREENSHOT_DIR||'test-results/screenshots';fs.mkdirSync(out,{recursive:true});
async function answer(page,q){let a=q.answer;if(q.kind==='range')a=q.min+1;if(q.kind==='pairRange')a=[q.min+1,q.min+2];if(q.kind==='prime')a=13;
if(q.kind==='multi'){for(const n of a)await page.getByRole('button',{name:String(n),exact:true}).click();}
else if(q.choices)await page.getByRole('button',{name:String(a),exact:true}).click();
else if(q.kind==='pair'||q.kind==='pairRange'){await page.locator('#answer-0').fill(String(a[0]));await page.locator('#answer-1').fill(String(a[1]));}
else await page.locator('#answer').fill(Number(a).toLocaleString('en-US'));
await page.locator('#check').click();await expect(page.locator('.correct')).toBeVisible();}
test('Complete all 71 actual exercises at phone size; correct progress survives refresh',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/games/number-quest/');for(const topic of topics){await page.locator(`[data-topic=${topic.id}]`).click();for(const q of questions.filter(q=>q.topic===topic.id)){await answer(page,q);await page.locator('#next').click();}await expect(page.locator('h1')).toHaveText('המסלול הושלם!');await page.locator('#back-map').click();}await expect(page.locator('.score-strip')).toContainText('213');await page.reload();await expect(page.locator('.score-strip')).toContainText('213');expect(errors).toEqual([]);});
test('Wrong answer, empty answer, hints, reveal, skip, review, scoring and keyboard',async({page})=>{await page.goto('/games/number-quest/');await page.locator('[data-topic=sequences]').click();await page.locator('#check').click();await expect(page.locator('#feedback')).toContainText('קודם');await page.locator('#answer').fill('1');await page.locator('#answer').press('Enter');await expect(page.locator('.incorrect')).toBeVisible();await page.locator('#hint').click();await expect(page.locator('#hint-box')).toContainText('קפיצה');await page.locator('#reveal').click();await expect(page.locator('#hint-box')).toContainText('30,175');await answer(page,questions[0]);await expect(page.locator('.correct')).toContainText('★');await page.locator('#next').click();for(let i=1;i<6;i++)await page.locator('#skip').click();await expect(page.locator('h1')).toContainText('התקדמות');await page.locator('#review').click();await expect(page.locator('.section-head')).toContainText('מתוך 6');await page.locator('#map').click();await expect(page.locator('.score-strip')).toContainText('1');});
test('Public portal direct link, reload, no overflow, visual states at all widths',async({page,context})=>{for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});await page.goto('/');await expect(page.getByRole('link',{name:/יוצאים למסע/})).toHaveAttribute('href','./games/number-quest/');await page.screenshot({path:`${out}/portal-${width}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.getByRole('link',{name:/יוצאים למסע/}).click();await page.reload();await expect(page.locator('[data-topic]')).toHaveCount(12);await page.screenshot({path:`${out}/map-${width}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.locator('[data-topic=stories]').click();await page.screenshot({path:`${out}/mission-${width}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await answer(page,questions.find(q=>q.id==='stories-1'));await page.screenshot({path:`${out}/feedback-${width}.png`,fullPage:true});}
await page.setViewportSize({width:390,height:844});await page.goto('/games/number-quest/');await page.locator('[data-topic=build]').click();for(let i=0;i<4;i++)await page.locator('#skip').click();await page.screenshot({path:`${out}/choices-390.png`,fullPage:true});await page.locator('#map').click();await page.locator('[data-topic=primes]').click();await answer(page,questions.find(q=>q.id==='primes-1'));await page.locator('#next').click();await page.getByRole('button',{name:'11',exact:true}).click();await page.getByRole('button',{name:'11',exact:true}).click();await expect(page.getByRole('button',{name:'11',exact:true})).toHaveAttribute('aria-pressed','false');await page.screenshot({path:`${out}/multi-390.png`,fullPage:true});});
test('Mixed rounds use six distinct topics; clipboard uses direct game URL',async({page,context})=>{await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('/');await page.locator('[data-copy=number-quest]').click();await expect(page.locator('#copy-status-number-quest')).toHaveText('הקישור הועתק!');expect(await page.evaluate(()=>navigator.clipboard.readText())).toMatch(/\/games\/number-quest\/$/);await page.goto('/games/number-quest/');await page.locator('#quick').click();const seen=[];for(let i=0;i<6;i++){seen.push(await page.locator('.mission>.eyebrow').textContent());await page.locator('#skip').click();}expect(new Set(seen).size).toBe(6);await expect(page.locator('#review')).toContainText('6');});
test('Storage failure warns without stopping play, best scores cannot be farmed or lowered',async({page})=>{await page.addInitScript(()=>{Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('test storage unavailable');}});});await page.goto('/games/number-quest/');await page.locator('[data-topic=sequences]').click();await answer(page,questions[0]);await expect(page.locator('.correct')).toBeVisible();await page.locator('#map').click();await expect(page.locator('.storage-note')).toContainText('לא הצלחנו לשמור');await expect(page.locator('.score-strip')).toContainText('3');await page.locator('[data-topic=sequences]').click();await page.locator('#hint').click();await answer(page,questions[0]);await page.locator('#map').click();await expect(page.locator('.score-strip')).toContainText('3');});
test('Every question and choice fits a narrow phone',async({page})=>{await page.setViewportSize({width:320,height:844});await page.goto('/games/number-quest/');for(const topic of topics){await page.locator(`[data-topic=${topic.id}]`).click();for(const q of questions.filter(q=>q.topic===topic.id)){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),q.id).toBeTruthy();await page.locator('#skip').click();}await page.locator('#back-map').click();}});
test('Original workbook is linked from portal, map and exercise, with original bytes',async({page,request})=>{await page.goto('/');const source=page.getByRole('link',{name:'חוברת התרגול המקורית (PDF)',exact:true}).first();await expect(source).toHaveAttribute('href','./assets/workbooks/grade-4-whole-numbers.pdf');const url=await source.evaluate(a=>a.href),r=await request.get(url);expect(r.ok()).toBeTruthy();expect((await r.body()).equals(fs.readFileSync('assets/workbooks/grade-4-whole-numbers.pdf'))).toBeTruthy();await page.goto('/games/number-quest/');await expect(page.getByRole('link',{name:'פתיחת חוברת התרגול המקורית (PDF)',exact:true})).toHaveAttribute('href','../../assets/workbooks/grade-4-whole-numbers.pdf');await page.locator('[data-topic=sequences]').click();await expect(page.locator('.source-note a')).toHaveAttribute('href','../../assets/workbooks/grade-4-whole-numbers.pdf#page=2');});
test('Handwriting scratch supports drawing, undo, clear, resize, tabs and question reset',async({page})=>{await page.goto('/games/number-quest/');await page.locator('[data-topic=sequences]').click();await expect(page.locator('#answer')).toHaveAttribute('inputmode','numeric');await expect(page.locator('#answer')).toHaveAttribute('enterkeyhint','done');await page.locator('.scratch summary').click();const c=page.locator('canvas');await c.scrollIntoViewIfNeeded();const box=await c.boundingBox();const digest=()=>c.evaluate(c=>c.toDataURL());const before=await digest();await page.mouse.move(box.x+20,box.y+30);await page.mouse.down();await page.mouse.move(box.x+90,box.y+90,{steps:8});await page.mouse.up();expect(await digest()).not.toBe(before);await expect(page.locator('[data-undo]')).toBeEnabled();await page.screenshot({path:`${out}/handwriting-390.png`,fullPage:true});await page.locator('[data-undo]').click();expect(await digest()).toBe(before);await c.scrollIntoViewIfNeeded();const box2=await c.boundingBox();await page.mouse.move(box2.x+20,box2.y+30);await page.mouse.down();await page.mouse.move(box2.x+80,box2.y+80);await page.mouse.up();await page.setViewportSize({width:320,height:844});await expect(page.locator('[data-clear]')).toBeEnabled();await page.locator('#text-mode').click();await expect(c).toBeHidden();await page.locator('#scratch').fill('30,125 + 50');await page.locator('#draw-mode').click();await expect(c).toBeVisible();await page.locator('[data-clear]').click();await expect(page.locator('[data-undo]')).toBeDisabled();await page.locator('#skip').click();await page.locator('.scratch summary').click();await expect(page.locator('#scratch')).toBeEmpty();await expect(page.locator('[data-undo]')).toBeDisabled();});
test('Repository link and compact public link-preview metadata on both entry pages',async({page,request})=>{for(const route of ['/','/games/number-quest/','/games/test-prep/','/games/times-table/']){await page.goto(route);const link=page.getByRole('link',{name:'קוד המשחקים ב-GitHub',exact:true});await expect(link).toHaveAttribute('href','https://github.com/urlcallapp/kids-learn-games');await expect(link.locator('img')).toBeVisible();await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://urlcallapp.github.io/kids-learn-games/assets/previews/portal.png');await page.screenshot({path:`${out}/repo-link-${route==='/'?'portal':route.includes('test-prep')?'test-prep':route.includes('times-table')?'times-table':'game'}-390.png`,fullPage:true});}expect(fs.statSync('assets/previews/portal.png').size).toBeLessThan(300000);});
test('Portal combines free text and registry-only tag filters; no-results and reset work on narrow phones',async({page})=>{await page.setViewportSize({width:320,height:844});await page.goto('/');await expect(page.locator('[data-filter]')).toHaveCount(7);await expect(page.locator('[data-filter="אנגלית"]')).toHaveCount(0);await page.getByRole('searchbox').fill('מִסְפָּרִים כפל');await expect(page.locator('.game-card')).toHaveCount(1);await page.locator('[data-filter="חשבון"]').click();await expect(page.locator('[data-filter="חשבון"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.game-card')).toHaveCount(1);await page.getByRole('searchbox').fill('אנגלית');await expect(page.locator('.game-card')).toHaveCount(0);await expect(page.locator('#no-games')).toBeVisible();await expect(page.locator('#result-count')).toContainText('0 מתוך 3');await page.locator('#reset-search').click();await expect(page.locator('.game-card')).toHaveCount(3);await expect(page.getByRole('searchbox')).toBeEmpty();await expect(page.locator('[data-filter=""]')).toHaveAttribute('aria-pressed','true');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:`${out}/search-320.png`,fullPage:true});await page.getByRole('searchbox').fill('אנגלית');await page.screenshot({path:`${out}/search-empty-320.png`,fullPage:true});});
test('Portal card shows the game addition date; game header has a clear return-to-portal button',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const added=page.locator('.game-card .game-added time');
 await expect(added).toHaveCount(3);
 await expect(added.first()).toHaveAttribute('datetime','2026-11-10');
 await expect(added.first()).toHaveText('10.11.2026');
 await expect(page.locator('.game-added').first()).toContainText('נוסף לאוסף');
 await page.goto('/games/number-quest/');
 for(const step of ['map','mission']){
  if(step==='mission')await page.locator('[data-topic=sequences]').click();
  const back=page.getByRole('link',{name:'חזרה למרחב המשחקים'});
  await expect(back).toBeVisible();
  await expect(back).toHaveAttribute('href','../../');
  await page.screenshot({path:`${out}/back-home-${step}-390.png`});
  if(step==='mission'){await back.click();await expect(page.getByRole('heading',{name:'משחקים שלומדים מהם'})).toBeVisible();}
 }
 await page.setViewportSize({width:320,height:844});
 await page.goto('/games/number-quest/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('Test-prep game is a separate portal entry limited to material through page 14',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('.game-card')).toHaveCount(3);
 await page.locator('[data-filter="הכנה למבחן"]').click();
 await expect(page.locator('.game-card')).toHaveCount(1);
 await expect(page.locator('.game-card h2')).toHaveText('הכנה למבחן');
 const cta=page.getByRole('link',{name:/מתחילים תרגול/});
 await expect(cta).toHaveAttribute('href','./games/test-prep/');
 await cta.click();await page.reload();
 await expect(page.locator('h1')).toHaveText('הכנה למבחן');
 await expect(page.locator('.compact .eyebrow')).toContainText('עד עמוד 14');
 await expect(page.locator('[data-topic]')).toHaveCount(6);
 await expect(page.locator('.score-strip')).toContainText('מתוך 36 משימות');
 await page.locator('[data-topic=sequences]').click();
 await expect(page.locator('.source-note a')).toHaveAttribute('href','../../assets/workbooks/grade-4-whole-numbers.pdf#page=2');
 await answer(page,questions.find(q=>q.id==='sequences-1'));
 expect(await page.evaluate(()=>Object.keys(localStorage))).toContain('kids-learn-games.test-prep.v1');
 await page.screenshot({path:`${out}/test-prep-390.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByRole('link',{name:'חזרה למרחב המשחקים'}).click();
 await expect(page.locator('.game-card')).toHaveCount(3);
});
test('Each game card has its own illustration and color; success celebration is a one-shot calm pop',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const arts=page.locator('.game-card .game-art');
 await expect(arts).toHaveCount(3);
 const svgs=await arts.evaluateAll(es=>es.map(e=>e.querySelector('svg').outerHTML));
 expect(svgs[0]).not.toBe(svgs[1]);
 const bgs=await arts.evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor));
 expect(bgs[0]).not.toBe(bgs[1]);
 expect(await arts.evaluateAll(es=>es.every(e=>!e.querySelector('svg').outerHTML.includes('M25 55 34 34')))).toBeTruthy();
 await page.goto('/games/number-quest/');
 await page.locator('[data-topic=sequences]').click();
 await answer(page,questions[0]);
 const stars=page.locator('.feedback.correct .celebrate i');
 await expect(stars).toHaveCount(3);
 await expect(page.locator('.feedback.correct')).toBeVisible();
 await page.waitForTimeout(1400);
 await expect(stars.first()).toHaveCSS('opacity','0');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('#next').click();
 await answer(page,questions[1]);
 expect(await page.locator('.feedback.correct .celebrate i').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
test('Times-table game: portal entry, flash memory mechanic, stations and phone widths',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('[data-filter="לוח הכפל"]').click();
 await expect(page.locator('.game-card')).toHaveCount(1);
 await expect(page.locator('.game-card h2')).toHaveText('ממלכת הכפל');
 const cta=page.getByRole('link',{name:/נכנסים לממלכה/});
 await expect(cta).toHaveAttribute('href','./games/times-table/');
 await cta.click();await page.reload();
 await expect(page.locator('h1')).toHaveText('ממלכת הכפל');
 await expect(page.locator('[data-topic]')).toHaveCount(10);
 await expect(page.locator('.score-strip')).toContainText('82');
 await expect(page.locator('.workbook-link')).toHaveCount(0);
 await page.locator('[data-topic=flash]').click();
 await expect(page.locator('.source-note')).toHaveCount(0);
 await expect(page.locator('#flash-cover')).toBeHidden();
 await expect(page.locator('#flash-display')).toContainText('4 × 8');
 await page.waitForTimeout(3600);
 await expect(page.locator('#flash-cover')).toBeVisible();
 await page.screenshot({path:`${out}/times-table-flash-390.png`,fullPage:true});
 await page.locator('#peek').click();
 await expect(page.locator('#flash-cover')).toBeHidden();
 await page.locator('#answer').fill('32');
 await page.locator('#check').click();
 await expect(page.locator('.feedback.correct strong')).toHaveText('★★ מצאתם!');
 await page.locator('#next').click();
 for(let i=0;i<7;i++)await page.locator('#skip').click();
 await page.locator('#back-map').click();
 const missingAnswers=[4,9,7,4,9,9,6,5,9,3,5,9];
 await page.locator('[data-topic=missing]').click();
 for(const a of missingAnswers){await page.locator('#answer').fill(String(a));await page.locator('#check').click();await expect(page.locator('.correct')).toBeVisible();await page.locator('#next').click();}
 await expect(page.locator('h1')).toHaveText('המסלול הושלם!');
 await page.locator('#back-map').click();
 await page.locator('[data-topic=multiples]').click();
 for(const n of [7,14,21,35])await page.getByRole('button',{name:String(n),exact:true}).click();
 await page.locator('#check').click();
 await expect(page.locator('.correct')).toBeVisible();
 expect(await page.evaluate(()=>Object.keys(localStorage))).toContain('kids-learn-games.times-table.v1');
 await page.screenshot({path:`${out}/times-table-390.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 for(const width of [320,1280]){await page.setViewportSize({width,height:844});await page.goto('/games/times-table/');await expect(page.locator('[data-topic]')).toHaveCount(10);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:`${out}/times-table-map-${width}.png`,fullPage:true});}
 expect(errors).toEqual([]);
});
