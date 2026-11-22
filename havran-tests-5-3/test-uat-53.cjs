const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {boot} = require('./test-graphics-53.cjs');

const cases = [];
const casesInChapter = [
  ['briefing', 'Beze zbraně kromě nože, cíl a místnost odpovídají vybrané kapitole'],
  ['loot', 'První stráž padne po zásahu nožem a E sebere její pistoli'],
  ['denied', 'Terminál vyžaduje úplnou sadu důkazů'],
  ['evidence', 'Tři důkazy dosažitelné chůzí, E je vezme a I zobrazí jejich obsah'],
  ['gate', 'Terminál otevře bránu, průchod do arény ji zamkne'],
  ['boss', 'Boss vydrží první výměnu, pohybuje se a hráč jej může porazit'],
  ['exit', 'Fyzický přístup k východu uzavře misi a uloží další kapitolu'],
];

const playerActions = `
const STEP_UAT = 1 / 30;
function keyUat(name) {
 const event = {code: name, repeat: false, target: {tagName: 'CANVAS'}, preventDefault() {}};
 pressUat(event);
 releaseUat(event);
}
function walkingRouteUat(goal, min, endAllowance=0) {
 const cell = (x,y) => x + y * level[0].length;
 const q = [{x: Math.floor(p.x)+.5, y: Math.floor(p.y)+.5, parent:null}];
 const visited = new Set([cell(Math.floor(p.x),Math.floor(p.y))]);
 for (let i=0; i<q.length; i++) {
  const from=q[i];
  if(Math.hypot(from.x-goal.x,from.y-goal.y)<=min) {
   const dx=goal.x-from.x,dy=goal.y-from.y,d=Math.hypot(dx,dy);
   let visible=true;
   for(let s=.07;s<d-endAllowance;s+=.07)
    if(wall(from.x+dx*s/d,from.y+dy*s/d,.7)){visible=false;break}
   if(visible){
    const result=[];for(let v=from;v;v=v.parent)result.push(v);
    return result.reverse();
   }
  }
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=from.x+dx,y=from.y+dy,id=cell(Math.floor(x),Math.floor(y));
   if(x<0||y<0||x>=level[0].length||y>=level.length||visited.has(id))continue;
   if(solidCircle(x,y,.18)||solidCircle(from.x+dx*.5,from.y+dy*.5,.18))continue;
   visited.add(id);q.push({x,y,parent:from});
  }
 }
 return null;
}
function collectedApproachUat(goal,min,endAllowance=0){
 const route=walkingRouteUat(goal,min,endAllowance);
 assert(route,'no route to '+JSON.stringify(goal));
 for(const waypoint of route) {
  for(let step=0;step<190&&Math.hypot(p.x-waypoint.x,p.y-waypoint.y)>.071&&playing;step++){
   guardFireUat();
   p.a=Math.atan2(waypoint.y-p.y,waypoint.x-p.x);
   keys.KeyW=true;
   update(STEP_UAT);
   delete keys.KeyW;
  }
  assert(playing||mode==='cleared'||mode==='ending','player died walking to destination');
  if(!playing)return;
  assert(Math.hypot(p.x-waypoint.x,p.y-waypoint.y)<=.071,'walking obstructed at '+waypoint.x+','+waypoint.y);
 }
}
function guardFireUat(){
 const target=enemies.filter(e=>e.hp>0&&!e.boss&&(arenaLocked||e.y<stage.arenaY)&&los(e.x,e.y))
  .filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<8)
  .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
 if(target&&weapon!==6){
  p.a=Math.atan2(target.y-p.y,target.x-p.x);
  keyUat('ControlLeft');
 }
}
function earnEvidenceUat(){
 for(const target of stage.questItems){
  if(missionInventory.some(o=>o.id===target.id))continue;
  collectedApproachUat(target,1.11);
  // If a weapon dropped next to the evidence, E may pick it up first.
  for(let i=0;i<5&&!missionInventory.some(o=>o.id===target.id);i++) keyUat('KeyE');
  assert(missionInventory.some(o=>o.id===target.id),'E must pick up '+target.name);
 }
}
function engageBossUat(){
 const b=bossEnemy();
 let seenMovement=false,seenAttack=false,seenPhaseTwo=false;
 const spawn={x:b.x,y:b.y};
 for(let t=0;t<7200&&playing&&b.hp>0;t++){
  const nextAmmo=items.find(i=>!i.taken&&i.type==='ammo'&&i.y>stage.arenaY);
  const bossDistance=Math.hypot(b.x-p.x,b.y-p.y);
  seenMovement ||= Math.hypot(b.x-spawn.x,b.y-spawn.y)>.35;
  seenAttack ||= b.bossAI?.state==='telegraph';
  seenPhaseTwo ||= b.bossAI?.phase===2;
  const target=enemies.find(e=>e.summoned&&e.hp>0&&Math.hypot(p.x-e.x,p.y-e.y)<4&&los(e.x,e.y))||b;
  if(reloading<=0&&mags[weapon]===0&&rounds[weapon]===0){
   const other=[...missionEquipment].find(w=>w!==6&&(mags[w]>0||rounds[w]>0));
   if(other!==undefined)selectWeapon(other);
   else if(nextAmmo){
    collectedApproachUat(nextAmmo,.48);
    if(!nextAmmo.taken)update(STEP_UAT);
   }else selectWeapon(6);
  }
  if(hp<58){
   const med=items.find(i=>!i.taken&&i.type==='med'&&i.y>stage.arenaY);
   if(med&&Math.hypot(med.x-p.x,med.y-p.y)<9)collectedApproachUat(med,.48);
  }
  if(!playing)break;
  const bearing=Math.atan2(target.y-p.y,target.x-p.x);
  p.a=bearing;
  if(seenMovement&&seenAttack&&los(target.x,target.y)&&!target.shield)keyUat('ControlLeft');
  const situ=b.bossAI;
  const danger=situ?.state==='telegraph'||situ?.state==='attack';
  const preferred=weapon===6?.76:3.2;
  if(danger&&!(weapon===6&&situ.attack!=='charge')){
   const side=(Math.floor(t/97)&1)?'KeyA':'KeyD';
   const alternate=side==='KeyA'?'KeyD':'KeyA';
   const dir=side==='KeyD'?1:-1;
   keys[solidCircle(p.x-Math.sin(p.a)*dir*.24,p.y+Math.cos(p.a)*dir*.24,.18)?alternate:side]=true;
  }else if(bossDistance>preferred+.65||!los(b.x,b.y)){
   const approach={x:b.x-Math.cos(bearing)*preferred,y:b.y-Math.sin(bearing)*preferred};
   const route=walkingRouteUat(b,preferred+.9);
   const waypoint=route?.[route.length>1?1:0]??approach;
   if(Math.hypot(waypoint.x-p.x,waypoint.y-p.y)>.12){
    p.a=Math.atan2(waypoint.y-p.y,waypoint.x-p.x);
    keys.KeyW=true;
   } else if(bossDistance>preferred+.5&&los(b.x,b.y)) keys.KeyW=true;
  }else if(bossDistance<preferred-.68&&weapon!==6&&!solidCircle(p.x-Math.cos(p.a)*.3,p.y-Math.sin(p.a)*.3,.18))keys.KeyS=true;
  else if(weapon===6&&bossDistance>1.04)keys.KeyW=true;
  update(STEP_UAT);
  for(const k of ['KeyW','KeyS','KeyA','KeyD'])delete keys[k];
 }
 assert(playing,'player defeated by boss: '+chapter.boss+' health='+b.hp.toFixed(1)+' ammo='+mags[weapon]+'/'+rounds[weapon]);
 assert.equal(b.hp,0,'boss survived: '+chapter.boss+' health='+b.hp.toFixed(1));
 assert(seenMovement&&seenAttack&&seenPhaseTwo,'the encounter shows movement, warning and phase two');
}
`;

