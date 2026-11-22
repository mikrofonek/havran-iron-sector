# HAVRAN 5.0 — rozšíření a ověření

23. října 2026. Zachovány jsou dvě samostatné varianty: Classic a Apple Silicon GPU. Předchozí vydání 4.8 zůstává v původních ZIP archivech.

## Co se změnilo

- **12 přidaných střelných zbraní**, celkem 18 a nůž. Revolver R6, kompaktní C9, služební M45, pumpovací K12, lehká S20, PDW, U9, AR5, BR7, DMR, L86 a HMG mají samostatné zásobníky, přebíjení, ceny a parametry. Jde o stylizované herní názvy a parametry, nikoliv simulaci skutečných předloh. Modely rozvíjejí šest stávajících konstrukčních rodin a doplňují odlišné doplňky a vlastní náhledy; nejsou to osmnáct ručně skenovaných modelů.
- **Každý pokus o misi začíná pouze nožem.** První stráž lze zasáhnout nožem a její pistoli sebrat přes E. Každý poražený protivník zanechá zbraň svého typu. Sebraná zbraň je výbavou pro tento pokus; nákup trvale odemyká vyzvednutí ve zbrojnici, jednou za pokus.
- **Vzácnější zlato:** běžný protivník 2, boss 15, schránka 5 a nejvýše dvě schránky v mapě. Nejlevnější nákup stojí 60. Odměny za stejné protivníky a schránky nelze restartem farmit. Munice při samotném noži nepropadne automatickým sběrem před získáním zbraně.
- **Kolize:** pohyb se dělí na krátké kroky. Kruhový půdorys postavy se kontroluje proti stěnám, nábytku, terminálům, výstupním panelům, zvířecím modelům a živým lidem. Ani velký posun nepřeskočí zeď. Přes nízký nábytek neprojdeš ani při skoku. Ležící těla nejsou pevnou překážkou.
- **Menší postavy:** živé modely jsou proti 4.8 zmenšené o 20 %, upravené jsou také zásahové výšky a místa výstřelů.
- **Inventář I:** povinné nálezy, jejich texty, aktuální výbava, výběr nesené zbraně a bonusové výzvy. E nebo I vrací do hry.
- **45 povinných nálezů:** tři v každé z patnácti misí. Mají vlastní obsah a vazbu na konkrétní úkol: například pojistka, nouzový vysílací kód a souřadnice úkrytu. Terminál je odmítne aktivovat, dokud nejsou všechny tři nalezené. Poté následuje boss a východ.
- **Výzvy:** úspěšná mise pouze s nožem +35 zlata; pouze s pistolí MK-9 a nožem +20. Vyhodnocují se skutečně použité zbraně za celý pokus. Každý typ odměny je v každé kapitole jednorázový. Získané výzvy se ukládají do postupu.
- **Větší mapy 31 × 35:** deterministicky generované odbočky, slepé cesty, rozmístěné důkazy, terminál, uzamčená aréna a výstup. Všechny mise mají odlišné rozložení. Mapa se odkrývá průzkumem. Navigace je na začátku vypnutá; lze ji zapnout pomocí N. Neznámé předměty navigace rovnou neprozrazuje.
- **Venkovní kapitola 5:** lesní anténní stanice navazuje na odeslání důkazů o projektu Palimpsest. Obsahuje oblohu, slunce, denní směrové osvětlení, stromy, porost, cestu, technickou anténu a jednoduché statické 3D modely srnce a zajíců. Není to simulace počasí ani živého ekosystému.
- **Trénink lesa:** odkaz v menu zpřístupní venkovní misi bez nutnosti dohrát předchozí kapitoly. Nemění běžný uložený postup ani nevydělává zlato do kampaně.

## Vizuální reference

