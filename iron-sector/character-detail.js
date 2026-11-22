'use strict';
// Original HAVRAN procedural character meshes. No Valve/third-party geometry or textures.
// Adult proportions: a tapered jacket, articulated sleeves/trousers, and a shaped jaw/skull.
// Kept within the v5 hit volumes; custom lofts avoid the previous overlapping sphere joints.
function enemyRenderAngle(e){if(Number.isFinite(e.facing))return e.facing-Math.PI/2;const target=e.boss||e.brain?.visible?p:e.brain?.lastKnown;if(target)return Math.atan2(target.y-e.y,target.x-e.x)-Math.PI/2;return(e.phase||0)*.37-Math.PI/2}
const characterDetailCircle=Array.from({length:13},(_,i)=>{const a=i*Math.PI/6;return[Math.cos(a),Math.sin(a)]});
const bossDetailProfiles=Object.freeze({
 gunner:{coat:[.195,.114,.076],plate:[.28,.168,.101],accent:[.82,.47,.23],shoulders:1.10,attack:'volley'},
 charger:{coat:[.150,.162,.135],plate:[.36,.32,.19],accent:[.83,.59,.25],shoulders:1.17,attack:'charge'},
 warden:{coat:[.105,.149,.165],plate:[.233,.337,.372],accent:[.41,.75,.78],shoulders:1.12,attack:'shield-burst'},
 sniper:{coat:[.202,.205,.189],plate:[.31,.32,.29],accent:[.64,.74,.66],shoulders:.88,attack:'precision'},
 summoner:{coat:[.176,.132,.191],plate:[.257,.224,.294],accent:[.68,.49,.74],shoulders:1,attack:'reinforce'},
 overseer:{coat:[.130,.128,.145],plate:[.277,.280,.31],accent:[.76,.55,.82],shoulders:1.06,attack:'volley'}
});
const bossDetailTells=Object.freeze({volley:[.87,.43,.18],charge:[.88,.26,.12],'shield-burst':[.31,.69,.86],reinforce:[.63,.39,.80],precision:[.63,.79,.73]});
const neutralCharacterPose=Object.freeze({lean:0,sink:0,stance:0,lift:0,support:0,key:'neutral'});
function bossDetailKind(e){return Object.hasOwn(bossDetailProfiles,e.kind)?e.kind:'gunner'}
function bossTellMounts(kind){return [kind==='sniper'?.086:.13,kind==='warden'?.137:.104]}
function characterScale(e){const role=e.role||0;return (e.boss?1.12:role===2?1.07:role===0?.96:1)*.8}
function bossDetailPose(e){
 const b=e.bossAI;
 if(!e.boss||e._detailUnarmed||!b)return neutralCharacterPose;
 const state=b.state,attack=Object.hasOwn(bossDetailTells,b.attack)?b.attack:bossDetailProfiles[bossDetailKind(e)].attack;
 if(state==='recover')return {lean:.20,sink:.053,stance:.009,lift:-.17,support:0,key:'recover'};
 if(state==='waiting')return {lean:.025,sink:0,stance:0,lift:-.085,support:0,key:'waiting'};
 if(state==='reposition')return {lean:.08,sink:.016,stance:.005,lift:-.06,support:0,key:'reposition'};
 if(state!=='telegraph'&&state!=='attack')return neutralCharacterPose;
 const active=state==='attack',key=state+'/'+attack;
 if(attack==='charge')return {lean:active?.35:.27,sink:active?.047:.07,stance:.036,lift:-.09,support:0,key};
 if(attack==='shield-burst')return {lean:active?.11:-.07,sink:.024,stance:.02,lift:active?.02:-.057,support:active?0:1,key};
 if(attack==='reinforce')return {lean:-.085,sink:0,stance:.008,lift:-.09,support:2,key};
 if(attack==='precision')return {lean:.055,sink:.015,stance:.008,lift:.08,support:0,key};
 return {lean:active?.105:.025,sink:.024,stance:.026,lift:active?.015:.045,support:0,key};
}
function posedCharacterPoint(pose,x,y,z){const cs=Math.cos(pose.lean),sn=Math.sin(pose.lean),dy=y-.50;return [x,.50-pose.sink+dy*cs-z*sn,dy*sn+z*cs]}
function characterStrideIndex(e){
 const speed=Number.isFinite(e.moveSpeed)?e.moveSpeed:(e.boss&&Math.hypot(p.x-e.x,p.y-e.y)>2.4?.6:0);
 if(!playing||speed<=.03)return 0;
 const amplitude=e.boss?Math.min(1,speed/.55):1;
 return Math.round(Math.sin(time*(e.rush>0||speed>1.5?14:7)+(e.phase||0))*4*amplitude);
}
function buildDetailedEnemyModel(e){
 const role=e.role||0,scale=characterScale(e),kind=e.boss?bossDetailKind(e):'',profile=bossDetailProfiles[kind],pose=e._detailPose??bossDetailPose(e),upperBase=vertexData.length;
 const angle=e._detailLocal?0:enemyRenderAngle(e),c=Math.cos(angle),s=Math.sin(angle);
 const wardrobe=[[.28,.173,.104],[.138,.203,.246],[.213,.247,.159],[.303,.275,.207]];
 let coat=profile?.coat||wardrobe[role]||wardrobe[0],trousers=role===2?[.12,.145,.10]:[.095,.11,.125];
 const skinTones=[[.47,.32,.235],[.29,.195,.14],[.60,.435,.32],[.43,.29,.21]],skin=skinTones[Math.abs(e.id||0)%4],hair=(e.id||0)%3===0?[.24,.19,.135]:[.065,.055,.045];
 if(e.hit)coat=coat.map((v,i)=>v+(i===0?.14:.035));
 const lining=[.13,.12,.105],boots=[.055,.050,.043],gloves=[.075,.075,.063],gun=[.12,.145,.15],steel=[.34,.38,.38];
 const stride=e._detailStride??characterStrideIndex(e)*.013,recoil=e._detailRecoil??(e.attack>0?.018:0),shoulders=profile?.shoulders??(role===2?1.08:role===3?.92:1);
 function pt(v){return[e.x+(v[0]*c-v[2]*s)*scale,v[1]*scale,e.y+(v[0]*s+v[2]*c)*scale]}
 function normal(v){return[v[0]*c-v[2]*s,v[1],v[0]*s+v[2]*c]}
 function bendUpper(start){if(!pose.lean&&!pose.sink)return;const cs=Math.cos(pose.lean),sn=Math.sin(pose.lean),pivot=.50*scale;
  for(let i=start;i<vertexData.length;i+=10){const x=vertexData[i]-e.x,z=vertexData[i+2]-e.y,localZ=-x*s+z*c,y=vertexData[i+1]-pivot,offset=y*sn+localZ*(cs-1);vertexData[i]-=offset*s;vertexData[i+1]=pivot-pose.sink*scale+y*cs-localZ*sn;vertexData[i+2]+=offset*c;
   const nz=-vertexData[i+3]*s+vertexData[i+5]*c,ny=vertexData[i+4],normalOffset=ny*sn+nz*(cs-1);vertexData[i+3]-=normalOffset*s;vertexData[i+4]=ny*cs-nz*sn;vertexData[i+5]+=normalOffset*c;
  }
 }
 function tri(a,b,cc,col,mat=0){surfaceMaterial=mat;const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[cc[0]-a[0],cc[1]-a[1],cc[2]-a[2]],n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1,nn=normal(n.map(q=>q/l));for(const q of[a,b,cc])vertex(pt(q),nn,col);surfaceMaterial=0}
 function part(x,y,z,w,h,d,col,mat=0){surfaceMaterial=mat;const emit=Math.min(w,h,d)<.020?box:bevelBox;emit(...pt([x,y,z]),w*scale,h*scale,d*scale,col,angle);surfaceMaterial=0}
 // Twelve-sided tapered sleeves and trouser legs with smooth normals.
 function limb(a,b,ra,rb,col,mat=2){let nx=b[0]-a[0],ny=b[1]-a[1],nz=b[2]-a[2],len=Math.hypot(nx,ny,nz);if(len<1e-6)return;nx/=len;ny/=len;nz/=len;let ux,uy,uz;if(Math.abs(ny)<.9){ux=-nz;uy=0;uz=nx}else{ux=0;uy=nz;uz=-ny}const ul=Math.hypot(ux,uy,uz)||1;ux/=ul;uy/=ul;uz/=ul;const vx=ny*uz-nz*uy,vy=nz*ux-nx*uz,vz=nx*uy-ny*ux;surfaceMaterial=mat;
  for(let i=0;i<12;i++){const q=characterDetailCircle[i],r=characterDetailCircle[i+1],n1=[ux*q[0]+vx*q[1],uy*q[0]+vy*q[1],uz*q[0]+vz*q[1]],n2=[ux*r[0]+vx*r[1],uy*r[0]+vy*r[1],uz*r[0]+vz*r[1]],aa=a.map((v,k)=>v+n1[k]*ra),bb=b.map((v,k)=>v+n1[k]*rb),cc=b.map((v,k)=>v+n2[k]*rb),dd=a.map((v,k)=>v+n2[k]*ra);for(const[v,n]of[[aa,n1],[bb,n1],[cc,n2],[aa,n1],[cc,n2],[dd,n2]])vertex(pt(v),normal(n),col);}
  surfaceMaterial=0;
 }
 // Tailored octagonal cross sections; chest tapers to the belt instead of forming a ball.
 function jacket(){const layers=[[.505,.116,.066],[.56,.125,.070],[.71,.153*shoulders,.080],[.82,.165*shoulders,.075],[.875,.092,.062]],ring=(layer)=>{const[y,w,d]=layer;return[[-w*.7,y,-d],[w*.7,y,-d],[w,y,-d*.6],[w,y,d*.6],[w*.7,y,d],[-w*.7,y,d],[-w,y,d*.6],[-w,y,-d*.6]]};for(let j=0;j<layers.length-1;j++){const a=ring(layers[j]),b=ring(layers[j+1]);for(let i=0;i<8;i++){const k=(i+1)%8;tri(a[i],b[k],a[k],coat,1);tri(a[i],b[i],b[k],coat,1)}}}
 jacket();
 // The open shirt, lapels and seams give a continuous garment silhouette.
 part(0,.745,.081,.067,.245,.012,role===2?[.15,.17,.12]:[.265,.255,.22],2);
 for(const side of[-1,1]){tri([side*.018,.855,.081],side>0?[side*.045,.728,.086]:[side*.105,.836,.067],side>0?[side*.105,.836,.067]:[side*.045,.728,.086],lining,1);part(side*.086,.690,.084,.067,.070,.015,coat,1);part(side*.086,.730,.089,.072,.012,.013,lining,1);}
 part(0,.525,.004,.244,.027,.143,[.065,.060,.050],1);part(0,.525,.078,.035,.025,.008,[.48,.43,.30]);
 // Neck sits inside the collar, with a visible jaw rather than cheek/nose spheres.
 limb([0,.866,0],[0,.956,.005],.037,.034,skin,3);
 const headRings=[[.945,.038,.038,.017],[.961,.052,.049,.008],[.994,.063,.061,.001],[1.045,.066,.063,-.003],[1.089,.051,.052,-.008],[1.115,.012,.015,-.010]];
 surfaceMaterial=3;
 for(let j=0;j<headRings.length-1;j++)for(let i=0;i<12;i++){const make=(ring,step)=>{const[y,rx,rz,z0]=ring,[co,si]=characterDetailCircle[step];const pos=[co*rx,y,z0+si*rz],nn=[pos[0]/(.067*.067),(pos[1]-1.029)/(.09*.09),(pos[2]+.002)/(.065*.065)],l=Math.hypot(...nn)||1;return[pos,nn.map(v=>v/l)]},aa=make(headRings[j],i),bb=make(headRings[j],i+1),cc=make(headRings[j+1],i+1),dd=make(headRings[j+1],i);for(const[v,n]of[aa,bb,cc,aa,cc,dd])vertex(pt(v),normal(n),skin);}
 surfaceMaterial=0;
 // Hair cap has a higher front hairline and lower back; no oversized helmet-shaped sphere.
 for(let i=0;i<12;i++){const [ax,az]=characterDetailCircle[i],[bx,bz]=characterDetailCircle[i+1],ay=az>.3?1.074:1.045,by=bz>.3?1.074:1.045;tri([ax*.067,ay,-.007+az*.064],[0,1.119,-.009],[bx*.067,by,-.007+bz*.064],hair,2);}
 function headShell(lo,hi,width,depth,col,mat=2){const roof=[0,hi,-.019],start=2.35,arc=4.73;
  for(let i=0;i<8;i++){const a=start+arc*i/8,b=start+arc*(i+1)/8;
   const ring=(ang,y,s)=>[Math.cos(ang)*width*s,y,-.012+Math.sin(ang)*depth*s],u=ring(a,lo,1),v=ring(b,lo,1),w=ring(b,hi-.027,.78),q=ring(a,hi-.027,.78);
   tri(u,q,w,col,mat);tri(u,w,v,col,mat);tri(q,roof,w,col,mat);
  }
 }
 // Small anatomical landmarks: ears, nose wedge, inset eyelids and lips.
 for(const side of[-1,1]){part(side*.065,1.010,-.001,.014,.036,.024,skin,3);part(side*.027,1.035,.061,.025,.008,.005,[.15,.125,.10]);part(side*.027,1.039,.063,.023,.005,.004,[.46,.44,.36]);part(side*.028,1.038,.066,.006,.005,.003,[.065,.075,.07]);part(side*.027,1.051,.058,.031,.004,.006,hair);}
 tri([-.011,1.038,.060],[0,1.002,.081],[.011,1.038,.060],skin,3);tri([-.011,1.038,.060],[-.011,1.002,.064],[0,1.002,.081],skin.map(v=>v*.83),3);tri([.011,1.038,.060],[0,1.002,.081],[.011,1.002,.064],skin.map(v=>v*.91),3);
 part(0,.980,.062,.030,.004,.006,[.27,.16,.12]);part(0,.970,.057,.026,.004,.004,skin.map(v=>v*.86),3);
 // Readable large shapes: jacket and harness, blue patrol cap, olive helmet,
 // and a sand hood. Bosses keep a common industrial language but use distinct equipment.
 if(!e.boss&&role===0){part(.094,.758,.069,.034,.184,.023,[.11,.08,.052],1);part(.103,.803,.084,.038,.045,.022,[.40,.28,.15],1);part(-.115,.568,.022,.068,.073,.067,[.155,.106,.068],1);}
 if(!e.boss&&role===1){part(0,.757,.093,.218,.174,.032,[.075,.105,.12],2);part(0,.778,.113,.087,.022,.011,[.56,.64,.58]);headShell(1.060,1.133,.078,.076,[.102,.159,.196]);part(0,1.064,.067,.142,.012,.094,[.086,.128,.16],2);}
 if(!e.boss&&role===2){const plate=[.247,.288,.156];part(0,.751,.102,.242,.181,.045,plate,2);for(const side of[-1,1]){part(side*.15,.805,.030,.104,.083,.137,plate,2);part(side*.076,.697,.131,.065,.076,.027,[.161,.185,.116],2);}headShell(1.012,1.138,.084,.086,plate,4);part(0,1.059,.070,.15,.023,.031,[.258,.29,.175],4);}
 if(!e.boss&&role===3){headShell(.965,1.126,.078,.077,[.29,.26,.192]);part(0,.992,.058,.113,.052,.027,[.31,.29,.218],2);part(0,1.038,.069,.100,.018,.013,[.075,.102,.104]);part(-.117,.682,-.020,.047,.167,.114,[.207,.183,.139],2);}
 if(profile){const plate=profile.plate,accent=profile.accent,trim=[.080,.091,.094];let badge=chapter.color||accent;
  part(0,.75,.098,kind==='sniper'?.178:.224,kind==='overseer'?.214:.182,.045,plate,2);
  if(kind==='gunner'){part(-.167,.825,.009,.135,.112,.157,plate,4);part(.155,.799,.016,.116,.080,.140,trim,4);part(-.117,.707,-.083,.074,.260,.103,trim,4);part(.113,.700,.112,.052,.150,.045,accent,4);headShell(1.048,1.138,.081,.081,trim,4);part(0,1.047,.077,.119,.024,.035,trim,4);}
  if(kind==='charger'){for(const n of[-1,1]){part(n*.171,.835,.018,.150,.101,.171,plate,4);part(n*.106,.841,-.083,.065,.202,.09,trim,4);}headShell(1.012,1.142,.092,.091,plate,4);part(0,1.04,.082,.154,.038,.047,trim,4);}
  if(kind==='warden'){for(const n of[-1,1]){part(n*.103,.756,.111,.075,.180,.047,plate,4);part(n*.171,.793,.009,.106,.134,.146,trim,4);}headShell(1.005,1.138,.082,.086,plate,4);part(0,1.022,.073,.145,.048,.035,trim,4);part(0,1.033,.094,.116,.012,.009,accent);}
  if(kind==='sniper'){headShell(.956,1.134,.086,.096,[.293,.311,.275]);part(0,1.035,.075,.101,.031,.031,trim,4);part(.035,1.04,.096,.025,.019,.012,accent);part(0,.971,.066,.115,.055,.030,plate,2);part(-.113,.741,-.041,.047,.168,.118,[.314,.324,.284],2);}
  if(kind==='summoner'){part(0,.756,-.105,.191,.209,.128,plate,4);for(const n of[-1,1]){part(n*.113,.903,-.111,.026,.234,.031,trim,4);part(n*.113,1.016,-.111,.031,.045,.037,accent,4);}headShell(.986,1.133,.080,.08,profile.coat);part(0,1.038,.077,.117,.029,.031,trim,4);}
  if(kind==='overseer'){for(const n of[-1,1]){part(n*.125,.827,-.019,.116,.164,.13,plate,4);part(n*.077,.595,.101,.066,.148,.041,profile.coat,4);part(n*.066,.916,-.030,.045,.122,.092,plate,4);}headShell(.998,1.142,.085,.083,trim,4);part(0,1.022,.073,.142,.076,.046,plate,4);part(0,1.041,.099,.122,.014,.01,accent);}
  part(0,.802,.125,.120,.027,.013,badge,4);
  // Raised receiver for the boss tell, lit separately so timing never churns the pose cache.
  part(0,.707,.139,.116,.071,.041,trim,4);part(0,.724,.162,.094,.026,.013,[.25,.27,.26],4);
  const [sx,sz]=bossTellMounts(kind);for(const n of[-1,1])part(n*sx,.805,sz-.015,.049,.024,.034,trim,4);
 }
 // Shoulders flow into narrow sleeve tubes, elbows bend inward toward the actual grip.
 const type=weapons[e.weaponType??0]?.model??(e.weaponType??0),pistol=type===0,muzzle=pistol?.359:.542;
 const isFiring=e._detailFiring??(e.attack>0),isReloading=e.reloading>0&&!isFiring;
 const drop=(isReloading?.10:0)-pose.lift,gunY=.696-drop,grip=[.066,.655-drop,.194-recoil],support=pose.support===1?[-.125,.822,.155]:pose.support===2?[-.192,.808,.155]:pistol?[.015,.651-drop,.190-recoil]:[-.005,.675-drop,.285-recoil];
 const arm=e.boss&&kind==='charger'?.058:role===2?.054:.050,elbow=[.180*shoulders,.667,.068],leftElbow=[-.175*shoulders,pose.support?.731:.680,.097];
 limb([.153*shoulders,.815,-.005],elbow,arm,.043,coat,1);limb(elbow,grip,.043,.030,coat,1);
 limb([-.153*shoulders,.810,-.005],leftElbow,arm,.042,coat,1);limb(leftElbow,support,.042,.029,coat,1);
 // Fitted cuffs and hands wrap the trigger grip and support the fore-end.
 const hand=role===0?skin:gloves,handMat=role===0?3:1;
 part(grip[0],grip[1],grip[2],.052,.061,.067,hand,handMat);part(support[0],support[1],support[2],.059,.043,.073,hand,handMat);
 for(let i=0;i<3;i++)part(grip[0]+.025,grip[1]+.018-i*.014,grip[2]+.014,.008,.010,.039,hand.map(v=>v*.87),handMat);
 if(!e._detailUnarmed){
 part(grip[0]+.012,gunY-.021,.245-recoil,.012,.010,.057,hand,handMat);
 part(.065,gunY,.224-recoil,.063,.054,pistol?.163:.236,gun);
 part(.065,gunY-.058,.180-recoil,.044,.082,.055,[.105,.092,.070],1);
 if(!pistol){part(.065,gunY-.006,.073-recoil,.071,.068,.134,[.20,.14,.085],1);part(.065,gunY-.070,.243-recoil,.048,.095,.056,[.09,.11,.105]);part(.065,gunY,.338-recoil,.069,.064,.110,[.14,.17,.155]);}
 limb([.065,gunY+.004,(pistol?.305:.380)-recoil],[.065,gunY+.004,muzzle-.012-recoil],.012,.012,steel,0);part(.065,gunY+.038,.240-recoil,.012,.012,.138,[.055,.065,.065]);
 if(type===3){part(.065,gunY+.063,.235-recoil,.040,.040,.115,[.07,.09,.09]);}
 }
 bendUpper(upperBase);
 // Bend the hips with the jacket, keeping the foot soles grounded in every pose.
 for(const side of[-1,1]){const width=pose.stance,hip=posedCharacterPoint(pose,side*.065,.512,-.004),knee=[side*(.070+width*.65),.275,side*stride+pose.sink*.65],ankle=[side*(.071+width),.075,-side*stride];limb(hip,knee,.061,.044,trousers);limb(knee,ankle,.043,.034,trousers);part(ankle[0],.047,.035-side*stride,.080,.082,.150,boots,1);part(ankle[0],.014,.035-side*stride,.083,.018,.158,[.032,.031,.027]);part(knee[0],.295,knee[2]+.035,.061,.060,.013,trousers.map(v=>v*.80),2);}
 surfaceMaterial=0;
}

