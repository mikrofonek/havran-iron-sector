# How the game was specified, refined and tested

[Česky — vývoj](vyvoj/POSTUP.md) · [Česky — testování](TESTOVANI.md) · English

The project grew through repeated cycles of requirements, implementation, playing and feedback. The author chose the goals and judged the prototype. The AI assistant implemented changes and prepared automated checks. The original Czech wording is preserved in [68 prompts and groups of comments](vyvoj/moje-zadani.md).

## The author's role

The author specified macOS, the shooter mechanics, 15 enclosed missions and a story that could be read and followed. During play, he marked problems in screenshots: an oversized weapon, unnatural hands, unclear pickups, furniture blocking doors and excessively complex navigation. Feedback then became more specific requirements, including a forward knife thrust, double-barrel shotgun firing, dropped weapons collected with E, evidence in inventory, optional guidance and moving bosses.

He also revised earlier decisions after playing. Complex maps became shorter room sequences. An outdoor mission was first added and later removed. He requested separate Classic and Apple Silicon editions, working downloads and at least 100 acceptance, 100 regression and 100 performance cases.

## What AI contributed

The assistant implemented JavaScript and WebGL code, generated and refined content, authored automated tests, ran checks, applied fixes and prepared distributions and documentation. Some visual assets were AI-generated. Music was procedurally created. The records distinguish the author's gameplay feedback from automated measurements.

## Changes between versions

| Version | Refined requirements | Verification added |
| --- | --- | --- |
| Early prototype | Weapon size, lighting, hands, sound and controls. | Shader fixes and browser checks of the visible scene and inputs. |
| 4.8 | Review the game against relevant development practices and improve progress transfer. | Corrupt saves, audio startup failure, interaction through walls, FOV label projection and backup validation. |
| 5.0 | Twelve more firearms, knife-only starts, dropped weapons, collisions, evidence, scarce money and more complex maps. | All 15 maps' objective reachability, 18 guns' ammo and reload behavior, swept collisions, one-time rewards and save migration. |
| 5.1 | Shorter pistol attachment, clearer maps, smarter guards and customizable crosshair colors. | Saved preferences, bounded routes, guard reloads, target memory and graphics-state checks. |
| 5.2 | Simpler layouts, guidance off by default, smaller route dots and restrained projectile visuals. | Thirteen suites covering physical access, objectives, N toggling, projectile visuals, sound propagation and existing mechanics. |
| 5.3 | Moving bosses, more sophisticated guards, indoor-only missions and expanded test coverage. | 210 acceptance cases, 140 regression scenarios per edition and 120 short browser performance cases, repeated after fixes. |

Historical Czech release notes and retained logs are in `docs/vyvoj/`. The earliest chat messages do not have dependable timestamps in the export. Earlier notes describe earlier behavior, including the removed outdoor scene. The [current player guide](PLAYING.en.md) describes version 5.3.

## Testing

### Gameplay feedback

The author played the prototype and annotated screenshots. That feedback drove visual and usability changes. The text of those comments is preserved in the prompt transcript. The original chat screenshots are outside that transcript.

### Automated acceptance

There are seven player outcomes for each of 15 missions in two editions, giving 210 cases. These cover briefing, knife combat and dropped-pistol pickup, rejection of an incomplete objective, evidence and inventory, terminal and arena access, boss combat and the exit. The harness uses actual game logic with controlled inputs in Node. [Test source](../havran-tests-5-3/test-uat-53.cjs), [case results](../havran-tests-5-3/UAT-5-3.json).

### Regression

Each edition runs 140 scenarios for weapon pickup and selection, purchase behavior, reloads using actual update steps, mission resets, guidance, controls, save migration and malformed imports, and combat. That is 280 executions. [Test source](../havran-tests-5-3/test-regression-53.cjs), [suite output](../havran-tests-5-3/VYSLEDKY.txt).

### Browser performance

The 120 cases are 15 missions × two editions × four scenarios: briefing, traversal with flashlight and guidance, guard combat, and boss arena combat. The harness runs actual WebGL in headless Edge and records frame callback intervals separately from CPU time for simulation and render submission. Audio was initialized for the final run. [Harness](../havran-tests-5-3/performance-edge.cjs), [raw measurements](../havran-tests-5-3/PERFORMANCE-5-3.json).

The final run was on 15 November 2026, Apple M1 / ANGLE Metal, Edge 157, 1440 × 900. Short gameplay scenarios ran at about 60 FPS. The worst per-case p95 frame callback interval was 16.8 ms. Briefing scenes redraw about ten times a second. Limits were 44 FPS, 34 ms callback p95 and 24 ms CPU p95. Sampling after warmup was at least 850 ms per case. This covers short scenarios on one machine and does not establish long-session stability across all computers.

### Findings and retesting

A targeted check reproduced a lethal projectile allowing a medkit or money pickup in the same update. The update now stops after death. Other checks caught a stale radio message after restart and insufficient validation of boss completion. The fixes passed in both editions. [Lifecycle regression source](../havran-tests-5-3/test-lifecycle-53.cjs).

After fixes, all 20 portable suites passed. That suite count includes acceptance and regression. Newly extracted distribution archives were used for the repeated functional and performance runs. Browser checks also opened both offline editions and completed and replayed the standalone demo, using controlled setup to shorten walking.

## Reproduce

With Node.js 20+, run `node havran-tests-5-3/run-tests.cjs` from the checkout. Performance testing additionally requires Playwright and Edge. See the harness and Czech methodology file for environment overrides. GitHub Actions runs functional checks before deployment; the original Apple M1 measurements are retained as historical evidence.
