'use strict';
/* HAVRAN: original, code-authored industrial architecture.
 * All dressing is baked into the existing static world buffer once per level.
 * No Valve geometry, images, typography or trademark artwork is embedded.
 * The wall landmarks project at most 0.11 units into free space; the player
 * capsule keeps its centre 0.17 units from walls. Overhead fittings stay above 1.40.
 */
const windowLightData=new Float32Array(16);
const ENVIRONMENT_DETAIL_BUDGET=36000;
const environmentGlyphs={
 '0':['01110','10001','10011','10101','11001','10001','01110'],
 '1':['00100','01100','00100','00100','00100','00100','01110'],
 '2':['01110','10001','00001','00010','00100','01000','11111'],
 '3':['11110','00001','00001','01110','00001','00001','11110'],
 '4':['00010','00110','01010','10010','11111','00010','00010'],
 '5':['11111','10000','10000','11110','00001','00001','11110'],
 '6':['01110','10000','10000','11110','10001','10001','01110'],
 '7':['11111','00001','00010','00100','01000','01000','01000'],
 '8':['01110','10001','10001','01110','10001','10001','01110'],
 '9':['01110','10001','10001','01111','00001','00001','01110'],
 'A':['01110','10001','10001','11111','10001','10001','10001'],
 'E':['11111','10000','10000','11110','10000','10000','11111'],
 'F':['11111','10000','10000','11110','10000','10000','10000'],
 'I':['01110','00100','00100','00100','00100','00100','01110'],
 'K':['10001','10010','10100','11000','10100','10010','10001'],
 'O':['01110','10001','10001','10001','10001','10001','01110'],
 'R':['11110','10001','10001','11110','10100','10010','10001'],
 'S':['01111','10000','10000','01110','00001','00001','11110'],
 'T':['11111','00100','00100','00100','00100','00100','00100'],
 'V':['10001','10001','10001','10001','10001','01010','00100'],
 'B':['11110','10001','10001','11110','10001','10001','11110'],
 'C':['01111','10000','10000','10000','10000','10000','01111'],
 'D':['11110','10001','10001','10001','10001','10001','11110'],
 'H':['10001','10001','10001','11111','10001','10001','10001'],
 'J':['00111','00010','00010','00010','00010','10010','01100'],
 'L':['10000','10000','10000','10000','10000','10000','11111'],
 'M':['10001','11011','10101','10101','10001','10001','10001'],
 'N':['10001','11001','11001','10101','10011','10011','10001'],
 'P':['11110','10001','10001','11110','10000','10000','10000'],
 'U':['10001','10001','10001','10001','10001','10001','01110'],
 'Y':['10001','10001','01010','00100','00100','00100','00100'],
 'Z':['11111','00001','00010','00100','01000','10000','11111'],
 '-':['00000','00000','00000','11111','00000','00000','00000'],
 ' ':['00000','00000','00000','00000','00000','00000','00000']
};
function environmentFaces(){
 const faces=[];
 for(let y=0;y<level.length;y++)for(let x=0;x<level[0].length;x++){
  if(level[y][x]!=='1')continue;
  for(const[dx,dz]of[[-1,0],[1,0],[0,-1],[0,1]])if(level[y+dz]?.[x+dx]==='0'){
   const cx=x+.5+dx*.501,cz=y+.5+dz*.501;
   faces.push({x,y,dx,dz,cx,cz,key:(x*31+y*17+dx*7+dz*13+chapterIndex*19)>>>0,near:Math.hypot(cx-stage.start.x,cz-stage.start.y)});
  }
 }
 // Dress the player's first view and room architecture before remote corridors.
 faces.sort((a,b)=>a.near-b.near||a.key-b.key);return faces;
}
function environmentWallTools(face){
 const{cx,cz,dx,dz}=face,tx=dz,tz=-dx,angle=Math.atan2(tz,tx);
 const at=(u,h,d=0)=>[cx+tx*u+dx*d,h,cz+tz*u+dz*d];
 return{
  at,
  box:(u,h,d,w,height,depth,col,glow=-4)=>box(...at(u,h,d),w,height,depth,col,angle,glow),
  pipe:(u0,h0,u1,h1,r,col,d=.03)=>cylinderBetween(at(u0,h0,d),at(u1,h1,d),r,col,-4),
  quad:(u0,h0,u1,h1,d,col,glow=.08)=>{
   const q=[at(u0,h0,d),at(u1,h0,d),at(u1,h1,d),at(u0,h1,d)];
   for(const i of[0,1,2,0,2,3])vertex(q[i],[dx,0,dz],col,glow);
  }
 };
}
function environmentLetters(t,text,centreY,cell,depth,col=[.77,.77,.64],glow=.22){
 const left=-(text.length*6-1)*cell/2;
 for(let c=0;c<text.length;c++){
  const glyph=environmentGlyphs[text[c]]||environmentGlyphs[' '];
  for(let row=0;row<7;row++)for(let k=0;k<5;){
   if(glyph[row][k]==='0'){k++;continue;}
   const start=k;while(k<5&&glyph[row][k]==='1')k++;
   const u=left+(c*6+start)*cell,v=centreY+(3.5-row)*cell;
   t.quad(u,v-cell*.96,u+(k-start-.09)*cell,v,depth,col,glow);
  }
 }
}
function environmentSign(face,text,centreY=1.20){
 const t=environmentWallTools(face),cell=.0115,width=(text.length*6-1)*cell;
 t.box(0,centreY,.018,Math.max(.47,width+.065),.16,.022,[.12,.18,.20]);
 t.box(-width/2-.025,centreY,.032,.012,.115,.008,[.63,.37,.12],.15);
 environmentLetters(t,text,centreY,cell,.033);
}
function environmentWindow(face){if(stage.visualWindows.length<4)stage.visualWindows.push([face.cx,face.cz,face.dx,face.dz]);
 const t=environmentWallTools(face),blue=[.17,.24,.255],trim=[.16,.18,.17],dust=[.36,.35,.28];
 // Sealed, wired glazing; it is visibly a wall fitting, never a false doorway.
 t.box(0,1.075,.008,.83,.62,.018,[.055,.09,.10]);
 for(const u of[-.262,0,.262])for(const h of[.925,1.205]){
  t.quad(u-.119,h-.124,u+.119,h+.124,.022,blue,.065);
  t.quad(u-.112,h+.080,u+.112,h+.117,.023,[.26,.34,.33],.085);
 }
 for(const u of[-.414,-.135,.135,.414])t.box(u,1.075,.030,.022,.65,.025,trim);
 for(const h of[.755,1.075,1.395])t.box(0,h,.030,.85,.020,.025,trim);
 t.box(0,.737,.026,.89,.045,.052,dust);
 // Embedded safety wire is sparse enough to read as one material at a distance.
 for(const u of[-.30,-.15,0,.15,.30])t.pipe(u,.79,u+.06,1.37,.0018,[.34,.40,.36],.026);
}
// These are shallow, noninteractive façades on actual solid walls. Concentrating
// the detail at two visible landmarks gives each sector a purpose and a silhouette.
const sectorArchitecture53={
 freight:['DEPO 01','NAKLAD 01','shutter',[.53,.36,.21]],
 transit:['TRAT 02','VYHYBKA','rail',[.27,.47,.53]],
 power:['ROZVODNA B','NAPAJENI','breakers',[.48,.41,.22]],
 archive:['ARCHIV','PALIMPSEST','files',[.42,.46,.34]],
 comms:['SPOJENI 05','VYSILAC','radio',[.40,.43,.58]],
 foundry:['SLEVAREN','PEC 06','furnace',[.57,.31,.19]],
 medical:['KLINIKA','PALIMPSEST','white',[.29,.55,.48]],
 cryo:['KRYOSKLAD','CHLAZENI','cryo',[.29,.52,.57]],
 drain:['CERPADLA','ODTOK 09','pump',[.26,.48,.42]],
 factory:['MONTAZ','LINKA 10','shutter',[.56,.38,.23]],
 server:['TREZOR','ZALOHA 11','servers',[.38,.47,.59]],
 mine:['SACHTA','ZACHRANA','rail',[.49,.36,.23]],
 containment:['SANITACE','UZAVER 13','white',[.47,.49,.31]],
 reactor:['REAKTOR','CHLAZENI','pump',[.54,.36,.24]],
 core:['ORFEUS','JADRO 15','core',[.44,.34,.53]]
};
function landmarkFaceKey53(x,y,dx,dz){return x+','+y+','+dx+','+dz}
function planIndustrialLandmarks53(faces=environmentFaces()){
 const entry=stage.roomZones?.[0],plans=[],claimed=new Set();
 const at=new Map(faces.map(f=>[landmarkFaceKey53(f.x,f.y,f.dx,f.dz),f]));
 function add(role,group){
  if(!group.length)return;
  const first=group[0],mean=k=>group.reduce((sum,f)=>sum+f[k],0)/group.length;
  for(const f of group)claimed.add(landmarkFaceKey53(f.x,f.y,f.dx,f.dz));
  plans.push({role,span:group.length,face:{...first,cx:mean('cx'),cz:mean('cz')}});
 }
 if(entry){
  const east=entry.x+entry.w,entryFaces=faces.filter(f=>f.x===east&&f.dx===-1&&f.y>=entry.y&&f.y<entry.y+entry.h);
  // Prefer the front wall patch directly beside the first open passage.
  const groups=entryFaces.map(f=>[f,at.get(landmarkFaceKey53(f.x,f.y+1,-1,0))].filter(g=>g&&g.y<entry.y+entry.h));
  groups.sort((a,b)=>b.length-a.length||Math.abs(a.reduce((s,f)=>s+f.cz,0)/a.length-stage.start.y)-Math.abs(b.reduce((s,f)=>s+f.cz,0)/b.length-stage.start.y));
  add('arrival',groups[0]||[]);
 }
 // Back wall behind the boss, clear of its start, exit, cover pillars and sights.
 const rear=level.length-1,bx=Math.floor(stage.bossSpawn.x);
 add('arena',[-1,0,1].map(dx=>at.get(landmarkFaceKey53(bx+dx,rear,0,-1))).filter(Boolean));
 stage.architecture53={plans,claimed};return plans;
}
function isLandmarkFace53(x,y,dx,dz){return !!stage.architecture53?.claimed.has(landmarkFaceKey53(x,y,dx,dz))}
function isLandmarkPainting53(painting){
 const nx=-Math.sin(painting.angle||0),nz=Math.cos(painting.angle||0);
 return !!stage.architecture53?.plans.some(({face,span})=>{
  const x=painting.x-face.cx,z=painting.y-face.cz;
  return nx*face.dx+nz*face.dz>.99&&Math.abs(x*face.dx+z*face.dz)<.11&&Math.abs(x*face.dz-z*face.dx)<span*.5+.36;
 });
}
function industrialLandmark53(plan){
 const style=sectorArchitecture53[chapter.theme]||sectorArchitecture53.freight,arena=plan.role==='arena';
 const [entryLabel,arenaLabel,shape,paint]=style,t=environmentWallTools(plan.face),w=plan.span-.09;
 const shell=[.17,.205,.205],trim=[.34,.37,.34],recess=[.073,.095,.092],bright=[.77,.77,.67];
 const signal=shape==='core'?[.55,.57,.75]:shape==='cryo'||shape==='white'?[.46,.67,.64]:[.70,.39,.16];
 const label=arena?arenaLabel:entryLabel,letter=Math.min(.020,w/(label.length*6+3));
 t.box(0,.80,.021,w,1.57,.040,shell);
 t.box(0,.68,.041,w-.12,1.14,.042,recess);
 for(const side of[-1,1]){
  t.box(side*(w/2-.047),.79,.059,.040,1.50,.054,trim);
  for(const h of[.14,1.28])t.quad(side*(w/2-.047)-.006,h-.006,side*(w/2-.047)+.006,h+.006,.088,[.63,.64,.58],.04);
 }
 t.box(0,1.40,.064,w-.070,.235,.040,paint);
 t.box(0,1.27,.067,w-.078,.025,.037,trim);
 t.box(0,1.513,.066,w-.080,.014,.035,bright);
 environmentLetters(t,label,1.418,letter,.088,bright,.28);
 const panel=(u,h,ww,hh,col=paint)=>t.box(u,h,.058,ww,hh,.036,col);
 const line=(u0,h0,u1,h1,r=.008,col=trim)=>t.pipe(u0,h0,u1,h1,r,col,.084);
 const decal=(u0,h0,u1,h1,col=bright,glow=.16)=>t.quad(u0,h0,u1,h1,.091,col,glow);
 const point=(u,h,d=.094)=>t.at(u,h,d);
 function disk(u,h,rx,ry,col,glow=.08,mask=0,d=.093){
  for(let i=0;i<16;i++){
   const a=i*Math.PI/8,b=(i+1)*Math.PI/8;
   const around=(theta,r)=>point(u+Math.cos(theta)*rx*r,h+Math.sin(theta)*ry*r,d);
   const p=around(a,1),q=around(b,1);
   const verts=mask?[p,q,around(a,mask),q,around(b,mask),around(a,mask)]:[point(u,h,d),q,p];
   for(const v of verts)vertex(v,[plan.face.dx,0,plan.face.dz],col,glow);
  }
 }
 if(shape==='shutter'){
  const span=w-.16;for(let i=0;i<16;i++){const h=.15+i*.066;panel(0,h,span,.056,i%4===0?trim:paint);decal(-span/2,h+.022,span/2,h+.027,[.47,.43,.36],.015);}
  for(const s of[-1,1]){panel(s*(span/2-.052),.65,.020,1.08,trim);decal(s*(span/2-.034)-.006,.21,s*(span/2-.034)+.006,1.11,signal,.10);}
  panel(0,.79,Math.min(span-.06,.86),.26,shell);
  environmentLetters(t,arena?'RAMPA':'UZAVRENO',.80,Math.min(.017,(span-.1)/49),.094,bright,.20);
 }else if(shape==='rail'||shape==='white'){
  const span=w-.18;panel(0,.72,span,.80,shape==='white'?[.49,.55,.48]:[.19,.28,.28]);
  if(shape==='white'){
   for(const s of[-1,1]){decal(s*span*.24-.075,.50,s*span*.24+.075,.95,[.29,.39,.34],.10);decal(s*span*.24-.021,.66,s*span*.24+.021,.81,bright,.24);decal(s*span*.24-.075,.71,s*span*.24+.075,.76,bright,.24);}
  }else{
   line(-span*.43,.82,span*.43,.82,.012,bright);line(-span*.10,.82,0,.58,.012,signal);line(0,.58,span*.44,.58,.012,signal);
   for(const u of[-.40,-.22,-.03,.18,.40])disk(u*span,.82,.021,.021,bright,.40);
   for(const u of[.08,.25,.40])disk(u*span,.58,.021,.021,signal,.42);
  }
  decal(-span*.35,.47,span*.35,.48,bright,.08);
  environmentLetters(t,shape==='white'?'VSTUP':'SMER',.38,Math.min(.013,span/33),.094,bright,.30);
 }else if(shape==='radio'){
  const span=w-.18,screen=span*.29;
  panel(0,.70,span,1.02,paint);
  panel(-span*.18,.80,screen*1.8,.48,shell);
  decal(-span*.18-screen*.85,.59,-span*.18+screen*.85,1.01,[.075,.135,.15],.05);
  for(const h of[.65,.74,.83,.92])decal(-span*.41,h,span*.047,h+.003,[.16,.30,.33],.09);
  const signalTrace=[.76,.77,.75,.88,.70,.81,.75,.76,.86,.73,.78,.79];
  for(let i=1;i<signalTrace.length;i++)line(-span*.40+(i-1)*span*.039,signalTrace[i-1],-span*.40+i*span*.039,signalTrace[i],.004,[.43,.78,.71]);
  for(const h of[.55,.78,1.01]){
   disk(span*.294,h,.065,.065,trim);
   disk(span*.294,h,.046,.046,recess);
   decal(span*.289,h+.010,span*.299,h+.036,bright,.32);
   if(h!==.55)disk(span*.414,h,.019,.019,signal,.51);
  }
  environmentLetters(t,arena?'LINKA A':'VEKTOR',.34,Math.min(.024,span/39),.093,bright,.23);
 }else if(shape==='files'||shape==='servers'||shape==='breakers'||shape==='cryo'){
  const n=plan.span*2,wide=(w-.18)/n,panelTone=shape==='cryo'?[.25,.35,.37]:paint;
  for(let i=0;i<n;i++){
   const u=(i-(n-1)/2)*wide;
   panel(u,.69,wide-.018,1.05,panelTone);
   if(shape==='cryo'){
    decal(u-wide*.35,.35,u+wide*.35,1.05,[.12,.24,.27],.07);
    decal(u-wide*.30,.38,u-wide*.23,1.01,[.49,.68,.67],.23);
    decal(u+wide*.23,.42,u+wide*.28,.95,[.32,.50,.53],.26);
   }else for(const h of[.28,.48,.68,.88,1.08]){
    decal(u-wide*.37,h-.056,u+wide*.36,h+.056,recess,.01);
    decal(u+wide*.24,h-.016,u+wide*.29,h+.016,signal,.48);
    if(shape!=='files')for(let j=-1;j<=1;j++)decal(u-wide*.31,h+j*.021,u+wide*.11,h+j*.021+.007,trim,.07);
   }
   decal(u-wide*.19,.205,u+wide*.19,.22,bright,.12);
  }
 }else{
  const span=w-.19,r=Math.min(.38,span*.33),count=plan.span===3?3:plan.span;
  panel(0,.69,span,1.03,paint);
  for(let i=0;i<count;i++){
   const u=(i-(count-1)/2)*span/count,h=.71;
   panel(u,.69,span/count-.08,.92,shell);
   disk(u,h,r,r*.87,recess,.08,0,.087);disk(u,h,r,r*.87,trim,.10,.90,.093);
   if(shape==='core'){
    disk(u,h,r*.73,r*.65,signal,.45,.85);disk(u,h,r*.47,r*.42,[.32,.62,.68],.50,.75);
    decal(u-r*.12,h-r*.08,u+r*.12,h+r*.08,[.48,.79,.78],.55);
   }else if(shape==='furnace'){
    disk(u,h,r*.76,r*.65,[.59,.275,.10],.37,.83);
    for(let j=-2;j<=2;j++)decal(u+j*r*.20-.007,h-r*.40,u+j*r*.20+.007,h+r*.40,[.48,.24,.12],.17);
   }else{
    // Two crossbars and a circular gauge plate evoke a large pump face.
    disk(u,h,r*.62,r*.55,paint,.12,.77);decal(u-r*.62,h-r*.052,u+r*.62,h+r*.052,trim,.12);
    decal(u-r*.055,h-r*.53,u+r*.055,h+r*.53,trim,.12);
   }
  }
 }
}
function addIndustrialDetail(){
 stage.visualWindows=[];windowLightData.fill(0);
 const before=vertexData.length,limit=ENVIRONMENT_DETAIL_BUDGET,faces=environmentFaces();const wayfinding=architecturalWayfinding52();
 const landmarks=planIndustrialLandmarks53(faces);
 for(const landmark of landmarks)industrialLandmark53(landmark);
 let windows=0,signs=0,conduits=0,pilasters=0;
 const within=()=>vertexData.length/10-before/10<limit-1700;
 const worn=[.25,.27,.25],rust=[.24,.15,.085],bracket=[.12,.15,.15];
 for(const f of faces){
  if(!within())break;
  if(isLandmarkFace53(f.x,f.y,f.dx,f.dz))continue;
  const t=environmentWallTools(f),firstBay=f.near<4.5;
  if(windows<10&&((firstBay&&f.key%9===0)||f.key%43===0)&&f.key%4!==0){environmentWindow(f);windows++;continue;}
  if(signs<12&&((firstBay&&signs<2)||f.key%37===0)){
   environmentSign(f,signs%3===0?'VEKTOR':signs%3===1?'SEKTOR '+String(chapterIndex+1).padStart(2,'0'):'ORFEUS');signs++;continue;
  }
  if(f.key%4===0&&pilasters<64){
   t.box(-.462,.81,.014,.060,1.52,.030,[.24,.25,.22]);
   t.box(-.462,.095,.026,.090,.065,.046,worn);
   t.box(-.462,1.535,.025,.100,.060,.046,worn);pilasters++;
  }
  if(f.key%5===0&&conduits<70){
   t.pipe(-.48,1.465,.48,1.465,.018,rust);
   t.pipe(-.48,1.525,.48,1.525,.010,[.14,.18,.18]);
   for(const u of[-.33,.33])t.box(u,1.470,.027,.025,.100,.045,bracket);
   if(f.key%3===0){t.pipe(.28,1.465,.28,1.14,.015,rust);t.box(.28,1.11,.025,.10,.13,.037,worn);}
   conduits++;
  }
 }
 // Room-sized ceiling members replace the sense of a uniformly tiled box.
 for(const r of stage.rooms){
  if(!within())break;
  const x=r.x+.5,z=r.y+.5;
  for(const offset of[-1.05,1.05]){
   box(x,1.61,z+offset,3.15,.075,.065,[.14,.18,.18],0,-4);
   box(x,1.655,z+offset,3.18,.025,.13,[.23,.26,.24],0,-4);
   for(const dx of[-1.45,1.45])box(x+dx,1.54,z+offset,.045,.16,.13,[.13,.15,.14],0,-4);
  }
 }
 surfaceMaterial=0;
 stage.environmentDetail={vertices:(vertexData.length-before)/10,windows,signs,conduits,pilasters,wayfinding,landmarks:landmarks.length};for(let i=0;i<stage.visualWindows.length;i++)windowLightData.set(stage.visualWindows[i],i*4);
}
