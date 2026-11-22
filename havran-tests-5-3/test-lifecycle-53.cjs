const vm = require('node:vm');
const {boot} = require('./test-graphics-53.cjs');

let failed = 0;
for (const edition of ['iron-sector', 'havran-apple-silicon']) {
 const {c} = boot(edition);
 const cases = [
  ['a lethal round cannot trigger gold or medkit pickups', `
   loadStage(0);playing=true;armor=0;hp=2;enemies=[];
   const med={x:p.x,y:p.y,type:'med',taken:false};
   const gold={x:p.x,y:p.y,type:'gold',id:'death-frame',taken:false};
   items=[med,gold];projectiles=[{x:p.x,y:p.y,z:.7,vx:0,vy:0,vz:0,t:1,power:10}];
   update(.025);
   assert.equal(mode,'dead');
   assert.equal(hp,0,'no revival behind the death menu');
   assert(!med.taken&&!gold.taken,'no post-death item pickups');
   assert(!progress.claimed.includes('death-frame'));
  `],
  ['restart clears previous mission radio', `
   loadStage(0);radioMessage('old encounter');loadStage(1);
   assert.equal(radioTimer,0);
   assert.equal(document.querySelector('#radio').textContent,'');
   assert.equal(document.querySelector('#radio').style.opacity,'0');
  `],
  ['finishing requires an actual defeated boss', `
   loadStage(0);playing=true;missionInventory=stage.questItems.map(q=>({...q}));
   objectiveDone=true;enemies=[];
   finish(true);
   assert(playing&&!won,'missing boss is not a completed objective');
  `],
 ];
 for (const [name,source] of cases) {
  try { vm.runInContext('(()=>{'+source+'})()',c); }
  catch (error) { console.error(edition,name,error.message);failed++; }
 }
}
if(failed)process.exitCode=1;
else console.log('PASS both variants: death update abort, radio restart, boss completion guards');
