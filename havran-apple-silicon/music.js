// Fifteen original instrumental cues. Audio files are local and work offline.
let scorePlayer=null,currentMusicChapter=-1,musicVolume=.24,musicEnabled=true,musicDucked=true,musicPlaybackBlocked=false;
try{const v=JSON.parse(localStorage.getItem('havran-sound-v1'));if(v){if(Number.isFinite(v.music))musicVolume=Math.max(0,Math.min(1,v.music));if(typeof v.enabled==='boolean')musicEnabled=v.enabled;if(Number.isFinite(v.effects))document.querySelector('#volume').value=Math.max(0,Math.min(1,v.effects))}}catch(e){}
document.querySelector('#musicVolume').value=musicVolume;
function storeSoundSettings(){try{localStorage.setItem('havran-sound-v1',JSON.stringify({music:musicVolume,enabled:musicEnabled,effects:Number(document.querySelector('#volume').value)}))}catch(e){}}
function updateMusicUI(){document.querySelector('#musicToggle').textContent=musicEnabled?(musicPlaybackBlocked?'SPUSTIT HUDBU':'HUDBA ZAPNUTA'):'HUDBA VYPNUTA';document.querySelector('#musicToggle').setAttribute('aria-pressed',String(musicEnabled))}
function musicGain(){if(scorePlayer)scorePlayer.volume=musicVolume*(musicDucked?.38:1)}
function startMusic(index){if(!scorePlayer){scorePlayer=new Audio();scorePlayer.loop=true;scorePlayer.preload='auto';scorePlayer.addEventListener('error',()=>{document.querySelector('#musicToggle').textContent='HUDBU NELZE NAČÍST'})}if(index!==currentMusicChapter){currentMusicChapter=index;scorePlayer.src='music/'+String(index+1).padStart(2,'0')+'.mp3'}musicGain();if(musicEnabled)scorePlayer.play().then(()=>{musicPlaybackBlocked=false;updateMusicUI()}).catch(()=>{musicPlaybackBlocked=true;updateMusicUI()});updateMusicUI()}
function setMusicChapter(index){if(scorePlayer)startMusic(index)}
function setMusicState(active){musicDucked=!active;musicGain()}
document.querySelector('#musicVolume').addEventListener('input',e=>{musicVolume=Number(e.target.value);musicGain();storeSoundSettings()});
document.querySelector('#volume').addEventListener('input',storeSoundSettings);
document.querySelector('#musicToggle').onclick=()=>{if(musicPlaybackBlocked||(!scorePlayer&&musicEnabled)){musicPlaybackBlocked=false;startMusic(chapterIndex);return}musicEnabled=!musicEnabled;if(musicEnabled)startMusic(chapterIndex);else scorePlayer?.pause();updateMusicUI();storeSoundSettings()};updateMusicUI();