function drawBossDetailTell(e,pose,angle){
 const b=e.bossAI;
 if(!b&&!e.shield)return;
 const previousMaterial=surfaceMaterial,scale=characterScale(e),c=Math.cos(angle),s=Math.sin(angle),kind=bossDetailKind(e),profile=bossDetailProfiles[kind],phase=b?.phase===2,state=b?.state;
 const attack=Object.hasOwn(bossDetailTells,b?.attack)?b.attack:profile.attack,preparing=state==='telegraph',active=state==='attack',opening=state==='recover',remaining=b?.duration>0&&Number.isFinite(b.timer)?Math.max(0,Math.min(1,b.timer/b.duration)):1;
 const color=opening?[.45,.64,.50]:preparing||active?bossDetailTells[attack]:profile.accent;
 function at(x,y,z){const [px,py,pz]=posedCharacterPoint(pose,x,y,z);return [e.x+(px*c-pz*s)*scale,py*scale,e.y+(px*s+pz*c)*scale]}
 surfaceMaterial=0;
 if(preparing||active||opening||phase){
  const w=opening?.033:preparing?.044+(1-remaining)*.046:active?.091:.046,glow=opening?.22:preparing?.46+(1-remaining)*.32:active?.58:.24;
  box(...at(0,.724,.173),w*scale,.022*scale,.009*scale,color,angle,glow);
  if(preparing||active||phase){const [sx,sz]=bossTellMounts(kind);for(const sign of[-1,1])box(...at(sign*sx,.805,sz+.004),.043*scale,.018*scale,.010*scale,color,angle,glow*.72);}
  if(phase)box(...at(0,.683,.163),.052*scale,.011*scale,.008*scale,color,angle,.27);
 }
 if(e.shield&&state!=='recover'){
  // A thin curved barrier outline in front of the armor, replacing orbiting spheres.
  const color=[.26,.59,.73],shieldGlow=.39;
  for(const y of[.42,.82])for(let i=-1;i<=1;i++){
   const x=i*.146,z=.292-Math.abs(i)*.042,bend=i*.28,wx=e.x+(x*c-z*s)*scale,wz=e.y+(x*s+z*c)*scale;
   box(wx,y*scale,wz,.146*scale,.009*scale,.009*scale,color,angle+bend,shieldGlow);
  }
  for(const side of[-1,1]){const x=side*.203,z=.216;box(e.x+(x*c-z*s)*scale,.62*scale,e.y+(x*s+z*c)*scale,.009*scale,.40*scale,.009*scale,color,angle,shieldGlow);}
 }
 surfaceMaterial=previousMaterial;
}

