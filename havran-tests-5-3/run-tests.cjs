const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const directory=path.resolve(process.argv[2]||__dirname);let log='',results=[];
for(const name of fs.readdirSync(directory).filter(n=>/^test-.*\.cjs$/.test(n)).sort()){
 const start=Date.now(),r=spawnSync(process.execPath,[path.join(directory,name)],{cwd:process.argv[3]?path.resolve(process.argv[3]):process.cwd(),encoding:'utf8',maxBuffer:4*1024*1024});
 const detail=(r.stdout||'')+(r.stderr||'');log+='\n'+name+'\n'+detail;results.push({test:name,passed:r.status===0,durationMs:Date.now()-start});console.log((r.status===0?'PASS ':'FAIL ')+name);if(r.status!==0){console.log(detail)}
}
fs.writeFileSync(path.join(directory,'VYSLEDKY.txt'),log);fs.writeFileSync(path.join(directory,'VYSLEDKY.json'),JSON.stringify({version:'5.3',tests:results},null,2));if(results.some(r=>!r.passed))process.exit(1);
