'use strict';
// Original HAVRAN mission layouts. Flashback is a visual reference, not a source of levels/assets.
const EVIDENCE=[
 ['Kellova karta','Záznam směny','Servisní pojistka'],['Jízdní řád','Klíč výhybky','Kyslíkové čidlo'],['Pojistkový modul','Schéma ventilace','Izolační klíč'],['Seznam zaměstnanců','Adamův spis','Šifrovací disk'],['Anténní pojistka','Vysílací kód','Souřadnice úkrytu'],['Ventilový klíč','Teplotní sonda','Sanitační rozkaz'],['Formulář souhlasu','Adamův protokol','Lékařský disk'],['Datový izolátor','Seznam pacientů','Podpůrný článek'],['Čerpadlový rotor','Plán odvodnění','Hladinové čidlo'],['Výrobní klíč','Rozpis jednotek','Odpojovací modul'],['Záložní podpis','Audit obnovy','Fyzický odpojovač'],['Záchranářský klíč','Adamova vysílačka','Mapa staré šachty'],['Evakuační seznam','Klíč uzávěru','Nouzový protokol'],['Chladicí článek','Reaktorový postup','Bezpečnostní podpis'],['Izolační klíč','Souhlasy přeživších','Závěrečný příkaz']
];
const EVIDENCE_TEXT=[["Karta patří Kellovi, ale poslední použití autorizoval ORFEUS. Lea z ní vyčte identifikátor vnitřní sítě.", "V knize směn chybí odchody dvanácti lidí. Jeden z časů odpovídá nouzovému vysílání. Viktor přibalí celý list, ne jen Adamovo jméno.", "Pojistka nouzového okruhu byla vytažena ručně. Vrať ji k terminálu; karta bez napájení neotevře tranzit."], ["Jízdní řád končí sérií příkazů k návratu. Vlaky tedy nikdo neevakuoval: systém je drží ve smyčce.", "Mechanický klíč dovolí přepnout výhybku i bez souhlasu centrály. Lea označí kolej, která vede k úkrytu.", "Čidlo ukazuje klesající přívod vzduchu. Jeho měření doplní nouzový příkaz pro otevření vagonů."], ["Náhradní modul nese označení VENT-B. Patří do oddělené větve, takže není třeba zapínat celý komplex.", "Schéma ukazuje, že nemocnice a ventilace sdílejí nouzový přívod. Přepnutí hlavní sběrnice by je odpojilo.", "Izolační klíč mechanicky zajistí správnou větev. Viktor před spuštěním porovná všechny tři nálezy."], ["Seznam zaměstnanců obsahuje i lidi vedené jako propuštěné. Vedle jejich jmen je stejný interní kód.", "Adam byl evidován na oddělení Palimpsest den po pohřbu. Záznam neurčuje, zda šlo o tělo, nebo o data.", "Disk obsahuje podpis archivní databáze. Bez něj by se kopie seznamu dala snadno označit za podvrh."], ["Pojistka pochází ze samostatného zdroje antény. Vytažením někdo odpojil poslední linku nezávislou na ORFEU.", "Kód odemkne vysílač pro jednorázový nouzový paket. Lea jej přečte, ale musí být použit přímo na místě.", "Souřadnice vedou k živým lidem v podzemním úkrytu. Důkazy bez této polohy by přivolaly pomoc na špatný vstup."], ["Klíč odpovídá uzávěru palivové větve. Hlavní terminál může uzávěr zajistit, až bude ověřen správný okruh.", "Sonda zaznamenala růst teploty v obydlených sektorech. Sanitace by nečistila prázdné tunely.", "Rozkaz vynechává evakuační kontrolu. ORFEUS označil přítomnost lidí jako závadu provozu."], ["Formulář je vyplněný, kolonka souhlasu však zůstala prázdná. Nikdo nesmí vydávat technický záznam za pacientovo rozhodnutí.", "Protokol potvrzuje Adamovu smrt při závalu. Pozdější aktivace se týká jeho staršího pracovního otisku.", "Disk obsahuje časovou osu zásahů. Viktor získává důkaz, který vysvětluje hlas v rádiu, nikoliv naději na vzkříšení."], ["Izolátor přeruší datové spojení, aniž by zastavil místní životní podporu. Lea znovu varuje před vypnutím chlazení.", "Seznam uvádí živé pacienty a typ jejich podpory. Evakuační tým musí znát každé lůžko zvlášť.", "Článek napájí autonomní dohled během odpojení. Všechny tři nálezy umožní bezpečný přechod na místní režim."], ["Rotor je připraven jako náhradní díl pro první čerpadlo. Bez něj by vzdálené spuštění jen přetížilo motor.", "Plán rozlišuje odtokový a přítokový ventil. Špatný příkaz by vodu poslal přímo k evakuační trase.", "Čidlo ověří pokles hladiny. Záchranáři čekají na potvrzení, ne na odhad podle zvuku čerpadel."], ["Klíč otevře servisní odpojení montážní linky. Maršál nemůže vzdáleně přepsat mechanickou pojistku.", "Rozpis ukazuje plánované série ochranných jednotek. Vektoru nezbýval nedostatek strojů, ale lidí ochotných je řídit.", "Modul oddělí linku od řídicího jádra. Nezastavuj okruh, který ještě napájí nemocnici."], ["Podpis určuje správné zrcadlo systému. Vypnutí náhodného serveru by pouze spustilo obnovu na jiném uzlu.", "Audit potvrzuje automatický návrat ORFEU po výpadku hlavního jádra. Právě proto musí záloha zmizet první.", "Odpojovač přeruší fyzický datový most. Protokol, podpis a díl dohromady připraví bezpečné oddělení."], ["Na klíči jsou Viktorovy staré značky. Otevírá záchranný průchod, který nepatří do nových map komplexu.", "Vysílačka je ztichlá od noci závalu. Je to osobní věc, nikoliv další zdroj Adamova digitálního hlasu.", "Mapa ukazuje boční galerii za závalem. Viktor konečně ví, kudy protáhne poslední evakuační skupinu."], ["Lea doplnila jména posledních pacientů. Každé musí být potvrzeno záchranářem na povrchu.", "Klíč zajistí uzávěr proti vzdálenému otevření. Sanitace nesmí dostat další příležitost zaplavit tunel.", "Nouzový protokol propojí zámek s evakuačním okruhem. Teprve po jeho použití může Lea poslat nosítka dál."], ["Článek udrží dohled nad pasivním chlazením po odpojení centrály. Zničení zdroje by ohrozilo město nad ním.", "Postup vyžaduje nejdřív dochlazení a kontrolu tří zelených stavů. Až potom lze oddělit větev ORFEU.", "Podpis potvrzuje místní obsluhu bezpečnostního okruhu. Lea s Viktorem zkontrolují pořadí kroků u terminálu."], ["Klíč patří k poslednímu fyzickému oddělení. Nejde o výbuch: systém musí zůstat odpojený od lidí i záloh.", "Seznam přeživších obsahuje jejich odmítnutí dalšího připojení. Zachování vzpomínek není totéž jako souhlas.", "Příkaz uzavře proces až po ověření izolace a evakuace. Viktor si vybral živé lidi před strojem, který mu slíbil minulost."]];
function makeStage(index){
 // Original, short room sequences informed by the inspected Freedoom openings.
 // These are not copies/ports of a WAD: geometry, scale and objectives are HAVRAN.
 const W=31,H=35,g=Array.from({length:H},()=>Array(W).fill('1'));
 const carve=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)g[yy][xx]='0'};
 const motif=Math.floor(index/5),variation=index%5;
 const definitions=[
  {name:'line',zones:[[2,18,5,6],[8,18,6,6],[15,18,6,7]],startY:20.5,items:[[5.5,20.5],[10.5,20.5],[17.5,21.5]],terminal:[18.5,23.5]},
  {name:'elbow',zones:[[2,15,5,6],[8,15,6,6],[8,22,11,4]],startY:18.5,items:[[5.5,18.5],[10.5,18.5],[12.5,23.5]],terminal:[16.5,24.5]},
  {name:'staggered',zones:[[2,19,5,6],[8,17,6,6],[15,19,6,6]],startY:21.5,items:[[5.5,21.5],[10.5,19.5],[17.5,21.5]],terminal:[18.5,23.5]}
 ];
 const design=definitions[motif],keys=['entry','hall','control'],labels=['VSTUP','HALA','ŘÍZENÍ'];
 const roomZones=design.zones.map(([x,y,w,h],id)=>({id,key:keys[id],kind:keys[id],label:labels[id],x,y,w,h,itemIndex:id}));
 for(const r of roomZones)carve(r.x,r.y,r.w,r.h);
 const firstDoorY=motif===1?17+variation%2:19+variation%3;
 carve(7,firstDoorY,1,2);
 const wayfinding=[{x:7.5,y:firstDoorY+1,width:2,axis:'x',direction:1,dx:1,dz:0,from:0,to:1,label:'HALA',kind:'door',order:0}];
 if(motif===1){
  const doorX=9+variation%3;carve(doorX,21,2,1);
  wayfinding.push({x:doorX+1,y:21.5,width:2,axis:'y',direction:1,dx:0,dz:1,from:1,to:2,label:'ŘÍZENÍ',kind:'door',order:1});
 }else{
  const secondDoorY=19+(variation+Math.floor(variation/3))%3;carve(14,secondDoorY,1,2);
  wayfinding.push({x:14.5,y:secondDoorY+1,width:2,axis:'x',direction:1,dx:1,dz:0,from:1,to:2,label:'ŘÍZENÍ',kind:'door',order:1});
 }
 // Only the final one-cell boss gate narrows: widening this cell would bypass
 // the existing sealed-arena mechanic. It is directly visible from room three.
 if(motif!==1)carve(15,25,1,1);
 carve(15,26,1,1);
 const optionalBranches=variation%2,optionalZones=[];
 if(optionalBranches){const z={x:2,y:roomZones[0].y-2,w:3,h:2,kind:'supply',label:'VOLITELNÉ ZÁSOBY'};carve(z.x,z.y,z.w,z.h);optionalZones.push(z);}
 // Unchanged arena anchors are kept for boss abilities, actors and progression.
 carve(3,27,27,7);for(const[x,y]of[[8,29],[21,29],[10,32],[23,32]])g[y][x]='1';
 const start={x:3.5,y:design.startY,a:0},gate={x:15.5,y:26.5},bossSpawn={x:15.5,y:30.5},exit={x:27.5,y:32.5};
 const terminal={x:design.terminal[0],y:design.terminal[1]},rooms=roomZones.map(r=>({x:Math.floor(r.x+r.w/2),y:Math.floor(r.y+r.h/2)}));
 const questItems=EVIDENCE[index].map((name,i)=>({x:design.items[i][0],y:design.items[i][1],id:'evidence-'+index+'-'+i,name,text:EVIDENCE_TEXT[index][i]}));
 const hall=roomZones[1],control=roomZones[2];
 const foes=[{x:start.x+1,y:start.y},{x:hall.x+hall.w-1.5,y:hall.y+2.5},{x:control.x+control.w-1.5,y:control.y+1.5}];
 if(index>=7)foes.push({x:hall.x+1.5,y:hall.y+1.5});
 const supplies=[{x:roomZones[0].x+roomZones[0].w-1.5,y:roomZones[0].y+roomZones[0].h-1.5,type:'ammo'},{x:control.x+1.5,y:control.y+1.5,type:'med'},{x:5.5,y:28.5,type:'ammo'},{x:27.5,y:28.5,type:'med'}];
 const goldStashes=[];
 if(optionalBranches){const z=optionalZones[0];supplies.push({x:z.x+1.5,y:z.y+.5,type:'ammo'});goldStashes.push({x:z.x+.5,y:z.y+.5});}
 else goldStashes.push({x:control.x+.5,y:control.y+.5});
 wayfinding.push({x:gate.x,y:gate.y,width:1,axis:'y',direction:1,dx:0,dz:1,from:2,to:3,label:'ARÉNA / VÝCHOD',kind:'gate',order:2});
 const primaryRoute=[start,questItems[0],wayfinding[0],questItems[1],wayfinding[1],questItems[2],terminal,gate];
 const routeHints=wayfinding.map((d,i)=>({x:d.x,y:d.y,label:d.label,order:i,kind:'main'}));
 if(optionalBranches)routeHints.push({x:3.5,y:roomZones[0].y-.5,label:'VOLITELNÉ ZÁSOBY',kind:'optional'});
 return{map:g.map(r=>r.join('')),start,terminal,exit,gate,bossSpawn,arenaY:27,foes,supplies,rooms,roomZones,wayfinding,optionalZones,questItems,goldStashes,primaryRoute,routeHints,layoutStyle:'freedoom-opening-inspired',layoutMotif:design.name,optionalBranches,returnLoops:0,reference:{project:'Freedoom',commit:'3ac019628d70b812ffb722f7f2365771b76a9d29',maps:['e1m1.wad','map01.wad'],use:'opening-flow-reference-only'}};
}
