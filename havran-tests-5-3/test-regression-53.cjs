'use strict';

const assert = require('node:assert/strict');
const vm = require('node:vm');
const { boot } = require('./test-graphics-53.cjs');

const variants = ['iron-sector', 'havran-apple-silicon'];
const cases = [];
const firearmIds = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function scenario(group, name, code) {
    cases.push({ group, name, code });
}

for (const firearm of firearmIds) {
    scenario('loot', `weapon ${firearm} via E`, `
        playing = true;
        const dropped = { x: p.x + 0.45, y: p.y, hp: 0, weaponType: ${firearm} };
        items = [];
        lootEnemy(dropped);
        lootEnemy(dropped);
        assert.equal(items.length, 1, 'deduplicate corpse loot');
        assert.equal(missionEquipment.has(${firearm}), false, 'walking over loot must not grant it');
        update(0.01);
        assert.equal(missionEquipment.has(${firearm}), false);
        press('KeyE');
        assert(items[0].taken && missionEquipment.has(${firearm}));
        assert.equal(weapon, ${firearm});
        assert.equal(ammo, capacities[${firearm}]);
        assert.equal(rounds[${firearm}], Math.ceil(capacities[${firearm}] / 2));
        press('KeyE');
        assert.equal(rounds[${firearm}], Math.ceil(capacities[${firearm}] / 2), 'no duplicate pickup');
    `);

    scenario('reload', `weapon ${firearm} with limited reserves`, `
        playing = true;
        missionEquipment.add(${firearm});
        selectWeapon(${firearm});
        mags[${firearm}] = 0;
        rounds[${firearm}] = 1;
        reload();
        assert.equal(reloadWeapon, ${firearm});
        assert.equal(reloading, reloadTimes[${firearm}]);
        for (let elapsed = 0; elapsed < reloadTimes[${firearm}] / 2; elapsed += 0.025) update(0.025);
        assert.equal(mags[${firearm}], 0, 'rounds seat when reload finishes');
        for (let frames = 0; reloading > 0 && frames < 200; frames++) update(0.025);
        assert.equal(reloading, 0);
        assert.equal(ammo, 1);
        assert.equal(mags[${firearm}], 1);
        assert.equal(rounds[${firearm}], 0);
        reload();
        assert.equal(reloading, 0, 'no second reload with empty reserves');
    `);

    scenario('switch', `weapon ${firearm} reload cancellation`, `
        playing = true;
        missionEquipment.add(${firearm});
        selectWeapon(${firearm});
        mags[${firearm}] = 0;
        rounds[${firearm}] = capacities[${firearm}];
        reload();
        assert(reloading > 0);
        press('Digit0');
        assert.equal(weapon, KNIFE);
        assert.equal(reloadWeapon, -1);
        assert.equal(reloading, 0);
        completeReload();
        assert.equal(mags[${firearm}], 0);
        assert.equal(rounds[${firearm}], capacities[${firearm}]);
        cycleWeapon(-1);
        assert.equal(weapon, ${firearm}, 'wheel switches back to owned gun');
    `);

    scenario('economy', `weapon ${firearm} purchase at threshold`, `
        const cost = prices[${firearm}];
        progress.gold = cost - 1;
        assert.equal(buyWeapon(${firearm}), false);
        assert.equal(progress.owned[${firearm}], false);
        assert.equal(progress.gold, cost - 1);
        progress.gold += 1;
        assert.equal(buyWeapon(${firearm}), true);
        assert.equal(progress.gold, 0);
        assert.equal(buyWeapon(${firearm}), false, 'do not debit an owned purchase');
        const stored = JSON.parse(localStorage.getItem(SAVE_KEY));
        assert(stored.owned[${firearm}]);
        assert.equal(stored.gold, 0);
        loadStage(0);
        assert(progress.owned[${firearm}]);
        assert.equal(weapon, KNIFE, 'purchase does not overwrite start gear');
    `);
}

