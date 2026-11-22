# Vývoj a vydání

Hra je statická aplikace v JavaScriptu a WebGL. Plné varianty jsou v `iron-sector/` a `havran-apple-silicon/`. První mise je v `havran-5-3-demo/`. Změny společné logiky ověř v obou variantách a samostatném demu.

## Ověření

S Node.js 20+ spusť `node havran-tests-5-3/run-tests.cjs`. Výkonnostní sada a její podmínky jsou v `havran-tests-5-3/PERFORMANCE-5-3.md`. Historické protokoly zachycují vydanou verzi 5.3. Testy zapisují protokoly do složky testů.

## Distribuce

Příkaz `python3 scripts/package_release.py` vytvoří ZIPy a kontrolní součty do `dist/`. Kořenový `index.html` slouží jako stránka projektu. Pro hraní z disku fungují relativní odkazy i volič variant v ZIPu.

Workflow Release při tagu `v5.3.0` nebo ručním spuštění zkontroluje hru, sestaví ZIPy a připojí je k vydání na GitHubu. Workflow Pages ověří funkční sady, sestaví veřejný web a nasadí jej. V Settings → Pages musí být jako zdroj vybráno GitHub Actions.

Návštěvníci GitHubu získají balíčky přes Releases. Hráčský web používá relativní odkazy, takže funguje i pod projektovou cestou `/havran-iron-sector/`.
