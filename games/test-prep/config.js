import {questions as all,topics as allTopics,checkAnswer} from '../../questions.js';
export const questions=all.filter(q=>q.page<=14);
export const topics=allTopics.filter(t=>questions.some(q=>q.topic===t.id));
export {checkAnswer};
export const meta={key:'kids-learn-games.test-prep.v1',title:'הכנה למבחן',eyebrow:'חשבון · כיתה ד׳ · עד עמוד 14',intro:'אימון ממוקד לקראת המבחן: רק התרגילים שמופיעים עד עמוד 14 בחוברת, בלי תוכן מהעמודים הבאים.'};
