/* ================================================================
   config.js - Constants, shared state, and global references
   ================================================================ */
window.FR = {};

// ---- Gameplay Constants ----
FR.C = {
    LANE_W:        2.5,
    LANES:         [-2.5, 0, 2.5],
    PATH_W:        8.5,
    INIT_SPEED:    13,
    MAX_SPEED:     42,
    SPEED_ACCEL:   0.20,
    JUMP_FORCE:    15,
    GRAVITY:       38,
    SLIDE_DUR:     0.55,
    LANE_LERP:     14,
    SEG_LEN:       70,
    NUM_SEGS:      6,
    SPAWN_AHEAD:   130,
    CLEANUP:       30,
    OBS_GAP:       16,
    COIN_Y:        1.4,
    VIEW_DIST:     160,
    CYCLE_DUR:     240,
    BASE_FOV:      62,
    MAX_FOV:       78,
    CAM_BACK:      9,
    CAM_UP:        4.8,
};

// ---- Mutable Game State ----
FR.S = {
    mode:       'loading',   // loading, start, playing, dying, gameover
    score:      0,
    coins:      0,
    speed:      13,
    pZ:         0,
    pX:         0,
    pY:         0,
    pLane:      1,
    vY:         0,
    jumping:    false,
    sliding:    false,
    slideTmr:   0,
    runPh:      0,
    gTime:      0,
    lastObsZ:   0,
    lastCoinZ:  0,
    prevTime:   0,
    shakeAmt:   0,
    shakeDecay: 0,
    flashAlpha: 0,
    deathTimer: 0,
    highScore:  0,
    highCoins:  0,
    shieldActive: false,
    magnetActive: false,
    doubleCoins:  false,
};

// Load persisted high scores
try {
    FR.S.highScore = parseInt(localStorage.getItem('fr_hs') || '0', 10);
    FR.S.highCoins = parseInt(localStorage.getItem('fr_hc') || '0', 10);
} catch (e) { /* localStorage not available */ }

// ---- Shop Data ----
FR.Shop = {
    wallet: 0,
    powerups: {
        shield:      { name: 'Shield',       cost: 75,  desc: 'Survive one hit',          icon: '\u{1F6E1}', qty: 0, selected: false },
        magnet:      { name: 'Coin Magnet',  cost: 60,  desc: 'Auto-collect nearby coins', icon: '\u{1F9F2}', qty: 0, selected: false },
        doubleCoins: { name: 'Double Coins', cost: 50,  desc: 'Coins worth 2x',           icon: '\u{00D7}2', qty: 0, selected: false },
        headStart:   { name: 'Head Start',   cost: 100, desc: 'Begin with +500 score',    icon: '\u{1F3C3}', qty: 0, selected: false },
    },
    cosmetics: {
        explorer:  { name: 'Explorer',      cost: 0,   owned: true,  jacket: 0x2a6699, scarf: 0xcc3333, hat: 0x5a3818 },
        arctic:    { name: 'Arctic',         cost: 80,  owned: false, jacket: 0xe8e8f0, scarf: 0x66ccee, hat: 0xd0d0d8 },
        crimson:   { name: 'Crimson',        cost: 80,  owned: false, jacket: 0x8b1a1a, scarf: 0xff6622, hat: 0x5a2018 },
        ranger:    { name: 'Forest Ranger',  cost: 100, owned: false, jacket: 0x2a5a22, scarf: 0xc8b070, hat: 0x3a6a28 },
        golden:    { name: 'Golden',         cost: 150, owned: false, jacket: 0xdaa520, scarf: 0xffd700, hat: 0xb8860b },
        midnight:  { name: 'Midnight',       cost: 90,  owned: false, jacket: 0x1a1a2e, scarf: 0x6644aa, hat: 0x2a2040 },
        ocean:     { name: 'Ocean',          cost: 90,  owned: false, jacket: 0x1a7a8a, scarf: 0x44ddcc, hat: 0x145a6a },
        sunset:    { name: 'Sunset',         cost: 100, owned: false, jacket: 0xdd6633, scarf: 0xffaa55, hat: 0xaa4422 },
        royal:     { name: 'Royal',          cost: 120, owned: false, jacket: 0x5522aa, scarf: 0xeebb33, hat: 0x441888 },
        stealth:   { name: 'Stealth',        cost: 120, owned: false, jacket: 0x2a2a2a, scarf: 0x444444, hat: 0x1a1a1a },
        cherry:    { name: 'Cherry Blossom', cost: 130, owned: false, jacket: 0xee88aa, scarf: 0xffccdd, hat: 0xcc6688 },
        toxic:     { name: 'Toxic',          cost: 140, owned: false, jacket: 0x33aa22, scarf: 0xaaff00, hat: 0x228811 },
        ember:     { name: 'Ember',          cost: 160, owned: false, jacket: 0x881100, scarf: 0xff4400, hat: 0x660800 },
        phantom:   { name: 'Phantom',        cost: 200, owned: false, jacket: 0xf0f0f0, scarf: 0xcccccc, hat: 0xe0e0e0 },
    },
    activeOutfit: 'explorer',
};

