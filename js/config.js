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
    mode:       'loading',   // loading, start, playing, dying, gameover, shop, settings, leaderboard, username, mp-queue, mp-playing, mp-dying, mp-gameover, mp-result
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
    slideBlend: 0,
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
    totalCoins: 0,
    shieldActive: false,
    magnetActive: false,
    doubleCoins:  false,
    // Multiplayer state
    mpLives: 0,
    mpMaxLives: 3,
    mpMatchId: null,
    mpOpponentScore: 0,
    mpOpponentLives: 3,
    mpOpponentFinished: false,
    mpOpponentName: '',
    mpOpponentIcon: null,
    mpIsFinished: false,
    mpSyncTimer: 0,
    mpInvincible: false,
    mpInvincibleTimer: 0,
    mpCountdown: 0,
    mpPlayerKey: null,
};

// Load persisted high scores
try {
    FR.S.highScore = parseInt(localStorage.getItem('fr_hs') || '0', 10);
    FR.S.highCoins = parseInt(localStorage.getItem('fr_hc') || '0', 10);
    FR.S.totalCoins = parseInt(localStorage.getItem('fr_tc') || '0', 10);
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
        // ---- Default ----
        explorer:    { name: 'Explorer',      cost: 0,   owned: true,  jacket: 0x2a6699, scarf: 0xcc3333, hat: 0x5a3818 },
        // ---- Original ----
        arctic:      { name: 'Arctic',         cost: 80,  owned: false, jacket: 0xe8e8f0, scarf: 0x66ccee, hat: 0xd0d0d8 },
        crimson:     { name: 'Crimson',        cost: 80,  owned: false, jacket: 0x8b1a1a, scarf: 0xff6622, hat: 0x5a2018 },
        ranger:      { name: 'Forest Ranger',  cost: 100, owned: false, jacket: 0x2a5a22, scarf: 0xc8b070, hat: 0x3a6a28 },
        golden:      { name: 'Golden',         cost: 150, owned: false, jacket: 0xdaa520, scarf: 0xffd700, hat: 0xb8860b },
        midnight:    { name: 'Midnight',       cost: 90,  owned: false, jacket: 0x1a1a2e, scarf: 0x6644aa, hat: 0x2a2040 },
        ocean:       { name: 'Ocean',          cost: 90,  owned: false, jacket: 0x1a7a8a, scarf: 0x44ddcc, hat: 0x145a6a },
        sunset:      { name: 'Sunset',         cost: 100, owned: false, jacket: 0xdd6633, scarf: 0xffaa55, hat: 0xaa4422 },
        royal:       { name: 'Royal',          cost: 120, owned: false, jacket: 0x5522aa, scarf: 0xeebb33, hat: 0x441888 },
        stealth:     { name: 'Stealth',        cost: 120, owned: false, jacket: 0x2a2a2a, scarf: 0x444444, hat: 0x1a1a1a },
        cherry:      { name: 'Cherry Blossom', cost: 130, owned: false, jacket: 0xee88aa, scarf: 0xffccdd, hat: 0xcc6688 },
        toxic:       { name: 'Toxic',          cost: 140, owned: false, jacket: 0x33aa22, scarf: 0xaaff00, hat: 0x228811 },
        ember:       { name: 'Ember',          cost: 160, owned: false, jacket: 0x881100, scarf: 0xff4400, hat: 0x660800 },
        phantom:     { name: 'Phantom',        cost: 200, owned: false, jacket: 0xf0f0f0, scarf: 0xcccccc, hat: 0xe0e0e0 },
        // ---- Nature & Seasons ----
        spring:      { name: 'Spring Bloom',   cost: 90,  owned: false, jacket: 0x7ac26a, scarf: 0xf0a0c0, hat: 0x5aa04a },
        autumn:      { name: 'Autumn',         cost: 90,  owned: false, jacket: 0xb86830, scarf: 0xd4a040, hat: 0x8a4a1a },
        frost:       { name: 'Winter Frost',   cost: 100, owned: false, jacket: 0xa0c8e8, scarf: 0xd8eeff, hat: 0x88b0d0 },
        summer:      { name: 'Summer',         cost: 90,  owned: false, jacket: 0xf0c040, scarf: 0xff8844, hat: 0xd0a020 },
        jungle:      { name: 'Jungle',         cost: 100, owned: false, jacket: 0x1a6030, scarf: 0x88aa44, hat: 0x0e4420 },
        coral:       { name: 'Coral Reef',     cost: 110, owned: false, jacket: 0x2ab0b0, scarf: 0xf07898, hat: 0x1a9090 },
        sandstorm:   { name: 'Sandstorm',      cost: 80,  owned: false, jacket: 0xc8a868, scarf: 0xe0c888, hat: 0xa88848 },
        moss:        { name: 'Moss',           cost: 80,  owned: false, jacket: 0x5a7a3a, scarf: 0x8aaa5a, hat: 0x4a6a2a },
        // ---- Fantasy & Mythical ----
        dragonscale: { name: 'Dragon Scale',   cost: 160, owned: false, jacket: 0x8a1818, scarf: 0xd4a020, hat: 0x6a0c0c },
        wizard:      { name: 'Wizard',         cost: 150, owned: false, jacket: 0x3a2288, scarf: 0x8866cc, hat: 0x2a1868 },
        shadow:      { name: 'Shadow',         cost: 140, owned: false, jacket: 0x1a1a22, scarf: 0x3a3a4a, hat: 0x101018 },
        celestial:   { name: 'Celestial',      cost: 180, owned: false, jacket: 0xe8e0f0, scarf: 0xf0d860, hat: 0xd0c8e0 },
        iceking:     { name: 'Ice King',       cost: 170, owned: false, jacket: 0x6aaade, scarf: 0xb8d8f0, hat: 0x4a8abe },
        inferno:     { name: 'Inferno',        cost: 160, owned: false, jacket: 0xa01800, scarf: 0xff6820, hat: 0x800c00 },
        enchanted:   { name: 'Enchanted',      cost: 140, owned: false, jacket: 0x20887a, scarf: 0x9a6acc, hat: 0x106a5a },
        wraith:      { name: 'Wraith',         cost: 130, owned: false, jacket: 0x5a6a5a, scarf: 0x88aa88, hat: 0x4a5a4a },
        // ---- Neon & Modern ----
        neongreen:   { name: 'Neon Green',     cost: 120, owned: false, jacket: 0x18181e, scarf: 0x00ff66, hat: 0x101016 },
        neonpink:    { name: 'Neon Pink',      cost: 120, owned: false, jacket: 0x1a1a22, scarf: 0xff44aa, hat: 0x121218 },
        cyberpunk:   { name: 'Cyberpunk',      cost: 150, owned: false, jacket: 0x2a1848, scarf: 0x00ddee, hat: 0x1e1038 },
        laser:       { name: 'Laser',          cost: 130, owned: false, jacket: 0xcc1818, scarf: 0x2288ff, hat: 0xaa1010 },
        hologram:    { name: 'Hologram',       cost: 170, owned: false, jacket: 0xb8c8d8, scarf: 0xd0e0f0, hat: 0xa0b0c0 },
        electric:    { name: 'Electric',       cost: 110, owned: false, jacket: 0xddcc10, scarf: 0x3388ee, hat: 0xbbaa00 },
        // ---- Military & Tactical ----
        camo:        { name: 'Camo',           cost: 100, owned: false, jacket: 0x4a5a30, scarf: 0x6a7a40, hat: 0x3a4a22 },
        desertops:   { name: 'Desert Ops',     cost: 100, owned: false, jacket: 0xb8a070, scarf: 0xd0c090, hat: 0x988050 },
        navyseal:    { name: 'Navy Seal',      cost: 120, owned: false, jacket: 0x1a2a4a, scarf: 0x2a3a5a, hat: 0x101a38 },
        arcticops:   { name: 'Arctic Ops',     cost: 110, owned: false, jacket: 0xd0d0d8, scarf: 0x8898a8, hat: 0xb8b8c0 },
        // ---- Sports & Casual ----
        varsity:     { name: 'Varsity',        cost: 90,  owned: false, jacket: 0xcc2222, scarf: 0xf0f0f0, hat: 0xaa1818 },
        skater:      { name: 'Skater',         cost: 80,  owned: false, jacket: 0x208888, scarf: 0xee8830, hat: 0x186868 },
        streetwear:  { name: 'Streetwear',     cost: 130, owned: false, jacket: 0x1a1a1a, scarf: 0xd4a020, hat: 0x101010 },
        athletic:    { name: 'Athletic',       cost: 90,  owned: false, jacket: 0x2266bb, scarf: 0xe8e8f0, hat: 0x1a4a99 },
    },
    activeOutfit: 'explorer',
    icons: {
        // ---- Common (19) ----
        wolf:        { name: 'Wolf',        icon: '\u{1F43A}', bg: '#6b7b8d', rarity: 'common', owned: false },
        fox:         { name: 'Fox',         icon: '\u{1F98A}', bg: '#d4854a', rarity: 'common', owned: false },
        bear:        { name: 'Bear',        icon: '\u{1F43B}', bg: '#8b6542', rarity: 'common', owned: false },
        eagle:       { name: 'Eagle',       icon: '\u{1F985}', bg: '#5a7a4a', rarity: 'common', owned: false },
        deer:        { name: 'Deer',        icon: '\u{1F98C}', bg: '#9a7a52', rarity: 'common', owned: false },
        owl:         { name: 'Owl',         icon: '\u{1F989}', bg: '#7a6a5a', rarity: 'common', owned: false },
        frog:        { name: 'Frog',        icon: '\u{1F438}', bg: '#4a8a3a', rarity: 'common', owned: false },
        butterfly:   { name: 'Butterfly',   icon: '\u{1F98B}', bg: '#7a5aaa', rarity: 'common', owned: false },
        chipmunk:    { name: 'Chipmunk',    icon: '\u{1F43F}', bg: '#b88a5a', rarity: 'common', owned: false },
        duck:        { name: 'Duck',        icon: '\u{1F986}', bg: '#5a8a6a', rarity: 'common', owned: false },
        turtle:      { name: 'Turtle',      icon: '\u{1F422}', bg: '#3a7a5a', rarity: 'common', owned: false },
        boar:        { name: 'Boar',        icon: '\u{1F417}', bg: '#7a6a5a', rarity: 'common', owned: false },
        lizard:      { name: 'Lizard',      icon: '\u{1F98E}', bg: '#6a9a4a', rarity: 'common', owned: false },
        bee:         { name: 'Bee',         icon: '\u{1F41D}', bg: '#c4a832', rarity: 'common', owned: false },
        bird:        { name: 'Bird',        icon: '\u{1F426}', bg: '#5a7aaa', rarity: 'common', owned: false },
        hedgehog:    { name: 'Hedgehog',    icon: '\u{1F994}', bg: '#8a7a6a', rarity: 'common', owned: false },
        fish:        { name: 'Fish',        icon: '\u{1F41F}', bg: '#4a7aaa', rarity: 'common', owned: false },
        bat:         { name: 'Bat',         icon: '\u{1F987}', bg: '#5a4a6a', rarity: 'common', owned: false },
        caterpillar: { name: 'Caterpillar', icon: '\u{1F41B}', bg: '#6aaa4a', rarity: 'common', owned: false },
        // ---- Uncommon (13) ----
        rabbit:      { name: 'Rabbit',      icon: '\u{1F430}', bg: '#d4a0b0', rarity: 'uncommon', owned: false },
        paw:         { name: 'Paw',         icon: '\u{1F43E}', bg: '#8a6a5a', rarity: 'uncommon', owned: false },
        tree:        { name: 'Tree',        icon: '\u{1F332}', bg: '#2a6a3a', rarity: 'uncommon', owned: false },
        mushroom:    { name: 'Mushroom',    icon: '\u{1F344}', bg: '#a0522d', rarity: 'uncommon', owned: false },
        flamingo:    { name: 'Flamingo',    icon: '\u{1F9A9}', bg: '#d46a8a', rarity: 'uncommon', owned: false },
        penguin:     { name: 'Penguin',     icon: '\u{1F427}', bg: '#4a5a7a', rarity: 'uncommon', owned: false },
        parrot:      { name: 'Parrot',      icon: '\u{1F99C}', bg: '#3aaa5a', rarity: 'uncommon', owned: false },
        octopus:     { name: 'Octopus',     icon: '\u{1F419}', bg: '#aa4a7a', rarity: 'uncommon', owned: false },
        flower:      { name: 'Flower',      icon: '\u{1F33A}', bg: '#cc4466', rarity: 'uncommon', owned: false },
        sunflower:   { name: 'Sunflower',   icon: '\u{1F33B}', bg: '#ccaa22', rarity: 'uncommon', owned: false },
        clover:      { name: 'Clover',      icon: '\u{1F340}', bg: '#2a8a3a', rarity: 'uncommon', owned: false },
        moon:        { name: 'Moon',        icon: '\u{1F319}', bg: '#c4aa44', rarity: 'uncommon', owned: false },
        whale:       { name: 'Whale',       icon: '\u{1F40B}', bg: '#3a5a8a', rarity: 'uncommon', owned: false },
        // ---- Rare (10) ----
        dragon:      { name: 'Dragon',      icon: '\u{1F432}', bg: '#3a8a4a', rarity: 'rare', owned: false },
        unicorn:     { name: 'Unicorn',     icon: '\u{1F984}', bg: '#b48adc', rarity: 'rare', owned: false },
        phoenix:     { name: 'Phoenix',     icon: '\u{1F525}', bg: '#cc4422', rarity: 'rare', owned: false },
        lion:        { name: 'Lion',        icon: '\u{1F981}', bg: '#c4883a', rarity: 'rare', owned: false },
        leopard:     { name: 'Leopard',     icon: '\u{1F406}', bg: '#b89a4a', rarity: 'rare', owned: false },
        peacock:     { name: 'Peacock',     icon: '\u{1F99A}', bg: '#2a8a7a', rarity: 'rare', owned: false },
        crocodile:   { name: 'Crocodile',   icon: '\u{1F40A}', bg: '#4a6a3a', rarity: 'rare', owned: false },
        dinosaur:    { name: 'Dinosaur',    icon: '\u{1F996}', bg: '#6a8a4a', rarity: 'rare', owned: false },
        rainbow:     { name: 'Rainbow',     icon: '\u{1F308}', bg: '#6a5aaa', rarity: 'rare', owned: false },
        swan:        { name: 'Swan',        icon: '\u{1F9A2}', bg: '#8a8aaa', rarity: 'rare', owned: false },
        // ---- Epic (6) ----
        diamond:     { name: 'Diamond',     icon: '\u{1F48E}', bg: '#4a6acc', rarity: 'epic', owned: false },
        crown:       { name: 'Crown',       icon: '\u{1F451}', bg: '#aa8822', rarity: 'epic', owned: false },
        volcano:     { name: 'Volcano',     icon: '\u{1F30B}', bg: '#aa3a1a', rarity: 'epic', owned: false },
        scorpion:    { name: 'Scorpion',    icon: '\u{1F982}', bg: '#8a6a2a', rarity: 'epic', owned: false },
        snowflake:   { name: 'Snowflake',   icon: '\u{2744}',  bg: '#5a8acc', rarity: 'epic', owned: false },
        wave:        { name: 'Wave',        icon: '\u{1F30A}', bg: '#2a6aaa', rarity: 'epic', owned: false },
        // ---- Legendary (2) ----
        star:        { name: 'Star',        icon: '\u{2B50}',  bg: '#cc9900', rarity: 'legendary', owned: false },
        comet:       { name: 'Comet',       icon: '\u{2604}',  bg: '#cc6622', rarity: 'legendary', owned: false },
    },
    activeIcon: null,
    CRATE_COST: 500,
    RARITY_COLORS: { common: '#aaa', uncommon: '#5b5', rare: '#48f', epic: '#a5c', legendary: '#fa0' },
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
            if (saved.activeIcon !== undefined) FR.Shop.activeIcon = saved.activeIcon;
            for (var ic in saved.icons || {}) {
                if (FR.Shop.icons[ic]) {
                    FR.Shop.icons[ic].owned = saved.icons[ic].owned || false;
                }
            }
        }
    } catch (e) {}

    // Seed totalCoins from wallet for existing players (one-time migration)
    if (FR.S.totalCoins === 0 && FR.Shop.wallet > 0) {
        FR.S.totalCoins = FR.Shop.wallet;
        try { localStorage.setItem('fr_tc', String(FR.S.totalCoins)); } catch (e) {}
    }
})();

FR.Shop.save = function () {
    try {
        localStorage.setItem('fr_wallet', String(FR.Shop.wallet));
        var data = { activeOutfit: FR.Shop.activeOutfit, activeIcon: FR.Shop.activeIcon, powerups: {}, cosmetics: {}, icons: {} };
        for (var k in FR.Shop.powerups) {
            data.powerups[k] = { qty: FR.Shop.powerups[k].qty, selected: FR.Shop.powerups[k].selected };
        }
        for (var c in FR.Shop.cosmetics) {
            data.cosmetics[c] = { owned: FR.Shop.cosmetics[c].owned };
        }
        for (var ic in FR.Shop.icons) {
            data.icons[ic] = { owned: FR.Shop.icons[ic].owned };
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