for (let chapter = 0; chapter < 15; chapter++) {
    scenario('navigation', `chapter ${chapter + 1} cache changes with evidence`, `
        loadStage(${chapter});
        const first = stage.questItems[0], second = stage.questItems[1];
        const initial = navigationPath();
        assert(initial.length > 1);
        assert.equal(navigationPath(), initial, 'same queued route reused');
        const firstEnd = initial.at(-1);
        assert.equal(Math.floor(firstEnd.x), Math.floor(first.x));
        assert.equal(Math.floor(firstEnd.y), Math.floor(first.y));
        for (const point of initial) assert(!wall(point.x, point.y));
        p.x = first.x;
        p.y = first.y;
        playing = true;
        press('KeyE');
        assert.equal(missionInventory[0].id, first.id);
        const next = navigationPath();
        assert.notEqual(next, initial, 'second objective changes cached route');
        assert(next.length > 1);
        assert.equal(Math.floor(next.at(-1).x), Math.floor(second.x));
        assert.equal(Math.floor(next.at(-1).y), Math.floor(second.y));
    `);

    scenario('reset', `chapter ${chapter + 1} restart discards transient state`, `
        loadStage(${chapter});
        const restart = document.querySelector('#restart').onclick;
        const expectedX = p.x, expectedY = p.y;
        playing = true;
        hp = 12;
        armor = 7;
        p.x = 42;
        p.pitch = 0.5;
        missionInventory.push({ id: 'test-item' });
        missionEquipment.add(0);
        missionUse.add(0);
        selectWeapon(0);
        rounds[0] = 1;
        reload();
        assert(reloading > 0);
        projectiles.push({ x: 1, y: 2 });
        objectiveDone = true;
        arenaLocked = true;
        navigationOn = true;
        restart();
        assert.equal(chapterIndex, ${chapter});
        assert.equal(mode, 'briefing');
        assert.equal(p.x, expectedX);
        assert.equal(p.y, expectedY);
        assert.equal(p.pitch, 0);
        assert.equal(hp, 100);
        assert.equal(armor, 50);
        assert.equal(reloading, 0);
        assert.equal(weapon, KNIFE);
        assert.equal(missionEquipment.size, 1);
        assert.equal(missionUse.size, 0);
        assert.equal(missionInventory.length, 0);
        assert.equal(projectiles.length, 0);
        assert(!playing && !navigationOn && !objectiveDone && !arenaLocked);
    `);
}

const controls = [
    ['repeat N does not toggle navigation', `
        playing = true; press('KeyN'); press('KeyN', true); assert(navigationOn);
        press('KeyN'); assert(!navigationOn);
    `],
    ['input field leaves gameplay shortcuts alone', `
        playing = true; press('KeyN', false, 'INPUT'); press('KeyB', false, 'INPUT');
        assert(!navigationOn && !flashlightOn);
    `],
    ['flashlight toggles once per press', `
        playing = true; press('KeyB'); press('KeyB', true); assert(flashlightOn);
        press('KeyB'); assert(!flashlightOn);
    `],
    ['map requires a non-repeat M', `
        playing = true; press('KeyM', true); assert(!mapOn); press('KeyM'); assert(mapOn);
        press('KeyM'); assert(!mapOn);
    `],
    ['E restores active session from inventory', `
        playing = true; press('KeyW'); press('KeyI'); assert(!playing && overlay === 'inventory');
        press('KeyE', true); assert(overlay === 'inventory'); press('KeyE');
        assert(playing && !overlay); assert(!keys.KeyW);
    `],
    ['E exits journal over briefing without starting level', `
        press('KeyJ'); assert(!playing && overlay === 'journal');
        press('KeyE'); assert(!playing && !overlay && mode === 'briefing');
    `],
    ['Esc closes shop before pausing', `
        playing = true; press('KeyV'); assert(!playing && overlay === 'shop');
        press('Escape'); assert(playing && !overlay); press('Escape');
        assert.equal(mode, 'paused'); assert(!playing);
    `],
    ['jump only starts from floor and decays to grounded', `
        playing = true; press('Space'); update(0.05); assert(p.z > 0);
        const velocity = p.vz; press('Space'); assert.equal(p.vz, velocity);
        for (let tick = 0; tick < 40; tick++) update(0.025);
        assert.equal(p.z, 0); assert.equal(p.vz, 0);
    `],
    ['look up/down keyboard has bounded pitch', `
        playing = true; for (let tick = 0; tick < 40; tick++) press('ArrowUp', tick > 0);
        assert.equal(p.pitch, 0.8);
        for (let tick = 0; tick < 40; tick++) press('ArrowDown', tick > 0);
        assert.equal(p.pitch, -0.8);
    `],
    ['only carried guns respond to number shortcuts', `
        playing = true; press('Digit2'); assert.equal(weapon, KNIFE);
        missionEquipment.add(1); press('Digit2'); assert.equal(weapon, 1);
        press('Numpad0'); assert.equal(weapon, KNIFE);
    `],
    ['release mouse ends held fire', `
        playing = true; mouseDown = true; emit('mouseup', {}); assert(!mouseDown);
    `],
    ['pointer unlock pauses and flushes input', `
        playing = true; mouseDown = true; press('KeyW'); emit('pointerlockchange', {});
        assert(!playing && !mouseDown && !keys.KeyW && mode === 'paused');
    `],
];
for (const [name, code] of controls) scenario('input', name, code);

