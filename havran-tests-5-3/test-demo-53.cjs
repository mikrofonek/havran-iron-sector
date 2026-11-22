const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {boot,gameRoot}=require('./test-graphics-53.cjs');
const folder='havran-5-3-demo';
const save={
 unlocked:14,current:14,complete:true,gold:999,owned:Array(19).fill(true),claimed:[],achievements:[]
};
const saveText=JSON.stringify(save);
const key='iron-sector-campaign-v5';
const {c,store}=boot(folder,'?trenink=arena&boss=14',{demo:true,saved:[[key,saveText]]});
c.startMusic=()=>{};
vm.runInContext(`
assert(demoBuild&&noSaveMode&&!arenaPractice);
assert.equal(CHAPTERS.length,1);
assert.equal(EVIDENCE.length,1);
assert.equal(EVIDENCE_TEXT.length,1);
assert.equal(progress.current,0);
assert.equal(progress.gold,0);
loadStage(14);
assert.equal(chapterIndex,0);
assert.equal(weapon,6);
assert.equal(stage.questItems.length,3);
assert(document.querySelector('#chapters').disabled);
assert.throws(()=>importProgressText(exportProgressText()),/hlavní kampani/);
playing=true;claimGold('demo-cannot-inflate',15);assert.equal(progress.gold,0);
for(const q of stage.questItems){p.x=q.x;p.y=q.y;assert(collectNearby());}
p.x=stage.terminal.x;p.y=stage.terminal.y;interact();
assert(bossEnemy()&&objectiveDone);
bossEnemy().hp=0;
p.x=stage.exit.x;p.y=stage.exit.y;update(.025);
assert.equal(mode,'cleared');
assert.equal(document.querySelector('#menuTitle').textContent,'DEMO DOKONČENO');
assert.equal(progress.unlocked,0);
`,c);
(async()=>{
 await vm.runInContext('start()',c);
 vm.runInContext("assert(playing&&!won&&chapterIndex===0&&!objectiveDone&&weapon===6)",c);
 assert.deepEqual([...store],[[key,saveText]]);
 const tracks=fs.readdirSync(path.join(gameRoot,folder,'music')).filter(f=>f.endsWith('.mp3'));
 assert.deepEqual(tracks,['01.mp3']);
 const html=fs.readFileSync(path.join(gameRoot,folder,'index.html'),'utf8');
 assert(!html.includes('trenink=')&&!/src="outdoor\.js/.test(html));
 console.log('PASS actual standalone demo: one playable mission, one soundtrack, no other mission access, no campaign writes, exit and replay');
})().catch(error=>{console.error(error);process.exitCode=1;});
