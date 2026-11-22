const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {boot,gameRoot}=require('./test-graphics-53.cjs');

// The grid metric checks player-sized clearance along edges and actual E/terminal ranges.
// It deliberately does not bake in old room counts or boss/exit coordinates.
const mapChecks=`
function releaseLineClear(x,y,q,end=0){const d=Math.hypot(q.x-x,q.y-y),n=Math.max(1,Math.ceil(d*15));for(let i=1;i<n&&d*i/n<d-end;i++)if(wall(x+(q.x-x)*i/n,y+(q.y-y)*i/n,.7))return false;return true}
function releaseEdgeClear(a,b){const d=Math.hypot(a.x-b.x,a.y-b.y),n=Math.max(1,Math.ceil(d/.10));for(let i=1;i<=n;i++)if(solidCircle(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,.17))return false;return true}
function releaseReach(start){const sx=Math.floor(start.x),sy=Math.floor(start.y),q=[[sx,sy]],seen=new Map([[sx+','+sy,0]]);assert(!solidCircle(sx+.5,sy+.5,.17),'start clear');for(let k=0;k<q.length;k++){const[x,y]=q[k],a={x:x+.5,y:y+.5};for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,key=xx+','+yy,b={x:xx+.5,y:yy+.5};if(level[yy]?.[xx]==='0'&&!seen.has(key)&&releaseEdgeClear(a,b)){seen.set(key,seen.get(x+','+y)+1);q.push([xx,yy]);}}}return seen}
function releaseApproach(seen,item,radius,end=0){return [...seen].filter(([key])=>{const[x,y]=key.split(',').map(Number);return Math.hypot(x+.5-item.x,y+.5-item.y)<radius&&releaseLineClear(x+.5,y+.5,item,end)}).sort((a,b)=>a[1]-b[1])[0]}
function releaseMapMetric(){
 const width=level[0].length,height=level.length;assert(width>=15&&width<=40&&height>=15&&height<=40,'bounded map size');assert(level.every(row=>row.length===width&&/^[01]+$/.test(row)),'rectangular binary map');
 assert([...level[0],...level.at(-1)].every(c=>c==='1')&&level.every(row=>row[0]==='1'&&row.at(-1)==='1'),'closed outer walls');
 assert.equal(stage.questItems.length,3);assert.equal(weapon,6);assert.equal(missionEquipment.size,1);assert(mags.every(n=>n===0),'knife-only start');
 const seen=releaseReach(stage.start),distances=stage.questItems.map(item=>{const approach=releaseApproach(seen,item,1.35);assert(approach,'reachable evidence '+item.name);return approach[1]});
 assert(releaseApproach(seen,stage.terminal,1.251,.35),'terminal reachable before locked gate');
 const evidenceCount=stage.questItems.length;playing=true;p.x=stage.terminal.x;p.y=stage.terminal.y;interact();assert(!objectiveDone,'terminal still requires evidence');
 for(let i=0;i<evidenceCount;i++){const item=stage.questItems[i];assert.equal(currentTarget().id,item.id,'ordered evidence target');const approach=releaseApproach(seen,item,1.35);const[x,y]=approach[0].split(',').map(Number);p.x=x+.5;p.y=y+.5;assert(collectNearby(),'actual E-range item pickup');assert(missionInventory.some(q=>q.id===item.id),'correct item collected');}
 assert.equal(missingQuestItems().length,0);const consoleApproach=releaseApproach(seen,stage.terminal,1.251,.35);const[tx,ty]=consoleApproach[0].split(',').map(Number);p.x=tx+.5;p.y=ty+.5;interact();assert(objectiveDone&&bossEnemy(),'terminal spawns boss');
 assert.equal(bossEnemy().x,stage.bossSpawn.x);assert.equal(bossEnemy().y,stage.bossSpawn.y);bossEnemy().hp=0;arenaLocked=false;enemies=[];
 const open=releaseReach(stage.start),exitApproach=releaseApproach(open,stage.exit,1.01,.40);assert(exitApproach,'exit approach connected');const[ex,ey]=exitApproach[0].split(',').map(Number);p.x=ex+.5;p.y=ey+.5;move(p,(stage.exit.x-p.x)*.40,(stage.exit.y-p.y)*.40);assert(Math.hypot(p.x-stage.exit.x,p.y-stage.exit.y)<.80,'exit trigger physically approachable');
 const lights=roomLighting52();assert.equal(lights.length,8);assert(lights.flat().every(Number.isFinite),'finite room lighting positions');
 const openCells=level.reduce((sum,row)=>sum+[...row].filter(c=>c==='0').length,0);return{width,height,openCells,evidenceDistances:distances};
}
`;

