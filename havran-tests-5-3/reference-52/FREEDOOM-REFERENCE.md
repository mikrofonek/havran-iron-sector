# HAVRAN 5.2 — skutečně prohlédnutá mapová předloha

Datum kontroly: 28. října 2026.

## Zdroj a reprodukovatelnost

Byla stažena a parsována zdrojová data dvou úvodních map projektu Freedoom. Nejsou to mapová data komerčního Doomu od id Software.

- Projekt: https://github.com/freedoom/freedoom
- Připnutý commit: `3ac019628d70b812ffb722f7f2365771b76a9d29`
- Datum commitu podle GitHub API: `2026-10-02T16:08:38Z`
- [E1M1 WAD](https://raw.githubusercontent.com/freedoom/freedoom/3ac019628d70b812ffb722f7f2365771b76a9d29/levels/e1m1.wad)
- [MAP01 WAD](https://raw.githubusercontent.com/freedoom/freedoom/3ac019628d70b812ffb722f7f2365771b76a9d29/levels/map01.wad)
- [Licenční text](https://raw.githubusercontent.com/freedoom/freedoom/3ac019628d70b812ffb722f7f2365771b76a9d29/COPYING.adoc)

| Soubor | Bajty | SHA-256 |
|---|---:|---|
| `e1m1.wad` | 142093 | `d8acd8cf992f1f3af907634587f8a40765d6c43ac15adef1bfa29a2ff1b9e83d` |
| `map01.wad` | 124013 | `d9da5d7f8d97d6555182a04326f306dde6fd40da1186a6fec18143c7ccddd20d` |

Kontrola rozebrala adresář lumpů, vrcholy, linedefy, sektory a herní objekty. Z těchto skutečných souřadnic byly vykresleny a vizuálně prohlédnuty půdorysy. Reprodukční skript `inspect-wad.py`, výpis `inspection.json` a snímky `e1m1.wad.png` / `map01.wad.png` jsou v pracovních podkladech `work/reference-52`.

## Co reference skutečně obsahuje

E1M1 má 1196 vrcholů, 1175 linedefů a 182 sektorů. Hráč začíná na západní straně v souřadnicích `(-416,256)` s úhlem 0°, tedy směrem na východ. V mapě je jedna modrá přístupová karta. Úvod vede z malé vstupní místnosti do výrazně většího podélného prostoru; zbytek mapy se rozvíjí do dalších hal a venkovní oblasti.

MAP01 má 1233 vrcholů, 1272 linedefů a 206 sektorů. Hráč začíná na západní straně v `(-192,-192)`, opět s úhlem 0°. V nalezeném souboru nejsou objekty přístupových karet ani lebek. Vstupní prostor navazuje východním směrem na širší spojovací halu a centrální uzel. Celá mapa je podstatně členitější než výsledná zjednodušená mapa HAVRANA.

**Není pravda, že celé tyto mapy tvoří jen tři místnosti.** Pro HAVRANA byla jako vodítko použita pouze čitelná posloupnost jejich úvodních prostorů: vstup orientovaný k dalšímu otvoru, širší navazující hala a rozpoznatelný další práh. Požadavek na kratší hru vedl k dalšímu vlastnímu zjednodušení.

## Co je nové v HAVRANOVI

Výsledkem nejsou přesné porty, rasterizace ani kopie linedefů Freedoomu. HAVRAN má vlastní měřítko, tři příběhové nálezy, souboje a vlastní uzavřenou arénu. Nově vytvořené půdorysy obsahují tři prostorné navazující místnosti a dvoumetrově stylizované, dvě herní buňky široké průchody. Patnáct misí kombinuje tři jednoduché motivy (přímá posloupnost, zalomení, posunuté haly) s pěti variantami dveří. Každá má nejvýše jednu krátkou volitelnou zásobovací niku a žádné bludištní smyčky.

Povinné tři předměty leží podél hlavní cesty; nejsou schované na koncích odboček. Start se přiblížil k aréně, takže zmizela dřívější dlouhá servisní chodba. První stráž nadále stojí před hráčem na dosah nože. Brána, boss a výstup zachovávají své souřadnice kvůli funkčnímu uzavření souboje.

## Licence a původ

Soubory Freedoom jsou pod tříklauzulovou BSD licencí. Přiložený původní licenční text uvádí `Copyright © 2001-2024 Contributors to the Freedoom project. All rights reserved.` a obsahuje podmínky redistribuce i vyloučení odpovědnosti. Autoři Freedoomu tuto hru nepodporují ani neschvalují; jde o samostatný projekt HAVRAN.

Žádné komerční mapy, textury, zvuky ani modely Doomu zde nebyly použity. Přesné zdrojové WAD soubory sloužily k této doložené kontrole předlohy; runtime hry používá nové mapové definice HAVRANA.
