'use strict';
// Telegraphs have shape as well as color, and use the existing depth-tested mesh.
function drawBossCue53(e){
 const b=e?.bossAI;if(!b||e.hp<=0||b.state!=='telegraph')return;
 const aim=b.aim,c=Math.cos(aim),s=Math.sin(aim),danger=[.92,.40,.14];
 const prev=surfaceMaterial;surfaceMaterial=0;
 const dash=(x,z,a,length,width,col,glow)=>box(x,.018,z,length,.005,width,col,a,glow);
 try{
  if(b.attack==='charge'||b.attack==='precision'){
   const limit=b.attack==='charge'?3.15:10,spacing=b.attack==='charge'?.29:.49,w=b.attack==='charge'?.13:.033;
   for(let d=.27;d<limit;d+=spacing){const x=e.x+c*d,z=e.y+s*d;if(wall(x,z,.10))break;dash(x,z,aim,spacing*.57,w,danger,.24);}
  }else{
   const n=12,r=b.attack==='shield-burst'?.68:.46;
   for(let i=0;i<n;i++){const a=i*Math.PI*2/n,x=e.x+Math.cos(a)*r,z=e.y+Math.sin(a)*r;if(!wall(x,z,.06))dash(x,z,a+Math.PI/2,.09,.032,danger,.23);}
  }
 }finally{surfaceMaterial=prev;}
}
function drawBossStatus53(e,w){
 const b=e?.bossAI;if(!b||e.hp<=0||!objectiveDone)return;
 const width=Math.min(460,w*.66),x=(w-width)/2,label=b.state==='telegraph'?BOSS_PATTERNS53[b.attack].label:b.state==='recover'?'ODKRYTÝ':b.state==='waiting'?'VSTUP DO ARÉNY':b.state==='attack'?'ÚTOK':'MĚNÍ POZICI';
 const color=b.state==='recover'?'#99dace':b.state==='telegraph'?'#f3b566':'#9ab5c4';
 ctx.fillStyle='#071016e8';ctx.fillRect(x,24,width,48);
 ctx.font='bold 11px monospace';ctx.fillStyle='#e4e9e6';ctx.textAlign='left';ctx.fillText(chapter.boss,x+11,40);
 ctx.textAlign='right';ctx.fillStyle='#adc3cc';ctx.fillText('FÁZE '+b.phase+' / 2',x+width-11,40);
 ctx.fillStyle='#44302b';ctx.fillRect(x+11,47,width-22,4);
 ctx.fillStyle=e.shield?'#62d4ed':'#d18459';ctx.fillRect(x+11,47,(width-22)*Math.max(0,Math.min(1,e.hp/e.maxHp)),4);
 ctx.font='9px monospace';ctx.fillStyle=color;ctx.fillText(label,x+width-11,64);
 if(b.state==='telegraph'||b.state==='recover'){ctx.fillRect(x+11,62,Math.min(width*.26,78)*b.timer/Math.max(.01,b.duration),2)}
 ctx.textAlign='left';
}
