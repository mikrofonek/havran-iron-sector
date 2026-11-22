const fs=require('fs'),vm=require('vm'),assert=require('assert');
const{boot,gameRoot}=require('./test-graphics-53.cjs');
for(const folder of['iron-sector','havran-apple-silicon']){
 const{c}=boot(folder);
 if(folder==='havran-apple-silicon')vm.runInContext(fs.readFileSync(gameRoot+folder+'/gpu-instancing.js','utf8'),c);
 vm.runInContext(fs.readFileSync(gameRoot+folder+'/renderer.js','utf8'),c);
 vm.runInContext(`
 loadStage(0);playing=true;p={x:8.25,y:4.75,z:.3,a:.4};time=10;
 // Launch's physical state and gameplay timers remain exactly the v5.1 equations.
 for(const boss of[false,true])for(const angle of[0,.7,-2])for(const speed of[3.1,3.8,5.5,7.5]){
  const e=enemy(3.25,2.75,2,boss);e.weaponType=0;const power=boss?12:3.5,spread=.09,a=angle+spread,initialTimer=e.t;projectiles=[];
  launch(e,angle,speed,power,spread);assert.equal(projectiles.length,1);const q=projectiles[0];
  const expected={x:e.x+Math.cos(a)*.4,y:e.y+Math.sin(a)*.4,z:boss?.66:.55,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,vz:(.7+p.z-(boss?.66:.55))/Math.max(.3,Math.hypot(e.x-p.x,e.y-p.y)/speed),t:6,power,boss};
  for(const field of Object.keys(expected))assert.equal(q[field],expected[field],'physical launch '+field);assert.equal(e.attack,.16);assert.equal(e.t,initialTimer);assert.equal(e.visualMuzzleUntil,10+.035);
 }
 // Only every sixth ordinary shot gets a tracer; all boss shots retain a small cue.
 for(let id=0;id<6;id++){
  const e=enemy(3.5,3.5,id);e.boss=false;projectiles=[];for(let n=0;n<12;n++)launch(e,0,3.8,7);
  assert.equal(projectiles.filter(q=>q.visualTracer).length,2,'ordinary visual mask is 1/6');
 }
 const boss=enemy(3.5,3.5,0,true);projectiles=[];for(let n=0;n<5;n++)launch(boss,.2,3.8,7);assert(projectiles.every(q=>q.visualTracer));
 // Tracer geometry is thin, short, neutral, non-emissive and never mutates simulation.
 for(const boss of[false,true]){
  const q={x:5,y:4,z:.6,vx:2.6,vy:1.2,vz:.15,t:4,power:7,boss,visualTracer:true},physical=JSON.stringify(q),length=boss?.070:.045,radius=boss?.0022:.0015;
  surfaceMaterial=4;vertexData=[];assert(drawEnemyProjectile(q));assert.equal(surfaceMaterial,4);assert.equal(JSON.stringify(q),physical);assert(vertexData.length>0&&vertexData.every(Number.isFinite));
  const speed=Math.hypot(q.vx,q.vy,q.vz),axis=[q.vx/speed,q.vz/speed,q.vy/speed],head=[q.x,q.z,q.y];let maxSide=0,minAlong=Infinity,maxAlong=-Infinity;
  for(let i=0;i<vertexData.length;i+=10){const delta=[vertexData[i]-head[0],vertexData[i+1]-head[1],vertexData[i+2]-head[2]],along=delta.reduce((sum,n,k)=>sum+n*axis[k],0),side=Math.hypot(...delta.map((n,k)=>n-along*axis[k]));maxSide=Math.max(maxSide,side);minAlong=Math.min(minAlong,along);maxAlong=Math.max(maxAlong,along);assert.equal(vertexData[i+9],0,'no emission/bloom flag');assert(Math.max(vertexData[i+6],vertexData[i+7],vertexData[i+8])<=.32,'muted color');}
  assert(maxSide<=radius+1e-8);assert(maxSide<.025*.1,'radius under one tenth old projectile sphere');assert(minAlong>=-length-1e-8&&maxAlong<=1e-8);assert(length<=.070);
 }
 // Invisible, expired or malformed shots do not emit any geometry.
 for(const q of[{x:1,y:2,z:.5,vx:3,vy:0,vz:0,t:5,boss:false,visualTracer:false},{x:1,y:2,z:.5,vx:3,vy:0,vz:0,t:0,boss:true,visualTracer:true},{x:1,y:2,z:.5,vx:0,vy:0,vz:0,t:5,boss:true,visualTracer:true},{x:NaN,y:2,z:.5,vx:3,vy:0,vz:0,t:5,boss:true,visualTracer:true},{x:1,y:2,z:.5,vx:3,vy:0,vz:0,t:5,boss:false}]){vertexData=[];assert(!drawEnemyProjectile(q));assert.equal(vertexData.length,0);}
 surfaceMaterial=0;
 // A real last-magazine shot still gives an immediate small flash; after 35 ms
 // the flash ends while the original 160 ms firing/reload pose window is retained.
 loadStage(0);playing=true;stage.obstacles=[];objectiveDone=true;arenaLocked=false;
 level=['111111111','100000001','100000001','100000001','100000001','100000001','111111111'];p={x:5.5,y:3.5,z:0,a:0};time=20;
 const guard=enemy(3,3.5,0);guard.role=0;guard.weaponType=0;enemies=[guard];const brain=aiBrain(guard);brain.visible=true;brain.reaction=0;brain.lastKnown={x:p.x,y:p.y};brain.memory=7;brain.think=1;brain.tacticTimer=99;brain.pathTimer=1;brain.aiming=true;brain.aimWindup=0;guard.magazine=1;guard.t=0;
 updateSmartEnemy(guard,.01);guard.moveSpeed=0;assert.equal(projectiles.length,1);assert(guard.attack>0&&guard.reloading>0);assert(enemyMuzzleVisible(guard));
 let flashes=[];const originalSphere=sphere;sphere=(...args)=>flashes.push(args);function model(){vertexData=[];flashes=[];detailedEnemyModel(guard);assert(vertexData.every(Number.isFinite));return Float32Array.from(vertexData)}
 characterDetailTemplates.clear();const firing=model();assert.equal(flashes.length,1);assert(flashes[0][3]<=.010&&flashes[0][4]<=.008&&flashes[0][5]<=.022,'muzzle substantially smaller');assert(flashes[0].at(-1)<=.16,'no large emissive flare');
 time+=.04;assert.equal(guard.attack,.16,'visual clock does not mutate attack timer');assert(!enemyMuzzleVisible(guard));const firingWithoutFlash=model();assert.equal(flashes.length,0);assert.deepEqual(firingWithoutFlash,firing,'flash expiry preserves firing geometry/cache');
 guard.attack=0;time+=.12;const lowered=model();assert.equal(flashes.length,0);const scale=.96*.8;let loweredCount=0;for(let i=0;i<firing.length;i+=10)if(Math.abs(firing[i+1]-lowered[i+1]-.10*scale)<1e-6)loweredCount++;assert(loweredCount>100,'last-mag reload still lowers weapon after firing pose');
 sphere=originalSphere;
 `,c);
 console.log('PASS '+folder+': unchanged projectile physics/AI timer, 1-in-6 muted non-emissive thin tracers, all boss cues, visibility masks, 35 ms small last-round flash, unchanged reload pose');
}
