'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const{boot,gameRoot}=require('./test-graphics-53.cjs');
for(const folder of['iron-sector','havran-apple-silicon']){
 const{c}=boot(folder);
 if(folder==='havran-apple-silicon')vm.runInContext(fs.readFileSync(gameRoot+folder+'/gpu-instancing.js','utf8'),c);
 vm.runInContext(fs.readFileSync(gameRoot+folder+'/renderer.js','utf8'),c);
 vm.runInContext(fs.readFileSync(gameRoot+folder+'/scene-style.js','utf8'),c);
 vm.runInContext(`
 const decorStats={world:[],furniture:[],plants:[]};
 function decorDoorOverlap(o,d){const horizontal=d.axis==='x',hw=horizontal?1.2:(d.width||1)/2+.2,hd=horizontal?(d.width||1)/2+.2:1.2;return Math.abs(o.x-d.x)<o.w/2+hw&&Math.abs(o.y-d.y)<o.d/2+hd;}
 function decorSweep(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/.06));for(let i=0;i<=n;i++)if(solidCircle(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,.17))return false;return true;}
 function decorReach(start){const queue=[{x:start.x,y:start.y}],seen=new Set([Math.floor(start.x)+','+Math.floor(start.y)]);assert(!solidCircle(start.x,start.y,.17),'spawn clear');for(let i=0;i<queue.length;i++)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=queue[i],q={x:a.x+dx,y:a.y+dy},key=Math.floor(q.x)+','+Math.floor(q.y);if(!seen.has(key)&&level[Math.floor(q.y)]?.[Math.floor(q.x)]==='0'&&decorSweep(a,q)){seen.add(key);queue.push(q);}}return queue;}
 function decorApproach(reachable,target,r,clearEnd=0){for(const q of reachable){const d=Math.hypot(q.x-target.x,q.y-target.y);let near=q;if(d>=r){if(d>r+.65||d===0)continue;const step=d-r+.06;near={x:q.x+(target.x-q.x)/d*step,y:q.y+(target.y-q.y)/d*step};if(!decorSweep(q,near))continue;}p.x=near.x;p.y=near.y;if(Math.hypot(p.x-target.x,p.y-target.y)<r&&los(target.x,target.y,clearEnd))return near;}return null;}
 for(let index=0;index<15;index++){
  // Validate the authored room dressing before the intentional outdoor filtering.
  const design=makeStage(index);prepareDecor(design,index);assert.equal(design.roomZones.length,3);assert.equal(design.decor.length,7,'restrained dressing '+index);assert.equal(design.decorAudit.tables,2);assert(design.decorAudit.requiredApproaches,'placement approach guard '+index);assert.equal(design.obstacles.length,design.decor.length,'only placed props create decor collisions');assert(design.decorAudit.doorLanesClear);
  for(const o of design.decor){const room=design.roomZones[o.room],b=design.obstacles.find(b=>b.decorId===o.id);assert(b);assert(o.x-b.w/2>=room.x+.1-1e-8&&o.x+b.w/2<=room.x+room.w-.1+1e-8&&o.y-b.d/2>=room.y+.1-1e-8&&o.y+b.d/2<=room.y+room.h-.1+1e-8,'props stay in rooms');assert(design.wayfinding.every(d=>!decorDoorOverlap(b,d)),'protected two-wide door '+index);
   if(o.kind==='chair'){assert(design.decor.includes(o.table),'chair has table');const dx=o.table.x-o.x,dy=o.table.y-o.y,d=Math.hypot(dx,dy);assert(d>=.5&&d<=.6);assert((Math.sin(o.angle||0)*dx-Math.cos(o.angle||0)*dy)/d>.999999,'chair faces its table');}
   if(o.kind==='desk'||o.kind==='table')assert.equal(design.decor.filter(c=>c.kind==='chair'&&c.table===o).length,1,'every table has one chair');
   if(o.kind==='sofa'){const dx=room.x+room.w/2-o.x,dy=room.y+room.h/2-o.y,d=Math.hypot(dx,dy);assert((Math.sin(o.angle)*dx-Math.cos(o.angle)*dy)/d>.999999,'sofa faces room');}
  }
  assert.equal(design.paintings.length,6);assert(new Set(design.paintings.map(o=>o.variant)).size>=4,'different paintings per mission');
  // Real walls, prop AABBs, sealed gate and E line-of-sight: sweep complete
  // physical segments, then collect all three clues and activate the terminal.
  loadStage(index);enemies=[];playing=true;const before=decorReach(stage.start);
  for(const q of stage.questItems){const at=decorApproach(before,q,1.35);assert(at,'E clue approach '+index+' '+q.id);assert(!solidCircle(p.x,p.y,.17));assert(collectNearby());assert(missionInventory.some(item=>item.id===q.id),'actual E pickup');}
  assert.equal(missingQuestItems().length,0);assert(decorApproach(before,stage.terminal,1.25,.35),'physical terminal approach '+index);interact();assert(objectiveDone&&bossEnemy(),'actual terminal action');enemies=[];arenaLocked=false;const after=decorReach(stage.start);assert(decorApproach(after,stage.exit,.8,.40),'physical exit approach '+index);
  for(const q of [...stage.supplies,...stage.goldStashes])assert(decorApproach(after,q,.5),'physical supply/gold approach '+index);
  for(const note of stage.decorNotes)assert(decorApproach(after,note,1.25),'readable story note '+index);
  // The two-wide openings remain usable at both original grid-cell centres,
  // including a full one-cell approach on each side of the crossing.
  for(const d of stage.wayfinding.filter(d=>d.width===2)){for(const offset of[-.5,.5]){const a=d.axis==='x'?{x:d.x-1,y:d.y+offset}:{x:d.x+offset,y:d.y-1},b=d.axis==='x'?{x:d.x+1,y:d.y+offset}:{x:d.x+offset,y:d.y+1};assert(decorSweep(a,b),'door approach lane '+index);}}
  vertexData=[];furnishWorld();assert(vertexData.length>1000&&vertexData.every(Number.isFinite),'finite furniture '+index);decorStats.furniture.push(vertexData.length/10);buildWorld();assert(vertexData.every(Number.isFinite),'finite world '+index);decorStats.world.push(vertexData.length/10);
 }
 // Plant silhouettes retain actual leaves/flowers without thousands of petal
 // ellipsoids, keeping the static mesh budget below 4,000 vertices per pot.
 loadStage(0);const originalDecor=stage.decor,originalArt=stage.paintings;stage.decor=originalDecor.filter(o=>o.kind==='flowers').slice(0,1);stage.paintings=[];vertexData=[];furnishWorld();assert(vertexData.every(Number.isFinite));assert(vertexData.length/10<4000&&vertexData.length/10>500);decorStats.plants.push(vertexData.length/10);stage.decor=originalDecor;stage.paintings=originalArt;
 console.log('Meshes: furniture '+Math.min(...decorStats.furniture)+'–'+Math.max(...decorStats.furniture)+' vertices; plant '+decorStats.plants[0]+' vertices; world '+Math.min(...decorStats.world)+'–'+Math.max(...decorStats.world)+' vertices');
 `,c);
 console.log('PASS '+folder+': all 15 roomZones dressed; 2 paired tables, inward sofa, varied flush wall paintings; physical E clue/terminal/exit/supply approaches, clear two-wide door lanes, finite low-budget furniture/world meshes');
}