const saves = [
    ['invalid JSON', '"{"'],
    ['array payload', '"[]"'],
    ['wrong export game', 'JSON.stringify({game:"OTHER",version:2,progress:progress})'],
    ['unsupported schema', 'JSON.stringify({game:"HAVRAN",version:3,progress:progress})'],
    ['negative chapter', 'JSON.stringify({...progress,unlocked:-1})'],
    ['too many chapters', 'JSON.stringify({...progress,unlocked:15})'],
    ['current chapter still locked', 'JSON.stringify({...progress,current:1})'],
    ['negative gold', 'JSON.stringify({...progress,gold:-1})'],
    ['fractional gold', 'JSON.stringify({...progress,gold:2.5})'],
    ['unsafe gold', 'JSON.stringify({...progress,gold:Number.MAX_SAFE_INTEGER + 1})'],
    ['bad equipment count', 'JSON.stringify({...progress,owned:[true]})'],
    ['bad equipment flags', 'JSON.stringify({...progress,owned:Array(19).fill(1)})'],
    ['invalid claimed item', 'JSON.stringify({...progress,claimed:[17]})'],
    ['excessive claimed id length', 'JSON.stringify({...progress,claimed:["x".repeat(97)]})'],
    ['completion with locked chapters', 'JSON.stringify({...progress,complete:true})'],
    ['oversized payload', '" ".repeat(65537)'],
];
for (const [name, value] of saves) scenario('save validation', name, `
    const before = localStorage.getItem(SAVE_KEY);
    const memory = JSON.stringify(progress);
    assert.throws(() => importProgressText(${value}));
    assert.equal(localStorage.getItem(SAVE_KEY), before);
    assert.equal(JSON.stringify(progress), memory);
`);

scenario('save validation', 'version 1 to version 2 with reward deduplication', `
    const imported = importProgressText(JSON.stringify({
        game: 'HAVRAN', version: 1,
        progress: {...progress, current: 3, unlocked: 4, gold: 91,
            owned: [true, false, true, false, false, false], claimed: ['a', 'a'],
            achievements: ['0-knife', '0-knife', 'invalid']}
    }));
    assert.equal(chapterIndex, 3);
    assert(imported.owned[0] && imported.owned[2] && imported.owned[KNIFE]);
    assert.equal(imported.owned.length, 19);
    assert.equal(imported.claimed.length, 1);
    assert.equal(imported.achievements.length, 1);
    const exported = JSON.parse(exportProgressText());
    assert.equal(exported.version, 2);
    assert.equal(exported.progress.gold, 91);
`);