for(const folder of ['iron-sector','havran-apple-silicon']){
 const {c,events}=boot(folder);
 vm.runInContext('assert.equal(navigationOn,false,"navigation OFF on fresh launch");loadStage(0);playing=true;',c);
 const key=(repeat=false)=>events.keydown({code:'KeyN',repeat,target:{tagName:'DIV'},preventDefault(){}});
 key();vm.runInContext('assert(navigationOn,"N enables route")',c);
 key(true);vm.runInContext('assert(navigationOn,"held N does not flicker")',c);
 key();vm.runInContext('assert(!navigationOn,"N disables route")',c);
 key();vm.runInContext('assert(navigationOn);loadStage(0);assert(!navigationOn,"new mission resets navigation OFF");playing=true;',c);
 vm.runInContext(mapChecks,c);
 const maps=[],signatures=new Set();
 for(let i=0;i<15;i++){
  maps.push(vm.runInContext(`loadStage(${i});releaseMapMetric()`,c));
  const encoded=vm.runInContext('JSON.stringify(stage.map)',c);
  assert.equal(encoded,vm.runInContext(`JSON.stringify(makeStage(${i}).map)`,c),'deterministic mission '+i);
  signatures.add(encoded);
 }
 assert.equal(signatures.size,15,'all 15 missions keep distinct layouts');
 vm.runInContext('loadStage(0);playing=true;let releaseGuard=enemies[0];p.x=releaseGuard.x-.6;p.y=releaseGuard.y;p.a=0;shot=0;switchTime=0;fire();assert(releaseGuard.hp<=0,"first guard knife-killable");assert(items.some(q=>q.type==="weapon"&&!q.taken));',c);

 // Capture calls from the real render3D function while skipping GPU setup and unrelated meshes.
 if(folder==='havran-apple-silicon')vm.runInContext(fs.readFileSync(gameRoot+folder+'/gpu-instancing.js','utf8'),c);
 vm.runInContext(fs.readFileSync(gameRoot+folder+'/renderer.js','utf8'),c);
 vm.runInContext(`
 for(let i=0;i<15;i++){
  loadStage(i);const collision=JSON.stringify(stage.obstacles);vertexData=[];const dressing=architecturalWayfinding52();assert(vertexData.length>0&&vertexData.every(Number.isFinite));assert.equal(dressing.frames,stage.wayfinding.length);assert.equal(dressing.arrows,stage.wayfinding.length);assert.equal(JSON.stringify(stage.obstacles),collision,'static wayfinding leaves collision unchanged');
  const shapes=new Set();for(const item of stage.questItems){const original=JSON.stringify(item);surfaceMaterial=0;vertexData=[];assert(drawExpeditionItem({...item,type:'quest'}));assert(vertexData.length>0&&vertexData.every(Number.isFinite));assert.equal(JSON.stringify(item),original);shapes.add([0,1,2].map(k=>{const values=vertexData.filter((v,n)=>n%10===k);return (Math.max(...values)-Math.min(...values)).toFixed(5)}).join(','));}assert.equal(shapes.size,3,'three evidence silhouettes have distinct geometry');
 }
 surfaceMaterial=0;for(const particle of[{x:1,y:2,z:.4,vx:1,vy:2,vz:.4,t:.6,c:[.8,.05,.02]},{x:1,y:2,z:.4,vx:1,vy:2,vz:.4,t:.6,c:[1,.7,.3]},{x:1,y:2,z:.4,vx:1,vy:2,vz:.4,t:.6,c:[.6,.4,.1],shell:true}]){vertexData=[];drawImpactParticle52(particle);assert(vertexData.length>0&&vertexData.every(Number.isFinite));assert(vertexData.every((v,i)=>i%10!==9||v<=.28),'impact particles have restrained emission');assert.equal(surfaceMaterial,0);}
 `,c);
 c.releaseGPU=new Proxy({getUniformLocation:(_,name)=>name},{get:(o,key)=>key in o?o[key]:()=>{}});
 vm.runInContext(`gpu=releaseGPU;program={};worldBuffer={};dynamicBuffer={};worldCount=0;sceneCanvas={width:1280,height:720};innerWidth=1280;innerHeight=720;window.devicePixelRatio=1;bindMesh=()=>{};beginCinematicFrame=()=>{};finishCinematicFrame=()=>{};drawHUD=()=>{};bevelBox=()=>{};box=()=>{};gunModel=()=>{};
 if(typeof uploadDynamicGeometry==='function')uploadDynamicGeometry=()=>{};
 if(typeof flushSphereBatch==='function')flushSphereBatch=()=>{};
 let releaseDraws=[],releaseSegments=[];sphere=(...args)=>releaseDraws.push(args);cylinderBetween=(...args)=>releaseSegments.push(args);enemies=[];items=[];particles=[];playing=true;objectiveDone=true;arenaLocked=false;
 projectiles=[{x:111,y:112,z:.55,boss:false,t:2,vx:3,vy:0,vz:0,visualTracer:false},{x:113,y:114,z:.55,boss:false,t:2,vx:3,vy:0,vz:0,visualTracer:true},{x:121,y:122,z:.66,boss:true,t:2,vx:3,vy:0,vz:0,visualTracer:true}];
 navigationPath=()=>[{x:200,y:200},{x:201,y:201},{x:202,y:202},{x:203,y:203}];
 navigationOn=false;render3D();assert(!releaseDraws.some(q=>q[0]>=200),'no path dots while navigation OFF');
 assert(!releaseDraws.some(q=>[111,113,121].includes(q[0])),'bullets never render as glowing spheres');assert(!releaseSegments.some(q=>q[1][0]===111),'ordinary round is invisible');const tracer=releaseSegments.find(q=>q[1][0]===113);assert(tracer&&tracer[2]<.005&&tracer[4]===0,'rare tracer is thin and non-emissive');
 const visualGuard={id:0,boss:false,attack:.16};const tagged=Array.from({length:12},()=>tagEnemyProjectile({},visualGuard));assert.equal(tagged.filter(q=>q.visualTracer).length,2,'every sixth ordinary round only');assert(enemyMuzzleVisible(visualGuard));time+=ENEMY_MUZZLE_SECONDS+.001;assert(!enemyMuzzleVisible(visualGuard),'brief muzzle flash expires while attack animation continues');
 releaseDraws=[];navigationOn=true;render3D();const dots=releaseDraws.filter(q=>q[0]>=200);assert(dots.length>0&&dots.length<=3,'N draws sparse optional route dots');assert(dots.every(q=>q[3]<=.012&&q[5]<=.012&&q[7]<=.10),'small restrained navigation dots');`,c);
 console.log('PASS '+folder+': navigation starts OFF and toggles once per N press; all 15 missions deterministic, body-clear evidence/terminal/exit paths, ordered E pickups, closed walls, knife first guard; finite static wayfinding without collision changes, distinct evidence models, restrained impacts/bullets and sparse optional route dots');
 console.log(JSON.stringify({folder,maps}));
}
