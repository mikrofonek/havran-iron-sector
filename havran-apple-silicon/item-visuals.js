'use strict';
function drawExpeditionItem(o){
 const lift=.04+Math.sin(time*2+o.x)*.012;
 if(o.type==='weapon'){const w=weapons[o.weaponType],model=w.model??o.weaponType,long=![0,7,8,9].includes(o.weaponType),len=long?.48:.25;bevelBox(o.x,.10+lift,o.y,.07,.07,len,[.19,.23,.24],.4);bevelBox(o.x,.065+lift,o.y-.08,.06,.10,.06,[.21,.13,.075],.4);cylinder(o.x+.11,.12+lift,o.y+.15,.014,long?.27:.09,[.4,.44,.43],.4);box(o.x,.015,o.y,.6,.008,.55,[.15,.23,.22],0,.16);return true}
 if(o.type==='quest'){
  const ordinal=Number((o.id||'').split('-').at(-1))%3;
  if(ordinal===0){bevelBox(o.x,.055+lift,o.y,.17,.025,.12,[.19,.23,.23]);box(o.x,.070+lift,o.y,.15,.005,.10,[.77,.73,.57]);box(o.x-.042,.075+lift,o.y,.038,.004,.063,[.19,.35,.36]);for(let i=0;i<3;i++)box(o.x+.025,.075+lift,o.y-.023+i*.019,.056,.003,.006,[.16,.20,.19]);}
  else if(ordinal===1){bevelBox(o.x,.052+lift,o.y,.25,.035,.18,[.44,.30,.15]);box(o.x-.012,.073+lift,o.y-.004,.21,.009,.15,[.74,.72,.64]);box(o.x-.072,.081+lift,o.y-.008,.032,.004,.13,[.38,.16,.10]);for(let i=0;i<4;i++)box(o.x+.02,.080+lift,o.y-.043+i*.026,.11,.003,.005,[.24,.27,.25]);}
  else{bevelBox(o.x,.080+lift,o.y,.18,.085,.13,[.19,.25,.24]);box(o.x,.127+lift,o.y,.13,.008,.085,[.36,.43,.37]);for(let i=0;i<4;i++)box(o.x-.054+i*.036,.08+lift,o.y+.07,.012,.035,.016,[.54,.45,.24]);box(o.x+.045,.134+lift,o.y-.015,.015,.006,.014,[.32,.62,.38],0,.16);}
  return true;
 }return false;
}
