const fs=require('fs'),vm=require('vm'),assert=require('assert');
const{boot,gameRoot}=require('./test-graphics-53.cjs');
const baselinePath=__dirname+'/reference-52/expedition-maps-51-baseline.js';
const baseline=fs.readFileSync(baselinePath,'utf8');
const baselineMake=baseline.slice(baseline.indexOf('function makeStage(index)'));
function installMetric(c){vm.runInContext(`
function pathMetrics(){
 const W=level[0].length,H=level.length,walk=new Map(),has=(x,y)=>walk.has(x+','+y);
 function lineClear(x,y,q,end=0){const d=Math.hypot(q.x-x,q.y-y),n=Math.max(1,Math.ceil(d*15));for(let i=1;i<n&&d*i/n<d-end;i++)if(wall(x+(q.x-x)*i/n,y+(q.y-y)*i/n,.7))return false;return true}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(level[y][x]==='0'&&!solidCircle(x+.5,y+.5,.17)){
  let mask=0;for(let i=0;i<3;i++){const q=stage.questItems[i];if(Math.hypot(x+.5-q.x,y+.5-q.y)<1.35&&lineClear(x+.5,y+.5,q))mask|=1<<i;}
  walk.set(x+','+y,{x,y,mask,terminal:Math.hypot(x+.5-stage.terminal.x,y+.5-stage.terminal.y)<=1.25&&lineClear(x+.5,y+.5,stage.terminal,.35)});
 }
 const sx=Math.floor(stage.start.x),sy=Math.floor(stage.start.y),start=walk.get(sx+','+sy);assert(start,'start is clear');
 const queue=[[sx,sy,start.mask,0]],seen=new Set([sx+','+sy+','+start.mask]);let required=-1;
 for(let k=0;k<queue.length;k++){const[x,y,mask,d]=queue[k],cell=walk.get(x+','+y);if(mask===7&&cell.terminal){required=d;break}for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,next=walk.get(xx+','+yy);if(!next)continue;const bits=mask|next.mask,key=xx+','+yy+','+bits;if(!seen.has(key)){seen.add(key);queue.push([xx,yy,bits,d+1]);}}}
 assert(required>=0,'all three evidence items and terminal reachable');
 const distances=new Map([[sx+','+sy,0]]),q=[[sx,sy]];
 for(let k=0;k<q.length;k++){const[x,y]=q[k];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,key=xx+','+yy;if(has(xx,yy)&&!distances.has(key)){distances.set(key,distances.get(x+','+y)+1);q.push([xx,yy]);}}}
 const targetDistances=stage.questItems.map(item=>{let min=Infinity;for(const[key,d]of distances){const[x,y]=key.split(',').map(Number);if(Math.hypot(x+.5-item.x,y+.5-item.y)<1.35&&lineClear(x+.5,y+.5,item))min=Math.min(min,d)}return min});
 const rawCells=level.reduce((sum,row)=>sum+[...row].filter(c=>c==='0').length,0);
 return{requiredSteps:required,targetDistances,walkableBeforeGate:walk.size,rawOpenCells:rawCells};
}
function assertExitReachable(){objectiveDone=true;arenaLocked=false;enemies=[];
 const q=[[Math.floor(stage.start.x),Math.floor(stage.start.y)]],seen=new Set([q[0].join(',')]);
 for(let k=0;k<q.length;k++){const[x,y]=q[k];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){let xx=x+dx,yy=y+dy,key=xx+','+yy;if(!seen.has(key)&&level[yy]?.[xx]==='0'&&!solidCircle(xx+.5,yy+.5,.17)){seen.add(key);q.push([xx,yy]);}}}
 assert([...seen].some(key=>{const[x,y]=key.split(',').map(Number);return Math.hypot(x+.5-stage.exit.x,y+.5-stage.exit.y)<1.26}),'exit approach reachable');
 const possible=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:stage.exit.x+dx,y:stage.exit.y+dy})).find(v=>!solidCircle(v.x,v.y,.17)&&seen.has(Math.floor(v.x)+','+Math.floor(v.y)));assert(possible);p.x=possible.x;p.y=possible.y;move(p,(stage.exit.x-p.x)*.4,(stage.exit.y-p.y)*.4);assert(Math.hypot(p.x-stage.exit.x,p.y-stage.exit.y)<.8,'physical exit trigger approachable');
}
`,c)}
const comparisons=[];
for(const folder of['iron-sector','havran-apple-silicon']){
 const{c}=boot(folder);installMetric(c);
 const current=vm.runInContext('makeStage',c);c.__currentMake=current;
 vm.runInContext(baselineMake,c);const before=[];
 for(let i=0;i<15;i++){before.push(vm.runInContext(`loadStage(${i});pathMetrics()`,c));}
 vm.runInContext('makeStage=__currentMake',c);const after=[];const signatures=new Set();
 for(let i=0;i<15;i++){
  const metric=vm.runInContext(`(()=>{loadStage(${i});assert.equal(level.length,35);assert.equal(level[0].length,31);assert.equal(stage.layoutStyle,'freedoom-opening-inspired');assert(stage.optionalBranches<=1);assert.equal(stage.returnLoops,0);assert.equal(stage.rooms.length,3);assert.equal(stage.roomZones.length,3);assert(stage.wayfinding.slice(0,2).every(d=>d.width===2));assert.equal(stage.gate.y,26.5);assert.equal(stage.arenaY,27);assert.equal(stage.bossSpawn.y,30.5);assert.equal(stage.exit.x,27.5);assert.equal(weapon,6);assert.equal(enemies[0].x,stage.start.x+1);assert.equal(enemies[0].y,stage.start.y);const metric=pathMetrics();assert(metric.targetDistances.every((d,n,a)=>n===0||d>a[n-1]),'evidence in progression order');assert(metric.requiredSteps<=24,'short three-room route');for(const door of stage.wayfinding.slice(0,2)){const from={x:door.x-(door.axis==='x'?1:0),y:door.y-(door.axis==='y'?1:0)},to={x:door.x+(door.axis==='x'?1:0),y:door.y+(door.axis==='y'?1:0)};for(let k=0;k<=20;k++)assert(!solidCircle(from.x+(to.x-from.x)*k/20,from.y+(to.y-from.y)*k/20,.17),'two-wide doorway swept clearance');}playing=true;shot=0;switchTime=0;p.a=0;fire();assert(enemies[0].hp<=0,'first guard always knife reachable');assertExitReachable();return metric})()`,c);
  after.push(metric);signatures.add(vm.runInContext('stage.map.join(\'\')',c));assert(metric.requiredSteps<before[i].requiredSteps,'strictly shorter mission '+i);
 }
 assert.equal(signatures.size,15,'door variations remain deterministic/distinct');
 const avg=a=>a.reduce((s,v)=>s+v.requiredSteps,0)/a.length;
 comparisons.push({folder,beforeAverageSteps:+avg(before).toFixed(1),afterAverageSteps:+avg(after).toFixed(1),reductionPercent:Math.round((1-avg(after)/avg(before))*100),beforeRange:[Math.min(...before.map(v=>v.requiredSteps)),Math.max(...before.map(v=>v.requiredSteps))],afterRange:[Math.min(...after.map(v=>v.requiredSteps)),Math.max(...after.map(v=>v.requiredSteps))],all:after.map((v,i)=>({mission:i+1,steps:v.requiredSteps,evidenceDistances:v.targetDistances,openCells:v.rawOpenCells}))});
 console.log('PASS '+folder+': 15 simple three-room routes, ordered evidence, furniture-aware reachability, physical exit approach, preserved arena/knife start, <=1 optional alcove, no maze loops');
}
console.log(JSON.stringify(comparisons,null,2));