scenario('save validation', 'active play rejects import', `
    playing = true;
    assert.throws(() => importProgressText(exportProgressText()), /pozastav/);
`);

scenario('save validation', 'modal rejects import even while paused', `
    press('KeyJ');
    assert.throws(() => importProgressText(exportProgressText()), /zavři/);
`);

scenario('combat', 'shotgun uses both barrels and standard recharge', `
    playing = true; missionEquipment.add(1); selectWeapon(1);
    mags[1] = rounds[1] = 2; switchTime = 0; fire();
    assert.equal(mags[1], 0);
    assert.equal(shotBarrel, 2);
    assert.equal(reloading, 0, 'wait for recoil before breech opens');
    shot = 0; update(0.01); assert.equal(reloadWeapon, 1);
    assert.equal(reloading, reloadTimes[1]);
`);

scenario('combat', 'empty guns fall back to knife', `
    playing = true; missionEquipment.add(0); selectWeapon(0);
    switchTime = 0; fire(); assert.equal(weapon, KNIFE);
`);

scenario('combat', 'ammo for unowned gun remains on ground', `
    playing = true; missionEquipment.add(0);
    const clip = { x: p.x, y: p.y, type:'mag', weaponType:1, taken:false };
    items = [clip]; update(0.01); assert(!clip.taken);
    missionEquipment.add(1); update(0.01); assert(clip.taken); assert(rounds[1] > 0);
`);

scenario('combat', 'medkit saves for later and respects health and armor caps', `
    playing = true; const med = {x:p.x, y:p.y, type:'med', taken:false};
    items = [med]; armor = 71; update(0.01); assert(!med.taken);
    hp = 82; update(0.01); assert(med.taken);
    assert.equal(hp, 100); assert.equal(armor, 75);
`);

scenario('combat', 'corpse is passable while live guards collide', `
    const guard = { x: p.x + 0.5, y: p.y, hp: 1 };
    enemies = [guard];
    move(p, 0.6, 0); assert(p.x <= guard.x - bodyRadius(p) - bodyRadius(guard));
    guard.hp = 0; move(p, 0.6, 0); assert(p.x > guard.x);
`);

scenario('economy', 'gold is once per unique id and survives reload', `
    claimGold('gold-0-0', 5);
    claimGold('gold-0-0', 5);
    assert.equal(progress.gold, 5);
    loadStage(0);
    assert(items.find(item => item.id === 'gold-0-0').taken);
    assert.equal(readProgress().gold, 5);
`);

scenario('economy', 'single purchase persists after open and close of shop', `
    progress.gold = prices[0];
    press('KeyV'); assert.equal(overlay, 'shop');
    assert(buyWeapon(0)); press('KeyV');
    assert.equal(overlay, null); assert(readProgress().owned[0]); assert.equal(readProgress().gold, 0);
`);

const setup = `
    loadStage(0);
    progress = defaultProgress();
    saveProgress();
    overlay = null;
    overlayWasPlaying = false;
    flashlightOn = false;
    mapOn = false;
    radioTimer = 0;
    enemies = [];
`;

const failures = [];
for (const variant of variants) {
    const {c, events} = boot(variant);
    c.press = (code, repeat = false, tagName = 'DIV') =>
        events.keydown({code, repeat, target: {tagName}, preventDefault() {}});
    c.emit = (event, data) => events[event](data);
    const tally = {};
    for (const test of cases) {
        try {
            vm.runInContext(`${setup}{${test.code}}`, c, {filename: `${test.group}: ${test.name}`});
            tally[test.group] = (tally[test.group] || 0) + 1;
        } catch (error) {
            failures.push(`${variant} — ${test.group} — ${test.name}: ${error.message}`);
        }
    }
    const total = Object.values(tally).reduce((sum, count) => sum + count, 0);
    console.log(`${variant}: ${total}/${cases.length} regression cases; ${JSON.stringify(tally)}`);
}
assert(cases.length >= 120, 'insufficient number of distinct scenarios');
if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
}
