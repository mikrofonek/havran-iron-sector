# Jak vznikl HAVRAN

Vývoj probíhal zadáváním v přirozeném jazyce a opakovaným hodnocením hry. Autor určoval, co chce hrát, zkoušel výsledek a vracel konkrétní připomínky. AI asistent převáděl požadavky do kódu, upravoval modely a prostředí a připravoval testy i distribuční balíčky.

## Moje role

- Určoval jsem platformu, herní smyčku a cíl patnácti uzavřených misí.
- Hrál jsem prototyp a označoval problémy ve snímcích. Příklady byly příliš velká zbraň, nepřirozené ruce, nejasné předměty nebo nábytek v průchodu.
- Upřesňoval jsem mechaniky. Dvouhlavňová brokovnice měla vypálit dva náboje, nůž bodat vpřed, zbraně se sbírat přes E a důkazy být dostupné v inventáři.
- Podle hraní jsem měnil zadání. Složitější mapy jsem následně zjednodušil a dříve požadovanou venkovní misi jsem zrušil.
- Požadoval jsem doložené testy, opravy podle výsledků, variantu pro Apple Silicon a funkční stažení.

## Práce AI

Asistent implementoval JavaScript, WebGL, herní systémy a obsah, vytvořil automatizované testy a protokoly a připravil dokumentaci. Část výtvarných podkladů vznikla generováním obrázků. Naměřená čísla pocházejí z automatizovaných běhů a podmínky jsou součástí zpráv.

## Jak se zadání zpřesňovalo

| Podnět z hraní | Upřesnění požadavku |
| --- | --- |
| Zbraň zakrývá výhled | Změnit její měřítko a polohu v obraze. |
| Předměty jsou nečitelné bloky | Odlišit siluety důkazů, zlata a zásobníků. |
| V mapě se špatně hledá cesta | Kratší sled místností a navigace pouze po stisku N. |
| Boss stojí na místě | Pohyb, příprava útoku, fáze souboje a chvíle pro protiútok. |
| Chci větší jistotu před vydáním | Nejméně 100 UAT, 100 regresních a 100 výkonových případů. |

Ve výsledném opakovaném běhu prošlo 210 automatizovaných UAT případů, 140 regresních scénářů na každou ze dvou variant a 120 krátkých měření výkonu. Tyto počty se nepřičítají k 20 funkčním sadám, které část uvedených testů obsahují. [Podmínky a výsledky](../../havran-tests-5-3/QA-5-3.md).

## Konkrétní opravy

Ověření ukázalo například možnost sebrat předmět po smrtícím zásahu v témže snímku nebo starou rádiovou zprávu po restartu. Po opravách se testy spustily znovu na rozbalených distribučních souborech. Venkovní modul byl odstraněn a generování společných stěn přesunuto do interiérového modulu.

## Co si lze prohlédnout

- [Chronologický přepis 68 zadání a skupin komentářů](moje-zadani.md).
- [Příběh vývoje v první osobě](pribeh-vyvoje.md).
- [Zdrojové soubory Classic](../../iron-sector/).
- [Zdrojové soubory Apple Silicon](../../havran-apple-silicon/).
- [Testy a protokoly](../../havran-tests-5-3/).

Pojmem „vibe coding“ zde označuji vývoj vedený zadáními a zpětnou vazbou při práci s AI. Repozitář ukazuje konkrétní postup, změny rozhodnutí a výsledný prototyp.

[Podrobně o testování a zpřesňování jednotlivých verzí](../TESTOVANI.md).
