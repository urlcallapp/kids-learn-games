// אנגלית כיתה ד׳ — הכנה למבחן: אוצר מילים, ביטויים, השלמת משפטים והבנת הנקרא קצרה.
// משחק עצמאי עם מאגר משלו. כל השמות והפרטים בטקסטים הם דמיוניים.
export const topics=[
 ['phrases','שלום, איך קוראים לך?','☺','ביטויי היכרות: שם, מקום מגורים וגיל'],
 ['words-a','מילים של בית הספר','⌂','friend, grade, house, new, school, teacher, town'],
 ['words-b','משפחה, ציפורים ושיעור','♪','brother, sister, bird, English, family, fly, lesson, nice, talk, want'],
 ['spell','כותבים באנגלית','✎','רואים מילה בעברית וכותבים אותה באנגלית'],
 ['fill','משלימים משפט','…','בוחרים את המילה שחסרה במשפט'],
 ['dialogue','משלימים שיחה','☏','שאלה ותשובה שמתאימות זו לזו'],
 ['card','כרטיס פרטים אישיים','▭','משלימים טקסט קצר עם בנק מילים'],
 ['yesno','Yes או No?','✓✗','קוראים טקסט קצר ובודקים משפטים'],
 ['sentences','בונים משפט נכון','≡','בוחרים את המשפט הנכון באנגלית'],
 ['master','אתגר האלופים','⚑','משלבים את כל מה שלמדנו']
].map(([id,title,icon,description])=>({id,title,icon,description}));

const all=[];
function q(topic,prompt,display,answer,hint,explanation,extra={}) {all.push({id:`${topic}-${all.filter(x=>x.topic===topic).length+1}`,topic,prompt,display,answer,hint,explanation,...extra});}

// אוצר מילים: [אנגלית, עברית]
const W={
 friend:'חבר',grade:'כיתה',house:'בית',new:'חדש',school:'בית ספר',teacher:'מורה',town:'עיירה',
 brother:'אח',sister:'אחות',bird:'ציפור',English:'אנגלית',family:'משפחה',fly:'לעוף',lesson:'שיעור',nice:'נחמד',talk:'לדבר',want:'רוצה'
};
const group=(...ws)=>ws.map(w=>[w,W[w]]);
const pickOthers=(list,correct,n=3,seed=0)=>{const others=[...new Set(list)].filter(x=>x!==correct);const r=seed%others.length;return others.slice(r).concat(others.slice(0,r)).slice(0,n);};
const place=(choices,answer,pos)=>{const rest=choices.filter(c=>c!==answer);rest.splice(pos%(rest.length+1),0,answer);return rest;};

// תחנה 1: ביטויים
const phrases=[
 ["What's your name?",'איך קוראים לך?'],
 ['My name is...','קוראים לי...'],
 ['Where do you live?','איפה אתה גר?'],
 ['I live in...','אני גר ב...'],
 ['How old are you?','בן כמה אתה?'],
 ["I'm ... years old",'אני בן ...'],
 ['I go to ... School','אני לומד בבית ספר ...']
];
phrases.forEach(([en,he],i)=>{
 const hes=phrases.map(p=>p[1]);
 q('phrases','מה הפירוש בעברית?',en,he,'חפשו את המילה השאלה: What = מה, Where = איפה, How old = בן כמה.',`${en} פירושו: ${he}`,{choices:place(pickOthers(hes,he,3,i).concat([he]),he,i+1).slice(0,4),ltr:true});
});
phrases.slice(0,6).forEach(([en,he],i)=>{
 const ens=phrases.map(p=>p[0]);
 q('phrases','איך אומרים באנגלית?',he,en,'חפשו את האנגלית שמתחילה במילה המתאימה.',`${he} באנגלית: ${en}`,{choices:place(pickOthers(ens,en,3,i+2).concat([en]),en,i+2).slice(0,4),textDisplay:false});
});

// תחנה 2-3: מילים
const A=group('friend','grade','house','new','school','teacher','town');
const B=group('brother','sister','bird','English','family','fly','lesson','nice','talk','want');
A.forEach(([en,he],i)=>q('words-a','מה פירוש המילה?',en,he,'נסו לחשוב על משפט שבו המילה מופיעה.',`${en} פירושו ${he}.`,{choices:place(pickOthers(A.map(x=>x[1]),he,3,i).concat([he]),he,i).slice(0,4)}));
A.forEach(([en,he],i)=>{if(i%2===0)q('words-a','איך אומרים באנגלית?',he,en,'חפשו את המילה שזכרתם מהרשימה.',`${he} באנגלית: ${en}.`,{choices:place(pickOthers(A.map(x=>x[0]),en,3,i+1).concat([en]),en,i+1).slice(0,4),ltr:false});});
B.forEach(([en,he],i)=>q('words-b','מה פירוש המילה?',en,he,'נסו לחשוב על משפט שבו המילה מופיעה.',`${en} פירושו ${he}.`,{choices:place(pickOthers(B.map(x=>x[1]),he,3,i).concat([he]),he,i).slice(0,4)}));
B.forEach(([en,he],i)=>{if(i%2===1)q('words-b','איך אומרים באנגלית?',he,en,'חפשו את המילה שזכרתם מהרשימה.',`${he} באנגלית: ${en}.`,{choices:place(pickOthers(B.map(x=>x[0]),en,3,i+1).concat([en]),en,i+3).slice(0,4)});});

