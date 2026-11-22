'use strict';
const SAVE_KEY='iron-sector-campaign-v5';
function defaultProgress(){return{unlocked:0,current:0,complete:false,gold:0,owned:Array.from({length:19},(_,i)=>i===6),claimed:[],achievements:[]}}
/** Normalize legacy saves; strict mode rejects malformed imported files before mutation. */
function normalizeProgress(raw,strict=false){
 const fail=message=>{throw Error(message)};
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||!Number.isInteger(raw.unlocked)||raw.unlocked<0||raw.unlocked>=15){if(strict)fail('Neplatná odemčená kapitola.');return defaultProgress()}
 const validCurrent=Number.isInteger(raw.current)&&raw.current>=0&&raw.current<=raw.unlocked;
 const validGold=Number.isSafeInteger(raw.gold)&&raw.gold>=0&&raw.gold<=1000000000;
 if(strict&&(!validCurrent||!validGold))fail('Neplatná kapitola nebo množství zlata.');
 if(strict&&(typeof raw.complete!=='boolean'||!Array.isArray(raw.owned)||![6,19].includes(raw.owned.length)||raw.owned.some(v=>typeof v!=='boolean')))fail('Neplatná výbava nebo stav kampaně.');
 const validClaimed=Array.isArray(raw.claimed)&&raw.claimed.length<=5000&&raw.claimed.every(v=>typeof v==='string'&&v.length>0&&v.length<=96);
 if(strict&&!validClaimed)fail('Neplatný seznam odměn.');
 if(strict&&raw.complete&&raw.unlocked!==14)fail('Dokončení kampaně neodpovídá kapitolám.');
 return{unlocked:raw.unlocked,current:validCurrent?raw.current:0,complete:raw.unlocked===14&&raw.complete===true,gold:validGold?raw.gold:0,owned:Array.from({length:19},(_,i)=>i===6||raw.owned?.[i]===true),claimed:validClaimed?[...new Set(raw.claimed)]:[],achievements:Array.isArray(raw.achievements)?[...new Set(raw.achievements.filter(v=>typeof v==='string'&&/^\d{1,2}-(knife|basic)$/.test(v)))].slice(0,30):[]};
}
function readProgress(){try{const text=localStorage.getItem(SAVE_KEY)||localStorage.getItem('iron-sector-campaign-v4');return text?normalizeProgress(JSON.parse(text)):defaultProgress()}catch(error){return defaultProgress()}}
function exportProgressText(){return JSON.stringify({game:'HAVRAN',version:2,savedAt:new Date().toISOString(),progress:normalizeProgress(progress,true)},null,2)}
/** Validate first, persist once, then load the imported chapter; no executable data is imported. */
function importProgressText(text){
 if(typeof noSaveMode!=='undefined'&&noSaveMode)throw Error('Postup lze obnovit v hlavní kampani.');
 if(playing||overlay)throw Error('Nejprve pozastav hru a zavři deník nebo zbrojnici.');
 if(typeof text!=='string'||text.length>65536)throw Error('Soubor je příliš velký (nejvýše 64 KB).');
 const data=JSON.parse(text);let raw=data;
 if(data?.game!==undefined||data?.version!==undefined){if(data.game!=='HAVRAN'||![1,2].includes(data.version))throw Error('Soubor není podporovaná záloha hry HAVRAN.');raw=data.progress}
 const next=normalizeProgress(raw,true);
 localStorage.setItem(SAVE_KEY,JSON.stringify(next));progress=next;loadStage(next.current);
 return next;
}
function setupSaveControls(){
 const controls=document.querySelector('.saveControls');if(controls&&typeof noSaveMode!=='undefined'&&noSaveMode)controls.style.display='none';
 const status=document.querySelector('#saveStatus'),file=document.querySelector('#saveImport');
 document.querySelector('#saveExport').onclick=()=>{try{const blob=new Blob([exportProgressText()],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='HAVRAN-postup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Záloha připravena. Ověř ji ve stažených souborech.'}catch(error){status.textContent='Záloha: '+error.message}};
 file.addEventListener('change',async()=>{const selected=file.files?.[0];if(!selected)return;try{if(selected.size>65536)throw Error('Soubor je příliš velký (nejvýše 64 KB).');const text=await selected.text();importProgressText(text);status.textContent='Postup obnoven. Mise začne od vstupu do sektoru.'}catch(error){status.textContent='Import odmítnut: '+error.message}finally{file.value=''}});
}
