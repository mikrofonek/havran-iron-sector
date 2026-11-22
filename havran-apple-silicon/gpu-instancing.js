// Apple Silicon variant: shared sphere meshes + per-instance transforms on the GPU.
// ANGLE instancing is feature-detected; the original CPU path remains the fallback.
let sphereGPU=null,sphereGPUProgram=null,captureSpheres=false;
const sphereBatches=[{data:[],buffer:null,mesh:null,count:0},{data:[],buffer:null,mesh:null,count:0}];
const gpuUniformCache=new Map();
function gpuLocation(name){if(!gpuUniformCache.has(name))gpuUniformCache.set(name,gpu.getUniformLocation(sphereGPUProgram,name));return gpuUniformCache.get(name)}
function initSphereGPU(vs,fs){
 const extension=gpu.getExtension('ANGLE_instanced_arrays');
 if(!extension){setGPUStatus('Kompatibilní CPU geometrie · GPU vykreslování');return}
 try{
 const instanceVS=vs.replace('void main(){','attribute vec3 iPosition,iScale,iColor;attribute float iGlow;void main(){vec3 instancePos=iPosition+aPos*iScale;vec3 instanceNormal=normalize(aNormal/iScale);').replace('vec3 r=aPos-uCamera;','vec3 r=instancePos-uCamera;').replace('vPos=aPos;vNormal=aNormal;vColor=aColor;vGlow=aGlow;','vPos=instancePos;vNormal=instanceNormal;vColor=iColor;vGlow=iGlow;');
 const prog=gpu.createProgram();
 for(const [type,source] of [[gpu.VERTEX_SHADER,instanceVS],[gpu.FRAGMENT_SHADER,fs]]){const sh=gpu.createShader(type);gpu.shaderSource(sh,source);gpu.compileShader(sh);if(!gpu.getShaderParameter(sh,gpu.COMPILE_STATUS))throw Error(gpu.getShaderInfoLog(sh));gpu.attachShader(prog,sh);gpu.deleteShader(sh)}
 for(const [name,index] of [['aPos',0],['aNormal',1],['iPosition',2],['iScale',3],['iColor',4],['iGlow',5]])gpu.bindAttribLocation(prog,index,name);
 gpu.linkProgram(prog);if(!gpu.getProgramParameter(prog,gpu.LINK_STATUS))throw Error(gpu.getProgramInfoLog(prog));
 sphereGPUProgram=prog;
 for(let batchIndex=0;batchIndex<2;batchIndex++){
  const batch=sphereBatches[batchIndex],slices=batchIndex?20:12,rows=batchIndex?11:7,vertices=[];
  const point=(i,j)=>{const a=i/slices*Math.PI*2,b=j/rows*Math.PI;return[Math.cos(a)*Math.sin(b),Math.cos(b),Math.sin(a)*Math.sin(b)]};
  for(let j=0;j<rows;j++)for(let i=0;i<slices;i++){const points=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];for(const k of[0,1,2,0,2,3])vertices.push(...points[k],...points[k])}
  batch.count=vertices.length/6;batch.mesh=gpu.createBuffer();batch.buffer=gpu.createBuffer();batch.upload=new Float32Array(10240);
  gpu.bindBuffer(gpu.ARRAY_BUFFER,batch.mesh);gpu.bufferData(gpu.ARRAY_BUFFER,new Float32Array(vertices),gpu.STATIC_DRAW);
  gpu.bindBuffer(gpu.ARRAY_BUFFER,batch.buffer);gpu.bufferData(gpu.ARRAY_BUFFER,batch.upload.byteLength,gpu.DYNAMIC_DRAW);
 }
 sphereGPU=extension;setGPUStatus('GPU instancing aktivní · Apple Silicon profil');
 }catch(error){sphereGPU=null;console.warn('GPU instancing fallback:',error.message);setGPUStatus('Kompatibilní režim · instancing nedostupný')}
 gpu.useProgram(program);
}
function setGPUStatus(text){const element=document.querySelector('#gpuStatus');if(element)element.textContent=text}
function beginSphereBatch(){for(const batch of sphereBatches)batch.data.length=0;captureSpheres=!!sphereGPU}
function queueSphere(x,y,z,rx,ry,rz,col,glow){const batch=sphereBatches[ry>.085&&rx<.13?1:0];batch.data.push(x,y,z,rx,ry,rz,col[0],col[1],col[2],glow===0&&surfaceMaterial>0?-surfaceMaterial:glow)}
function flushSphereBatch(weaponPass=false){
 captureSpheres=false;if(!sphereGPU)return;
 gpu.useProgram(sphereGPUProgram);
 const u=(name,value)=>gpu.uniform1f(gpuLocation(name),value);
 gpu.uniform3f(gpuLocation('uCamera'),p.x,.7+(p.z||0),p.y);u('uAngle',p.a);u('uPitch',weaponPass?0:(p.pitch||0));u('uFocal',1/Math.tan(viewSettings.fov*Math.PI/360));u('uAspect',sceneCanvas.width/sceneCanvas.height);u('uTime',time);u('uWeapon',weaponPass?2:1);u('uTorch',flashlightOn?1:0);u('uFlash',flash>0?1:0);
 gpu.uniform3fv(gpuLocation('uTint'),chapter.color);gpu.uniform3fv(gpuLocation('uLamps[0]'),gpuLampData);gpu.uniform2fv(gpuLocation('uActors[0]'),gpuActorData);
 gpu.uniform1f(gpuLocation('uOutdoor'),stage.outdoor?1:0);gpu.uniform1i(gpuLocation('uGrid'),0);gpu.uniform1i(gpuLocation('uMaterials'),1);gpu.uniform1i(gpuLocation('uProperties'),2);gpu.uniform4fv(gpuLocation('uWindows[0]'),windowLightData);gpu.uniform2f(gpuLocation('uGridSize'),level[0].length,level.length);
 for(const batch of sphereBatches){if(!batch.data.length)continue;
  if(batch.data.length>batch.upload.length){batch.upload=new Float32Array(2**Math.ceil(Math.log2(batch.data.length)));gpu.bindBuffer(gpu.ARRAY_BUFFER,batch.buffer);gpu.bufferData(gpu.ARRAY_BUFFER,batch.upload.byteLength,gpu.DYNAMIC_DRAW)}
  batch.upload.set(batch.data);gpu.bindBuffer(gpu.ARRAY_BUFFER,batch.mesh);
  for(let i=0;i<2;i++){gpu.enableVertexAttribArray(i);gpu.vertexAttribPointer(i,3,gpu.FLOAT,false,24,i*12);sphereGPU.vertexAttribDivisorANGLE(i,0)}
  gpu.bindBuffer(gpu.ARRAY_BUFFER,batch.buffer);gpu.bufferSubData(gpu.ARRAY_BUFFER,0,batch.upload.subarray(0,batch.data.length));
  for(const [index,size,offset] of [[2,3,0],[3,3,12],[4,3,24],[5,1,36]]){gpu.enableVertexAttribArray(index);gpu.vertexAttribPointer(index,size,gpu.FLOAT,false,40,offset);sphereGPU.vertexAttribDivisorANGLE(index,1)}
  sphereGPU.drawArraysInstancedANGLE(gpu.TRIANGLES,0,batch.count,batch.data.length/10);
 }
 for(let i=2;i<=5;i++){sphereGPU.vertexAttribDivisorANGLE(i,0);gpu.disableVertexAttribArray(i)}
 gpu.useProgram(program);bindMesh(dynamicBuffer);
}
const gpuLampData=new Float32Array(24),gpuActorData=new Float32Array(20);
function updateGPUSceneData(){for(let i=0;i<8;i++){const lamp=lamps[i]||[0,0,0];gpuLampData.set(lamp,i*3)}for(let i=0;i<10;i++){const e=enemies[i];gpuActorData[i*2]=e?.hp>0?e.x:-100;gpuActorData[i*2+1]=e?.hp>0?e.y:-100}}
let gpuFramePrevious=0,gpuFrameCount=0,gpuFrameTotal=0,gpuCpuTotal=0,gpuLastStats='';
function recordGPUFrame(t,cpuMs){if(!playing){gpuFramePrevious=0;gpuFrameCount=0;gpuFrameTotal=0;gpuCpuTotal=0;return}if(gpuFramePrevious){const delta=t-gpuFramePrevious;if(delta>0&&delta<200){gpuFrameTotal+=delta;gpuCpuTotal+=cpuMs;gpuFrameCount++}}gpuFramePrevious=t;if(gpuFrameCount>=60){gpuLastStats=Math.round(1000*gpuFrameCount/gpuFrameTotal)+' FPS · CPU '+(gpuCpuTotal/gpuFrameCount).toFixed(1)+' ms · '+sceneCanvas.width+'×'+sceneCanvas.height+' · '+(sphereGPU?'GPU instancing':'kompatibilní režim');const el=document.querySelector('#performanceStats');if(el)el.textContent=gpuLastStats;gpuFrameCount=0;gpuFrameTotal=0;gpuCpuTotal=0}}
const siliconProfiles={balanced:{min:.65,max:1.25},battery:{min:.6,max:1},quality:{min:.8,max:1.75}};
let siliconProfile='balanced';try{const saved=localStorage.getItem('havran-silicon-profile');if(siliconProfiles[saved])siliconProfile=saved}catch(error){}
function applySiliconProfile(){const profile=siliconProfiles[siliconProfile];renderScale=profile.max;perfSamples=0;perfElapsed=0}
function initSiliconProfile(){const el=document.querySelector('#siliconProfile');if(!el)return;el.value=siliconProfile;el.addEventListener('change',()=>{siliconProfile=el.value;applySiliconProfile();try{localStorage.setItem('havran-silicon-profile',siliconProfile)}catch(error){}});applySiliconProfile()}
