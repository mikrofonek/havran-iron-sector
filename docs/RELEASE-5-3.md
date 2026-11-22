# HAVRAN / Iron Sector 5.3

Česká 3D střílečka pro počítačový prohlížeč. Patnáct příběhových misí, sběr důkazů, osmnáct střelných zbraní a nůž, pohybliví bossové a stráže reagující na viděné i slyšené události. Všechny mise jsou uvnitř komplexu.

## Co stáhnout

- **havran-5-3-kampan.zip** — doporučená plná kampaň, Classic i Apple Silicon GPU. Rozbal a otevři index.html.
- **havran-5-3-classic.zip** / **havran-5-3-gpu.zip** — jednotlivé varianty.
- **havran-5-3-demo-html5.zip** — první mise včetně bosse.
- **havran-5-3-komplet.zip** — hra, demo, testy a dokumentace vývoje.
- **SHA256SUMS.txt** — kontrolní součty.

WASD pohyb, myš rozhlížení, klik útok, E sebrat nebo použít, I inventář, R přebít, Esc pauza. Najdi tři důkazy, aktivuj terminál, poraz bosse a dojdi k zelenému východu. Podrobný návod je v repozitáři v docs/HRANI.md.

## Vývoj a ověření

Součástí projektu je přepis 68 zadání a komentářů autora, historie zpřesňování požadavků a popis práce s AI. Autor vedl zadání a hodnotil hru. AI implementovala změny a automatizované testy.

Pro vydání prošlo 210 automatizovaných UAT případů, 140 regresních scénářů na každou variantu a 120 krátkých měření v Edge na M1. Přibližně 60 FPS v měřených scénách při 1440 × 900 se zvukem. Podmínky a omezení jsou doložené v QA zprávě. Cílová platforma je macOS, hraní vyžaduje WebGL, klávesnici a myš.