// Reuse quantized local-space poses. State timing only changes the small exterior
// lights, so the body cache remains bounded even during boss windups.
const characterDetailTemplates=new Map();
function detailedEnemyModel(e){
 const role=e.role||0,pose=bossDetailPose(e),strideIndex=characterStrideIndex(e);
 const isFiring=e.attack>0,isReloading=e.reloading>0&&!isFiring;
 const gun=weapons[e.weaponType??0]?.model??(e.weaponType??0),key=[role,e.boss?bossDetailKind(e):'',Math.abs(e.id||0)%12,gun,!!e.hit,isFiring,isReloading,strideIndex,e.boss?chapterIndex:0,pose.key].join('/');
 let mesh=characterDetailTemplates.get(key);
 if(!mesh){const output=vertexData,material=surfaceMaterial;try{vertexData=[];buildDetailedEnemyModel({...e,x:0,y:0,_detailLocal:true,_detailPose:pose,_detailStride:strideIndex*.013,_detailRecoil:isFiring?.018:0,_detailFiring:isFiring,shield:false,attack:0});mesh=new Float32Array(vertexData);}finally{vertexData=output;surfaceMaterial=material;}if(characterDetailTemplates.size>=96)characterDetailTemplates.delete(characterDetailTemplates.keys().next().value);characterDetailTemplates.set(key,mesh);}
 const a=enemyRenderAngle(e),c=Math.cos(a),s=Math.sin(a);
 for(let i=0;i<mesh.length;i+=10){const x=mesh[i],z=mesh[i+2],nx=mesh[i+3],nz=mesh[i+5];vertexData.push(e.x+x*c-z*s,mesh[i+1],e.y+x*s+z*c,nx*c-nz*s,mesh[i+4],nx*s+nz*c,mesh[i+6],mesh[i+7],mesh[i+8],mesh[i+9]);}
 if(typeof enemyMuzzleVisible==='function'?enemyMuzzleVisible(e):e.attack>.125){const scale=characterScale(e),[x,y,z]=posedCharacterPoint(pose,.065,.700+pose.lift-(isReloading?.10:0),(gun===0?.394:.577)-(isFiring?.018:0)),at=[e.x+(x*c-z*s)*scale,y*scale,e.y+(x*s+z*c)*scale];if(typeof drawEnemyMuzzleFlash==='function')drawEnemyMuzzleFlash(...at,!!e.boss);else{surfaceMaterial=0;sphere(...at,e.boss?.010:.008,e.boss?.008:.006,e.boss?.022:.017,[.64,.43,.19],e.boss?.16:.12);}}
 if(e.boss)drawBossDetailTell(e,pose,a);
 surfaceMaterial=0;
}

