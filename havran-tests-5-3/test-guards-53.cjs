const vm=require('vm');
const {boot}=require('./test-graphics-53.cjs');

for(const folder of ['iron-sector','havran-apple-silicon']){
 const {c}=boot(folder);
 vm.runInContext(`
 const open53=Array.from({length:13},(_,y)=>y===0||y===12?'1'.repeat(19):'1'+'0'.repeat(17)+'1');
 function arena53(map,x,y){loadStage(0);level=map;stage.obstacles=[];stage.gate={x:100,y:100};objectiveDone=true;arenaLocked=false;p={x,y,z:0,a:0,pitch:0};hp=10000;armor=0;playing=true;projectiles=[];enemies=[];}
 function actor53(x,y,id,role){const e=enemy(x,y,id);e.role=role;e.t=60;enemies.push(e);return e;}
 function tracking53(e){const b=aiBrain(e);b.visible=true;b.think=20;aiRemember(b,p.x,p.y,20,++aiReportNumber);return b;}
 // An operative closes distance; a marksman at a workable range chooses to hold.
 arena53(open53,11.5,5.5);let operative=actor53(5.5,5.5,4,0),mark=actor53(6.5,7.5,7,3);tracking53(operative);tracking53(mark);updateSmartEnemy(operative,.02);updateSmartEnemy(mark,.02);assert.equal(operative.aiIntent,'advance');assert(operative.aiMoving);assert.equal(mark.aiIntent,'hold');assert(!mark.aiMoving);
 // A heavy provides a local holding lane; a mobile guard otherwise too far out
 // takes a different route when support makes the flank worthwhile.
 arena53(open53,11.5,5.5);let heavy=actor53(7.5,5.5,2,2),left=actor53(4.5,5.5,1,1),right=actor53(4.5,7.5,5,1);const leftBrain=tracking53(left),rightBrain=tracking53(right);tracking53(heavy);assert.equal(aiPickCombat(left,leftBrain,7,aiGuardRoles[1]).kind,'advance');updateSmartEnemy(heavy,.02);assert.equal(heavy.aiIntent,'support');assert.strictEqual(aiNearbySupport(left,leftBrain),heavy);updateSmartEnemy(left,.02);assert.equal(left.aiIntent,'flank');assert(leftBrain.tacticGoal&&aiPositionTaken(right,leftBrain.tacticGoal));updateSmartEnemy(right,.02);assert.equal(right.aiIntent,'flank');assert(rightBrain.tacticGoal);assert(Math.hypot(rightBrain.tacticGoal.x-leftBrain.tacticGoal.x,rightBrain.tacticGoal.y-leftBrain.tacticGoal.y)>=.8);
 const committed=leftBrain.tacticGoal;leftBrain.lastKnown={x:5.5,y:5.5};leftBrain.tacticTimer=0;updateSmartEnemy(left,.02);assert.strictEqual(leftBrain.tacticGoal,committed,'holds flank rather than reevaluating while walking');assert(Number.isFinite(left.facing));
 // A guard with one round reloads proactively only when it actually arrives
 // at occluded cover; the route is traversed through normal collision movement.
 const cover53=open53.map((r,y)=>y===4?r.slice(0,6)+'1'+r.slice(7):r);arena53(cover53,9.5,4.5);let guard=actor53(5.5,2.5,1,1),brain=tracking53(guard);brain.think=0;guard.magazine=1;updateSmartEnemy(guard,.02);assert.equal(guard.aiIntent,'cover');assert.equal(guard.reloading,0);const hide=brain.tacticGoal;assert(hide&&!aiLine(hide,{x:9.5,y:4.5}));
 let reloadedInCover=false;for(let tick=0;tick<360&&!reloadedInCover;tick++){updateSmartEnemy(guard,.02);assert(!solidCircle(guard.x,guard.y,bodyRadius(guard)));if(guard.reloading>0){reloadedInCover=true;assert(Math.hypot(guard.x-hide.x,guard.y-hide.y)<.28);assert(!aiLine(guard,p));}}assert(reloadedInCover,'guard reaches cover and proactively reloads');assert.equal(guard.magazine,1);assert.equal(projectiles.length,0);
 // Isolated patrol is local; an opening guard and a heavy stay at their posts.
 arena53(open53,17.5,10.5);guard=actor53(3.5,4.5,1,1);heavy=actor53(3.5,7.5,2,2);let patrolled=false;for(let i=0;i<420;i++){updateSmartEnemy(guard,.02);updateSmartEnemy(heavy,.02);patrolled ||= guard.aiIntent==='patrol'&&guard.aiMoving;assert(Math.hypot(guard.x-3.5,guard.y-4.5)<2.12);assert(!solidCircle(guard.x,guard.y,bodyRadius(guard)));}assert(patrolled);assert.equal(heavy.x,3.5);assert.equal(heavy.y,7.5);assert.equal(heavy.aiIntent,'watch');
 // Search checks at most two nearby cells, with no new player position through a wall.
 const split53=open53.map((r,y)=>y>0&&y<12?r.slice(0,8)+'1'+r.slice(9):r);arena53(split53,12.5,7.5);guard=actor53(3.5,3.5,1,1);brain=aiBrain(guard);aiRemember(brain,3.5,3.5,9,++aiReportNumber);for(let tick=0;tick<340;tick++){p.x=12.5+(tick%3);updateSmartEnemy(guard,.02);assert.equal(brain.lastKnown.x,3.5);assert.equal(brain.lastKnown.y,3.5);assert.equal(projectiles.length,0);assert(Math.hypot(guard.x-3.5,guard.y-3.5)<2.8);}assert.equal(brain.searchChecked.length,2);assert.notDeepEqual(brain.searchChecked[0],brain.searchChecked[1]);
 // Old or repeated reports do not replace a newer snapshot or revive its timer.
 arena53(open53,10.5,5.5);const scout=actor53(6.5,5.5,1,1),recipient=actor53(4.5,5.5,2,1),sb=aiBrain(scout),rb=aiBrain(recipient);aiRemember(sb,9.5,5.5,4,++aiReportNumber);aiRemember(rb,10.5,5.5,2,++aiReportNumber);aiShareAlert(scout,sb);assert.equal(rb.lastKnown.x,10.5);sb.alertTimer=0;aiRemember(sb,8.5,5.5,7,++aiReportNumber);aiShareAlert(scout,sb);assert.equal(rb.lastKnown.x,8.5);rb.memory=1;sb.alertTimer=0;aiShareAlert(scout,sb);assert.equal(rb.memory,1);
 // The player can start each mission with the knife exactly as before.
 for(let i=0;i<15;i++){loadStage(i);playing=true;const first=enemies[0],x=first.x,y=first.y;for(let tick=0;tick<35;tick++)updateEnemy(first,.02);assert.equal(first.x,x);assert.equal(first.y,y);assert.equal(projectiles.length,0);fire();assert(first.hp<=0,'opening knife guard '+i);}
 `,c);
 console.log('PASS '+folder+': distinct guard roles, held decisions and reserved cells, local support, cover reload, bounded patrol/search, fresh reports, stationary knife opening in all 15 missions');
}
