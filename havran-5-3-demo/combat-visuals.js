'use strict';
// Visual-only combat cues. Projectile simulation stays in game.js unchanged.
const ENEMY_MUZZLE_SECONDS=.035;
const ENEMY_ATTACK_SECONDS=.16;
const ENEMY_TRACER_INTERVAL=6;
function tagEnemyProjectile(q,e){
 const shot=(Number.isSafeInteger(e.visualShotCounter)?e.visualShotCounter:0)+1;e.visualShotCounter=shot;
 q.visualTracer=!!e.boss||(shot+(Math.abs(e.id||0)%ENEMY_TRACER_INTERVAL))%ENEMY_TRACER_INTERVAL===0;
 e.visualMuzzleUntil=time+ENEMY_MUZZLE_SECONDS;
 return q;
}
function enemyMuzzleVisible(e){
 if(!(e.attack>0))return false;
 return Number.isFinite(e.visualMuzzleUntil)?time<e.visualMuzzleUntil:e.attack>ENEMY_ATTACK_SECONDS-ENEMY_MUZZLE_SECONDS;
}
function drawEnemyMuzzleFlash(x,y,z,boss=false){
 const previous=surfaceMaterial;surfaceMaterial=0;
 try{sphere(x,y,z,boss?.010:.008,boss?.008:.006,boss?.022:.017,[.64,.43,.19],boss?.16:.12);}finally{surfaceMaterial=previous;}
}
function drawEnemyProjectile(q){
 // Ordinary rounds have no visible projectile model except every sixth tracer.
 // Untagged ordinary rounds also stay hidden; old/manual boss shots retain a cue.
 const visible=q.visualTracer===true||(q.visualTracer===undefined&&q.boss===true);
 if(!visible||!(q.t>0))return false;
 const speed=Math.hypot(q.vx,q.vy,q.vz);
 if(!Number.isFinite(speed)||speed<1e-6||![q.x,q.y,q.z].every(Number.isFinite))return false;
 const length=q.boss?.070:.045,radius=q.boss?.0022:.0015;
 const tail=[q.x-q.vx/speed*length,q.z-q.vz/speed*length,q.y-q.vy/speed*length],head=[q.x,q.z,q.y];
 const previous=surfaceMaterial;surfaceMaterial=0;
 try{cylinderBetween(tail,head,radius,q.boss?[.31,.32,.28]:[.28,.25,.19],0);}finally{surfaceMaterial=previous;}
 return true;
}
