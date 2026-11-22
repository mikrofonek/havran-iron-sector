# Průvodce hráče

Česky · [English](PLAYING.en.md)

## Stažení a první spuštění

Na [stránce vydání 5.3](https://github.com/mikrofonek/havran-iron-sector/releases/tag/v5.3.0) rozbal sekci Assets.

| Soubor | Obsah |
| --- | --- |
| `havran-5-3-kampan.zip` | Celá kampaň, Classic i Apple Silicon GPU. Doporučené stažení. |
| `havran-5-3-classic.zip` | Samostatná varianta Classic. |
| `havran-5-3-gpu.zip` | Samostatná varianta pro Macy s Apple Silicon. |
| `havran-5-3-demo-html5.zip` | První mise včetně bosse a příběhového úkolu. |
| `havran-5-3-komplet.zip` | Hra, demo, dokumentace a vývojové testy. |
| `SHA256SUMS.txt` | Kontrolní součty distribučních souborů. |

Rozbal celý archiv. U kampaně otevři kořenový `index.html`. Samostatné varianty mají `index.html` uvnitř složky `iron-sector` nebo `havran-apple-silicon`. Demo začíná přímo přes vlastní `index.html`. Po kliknutí na Zahájit misi může prohlížeč zachytit myš. Esc ji uvolní.

## Cíl mise

1. Začni s nožem. První stráž je v dosahu, poraz ji a její pistoli seber přes E.
2. Prohledej hlavní místnosti a přes E získej tři důkazy. Inventář I ukazuje nalezené i chybějící předměty.
3. Použij terminál přes E. Dokud chybí důkazy, další fázi neotevře.
4. Vstup do arény. Boss před útokem ukazuje varování a potom má okno zranitelnosti. Využij kryty a pohyb.
5. Po jeho porážce dojdi k zelenému východu.

Každá kapitola začíná s nožem. Zakoupenou zbraň si můžeš vyzvednout ve zbrojnici V. Zlato a odměny se ukládají napříč misemi. Bonusové výzvy se počítají podle zbraní použitých během celého pokusu. Deník J vysvětluje příběh a postavy. V menu lze zvolit již odemčenou kapitolu.

## Nastavení a ukládání

Ovládání je v [README](../README.md#jak-hrát). V menu Esc nastav hlasitost efektů a hudby, barvu zaměřovače, zorné pole a citlivost. B rozsvítí baterku, N ručně zapne pomoc s cestou. Trénink depa a arény i demo mají vlastní průběh bez zápisu výsledku do kampaně.

Ukládají se kapitoly, zlato, nákupy a splněné výzvy. Při obnovení začíná mise od vstupu. Pro jinou adresu, prohlížeč nebo variantu použij „Zálohovat postup“ a „Obnovit postup“. Soukromý režim či vymazání dat prohlížeče mohou uložený postup odstranit.

## Když něco nefunguje

- Pokud je scéna prázdná, zkontroluj podporu WebGL a hardwarovou akceleraci prohlížeče. Vyzkoušej Classic a aktuální prohlížeč.
- Pokud není zvuk, klikni na Zahájit misi a zkontroluj hlasitost v menu a ztlumení karty.
- Když nejde použít terminál, zkontroluj všechny tři důkazy v I a přistup k němu blíž.
- Když se ZIP zobrazí jako soubor v kartě, použij nabídku „Uložit odkaz jako“ a poté jej rozbal.
- Pokud prohlížeč omezuje spuštění z disku, ze složky hry spusť `python3 -m http.server 8000` a otevři `http://localhost:8000/`.

Při chybě uveď kapitolu, variantu, přesný postup, prohlížeč, operační systém a počítač do [Issues](https://github.com/mikrofonek/havran-iron-sector/issues).
