'use strict';
// Run with Node.js and Playwright. Both game directories must be beside --root's index.
// HAVRAN_PLAYWRIGHT_PATH can point to an installed Playwright module.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.HAVRAN_PLAYWRIGHT_PATH || 'playwright');

const option = (name, fallback) => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : fallback;
const root = path.resolve(option('--root', path.join(__dirname, '..')));
const reportPath = path.resolve(option('--report', path.join(__dirname, 'PERFORMANCE-5-3.json')));
const withAudio = !process.argv.includes('--without-audio');
const edgePath = process.env.HAVRAN_EDGE_PATH || '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
const variants = ['iron-sector', 'havran-apple-silicon'];
const scenarios = ['briefing', 'traversal', 'guards', 'boss'];
const budgets = { fpsMin: 44, rAFP95MsMax: 34, cpuP95MsMax: 24, desktopWidth: 1440, desktopHeight: 900, sampleMs: 850, warmupMs: 370 };
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  if (pathname === '/favicon.ico') { res.writeHead(204).end(); return; }
  const relative = `.${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`;
  const filename = path.resolve(root, relative);
  if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(filename, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' }).end(data);
  });
});

let browser;
const percentile = (values, quantile) => {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  return +ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * quantile) - 1)].toFixed(2);
};
const batch = [];
const runtimeErrors = [];

async function runCase(page, index, scenario) {
  return page.evaluate(async ({ index, scenario, sampleMs, warmupMs }) => {
    playing = false;
    loadStage(index);
    // Cases enter a controlled scene through the game's real level and enemy setup.
    // Start without pointer lock because no user is driving this benchmark.
    setAudioState(scenario !== 'briefing');
    if (scenario !== 'briefing') {
      playing = true;
      mode = 'active';
      screen.style.display = 'none';
      radioTimer = 0;
    }
    let primaryGuard = null;
    if (scenario === 'traversal') {
      p.a = Math.PI;
      keys.KeyW = true;
      navigationOn = true;
      flashlightOn = true;
    } else if (scenario === 'guards') {
      primaryGuard = enemies[1];
      const room = stage.roomZones[1];
      const spots = [];
      for (let y = room.y + .5; y < room.y + room.h; y++) {
        for (let x = room.x + .5; x < room.x + room.w; x++) {
          const distance = Math.hypot(x - primaryGuard.x, y - primaryGuard.y);
          if (distance < 2.1 || distance > 5.7 || movementBlocked(p, x, y, bodyRadius(p)) || !aiLine({ x, y }, primaryGuard)) continue;
          spots.push({ x, y, distance });
        }
      }
      spots.sort((a, b) => Math.abs(a.distance - 3.3) - Math.abs(b.distance - 3.3));
      if (!spots.length) throw new Error('No free location with a sight line into the guard room');
      p.x = spots[0].x;
      p.y = spots[0].y;
      p.a = Math.atan2(primaryGuard.y - p.y, primaryGuard.x - p.x) - .24;
      missionEquipment.add(0);
      weapon = 0;
      mags[0] = capacities[0];
      rounds[0] = capacities[0] * 2;
      ammo = mags[0];
    } else if (scenario === 'boss') {
      prepareArena53();
    }
    const origin = { x: p.x, y: p.y };
    const boss = scenario === 'boss' ? bossEnemy() : null;
    const bossOrigin = boss ? { x: boss.x, y: boss.y } : null;
    const nativeRender = render3D;
    const nativeUpdate = update;
    const cpu = [], renderCpu = [], updateCpu = [], rAF = [];
    const states = new Set();
    let frameCost = 0, maxEffects = 0, seenGuard = false, shots = 0;
    let record = false, lastFrame, began = performance.now();
    render3D = function () {
      const start = performance.now();
      nativeRender();
      if (record) {
        const cost = performance.now() - start;
        frameCost += cost;
        renderCpu.push(cost);
      }
    };
    update = function (dt) {
      const start = performance.now();
      nativeUpdate(dt);
      if (record) {
        const cost = performance.now() - start;
        frameCost += cost;
        updateCpu.push(cost);
      }
    };
    try {
      await new Promise(resolve => {
        function measure(t) {
          const elapsed = t - began;
          if (record) {
            if (lastFrame !== undefined) rAF.push(t - lastFrame);
            lastFrame = t;
            if (frameCost > 0) cpu.push(frameCost);
            frameCost = 0;
            maxEffects = Math.max(maxEffects, projectiles.length + particles.length);
          }
          if (primaryGuard) seenGuard ||= !!primaryGuard.brain?.visible;
          if (boss?.bossAI) states.add(boss.bossAI.state);
          if (scenario === 'traversal' && elapsed > 510) keys.KeyW = false;
          if (scenario === 'traversal' && elapsed > 510) keys.ArrowRight = true;
          if ((!shots || (shots < 3 && elapsed > 475 + shots * 230)) && (scenario === 'guards' || scenario === 'boss')) {
            // Exercise true firing, audio hook, particles, visibility and the alert cache.
            const loaded = mags[weapon];
            fire();
            if (mags[weapon] < loaded) shots++;
          }
          if (elapsed >= warmupMs + sampleMs) { resolve(); return; }
          if (!record && elapsed >= warmupMs) { record = true; frameCost = 0; }
          requestAnimationFrame(measure);
        }
        requestAnimationFrame(measure);
      });
    } finally {
      render3D = nativeRender;
      update = nativeUpdate;
      playing = false;
      stopInputs();
      flashlightOn = false;
    }
    return {
      cpu, renderCpu, updateCpu, rAF, chapter: chapter.place, vertices: worldCount,
      drawingBuffer: [gpu.drawingBufferWidth, gpu.drawingBufferHeight],
      playerMove: Math.hypot(p.x - origin.x, p.y - origin.y),
      seenGuard, maxEffects, shots,
      bossMove: boss ? Math.hypot(boss.x - bossOrigin.x, boss.y - bossOrigin.y) : null,
      bossStates: [...states], error: gpu.getError(),
    };
  }, { index, scenario, sampleMs: budgets.sampleMs, warmupMs: scenario === 'boss' ? budgets.warmupMs + 350 : budgets.warmupMs });
}

