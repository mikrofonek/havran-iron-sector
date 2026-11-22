# Jak se zadání zpřesňovalo a testovalo

Česky · [English](DEVELOPMENT.en.md)

Vývoj střídal hraní prototypu, konkrétní připomínku, úpravu implementace a další ověření. Autor zadával cíl a hodnotil hru. AI prováděla změny kódu a spouštěla automatizované kontroly. Původní formulace jsou v [přepisu zadání](vyvoj/moje-zadani.md).

## Vývoj mezi verzemi

| Etapa | Jak jsem zadání zpřesňoval | Jaké ověření přibylo | Doklad |
| --- | --- | --- | --- |
| První prototyp | Z velké představy „Doom pro macOS“ vznikaly konkrétní připomínky k velikosti zbraně, světlu, rukám, zvuku a ovládání. | Oprava kompilace shaderů, zkoušení obrazu a ovládání v prohlížeči. | Zadání 1–45 a texty poznámek ke snímkům. |
| 4.8 | Chtěl jsem použít vývojové skills a porovnat hru s jejich postupy. | Kontrola poškozeného uložení, startu při chybě zvuku, interakce přes zeď, projekce při změně FOV a přenosu postupu. | [Revize 4.8](vyvoj/havran-revize-skills-v48.md). |
| 5.0 | Vyžádal jsem 12 dalších zbraní, začátek s nožem, odhozené zbraně, pevné kolize, inventář, vzácnější zlato a složitější mapy. | Dosažitelnost důkazů a východů všech 15 map, spotřeba a přebíjení 18 zbraní, zabránění průchodu překážkami, jednorázové odměny a migrace uložení. | [Změny 5.0](vyvoj/havran-zmeny-5-0.md). Ve starších podkladech je slovní popis ověření. |
| 5.1 | Po hraní jsem chtěl kratší tlumič, čitelnější mapu, chytřejší protivníky a barvy zaměřovače. | Ověření palety a jejího uložení, výpočtu tras, přebíjení nepřátel, paměti poslední pozice, geometrií a grafických průchodů. | [Změny 5.1](vyvoj/havran-zmeny-5-1.md), [protokoly](vyvoj/protokoly-5-1/). |
| 5.2 | Bludiště bylo pořád příliš složité. Upřesnil jsem vypnutou navigaci při startu, menší body a méně nápadné střely. | 13 sad ověřilo krátké trasy, přístupy kolem nábytku a dveří, postup cílů, jednorázové N, nenápadné projektily a zvuk přes propojené chodby. | [Změny 5.2](vyvoj/havran-zmeny-5-2.md), [protokoly](vyvoj/protokoly-5-2/). |
| 5.3 | Vyžádal jsem pohyblivé bossy, sofistikovanější stráže, odstranění venkovních misí a nejméně 100 UAT, 100 regresních a 100 výkonových testů. | 210 UAT případů, 140 regresních scénářů v každé variantě, 120 krátkých výkonových měření. Po opravách opakování na rozbalených distribučních souborech. | [QA 5.3](../havran-tests-5-3/QA-5-3.md). |

Tabulka je rekonstrukce z uložených poznámek a protokolů. Nejstarší textová zadání nemají spolehlivé časové značky. Historické dokumenty popisují tehdejší chování, například venkovní misi nebo dříve automaticky zapnutou navigaci. Pro současné hraní platí [návod verze 5.3](HRANI.md).

## Co znamenají jednotlivé testy

### Hraní a komentáře autora

Autor zkoušel hru a označoval konkrétní místa snímků. Tak vznikly požadavky na menší zbraň, věrohodnější držení, volné průchody, rozpoznatelné předměty nebo jednodušší orientaci. Přepis obsahuje texty komentářů. Původní snímky z chatu nejsou součástí tohoto přepisu.

### Automatizované UAT

210 případů tvoří sedm výsledků pro každou z patnácti misí ve dvou variantách. Scénář jde od briefingu přes první útok nožem, sebrání pistole, odmítnutí neúplného úkolu, sběr důkazů a inventář po terminál, arénu, souboj a východ. Používá skutečné herní funkce a řízené vstupy v Node. [Zdroj testu](../havran-tests-5-3/test-uat-53.cjs) a [jednotlivé výsledky](../havran-tests-5-3/UAT-5-3.json).

### Regrese

140 scénářů se opakuje v obou variantách. Kontrolují získání a přepnutí zbraní, nákupy, přebití po skutečných krocích aktualizace, reset a navigaci každé kapitoly, klávesy, import a odmítnutí poškozených uložení i boj. Celkem jde o 280 provedení. [Zdroj testu](../havran-tests-5-3/test-regression-53.cjs) a [výstup](../havran-tests-5-3/VYSLEDKY.txt).

### Výkon v reálném prohlížeči

120 případů představuje 15 misí × 2 varianty × 4 scénáře. Měří se úvod, průchod s baterkou a navigací, souboj se strážemi a aréna s bossem. Běží skutečný WebGL v headless Edge, odděleně se zaznamenává interval callbacků snímků a čas CPU. Zvuk byl při závěrečném běhu inicializovaný. [Metodika](../havran-tests-5-3/PERFORMANCE-5-3.md) a [surová data](../havran-tests-5-3/PERFORMANCE-5-3.json).

Měření 15. listopadu 2026 proběhlo na Apple M1 v Edge 157 při 1440 × 900. Krátké scénáře hraní dosáhly přibližně 60 FPS. Tato čísla popisují uvedenou konfiguraci. Rozsah nezahrnuje dlouhé hraní na všech počítačích ani ruční dohrání kampaně celou skupinou hráčů.

## Příklad cyklu nález → oprava → nové ověření

- Při smrtícím zásahu mohla aktualizace ještě sebrat lékárničku nebo zlato. Nový regresní případ chybu reprodukoval. Kód teď po smrti ukončí aktualizaci a případ následně prošel v obou variantách.
- Po restartu mohla zůstat stará zpráva v rádiu. Načtení kapitoly nyní vymaže text i časovač a ověření kontroluje výchozí stav.
- Dokončení mise muselo vyžadovat existujícího poraženého bosse. Kontrola vyloučila splnění při chybějícím bossovi.

[Zdroj cílených kontrol](../havran-tests-5-3/test-lifecycle-53.cjs). Po opravách prošlo všech 20 funkčních sad a nově rozbalené balíčky byly použity pro opakovaný funkční i výkonový běh. Počet 20 sad zahrnuje také UAT a regresi.

## Jak kontroly zopakovat

Z kořene repozitáře s Node.js 20+ spusť `node havran-tests-5-3/run-tests.cjs`. Samostatný výkonový běh používá Playwright a Edge podle metodiky. GitHub Actions spouští funkční sady při zveřejnění a před nasazením webu. Výkonnostní čísla z M1 se při běhu na hostovaném Ubuntu nepřepočítávají.