const actions = {
  briefing: `loadStage(uatChapter);assert.equal(weapon,6);assert.equal(missionEquipment.size,1);
    assert(document.querySelector('#eyebrow').textContent.includes(chapter.place.toUpperCase()));
    assert(document.querySelector('#mission').textContent.includes(chapter.boss));
    assert.equal(navigationOn,false);assert(!stage.outdoor);
    document.querySelector('#start').onclick();`,
  loot: `assert(playing,'start button enters gameplay');const original=enemies[0];
    keyUat('ControlLeft');assert.equal(original.hp,0,'knife hits first guard from spawn');
    keyUat('KeyE');assert.equal(weapon,0,'guard drops MK-9');assert(missionEquipment.has(0));`,
  denied: `collectedApproachUat(stage.terminal,1.15,.35);keyUat('KeyE');assert(!objectiveDone);
    assert(!bossEnemy()&&wall(stage.gate.x,stage.gate.y));`,
  evidence: `earnEvidenceUat();assert.equal(missionInventory.length,3);keyUat('KeyI');assert.equal(overlay,'inventory');
    const entry=document.querySelector('#overlayBody').innerHTML;
    for(const q of stage.questItems)assert(entry.includes(q.name)&&entry.includes(q.text));
    keyUat('KeyE');assert(playing&&!overlay);keyUat('KeyN');assert(navigationOn);keyUat('KeyN');assert(!navigationOn);`,
  gate: `collectedApproachUat(stage.terminal,1.15,.35);for(let i=0;i<5&&!objectiveDone;i++)keyUat('KeyE');assert(objectiveDone&&bossEnemy());assert(!wall(stage.gate.x,stage.gate.y));
    collectedApproachUat({x:stage.gate.x,y:stage.arenaY+1.5},.04);assert(arenaLocked);
    assert(wall(stage.gate.x,stage.gate.y));`,
  boss: `engageBossUat();assert.equal(bossEnemy().hp,0);assert(!won,'exit must still be reached');`,
  exit: `collectedApproachUat(stage.exit,1.01,.35);
    for(let step=0;step<12&&playing;step++){p.a=Math.atan2(stage.exit.y-p.y,stage.exit.x-p.x);keys.KeyW=true;update(STEP_UAT);delete keys.KeyW;}
    assert(won);assert(!playing);
    assert.equal(progress.current,Math.min(14,uatChapter+1));
    assert.equal(progress.complete,uatChapter===14);
    assert.equal(mode,uatChapter===14?'ending':'cleared');
    assert.equal(JSON.parse(localStorage.getItem(SAVE_KEY)).unlocked,progress.unlocked);`,
};

