'use strict';
/* Curriculum selection and saved progress, kept independent of page rendering. */
const PhonicsPractice=(()=>{
 function restore(raw,data){
  const known=new Set(data.entries.map(e=>e.id));
  const clean=value=>Array.isArray(value)?[...new Set(value.filter(id=>known.has(id)))]:[];
  const result={practised:clean(raw?.practised),followed:clean(raw?.followed),review:clean(raw?.review),last:'start',cursors:{}};
  if(data.lessons.some(l=>l.id===raw?.last))result.last=raw.last;
  for(const l of data.lessons){const id=raw?.cursors?.[l.id];if(l.ids.includes(id))result.cursors[l.id]=id;}
  return result;
 }
 function lessonFor(cardId,data){return data.lessons.find(l=>l.ids.includes(cardId));}
 function candidates(target,pool,practised,data){
  const owner=lessonFor(target.id,data),limit=data.lessons.findIndex(l=>l.id===owner?.id);
  const eligible=new Set(data.lessons.slice(0,limit+1).flatMap(l=>l.ids));
  const ids=new Set([...pool.map(e=>e.id),...practised,...eligible]);
  return data.entries.filter(e=>ids.has(e.id)&&e.id!==target.id&&(eligible.has(e.id)||pool.some(p=>p.id===e.id)||practised.includes(e.id)));
 }
 function distinctOptions(target,candidates,shuffle){
  const sounds=new Set([target.s]),others=[];
  for(const e of shuffle(candidates)){if(sounds.has(e.s))continue;sounds.add(e.s);others.push(e);if(others.length===2)break;}
  return shuffle([target,...others]);
 }
 return {restore,lessonFor,candidates,distinctOptions};
})();
