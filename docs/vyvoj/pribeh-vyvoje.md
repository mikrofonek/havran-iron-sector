# Jak jsem vytvořil HAVRANA

*Příběh vývoje v první osobě podle zadání a připomínek z chatu.*

Chtěl jsem si na Macu zahrát vlastní 3D střílečku. První představa byla jasná. Chodba jako v Doomu, zbraň v ruce a za rohem nepřítel. Než jsem se k tomu rohu dostal, prohlížeč vypsal chybu o různé přesnosti proměnné `uCamera` ve dvou shaderech. Jakmile už bylo co hrát, všiml jsem si, že zbraň zabírá moc obrazovky a na konci chodby skoro nic nevidím. Začal jsem do snímků označovat konkrétní místa. Takhle velká zbraň mi zakrývá výhled. Tohle světlo potřebuje přidat. U tohohle bloku vůbec nepoznám, co to je.

Pak jsem si položil otázku, kterou původní zadání neřešilo. Za koho vlastně hraju a proč jdu dál? Chtěl jsem patnáct uzavřených misí s vlastními bossy, ale také důvod mezi nimi pokračovat. Tak se do hry dostal Viktor Rys, bývalý velitel důlních záchranářů přezdívaný Havran. Z podzemního komplexu přijde nouzový signál se jménem jeho mrtvého bratra. Viktor sjede dolů a přes rádio se ozve Lea. Když mi v deníku chybělo vysvětlení, kdo Havran je, vyžádal jsem si jeho osobní spis. Důkazy jsem chtěl sbírat v prostoru, číst v inventáři a používat k tomu, abych se dostal dál. Vizuální odkaz na seriálové CI5 jsem chtěl promítnout do vzhledu postav a prostředí. Viktorův příběh zůstal vlastní.

Vracel jsem se k věcem, které vidím a dělám každých pár sekund. Ruce připomínaly tyčky a tlumič na pistoli byl příliš velký. Nůž měl dostat špičku a bodat dopředu. Dvouhlavňová brokovnice měla vystřelit oba náboje naráz a při přebití se otevřít. Požadoval jsem sbírání zbraní po protivnících, nákup výbavy za zlato a odměnu za dohrání mise s nožem nebo základní pistolí. V místnostech jsem chtěl židle, stoly, obrazy i kytky. Jakmile palma stála v průchodu, šla pryč. Pro každou misi jsem chtěl vlastní hudbu a možnost měnit její hlasitost zvlášť od efektů.

Jednu dobu jsem si myslel, že je potřeba větší mapa. Chtěl jsem hledat cestu k východu a vymyslel jsem i kapitolu venku, se sluncem, lesem a zvířaty. Po hraní jsem změnil názor. Mezi důkazy jsem trávil příliš času hledáním správné chodby a venkovní odbočka mi do hry neseděla. Vrátil jsem se ke kratším trasám inspirovaným úvodními mapami Freedoomu a navigaci nechal na rozhodnutí hráče. Pátá kapitola se přesunula do podzemní komunikační stanice. Z ní může Viktor pořád vyslat zprávu na povrch, takže scéna má v příběhu stejný důvod.

U protivníků už mi nestačilo, že jsou trojrozměrní. Chtěl jsem, aby reagovali na hluk a poslední místo, kde mě viděli, a aby si v boji nepřekáželi. Zadání jsem opřel i o veřejné zdrojové kódy UZDoomu. U bossů jsem chtěl pohyb po aréně, vlastní způsob útoku a možnost z jejich chování poznat, kdy přijde výpad nebo střelba. Obrana i útok tak dostaly rytmus. Boss se přesune, varuje a udeří. Po útoku mám chvíli, kdy můžu jednat já.

Nakonec jsem začal řešit, jestli hru dokáže spustit někdo další. Když nefungovalo stažení, byla to pro mě stejně skutečná chyba jako neprůchodné dveře. Chtěl jsem udržet dvě varianty, Classic a Apple Silicon, a ověřit celou kampaň opakovanými testy. K tomu vznikla ukázka s první misí a samostatná plná kampaň. Z myšlenky, jestli by mi hra mohla něco vydělat, vzešel návrh na vydání a ověření zájmu. To je další rozhodnutí, které už bude záviset na tom, jestli si lidé po střetu s Kellem budou chtít otevřít i druhou kapitolu.

## Co jsem při vývoji dělal

Procházel jsem hru, zaznamenával chyby, označoval místa na snímcích a dával konkrétní zadání k opravám. Určoval jsem výtvarný směr, rozsah kampaně, ovládání, zbraně, práci s důkazy a to, co má hra hráči ukazovat. Podle zkušenosti z hraní jsem měnil pořadí priorit i dřívější rozhodnutí. Dal jsem dohromady požadavky na výkonnost a stažení obou variant a nastavil minimální rozsah testů před předáním.

[Moje zadání v původním pořadí](moje-zadani.md)
