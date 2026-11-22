'use strict';
// Boss decisions are committed until the attack or its recovery ends. Navigation
// uses the actual player-sized map, independent of the render frame and camera.
const BOSS_PATTERNS53={
 volley:{windup:.66,recover:1.12,steps:[0,.23,.46],label:'PŘIPRAVUJE DÁVKU'},
 charge:{windup:.81,recover:1.30,steps:[],label:'CHYSTÁ VÝPAD · UHNI STRANOU'},
 'shield-burst':{windup:.94,recover:1.30,steps:[0,.31],label:'NABÍJÍ ŠTÍT · USTUP'},
 reinforce:{windup:1.04,recover:1.48,steps:[0],label:'SVOLÁVÁ POSILY'},
 precision:{windup:1.15,recover:1.36,steps:[0],label:'ZAMĚŘUJE · SCHOVEJ SE ZA PILÍŘ'}
};
const BOSS_ROLES53={gunner:{pattern:'volley',range:4.2,speed:.98},charger:{pattern:'charge',range:2.6,speed:1.16},warden:{pattern:'shield-burst',range:3.4,speed:.88},summoner:{pattern:'reinforce',range:5.4,speed:1.08},sniper:{pattern:'precision',range:6.2,speed:1.06},overseer:{pattern:'volley',range:4.1,speed:1.15}};
function bossState53(e){return e.bossAI??={state:'waiting',attack:'',phase:1,timer:0,duration:0,think:0,nextStep:0,aim:0,known:null,visible:false,side:chapterIndex%2?1:-1,route:[],summons:0,cycle:0,lastAttack:'',contact:false,stuck:0}}
function bossClearCell53(x,y){return y>=stage.arenaY+.5&&level[Math.floor(y)]?.[Math.floor(x)]==='0'&&!solidCircle(x,y,.26)}
function bossFindRoute53(e,b,role){
 const sx=Math.floor(e.x),sy=Math.floor(e.y),span=level[0].length,queue=[{x:sx+.5,y:sy+.5,steps:0,prev:null}],seen=new Set([sx+sy*span]);
 const target=b.known??{x:stage.bossSpawn.x+2.2*b.side,y:stage.bossSpawn.y};
 const vx=e.x-target.x,vy=e.y-target.y,len=Math.hypot(vx,vy)||1;
 let best=null,bestScore=-Infinity;
 for(let i=0;i<queue.length&&i<180;i++){
  const q=queue[i];
  if(q.steps>=1&&q.steps<=8){
   const d=Math.hypot(q.x-target.x,q.y-target.y),lateral=((q.x-e.x)*vy-(q.y-e.y)*vx)/len*b.side;
   const liveClear=b.known?aiLine(q,target):false;
   const occupied=enemies.some(o=>o!==e&&o.hp>0&&Math.hypot(o.x-q.x,o.y-q.y)<.61);
   const ideal=b.visible?role.range:(b.known?1.1:0);
   const score=-Math.abs(d-ideal)*1.32+(liveClear?1.55:0)+Math.max(-1.2,Math.min(1.4,lateral))*.72-q.steps*.21-(occupied?5:0)+(b.state==='reposition'?.24*Math.min(q.steps,3):0);
   if(d>=.73&&score>bestScore){best=q;bestScore=score}
  }
  if(q.steps>=8)continue;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=q.x+dx,y=q.y+dy,id=Math.floor(x)+Math.floor(y)*span;
   if(seen.has(id)||!bossClearCell53(x,y)||!bossClearCell53(q.x+dx*.5,q.y+dy*.5))continue;
   seen.add(id);queue.push({x,y,steps:q.steps+1,prev:q});
  }
 }
 const route=[];for(let q=best;q?.prev;q=q.prev)route.push(q);return route.reverse();
}
function bossTurn53(e,a,dt){const d=Math.atan2(Math.sin(a-(e.facing??a)),Math.cos(a-(e.facing??a)));e.facing=(e.facing??a)+Math.max(-dt*7,Math.min(dt*7,d))}
function bossSet53(b,state,duration){b.state=state;b.timer=duration;b.duration=duration}
function bossChoose53(e,b,d,role){
 const summons=enemies.filter(f=>f.summoned&&f.hp>0).length;
 let attack=role.pattern;
 if(e.kind==='overseer'){const pool=b.phase===1?['volley','shield-burst','precision']:['charge','reinforce','precision','shield-burst'];attack=pool[b.cycle%pool.length]}
 if(attack==='charge'&&d>5.7)attack='volley';
 if(attack==='precision'&&d<2.1)attack='volley';
 if(attack==='reinforce'&&(b.summons>=5||summons>=2||b.lastAttack==='reinforce'))attack='volley';
 if(b.phase===2&&e.kind==='gunner'&&b.cycle%3===2&&d<4.5)attack='charge';
 if(b.phase===2&&e.kind==='warden'&&b.cycle%3===2)attack='volley';
 return attack;
}
function bossShot53(e,angle,speed,power,spread=0){const a=angle+spread;for(let d=.10;d<=.401;d+=.10)if(wall(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d,.66))return;launch(e,angle,speed,power,spread)}
function bossPulse53(e,b){
 if(b.attack==='reinforce'){
  let alive=enemies.filter(o=>o.summoned&&o.hp>0).length;
  for(const x of[5.5,27.5]){const yy=stage.arenaY+1.5;if(alive>=2||b.summons>=5)break;if(Math.hypot(p.x-x,p.y-yy)<2.3||solidCircle(x,yy,.16)||enemies.some(o=>o.hp>0&&Math.hypot(o.x-x,o.y-yy)<.75))continue;const f=enemy(x,yy,enemies.length);f.hp=f.maxHp=3;f.t=1.5;f.summoned=true;enemies.push(f);b.summons++;alive++;if(b.phase===1)break}
  if(!alive&&b.visible)bossShot53(e,b.aim,4.2,6);return;
 }
 // The aim snapshot is fixed when the tell begins. Cover and movement work.
 if(b.attack==='precision')bossShot53(e,b.aim,7.6,13);
 else if(b.attack==='shield-burst')for(const a of[-.19,-.09,0,.09,.19])bossShot53(e,b.aim,4.4,6,a);
 else for(const a of[-.075,0,.075])bossShot53(e,b.aim,b.phase===2?5.0:4.4,6,a+(b.nextStep-1)*.025);
}
function updateBoss53(e,dt){
 const b=bossState53(e),role=BOSS_ROLES53[e.kind]??BOSS_ROLES53.gunner,oldX=e.x,oldY=e.y;
 e.moveSpeed=0;
 if(!arenaLocked||p.y<=stage.arenaY){b.state='waiting';e.shield=false;return}
 if(b.state==='waiting'){bossSet53(b,'stalk',1.12);b.think=0;b.nextSense=0}
 const phase=e.hp/e.maxHp<=.48?2:1;if(phase!==b.phase){b.phase=phase;b.side*=-1;b.think=0;}
 b.timer=Math.max(0,b.timer-dt);b.think-=dt;b.nextSense=(b.nextSense??0)-dt;
 const d=Math.hypot(e.x-p.x,e.y-p.y);
 if(b.nextSense<=0){b.nextSense=.13;b.visible=d<15&&los(e.x,e.y);if(b.visible)b.known={x:p.x,y:p.y};}
 if(b.state==='telegraph'){
  bossTurn53(e,b.aim,dt);
  if(b.timer===0){e.shield=false;b.nextStep=0;b.contact=false;bossSet53(b,'attack',b.attack==='charge'?.73:BOSS_PATTERNS53[b.attack].steps.at(-1)+.10);}
 }else if(b.state==='attack'){
  if(b.attack==='charge'){
   const step=dt*(b.phase===2?3.8:3.45),x=e.x+Math.cos(b.aim)*step,y=e.y+Math.sin(b.aim)*step;if(!solidCircle(x,y,.25))move(e,x-e.x,y-e.y);else b.timer=0;
   if(!b.contact&&Math.hypot(e.x-p.x,e.y-p.y)<.72&&los(e.x,e.y)&&(p.z||0)<.38){b.contact=true;hurt(16);b.timer=0}
   if(Math.hypot(e.x-oldX,e.y-oldY)<step*.15)b.timer=0;
  }else{
   const elapsed=b.duration-b.timer,steps=BOSS_PATTERNS53[b.attack].steps;
   while(b.nextStep<steps.length&&elapsed>=steps[b.nextStep]){bossPulse53(e,b);b.nextStep++}
  }
  if(b.timer===0){bossSet53(b,'recover',BOSS_PATTERNS53[b.attack].recover);e.shield=false}
 }else if(b.state==='recover'){
  if(b.timer===0){bossSet53(b,'reposition',b.phase===2?1.05:1.42);b.think=0;b.route=[];b.side*=-1}
 }else{
  const ready=b.timer===0&&b.visible&&d<=13&&los(e.x,e.y);
  if(ready){b.attack=bossChoose53(e,b,d,role);b.lastAttack=b.attack;b.cycle++;b.aim=Math.atan2(p.y-e.y,p.x-e.x);e.shield=b.attack==='shield-burst';bossSet53(b,'telegraph',BOSS_PATTERNS53[b.attack].windup);}
  else{
   if(b.think<=0){b.think=b.route.length?.24:.58;if(!b.route.length||b.stuck>.25)b.route=bossFindRoute53(e,b,role);}
   while(b.route.length&&Math.hypot(b.route[0].x-e.x,b.route[0].y-e.y)<.12)b.route.shift();
   const q=b.route[0];if(q){const dx=q.x-e.x,dy=q.y-e.y,n=Math.hypot(dx,dy),s=Math.min(n,role.speed*(b.phase===2?1.19:1)*dt);if(n>.001)move(e,dx/n*s,dy/n*s);bossTurn53(e,b.visible?Math.atan2(p.y-e.y,p.x-e.x):Math.atan2(dy,dx),dt);if(Math.hypot(e.x-oldX,e.y-oldY)<dt*.12){b.stuck+=dt;if(b.stuck>.34){b.stuck=0;b.side*=-1;b.think=0;b.route=[]}}else b.stuck=0;}
  }
 }
 e.moveSpeed=Math.hypot(e.x-oldX,e.y-oldY)/Math.max(.0001,dt);
}
function bossWarning53(e){const b=e.bossAI;if(!arenaLocked||!b||b.state==='waiting')return 'VSTUP DO ARÉNY';if(b.state==='telegraph')return BOSS_PATTERNS53[b.attack].label;if(b.state==='recover')return 'ODKRYTÝ · TEĎ MŮŽEŠ ÚTOČIT';return ''}
function prepareArena53(){
 // A separate no-save mode exercises the same arena, boss and collision code.
 const boss=enemy(stage.bossSpawn.x,stage.bossSpawn.y,0,true);boss.weaponType=FIREARM_IDS[(chapterIndex+3)%18];
 enemies=[boss];items=items.filter(i=>i.y>=stage.arenaY+1);missionInventory=stage.questItems.map(q=>({...q}));
 objectiveDone=true;arenaLocked=true;p.x=stage.gate.x;p.y=stage.arenaY+1.03;p.a=Math.atan2(boss.y-p.y,boss.x-p.x);
 missionEquipment.add(0);missionEquipment.add(3);mags[0]=capacities[0];rounds[0]=36;mags[3]=capacities[3];rounds[3]=30;weapon=3;ammo=mags[3];
}
