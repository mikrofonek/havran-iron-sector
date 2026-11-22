# Player guide

[Česky](HRANI.md) · English

## Download

Open [release 5.3](https://github.com/mikrofonek/havran-iron-sector/releases/tag/v5.3.0) and expand Assets.

| File | Contents |
| --- | --- |
| `havran-5-3-kampan.zip` | Recommended full campaign with both editions. |
| `havran-5-3-classic.zip` | Standalone Classic edition. |
| `havran-5-3-gpu.zip` | Standalone Apple Silicon GPU edition. |
| `havran-5-3-demo-html5.zip` | First mission, including its boss. |
| `havran-5-3-komplet.zip` | Game, demo, tests and development documentation. |
| `SHA256SUMS.txt` | Distribution checksums. |

Extract the entire ZIP. The campaign starts from its root `index.html`. Standalone editions have `index.html` inside `iron-sector` or `havran-apple-silicon`. The demo has its own root `index.html`. The interface and story are in Czech. Controls are listed in the [English README](../README.en.md#controls-and-objectives).

## Complete a mission

Defeat the nearby first guard with the knife and press E to collect the dropped firearm. Search the main rooms for three evidence items. Press I to see what is still missing. Once all three items have been collected, approach the terminal and press E. Enter the arena, watch the boss's attack warning and use cover and movement. Reach the green exit after defeating it.

Each mission starts with a knife. Purchased weapons can be collected from the armory with V. Money, purchases and one-time challenges persist between missions. Challenges use the weapons actually used throughout the attempt.

## Progress and troubleshooting

Esc pauses and opens settings. N enables optional guidance. Training and demo results do not change campaign progress. Backup and restore in the campaign menu transfer unlocked missions, money and equipment. The restored mission starts at its entrance. Private browsing or clearing browser data may remove saved progress.

If the display is empty, check WebGL and hardware acceleration, try Classic and use a current desktop browser. For sound, start the mission by clicking and check the music, effects and browser-tab volume. For a terminal that does not activate, check all three evidence items and move closer.

If local-file restrictions prevent playing, run `python3 -m http.server 8000` in the extracted directory and visit `http://localhost:8000/`. Report problems through Issues with reproduction steps and your environment.
