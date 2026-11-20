// Workbook characters only. The source photos are deliberately not published.
export const workbookReadings={
 friends:{title:'Karen Meets New Friends',text:`Karen: Hi. My name is Karen.
I am the new girl. I am in grade 4.
Where is the school?
Pam: Hi. My name is Pam. The school is in town.
Karen: Where do you live?
Pam: I live in the red house.
Max: I live in the blue house.
Ned: I live in the brown house.
Karen: I live in the green house.
Pam: The teacher lives in the orange house.
Max: Wow! A new friend!`},
 houses:{title:'The houses',text:'Lisa lives in a yellow house. Tom lives in a white house. Eden lives in a gray house. Eden’s house is big. Tom’s house is small.',note:'תיאור הבתים שבתמונה בחוברת. מתרגלים גם big ו־small.'},
 profiles:{title:'Meet Shira and Shelly',text:`Shira
My name is Shira.
I live in Orange Town.
I am ten years old.
I go to Orange School.
I have four brothers and two sisters.
I have a dog.
I like English lessons.

Shelly
My name is Shelly.
I live in Yellow Town.
I am nine years old.
I go to Yellow School.
I have a sister. She is nice.
I want a brother.
I have a bird. It can fly and talk.`}
};
export const workbookTopics=[
 {id:'wb-friends',title:'חברים חדשים ב־Fun Town',icon:'⌂',description:'קוראים שיחה, מגלים מי גר בכל בית ועונים על אתגרים',reading:workbookReadings.friends},
 {id:'wb-houses',title:'בלשי הבתים',icon:'⌕',description:'צבעים, big ו־small והשלמת משפטים מבנק מילים',reading:workbookReadings.houses},
 {id:'wb-profiles',title:'מכירים את Shira ו־Shelly',icon:'☻',description:'קוראים שני כרטיסי היכרות ומגלים מה שייך למי',reading:workbookReadings.profiles},
 {id:'wb-yesno',title:'בודקים את הסיפור',icon:'✓✗',description:'חמשת משפטי Yes / No מהחוברת',reading:workbookReadings.profiles},
 {id:'wb-card',title:'כרטיסים ושאלות היכרות',icon:'▭',description:'משלימים כרטיס לפי הסיפור ומתאימים שאלות לתשובות',reading:workbookReadings.profiles}
].map(t=>({...t,section:'workbook'}));
export function addWorkbook(q){
 const add=(topic,display,answer,choices,explanation,extra={})=>q(topic,'קראו ובחרו את התשובה המתאימה',display,answer,'חפשו בטקסט את השם והמילים שמופיעים בשאלה.',explanation,{choices,ltr:true,textDisplay:true,passage:workbookTopics.find(t=>t.id===topic).reading.text,...extra});
 const colors=['red','blue','brown','green','orange'];
 [['Pam','red'],['Max','blue'],['Ned','brown'],['Karen','green'],['The teacher','orange']].forEach(([name,color])=>add('wb-friends',`${name}: I live in the ____ house.`,color,colors,`${name}: ${color} house.`,{prompt:'מי גר באיזה בית? השלימו לפי השיחה'}));
 add('wb-friends','Who is the new girl?','Karen',['Pam','Karen','Max','Ned'],'Karen אומרת: I am the new girl.');
 add('wb-friends','What grade is Karen in?','Grade 4',['Grade 3','Grade 4','Grade 5'],'Karen אומרת: I am in grade 4.');
 add('wb-friends','Where is the school?','In town',['In town','In the blue house','In the red house'],'Pam אומרת: The school is in town.');
 add('wb-friends','Who lives in the brown house?','Ned',['Pam','Max','Ned','Karen'],'Ned אומר: I live in the brown house.');
 add('wb-friends','Who says: “Wow! A new friend!”?','Max',['Karen','Pam','Max','Ned'],'Max אומר: Wow! A new friend!');
 const nameOrders=[
  ['Pam · Karen · Ben · Max','Ben, Karen, Max, Pam',['Ben, Karen, Max, Pam','Pam, Karen, Ben, Max','Max, Ben, Pam, Karen']],
  ['Fran · Edna · Pedro · Rita','Edna, Fran, Pedro, Rita',['Fran, Edna, Pedro, Rita','Edna, Fran, Pedro, Rita','Rita, Pedro, Fran, Edna']],
  ['Bob · Ann · Jet · Nat','Ann, Bob, Jet, Nat',['Bob, Ann, Jet, Nat','Nat, Jet, Bob, Ann','Ann, Bob, Jet, Nat']]
 ];
 nameOrders.forEach(([s,a,c])=>add('wb-houses',s,a,c,`לפי האות הראשונה: ${a}.`,{prompt:'סדרו את השמות לפי סדר ה־ABC',passage:'ABC: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'}));
 const bank=['big','small','green','white','yellow','gray'];
 [['Lisa','yellow'],['Tom','white'],['Eden','gray']].forEach(([name,color])=>add('wb-houses',`${name}: I live in a ____ house.`,color,bank,`${name}: I live in a ${color} house.`,{prompt:'בנק מילים: big, small, green, white, yellow, gray'}));
 add('wb-houses','Eden: I live in a ____ house.','big',['big','small'],'בתמונה הבית של Eden גדול; big פירושו גדול.',{prompt:'השלימו מילה שמתארת את גודל הבית'});
 add('wb-houses','Tom: I live in a ____ house.','small',['big','small'],'בתמונה הבית של Tom קטן; small פירושו קטן.',{prompt:'השלימו מילה שמתארת את גודל הבית'});
 add('wb-houses','Tom: I live in a white ____.','house',undefined,'I live in a white house.',{prompt:'כתבו את המילה החסרה: בית',input:'text'});
 const people=['Shira','Shelly'];
 [['Who lives in Orange Town?','Shira'],['Who is nine years old?','Shelly'],['Who has four brothers?','Shira'],['Who has a bird?','Shelly'],['Who likes English lessons?','Shira'],['Who wants a brother?','Shelly']].forEach(([s,a])=>add('wb-profiles',s,a,people,`${a}. חזרו לכרטיס שלה ובדקו את הפרט.`));
 add('wb-profiles','How old is Shira?','Ten years old',['Nine years old','Ten years old','Four years old'],'Shira אומרת: I am ten years old.');
 add('wb-profiles','Where does Shelly go to school?','Yellow School',['Orange School','Yellow School'],'Shelly אומרת: I go to Yellow School.');
 add('wb-profiles','What pet does Shira have?','A dog',['A dog','A bird'],'Shira אומרת: I have a dog.');
 add('wb-profiles','What can Shelly’s bird do?','Fly and talk',['Read and write','Fly and talk','Go to school'],'Shelly אומרת על הציפור: It can fly and talk.');
 [['Shira has two sisters.','Yes','Shira אומרת: I have four brothers and two sisters.'],['Shira likes English lessons.','Yes','Shira אומרת: I like English lessons.'],['Shelly can fly.','No','הציפור של Shelly יכולה לעוף, לא Shelly.'],['Shelly has a brother.','No','Shelly רוצה אח: I want a brother. לא כתוב שיש לה אח.'],['Shira and Shelly are nine years old.','No','Shira בת עשר, Shelly בת תשע.']].forEach(([s,a,e])=>add('wb-yesno',s,a,['Yes','No'],e,{prompt:'לפי הסיפור: Yes או No?'}));
 [['Shira — Town: ____','Orange Town',['Orange Town','Yellow Town']],['Shira — Age: ____','Ten',['Nine','Ten']],['Shira — School: ____','Orange School',['Yellow School','Orange School']],['Shira — Pets: ____','A dog',['A dog','A bird']],['Shira — Family: ____ brothers','Four',['One','Two','Four']],['Shira — Family: ____ sisters','Two',['One','Two','Four']],['Shelly — Town: ____','Yellow Town',['Yellow Town','Orange Town']],['Shelly — Age: ____','Nine',['Nine','Ten']],['Shelly — School: ____','Yellow School',['Orange School','Yellow School']],['Shelly — Pets: ____','A bird',['A dog','A bird']],['Shelly — Family: ____ sister','One',['One','Two','Four']]].forEach(([s,a,c])=>add('wb-card',s,a,c,`${s.replace('____',a)}. זהו הפרט שמופיע בכרטיס שלה.`,{prompt:'משלימים כרטיס של דמות מהסיפור, לא פרטים שלכם'}));
 const replies=['I live in Afula.',"I’m nine years old.",'My name is Bar.'];
 [['How old are you?',replies[1]],['What’s your name?',replies[2]],['Where do you live?',replies[0]]].forEach(([s,a])=>add('wb-card',s,a,replies,`${s} → ${a}`,{prompt:'התאימו שאלה לתשובה, כמו בתרגיל Match A to B',passage:'Bar: My name is Bar. I’m nine years old. I live in Afula.'}));
}