// One scene is played from its actual briefing through its exit. Cases is a
// manifest of player outcomes, not a count of internal asserts or render frames.
async function run(){
 for(const edition of ['iron-sector','havran-apple-silicon']){
  for(let chapter=0;chapter<15;chapter++){
   const {c,events}=boot(edition);
   c.uatChapter=chapter;
   c.pressUat=events.keydown;
   c.releaseUat=events.keyup;
   c.startMusic=()=>{};
   vm.runInContext(playerActions,c);
   let blocked=false;
   for(const [key,expected] of casesInChapter){
    const entry={edition,chapter:chapter+1,key,expected};
    try{
     if(blocked)entry.status='blocked';
     else{await vm.runInContext(actions[key],c);entry.status='passed';}
    }catch(e){entry.status='failed';entry.message=e.message;blocked=true;}
    cases.push(entry);
   }
  }
 }
 const failed=cases.filter(c=>c.status==='failed');
 const passed=cases.filter(c=>c.status==='passed').length;
 const blocked=cases.length-passed-failed.length;
 fs.writeFileSync(path.join(__dirname,'UAT-5-3.json'),JSON.stringify({passed,failed:failed.length,blocked,cases},null,2)+'\n');
 for(const c of failed)console.error(c.edition,c.chapter,c.key,c.message);
 console.log('UAT:',passed,'passed,',failed.length,'failed,',blocked,'blocked');
 assert.equal(passed,cases.length);
}
run().catch(error=>{console.error(error.message);process.exitCode=1;});
