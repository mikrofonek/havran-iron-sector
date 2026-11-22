// Original HAVRAN AI: sampled perception, bounded local choices and cached grid routes.
// Only observed/heard positions are remembered. Boss attack patterns remain in game.js.
// General FPS concepts informed by UZDoom's public enemy behavior documentation/source;
// this implementation is authored for HAVRAN's grid, without copied engine code.
function aiLine(a,b){const d=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(d*12));for(let i=1;i<steps;i++)if(wall(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,.7))return false;return true}
function aiRoute(from,to){const sx=Math.floor(from.x),sy=Math.floor(from.y),tx=Math.floor(to.x),ty=Math.floor(to.y),width=level[0].length,height=level.length;if(tx<0||ty<0||tx>=width||ty>=height||wall(tx+.5,ty+.5))return[];const queue=[[sx,sy]],parents=new Map([[sx+sy*width,null]]);for(let k=0;k<queue.length&&k<width*height;k++){const[x,y]=queue[k];if(x===tx&&y===ty)break;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,id=nx+ny*width;if(nx<0||ny<0||nx>=width||ny>=height||parents.has(id)||wall(nx+.5,ny+.5))continue;parents.set(id,[x,y]);queue.push([nx,ny])}}if(!parents.has(tx+ty*width))return[];const path=[];let cell=[tx,ty];while(cell){path.push({x:cell[0]+.5,y:cell[1]+.5});cell=parents.get(cell[0]+cell[1]*width)}path.reverse();return path.slice(1)}
function aiBrain(e){
 if(!e.brain){const role=e.role||0,first=stage.foes?.[0];e.magazine=[5,6,6,3][role]??5;e.reloading=0;e.moveSpeed=0;e.aiMoving=false;e.aiIntent='watch';e.brain={state:'idle',visible:false,think:(e.id%4)*.04,pathTimer:0,path:[],waypoint:0,memory:0,reaction:0,lastKnown:null,report:0,previousPlayer:null,velocity:{x:0,y:0},health:e.hp,alertTimer:0,tacticTimer:0,tacticGoal:null,tacticKind:'',tacticHold:0,tacticAge:0,combatIntent:'',coverCooldown:0,burstLeft:0,aiming:false,aimWindup:0,fireBlocked:false,blockedFor:0,searchTimer:0,searchGoal:null,searchChecked:[],home:{x:e.x,y:e.y},patrolGoal:null,patrolWait:1.8+(e.id%4)*.35,patrolAge:0,patrolLeg:0,firstGuard:e.id===0&&first?.x===e.x&&first?.y===e.y};}
 return e.brain;
}
let aiReportNumber=0;
function aiRemember(b,x,y,seconds,report){
 const clearSearch=!b.lastKnown||Math.hypot(x-b.lastKnown.x,y-b.lastKnown.y)>.75;
 b.lastKnown={x,y};b.memory=seconds;b.report=report;b.patrolGoal=null;
 if(clearSearch){b.searchGoal=null;b.searchTimer=0;b.searchChecked.length=0;}
}
const aiNoiseCache={level:null,stage:null,obstacles:null,key:'',cells:new Map(),builds:0};
function aiNoiseField(origin){
 const width=level[0].length,height=level.length,sx=Math.floor(origin.x),sy=Math.floor(origin.y),key=[sx,sy,objectiveDone,arenaLocked].join(',');
 if(aiNoiseCache.level===level&&aiNoiseCache.stage===stage&&aiNoiseCache.obstacles===stage.obstacles&&aiNoiseCache.key===key)return aiNoiseCache.cells;
 const cells=new Map(),queue=[];if(!wall(sx+.5,sy+.5)){cells.set(sx+sy*width,0);queue.push([sx,sy,0]);}
 // At most the eight-step neighbourhood (145 cells), never a per-enemy/full-map search.
 for(let k=0;k<queue.length&&k<Math.min(width*height,145);k++){const[x,y,d]=queue[k];if(d>=8)continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,id=xx+yy*width;if(xx<0||yy<0||xx>=width||yy>=height||cells.has(id)||wall(xx+.5,yy+.5))continue;cells.set(id,d+1);queue.push([xx,yy,d+1]);}}
 aiNoiseCache.level=level;aiNoiseCache.stage=stage;aiNoiseCache.obstacles=stage.obstacles;aiNoiseCache.key=key;aiNoiseCache.cells=cells;aiNoiseCache.builds++;return cells;
}
function notifyEnemyShot(){const heard={x:p.x,y:p.y},cells=aiNoiseField(heard),width=level[0].length,report=++aiReportNumber;for(const e of enemies){if(e.boss||e.hp<=0||Math.hypot(e.x-heard.x,e.y-heard.y)>8||!cells.has(Math.floor(e.x)+Math.floor(e.y)*width))continue;const b=aiBrain(e);if(!b.visible){aiRemember(b,heard.x,heard.y,6,report);b.state='investigate';}}}
function aiClearFireLane(e,angle,range,spread=0){
 const a=angle+spread,dx=Math.cos(a),dy=Math.sin(a);
 for(const ally of enemies){if(ally===e||ally.hp<=0)continue;const x=ally.x-e.x,y=ally.y-e.y,along=x*dx+y*dy;if(along<=.15||along>=range+.15)continue;const radius=(typeof bodyRadius==='function'?bodyRadius(ally):.24)+.04;if(Math.abs(x*dy-y*dx)<radius)return false;}return true;
}
function aiShareAlert(source,b){
 if(!b.lastKnown||b.alertTimer>0)return;b.alertTimer=1.8;let count=0;
 const report=b.report||(b.report=++aiReportNumber);
 for(const ally of enemies){if(count>=3)break;if(ally===source||ally.boss||ally.hp<=0||Math.hypot(ally.x-source.x,ally.y-source.y)>5.5||!aiLine(source,ally))continue;const other=aiBrain(ally);if(other.visible||other.report>=report)continue;aiRemember(other,b.lastKnown.x,b.lastKnown.y,Math.max(other.memory,4),report);other.state='investigate';other.pathTimer=Math.min(other.pathTimer,.2);count++;}
}
// Small reachable neighbourhood only: no tactical full-map search on a frame tick.
function aiLocalCells(e,radius=4){const sx=Math.floor(e.x),sy=Math.floor(e.y),q=[[sx,sy,0]],seen=new Set([sx+','+sy]),out=[];for(let k=0;k<q.length&&k<80;k++){const[x,y,d]=q[k];if(d>0)out.push({x:x+.5,y:y+.5,travel:d});if(d>=radius)continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,key=xx+','+yy;if(seen.has(key)||wall(xx+.5,yy+.5))continue;if(typeof solidCircle==='function'&&(solidCircle(xx+.5,yy+.5,.24)||solidCircle(x+.5+dx*.5,y+.5+dy*.5,.24)))continue;seen.add(key);q.push([xx,yy,d+1]);}}return out;}
function aiPositionTaken(e,q){for(const ally of enemies){if(ally===e||ally.hp<=0)continue;if(Math.hypot(q.x-ally.x,q.y-ally.y)<.62)return true;const goal=ally.brain?.tacticGoal||ally.brain?.searchGoal||ally.brain?.patrolGoal;if(goal&&Math.hypot(q.x-goal.x,q.y-goal.y)<.8)return true;}return false;}
function aiNearbySupport(e,b){
 if(!b.lastKnown)return null;
 for(const ally of enemies){const other=ally.brain;if(ally!==e&&ally.role===2&&ally.hp>0&&ally.reloading<=0&&ally.magazine>0&&other?.combatIntent==='support'&&!other.fireBlocked&&other.visible&&other.lastKnown&&Math.hypot(ally.x-e.x,ally.y-e.y)<5&&Math.hypot(other.lastKnown.x-b.lastKnown.x,other.lastKnown.y-b.lastKnown.y)<1.5&&aiLine(e,ally))return ally;}return null;
}
function aiTacticalPosition(e,b,kind,preferred,support=null,cells=aiLocalCells(e)){
 const known=b.lastKnown;if(!known)return null;const ux=e.x-known.x,uy=e.y-known.y,length=Math.hypot(ux,uy)||1,side=e.id%2?1:-1;let best=null,bestScore=-Infinity;
 for(const q of cells){if(aiPositionTaken(e,q))continue;const d=Math.hypot(q.x-known.x,q.y-known.y);if(d<1.3)continue;
  let score;if(kind==='cover'){if(aiLine(q,known))continue;score=8-q.travel*.65-Math.abs(d-preferred)*.12;}
  else{const lateral=((q.x-known.x)*uy-(q.y-known.y)*ux)/length,cross=kind==='reposition'?Math.abs(lateral):lateral*side;if(cross<.85||!aiLine(q,known))continue;score=cross*.9-Math.abs(d-preferred)*.45-q.travel*.2;if(support){const ax=support.x-known.x,ay=support.y-known.y,span=Math.hypot(ax,ay)||1;if(Math.abs((q.x-known.x)*ay-(q.y-known.y)*ax)/span<.64)score-=2;}}
  if(score>bestScore){bestScore=score;best=q;}
 }
 return best;
}
const aiGuardRoles=[
 {preferred:2.5,speed:.85,advance:.13,flank:.59,hold:.37,patrol:true}, // operative pushes up
 {preferred:3.5,speed:.64,advance:.04,flank:.82,hold:.45,patrol:true}, // guard relocates
 {preferred:3.8,speed:.40,advance:0,flank:0,hold:.49,patrol:false}, // heavy holds a lane
 {preferred:5.5,speed:.58,advance:0,flank:.42,hold:.65,patrol:false}, // marksman keeps distance
];
const aiUnit=value=>Math.max(0,Math.min(1,value));
function aiPickCombat(e,b,distance,role){
 const far=aiUnit((distance-role.preferred+.3)/3),hurt=aiUnit(1-e.hp/Math.max(1,e.maxHp)),outOfFight=e.reloading>0;
 const candidates=[{kind:'hold',score:role.hold+.20*(1-far)}];
 const takeCover=outOfFight||(hurt>.45&&b.coverCooldown===0),saveLastRound=e.id!==0&&e.role!==0&&e.magazine===1&&b.coverCooldown===0;
 if(takeCover||saveLastRound)candidates.push({kind:'cover',score:takeCover?.92:.83});
 const support=e.role===1?aiNearbySupport(e,b):null;
 if(!outOfFight){
  candidates.push({kind:'advance',score:.27+.53*far+role.advance});
  if(e.role===2&&distance<=role.preferred+1.4)candidates.push({kind:'support',score:.82});
  if(e.id!==0&&role.flank&&distance>2.2&&distance<8)candidates.push({kind:'flank',score:role.flank+(support?.10:0)});
  if(b.blockedFor>.24&&e.id!==0)candidates.push({kind:'reposition',score:.94});
 }
 candidates.sort((a,c)=>(c.score+(b.combatIntent===c.kind?.07:0))-(a.score+(b.combatIntent===a.kind?.07:0)));
 let local=null;
 for(const plan of candidates){
  if(plan.kind==='hold'||plan.kind==='advance'||plan.kind==='support')return plan;
  local??=aiLocalCells(e);
  const goal=aiTacticalPosition(e,b,plan.kind,role.preferred,support,local);
  if(goal)return{kind:plan.kind,goal};
 }
 return{kind:'hold'};
}
function aiPatrol(e,b,dt,role){
 if(e.id===0||!role.patrol)return null;
 if(b.patrolGoal){b.patrolAge+=dt;if(Math.hypot(e.x-b.patrolGoal.x,e.y-b.patrolGoal.y)<.22||b.patrolAge>5.6){b.patrolGoal=null;b.patrolWait=1+e.id%3*.24;}else return b.patrolGoal;}
 b.patrolWait-=dt;if(b.patrolWait>0)return null;
 b.patrolWait=1.8;b.patrolAge=0;
 if(Math.hypot(e.x-b.home.x,e.y-b.home.y)>.6&&!aiPositionTaken(e,b.home)&&!wall(b.home.x,b.home.y))return b.patrolGoal=b.home;
 const nearby=aiLocalCells(e,2).filter(q=>Math.hypot(q.x-b.home.x,q.y-b.home.y)<=2.05&&!aiPositionTaken(e,q));
 return b.patrolGoal=nearby[(e.id+b.patrolLeg++)%Math.max(1,nearby.length)]||null;
}
function aiSearch(e,b,dt){
 if(b.searchGoal&&Math.hypot(e.x-b.searchGoal.x,e.y-b.searchGoal.y)<.25){b.searchChecked.push(b.searchGoal);b.searchGoal=null;b.searchTimer=0;}
 if(b.searchGoal)return b.searchGoal;
 const reached=Math.hypot(e.x-b.lastKnown.x,e.y-b.lastKnown.y)<.65||b.searchChecked.length>0;
 if(!reached)return b.lastKnown;
 b.searchTimer+=dt;
 if(b.searchTimer>=.55&&b.searchChecked.length<2){
  const cells=aiLocalCells(e,2).filter(q=>Math.hypot(q.x-b.lastKnown.x,q.y-b.lastKnown.y)<=2.6&&!aiPositionTaken(e,q)&&!b.searchChecked.some(old=>q.x===old.x&&q.y===old.y));
  b.searchGoal=cells[(e.id+b.searchChecked.length)%Math.max(1,cells.length)]||null;b.searchTimer=0;
 }
 return b.searchGoal;
}
function aiClearPosition(b){b.tacticGoal=null;b.tacticKind='';b.tacticAge=0;b.combatIntent='';}
function aiStartReload(e,b){e.reloading=[1.9,2.1,2.7,2.8][e.role]??2.1;b.burstLeft=0;b.aiming=false;b.aimWindup=0;b.tacticTimer=0;if(b.tacticKind!=='cover')aiClearPosition(b);e.t=.4;b.state='reload';}
function aiFace(e,x,y,dt){if(Math.abs(x)+Math.abs(y)<.00001)return;const direction=Math.atan2(y,x),current=e.facing??direction,error=Math.atan2(Math.sin(direction-current),Math.cos(direction-current));e.facing=current+Math.max(-dt*8,Math.min(dt*8,error));}
function updateSmartEnemy(e,dt){
 const previousX=e.x,previousY=e.y,b=aiBrain(e),role=aiGuardRoles[e.role]||aiGuardRoles[0],preferred=role.preferred,speed=role.speed;
 e.t-=dt;b.think-=dt;b.pathTimer-=dt;b.memory=Math.max(0,b.memory-dt);b.reaction=Math.max(0,b.reaction-dt);b.aimWindup=Math.max(0,b.aimWindup-dt);b.alertTimer=Math.max(0,b.alertTimer-dt);b.tacticTimer-=dt;b.coverCooldown=Math.max(0,b.coverCooldown-dt);
 const opening=b.firstGuard&&e.t>.34&&!b.aiming&&!b.burstLeft&&e.magazine===(e.role===3?3:e.role===0?5:6)&&e.hp>=b.health;
 const distance=Math.hypot(e.x-p.x,e.y-p.y);
 b.blockedFor=b.fireBlocked?Math.min(2,b.blockedFor+dt):0;
 if(e.reloading>0){e.reloading=Math.max(0,e.reloading-dt);if(e.reloading===0){e.magazine=[5,6,6,3][e.role]??5;b.reaction=Math.max(b.reaction,.25);b.tacticTimer=0;}}
 if(b.think<=0){const interval=.2+(e.id%3)*.025;b.think=interval;const seen=distance<11&&aiLine(e,p);
  if(seen){if(!b.visible)b.reaction=.3+(e.role||0)*.07;aiRemember(b,p.x,p.y,7,++aiReportNumber);b.state='combat';b.searchGoal=null;b.searchTimer=0;b.searchChecked.length=0;if(b.previousPlayer){const vx=(p.x-b.previousPlayer.x)/interval,vy=(p.y-b.previousPlayer.y)/interval,limit=Math.max(1,Math.hypot(vx,vy)/3.2);b.velocity={x:vx/limit,y:vy/limit};}b.previousPlayer={x:p.x,y:p.y};}
  else{b.previousPlayer=null;b.velocity={x:0,y:0};b.burstLeft=0;b.fireBlocked=false;if(b.memory>0&&b.lastKnown)b.state='search';else{b.state='idle';b.lastKnown=null;b.searchGoal=null;b.searchChecked.length=0;b.searchTimer=0;aiClearPosition(b);}}
  b.visible=seen;if(seen)aiShareAlert(e,b);
 }
 if(e.hp<b.health){if(b.visible&&aiLine(e,p)){aiRemember(b,p.x,p.y,7,++aiReportNumber);aiShareAlert(e,b);}b.tacticTimer=0;}b.health=e.hp;
 if(e.magazine<=0&&e.reloading<=0)aiStartReload(e,b);
 if(!b.visible||e.reloading>0){b.aiming=false;b.aimWindup=0;}
 if(opening){if(b.visible&&b.lastKnown)aiFace(e,b.lastKnown.x-e.x,b.lastKnown.y-e.y,dt);e.aiIntent='watch';e.moveSpeed=0;e.aiMoving=false;return;}
 const tracked=b.lastKnown?Math.hypot(e.x-b.lastKnown.x,e.y-b.lastKnown.y):Infinity;
 // Travel commitments reserve a cell until arrival/short dwell, lost cover or a bounded timeout.
 if(b.tacticGoal){
  b.tacticAge+=dt;
  if(Math.hypot(e.x-b.tacticGoal.x,e.y-b.tacticGoal.y)<.25){
   if(b.tacticKind==='cover'&&e.reloading<=0&&e.magazine===1&&b.lastKnown&&!aiLine(e,b.lastKnown))aiStartReload(e,b);
   b.tacticHold=Math.max(0,b.tacticHold-dt);
   if(e.reloading<=0&&b.tacticHold===0){if(b.tacticKind==='cover')b.coverCooldown=4;aiClearPosition(b);}
  }
  if(b.tacticAge>(b.tacticLimit||5.6)||(!b.visible&&b.tacticKind!=='cover'))aiClearPosition(b);
 }
 if(b.tacticTimer<=0){
  b.tacticTimer=1.15+(e.id%4)*.18;
  if(b.tacticKind==='cover'&&b.tacticGoal&&b.lastKnown&&aiLine(b.tacticGoal,b.lastKnown))aiClearPosition(b);
  if(b.visible&&b.lastKnown&&!b.tacticGoal&&!b.aiming&&!b.burstLeft){
   const plan=aiPickCombat(e,b,tracked,role);b.combatIntent=plan.kind;
   if(plan.goal){b.tacticGoal=plan.goal;b.tacticKind=plan.kind;b.tacticHold=plan.kind==='cover'?.8:.3;b.tacticAge=0;b.tacticLimit=Math.min(11.5,Math.max(3.6,plan.goal.travel/speed+(plan.kind==='cover'?3.3:1.1)));b.pathTimer=Math.min(b.pathTimer,.10);}
  }
 }
 let goal=b.lastKnown,intent='watch',retreat=b.visible&&(tracked<preferred*.58||(e.reloading>0&&tracked<preferred*1.1));
 if(b.tacticGoal){goal=b.tacticGoal;b.state=b.tacticKind;retreat=false;}
 else if(retreat&&b.lastKnown){const dx=e.x-b.lastKnown.x,dy=e.y-b.lastKnown.y,len=Math.hypot(dx,dy)||1,candidate={x:e.x+dx/len*1.2,y:e.y+dy/len*1.2};goal=wall(candidate.x,candidate.y)?null:candidate;}
 if(b.tacticGoal)intent=b.tacticKind;
 else if(b.visible)intent=retreat?'reposition':b.combatIntent||(tracked>preferred?'advance':'hold');
 else if(b.memory>0&&b.lastKnown){goal=aiSearch(e,b,dt);intent=goal===b.lastKnown&&tracked>.65?'investigate':'search';}
 else {goal=aiPatrol(e,b,dt,role);if(goal)intent='patrol';}
 const holdingAim=(b.aiming||b.burstLeft>0)&&b.visible&&e.reloading<=0&&!retreat&&!b.fireBlocked,movingPlan=b.tacticGoal||retreat||intent==='investigate'||intent==='search'||intent==='patrol'||(intent==='advance'&&tracked>preferred);
 if(!holdingAim&&goal&&movingPlan){
  const key=Math.floor(goal.x)+','+Math.floor(goal.y)+','+objectiveDone+','+arenaLocked;
  // Enforce a per-agent cooldown even if the target crosses a new cell each sample.
  if(b.pathTimer<=0){b.path=aiRoute(e,goal);b.waypoint=0;b.pathKey=key;b.pathTimer=.65+(e.id%4)*.1;}
  if(b.pathKey===key||intent==='advance'||retreat){
   let next=b.path[b.waypoint];if(next&&Math.hypot(next.x-e.x,next.y-e.y)<.18)next=b.path[++b.waypoint];
   if(!next&&b.pathKey===key&&Math.floor(e.x)===Math.floor(goal.x)&&Math.floor(e.y)===Math.floor(goal.y))next=goal;
   if(next){const dx=next.x-e.x,dy=next.y-e.y,len=Math.hypot(dx,dy)||1,step=Math.min(len,speed*dt*(intent==='patrol'?.65:1));move(e,dx/len*step,dy/len*step,.24);}
  }
 }else if(!holdingAim&&b.visible&&b.lastKnown&&tracked>1.2&&e.role!==2&&e.reloading<=0&&intent!=='hold'){const sign=e.id%2?1:-1;move(e,-(b.lastKnown.y-e.y)/Math.max(.01,tracked)*sign*dt*.18,(b.lastKnown.x-e.x)/Math.max(.01,tracked)*sign*dt*.18,.24);}
 // Existing solid body movement remains authoritative; this separation only reduces congestion.
 let sx=0,sy=0;for(const other of enemies){if(other===e||other.hp<=0)continue;const dx=e.x-other.x,dy=e.y-other.y,d=Math.hypot(dx,dy);if(d>.01&&d<.65){sx+=dx/d*(.65-d);sy+=dy/d*(.65-d);}}if(sx||sy)move(e,sx*dt*.7,sy*dt*.7,.24);
 if(b.visible&&b.reaction===0&&e.t<=0&&e.reloading<=0&&e.magazine>0&&b.tacticKind!=='cover'&&aiLine(e,p)){
  const projectileSpeed=e.role===3?5.5:3.1,lead=e.role===3?Math.min(.45,distance/projectileSpeed*.35):0,aim=Math.atan2(p.y+b.velocity.y*lead-e.y,p.x+b.velocity.x*lead-e.x);
  b.fireBlocked=!(e.role===2?[-.09,0,.09]:[0]).every(offset=>aiClearFireLane(e,aim,distance,offset));
  if(b.fireBlocked){b.aiming=false;b.aimWindup=0;b.burstLeft=0;e.t=.12;}
  else if(b.burstLeft<=0&&!b.aiming){b.aiming=true;b.aimWindup=.18+(e.role===3?.06:0);b.state='aim';}
  else if(!b.aiming||b.aimWindup===0){
   if(b.burstLeft<=0)b.burstLeft=e.role===3?1:2;b.aiming=false;e.facing=aim;
   if(e.role===2)for(const offset of[-.09,0,.09])launch(e,aim,3,3,offset);else launch(e,aim,projectileSpeed,e.role===3?9:e.role===0?3.5:4);
   e.magazine--;b.burstLeft--;e.t=b.burstLeft>0?.22:e.role===3?3.4:e.role===0?2.2:2.6;
   if(e.magazine===0)aiStartReload(e,b);
  }
 }else if(b.aiming&&!aiLine(e,p)){b.aiming=false;b.aimWindup=0;}
 const dx=e.x-previousX,dy=e.y-previousY;
 e.aiIntent=intent;e.moveSpeed=Math.hypot(dx,dy)/Math.max(dt,.00001);e.aiMoving=e.moveSpeed>.04;
 if(e.attack<=0){if((b.aiming||intent==='support'||!e.aiMoving)&&b.lastKnown)aiFace(e,b.lastKnown.x-e.x,b.lastKnown.y-e.y,dt);else if(e.aiMoving)aiFace(e,dx,dy,dt);}
}
