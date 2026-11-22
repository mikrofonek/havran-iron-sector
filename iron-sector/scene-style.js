'use strict';
// Small, original architectural additions are baked into the static world mesh.
// Emit only wall faces bordering walkable cells. Hidden solid/solid faces cost no vertices.
function exposedWall(x,y,col,height=1.68){
 const faces=[[-1,0,[[x,0,y+1],[x,0,y],[x,height,y],[x,height,y+1]]],[1,0,[[x+1,0,y],[x+1,0,y+1],[x+1,height,y+1],[x+1,height,y]]],[0,-1,[[x,0,y],[x+1,0,y],[x+1,height,y],[x,height,y]]],[0,1,[[x+1,0,y+1],[x,0,y+1],[x,height,y+1],[x+1,height,y+1]]]];
 for(const[dx,dz,pts]of faces){if(level[y+dz]?.[x+dx]!=='0')continue;
  const emit=(low,high,mat,color)=>{surfaceMaterial=mat;const q=pts.map(v=>[v[0],v[1]>0?high:low,v[2]]);for(const i of[0,1,2,0,2,3])vertex(q[i],[dx,0,dz],color);};
  const lower=['power','server','medical','cryo','core'].includes(chapter.theme)?4:6;emit(0,.62,lower,col);emit(.62,height,chapter.theme==='mine'?11:5,roomPaint52(x+.5+dx,y+.5+dz));emit(.61,.65,4,[.18,.22,.20]);emit(.02,.08,4,[.13,.16,.15]);
 }
 surfaceMaterial=0;
}
function roomAt52(x,z){return(stage.roomZones||[]).find(r=>x>=r.x&&x<r.x+r.w&&z>=r.y&&z<r.y+r.h)}
function roomPaint52(x,z){const r=roomAt52(x,z),palettes=[[[.53,.61,.57],[.69,.66,.56],[.42,.53,.57]],[[.52,.58,.61],[.61,.62,.53],[.42,.55,.50]],[[.60,.57,.50],[.46,.57,.55],[.61,.61,.56]]],palette=palettes[chapterIndex%3];return palette[r?.id??2]||palette[2]}
function roomLighting52(){
 const zones=stage.roomZones||[],lights=[];
 for(const r of zones)lights.push([r.x+r.w/2,1.39,r.y+r.h/2]);
 for(const d of(stage.wayfinding||[]).slice(0,2))lights.push([d.x,1.39,d.y]);
 const arrival=stage.architecture53?.plans.find(plan=>plan.role==='arrival')?.face;
 if(arrival)lights.push([arrival.cx+arrival.dx*1.05,1.39,arrival.cz+arrival.dz*1.05]);
 else for(const r of zones.slice(1,2))lights.push([r.x+r.w*.72,1.39,r.y+r.h*.72]);
 lights.push([stage.bossSpawn.x,1.39,level.length-2.8],[23.5,1.33,31.5]);
 while(lights.length<8)lights.push([stage.terminal.x,1.39,stage.terminal.y]);
 return lights.slice(0,8);
}
function architecturalWayfinding52(){
 let frames=0,arrows=0;const color=[.16,.23,.23],edge=[.49,.54,.49],amber=[.68,.45,.20];
 function slab(x,h,z,w,hh,d,col,glow=0){box(x,h,z,w,hh,d,col,0,glow||-4)}
 for(const door of(stage.wayfinding||[])){
  const across=door.axis==='x'?[0,1]:[1,0],half=(door.width||2)/2;
  // Stiles sit over the solid jambs; the opening and headroom remain clear.
  for(const side of[-1,1]){const x=door.x+across[0]*side*(half+.045),z=door.y+across[1]*side*(half+.045);slab(x,.80,z,door.axis==='x'?.16:.09,1.60,door.axis==='x'?.09:.16,color);slab(x,1.24,z,door.axis==='x'?.17:.026,.32,door.axis==='x'?.026:.17,amber);}
  slab(door.x,1.645,door.y,door.axis==='x'?.20:(door.width||2)+.19,.075,door.axis==='x'?(door.width||2)+.19:.20,edge);
  slab(door.x,1.585,door.y,door.axis==='x'?.12:(door.width||2)-.25,.018,door.axis==='x'?(door.width||2)-.25:.12,[.88,.77,.53],.45);
  // A small painted chevron on the threshold is a permanent building sign,
  // distinct from the opt-in route dots. It never shows a route through walls.
  const axis=door.axis==='x'?[door.direction||1,0]:[0,door.direction||1],side=[-axis[1],axis[0]],cx=door.x-axis[0]*.72,cz=door.y-axis[1]*.72;
  for(const sign of[-1,1]){const a=[cx-axis[0]*.07+side[0]*sign*.13,.008,cz-axis[1]*.07+side[1]*sign*.13],b=[cx+axis[0]*.07,.008,cz+axis[1]*.07],u=b[0]-a[0],v=b[2]-a[2],len=Math.hypot(u,v),nx=-v/len*.014,nz=u/len*.014,q=[[a[0]+nx,.008,a[2]+nz],[b[0]+nx,.008,b[2]+nz],[b[0]-nx,.008,b[2]-nz],[a[0]-nx,.008,a[2]-nz]];for(const i of[0,1,2,0,2,3])vertex(q[i],[0,1,0],[.61,.55,.36],0)}frames++;arrows++;
 }
 // Horizontal room numbers are built from existing bitmap glyph geometry.
 for(const r of(stage.roomZones||[])){
  const door=(stage.wayfinding||[]).find(d=>d.to===r.id);if(!door)continue;
  const candidates=environmentFaces().filter(f=>Math.hypot(f.cx-door.x,f.cz-door.y)<2.2&&f.cz>=r.y-.1&&f.cz<=r.y+r.h+.1&&f.cx>=r.x-.1&&f.cx<=r.x+r.w+.1);
  const face=candidates.find(f=>Math.abs((f.cx-door.x)*(door.axis==='x'?1:0)+(f.cz-door.y)*(door.axis==='y'?1:0))<1.1)||candidates[0];if(face)environmentSign(face,'0'+(r.id+1),1.20);
 }
 return{frames,arrows};
}
function drawNavigationDots52(){if(!navigationOn||!playing)return;const path=navigationPath();for(let i=2;i<Math.min(path.length,9);i+=3){const q=path[i];sphere(q.x,.014,q.y,.012,.003,.012,[.29,.51,.53],.10)}}
// Impact cues use small drops/sparks instead of bright floating cubes.
function drawImpactParticle52(q){
 if(q.shell){cylinder(q.x,q.z,q.y,.006,.021,q.c,q.t>0.6?.08:0);return}
 const previous=surfaceMaterial;surfaceMaterial=0;
 try{
  if(q.c[0]>.35&&q.c[1]<.28&&q.c[2]<.20){sphere(q.x,q.z,q.y,.0045,.007,.0045,[.26,.036,.019],0);}
  else{const length=Math.hypot(q.vx,q.vy,q.vz)||1,s=.032/length;cylinderBetween([q.x-q.vx*s,q.z-q.vz*s,q.y-q.vy*s],[q.x,q.z,q.y],.0018,[.65,.38,.13],.28);}
 }finally{surfaceMaterial=previous}
}