// תחנה 4: כתיבה
[['teacher','מורה'],['friend','חבר'],['school','בית ספר'],['house','בית'],['brother','אח'],['sister','אחות'],['family','משפחה'],['bird','ציפור'],['lesson','שיעור'],['English','אנגלית'],['town','עיירה'],['grade','כיתה']]
 .forEach(([en,he])=>q('spell','איך כותבים באנגלית?',he,en,`המילה מתחילה באות ${en[0]} ויש בה ${en.length} אותיות.`,`${he} באנגלית: ${en}.`,{input:'text',textDisplay:false}));

// תחנה 5: השלמת משפטים
const fill=(sentence,answer,choices,hint,he)=>q('fill','איזו מילה חסרה?',sentence,answer,hint,`${sentence.replace('____',answer)} ${he}`,{choices,ltr:true,textDisplay:true});
fill('My ____ is big and has a red door.','house',['house','bird','talk','grade'],'מדובר במקום שגרים בו.','(המשפט: הבית שלי גדול ויש לו דלת אדומה.)');
fill('I am in ____ four.','grade',['house','grade','fly','town'],'באיזו כיתה אני? כיתה ד׳ היא four.','(אני בכיתה ד׳.)');
fill('A ____ can fly in the sky.','bird',['talk','town','bird','grade'],'מי עף בשמיים?','(ציפור יכולה לעוף בשמיים.)');
fill('A bird can ____.','fly',['grade','fly','house','town'],'מה ציפור עושה באוויר?','(ציפור יכולה לעוף.)');
fill('I like to ____ with my friends.','talk',['house','bird','talk','grade'],'מה עושים עם חברים בעזרת מילים?','(אני אוהב לדבר עם החברים שלי.)');
fill('I live in a small ____. Everyone knows everyone.','town',['town','bird','fly','grade'],'מקום קטן שבו כולם מכירים.','(אני גר בעיירה קטנה. כולם מכירים את כולם.)');
fill('My English ____ is nice.','teacher',['teacher','brother','lesson','family'],'מי מלמד אותנו בבית הספר?','(המורה שלי לאנגלית נחמדה.)');
fill('I have two sisters and one ____.','brother',['friend','brother','teacher','school'],'אחות היא sister. מה זה אח?','(יש לי שתי אחיות ואח אחד.)');
fill('We have an English ____ today.','lesson',['bird','lesson','house','sister'],'מה יש בבית הספר לפי מערכת השעות?','(יש לנו היום שיעור אנגלית.)');
fill('I go to a new ____. It is big.','school',['school','sister','bird','fly'],'לאן הולכים כל בוקר ללמוד?','(אני הולך לבית ספר חדש. הוא גדול.)');
fill('My friend is ____. He helps me.','nice',['new','nice','town','want'],'איך קוראים לאדם טוב שעוזר? ');

