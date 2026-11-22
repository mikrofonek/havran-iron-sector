# HAVRAN 4.8 — porovnání hry s vývojovými skills

Datum: 23. října 2026. Výchozí stav: Classic a Apple Silicon GPU 4.7. Výsledek: opravené a rozšířené obě varianty 4.8.

## Shrnutí a rozsah

Cílem revize bylo porovnat současný prototyp s použitelnými postupy sady Jeffallan/claude-skills, ověřit konkrétní chyby a doplnit rozšíření, které pomůže při přenosu hry mezi verzemi a adresami.

Použity `game-developer`, `javascript-pro`, `code-reviewer` a `test-master` z revize `02b05028ba6c93f7aed45314b15c0dd5abead9d6`:
https://github.com/Jeffallan/claude-skills

Hra má vlastní WebGL renderer a běží offline v prohlížeči. Postupy pro profilování, validaci, práci se stavem a testy se dají použít přímo. Konkrétní API Unity/Unreal, ScriptableObjects nebo jejich profilery se na tento projekt nevztahují. Existující klasické skripty nebyly přepsány na ESM, aby zůstalo zachováno dosavadní spouštění lokálních souborů.

## Porovnání požadavků a skutečnosti

| Oblast | Zjištěný stav 4.7 | Výsledek 4.8 |
|---|---|---|
| Robustní načtení postupu | Typ a rozsah aktuální kapitoly nebyly dostatečně kontrolované; vznikalo NaN | Společná validace, bezpečný výchozí stav a test poškozeného uložení |
| Přenos mezi variantami | Závislost na localStorage daného původu; nový port neviděl starý postup | Export/import JSON postupu z menu, včetně odmítnutí neplatných souborů |
| Dostupnost hry při chybě audia | Selhání AudioContextu zastavilo start celé hry | Hra může pokračovat bez zvuku s informační zprávou |
| Kolizní pravidla interakce | Terminál a záznam šlo aktivovat pouhou vzdáleností přes zeď | E navíc ověřuje přímou viditelnost |
| Kamera a UI | Projekce popisků měla konstantní ohnisko bez ohledu na nastavení FOV | Popisky používají stejné zorné pole jako renderer |
| Ovládání formulářů | Klávesové zkratky mohly zasahovat do INPUT/SELECT | Editační prvky mají přednost před herními zkratkami |
| Neúspěšný zápis úložiště | Výjimka se tiše ignorovala | Menu upozorní na nedostupné automatické ukládání a nabídne zálohu |
| AI | Stavy, paměť poslední pozice, omezená percepce a uložené cesty | Zachováno; ověřeno v 15 simulovaných misích |
| GPU výkon | GPU instancování se třemi profily a CPU náhradní cestou | Zachováno; testy atributů, materiálů, bufferů a náhradního režimu prošly |
| Stabilních 60 FPS ve všech misích na základním M1 | Nedoloženo; dřívější krátké pozorování 52–60 FPS není důkaz pro všechny čipy | Zůstává otevřený požadavek; revize nevydává novou záruku FPS |
| Grafika na úrovni HL2 / Doom 3 | Stylizovaný prototyp, nikoli srovnatelná produkční výprava | Bez tvrzení, že tohoto cíle dosáhl |
| Testy a pokrytí | Rozsáhlé Node VM simulace, základní browser kontroly | Doplněny cílené regresní případy; procento pokrytí větví nebylo změřeno |

## Kritické a významné nálezy

### Vysoká priorita: neplatné uložení blokovalo spuštění — opraveno

Příklad: `unlocked: 2` a `current: "oops"` vytvořily NaN. `loadStage` pak vybíral neexistující kapitolu. Stejný problém mohlo vyvolat desetinné nebo příliš velké číslo. Načtení nyní normalizuje data a používá platnou počáteční kapitolu. Import vyžaduje celočíselné kapitoly, bezpečné množství zlata, správně typovanou výbavu a seznam odměn.

### Vysoká priorita: selhání zvuku blokovalo hru — opraveno

Odmítnuté vytvoření nebo obnovení AudioContextu znemožňovalo přejít do mise. Chyba zvuku nyní dovolí start hry a zobrazí informaci o tichém režimu. Chyby nesouvisející se zvukem se dál nezakrývají jako úspěšný start.

### Střední priorita: interakce přes překážku — opraveno

Podmínka vzdálenosti kratší než 1,25 jednotky nestačila při tenké stěně mezi hráčem a cílem. Terminály i příběhové předměty nyní respektují stěnu. Test ověřuje, že se nezmění hlavní úkol ani neotevře deník.

