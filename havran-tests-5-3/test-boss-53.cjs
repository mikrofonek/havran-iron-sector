const assert=require('node:assert/strict');
const vm=require('node:vm');
const {boot}=require('./test-graphics-53.cjs');
for(const folder of ['iron-sector','havran-apple-silicon']){
 const {c}=boot(folder);
 vm.runInContext(`
 const attacks=new Map();
 for(let i=0;i<15;i++){
  loadStage(i);
  playing=true;
  for(const evidence of stage.questItems){
   p.x=evidence.x;p.y=evidence.y;
   assert(collectNearby(),'collect evidence in chapter '+(i+1));
  }
  p.x=stage.terminal.x;p.y=stage.terminal.y;
  interact();
  const boss=bossEnemy();
  assert(boss&&objectiveDone&&!arenaLocked);
  enemies=[boss];
  const spawn={x:boss.x,y:boss.y};
  for(let t=0;t<80;t++)updateEnemy(boss,.025);
  assert.equal(boss.bossAI.state,'waiting');
  assert.equal(boss.x,spawn.x);
  assert.equal(boss.y,spawn.y);
  assert.equal(projectiles.length,0);

  // Take the same path into the encounter as update() in a live campaign.
  p.x=stage.gate.x;p.y=stage.arenaY+1.1;
  update(.025);
  assert(arenaLocked,'entering closes the gate in chapter '+(i+1));
  const states=new Set(),patterns=new Set();
  let moved=0,seenAttack=false,fixedAimChangedPlayer=false;
  for(let t=0;t<840;t++){
   const x=boss.x,y=boss.y;
   updateEnemy(boss,.025);
   const b=boss.bossAI;
   assert(!solidCircle(boss.x,boss.y,bodyRadius(boss)),'boss collision chapter '+(i+1));
   assert(boss.y>=stage.arenaY+.42,'boss contained in chapter '+(i+1));
   moved+=Math.hypot(boss.x-x,boss.y-y);
   states.add(b.state);
   if(b.attack)patterns.add(b.attack);
   if(!seenAttack&&b.state==='telegraph'){
    if(!fixedAimChangedPlayer){
     assert.equal(projectiles.length,0,'attacks have a tell');
     const side=[1,-1,2,-2].find(dx=>!solidCircle(p.x+dx,p.y,.18));
     if(side!==undefined){
      const angle=b.aim; p.x+=side;
      updateEnemy(boss,.025);
      assert.equal(b.aim,angle,'aim remains committed during tell');fixedAimChangedPlayer=true;
     }
    }
   }
   if(b.state==='attack')seenAttack=true;
   if(b.state==='recover'){
    assert.equal(boss.shield,false);
    if(b.phase===1){boss.hp=boss.maxHp*.47;}
   }
   assert(!boss.shield||(b.state==='telegraph'&&b.attack==='shield-burst'));
   assert(enemies.filter(f=>f.summoned&&f.hp>0).length<=2&&b.summons<=5);
   projectiles.length=0;
  }
  assert(moved>1.1,'boss must move in chapter '+(i+1));
  for(const state of ['stalk','telegraph','attack','recover','reposition'])assert(states.has(state),'chapter '+(i+1)+' lacks '+state);
  assert.equal(boss.bossAI.phase,2,'phase transition chapter '+(i+1));
  attacks.set(boss.kind,[...(attacks.get(boss.kind)||[]),...patterns]);
 }
 for(const [kind,pattern] of Object.entries({gunner:'volley',charger:'charge',warden:'shield-burst',summoner:'reinforce',sniper:'precision',overseer:'precision'})){
  assert(attacks.get(kind).includes(pattern),kind+' uses '+pattern);
 }
 assert(new Set(attacks.get('overseer')).size>=3,'final boss varies attacks');
 `,c);
 const training=boot(folder,'?trenink=arena&boss=14');
 vm.runInContext(`
 loadStage(previewChapter);
 assert.equal(chapterIndex,14);
 assert(arenaPractice&&arenaLocked&&objectiveDone);
 assert.equal(enemies.length,1);
 assert.equal(missingQuestItems().length,0);
 assert(missionEquipment.has(0)&&missionEquipment.has(3)&&missionEquipment.has(6));
 assert(!navigationOn);
 assert.throws(()=>importProgressText(exportProgressText()),/hlavní kampani/);
 const before=exportProgressText();playing=true;bossEnemy().hp=0;finish(true);
 assert.equal(mode,'cleared');
 assert.equal(document.querySelector('#menuTitle').textContent,'TRÉNINK DOKONČEN');
 assert.equal(JSON.parse(exportProgressText()).progress.gold,JSON.parse(before).progress.gold);
 `,training.c);
 assert.equal(training.store.size,0,'arena does not change campaign save');
 console.log('PASS '+folder+': boss route, collision, look & attack tell, recovery, phase II, variant patterns, arena confinement and no-save training across campaign');
}
