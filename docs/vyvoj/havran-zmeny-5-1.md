# HAVRAN 5.1 — grafika, taktika a přehlednější postup

Aktualizace: 27. října 2026. Obě varianty zůstávají samostatné: Classic a Apple Silicon GPU. Archivy 5.0 a 4.8 zůstávají beze změny.

## Co se změnilo

- **Zaměřovač:** ESC → Zaměřovač · barva. Osm předvoleb: růžová, žlutá, zelená, tyrkysová, oranžová, červená, bílá a fialová. Vlastní barevná paleta, okamžitý náhled a automatické uložení. Kontrastní obrys pomáhá na světlé i tmavé stěně; potvrzení zásahu má vlastní značky a nepřebarvuje vybraný kříž.
- **Mapy:** místo velkého náhodného bludiště pět hlavních místností před arénou, dvě krátké volitelné odbočky a jedna návratová zkratka. Tři povinné předměty následují po hlavní trase. Navigace je zapnutá od začátku, N ji přepíná. Po každém sebrání přes E se přesměruje na další důkaz, poté na terminál, bosse a východ.
- **Pistole:** přední nástavec MK-9 má přibližně o 63 % kratší délku a o 45 % menší poloměr. Záblesk je posunut k nové hlavni. Samostatně upravený revolver R6 má záblesk před hlavní. Přepnutí na nůž během doznívajícího výstřelu už nevytváří neplatné souřadnice modelu.
- **Protivníci:** krátké dávky, konečné zásobníky, čitelné přebíjecí pauzy, hledání dosažitelného krytu a boční pozice. Zraněná stráž může ustoupit; blízcí spojenci si předají poslední známou polohu. Ztracený cíl hledají v zapamatovaném místě, nesledují skrytý pohyb přes zeď. Výpočty tras mají časové limity a opakovaně používají výsledky. První stráž zůstává dosažitelná nožem. Speciální schopnosti bossů se neměnily.
- **Postavy:** propracovanější členění oblečení, hlavy a držení zbraně. Pohyb nohou vychází ze skutečného posunu. Při přebíjení klesne zbraň; poslední výstřel zásobníku přitom neztratí svůj záblesk. Lokální pózy se znovu používají v omezené paměti.
- **Prostředí:** samostatné povrchy pro omítku, cihlu, ocel, podlahu, kůži, látku, lesní půdu a kůru. Nová okna, značení, vedení a průmyslové detaily. Teplejší světla, chladnější výplň, světelná kresba u oken a jemnější povrchové odlesky. Volitelné obrazové efekty lze v menu vypnout.
- **Kompatibilita shaderů:** shodná přesnost sdílených proměnných v obou shaderových stupních, vyšší přesnost tam, kde ji GPU podporuje. Nové textury mají rozměry vhodné pro mipmapy, ochranné okraje a anizotropní filtrování, pokud je dostupné.

## Měření a testy

Osm přenosných sad v `havran-tests-5-1`: pravidla celé kampaně, grafické modely a materiály, GPU kontrakt, taktika, původní AI regrese, záblesky a přebíjení, průchodnost nových tras a nastavení zaměřovače. Testy kontrolují všech 15 misí v obou variantách, dosažitelnost důkazů a fyzického výstupu, kolize, výzvy, výbavu, uložení a konečné hodnoty geometrie. Přesné výsledky jsou v `VYSLEDKY.txt` a `VYSLEDKY.json`.

Nejkratší cesta přes tři důkazy k použitelnému terminálu má po úpravě v průměru 32,4 políčka místo 172,3, tedy přibližně o 81 % méně. Měření bere v úvahu nábytek a dosah interakce; nezahrnuje dobu boje ani nezměněnou bossovou arénu. Nejde o tvrzení, že celou hru dohraješ o 81 % rychleji.

V prohlížeči byly skutečně spuštěny Classic i GPU, depo a venkovní trénink, sebrání pistole po první stráži, změna růžové/žluté barvy, její zachování po obnovení a vypnutí/zapnutí obrazových efektů. Konzole při těchto kontrolách nevykázala nové chyby. Automatizované testy používají model WebGL API pro kontrolu stavů; skutečnou kompilaci shaderů doplňuje uvedená kontrola v prohlížeči. Všech 15 misí nebylo ručně dohráno.

Menší mapy, staticky sloučené detaily a omezená paměť póz pomáhají výkonu. Samotné měření konstrukce modelů v Node není důkazem FPS. Nebyl proveden srovnávací benchmark na celé řadě M1/M2/M3/M4; nelze slíbit stejnou frekvenci na každém zařízení.

## Grafická úroveň a původ

Art direction: opotřebené průmyslové interiéry, původní postavy a materiály. Vizuální reference je [oficiální Half-Life 2](https://www.half-life.com/en/halflife2/). Hra zatím nedosahuje shodné úrovně detailu, animací a osvětlení jako Half-Life 2. Neobsahuje jeho modely, textury ani levely.

Nový atlas je původní obrázek vytvořený vestavěným generátorem OpenAI, normalizovaný do osmi dlaždic. Detailní normály jsou přibližně odvozené ze jasu obrázku, drsnost je autorsky nastavená; nejde o skenované PBR materiály. Okna jsou dekorativní uzavřené plochy se stylizovanou světelnou projekcí, nikoliv skutečný výhled do další místnosti. Obrazový průchod přidává jemné vyhlazení a záři; nejde o ray tracing ani SSAO. Zvířata zůstávají jednoduché statické modely.

## Spuštění a postup

Rozbal ZIP a otevři `havran-varianty.html`, nebo `index.html` přímo v jedné ze složek. WebGL je nutný. Hudba i zvuky a materiály jsou vložené pro offline hraní; nejde o nativní Metal aplikaci. Tréninky `?trenink=depo` a `?trenink=les` neukládají postup.

Hlavní příběh a záznamy předmětů zůstávají zachované. Dosavadní postup má stejný formát; uložená pozice uvnitř mise se nepřenáší. Před přechodem na jinou adresu nebo lokální soubor použij Zálohovat postup. Barva zaměřovače se ukládá samostatně v prohlížeči.
