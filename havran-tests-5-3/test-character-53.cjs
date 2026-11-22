'use strict';
const fs=require('node:fs'),vm=require('node:vm');
const {boot,gameRoot}=require('./test-graphics-53.cjs');
for(const folder of ['iron-sector','havran-apple-silicon']){
 const {c}=boot(folder);
 if(folder==='havran-apple-silicon')vm.runInContext(fs.readFileSync(gameRoot+folder+'/gpu-instancing.js','utf8'),c);
 vm.runInContext(fs.readFileSync(gameRoot+folder+'/renderer.js','utf8'),c);
 vm.runInContext(`
  loadStage(0);playing=true;time=.22;p={x:10,y:4,z:0};
  const testKinds=['gunner','charger','warden','sniper','summoner','overseer'];
  function draw(e){vertexData=[];detailedEnemyModel(e);return new Float32Array(vertexData);}
  function dimensions(mesh){const lower=[Infinity,Infinity,Infinity],upper=[-Infinity,-Infinity,-Infinity];for(let i=0;i<mesh.length;i+=10){assert(Math.abs(Math.hypot(mesh[i+3],mesh[i+4],mesh[i+5])-1)<.002,'valid normal');for(let j=0;j<3;j++){lower[j]=Math.min(lower[j],mesh[i+j]);upper[j]=Math.max(upper[j],mesh[i+j]);}}return {lower,upper};}
  function signature(mesh){const occupied=new Set();for(let i=0;i<mesh.length;i+=10){if(mesh[i+1]>.70)occupied.add(Math.round(mesh[i]/.02)+','+Math.round(mesh[i+1]/.02)+','+Math.round(mesh[i+2]/.02));}return JSON.stringify([...occupied].sort());}
  function glowing(mesh){return mesh.filter((_,i)=>i%10===9&&mesh[i]>.1);}
  const guards=new Set();let guardMax=0,bossMax=0;
  for(const role of [0,1,2,3]){
   const e={...enemy(0,0,role),role,facing:Math.PI/2,weaponType:3,moveSpeed:0};
   const before=JSON.stringify(e),mesh=draw(e),size=dimensions(mesh);guards.add(signature(mesh));guardMax=Math.max(guardMax,mesh.length/10);
   assert.equal(JSON.stringify(e),before,'draw is visual-only');assert(mesh.every(Number.isFinite));assert(size.lower[1]>=0&&size.lower[1]<.009&&size.upper[1]<1.03);
  }
  assert.equal(guards.size,4,'each guard has a distinct top silhouette');assert(guardMax<6000,'guard mesh budget');
  const ordinary=new Set(),windups=new Set();
  for(const kind of testKinds){
   const e={...enemy(0,0,0,true),kind,facing:Math.PI/2,weaponType:3,moveSpeed:0,bossAI:{state:'stalk',phase:1,attack:bossDetailProfiles[kind].attack,timer:1,duration:1}};
   const idle=draw(e),size=dimensions(idle);ordinary.add(signature(idle));assert.equal(glowing(idle).length,0,'idle does not signal an attack');
   assert(size.lower[1]>=0&&size.lower[1]<.009&&size.upper[1]<1.05&&size.lower[0]>-.255&&size.upper[0]<.255,'boss stands within physical scale');
   e.bossAI.state='telegraph';e.shield=kind==='warden';const early=draw(e),keySize=characterDetailTemplates.size;const before=JSON.stringify(e);
   assert.notDeepEqual(early, idle);assert(glowing(early).length>=108,'visible preparation tell');windups.add(signature(early));
   assert.equal(JSON.stringify(e),before,'not mutating the boss state');assert(early.every(Number.isFinite));dimensions(early);
   for(let i=1;i<15;i++){e.bossAI.timer=i/15;draw(e);}assert.equal(characterDetailTemplates.size,keySize,'windup timer reuses full pose');
   e.bossAI.timer=.1;const late=draw(e);assert(Math.max(...glowing(late))>Math.max(...glowing(early)),'tell brightens at the end');
   e.bossAI.phase=2;const second=draw(e);assert.equal(characterDetailTemplates.size,keySize,'phase change reuses full pose');assert.equal(second.length,late.length+360,'second phase adds a visible panel');
   e.bossAI.state='recover';const recover=draw(e);assert(Math.max(...glowing(recover))<.30,'clear dimmer opening indicator even with stale shield flag');assert(dimensions(recover).upper[1]<size.upper[1]-.035,'recover hunches');
   for(const mesh of [idle,early,late,second,recover])bossMax=Math.max(bossMax,mesh.length/10);
   e.bossAI.state='stalk';e.bossAI.phase=1;e.shield=false;
   e.facing=0;const turned=draw(e);for(let i=0;i<idle.length;i+=10){assert(Math.abs(idle[i+2]-turned[i])<1e-6&&Math.abs(idle[i]+turned[i+2])<1e-6,'e.facing rotates the mesh');}
   assert.notDeepEqual(draw({...e,moveSpeed:.75}),turned,'actual speed animates the legs');
   time+=.04;assert.deepEqual(draw(e),turned,'zero speed prevents artificial walking');
  }
  assert.equal(ordinary.size,6,'unique boss equipment geometry');assert.equal(windups.size,6,'unique boss combinations in windup');assert(bossMax<7200,'boss mesh and cues budget');
  const boss={...enemy(0,0,0,true),kind:'overseer',facing:Math.PI/2,weaponType:3,moveSpeed:0,bossAI:{state:'telegraph',phase:2,attack:'volley',timer:.5,duration:1}};
  const motionShapes=new Set();for(const attack of Object.keys(bossDetailTells)){boss.bossAI.attack=attack;motionShapes.add(signature(draw(boss)));}assert.equal(motionShapes.size,5,'all attack animations read differently even on the same boss');
  for(let n=0;n<125;n++){boss.id=n;boss.moveSpeed=.9;time=n*.19;boss.hit=n%2;boss.attack=n%3===1?.16:0;boss.bossAI.state=['stalk','attack','recover','telegraph','reposition'][n%5];boss.bossAI.attack=Object.keys(bossDetailTells)[n%5];assert(draw(boss).every(Number.isFinite));}
  assert(characterDetailTemplates.size<=96);console.log('PASS ${folder}: four guard and six boss silhouettes, all five attack tells, recovery, phase 2, actual yaw/velocity, simulation untouched; max '+guardMax+'/'+bossMax+' guard/boss vertices, 96 cached poses');
 `,c);
}