// תחנה 6: שיחות
const dlg=(topicPrompt,display,answer,choices,hint,explanation)=>q('dialogue',topicPrompt,display,answer,hint,explanation,{choices,ltr:true,textDisplay:true});
dlg('מה עונים?',"— What's your name?",'My name is Dan.',['I live in Green Town.',"I'm ten years old.",'My name is Dan.','I go to Sunrise School.'],'השאלה היא על שם.',"What's your name? = איך קוראים לך? עונים: My name is...");
dlg('מה עונים?','— Where do you live?','I live in Green Town.',['I live in Green Town.','My name is Dan.',"I'm ten years old.",'I have one brother.'],'השאלה היא על מקום מגורים.','Where do you live? = איפה אתה גר? עונים: I live in...');
dlg('מה עונים?','— How old are you?',"I'm ten years old.",["I'm ten years old.",'I live in Green Town.','My name is Dan.','I want a bike.'],'השאלה היא על גיל.',"How old are you? = בן כמה אתה? עונים: I'm ... years old.");
dlg('איזו שאלה חסרה?','— ____   — I live in Blue Town.','Where do you live?',["What's your name?",'Where do you live?','How old are you?','Do you want a bike?'],'התשובה אומרת איפה גרים.','התשובה I live in... מתאימה לשאלה Where do you live?');
dlg('איזו שאלה חסרה?','— ____   — My name is Maya.',"What's your name?",['How old are you?',"What's your name?",'Where do you live?','Is she nice?'],'התשובה אומרת איך קוראים לי.','התשובה My name is... מתאימה לשאלה What\'s your name?');
dlg('איזו שאלה חסרה?','— ____   — I\'m ten years old.','How old are you?',['Where do you live?',"What's your name?",'How old are you?','Do you have a dog?'],'התשובה מזכירה גיל.',"התשובה I'm ... years old מתאימה לשאלה How old are you?");
dlg('איזו תשובה מתאימה?','— Where do you live?','I live in a small town.',['My name is Omer.','I live in a small town.','I am ten years old.','I have two brothers.'],'חפשו את המשפט שמתחיל ב־I live.','I live in... עונה על Where do you live?');
dlg('איזו תשובה מתאימה?','— How old are you?','I am ten years old.',['I am ten years old.','I live in a house.','My teacher is nice.','I go to school.'],'חפשו את המשפט עם years old.','I am ... years old עונה על How old are you?');

// תחנה 7: כרטיס פרטים אישיים (טקסט דמיוני עם בנק מילים)
const bank='בנק מילים: house, grade, bird, talk, fly, town';
const cardText=(blank)=>`My name is Dan. I am ten years old and I am in ${blank==='grade'?'____':'grade'} four. I go to "Sunrise" School. I live in a ${blank==='town'?'____':'town'} near the sea. My ${blank==='house'?'____':'house'} is white. I have two sisters. My teacher is nice.`;
const cardQ=(blank,hint,explanation)=>q('card',bank,cardText(blank),blank,hint,explanation,{choices:['house','grade','bird','talk','fly','town'],ltr:true,textDisplay:true});
cardQ('grade','בכיתה ד׳ אומרים: ... four.','I am in grade four = אני בכיתה ד׳.');
cardQ('town','איפה גרים? מקום קטן ליד הים.','I live in a town near the sea = אני גר בעיירה ליד הים.');
cardQ('house','מה שלי לבן? מקום שגרים בו.','My house is white = הבית שלי לבן.');
q('card',bank,'Birds can ____ in the sky. Dan likes to watch them.','fly','מה ציפורים עושות בשמיים?','Birds can fly = ציפורים יכולות לעוף.',{choices:['house','grade','talk','fly','town'],ltr:true,textDisplay:true});
q('card',bank,'Look! A ____ is in the tree.','bird','בעל חיים עם כנפיים שיכול לדבר.','A bird is in the tree = ציפור על העץ.',{choices:['house','bird','fly','grade','town'],ltr:true,textDisplay:true});
q('card',bank,'Dan and his friends like to ____ after school.','talk','מה עושים עם חברים בעזרת מילים?','like to talk = אוהבים לדבר.',{choices:['house','grade','bird','talk','town'],ltr:true,textDisplay:true});

// תחנה 8: Yes / No
const maya='Hello, my name is Maya. I am nine years old and I am in grade four. I go to "Moon" School. I live in Blue Town. I have 2 brothers. I have a rabbit and I want a parrot. My English teacher is nice. I have a test on Sunday.';
const yn=(stmt,ans,he)=>q('yesno','קראו את הטקסט והחליטו: Yes או No?',stmt,ans,'חזרו לטקסט ובדקו את המשפט מילה במילה.',he,{choices:['Yes','No'],ltr:true,textDisplay:true,passage:maya});
yn('Maya is nine years old.','Yes','כתוב I am nine years old, לכן Yes.');
yn('Maya has a rabbit.','Yes','כתוב I have a rabbit, לכן Yes.');
yn('Maya wants a rabbit.','No','יש לה ארנב אבל היא רוצה תוכי (I want a parrot), לכן No.');
yn('Maya lives in Blue Town.','Yes','כתוב I live in Blue Town, לכן Yes.');
yn('Maya has 2 sisters.','No','יש לה 2 אחים (2 brothers) ואין אחיות, לכן No.');
yn('Maya has a test on Sunday.','Yes','כתוב I have a test on Sunday, לכן Yes.');
yn('Maya is in grade five.','No','כתוב grade four, כלומר כיתה ד׳, לכן No.');
yn('Maya has one brother.','No','יש לה 2 אחים (2 brothers), לכן No.');