### Střední priorita: rozjeté popisky při změně FOV — opraveno

Renderer používal nastavitelné ohnisko, ale `projectLabel` pevnou hodnotu 1,35. Projekce byla sjednocena; regresní případ kontroluje polohu popisku při 60° FOV.

### Střední priorita: nepřenosný postup — rozšířeno

Nové funkce v menu:
- **ZÁLOHOVAT POSTUP** vytvoří `HAVRAN-postup.json`.
- **OBNOVIT POSTUP** načte tento soubor v jiné variantě nebo prohlížeči.
- Přenášejí se odemčené kapitoly, vybraná kapitola, dokončení kampaně, zlato, vlastněné zbraně a jednorázové odměny.
- Nejde o checkpoint souboje: mise začíná od vstupu do sektoru.
- Soubor má limit 64 KB a podporovanou verzi formátu. Neobsahuje spustitelný kód.
- Neplatný import nebo selhání zápisu nepozmění stávající postup. Import je dostupný při pozastavené hře a zavřených panelech.

## Co je navržené dobře

- Herní a vizuální kód obou variant sdílí stejná pravidla a obsah kampaně.
- GPU cesta má náhradní režim podle schopností prohlížeče; název čipu není náhradou za detekci funkcí.
- AI nepočítá nové cesty každý snímek, má omezenou paměť a po ztrátě výhledu nesleduje skrytý pohyb hráče.
- Kampaň, arény, průchodnost a ekonomika jsou testované i mimo prohlížeč.
- Jednorázové odměny mají identifikátory, takže restart mise neumožňuje opakované farmení stejné odměny.

## Testovací strategie a výsledky

Regrese ověřuje chování, nikoli jen přítomnost nových funkcí. Nový test nejdřív prokázal selhání původního načtení NaN; po opravě prochází pro obě varianty.

Prošly:
1. `test-review-fixes.cjs`: poškozené uložení, start při chybě audia, stěnou blokovaná interakce, FOV projekce, export/import, chybný JSON, cizí formát, neznámá verze, záporné zlato, nesoulad kapitoly, příliš velký soubor a odmítnutí importu za běhu.
2. `test-game-v4.cjs` a `test-game-m1.cjs`: všech 15 misí, přechody, uzamčené arény, bossové, šest střelných zbraní, nůž, baterka, obchod, zlato, zásobníky a přebíjení.
3. `test-smart-ai.cjs`: cesta kolem zdi, sluch, paměť, reakční prodleva, ústup střelce a konečné pozice AI všech 15 misí.
4. `test-gpu-contract.cjs`: počty instancí, materiály, reset divisorů, obnovení bufferu, CPU náhradní cesta, data 15 map a sedmi zbraní, tři profily.
5. `test-campaign.cjs` a `test-decor.cjs`: odlišnost map, návaznost příběhu, dostupnost cílů a nepřekážející nábytek.
6. `test-audio-v4.cjs` a `test-music-v4.cjs`: 11 nahrávek, 15 samostatných hudebních smyček, mix a nastavení.
7. Syntaxe všech distribuovaných JS souborů: `node --check`.

V prohlížeči: nová GPU větev se načetla bez zachycených chyb, zobrazila nové ovládání a po stisku tlačítka připravila export. Tato kontrola nepotvrzuje, že konkrétní prohlížeč uložil soubor do složky Stažené. Čtení importovaného souboru bylo ověřeno funkčními testy; kompletní ruční upload přes systémový dialog nebyl proveden.

## Otevřené položky a doporučený další rozsah

- Změřit skutečný CPU/GPU čas a dlouhodobé FPS během celé kampaně na základním M1 a dalším Apple Silicon zařízení.
- Přidat test obnovy WebGL kontextu a delší test zátěže/paměti; ty v této revizi nejsou doložené.
- Změřit pokrytí větví a doplnit úplné E2E testy browser dialogu importu a fyzického uložení exportu.
- Další modely a animace rukou, protivníků a výzbroje vyžadují samostatnou výtvarnou práci. Samotné skills je automaticky nevytvoří.
- Samostatná nativní .app, přímý Metal renderer a multiplayer nejsou součástí této revize.

## Verdikt

Konkrétní nalezené chyby byly opraveny a přenos postupu byl účelně doplněn. Pro další používání zůstávají k dispozici obě varianty. Prohlášení o plné produkční kvalitě nebo garantovaných 60 FPS na všech Macích zatím není podložené. Další upřesnění od uživatele nebylo k těmto opravám nutné.