Byl skutečně prohlédnut [snímek Flashbacku](https://regmedia.co.uk/2011/10/05/flashback_2.jpg), kde zelené porosty doplňuje technická konstrukce a modrozelená hloubka pozadí. [Oficiální stránka Microids](https://www.microids.com/game-flashback/) popisuje původní ručně kreslená pozadí a vydání z roku 1992.

HAVRAN používá vlastní stylizovanou 3D geometrii a nové texty. Neobsahuje převzaté mapy, obrázky, modely ani hudbu Flashbacku. Lesní stanice je původní lokace HAVRANA, nikoliv tvrzení o lokaci ve Flashbacku. Vzhled není fotorealistický ani přesnou kopií této hry.

## Výkon

Skryté plochy mezi sousedícími pevnými stěnami se již nevytvářejí. Porovnání stejné nové mapy s původním způsobem stavění stěn ukázalo **306 153 → 210 729 vrcholů, přibližně −31 %**. V korunách stromů se používá méně statických polygonů. GPU varianta nadále sdílí opakované části modelů přes instancing; při chybějící podpoře používá kompatibilní cestu. Zůstávají tři grafické profily a adaptivní rozlišení.

Jde o úsporu geometrie, nikoliv slib o 31 % vyššího FPS. Mapy jsou větší než ve 4.8. Při jedné prohlížečové kontrole lesní scény ukazoval interní měřič 60 FPS, CPU přibližně 2 ms při 878 × 866; není to ověřený benchmark konkrétního procesoru M1 ani záruka pro všechna zařízení. Hra je stále WebGL aplikace pro prohlížeč, ne nativní Metal program.

## Ověření

- Automatické testy obou variant: všech 15 map je deterministických; všechny požadované nálezy, terminály a výstupy jsou dosažitelné s ohledem na překážky a stav brány.
- Nůž na začátku, zabití první stráže, odhození zbraně a sebrání přes E.
- Všech 18 střelných zbraní: spotřeba vlastní munice a doplnění zásobníku přebitím. Dvouhlavňová brokovnice stále spotřebuje oba náboje současně.
- Kolize při velkém kroku přes zeď, proti nízkému nábytku a proti živým postavám v obou směrech.
- Pevný terminál lze použít ze skutečného sousedního volného místa. Bez tří důkazů se nespustí. Přechod mise vyžaduje aktivovaný terminál a poraženého bosse.
- Nedostatek zlata, nákup, odmítnutí opakované odměny, správné i nesplněné sestavy zbraní pro výzvy.
- Migrace starých šestizbraňových uložení a nový export/import v2. Původní nákupy a zlato zůstávají zachovány. Mise se obnovují od vstupu. Verze 5.0 zapisuje do samostatného klíče úložiště, aby se s archivovanou 4.8 vzájemně nepřepisovaly; starý postup při prvním spuštění pouze přečte.
- Konečné souřadnice geometrie 15 světů a 19 držených modelů; GPU instance atributy, reset stavů, kompatibilní cesta a tři profily.
- AI: obcházení bariéry, reakce na zvuk, paměť poslední známé pozice, žádné sledování neviditelného pohybu hráče, reakční prodleva, ústup střelce; 15 simulací misí bez vstupu do pevných buněk.
- Audio: 11 vložených zvukových souborů, 15 hudebních stop a jejich nezávislé ovládání.
- Ručně v prohlížeči: start obou variant, GPU les, útok nožem, E sebrání pistole a její výpis v I; žádné zaznamenané chyby WebGL při těchto kontrolách.

Automatické testy nenahrazují ruční dohrání celé kampaně. Obtížnost nových map a dlouhodobé vyvážení cen a munice bude potřeba dolaďovat podle hraní.

## Spuštění a archiv

Rozbal ZIP, otevři index.html ve složce zvolené hry. Kompletní balíček obsahuje i havran-varianty.html pro výběr. Stávající ZIPy 4.8 zůstaly zachované. Před přechodem použij Zálohovat postup v menu; JSON lze obnovit v druhé variantě.
