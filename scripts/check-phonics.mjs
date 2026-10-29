import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const data=vm.runInNewContext(fs.readFileSync('dist/phonics-data.js','utf8')+';PHONICS');
const practice=vm.runInNewContext(fs.readFileSync('dist/phonics-practice.js','utf8')+';PhonicsPractice');
const get=id=>data.entries.find(e=>e.id===id);
const shuffle=items=>[...items].sort(()=>Math.random()-.5);
const legacy=practice.restore({practised:['s','s','missing'],review:['a-e','missing'],last:'start',cursors:{start:'n',magic:'s'}},data);
assert.equal(JSON.stringify(legacy.practised),JSON.stringify(['s']));
assert.equal(legacy.followed.length,0,'old practice records must not claim a spoken response');
assert.equal(legacy.review[0],'a-e');
assert.equal(legacy.cursors.start,'n');
assert.equal(legacy.cursors.magic,undefined);
assert.equal(practice.lessonFor('a-e',data).id,'magic','review cards must open their own lesson');
assert.equal(practice.restore({practised:{},review:'bad',last:'missing'},data).last,'start');
for(const lesson of data.lessons){
 const pool=lesson.ids.map(get),eligible=new Set(data.lessons.slice(0,data.lessons.indexOf(lesson)+1).flatMap(l=>l.ids));
 for(const target of pool)for(let attempt=0;attempt<20;attempt++){
  const options=practice.distinctOptions(target,practice.candidates(target,pool,[],data),shuffle);
  assert.equal(options.filter(e=>e.id===target.id).length,1);
  assert.equal(new Set(options.map(e=>e.s)).size,options.length,'a question must not contain two equivalent sound answers');
  assert(options.every(e=>eligible.has(e.id)),'a question must not introduce future graphemes');
 }
}
const seen=new Set();
for(const e of data.entries){assert(!seen.has(e.id));seen.add(e.id);assert.equal(e.parts.join(''),e.word);assert.equal(e.keys.length,e.parts.length);for(const key of e.keys)if(key)assert(data.sounds[key]);}
const words=JSON.parse(fs.readFileSync('dist/audio/words/words.json'));
function checkWord(word){
 const u=new URL(words[word]);
 assert.equal(u.origin,'https://dict.youdao.com');
 assert.equal(u.pathname,'/dictvoice');
 assert.equal(u.searchParams.get('audio'),word);
 assert.equal(u.searchParams.get('type'),'1','whole words must use the British source');
}
for(const e of data.entries)checkWord(e.word);
for(const l of data.lessons)for(const word of(l.blend||[]))checkWord(word[0]);
for(const variants of Object.values(data.variants))for(const variant of variants)checkWord(variant[1]);
const runtimeWords=vm.runInNewContext(fs.readFileSync('dist/word-audio-data.js','utf8')+';WORD_RECORDINGS');
assert.equal(JSON.stringify(runtimeWords),JSON.stringify(words),'player and source manifest must agree');
console.log('Passed: curriculum, dictionary source coverage, legacy records, resume positions, review routing and non-ambiguous questions.');