// תחנה 9: בוחרים משפט נכון
const S=(prompt,answer,choices,hint,exp)=>q('sentences',prompt,'',answer,hint,exp,{choices,ltr:true,textDisplay:true,noDisplay:true});
S('איך כותבים: "אני בן עשר"?','I am ten years old.',['I have ten years old.','I am ten years old.','I am ten year old.','I ten years old.'],'באנגלית אומרים I am ... ולא I have ...','אומרים I am ten years old.');
S('איך כותבים: "קוראים לי דן"?','My name is Dan.',['My name Dan.','I name is Dan.','My name is Dan.','Name is my Dan.'],'מתחילים ב־My name is.','אומרים My name is Dan.');
S('איך כותבים: "אני גר בעיירה"?','I live in a town.',['I live on town.','I living in town.','I live in a town.','I am live in a town.'],'אומרים I live in.','אומרים I live in a town.');
S('איך כותבים: "יש לי שתי אחיות"?','I have two sisters.',['I am two sisters.','I have two sisters.','I have sisters two.','I two sisters have.'],'אומרים I have ... כשיש לנו משהו.','אומרים I have two sisters.');
S('איך כותבים: "אני לומד בבית ספר שמש"?','I go to Sunrise School.',['I go to Sunrise School.','I go Sunrise School.','I going to Sunrise School.','I am to Sunrise School.'],'אומרים I go to ... School.','אומרים I go to Sunrise School.');
S('איך כותבים: "המורה שלי נחמדה"?','My teacher is nice.',['My teacher nice.','My teacher is nice.','Teacher my is nice.','My teacher are nice.'],'צריך את המילה is באמצע.','אומרים My teacher is nice.');
S('איך כותבים: "אני רוצה אופניים"?','I want a bike.',['I want a bike.','I wants a bike.','I am want a bike.','I a bike want.'],'אחרי I לא מוסיפים s לפועל.','אומרים I want a bike.');

// תחנה 10: אתגר האלופים
q('master','איך שואלים "איפה אתה גר"?','בחרו את השאלה הנכונה',"Where do you live?",'מתחילים ב־Where.','Where = איפה.',{choices:["What's your name?",'Where do you live?','How old are you?','Where is your name?'],noDisplay:true,ltr:true});
q('master','מה פירוש המשפט?','I am ten years old and I am in grade four.','אני בן עשר ואני בכיתה ד׳','years old = שנים, grade = כיתה.','אני בן עשר ואני בכיתה ד׳.',{choices:['אני בן עשר ואני בכיתה ד׳','יש לי עשרה אחים ואני בכיתה ד׳','אני בן שבע ואני בכיתה ט׳','אני גר בעיירה ואני בכיתה ד׳'],ltr:false});
q('master','איזה משפט נכון?','בחרו','My English teacher is nice.',"מתחילים ב־My ואחריו teacher.",'My English teacher is nice = המורה שלי לאנגלית נחמדה.',{choices:['English teacher my is nice.','My English teacher is nice.','My English teacher nice is.','Teacher English my nice.'],noDisplay:true,ltr:true});
q('master','כתבו באנגלית: ציפור','ציפור','bird','האות הראשונה היא b.','ציפור באנגלית: bird.',{input:'text'});
q('master','כתבו באנגלית: לעוף','לעוף','fly','המילה קצרה וצריך בה y.','לעוף באנגלית: fly.',{input:'text'});
q('master','מה פירוש?','family','משפחה','זה כולל אמא, אבא, אח ואחות.','family = משפחה.',{choices:['חבר','משפחה','שיעור','עיירה'],ltr:true});
q('master','מה פירוש?','want','רוצה','I want a bike.','want = רוצה.',{choices:['לדבר','לעוף','רוצה','נחמד'],ltr:true});
q('master','השלימו את השיחה','— Hello!  — Hi! ____?  — My name is Dan.',"What's your name",'מה השאלה שהתשובה שלה היא "My name is Dan"?','התשובה מספרת את שמו, ולכן השאלה היא What\'s your name?',{choices:["What's your name",'How old are you','Where do you live','Is it nice'],ltr:true,textDisplay:true});

export const questions=all;
const norm=s=>String(s).trim().replace(/[.!?,]+$/,'').replace(/\s+/g,' ').toLowerCase();
export function checkAnswer(question,value){
 if(question.input==='text')return norm(value)===norm(question.answer);
 return value===question.answer;
}
export const meta={key:'kids-learn-games.english-grade4.v1',title:'מסע באנגלית',eyebrow:'אנגלית · כיתה ד׳ · הכנה למבחן',intro:'מתכוננים למבחן באנגלית: ביטויי היכרות, אוצר מילים, כתיבת מילים, השלמת משפטים וקריאת טקסט קצר. המשחק מבוסס על סיכום החומר, ואינו כולל את קטע הקריאה מהחוברת הצהובה.',source:null};
