# HAVRAN 5.2 — přehledné mapy a klidnější bojový obraz

28. října 2026. Classic i Apple Silicon GPU zůstávají samostatné. Archivy 5.1, 5.0 a 4.8 jsou zachované.

## Mapy a orientace

Všech 15 příběhových misí nyní používá tři jednoduché prostorové motivy s variantami průchodů: přímou posloupnost, zalomení a posunuté haly. Každá má tři prostorné hlavní místnosti, dva široké průchody a nejvýše jednu krátkou volitelnou zásobovací niku. Zmizela dlouhá úzká servisní chodba a návratové smyčky. Tři důkazy zůstávají po cestě; příběh a podmínka terminál → boss → východ pokračují stejně.

Nejkratší potřebná cesta přes všechny tři důkazy k použitelnému terminálu měří průměrně 17,7 kroků mřížky (17–18), oproti 32,4 ve verzi 5.1. Přibližně o 45 % méně chůze v této části; nejde o měření celkového času hry ani doby boje. Testy kontrolují průchod tělem hráče i dosah E, nejen barevné políčko mapy.

**Navigace je při každém načtení mise vypnutá.** Zapíná/vypíná se pouze přes N (také se Shiftem pro velké N). Opakování při držení klávesy ji nerozbliká. Body jsou přibližně o 66 % menší v poloměru, vykreslují se řidčeji, maximálně tři a s mnohem slabším jasem. Číslování místností, široké dveře a malé stavební šipky na prahu pomáhají orientaci i při vypnuté navigaci.

## Skutečná předloha

Prohlédnuty a parsovány byly úvodní mapy E1M1 a MAP01 projektu Freedoom na připnutém commitu `3ac019628d70b812ffb722f7f2365771b76a9d29`. Jejich kompletní mapy jsou větší; pro HAVRANA posloužila čitelná úvodní posloupnost místností. Výsledné půdorysy jsou původní zjednodušení, nikoli přesné porty WADů. Podklady, kontrolní součty a půdorysy dokumentuje `FREEDOOM-REFERENCE.md`.

Původní Doom uvolnil kód, jeho herní data zůstávají chráněná; vysvětluje to [oficiální Freedoom](https://freedoom.github.io/about.html). Freedoom má [BSD licenci](https://raw.githubusercontent.com/freedoom/freedoom/3ac019628d70b812ffb722f7f2365771b76a9d29/COPYING.adoc), jejíž úplný text je přiložen. Žádné komerční mapy ani herní assety Doomu nejsou převzaty.

## Chování a střelba

Při úpravě AI byly prohlédnuty [zdrojové kódy nepřátel UZDoom](https://github.com/UZDoom/UZDoom/blob/trunk/src/playsim/p_enemy.cpp), zejména šíření zvuku mezi prostory a podmínky útoku. Nová implementace v JavaScriptu je původní pro HAVRANA; kód enginu UZDoom není součástí hry.

- Hluk probíhá po otevřených cestách, zastaví ho uzavřený průchod. Stráž dostane zapamatovanou polohu výstřelu, nikoli znalost dalšího skrytého pohybu hráče.
- Před novou dávkou se stráž krátce zastaví a zamíří. Pokud jí v palebné dráze stojí spojenec, výstřel zadrží bez spotřeby zásobníku. Může se přemístit a zkusit znovu.
- Zůstává hledání po ztrátě kontaktu, krytí, místní varování spojenců a konečné zásobníky s přebíjením. Zvláštní schopnosti bossů se neměnily.
- Běžné střely už nemají svítící kouli. Jen každá šestá ukáže tenkou krátkou neutrální stopu bez vyzařování světla. Bossové mají slabou čitelnou stopu.
- Záblesk nepřátelské hlavně trvá 35 ms a je menší; původní animace útoku, rychlost, síla, životnost a kolize střel jsou zachované. Poslední náboj zásobníku neztrácí svůj záblesk.

## Grafická podoba

Omítka má klidnější barevný nátěr, strop vlastní tmavší povrch a ocel odlišný odlesk. Místnosti se barevně rozlišují. Nové rámy dveří, označení prahů a světla odpovídají skutečným místnostem. Náhodné svítící lišty bez navázaného světla byly odstraněny. Stávající atlas se používá jemněji; nebyly předstírány nové skenované materiály.

Nábytek se rozmisťuje podle nových pokojů. Stoly mají otočené židle, sedačky míří do pokoje; průchody a přístupy k úkolům zůstávají volné. Rostliny mají lehčí geometrii a obrazy jsou různé.

Důkazy mají rozlišené modely karty, složky a technického modulu. Drobné zásahy používají malé kapky a jiskry místo zářivých kostiček. Padlá stráž má stejné oblečení a anatomii jako její živý model, leží na podlaze a nedrží další kopii odhozené zbraně. Její výsledná geometrie se sestaví jednou a znovu používá.

Grafika zůstává původní stylizované 3D. Nejde o grafiku shodnou s Half-Life 2, ray tracing ani převod na engine UZDoom. Zachované jsou barvy zaměřovače, nastavení hudby, 18 střelných zbraní a nůž.

## Ověření a dostupnost

**13 automatizovaných sad prošlo** pro obě varianty. Pokrývají všech 15 misí, fyzickou průchodnost u dveří/nábytku, sběr a dokončení cílů, kolize, zbraně, uložení, novou AI, vizuální efekty střel, N, nastavení zaměřovače, geometrii, světla, grafické průchody a padlé modely. Přesné výsledky: `havran-tests-5-2/VYSLEDKY.json` a `VYSLEDKY.txt`. Testovací runner funguje i z rozbaleného kompletu bez závislosti na pracovním adresáři.

Skutečné spuštění a kompilaci shaderů doplňuje kontrola v prohlížeči: obě varianty, start s nožem, sebrání pistole a důkazů, přepnutí navigace a venkovní trénink. Všech 15 misí nebylo ručně dohráno. Modelované WebGL testy nenahrazují měření GPU. Neproběhl benchmark na celé řadě Apple Silicon a není slíbena konkrétní frekvence na všech zařízeních.

Pro hraní rozbal ZIP a otevři `havran-varianty.html`, případně `index.html` uvnitř příslušné složky. Hra potřebuje WebGL; zvuky, hudba i materiály jsou součástí balíčku. Nevyžaduje Node ani instalaci UZDoomu. Dosavadní postup lze přenést přes Zálohovat/Obnovit postup; mise začíná u vstupu. Trénink depa a lesa uložený postup nemění.
