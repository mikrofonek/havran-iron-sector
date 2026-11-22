# HAVRAN / IRON SECTOR 5.3

- **Bossové.** Po vstupu do arény se přesouvají po volné trase. Před výpadem, dávkou nebo další schopností vidíš varování a poté okno, kdy je boss odkrytý. Při poklesu zdraví se mění rytmus souboje. Chování se liší podle role, například průrazný útok, přesná střelba, krytí štítem nebo omezené posily.
- **Stráže.** Reagují na viděné a slyšené události, hledají u poslední známé pozice, dělí si místa a podle role udržují různý odstup. Před výstřelem dostane hráč krátký čas zareagovat. První stráž je dosažitelná nožem a odhodí pistoli pro další část mise.
- **Vykreslování.** Označené vstupy a fasády odlišují prostory a robustnější siluety bossů ukazují jejich roli. Obraz během souboje rozlišuje přípravu, útok a odkrytí. Snímek v balíčku je přímo ze hry.
- **Kampaň.** Všech 15 misí je uvnitř komplexu. Kapitola „Ticho nad městem“ se hraje v podzemní komunikační stanici. Viktor tam obnoví vysílání; důkazy a návaznost příběhu zůstávají součástí kampaně.
- **Trénink.** Odkaz „Vyzkoušet souboj v aréně“ načte arénu s připravenou výbavou. Parametr `?trenink=arena&boss=4` například otevře arénu páté kapitoly. Trénink nemění uložený postup kampaně.

Kompletní vývojový ZIP obsahuje obě varianty, samostatné demo první mise a přenosné testy. Celá kampaň prošla 210 akceptačními případy, 280 běhy regrese a 120 měřeními v Edge na M1. [Rozpis a postup opakování](havran-tests-5-3/QA-5-3.md). Testy v Node ověřují logiku hry a kontrakty vykreslování. Výkon na konkrétním Macu závisí na prohlížeči, rozlišení a grafickém profilu.
