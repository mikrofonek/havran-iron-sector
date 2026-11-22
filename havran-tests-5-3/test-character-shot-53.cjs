const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {boot,gameRoot}=require('./test-graphics-53.cjs');
for(const folder of['iron-sector','havran-apple-silicon']){
 const {c}=boot(folder);
 if(folder==='havran-apple-silicon')vm.runInContext(fs.readFileSync(gameRoot+folder+'/gpu-instancing.js','utf8'),c);
 vm.runInContext(fs.readFileSync(gameRoot+folder+'/renderer.js','utf8'),c);
 vm.runInContext(`
 loadStage(0);playing=true;stage.obstacles=[];objectiveDone=true;arenaLocked=false;
 level=['111111111','100000001','100000001','100000001','100000001','100000001','111111111'];
 p={x:5.5,y:3.5,z:0,a:0};const guard=enemy(3,3.5,0);guard.role=0;guard.weaponType=0;enemies=[guard];
 const brain=aiBrain(guard);brain.visible=true;brain.reaction=0;brain.lastKnown={x:p.x,y:p.y};brain.memory=7;brain.think=1;brain.tacticTimer=99;brain.pathTimer=1;brain.aiming=true;brain.aimWindup=0;
 guard.magazine=1;guard.t=0;updateSmartEnemy(guard,.01);
 assert.equal(projectiles.length,1,'last round really launched');assert.equal(guard.magazine,0);assert(guard.attack>0&&guard.reloading>0,'reload started while shot animation is active');
 // Capture only the dynamic muzzle flash; cached body geometry must contain no baked flash.
 let flashCalls=[];const savedSphere=sphere;sphere=(...args)=>flashCalls.push(args);
 function renderCharacter(){vertexData=[];flashCalls=[];detailedEnemyModel(guard);assert(vertexData.every(Number.isFinite));return Float32Array.from(vertexData)}
 characterDetailTemplates.clear();const lastRoundPose=renderCharacter();assert.equal(flashCalls.length,1,'last round muzzle flash visible');assert.equal(flashCalls[0].at(-1),.12,'restrained brief muzzle flash');
 const activeReload=guard.reloading;guard.reloading=0;const ordinaryShotPose=renderCharacter();
 assert.deepEqual(lastRoundPose,ordinaryShotPose,'last-round pose remains firing pose until attack expires');assert.equal(characterDetailTemplates.size,1,'same effective pose uses same cache entry');
 guard.reloading=activeReload;guard.attack=0;const loweredPose=renderCharacter();assert.equal(flashCalls.length,0,'no flash after firing window');assert.equal(characterDetailTemplates.size,2,'reload uses a separate cache entry');
 const scale=.96*.8;let moved=0;
 for(let i=0;i<lastRoundPose.length;i+=10){if(Math.abs(lastRoundPose[i+1]-loweredPose[i+1]-.10*scale)<1e-6)moved++;}
 assert(moved>100,'weapon and grip geometry lower by .10 local units for reload');
 // Repeated reload draws use the lowered cached pose without reintroducing a flash.
 const repeated=renderCharacter();assert.deepEqual(repeated,loweredPose);assert.equal(flashCalls.length,0);
 // Recoil keeps the actual barrel, upper sight, scope and flash attached to the receiver.
 function colored(mesh,col){const values=[];for(let i=0;i<mesh.length;i+=10)if(col.every((v,k)=>Math.abs(mesh[i+6+k]-v)<1e-5))values.push([mesh[i],mesh[i+1],mesh[i+2]]);return values}
 guard.reloading=0;guard.moveSpeed=0;const front=[Math.cos(Math.atan2(p.y-guard.y,p.x-guard.x)),Math.sin(Math.atan2(p.y-guard.y,p.x-guard.x))];
 for(const type of[0,3]){guard.weaponType=type;guard.attack=0;const idleMesh=renderCharacter();guard.attack=.16;const kickMesh=renderCharacter();assert.equal(flashCalls.length,1);for(const col of[[.34,.38,.38],[.055,.065,.065],...(type===3?[[.07,.09,.09]]:[])]){const idle=colored(idleMesh,col),kick=colored(kickMesh,col);assert(idle.length>0&&idle.length===kick.length);for(let i=0;i<idle.length;i++){assert(Math.abs(kick[i][0]-idle[i][0]+front[0]*.018*scale)<1e-6,'barrel/sight/scope follows recoil X');assert(Math.abs(kick[i][1]-idle[i][1])<1e-6);assert(Math.abs(kick[i][2]-idle[i][2]+front[1]*.018*scale)<1e-6,'barrel/sight/scope follows recoil Z');}}
 const a=enemyRenderAngle(guard),muzzle=(type===0?.394:.577)-.018;assert(Math.abs(flashCalls[0][0]-(guard.x+(.065*Math.cos(a)-muzzle*Math.sin(a))*scale))<1e-6);assert(Math.abs(flashCalls[0][2]-(guard.y+(.065*Math.sin(a)+muzzle*Math.cos(a))*scale))<1e-6);}
 sphere=savedSphere;
 `,c);
 console.log('PASS '+folder+': actual last-mag launch keeps flash + firing pose, then lowers weapon after attack expires; cached recoil keeps pistol/rifle barrel, sight, scope and flash attached');
}