// Persist / load shop data
(function () {
    try {
        FR.Shop.wallet = parseInt(localStorage.getItem('fr_wallet') || '0', 10);
        var saved = JSON.parse(localStorage.getItem('fr_shop') || 'null');
        if (saved) {
            if (saved.activeOutfit) FR.Shop.activeOutfit = saved.activeOutfit;
            for (var k in saved.powerups || {}) {
                if (FR.Shop.powerups[k]) {
                    FR.Shop.powerups[k].qty = saved.powerups[k].qty || 0;
                    FR.Shop.powerups[k].selected = saved.powerups[k].selected || false;
                }
            }
            for (var c in saved.cosmetics || {}) {
                if (FR.Shop.cosmetics[c]) {
                    FR.Shop.cosmetics[c].owned = saved.cosmetics[c].owned || false;
                }
            }
        }
    } catch (e) {}
})();

FR.Shop.save = function () {
    try {
        localStorage.setItem('fr_wallet', String(FR.Shop.wallet));
        var data = { activeOutfit: FR.Shop.activeOutfit, powerups: {}, cosmetics: {} };
        for (var k in FR.Shop.powerups) {
            data.powerups[k] = { qty: FR.Shop.powerups[k].qty, selected: FR.Shop.powerups[k].selected };
        }
        for (var c in FR.Shop.cosmetics) {
            data.cosmetics[c] = { owned: FR.Shop.cosmetics[c].owned };
        }
        localStorage.setItem('fr_shop', JSON.stringify(data));
    } catch (e) {}
    if (FR.Fire && FR.Fire.isSignedIn()) FR.Fire.sync();
};

// ---- Settings (volume + key bindings) ----
FR.Settings = {
    volume: 1.0,
    bindings: {
        moveLeft:  ['ArrowLeft', 'KeyA'],
        moveRight: ['ArrowRight', 'KeyD'],
        jump:      ['ArrowUp', 'KeyW', 'Space'],
        slide:     ['ArrowDown', 'KeyS'],
    }
};

(function () {
    try {
        var saved = JSON.parse(localStorage.getItem('fr_settings') || 'null');
        if (saved) {
            if (typeof saved.volume === 'number') FR.Settings.volume = saved.volume;
            if (saved.bindings) {
                for (var k in saved.bindings) {
                    if (FR.Settings.bindings[k] && Array.isArray(saved.bindings[k])) {
                        FR.Settings.bindings[k] = saved.bindings[k];
                    }
                }
            }
        }
    } catch (e) {}
})();

FR.Settings.save = function () {
    try {
        localStorage.setItem('fr_settings', JSON.stringify({
            volume: FR.Settings.volume,
            bindings: FR.Settings.bindings
        }));
    } catch (e) {}
    if (FR.Fire && FR.Fire.isSignedIn()) FR.Fire.sync();
};

// ---- Shared object containers ----
FR.obsList   = [];
FR.coinList  = [];
FR.particles = [];
FR.segments  = [];

// ---- Shared Three.js references (set during init) ----
FR.scene    = null;
FR.camera   = null;
FR.renderer = null;
FR.composer = null;
FR.clock    = null;

// ---- Shared materials / meshes (set during init) ----
FR.mat      = {};
FR.player   = {};
FR.sky      = null;
FR.lights   = {};
FR.leaves   = null;
FR.fireflies = null;
