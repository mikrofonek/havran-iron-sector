# Výkon HAVRANA 5.3 v Edge

120 odlišných případů pokrývá všech 15 misí v obou variantách. V každé misi se měří čtyři režimy.

- Úvod mise se scénou za menu, která se překresluje po 100 ms.
- Průchod vnitřním sektorem s rozsvícenou baterkou, pohybem, otočením a zapnutou navigací.
- Střet se strážemi, při kterém běží jejich vnímání a hráč skutečně střílí.
- Aréna s pohyblivým bossem, signalizací a efekty střelby.

Běží skutečný renderovací cyklus hry v headless Edge na Apple M1 s WebGL 1.0 a ovladačem ANGLE Metal, při 1440 × 900 a měřítku 1. Po rozehřátí se každý scénář sleduje nejméně 850 ms. Automat doplňuje pozice, výzbroj a vstupy pro reprodukovatelnost. První běh připravil scénáře bez inicializace zvuku. Ve výsledcích je příznak, zda se zvuk inicializoval.

Kontroly vyžadují platná data a odpovídající aktivitu scénáře. Limity jsou 44 FPS a nejvýše 34 ms pro 95. percentil intervalu mezi snímky a 24 ms pro 95. percentil naměřeného času CPU na herní logiku a odeslání vykreslení. Rozpis rozlišuje čas CPU, interval `requestAnimationFrame` a skutečný počet vykreslení. V úvodní obrazovce je hodnota FPS frekvencí callbacku prohlížeče a scéna se překresluje zhruba desetkrát za sekundu. Čas CPU nezahrnuje dobu práce GPU. Měření na jednom Macu a v krátkých scénářích nepokrývá ostatní konfigurace ani pokles výkonu při dlouhém hraní.

Z kořene rozbaleného balíčku při nainstalovaném Node.js, Playwright a Edge spusť:

```sh
node havran-tests-5-3/performance-edge.cjs
```

Pokud je Playwright nainstalovaný mimo cesty Node.js, nastav `HAVRAN_PLAYWRIGHT_PATH` na kořen jeho balíčku. `HAVRAN_EDGE_PATH` umožňuje zvolit cestu ke spustitelnému souboru Edge. Test používá dočasný profil a server vázaný na `127.0.0.1`, obojí zavírá po skončení. Parametry `--root` a `--report` volí kořen hry a cestu JSON výsledků. `--without-audio` umožňuje srovnání s prvním během.