function entry(variant, level, scenario, data) {
  const fps = Math.round(100000 * data.rAF.length / data.rAF.reduce((sum, time) => sum + time, 0)) / 100;
  const measurements = {
    rAFSamples: data.rAF.length, renderSamples: data.renderCpu.length, fps,
    rAFMedianMs: percentile(data.rAF, .5), rAFP95Ms: percentile(data.rAF, .95), rAFMaxMs: percentile(data.rAF, 1),
    cpuMedianMs: percentile(data.cpu, .5), cpuP95Ms: percentile(data.cpu, .95),
    updateP95Ms: percentile(data.updateCpu, .95), renderSubmitP95Ms: percentile(data.renderCpu, .95),
  };
  const violations = [];
  if (data.error !== 0) violations.push(`WebGL error ${data.error}`);
  if (data.renderCpu.length < (scenario === 'briefing' ? 5 : 25)) violations.push('Insufficient rendered frames');
  if (!Number.isFinite(fps) || fps < budgets.fpsMin) violations.push(`rAF below ${budgets.fpsMin} FPS`);
  if (measurements.rAFP95Ms === null || measurements.rAFP95Ms > budgets.rAFP95MsMax) violations.push(`rAF p95 above ${budgets.rAFP95MsMax} ms`);
  if (measurements.cpuP95Ms === null || measurements.cpuP95Ms > budgets.cpuP95MsMax) violations.push(`CPU p95 above ${budgets.cpuP95MsMax} ms`);
  if (scenario === 'traversal' && data.playerMove < .25) violations.push('Traversal did not move the player');
  if (scenario === 'guards' && (!data.seenGuard || !data.maxEffects || !data.shots)) violations.push('Guard encounter did not exercise awareness and effects');
  if (scenario === 'boss' && (data.bossMove < .12 || !data.maxEffects || !data.bossStates.includes('telegraph'))) violations.push('Boss encounter did not move and telegraph');
  const { cpu, renderCpu, updateCpu, rAF, ...evidence } = data;
  return { id: `PERF-${variant}-${String(level).padStart(2, '0')}-${scenario}`, variant, level, scenario, ...measurements, ...evidence, violations, pass: violations.length === 0 };
}

(async () => {
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({ executablePath: edgePath, headless: true, args: ['--no-first-run', '--no-default-browser-check'] });
  const graphics = {};
  for (const variant of variants) {
    const page = await browser.newPage({ viewport: { width: budgets.desktopWidth, height: budgets.desktopHeight }, deviceScaleFactor: 1 });
    page.on('pageerror', error => runtimeErrors.push(variant + ': ' + error.message));
    page.on('response', response => { if (response.status() >= 400) runtimeErrors.push(`${variant}: ${response.status()} ${response.url()}`); });
    await page.goto(`${base}/${variant}/`, { waitUntil: 'load' });
    await page.waitForFunction(() => typeof gpu !== 'undefined' && gpu && worldCount > 0, undefined, { timeout: 15000 });
    graphics[variant] = await page.evaluate(() => {
      const debug = gpu.getExtension('WEBGL_debug_renderer_info');
      return { linked: gpu.getProgramParameter(program, gpu.LINK_STATUS), renderer: debug ? gpu.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null };
    });
    assert.equal(graphics[variant].linked, true, `${variant} linked graphics program`);
    if (withAudio) {
      await page.locator('#start').click();
      await page.waitForFunction(() => audioReady && scorePlayer?.readyState >= 2, undefined, { timeout: 14000 });
      await page.evaluate(async () => {
        playing = false;
        document.exitPointerLock?.();
        await new Promise(resolve => requestAnimationFrame(resolve));
      });
    }
    await page.waitForTimeout(450);
    for (let level = 1; level <= 15; level++) {
      const first = (level - 1) % scenarios.length;
      const order = scenarios.slice(first).concat(scenarios.slice(0, first));
      for (const scenario of order) {
        let result;
        try { result = entry(variant, level, scenario, await runCase(page, level - 1, scenario)); }
        catch (error) { result = { variant, level, scenario, pass: false, violations: [error.message] }; }
        batch.push(result);
        console.log(`${result.pass ? 'PASS' : 'FAIL'} ${variant} ${level} ${scenario}: ${result.fps ?? '—'} FPS, p95 ${result.rAFP95Ms ?? '—'} ms${result.violations.length ? ' · ' + result.violations.join('; ') : ''}`);
      }
    }
    await page.close();
  }
  const result = { ranAt: new Date().toISOString(), browser: `Edge ${browser.version()} (headless)`, graphics, budgets, audioInitialized: withAudio, environment: { platform: process.platform, architecture: process.arch }, cases: batch, runtimeErrors, failureCount: batch.filter(test => !test.pass).length };
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2) + '\n');
  console.log(`Performance: ${batch.length - result.failureCount}/${batch.length}; browser errors ${runtimeErrors.length}; ${reportPath}`);
  if (result.failureCount || runtimeErrors.length || batch.length !== 120) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); server.close(); });