// A fallen guard retains the same clothing and anatomy as its living model.
// The unarmed resting mesh is built once per enemy; bodies keep existing non-solid gameplay.
function detailedCorpseModel(e){
 if(!e._corpseMesh){
  const output=vertexData,previousMaterial=surfaceMaterial,hadCapture=typeof captureSpheres!=='undefined',previousCapture=hadCapture?captureSpheres:false;
  let local;
  try{vertexData=[];if(hadCapture)captureSpheres=false;buildDetailedEnemyModel({...e,x:0,y:0,hit:0,attack:0,reloading:0,shield:false,_detailLocal:true,_detailUnarmed:true,_detailStride:.012,_detailRecoil:0,_detailFiring:false});local=new Float32Array(vertexData);}
  finally{vertexData=output;surfaceMaterial=previousMaterial;if(hadCapture)captureSpheres=previousCapture;}
  let minZ=Infinity;for(let i=2;i<local.length;i+=10)minZ=Math.min(minZ,local[i]);
  const height=.012-minZ,pivot=.50*characterScale(e),initial=(e.id||0)*.73;
  let angle=initial;
  for(let k=0;k<8;k++){const test=initial+k*Math.PI/4,c=Math.cos(test),s=Math.sin(test);if([[0,-.48],[0,.40],[-.18,-.12],[.18,-.12]].every(([x,z])=>level[Math.floor(e.y+x*s+z*c)]?.[Math.floor(e.x+x*c-z*s)]==='0')){angle=test;break}}
  const c=Math.cos(angle),s=Math.sin(angle),mesh=new Float32Array(local.length);
  for(let i=0;i<local.length;i+=10){const x=local[i],z=pivot-local[i+1],nx=local[i+3],nz=-local[i+4];mesh[i]=e.x+x*c-z*s;mesh[i+1]=local[i+2]+height;mesh[i+2]=e.y+x*s+z*c;mesh[i+3]=nx*c-nz*s;mesh[i+4]=local[i+5];mesh[i+5]=nx*s+nz*c;for(let j=6;j<10;j++)mesh[i+j]=local[i+j];}
  e._corpseMesh=mesh;
 }
 const mesh=e._corpseMesh;for(let i=0;i<mesh.length;i+=10)vertexData.push(mesh[i],mesh[i+1],mesh[i+2],mesh[i+3],mesh[i+4],mesh[i+5],mesh[i+6],mesh[i+7],mesh[i+8],mesh[i+9]);
}
