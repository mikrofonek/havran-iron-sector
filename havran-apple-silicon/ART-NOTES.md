# Havran — vizuální podklady

Portrét: `hero-portrait.png`. Vygenerováno vestavěným nástrojem image_gen.
Původní fiktivní postava; nejde o portrét konkrétního herce.
Portrét slouží briefingu a osobnímu spisu. Herní postavy jsou samostatné 3D modely.

## Použitý prompt

Use case: stylized-concept. Asset type: original cinematic character portrait for a video-game mission dossier. Portrait orientation, head and chest of an original fictional Czech rescue veteran, Viktor Rys, age 38, rugged charismatic capable hero, dark short tousled hair and slight sideburns, three-day stubble, subtle healed scar cutting left eyebrow, intelligent determined eyes. Worn dark brown 1970s leather jacket over a dark charcoal turtleneck, modest rescue insignia with no text, no futuristic armor. Visual atmosphere of a grounded 1970s British crime-action film, realistic photographic skin and leather detail, warm tungsten key light and subtle cool window rim light, dark industrial concrete corridor in soft focus. Front three-quarter angle, eyes toward viewer, strong restrained presence, cinematic natural photography with fine film grain. Face well lit and readable. No gun in frame. No typography, no watermark, no logos. Original person, do not depict any existing actor or franchise character. This is a production game asset, not a screenshot or UI mockup.

## Materiály použité přímo v 3D vykreslování

Historická verze 5.0 používala `material-atlas.png` a `material-assets.js`.
Ve verzi 5.1 je nahrazuje nový vložený atlas v `materials-51-assets.js`.
Vygenerováno vestavěným nástrojem image_gen; beton, kůže, látka a cihly.
Shader atlas skutečně vzorkuje při vykreslování prostředí a oblečení postav.

Použitý prompt:

Use case: stylized-concept. Asset type: physically plausible material texture atlas to be sampled by a real-time 3D game shader. Create one perfectly square 2 by 2 atlas, four equal square quadrants with no border, no gaps, no labels or text. Flat orthographic material photographs only, no perspective, no objects, no furniture. Lighting must be soft, even and diffuse without cast shadows or specular glare. TOP LEFT quadrant: worn warm grey industrial concrete wall, fine pores, hairline cracks, subtle dirt, believable high-frequency photographic microdetail, no large isolated damage. TOP RIGHT quadrant: authentic distressed dark brown 1970s leather jacket material, rich irregular fine leather grain, creases, subtle abrasion, no seams or clothing objects. BOTTOM LEFT quadrant: charcoal wool / rugged grey cotton twill fabric, realistic fine woven fibers, not synthetic armor, no garment seams. BOTTOM RIGHT quadrant: aged reddish brown English industrial bricks, rectangular bonded brick courses and grey mortar, photographed straight on, fine gritty grain, believable individual bricks, no graffiti. Each quadrant should work as a repeatable surface tile within its own square; prioritize matched opposite edges and consistent diffuse lighting. Intended mood: grounded 1970s British crime-action industrial interiors, realistic photographic surfaces matching a cinematic hero in a worn brown leather jacket. Do not create a scene, illustration, asset showcase mockup or title card. Output just the four flat material textures filling their exact quadrant.


## Materiály 5.1

Původní obrázek vygenerovaný vestavěným nástrojem OpenAI, osm materiálů v mřížce 4 × 2. Omítka, cihly, ocel, podlaha, kůže, látka, lesní půda a kůra. Atlas je 2048 × 1024, jednotlivé buňky mají 16pixelové ochranné okraje. `MATERIALS-51.json` obsahuje původ a kontrolu dlaždic.

`materials-51-assets.js` obsahuje obě textury jako data pro offline hraní. Přibližná detailní normála je odvozena z jasu albeda a drsnost je nastavena autorsky; nejde o naměřené PBR mapy. Samostatné pracovní JPG/PNG a starý atlas nejsou přidávány duplicitně do distribučního ZIPu.

Industriální směrování obrazu vychází z prohlédnuté oficiální galerie Half-Life 2: https://www.half-life.com/en/halflife2/ . Žádné obrazové podklady ani modely Valve nejsou součástí hry.


## Podoba 5.2

Původní atlas 5.1 je zachovaný, shader nově míchá klidnější barevné nátěry a samostatný strop. Architektonické rámy a značení jsou původní geometrie HAVRANA. Tři typy důkazů, upravené částice a padlé postavy jsou původní modely. Freedoom byl prohlédnut jako předloha prostorové posloupnosti; jeho textury ani postavy nejsou součástí hry. Viz FREEDOOM-REFERENCE.md.
