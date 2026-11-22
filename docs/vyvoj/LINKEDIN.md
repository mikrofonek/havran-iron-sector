# Návrh příspěvku na LinkedIn

Zkusil jsem vytvořit vlastní 3D střílečku na Macu pomocí AI. Původní zadání bylo jednoduché. Chtěl jsem hru ve stylu Doomu.

Postupně z toho vznikl HAVRAN / Iron Sector s českým příběhem, patnácti misemi, sběrem důkazů a bossy.

Velká část mojí práce byla v tom hru hrát a umět říct, co je špatně. Zbraň zakrývala výhled. Ruce vypadaly nepřirozeně. Nábytek překážel v průchodu. Když jsem si vyžádal složitější mapy, zjistil jsem, že se v nich ztrácím, a změnil jsem směr.

AI psala implementaci a připravovala automatizované testy. Já určoval požadavky, hodnotil výsledek a zadával další úpravy. Nakonec jsem požadoval také opakované testování a opravy podle nálezů.

Pro verzi 5.3 jsou uložené protokoly z 210 automatizovaných UAT případů, 140 regresních scénářů pro každou ze dvou variant a 120 krátkých výkonových měření. V repozitáři jsou podmínky měření i jejich omezení.

Zveřejňuji hru, zdrojové soubory a přepis 68 zadání a skupin připomínek. Dá se tak podívat, jak se z neurčité představy stávalo konkrétní zadání a co jsem během vývoje změnil.

Hra a celý postup:
https://github.com/mikrofonek/havran-iron-sector

Budu rád za zkušenost z hraní. Rozumíš v první misi tomu, co hledat a kdy zaútočit na bosse?

#AI #VibeCoding #GameDevelopment #Testovani


## English draft

I tried building my own 3D shooter on a Mac with AI. My initial request was simple: I wanted a game inspired by Doom.

It grew into HAVRAN / Iron Sector, a Czech-language campaign with fifteen missions, evidence collection and boss fights.

Much of my work was playing the prototype and making feedback concrete. The weapon blocked the view. Hands looked unnatural. Furniture obstructed passages. When I asked for more complex maps, I got lost and changed direction.

AI implemented the code and prepared automated tests. I defined requirements, evaluated the result and requested further changes. I also asked for repeated testing and fixes based on findings.

Version 5.3 includes records of 210 automated acceptance cases, 140 regression scenarios per edition and 120 short performance measurements. The repository explains the conditions and limitations.

I’m sharing the game, source and 68 original prompts and groups of feedback, so others can see how the requirements evolved.

Game and development record:
https://github.com/mikrofonek/havran-iron-sector

If you try the first mission, is it clear what to collect and when to attack the boss?

#AI #VibeCoding #GameDevelopment #Testing
