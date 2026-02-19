/* ================================================================
   game.js - Main game loop, Three.js setup, input handling,
             camera, state management, spawning, collisions,
             day/night environment, UI, initialization
   ================================================================ */
(function () {
    'use strict';
    var C = FR.C, S = FR.S, W = FR.World, E = FR.Effects, A = FR.Audio;

    // ============================================================
    // UI REFERENCES
    // ============================================================
    var ui = {
        loading:    document.getElementById('loading'),
        loadFill:   document.getElementById('load-fill'),
        uiRoot:     document.getElementById('ui'),
        hud:        document.getElementById('hud'),
        hudScore:   document.getElementById('hud-score'),
        hudCoins:   document.getElementById('hud-coins'),
        hudSpeed:   document.getElementById('hud-speed'),
        hudBest:    document.getElementById('hud-best'),
        startScr:   document.getElementById('start-screen'),
        overScr:    document.getElementById('gameover-screen'),
        goScore:    document.getElementById('go-score'),
        goCoins:    document.getElementById('go-coins'),
        goNewBest:  document.getElementById('go-new-best'),
        shopScr:    document.getElementById('shop-screen'),
        shopWallet: document.getElementById('shop-wallet'),
        shopPU:     document.getElementById('shop-powerups'),
        shopCos:    document.getElementById('shop-cosmetics'),
        shopRefreshTimer: document.getElementById('shop-refresh-timer'),
        shopRefreshBtn:  document.getElementById('shop-refresh-btn'),
        shopBack:       document.getElementById('shop-back'),
        shopInvBtn:     document.getElementById('shop-inventory-btn'),
        invScr:         document.getElementById('inventory-screen'),
        invOutfits:     document.getElementById('inv-outfits'),
        invIcons:       document.getElementById('inv-icons'),
        invBack:        document.getElementById('inv-back'),
        startPU:    document.getElementById('start-powerups'),
        startShopBtn: document.getElementById('start-shop-btn'),
        startInvBtn:  document.getElementById('start-inv-btn'),
        goShopBtn:  document.getElementById('go-shop-btn'),
        goHomeBtn:  document.getElementById('go-home-btn'),
        settingsScr:  document.getElementById('settings-screen'),
        settingsBack: document.getElementById('settings-back'),
        settingsReset: document.getElementById('settings-reset'),
        volSlider:    document.getElementById('vol-slider'),
        volValue:     document.getElementById('vol-value'),
        settingsControls: document.getElementById('settings-controls'),
        startSettingsBtn: document.getElementById('start-settings-btn'),
        goSettingsBtn:    document.getElementById('go-settings-btn'),
        settingsUsernameRow:   document.getElementById('settings-username-row'),
        settingsUsernameInput: document.getElementById('settings-username-input'),
        settingsUsernameSave:  document.getElementById('settings-username-save'),
        settingsUsernameMsg:   document.getElementById('settings-username-msg'),
        ctrlGrid:     document.querySelector('.controls-hint'),
        startPlayBtn: document.getElementById('start-play-btn'),
        // Username modal
        usernameScr:     document.getElementById('username-screen'),
        usernameInput:   document.getElementById('username-input'),
        usernameError:   document.getElementById('username-error'),
        usernameConfirm: document.getElementById('username-confirm'),
        // Leaderboard
        lbScr:      document.getElementById('leaderboard-screen'),
        lbTable:    document.getElementById('lb-table'),
        lbEmpty:    document.getElementById('lb-empty'),
        lbHint:     document.getElementById('lb-signin-hint'),
        lbBack:     document.getElementById('lb-back'),
        startLbBtn: document.getElementById('start-lb-btn'),
        goLbBtn:    document.getElementById('go-lb-btn'),
        lbTabScore: document.getElementById('lb-tab-score'),
        lbTabCoins: document.getElementById('lb-tab-coins'),
        lbHeaderValue: document.getElementById('lb-header-value'),
        // Multiplayer
        mpQueueScr:    document.getElementById('mp-queue-screen'),
        mpQueueCancel: document.getElementById('mp-queue-cancel'),
        mpHud:         document.getElementById('mp-hud'),
        mpHudIcon:     document.getElementById('mp-hud-icon'),
        mpHudName:     document.getElementById('mp-hud-name'),
        mpHudScore:    document.getElementById('mp-hud-score'),
        mpHudLives:    document.getElementById('mp-hud-lives'),
        mpPlayerLives: document.getElementById('mp-player-lives'),
        mpCountdown:   document.getElementById('mp-countdown'),
        mpCountdownNum:document.getElementById('mp-countdown-num'),
        mpResultScr:   document.getElementById('mp-result-screen'),
        mpResultTitle: document.getElementById('mp-result-title'),
        mpResultMyScore: document.getElementById('mp-result-my-score'),
        mpResultOppName: document.getElementById('mp-result-opp-name'),
        mpResultOppScore:document.getElementById('mp-result-opp-score'),
        mpResultCoins:  document.getElementById('mp-result-coins'),
        mpResultBonus:  document.getElementById('mp-result-bonus'),
        mpResultAgain:  document.getElementById('mp-result-again'),
        mpResultHome:   document.getElementById('mp-result-home'),
        startMpBtn:     document.getElementById('start-mp-btn'),
        // Crate system
        shopCrates:   document.getElementById('shop-crates'),
        crateReveal:  document.getElementById('crate-reveal'),
        crateRevealCard: document.getElementById('crate-reveal-card'),
        crateRevealIcon: document.getElementById('crate-reveal-icon'),
        crateRevealName: document.getElementById('crate-reveal-name'),
        crateRevealRarity: document.getElementById('crate-reveal-rarity'),
        crateRevealHint: document.getElementById('crate-reveal-hint'),
        crateRevealParticles: document.getElementById('crate-reveal-particles'),
        // Settings icon picker
        settingsIconRow:    document.getElementById('settings-icon-row'),
        settingsIconPicker: document.getElementById('settings-icon-picker'),
        // Quests
        questsScr:       document.getElementById('quests-screen'),
        questsList:      document.getElementById('quests-list'),
        questsBack:      document.getElementById('quests-back'),
        questsXpLevel:   document.getElementById('quests-xp-level'),
        questsXpFill:    document.getElementById('quests-xp-fill'),
        questsXpText:    document.getElementById('quests-xp-text'),
        questsBonusHint: document.getElementById('quests-bonus-hint'),
        questsBonusBtn:  document.getElementById('quests-bonus-btn'),
        startQuestsBtn:  document.getElementById('start-quests-btn'),
        startPassBtn:    document.getElementById('start-pass-btn'),
        startXpBadge:    document.getElementById('start-xp-badge'),
        // Quests tabs (Season Pass)
        questsTabDaily:      document.getElementById('quests-tab-daily'),
        questsTabPass:       document.getElementById('quests-tab-pass'),
        questsDailyContent:  document.getElementById('quests-daily-content'),
        questsPassContent:   document.getElementById('quests-pass-content'),
        passDaysLeft:        document.getElementById('pass-days-left'),
        passCurrentLevel:    document.getElementById('pass-current-level'),
        passTierList:        document.getElementById('pass-tier-list'),
        // Stats
        statsScr:       document.getElementById('stats-screen'),
        statsContent:   document.getElementById('stats-content'),
        statsBack:      document.getElementById('stats-back'),
        startStatsBtn:  document.getElementById('start-stats-btn'),
        // Inventory tabs (Achievements + Trails)
        invTabItems:     document.getElementById('inv-tab-items'),
        invTabAch:       document.getElementById('inv-tab-ach'),
        invItemsContent: document.getElementById('inv-items-content'),
        invAchContent:   document.getElementById('inv-ach-content'),
        achGrid:         document.getElementById('ach-grid'),
        trailGrid:       document.getElementById('trail-grid'),
    };
    var shopReturnTo = 'start'; // which screen to go back to
    var settingsReturnTo = 'start';
    var lbReturnTo = 'start';
    var lbActiveTab = 'score';
    var usernameReturnMode = 'start'; // mode to restore after username picker
    var rebindTarget = null; // { action, index } when listening for key

    // ============================================================
    // THREE.JS SCENE SETUP
    // ============================================================
    function setupScene() {
        var scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x88aa88, 0.010);
        FR.scene = scene;

        var camera = new THREE.PerspectiveCamera(C.BASE_FOV, window.innerWidth / window.innerHeight, 0.5, 300);
        FR.camera = camera;

        var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild(renderer.domElement);
        FR.renderer = renderer;

        // Lights
        var amb = new THREE.AmbientLight(0x667766, 0.55);
        scene.add(amb); FR.lights.amb = amb;

        var dir = new THREE.DirectionalLight(0xfff5e0, 0.95);
        dir.position.set(10, 22, 15);
        dir.castShadow = true;
        dir.shadow.mapSize.set(2048, 2048);
        dir.shadow.camera.near = 1; dir.shadow.camera.far = 90;
        dir.shadow.camera.left = -28; dir.shadow.camera.right = 28;
        dir.shadow.camera.top = 35; dir.shadow.camera.bottom = -12;
        dir.shadow.bias = -0.0008;
        scene.add(dir); scene.add(dir.target);
        FR.lights.dir = dir;

        var hemi = new THREE.HemisphereLight(0x88bbcc, 0x445522, 0.35);
        scene.add(hemi); FR.lights.hemi = hemi;

        // Rim light (backlight for depth)
        var rim = new THREE.DirectionalLight(0xeeeeee, 0.25);
        rim.position.set(-5, 12, -8);
        scene.add(rim); scene.add(rim.target);
        FR.lights.rim = rim;

        // Post-processing (optional: bloom + vignette)
        setupPostProcessing(scene, camera, renderer);

        // Resize
        window.addEventListener('resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (FR.composer) FR.composer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    function setupPostProcessing(scene, camera, renderer) {
        if (typeof THREE.EffectComposer === 'undefined') { FR.composer = null; return; }
        try {
            var composer = new THREE.EffectComposer(renderer);
            var renderPass = new THREE.RenderPass(scene, camera);
            composer.addPass(renderPass);

            var bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.35,   // strength
                0.4,    // radius
                0.82    // threshold
            );
            composer.addPass(bloomPass);

            // Vignette shader pass
            var vignetteShader = {
                uniforms: {
                    tDiffuse:  { value: null },
                    darkness:  { value: 1.3 },
                    offset:    { value: 1.0 },
                },
                vertexShader: [
                    'varying vec2 vUv;',
                    'void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
                ].join('\n'),
                fragmentShader: [
                    'uniform sampler2D tDiffuse;',
                    'uniform float darkness;',
                    'uniform float offset;',
                    'varying vec2 vUv;',
                    'void main() {',
                    '  vec4 color = texture2D(tDiffuse, vUv);',
                    '  vec2 uv = (vUv - 0.5) * vec2(offset);',
                    '  color.rgb *= 1.0 - dot(uv, uv) * darkness;',
                    '  gl_FragColor = color;',
                    '}',
                ].join('\n'),
            };
            var vigPass = new THREE.ShaderPass(vignetteShader);
            composer.addPass(vigPass);

            FR.composer = composer;
        } catch (e) {
            FR.composer = null;
        }
    }

    // ============================================================
    // INPUT
    // ============================================================
    var keys = {}, pressed = {};
    document.addEventListener('keydown', function (e) {
        if (rebindTarget && S.mode === 'settings') return; // handled by capture-phase rebind listener
        if (S.mode === 'username') return; // let username input handle keys
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return; // let text inputs handle keys
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyB'].indexOf(e.code) !== -1) {
            e.preventDefault();
        }
        if (!keys[e.code]) pressed[e.code] = true;
        keys[e.code] = true;
    });
    document.addEventListener('keyup', function (e) { keys[e.code] = false; });

    // Cheat code: type "ADD500K" during gameplay to add 500,000 to score
    var cheatBuffer = '';
    var cheatCode = 'ADD500K';
    // Cheat code: type "GETC0INS" anywhere (not in MP) to add 5,000 coins
    var coinCheatBuffer = '';
    var coinCheatCode = 'GETC0INS';
    document.addEventListener('keydown', function (e) {
        var ch = e.key.toUpperCase();
        if (ch.length !== 1) return;

        // Score cheat (gameplay only, not MP)
        if (S.mode === 'playing' && !S.mpMatchId) {
            cheatBuffer += ch;
            if (cheatBuffer.length > cheatCode.length) {
                cheatBuffer = cheatBuffer.slice(-cheatCode.length);
            }
            if (cheatBuffer === cheatCode) {
                S.score += 500000;
                cheatBuffer = '';
            }
        } else {
            cheatBuffer = '';
        }

        // Coin cheat (any non-MP mode)
        if (!S.mpMatchId) {
            coinCheatBuffer += ch;
            if (coinCheatBuffer.length > coinCheatCode.length) {
                coinCheatBuffer = coinCheatBuffer.slice(-coinCheatCode.length);
            }
            if (coinCheatBuffer === coinCheatCode) {
                FR.Shop.wallet += 5000;
                FR.Shop.save();
                coinCheatBuffer = '';
            }
        } else {
            coinCheatBuffer = '';
        }
    });

    // ---- Mobile touch controls ----
    var touchStartX = 0, touchStartY = 0;
    var tapped = false;
    var SWIPE_THRESHOLD = 30;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: false });

    document.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        var absDx = Math.abs(dx);
        var absDy = Math.abs(dy);

        if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) {
            // Short tap — but ignore if it landed on a button/link
            var tgt = e.target;
            if (tgt && (tgt.tagName === 'BUTTON' || tgt.closest('button') || tgt.closest('.screen-btn') || tgt.closest('.play-btn') || tgt.closest('.nav-btn') || tgt.closest('.auth-signin-btn'))) {
                return;
            }
            tapped = true;
            return;
        }

        e.preventDefault();

        if (absDx > absDy) {
            // Horizontal swipe
            if (dx < 0) pressed['ArrowLeft'] = true;
            else pressed['ArrowRight'] = true;
        } else {
            // Vertical swipe
            if (dy < 0) pressed['ArrowUp'] = true;
            else pressed['ArrowDown'] = true;
        }
    }, { passive: false });

    document.addEventListener('touchmove', function (e) {
        if (S.mode === 'playing' || S.mode === 'dying' || S.mode === 'start' || S.mode === 'gameover' ||
            S.mode === 'mp-playing' || S.mode === 'mp-dying') {
            e.preventDefault();
        }
    }, { passive: false });

    function anyPressed(binds) {
        for (var i = 0; i < binds.length; i++) if (pressed[binds[i]]) return true;
        return false;
    }

    function processInput() {
        var B = FR.Settings.bindings;
        if (anyPressed(B.moveLeft)) {
            if (S.pLane < 2) S.pLane++;
        }
        if (anyPressed(B.moveRight)) {
            if (S.pLane > 0) S.pLane--;
        }
        if (anyPressed(B.jump)) {
            if (!S.jumping && !S.sliding) {
                S.jumping = true;
                S.vY = C.JUMP_FORCE;
                S.jumpsThisRun++;
                A.play('jump');
            }
        }
        if (anyPressed(B.slide)) {
            if (!S.jumping && !S.sliding) {
                S.sliding = true;
                S.slideTmr = C.SLIDE_DUR;
                S.slidesThisRun++;
                A.play('slide');
            }
        }
        for (var k in pressed) pressed[k] = false;
    }

    // ============================================================
    // SPAWNING
    // ============================================================
    function spawnObstacles() {
        while (S.lastObsZ < S.pZ + C.SPAWN_AHEAD) {
            S.lastObsZ += C.OBS_GAP + Math.random() * 10;
            var count = Math.random() < 0.28 ? 2 : 1;
            var avail = [0, 1, 2];
            var chosen = [];
            for (var i = 0; i < count; i++) {
                var idx = Math.floor(Math.random() * avail.length);
                chosen.push(avail[idx]); avail.splice(idx, 1);
            }
            for (var j = 0; j < chosen.length; j++) {
                var obs = W.spawnObstacle(chosen[j]);
                obs.z = S.lastObsZ;
                obs.mesh.position.z = S.lastObsZ;
                FR.scene.add(obs.mesh);
                FR.obsList.push(obs);
            }
            // Coins in free lanes near obstacles
            if (Math.random() < 0.55) {
                for (var a = 0; a < avail.length; a++) {
                    if (Math.random() < 0.55) {
                        FR.coinList.push(W.makeCoin(avail[a], S.lastObsZ));
                    }
                }
            }
        }
    }

    function spawnCoinGroups() {
        while (S.lastCoinZ < S.pZ + C.SPAWN_AHEAD) {
            S.lastCoinZ += 8 + Math.random() * 14;
            var lane = Math.floor(Math.random() * 3);
            var count = 3 + Math.floor(Math.random() * 5);
            // Coin patterns: line, arc, or zigzag
            var pattern = Math.random();
            for (var i = 0; i < count; i++) {
                var cLane = lane;
                if (pattern > 0.7) { // zigzag
                    cLane = Math.max(0, Math.min(2, lane + (i % 2 === 0 ? 0 : (Math.random() < 0.5 ? -1 : 1))));
                }
                var cY = C.COIN_Y;
                if (pattern > 0.4 && pattern <= 0.7) { // arc
                    cY += Math.sin((i / count) * Math.PI) * 1.5;
                }
                var coin = W.makeCoin(cLane, S.lastCoinZ + i * 2.2);
                coin.mesh.position.y = cY;
                coin.arcY = cY;
                FR.coinList.push(coin);
            }
        }
    }

    function cleanupObjects() {
        var i;
        for (i = FR.obsList.length - 1; i >= 0; i--) {
            if (FR.obsList[i].z < S.pZ - C.CLEANUP) {
                FR.scene.remove(FR.obsList[i].mesh);
                FR.obsList.splice(i, 1);
            }
        }
        for (i = FR.coinList.length - 1; i >= 0; i--) {
            var c = FR.coinList[i];
            if (c.z < S.pZ - C.CLEANUP || c.collected) {
                if (!c.collected) FR.scene.remove(c.mesh);
                FR.coinList.splice(i, 1);
            }
        }
    }

    // ============================================================
    // COLLISION DETECTION
    // ============================================================
    function checkCollisions() {
        for (var i = 0; i < FR.obsList.length; i++) {
            var obs = FR.obsList[i];
            var zHit = obs.type === 'gap' ? 1.9 : obs.type === 'low' ? 0.9 : 0.5;
            if (Math.abs(S.pZ - obs.z) > zHit) continue;
            if (Math.abs(S.pX - C.LANES[obs.lane]) > C.LANE_W * 0.44) continue;

            if (obs.type === 'low' || obs.type === 'gap') {
                if (S.pY > 1.2) continue;
            }
            if (obs.type === 'high') {
                if (S.sliding) continue;
            }
            return obs;
        }
        return null;
    }

    // ---- Near-Miss Detection ----
    var nearMissCooldown = 0;
    var NEAR_MISS_CD = 0.5;

    function checkNearMiss(dt) {
        if (nearMissCooldown > 0) { nearMissCooldown -= dt; return; }
        for (var i = 0; i < FR.obsList.length; i++) {
            var obs = FR.obsList[i];
            if (obs._nearMissed) continue;
            // Must be in same XZ zone
            if (Math.abs(S.pZ - obs.z) > 1.5) continue;
            if (Math.abs(S.pX - C.LANES[obs.lane]) > C.LANE_W * 0.5) continue;

            var dodged = false;
            if ((obs.type === 'low' || obs.type === 'gap') && S.pY > 1.2 && S.pY < 2.5) {
                dodged = true;
            }
            if (obs.type === 'high' && S.sliding === true) {
                dodged = true;
            }
            if (dodged) {
                obs._nearMissed = true;
                nearMissCooldown = NEAR_MISS_CD;
                triggerNearMiss();
                return;
            }
        }
    }

    function triggerNearMiss() {
        S.score += 200;
        E.triggerFlash('#ffffff', 0.15);
        E.spawnBurst(FR.player.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0x44ddff, 8, 3, 3);
        A.play('nearmiss');
    }

    function checkCoinCollect() {
        var collectRadius = S.magnetActive ? C.LANE_W * 2.5 : C.LANE_W * 0.55;
        var coinValue = S.doubleCoins ? 2 : 1;
        var scoreValue = S.doubleCoins ? 100 : 50;
        for (var i = 0; i < FR.coinList.length; i++) {
            var c = FR.coinList[i];
            if (c.collected) continue;
            if (Math.abs(S.pZ - c.z) > 1.6) continue;
            if (Math.abs(S.pX - C.LANES[c.lane]) > collectRadius) continue;

            c.collected = true;
            S.coins += coinValue;
            S.score += scoreValue;
            FR.scene.remove(c.mesh);
            A.play('coin');
            E.spawnBurst(c.mesh.position.clone(), 0xffd700, 10, 4, 5);
        }
    }

    // ============================================================
    // ENVIRONMENT (day/night cycle)
    // ============================================================
    var nightAmount = 0; // 0=day, 1=full night

    function updateEnvironment(dt) {
        S.gTime += dt;
        var t = (S.gTime % C.CYCLE_DUR) / C.CYCLE_DUR;
        var sky, fog, ambC, dirC, ambI, dirI, fogD;

        if (t < 0.35) {
            // Day
            sky  = [0x4488cc, 0x88aa88];
            ambC = 0x667766; dirC = 0xfff5e0;
            ambI = 0.55; dirI = 0.95; fogD = 0.010;
            nightAmount = 0;
        } else if (t < 0.48) {
            // Day -> Dusk
            var s1 = (t - 0.35) / 0.13;
            sky  = [lerpC(0x4488cc, 0xcc6830, s1), lerpC(0x88aa88, 0x886644, s1)];
            ambC = lerpC(0x667766, 0x664433, s1);
            dirC = lerpC(0xfff5e0, 0xff6622, s1);
            ambI = 0.55 - s1 * 0.18; dirI = 0.95 - s1 * 0.35;
            fogD = 0.010 + s1 * 0.006;
            nightAmount = s1 * 0.3;
        } else if (t < 0.55) {
            // Dusk -> Night
            var s2 = (t - 0.48) / 0.07;
            sky  = [lerpC(0xcc6830, 0x0e1428, s2), lerpC(0x886644, 0x101824, s2)];
            ambC = lerpC(0x664433, 0x1a1a38, s2);
            dirC = lerpC(0xff6622, 0x2a3a5a, s2);
            ambI = 0.37 - s2 * 0.14; dirI = 0.60 - s2 * 0.32;
            fogD = 0.016 + s2 * 0.010;
            nightAmount = 0.3 + s2 * 0.7;
        } else if (t < 0.75) {
            // Night
            sky  = [0x0e1428, 0x101824];
            ambC = 0x1a1a38; dirC = 0x2a3a5a;
            ambI = 0.23; dirI = 0.28; fogD = 0.026;
            nightAmount = 1;
        } else {
            // Night -> Dawn -> Day
            var s3 = (t - 0.75) / 0.25;
            sky  = [lerpC(0x0e1428, 0x4488cc, s3), lerpC(0x101824, 0x88aa88, s3)];
            ambC = lerpC(0x1a1a38, 0x667766, s3);
            dirC = lerpC(0x2a3a5a, 0xfff5e0, s3);
            ambI = 0.23 + s3 * 0.32; dirI = 0.28 + s3 * 0.67;
            fogD = 0.026 - s3 * 0.016;
            nightAmount = 1 - s3;
        }

        // Apply to sky dome
        if (FR.sky) {
            FR.sky.material.uniforms.topColor.value.set(sky[0]);
            FR.sky.material.uniforms.bottomColor.value.set(sky[1]);
        }

        FR.scene.fog.color.set(Array.isArray(sky) ? sky[1] : sky);
        FR.scene.fog.density = fogD;
        FR.lights.amb.color.set(ambC);  FR.lights.amb.intensity = ambI;
        FR.lights.dir.color.set(dirC);  FR.lights.dir.intensity = dirI;

        // Move light with player
        FR.lights.dir.position.set(S.pX + 10, 22, S.pZ + 15);
        FR.lights.dir.target.position.set(S.pX, 0, S.pZ + 5);
        FR.lights.dir.target.updateMatrixWorld();

        // Rim light follows player, color shifts with time of day
        if (FR.lights.rim) {
            FR.lights.rim.position.set(S.pX - 5, 12, S.pZ - 8);
            FR.lights.rim.target.position.set(S.pX, 1.5, S.pZ);
            FR.lights.rim.target.updateMatrixWorld();
            if (nightAmount > 0.5) {
                FR.lights.rim.color.set(0x6688cc);
            } else if (nightAmount > 0.2) {
                FR.lights.rim.color.set(0xff8844);
            } else {
                FR.lights.rim.color.set(0xeeeeee);
            }
            FR.lights.rim.intensity = 0.2 + nightAmount * 0.15;
        }

        // Sky dome follows player
        if (FR.sky) FR.sky.position.set(S.pX, 0, S.pZ);

        // Tone mapping exposure shifts
        FR.renderer.toneMappingExposure = 1.1 - nightAmount * 0.3;
    }

    function lerpC(a, b, t) {
        var c1 = new THREE.Color(a), c2 = new THREE.Color(b);
        c1.lerp(c2, t);
        return c1.getHex();
    }

    // ============================================================
    // CAMERA
    // ============================================================
    function updateCamera(dt) {
        // Dynamic FOV based on speed
        var speedFrac = (S.speed - C.INIT_SPEED) / (C.MAX_SPEED - C.INIT_SPEED);
        var targetFOV = C.BASE_FOV + (C.MAX_FOV - C.BASE_FOV) * speedFrac;
        FR.camera.fov += (targetFOV - FR.camera.fov) * 3 * dt;
        FR.camera.updateProjectionMatrix();

        // Target position
        var tX = S.pX * 0.4;
        var tY = C.CAM_UP + S.pY * 0.25;
        var tZ = S.pZ - C.CAM_BACK;

        // Smooth follow
        FR.camera.position.x += (tX - FR.camera.position.x) * 6 * dt;
        FR.camera.position.y += (tY - FR.camera.position.y) * 4.5 * dt;
        FR.camera.position.z += (tZ - FR.camera.position.z) * 7 * dt;

        // Screen shake
        var shake = E.getShakeOffset();
        FR.camera.position.x += shake.x;
        FR.camera.position.y += shake.y;

        FR.camera.lookAt(S.pX * 0.3, 1.8 + S.pY * 0.12, S.pZ + 14);
    }

    // ============================================================
    // UI UPDATES
    // ============================================================
    function updateHUD() {
        ui.hudScore.textContent = Math.floor(S.score);
        ui.hudCoins.textContent = S.coins;
        var mult = (S.speed / C.INIT_SPEED).toFixed(1);
        ui.hudSpeed.textContent = mult + 'x';
    }

    // ============================================================
    // SHOP SYSTEM
    // ============================================================
    function openShop(returnTo) {
        shopReturnTo = returnTo || 'start';
        S.mode = 'shop';
        ui.startScr.classList.add('hidden');
        ui.overScr.classList.add('hidden');
        ui.shopScr.classList.remove('hidden');
        renderShop();
        startShopTimer();
    }

    function closeShop() {
        stopShopTimer();
        ui.shopScr.classList.add('hidden');
        S.mode = shopReturnTo;
        if (shopReturnTo === 'start') {
            ui.startScr.classList.remove('hidden');
            renderStartPowerups();
        } else if (shopReturnTo === 'gameover') {
            ui.overScr.classList.remove('hidden');
        }
    }

    // ============================================================
    // INVENTORY
    // ============================================================
    var invReturnTo = 'shop';

    function openInventory(returnTo) {
        invReturnTo = returnTo || 'shop';
        stopShopTimer();
        ui.startScr.classList.add('hidden');
        ui.shopScr.classList.add('hidden');
        ui.invScr.classList.remove('hidden');
        S.mode = 'inventory';
        // Reset to Items tab
        invActiveTab = 'items';
        ui.invTabItems.classList.add('active');
        ui.invTabAch.classList.remove('active');
        ui.invItemsContent.style.display = '';
        ui.invAchContent.style.display = 'none';
        renderInventory();
    }

    function closeInventory() {
        ui.invScr.classList.add('hidden');
        if (invReturnTo === 'shop') {
            ui.shopScr.classList.remove('hidden');
            S.mode = 'shop';
            renderShop();
            startShopTimer();
        } else {
            ui.startScr.classList.remove('hidden');
            S.mode = 'start';
            renderStartPowerups();
        }
    }

    function renderInventory() {
        var shop = FR.Shop;
        ui.invBack.textContent = invReturnTo === 'shop' ? 'Back to Shop' : 'Back';

        // All outfits (owned shown with equip, unowned shown as locked)
        var outfitHTML = '';
        for (var c in shop.cosmetics) {
            var cos = shop.cosmetics[c];
            var isActive = shop.activeOutfit === c;
            if (cos.owned) {
                outfitHTML += '<div class="inv-outfit-card' + (isActive ? ' equipped' : '') + '" data-action="inv-equip-outfit" data-key="' + c + '">';
                outfitHTML += '<div class="shop-card-swatch" style="background:#' + cos.jacket.toString(16).padStart(6, '0') + '"></div>';
                outfitHTML += '<div class="shop-card-name">' + cos.name + '</div>';
                if (isActive) {
                    outfitHTML += '<span class="shop-btn owned-label">Equipped</span>';
                } else {
                    outfitHTML += '<button class="shop-btn equip" data-action="inv-equip-outfit" data-key="' + c + '">Equip</button>';
                }
                outfitHTML += '</div>';
            } else {
                outfitHTML += '<div class="inv-outfit-card locked">';
                outfitHTML += '<div class="shop-card-swatch" style="background:rgba(255,255,255,0.08)"></div>';
                outfitHTML += '<div class="shop-card-name">' + cos.name + '</div>';
                outfitHTML += '<span class="shop-btn owned-label">\u{1F512} Locked</span>';
                outfitHTML += '</div>';
            }
        }
        ui.invOutfits.innerHTML = outfitHTML;

        // All icons (owned shown with equip, unowned shown as locked)
        var iconHTML = '';
        for (var ik in shop.icons) {
            var ic = shop.icons[ik];
            var isEquipped = shop.activeIcon === ik;
            var rarityColor = shop.RARITY_COLORS[ic.rarity] || '#aaa';
            if (ic.owned) {
                iconHTML += '<div class="shop-icon-cell' + (isEquipped ? ' equipped' : '') + '" data-action="inv-equip-icon" data-key="' + ik + '">';
                iconHTML += '<div class="shop-icon-preview" style="background:' + ic.bg + '">' + ic.icon + '</div>';
                iconHTML += '<div class="shop-icon-name">' + ic.name + '</div>';
                iconHTML += '<div class="shop-icon-rarity" style="color:' + rarityColor + '">' + ic.rarity + '</div>';
                iconHTML += '</div>';
            } else {
                iconHTML += '<div class="shop-icon-cell locked">';
                iconHTML += '<div class="shop-icon-preview locked-preview">?</div>';
                iconHTML += '<div class="shop-icon-rarity" style="color:' + rarityColor + '">' + ic.rarity + '</div>';
                iconHTML += '</div>';
            }
        }
        ui.invIcons.innerHTML = iconHTML;

        // Render trails
        renderTrails();
    }

    // Inventory click handler (event delegation)
    ui.invScr.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.getAttribute('data-action');
        var key = btn.getAttribute('data-key');
        var shop = FR.Shop;

        if (action === 'inv-equip-outfit') {
            if (shop.cosmetics[key] && shop.cosmetics[key].owned) {
                shop.activeOutfit = key;
                W.applyOutfit(key);
                shop.save();
                renderInventory();
            }
        } else if (action === 'inv-equip-icon') {
            if (shop.icons[key] && shop.icons[key].owned) {
                shop.activeIcon = (shop.activeIcon === key) ? null : key;
                shop.save();
                renderInventory();
            }
        }
    });

    // Inventory tab switching
    var invActiveTab = 'items';
    ui.invTabItems.addEventListener('click', function () {
        if (invActiveTab === 'items') return;
        invActiveTab = 'items';
        ui.invTabItems.classList.add('active');
        ui.invTabAch.classList.remove('active');
        ui.invItemsContent.style.display = '';
        ui.invAchContent.style.display = 'none';
    });
    ui.invTabAch.addEventListener('click', function () {
        if (invActiveTab === 'ach') return;
        invActiveTab = 'ach';
        ui.invTabAch.classList.add('active');
        ui.invTabItems.classList.remove('active');
        ui.invItemsContent.style.display = 'none';
        ui.invAchContent.style.display = '';
        renderAchievements();
    });

    // Trail click handler (event delegation on inv screen)
    ui.invScr.addEventListener('click', function (e) {
        var trailBtn = e.target.closest('[data-action="equip-trail"]');
        if (trailBtn) {
            var key = trailBtn.getAttribute('data-key');
            if (FR.Trails.types[key] && FR.Trails.types[key].owned) {
                FR.Trails.active = key;
                FR.Trails.save();
                renderTrails();
            }
            return;
        }
        var buyBtn = e.target.closest('[data-action="buy-trail"]');
        if (buyBtn) {
            var bkey = buyBtn.getAttribute('data-key');
            if (FR.Trails.types[bkey] && !FR.Trails.types[bkey].owned && FR.Shop.wallet >= FR.Trails.cost) {
                FR.Shop.wallet -= FR.Trails.cost;
                FR.Trails.types[bkey].owned = true;
                FR.Shop.save();
                FR.Trails.save();
                renderTrails();
            }
            return;
        }
    });

    // Achievement claim handler
    ui.achGrid.addEventListener('click', function (e) {
        var btn = e.target.closest('.ach-claim-btn');
        if (!btn) return;
        var achId = btn.getAttribute('data-ach-id');
        var tier = parseInt(btn.getAttribute('data-tier'), 10);
        if (!isNaN(tier)) claimAchievement(achId, tier);
    });

    ui.shopInvBtn.addEventListener('click', function () { openInventory('shop'); });
    ui.startInvBtn.addEventListener('click', function () { openInventory('start'); });
    ui.invBack.addEventListener('click', function () { closeInventory(); });

    // ============================================================
    // ACHIEVEMENT SYSTEM
    // ============================================================
    function checkAchievements() {
        var defs = FR.Achievements.defs;
        var prog = FR.Achievements.progress;
        for (var i = 0; i < defs.length; i++) {
            var def = defs[i];
            var val = FR.S[def.stat] || 0;
            var claimed = prog[def.id] || 0;
            // Just mark which tiers are earned (doesn't auto-claim)
            // Progress is checked when rendering UI
        }
    }

    function getAchievementEarnedTier(def) {
        var val = FR.S[def.stat] || 0;
        var earned = 0;
        for (var t = 0; t < def.tiers.length; t++) {
            if (val >= def.tiers[t]) earned = t + 1;
        }
        return earned;
    }

    function renderAchievements() {
        var defs = FR.Achievements.defs;
        var prog = FR.Achievements.progress;
        var colors = FR.Achievements.TIER_COLORS;
        var html = '';
        for (var i = 0; i < defs.length; i++) {
            var def = defs[i];
            var claimed = prog[def.id] || 0;
            var earned = getAchievementEarnedTier(def);
            var val = FR.S[def.stat] || 0;

            html += '<div class="ach-card">';
            html += '<div class="ach-icon">' + def.icon + '</div>';
            html += '<div class="ach-info">';
            html += '<div class="ach-name">' + def.name + '</div>';
            html += '<div class="ach-tiers-row">';
            for (var t = 0; t < 3; t++) {
                var isEarned = earned > t;
                var isClaimed = claimed > t;
                html += '<span class="ach-tier-dot' + (isClaimed ? ' claimed' : isEarned ? ' earned' : '') + '" style="' + (isEarned || isClaimed ? 'background:' + colors[t] : '') + '" title="' + def.tiers[t].toLocaleString() + '"></span>';
            }
            html += '</div>';
            // Show current progress vs next unclaimed tier
            var nextTier = claimed < 3 ? claimed : 2;
            html += '<div class="ach-progress-text">' + val.toLocaleString() + ' / ' + def.tiers[nextTier].toLocaleString() + '</div>';
            html += '</div>';
            // Claim button
            if (earned > claimed) {
                html += '<button class="ach-claim-btn" data-ach-id="' + def.id + '" data-tier="' + claimed + '">Claim ' + def.coins[claimed] + '</button>';
            } else if (claimed >= 3) {
                html += '<span class="ach-complete">\u2713</span>';
            } else {
                html += '<span class="ach-locked">\uD83D\uDD12</span>';
            }
            html += '</div>';
        }
        ui.achGrid.innerHTML = html;
    }

    function claimAchievement(achId, tierIdx) {
        var defs = FR.Achievements.defs;
        var prog = FR.Achievements.progress;
        var def = null;
        for (var i = 0; i < defs.length; i++) {
            if (defs[i].id === achId) { def = defs[i]; break; }
        }
        if (!def) return;
        var claimed = prog[achId] || 0;
        if (claimed !== tierIdx) return;
        var earned = getAchievementEarnedTier(def);
        if (earned <= claimed) return;
        // Award coins
        FR.Shop.wallet += def.coins[tierIdx];
        prog[achId] = claimed + 1;
        FR.Shop.save();
        FR.Achievements.save();
        renderAchievements();
    }

    // ============================================================
    // TRAIL UI (inside inventory)
    // ============================================================
    function renderTrails() {
        var trails = FR.Trails;
        var html = '';
        for (var k in trails.types) {
            var t = trails.types[k];
            var isActive = trails.active === k;
            html += '<div class="trail-cell' + (isActive ? ' equipped' : '') + '">';
            html += '<div class="trail-preview">' + t.icon + '</div>';
            html += '<div class="trail-name">' + t.name + '</div>';
            if (t.owned) {
                if (isActive) {
                    html += '<span class="trail-status">Equipped</span>';
                } else {
                    html += '<button class="trail-equip-btn" data-action="equip-trail" data-key="' + k + '">Equip</button>';
                }
            } else {
                html += '<button class="trail-buy-btn" data-action="buy-trail" data-key="' + k + '"' + (FR.Shop.wallet >= trails.cost ? '' : ' disabled') + '>' + trails.cost + ' Buy</button>';
            }
            html += '</div>';
        }
        ui.trailGrid.innerHTML = html;
    }

    // ============================================================
    // SEASON PASS
    // ============================================================
    function renderSeasonPass() {
        var SP = FR.SeasonPass;
        var Q = FR.Quests;
        var now = Math.floor(Date.now() / 86400000);
        var daysLeft = Math.max(0, 30 - (now - SP.seasonStart));
        ui.passDaysLeft.textContent = 'Season ends in ' + daysLeft + ' day' + (daysLeft !== 1 ? 's' : '');
        ui.passCurrentLevel.textContent = 'Level ' + Q.level + ' / 30';

        var html = '';
        for (var i = 0; i < 30; i++) {
            var reward = SP.REWARDS[i];
            var unlocked = Q.level >= i + 1;
            var claimed = SP.tiers[i] === true;
            var stateClass = claimed ? 'claimed' : unlocked ? 'unlocked' : 'locked';
            html += '<div class="pass-tier-card ' + stateClass + '">';
            html += '<div class="pass-tier-num">' + (i + 1) + '</div>';
            html += '<div class="pass-tier-icon">' + reward.icon + '</div>';
            html += '<div class="pass-tier-label">' + reward.label + '</div>';
            if (claimed) {
                html += '<span class="pass-claimed-check">\u2713</span>';
            } else if (unlocked) {
                html += '<button class="pass-claim-btn" data-tier="' + i + '">Claim</button>';
            } else {
                html += '<span class="pass-lock">\uD83D\uDD12</span>';
            }
            html += '</div>';
        }
        ui.passTierList.innerHTML = html;
    }

    function claimSeasonTier(tierIdx) {
        var SP = FR.SeasonPass;
        var Q = FR.Quests;
        if (tierIdx < 0 || tierIdx >= 30) return;
        if (SP.tiers[tierIdx]) return; // already claimed
        if (Q.level < tierIdx + 1) return; // not unlocked

        var reward = SP.REWARDS[tierIdx];
        switch (reward.type) {
            case 'coins':
                FR.Shop.wallet += reward.value;
                break;
            case 'outfit':
                if (FR.Shop.cosmetics[reward.value]) {
                    FR.Shop.cosmetics[reward.value].owned = true;
                }
                break;
            case 'icon':
                if (FR.Shop.icons[reward.value]) {
                    FR.Shop.icons[reward.value].owned = true;
                }
                break;
            case 'powerup':
                if (FR.Shop.powerups[reward.value]) {
                    FR.Shop.powerups[reward.value].qty += (reward.qty || 1);
                }
                break;
            case 'trail':
                if (FR.Trails.types[reward.value]) {
                    FR.Trails.types[reward.value].owned = true;
                    FR.Trails.save();
                }
                break;
        }
        SP.tiers[tierIdx] = true;
        FR.Shop.save();
        SP.save();
        renderSeasonPass();
    }

    // ============================================================
    // QUESTS SCREEN
    // ============================================================
    var questsReturnTo = 'start';
    var questsBonusClaimed = false;

    function openQuests(returnTo) {
        questsReturnTo = returnTo || 'start';
        // Check if new day
        var today = Math.floor(Date.now() / 86400000);
        if (FR.Quests.dayIndex !== today) {
            FR.Quests.dayIndex = today;
            FR.Quests.quests = FR.Quests.generate(today);
            questsBonusClaimed = false;
            FR.Quests.save();
        }
        ui.startScr.classList.add('hidden');
        ui.overScr.classList.add('hidden');
        ui.questsScr.classList.remove('hidden');
        S.mode = 'quests';
        // Reset to Daily tab
        questsActiveTab = 'daily';
        ui.questsTabDaily.classList.add('active');
        ui.questsTabPass.classList.remove('active');
        ui.questsDailyContent.style.display = '';
        ui.questsPassContent.style.display = 'none';
        renderQuests();
    }

    function closeQuests() {
        ui.questsScr.classList.add('hidden');
        S.mode = questsReturnTo;
        if (questsReturnTo === 'start') {
            ui.startScr.classList.remove('hidden');
            updateXpBadge();
            renderStartPowerups();
        } else if (questsReturnTo === 'gameover') {
            ui.overScr.classList.remove('hidden');
        }
    }

    var QUEST_ICONS = {
        score: '\u{1F3AF}',
        coins: '\u{1FA99}',
        jumps: '\u{1F998}',
        slides: '\u{1F3BF}',
        games: '\u{1F3AE}',
        distance: '\u{1F3C3}'
    };

    function renderQuests() {
        var Q = FR.Quests;
        // XP bar
        var xpInLevel = Q.xp % 200;
        var pct = Math.min(100, (xpInLevel / 200) * 100);
        ui.questsXpLevel.textContent = 'Lv. ' + Q.level;
        ui.questsXpFill.style.width = pct + '%';
        ui.questsXpText.textContent = xpInLevel + ' / 200 XP';

        // Quest cards
        var html = '';
        for (var i = 0; i < Q.quests.length; i++) {
            var q = Q.quests[i];
            var prog = Math.min(q.progress, q.target);
            var progPct = Math.min(100, (prog / q.target) * 100);
            var complete = prog >= q.target;
            var icon = QUEST_ICONS[q.type] || '\u{2753}';

            var btnClass, btnText;
            if (q.claimed) {
                btnClass = 'claimed';
                btnText = '\u2713';
            } else if (complete) {
                btnClass = 'ready';
                btnText = 'Claim';
            } else {
                btnClass = 'not-ready';
                btnText = prog + '/' + q.target;
            }

            html += '<div class="quest-card' + (q.claimed ? ' quest-done' : '') + '">'
                + '<div class="quest-icon">' + icon + '</div>'
                + '<div class="quest-info">'
                + '<div class="quest-desc">' + q.desc + '</div>'
                + '<div class="quest-reward-text">' + q.reward + ' coins \u00B7 ' + q.xpReward + ' XP</div>'
                + '<div class="quest-progress-bar"><div class="quest-progress-fill" style="width:' + progPct + '%"></div></div>'
                + '<div class="quest-progress-text">' + prog + ' / ' + q.target + '</div>'
                + '</div>'
                + '<button class="quest-claim-btn ' + btnClass + '" data-quest="' + i + '">' + btnText + '</button>'
                + '</div>';
        }
        ui.questsList.innerHTML = html;

        // Bonus button
        var allClaimed = Q.quests.every(function (q) { return q.claimed; });
        if (allClaimed && !questsBonusClaimed) {
            ui.questsBonusBtn.disabled = false;
            ui.questsBonusHint.textContent = 'All quests complete! Claim your bonus!';
        } else if (questsBonusClaimed) {
            ui.questsBonusBtn.disabled = true;
            ui.questsBonusBtn.textContent = 'Bonus Claimed \u2713';
            ui.questsBonusHint.textContent = 'Come back tomorrow for new quests!';
        } else {
            ui.questsBonusBtn.disabled = true;
            ui.questsBonusBtn.textContent = 'Claim Bonus';
            ui.questsBonusHint.textContent = 'Complete all 5 for bonus 100 XP!';
        }
    }

    function claimQuest(index) {
        var q = FR.Quests.quests[index];
        if (!q || q.claimed || q.progress < q.target) return;
        q.claimed = true;
        FR.Shop.wallet += q.reward;
        FR.Quests.xp += q.xpReward;
        FR.Quests.calcLevel();
        FR.Shop.save();
        FR.Quests.save();
        renderQuests();
    }

    function claimAllBonus() {
        if (questsBonusClaimed) return;
        var allClaimed = FR.Quests.quests.every(function (q) { return q.claimed; });
        if (!allClaimed) return;
        questsBonusClaimed = true;
        FR.Quests.xp += 100;
        FR.Quests.calcLevel();
        FR.Quests.save();
        renderQuests();
    }

    function updateXpBadge() {
        if (ui.startXpBadge) {
            ui.startXpBadge.textContent = 'Lv. ' + FR.Quests.level;
        }
    }

    // Check if bonus was already claimed today (all claimed + stored)
    (function () {
        var allClaimed = FR.Quests.quests.every(function (q) { return q.claimed; });
        // If all claimed, check if bonus was claimed by looking for a stored flag
        try {
            var bonusDay = parseInt(localStorage.getItem('fr_quest_bonus_day') || '0', 10);
            if (bonusDay === FR.Quests.dayIndex && allClaimed) questsBonusClaimed = true;
        } catch (e) {}
    })();

    // Override claimAllBonus to persist flag
    var _origClaimAllBonus = claimAllBonus;
    claimAllBonus = function () {
        _origClaimAllBonus();
        try { localStorage.setItem('fr_quest_bonus_day', String(FR.Quests.dayIndex)); } catch (e) {}
    };

    // Event delegation for quest claim buttons
    ui.questsList.addEventListener('click', function (e) {
        var btn = e.target.closest('.quest-claim-btn');
        if (!btn) return;
        var idx = parseInt(btn.getAttribute('data-quest'), 10);
        if (!isNaN(idx)) claimQuest(idx);
    });
    ui.questsBonusBtn.addEventListener('click', function () { claimAllBonus(); });
    ui.questsBack.addEventListener('click', function () { closeQuests(); });
    ui.startQuestsBtn.addEventListener('click', function () { openQuests('start'); });
    ui.startPassBtn.addEventListener('click', function () {
        openQuests('start');
        // Switch to Season Pass tab
        questsActiveTab = 'pass';
        ui.questsTabPass.classList.add('active');
        ui.questsTabDaily.classList.remove('active');
        ui.questsDailyContent.style.display = 'none';
        ui.questsPassContent.style.display = '';
        renderSeasonPass();
    });

    // Quests tab switching (Daily / Season Pass)
    var questsActiveTab = 'daily';
    ui.questsTabDaily.addEventListener('click', function () {
        if (questsActiveTab === 'daily') return;
        questsActiveTab = 'daily';
        ui.questsTabDaily.classList.add('active');
        ui.questsTabPass.classList.remove('active');
        ui.questsDailyContent.style.display = '';
        ui.questsPassContent.style.display = 'none';
    });
    ui.questsTabPass.addEventListener('click', function () {
        if (questsActiveTab === 'pass') return;
        questsActiveTab = 'pass';
        ui.questsTabPass.classList.add('active');
        ui.questsTabDaily.classList.remove('active');
        ui.questsDailyContent.style.display = 'none';
        ui.questsPassContent.style.display = '';
        renderSeasonPass();
    });

    // Season Pass claim handler
    ui.passTierList.addEventListener('click', function (e) {
        var btn = e.target.closest('.pass-claim-btn');
        if (!btn) return;
        var tier = parseInt(btn.getAttribute('data-tier'), 10);
        if (!isNaN(tier)) claimSeasonTier(tier);
    });

    // ============================================================
    // STATS DASHBOARD
    // ============================================================
    var statsReturnTo = 'start';

    function openStats(returnTo) {
        statsReturnTo = returnTo || 'start';
        ui.startScr.classList.add('hidden');
        ui.overScr.classList.add('hidden');
        ui.statsScr.classList.remove('hidden');
        S.mode = 'stats';
        renderStats();
    }

    function closeStats() {
        ui.statsScr.classList.add('hidden');
        S.mode = statsReturnTo;
        if (statsReturnTo === 'start') {
            ui.startScr.classList.remove('hidden');
            renderStartPowerups();
        } else if (statsReturnTo === 'gameover') {
            ui.overScr.classList.remove('hidden');
        }
    }

    function renderStats() {
        // Count achievement tiers claimed
        var achDefs = FR.Achievements.defs;
        var achProg = FR.Achievements.progress;
        var totalTiers = achDefs.length * 3;
        var claimedTiers = 0;
        for (var a = 0; a < achDefs.length; a++) {
            var p = achProg[achDefs[a].id] || { tier: 0 };
            claimedTiers += p.tier;
        }

        var totalXp = FR.Quests.xp || 0;
        var level = Math.floor(totalXp / 200) + 1;

        function fmt(n) {
            if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
            if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
            return String(n);
        }

        var html = '';
        // Lifetime
        html += '<div class="stats-section-title">Lifetime</div>';
        html += '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-value">' + fmt(S.totalGames) + '</div><div class="stat-label">Games Played</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + fmt(S.totalDistance) + '</div><div class="stat-label">Total Distance</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + fmt(S.totalJumps) + '</div><div class="stat-label">Total Jumps</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + fmt(S.totalSlides) + '</div><div class="stat-label">Total Slides</div></div>';
        html += '<div class="stat-card wide"><div class="stat-value">' + fmt(S.totalCoins) + '</div><div class="stat-label">Total Coins Earned</div></div>';
        html += '</div>';

        // Records
        html += '<div class="stats-section-title">Records</div>';
        html += '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-value">' + fmt(S.highScore) + '</div><div class="stat-label">High Score</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + fmt(S.highCoins) + '</div><div class="stat-label">Best Coins</div></div>';
        html += '</div>';

        // Progression
        html += '<div class="stats-section-title">Progression</div>';
        html += '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-value">' + level + '</div><div class="stat-label">Level</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + fmt(totalXp) + '</div><div class="stat-label">Total XP</div></div>';
        html += '<div class="stat-card wide"><div class="stat-value">' + claimedTiers + ' / ' + totalTiers + '</div><div class="stat-label">Achievement Tiers</div></div>';
        html += '</div>';

        ui.statsContent.innerHTML = html;
    }

    ui.statsBack.addEventListener('click', function () { closeStats(); });
    ui.startStatsBtn.addEventListener('click', function () { openStats('start'); });

    // ============================================================
    // ROTATING SHOP (6-hour refresh)
    // ============================================================
    var ROTATION_MS = 6 * 60 * 60 * 1000; // 6 hours
    var REFRESH_COST = 100;
    var shopTimerInterval = null;
    var manualRefreshCount = 0; // resets each natural rotation

    function seededRandom(seed) {
        // Simple deterministic PRNG (mulberry32)
        return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    function getRotatingOutfits() {
        var shop = FR.Shop;
        var allKeys = [];
        for (var k in shop.cosmetics) {
            if (k === 'explorer') continue; // exclude free default
            allKeys.push(k);
        }

        var rotationIndex = Math.floor(Date.now() / ROTATION_MS) + manualRefreshCount;
        var rng = seededRandom(rotationIndex);

        // Shuffle using seeded RNG and pick first 4
        var shuffled = allKeys.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1));
            var tmp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = tmp;
        }

        return shuffled.slice(0, 4);
    }

    function getTimeUntilRefresh() {
        var now = Date.now();
        var nextRefresh = (Math.floor(now / ROTATION_MS) + 1) * ROTATION_MS;
        return nextRefresh - now;
    }

    function formatCountdown(ms) {
        var totalSec = Math.floor(ms / 1000);
        var h = Math.floor(totalSec / 3600);
        var m = Math.floor((totalSec % 3600) / 60);
        var s = totalSec % 60;
        return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function updateRefreshTimer() {
        var remaining = getTimeUntilRefresh();
        ui.shopRefreshTimer.textContent = 'Refreshes in ' + formatCountdown(remaining);
    }

    function startShopTimer() {
        if (shopTimerInterval) clearInterval(shopTimerInterval);
        updateRefreshTimer();
        var lastRotation = Math.floor(Date.now() / ROTATION_MS);
        shopTimerInterval = setInterval(function () {
            var currentRotation = Math.floor(Date.now() / ROTATION_MS);
            if (currentRotation !== lastRotation) {
                // Natural rotation changed — reset manual refreshes
                lastRotation = currentRotation;
                manualRefreshCount = 0;
                renderShop();
            }
            updateRefreshTimer();
        }, 1000);
    }

    // Manual refresh button
    ui.shopRefreshBtn.addEventListener('click', function () {
        var shop = FR.Shop;
        if (shop.wallet < REFRESH_COST) return;
        shop.wallet -= REFRESH_COST;
        manualRefreshCount++;
        shop.save();
        renderShop();
    });

    function stopShopTimer() {
        if (shopTimerInterval) {
            clearInterval(shopTimerInterval);
            shopTimerInterval = null;
        }
    }

    function renderShop() {
        var shop = FR.Shop;
        ui.shopWallet.textContent = shop.wallet;

        // Power-ups
        var puHTML = '';
        for (var k in shop.powerups) {
            var pu = shop.powerups[k];
            var canBuy = shop.wallet >= pu.cost;
            puHTML += '<div class="shop-card" data-pu="' + k + '">';
            puHTML += '<div class="shop-card-icon">' + pu.icon + '</div>';
            puHTML += '<div class="shop-card-name">' + pu.name + '</div>';
            puHTML += '<div class="shop-card-desc">' + pu.desc + '</div>';
            if (pu.qty > 0) {
                puHTML += '<div class="shop-card-qty">Owned: ' + pu.qty + '</div>';
            }
            puHTML += '<button class="shop-btn buy" data-action="buy-pu" data-key="' + k + '"' +
                      (canBuy ? '' : ' disabled') + '>' + pu.cost + ' Buy</button>';
            if (pu.qty > 0) {
                puHTML += '<button class="shop-btn select' + (pu.selected ? ' active' : '') +
                          '" data-action="toggle-pu" data-key="' + k + '">' +
                          (pu.selected ? 'Selected' : 'Select') + '</button>';
            }
            puHTML += '</div>';
        }
        ui.shopPU.innerHTML = puHTML;

        // Featured Outfits (rotating every 6 hours)
        var featured = getRotatingOutfits();
        var cosHTML = '';
        for (var fi = 0; fi < featured.length; fi++) {
            var c = featured[fi];
            var cos = shop.cosmetics[c];
            var isActive = shop.activeOutfit === c;
            var canBuyCos = shop.wallet >= cos.cost;
            cosHTML += '<div class="shop-card' + (isActive ? ' equipped' : '') + '" data-cos="' + c + '">';
            cosHTML += '<div class="shop-card-swatch" style="background:#' + cos.jacket.toString(16).padStart(6, '0') + '"></div>';
            cosHTML += '<div class="shop-card-name">' + cos.name + '</div>';
            if (!cos.owned) {
                cosHTML += '<button class="shop-btn buy" data-action="buy-cos" data-key="' + c + '"' +
                          (canBuyCos ? '' : ' disabled') + '>' + cos.cost + ' Buy</button>';
            } else if (isActive) {
                cosHTML += '<span class="shop-btn owned-label">Equipped</span>';
            } else {
                cosHTML += '<button class="shop-btn equip" data-action="equip" data-key="' + c + '">Equip</button>';
            }
            cosHTML += '</div>';
        }
        ui.shopCos.innerHTML = cosHTML;
        updateRefreshTimer();
        ui.shopRefreshBtn.disabled = shop.wallet < REFRESH_COST;

        // Loot Crates
        var icons = shop.icons;
        var unownedKeys = [];
        for (var ik in icons) {
            if (!icons[ik].owned) unownedKeys.push(ik);
        }
        var crateHTML = '';
        if (unownedKeys.length > 0) {
            var canBuyCrate = shop.wallet >= shop.CRATE_COST;
            crateHTML += '<div class="shop-crate-buy">';
            crateHTML += '<div class="shop-crate-emoji">\u{1F4E6}</div>';
            crateHTML += '<button class="shop-btn buy" data-action="buy-crate"' + (canBuyCrate ? '' : ' disabled') + '>' + shop.CRATE_COST + ' Open</button>';
            crateHTML += '<div class="shop-crate-remaining">' + unownedKeys.length + ' remaining</div>';
            crateHTML += '</div>';
        } else {
            crateHTML += '<div class="shop-crate-complete">Collection Complete!</div>';
        }
        ui.shopCrates.innerHTML = crateHTML;

        // Trail Crates
        var unownedTrails = getUnownedTrails();
        var trailCrateHTML = '<div class="shop-section-title">Trail Crates</div>';
        if (unownedTrails.length > 0) {
            var canBuyTrailCrate = shop.wallet >= FR.Trails.CRATE_COST;
            trailCrateHTML += '<div class="shop-crate-buy">';
            trailCrateHTML += '<div class="shop-crate-emoji">\u{1F3A8}</div>';
            trailCrateHTML += '<button class="shop-btn buy" data-action="buy-trail-crate"' + (canBuyTrailCrate ? '' : ' disabled') + '>' + FR.Trails.CRATE_COST + ' Open</button>';
            trailCrateHTML += '<div class="shop-crate-remaining">' + unownedTrails.length + ' remaining</div>';
            trailCrateHTML += '</div>';
        } else {
            trailCrateHTML += '<div class="shop-crate-complete">All Trails Unlocked!</div>';
        }
        ui.shopCrates.innerHTML += trailCrateHTML;
    }

    function renderStartPowerups() {
        var html = '';
        for (var k in FR.Shop.powerups) {
            var pu = FR.Shop.powerups[k];
            if (pu.selected && pu.qty > 0) {
                html += '<span class="pu-icon">' + pu.icon + ' ' + pu.name + '</span>';
            }
        }
        ui.startPU.innerHTML = html;
        updateXpBadge();
    }

    // Shop click handler (event delegation)
    ui.shopScr.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.getAttribute('data-action');
        var key = btn.getAttribute('data-key');
        var shop = FR.Shop;

        if (action === 'buy-pu') {
            var pu = shop.powerups[key];
            if (pu && shop.wallet >= pu.cost) {
                shop.wallet -= pu.cost;
                pu.qty++;
                shop.save();
                renderShop();
            }
        } else if (action === 'toggle-pu') {
            var p = shop.powerups[key];
            if (p) {
                p.selected = !p.selected;
                shop.save();
                renderShop();
            }
        } else if (action === 'buy-cos') {
            var cos = shop.cosmetics[key];
            if (cos && shop.wallet >= cos.cost) {
                shop.wallet -= cos.cost;
                cos.owned = true;
                shop.save();
                renderShop();
            }
        } else if (action === 'equip') {
            var co = shop.cosmetics[key];
            if (co && co.owned) {
                shop.activeOutfit = key;
                W.applyOutfit(key);
                shop.save();
                renderShop();
            }
        } else if (action === 'buy-crate') {
            openCrate();
        } else if (action === 'buy-trail-crate') {
            openTrailCrate();
        }
    });

    // ============================================================
    // LOOT CRATE SYSTEM
    // ============================================================
    var RARITY_WEIGHTS = {
        common:    40,
        uncommon:  30,
        rare:      20,
        epic:       8,
        legendary:  2
    };

    function rollRarity() {
        var roll = Math.random() * 100;
        var cumulative = 0;
        for (var r in RARITY_WEIGHTS) {
            cumulative += RARITY_WEIGHTS[r];
            if (roll < cumulative) return r;
        }
        return 'common';
    }

    function getUnownedByRarity(rarity) {
        var icons = FR.Shop.icons;
        var keys = [];
        for (var k in icons) {
            if (!icons[k].owned && icons[k].rarity === rarity) keys.push(k);
        }
        return keys;
    }

    function getAllUnowned() {
        var icons = FR.Shop.icons;
        var keys = [];
        for (var k in icons) {
            if (!icons[k].owned) keys.push(k);
        }
        return keys;
    }

    function rollCrateIcon() {
        var unowned = getAllUnowned();
        if (unowned.length === 0) return null;

        // Try weighted rarity roll, reroll if that rarity has no unowned icons
        for (var attempt = 0; attempt < 20; attempt++) {
            var rarity = rollRarity();
            var pool = getUnownedByRarity(rarity);
            if (pool.length > 0) {
                return pool[Math.floor(Math.random() * pool.length)];
            }
        }
        // Fallback: pick any unowned icon
        return unowned[Math.floor(Math.random() * unowned.length)];
    }

    function openCrate() {
        var shop = FR.Shop;
        if (shop.wallet < shop.CRATE_COST) return;

        var unowned = getAllUnowned();
        if (unowned.length === 0) return;

        var wonKey = rollCrateIcon();
        if (!wonKey) return;

        // Deduct cost and award icon
        shop.wallet -= shop.CRATE_COST;
        shop.icons[wonKey].owned = true;
        shop.save();

        showCrateReveal(wonKey);
    }

    function showCrateReveal(iconKey) {
        var ic = FR.Shop.icons[iconKey];
        var rarityColor = FR.Shop.RARITY_COLORS[ic.rarity] || '#aaa';

        // Reset animation classes
        ui.crateRevealCard.classList.remove('animate-in');
        ui.crateRevealIcon.classList.remove('animate-in');
        ui.crateRevealName.classList.remove('animate-in');
        ui.crateRevealRarity.classList.remove('animate-in');
        ui.crateRevealHint.classList.remove('animate-in');

        // Set content
        ui.crateRevealIcon.textContent = ic.icon;
        ui.crateRevealIcon.style.background = ic.bg;
        ui.crateRevealName.textContent = ic.name;
        ui.crateRevealRarity.textContent = ic.rarity;
        ui.crateRevealRarity.style.color = rarityColor;
        ui.crateRevealCard.style.borderColor = rarityColor;

        // Spawn particles
        spawnCrateParticles(rarityColor);

        // Show modal
        ui.crateReveal.classList.remove('hidden');

        // Stagger animations with requestAnimationFrame for clean start
        requestAnimationFrame(function () {
            ui.crateReveal.classList.add('visible-bg');
            ui.crateRevealCard.classList.add('animate-in');
            ui.crateRevealIcon.classList.add('animate-in');
            ui.crateRevealName.classList.add('animate-in');
            ui.crateRevealRarity.classList.add('animate-in');
            ui.crateRevealHint.classList.add('animate-in');
        });

        // Play sound if available
        if (A.play) A.play('coin');
    }

    function spawnCrateParticles(color) {
        ui.crateRevealParticles.innerHTML = '';
        var count = 16;
        for (var i = 0; i < count; i++) {
            var angle = (i / count) * Math.PI * 2;
            var dist = 60 + Math.random() * 50;
            var px = Math.cos(angle) * dist;
            var py = Math.sin(angle) * dist;
            var dot = document.createElement('div');
            dot.className = 'crate-particle';
            dot.style.background = color;
            dot.style.setProperty('--px', px + 'px');
            dot.style.setProperty('--py', py + 'px');
            dot.style.animationDelay = (0.3 + Math.random() * 0.15) + 's';
            ui.crateRevealParticles.appendChild(dot);
            // Trigger burst class in next frame
            requestAnimationFrame(function (el) {
                return function () { el.classList.add('burst'); };
            }(dot));
        }
    }

    function closeCrateReveal() {
        ui.crateReveal.classList.remove('visible-bg');
        ui.crateRevealCard.classList.remove('animate-in');
        ui.crateRevealIcon.classList.remove('animate-in');
        ui.crateRevealName.classList.remove('animate-in');
        ui.crateRevealRarity.classList.remove('animate-in');
        ui.crateRevealHint.classList.remove('animate-in');
        setTimeout(function () {
            ui.crateReveal.classList.add('hidden');
            ui.crateRevealParticles.innerHTML = '';
            renderShop();
        }, 300);
    }

    // ============================================================
    // TRAIL CRATE SYSTEM
    // ============================================================
    function getUnownedTrails() {
        var unowned = [];
        for (var k in FR.Trails.types) {
            if (!FR.Trails.types[k].owned) unowned.push(k);
        }
        return unowned;
    }

    function rollTrailCrate() {
        var unowned = getUnownedTrails();
        if (unowned.length === 0) return null;
        return unowned[Math.floor(Math.random() * unowned.length)];
    }

    function openTrailCrate() {
        var shop = FR.Shop;
        if (shop.wallet < FR.Trails.CRATE_COST) return;
        var unowned = getUnownedTrails();
        if (unowned.length === 0) return;

        var wonKey = rollTrailCrate();
        if (!wonKey) return;

        shop.wallet -= FR.Trails.CRATE_COST;
        FR.Trails.types[wonKey].owned = true;
        shop.save();
        FR.Trails.save();

        showTrailCrateReveal(wonKey);
    }

    function showTrailCrateReveal(wonKey) {
        var trail = FR.Trails.types[wonKey];
        var trailColor = '#' + trail.color.toString(16).padStart(6, '0');

        // Reset animation classes
        ui.crateRevealCard.classList.remove('animate-in');
        ui.crateRevealIcon.classList.remove('animate-in');
        ui.crateRevealName.classList.remove('animate-in');
        ui.crateRevealRarity.classList.remove('animate-in');
        ui.crateRevealHint.classList.remove('animate-in');

        // Set content
        ui.crateRevealIcon.textContent = trail.icon;
        ui.crateRevealIcon.style.background = trailColor;
        ui.crateRevealName.textContent = trail.name;
        ui.crateRevealRarity.textContent = 'Trail';
        ui.crateRevealRarity.style.color = trailColor;
        ui.crateRevealCard.style.borderColor = trailColor;

        // Spawn particles
        spawnCrateParticles(trailColor);

        // Show modal
        ui.crateReveal.classList.remove('hidden');

        requestAnimationFrame(function () {
            ui.crateReveal.classList.add('visible-bg');
            ui.crateRevealCard.classList.add('animate-in');
            ui.crateRevealIcon.classList.add('animate-in');
            ui.crateRevealName.classList.add('animate-in');
            ui.crateRevealRarity.classList.add('animate-in');
            ui.crateRevealHint.classList.add('animate-in');
        });

        if (A.play) A.play('coin');
    }

    // Dismiss crate reveal on click
    ui.crateReveal.addEventListener('click', function () {
        closeCrateReveal();
    });

    ui.shopBack.addEventListener('click', function () { closeShop(); });
    ui.startPlayBtn.addEventListener('click', function () { startGame(); });
    ui.startShopBtn.addEventListener('click', function () { openShop('start'); });
    ui.goShopBtn.addEventListener('click', function () { openShop('gameover'); });
    ui.goHomeBtn.addEventListener('click', function () { goHome(); });

    // ============================================================
    // SETTINGS SYSTEM
    // ============================================================
    function formatKey(code) {
        var map = {
            'ArrowLeft': '\u2190', 'ArrowRight': '\u2192',
            'ArrowUp': '\u2191', 'ArrowDown': '\u2193',
            'Space': 'Space', 'Escape': 'Esc',
        };
        if (map[code]) return map[code];
        if (code.startsWith('Key')) return code.slice(3);
        if (code.startsWith('Digit')) return code.slice(5);
        return code;
    }

    var actionNames = {
        moveLeft: 'Move Left',
        moveRight: 'Move Right',
        jump: 'Jump',
        slide: 'Slide'
    };

    function openSettings(returnTo) {
        settingsReturnTo = returnTo || 'start';
        S.mode = 'settings';
        rebindTarget = null;
        ui.startScr.classList.add('hidden');
        ui.overScr.classList.add('hidden');
        ui.settingsScr.classList.remove('hidden');
        renderSettings();
        if (FR.Fire) FR.Fire.updateAuthUI();
    }

    function closeSettings() {
        ui.settingsScr.classList.add('hidden');
        rebindTarget = null;
        S.mode = settingsReturnTo;
        if (settingsReturnTo === 'start') {
            ui.startScr.classList.remove('hidden');
            updateCtrlGrid();
            renderStartPowerups();
        } else if (settingsReturnTo === 'gameover') {
            ui.overScr.classList.remove('hidden');
        }
    }

    function renderSettings() {
        // Volume slider
        ui.volSlider.value = Math.round(FR.Settings.volume * 100);
        ui.volValue.textContent = Math.round(FR.Settings.volume * 100) + '%';

        // Controls grid
        var B = FR.Settings.bindings;
        var html = '';
        for (var action in actionNames) {
            html += '<div class="settings-control-row">';
            html += '<span class="settings-action">' + actionNames[action] + '</span>';
            html += '<span class="settings-keys">';
            var keys = B[action];
            for (var i = 0; i < keys.length; i++) {
                var isListening = rebindTarget && rebindTarget.action === action && rebindTarget.index === i;
                html += '<button class="settings-key' + (isListening ? ' listening' : '') +
                         '" data-action="' + action + '" data-index="' + i + '">' +
                         (isListening ? '...' : formatKey(keys[i])) + '</button>';
            }
            html += '</span>';
            html += '</div>';
        }
        ui.settingsControls.innerHTML = html;

        // Username field (only visible when signed in)
        var signedIn = FR.Fire && FR.Fire.isSignedIn();
        ui.settingsUsernameRow.style.display = signedIn ? 'block' : 'none';
        if (signedIn) {
            var currentName = FR.Fire.getUsername() || '';
            ui.settingsUsernameInput.value = currentName;
            ui.settingsUsernameSave.disabled = true;
            ui.settingsUsernameMsg.textContent = '';
            ui.settingsUsernameMsg.className = 'settings-username-msg';
        }

        // Icon picker (show if any icons owned)
        var icons = FR.Shop.icons;
        var ownedCount = 0;
        for (var oik in icons) { if (icons[oik].owned) ownedCount++; }
        ui.settingsIconRow.style.display = ownedCount > 0 ? 'block' : 'none';
        if (ownedCount > 0) {
            var pickerHTML = '';
            // "None" option
            pickerHTML += '<div class="settings-icon-option settings-icon-default' +
                          (!FR.Shop.activeIcon ? ' active' : '') + '" data-icon-key="">' +
                          '\u2715</div>';
            for (var sik in icons) {
                if (!icons[sik].owned) continue;
                var isActive = FR.Shop.activeIcon === sik;
                pickerHTML += '<div class="settings-icon-option' + (isActive ? ' active' : '') +
                              '" data-icon-key="' + sik + '" style="background:' + icons[sik].bg + '">' +
                              icons[sik].icon + '</div>';
            }
            ui.settingsIconPicker.innerHTML = pickerHTML;
        }
    }

    function updateCtrlGrid() {
        if (!ui.ctrlGrid) return;
        var B = FR.Settings.bindings;
        var moveKeys = B.moveLeft.map(formatKey).concat(B.moveRight.map(formatKey)).join('/');
        var jumpKeys = B.jump.map(formatKey).join('/');
        var slideKeys = B.slide.map(formatKey).join('/');
        ui.ctrlGrid.textContent = moveKeys + ' \u00B7 ' + jumpKeys + ' \u00B7 ' + slideKeys;
    }

    // Settings icon picker click handler
    ui.settingsIconPicker.addEventListener('click', function (e) {
        var opt = e.target.closest('.settings-icon-option');
        if (!opt) return;
        var key = opt.getAttribute('data-icon-key');
        FR.Shop.activeIcon = key || null;
        FR.Shop.save();
        renderSettings();
    });

    // Volume slider
    ui.volSlider.addEventListener('input', function () {
        var v = parseInt(ui.volSlider.value, 10) / 100;
        FR.Settings.volume = v;
        ui.volValue.textContent = Math.round(v * 100) + '%';
        A.setVolume(v);
        FR.Settings.save();
    });

    // Settings username change
    ui.settingsUsernameInput.addEventListener('input', function () {
        var val = ui.settingsUsernameInput.value;
        var currentName = (FR.Fire && FR.Fire.getUsername()) || '';
        ui.settingsUsernameMsg.textContent = '';
        ui.settingsUsernameMsg.className = 'settings-username-msg';
        if (val === currentName || val.length === 0) {
            ui.settingsUsernameSave.disabled = true;
        } else if (val.length < 2) {
            ui.settingsUsernameMsg.textContent = 'Too short';
            ui.settingsUsernameMsg.className = 'settings-username-msg error';
            ui.settingsUsernameSave.disabled = true;
        } else if (!/^[a-zA-Z0-9_]{2,16}$/.test(val)) {
            ui.settingsUsernameMsg.textContent = 'Letters, numbers & underscores only';
            ui.settingsUsernameMsg.className = 'settings-username-msg error';
            ui.settingsUsernameSave.disabled = true;
        } else {
            ui.settingsUsernameSave.disabled = false;
        }
    });

    ui.settingsUsernameSave.addEventListener('click', function () {
        var val = ui.settingsUsernameInput.value.trim();
        if (!/^[a-zA-Z0-9_]{2,16}$/.test(val)) return;
        ui.settingsUsernameSave.disabled = true;
        ui.settingsUsernameMsg.textContent = '';
        if (FR.Fire) {
            FR.Fire.setUsername(val, function (ok) {
                if (ok) {
                    ui.settingsUsernameMsg.textContent = 'Saved!';
                    ui.settingsUsernameMsg.className = 'settings-username-msg success';
                } else {
                    ui.settingsUsernameMsg.textContent = 'Failed to save. Try again.';
                    ui.settingsUsernameMsg.className = 'settings-username-msg error';
                    ui.settingsUsernameSave.disabled = false;
                }
            });
        }
    });

    ui.settingsUsernameInput.addEventListener('keydown', function (e) {
        if (e.code === 'Enter' && !ui.settingsUsernameSave.disabled) {
            ui.settingsUsernameSave.click();
        }
        e.stopPropagation(); // prevent game input capture
    });

    // Controls rebind (event delegation)
    ui.settingsControls.addEventListener('click', function (e) {
        var btn = e.target.closest('.settings-key');
        if (!btn) return;
        var action = btn.getAttribute('data-action');
        var index = parseInt(btn.getAttribute('data-index'), 10);
        rebindTarget = { action: action, index: index };
        renderSettings();
    });

    // Rebind keydown handler
    document.addEventListener('keydown', function (e) {
        if (!rebindTarget) return;
        if (S.mode !== 'settings') return;
        e.preventDefault();
        e.stopPropagation();
        if (e.code === 'Escape') {
            rebindTarget = null;
            renderSettings();
            return;
        }
        FR.Settings.bindings[rebindTarget.action][rebindTarget.index] = e.code;
        rebindTarget = null;
        FR.Settings.save();
        renderSettings();
    }, true); // capture phase so it fires before game keydown

    // Reset defaults
    ui.settingsReset.addEventListener('click', function () {
        FR.Settings.volume = 1.0;
        FR.Settings.bindings = {
            moveLeft:  ['ArrowLeft', 'KeyA'],
            moveRight: ['ArrowRight', 'KeyD'],
            jump:      ['ArrowUp', 'KeyW', 'Space'],
            slide:     ['ArrowDown', 'KeyS'],
        };
        A.setVolume(1.0);
        FR.Settings.save();
        renderSettings();
    });

    // Settings buttons
    ui.startSettingsBtn.addEventListener('click', function () { openSettings('start'); });
    ui.goSettingsBtn.addEventListener('click', function () { openSettings('gameover'); });
    ui.settingsBack.addEventListener('click', function () { closeSettings(); });

    // Auth buttons
    var startSignInBtn = document.getElementById('start-signin-btn');
    var settingsSignInBtn = document.getElementById('settings-signin-btn');
    var settingsSignOutBtn = document.getElementById('settings-signout-btn');
    if (startSignInBtn) startSignInBtn.addEventListener('click', function () { if (FR.Fire) FR.Fire.signIn(); });
    if (settingsSignInBtn) settingsSignInBtn.addEventListener('click', function () { if (FR.Fire) FR.Fire.signIn(); });
    if (settingsSignOutBtn) settingsSignOutBtn.addEventListener('click', function () { if (FR.Fire) FR.Fire.signOut(); });

    // ============================================================
    // USERNAME MODAL
    // ============================================================
    var usernameRegex = /^[a-zA-Z0-9_]{2,16}$/;

    function openUsernameModal() {
        usernameReturnMode = S.mode;
        S.mode = 'username';
        ui.startScr.classList.add('hidden');
        ui.overScr.classList.add('hidden');
        ui.usernameScr.classList.remove('hidden');
        ui.usernameInput.value = '';
        ui.usernameError.textContent = '';
        ui.usernameConfirm.disabled = true;
        setTimeout(function () { ui.usernameInput.focus(); }, 100);
    }

    function closeUsernameModal() {
        ui.usernameScr.classList.add('hidden');
        S.mode = usernameReturnMode;
        if (usernameReturnMode === 'start') {
            ui.startScr.classList.remove('hidden');
        } else if (usernameReturnMode === 'gameover') {
            ui.overScr.classList.remove('hidden');
        }
    }

    ui.usernameInput.addEventListener('input', function () {
        var val = ui.usernameInput.value;
        if (val.length === 0) {
            ui.usernameError.textContent = '';
            ui.usernameConfirm.disabled = true;
        } else if (val.length < 2) {
            ui.usernameError.textContent = 'Too short';
            ui.usernameConfirm.disabled = true;
        } else if (!usernameRegex.test(val)) {
            ui.usernameError.textContent = 'Letters, numbers & underscores only';
            ui.usernameConfirm.disabled = true;
        } else {
            ui.usernameError.textContent = '';
            ui.usernameConfirm.disabled = false;
        }
    });

    ui.usernameConfirm.addEventListener('click', function () {
        var val = ui.usernameInput.value.trim();
        if (!usernameRegex.test(val)) return;
        ui.usernameConfirm.disabled = true;
        ui.usernameError.textContent = '';
        if (FR.Fire) {
            FR.Fire.setUsername(val, function (ok) {
                if (ok) {
                    closeUsernameModal();
                } else {
                    ui.usernameError.textContent = 'Failed to save. Try again.';
                    ui.usernameConfirm.disabled = false;
                }
            });
        }
    });

    // Allow Enter key to confirm username
    ui.usernameInput.addEventListener('keydown', function (e) {
        if (e.code === 'Enter' && !ui.usernameConfirm.disabled) {
            ui.usernameConfirm.click();
        }
    });

    // Hook: firebase calls this when user has no username
    if (FR.Fire) {
        FR.Fire.onNeedUsername = function () {
            // Only show if on start or gameover screen (not mid-game)
            if (S.mode === 'start' || S.mode === 'gameover') {
                openUsernameModal();
            }
        };
    }

    // ============================================================
    // LEADERBOARD
    // ============================================================
    function openLeaderboard(returnTo) {
        lbReturnTo = returnTo || 'start';
        S.mode = 'leaderboard';
        ui.startScr.classList.add('hidden');
        ui.overScr.classList.add('hidden');
        ui.lbScr.classList.remove('hidden');

        // Reset to score tab
        lbActiveTab = 'score';
        ui.lbTabScore.classList.add('active');
        ui.lbTabCoins.classList.remove('active');
        ui.lbHeaderValue.textContent = 'Score';

        fetchAndRenderTab();
    }

    function fetchAndRenderTab() {
        renderLeaderboard([], lbActiveTab);
        ui.lbEmpty.style.display = 'none';
        ui.lbHint.style.display = 'none';

        if (FR.Fire && FR.Fire.isAvailable()) {
            var fetchFn = lbActiveTab === 'coins' ? FR.Fire.fetchCoinLeaderboard : FR.Fire.fetchLeaderboard;
            fetchFn(function (data) {
                renderLeaderboard(data, lbActiveTab);
            });
            if (!FR.Fire.isSignedIn()) {
                ui.lbHint.style.display = 'block';
            }
        } else {
            ui.lbEmpty.textContent = 'Sign in to see the leaderboard';
            ui.lbEmpty.style.display = 'block';
        }
    }

    function closeLeaderboard() {
        ui.lbScr.classList.add('hidden');
        S.mode = lbReturnTo;
        if (lbReturnTo === 'start') {
            ui.startScr.classList.remove('hidden');
        } else if (lbReturnTo === 'gameover') {
            ui.overScr.classList.remove('hidden');
        }
    }

    function renderLeaderboard(data, type) {
        var isCoins = type === 'coins';

        // Keep the header row, clear the rest
        var header = ui.lbTable.querySelector('.lb-header');
        ui.lbTable.innerHTML = '';
        ui.lbTable.appendChild(header);

        if (data.length === 0) {
            ui.lbEmpty.style.display = 'block';
            return;
        }
        ui.lbEmpty.style.display = 'none';

        var currentUid = (FR.Fire && FR.Fire.isSignedIn() && FR.Fire.getUser()) ? FR.Fire.getUser().uid : null;

        for (var i = 0; i < data.length; i++) {
            var entry = data[i];
            var isMe = currentUid && entry.uid === currentUid;

            var row = document.createElement('div');
            row.className = 'lb-row' + (isMe ? ' lb-me' : '');

            var rank = document.createElement('span');
            rank.className = 'lb-rank';
            rank.textContent = (i + 1);
            row.appendChild(rank);

            if (entry.activeIcon && FR.Shop.icons[entry.activeIcon]) {
                var iconData = FR.Shop.icons[entry.activeIcon];
                var iconAv = document.createElement('div');
                iconAv.className = 'lb-icon-avatar';
                iconAv.style.background = iconData.bg;
                iconAv.textContent = iconData.icon;
                row.appendChild(iconAv);
            } else if (entry.photoURL) {
                var avatar = document.createElement('img');
                avatar.className = 'lb-avatar';
                avatar.src = entry.photoURL;
                avatar.alt = '';
                row.appendChild(avatar);
            } else {
                var ph = document.createElement('div');
                ph.className = 'lb-avatar-placeholder';
                ph.textContent = entry.username.charAt(0).toUpperCase();
                row.appendChild(ph);
            }

            var name = document.createElement('span');
            name.className = 'lb-name';
            name.textContent = entry.username;
            row.appendChild(name);

            var val = document.createElement('span');
            val.className = 'lb-score';
            if (isCoins) {
                val.style.color = '#ffd700';
                val.textContent = (entry.wallet || 0).toLocaleString();
            } else {
                val.textContent = Math.floor(entry.highScore);
            }
            row.appendChild(val);

            ui.lbTable.appendChild(row);
        }
    }

    // Leaderboard buttons
    ui.startLbBtn.addEventListener('click', function () { openLeaderboard('start'); });
    ui.goLbBtn.addEventListener('click', function () { openLeaderboard('gameover'); });
    ui.lbBack.addEventListener('click', function () { closeLeaderboard(); });

    // Leaderboard tab handlers
    ui.lbTabScore.addEventListener('click', function () {
        if (lbActiveTab === 'score') return;
        lbActiveTab = 'score';
        ui.lbTabScore.classList.add('active');
        ui.lbTabCoins.classList.remove('active');
        ui.lbHeaderValue.textContent = 'Score';
        fetchAndRenderTab();
    });
    ui.lbTabCoins.addEventListener('click', function () {
        if (lbActiveTab === 'coins') return;
        lbActiveTab = 'coins';
        ui.lbTabCoins.classList.add('active');
        ui.lbTabScore.classList.remove('active');
        ui.lbHeaderValue.textContent = 'Coins';
        fetchAndRenderTab();
    });

    function goHome() {
        // Clean up multiplayer
        if (FR.Fire) FR.Fire.cleanupMatch();
        S.mpMatchId = null;
        S.mpPlayerKey = null;
        S.mpInvincible = false;
        ui.mpHud.classList.add('hidden');
        ui.mpPlayerLives.classList.add('hidden');
        ui.mpResultScr.classList.add('hidden');
        ui.mpQueueScr.classList.add('hidden');
        ui.mpCountdown.classList.add('hidden');

        // Ensure player visible (in case invincibility flash left it hidden)
        FR.player.group.traverse(function (c) { if (c.isMesh) c.visible = true; });

        // Clear world objects
        clearWorld();

        // Reset state
        S.score = 0; S.coins = 0; S.speed = C.INIT_SPEED;
        S.pZ = 0; S.pX = 0; S.pY = 0; S.pLane = 1;
        S.vY = 0; S.jumping = false; S.sliding = false; S.slideTmr = 0;
        S.slideBlend = 0;
        S.runPh = 0; S.gTime = 0; S.lastObsZ = 22; S.lastCoinZ = 12;
        S.shakeAmt = 0; S.flashAlpha = 0; S.deathTimer = 0;
        S.shieldActive = false; S.magnetActive = false; S.doubleCoins = false;

        W.removeShield();

        // Rebuild world for title screen background
        W.initSegments();
        spawnObstacles();
        spawnCoinGroups();
        FR.player.group.position.set(0, 0, 0);

        // Switch UI
        ui.overScr.classList.add('hidden');
        ui.hud.classList.remove('visible');
        ui.startScr.classList.remove('hidden');
        renderStartPowerups();

        S.mode = 'start';
    }

    // ============================================================
    // MULTIPLAYER SYSTEM
    // ============================================================
    function openMPQueue() {
        if (!FR.Fire || !FR.Fire.isSignedIn()) {
            FR.Fire.signIn();
            return;
        }
        S.mode = 'mp-queue';
        ui.startScr.classList.add('hidden');
        ui.mpQueueScr.classList.remove('hidden');

        FR.Fire.joinQueue(function (result) {
            if (result && result.matchId) {
                onMatchFound(result);
            }
        });
    }

    function cancelMPQueue() {
        if (FR.Fire) FR.Fire.leaveQueue();
        ui.mpQueueScr.classList.add('hidden');
        ui.startScr.classList.remove('hidden');
        S.mode = 'start';
    }

    function onMatchFound(result) {
        S.mpMatchId = result.matchId;
        S.mpPlayerKey = result.playerKey;
        var opp = result.opponent;
        S.mpOpponentName = opp.username || 'Player';
        S.mpOpponentIcon = opp.icon || null;
        S.mpOpponentScore = 0;
        S.mpOpponentLives = 3;
        S.mpOpponentFinished = false;
        S.mpIsFinished = false;

        // Setup opponent HUD
        if (S.mpOpponentIcon && FR.Shop.icons[S.mpOpponentIcon]) {
            var iconData = FR.Shop.icons[S.mpOpponentIcon];
            ui.mpHudIcon.textContent = iconData.icon;
            ui.mpHudIcon.style.background = iconData.bg;
        } else {
            ui.mpHudIcon.textContent = S.mpOpponentName.charAt(0).toUpperCase();
            ui.mpHudIcon.style.background = 'rgba(255,255,255,0.15)';
        }
        ui.mpHudName.textContent = S.mpOpponentName;

        // Listen for match updates
        FR.Fire.listenToMatch(S.mpMatchId, function (data) {
            var oppKey = S.mpPlayerKey === 'player1' ? 'player2' : 'player1';
            if (data[oppKey]) {
                S.mpOpponentScore = data[oppKey].score || 0;
                S.mpOpponentLives = data[oppKey].lives;
                if (S.mpOpponentLives === undefined) S.mpOpponentLives = 3;
                S.mpOpponentFinished = data[oppKey].finished || false;
            }
            // Check if both finished
            if (S.mpIsFinished && S.mpOpponentFinished && S.mode !== 'mp-result') {
                showMPResult();
            }
        });

        // Start countdown
        startMPCountdown();
    }

    function startMPCountdown() {
        ui.mpQueueScr.classList.add('hidden');
        S.mpCountdown = 3;
        S.mode = 'mp-countdown';
        ui.mpCountdown.classList.remove('hidden');
        ui.mpCountdownNum.textContent = '3';

        var count = 3;
        var countInterval = setInterval(function () {
            count--;
            if (count > 0) {
                ui.mpCountdownNum.textContent = String(count);
                // Re-trigger animation
                ui.mpCountdownNum.style.animation = 'none';
                ui.mpCountdownNum.offsetHeight; // force reflow
                ui.mpCountdownNum.style.animation = '';
            } else if (count === 0) {
                ui.mpCountdownNum.textContent = 'GO!';
                ui.mpCountdownNum.style.animation = 'none';
                ui.mpCountdownNum.offsetHeight;
                ui.mpCountdownNum.style.animation = '';
            } else {
                clearInterval(countInterval);
                ui.mpCountdown.classList.add('hidden');
                startMultiplayerGame();
            }
        }, 1000);
    }

    function startMultiplayerGame() {
        A.init();
        A.setVolume(FR.Settings.volume);

        // Reset game state (no powerups in MP)
        S.score = 0; S.coins = 0; S.speed = C.INIT_SPEED;
        S.pZ = 0; S.pX = 0; S.pY = 0; S.pLane = 1;
        S.vY = 0; S.jumping = false; S.sliding = false; S.slideTmr = 0;
        S.slideBlend = 0;
        S.runPh = 0; S.gTime = 0; S.lastObsZ = 22; S.lastCoinZ = 12;
        S.shakeAmt = 0; S.flashAlpha = 0; S.deathTimer = 0;
        S.shieldActive = false; S.magnetActive = false; S.doubleCoins = false;
        S.mpLives = S.mpMaxLives;
        S.mpIsFinished = false;
        S.mpSyncTimer = 0;
        S.mpInvincible = false;
        S.mpInvincibleTimer = 0;

        W.removeShield();

        // Clear and rebuild world
        clearWorld();
        W.initSegments();
        spawnObstacles();
        spawnCoinGroups();

        // Show MP HUD
        updateMPHud();
        ui.mpHud.classList.remove('hidden');
        updateMPPlayerLives();
        ui.mpPlayerLives.classList.remove('hidden');
        ui.hud.classList.add('visible');

        S.mode = 'mp-playing';
    }

    function clearWorld() {
        var i;
        for (i = FR.obsList.length - 1; i >= 0; i--) { FR.scene.remove(FR.obsList[i].mesh); }
        for (i = FR.coinList.length - 1; i >= 0; i--) { if (!FR.coinList[i].collected) FR.scene.remove(FR.coinList[i].mesh); }
        for (i = FR.particles.length - 1; i >= 0; i--) { FR.scene.remove(FR.particles[i].mesh); FR.particles[i].mesh.material.dispose(); }
        for (i = FR.segments.length - 1; i >= 0; i--) {
            FR.scene.remove(FR.segments[i]);
            FR.segments[i].traverse(function (c) { if (c.geometry) c.geometry.dispose(); });
        }
        FR.obsList.length = 0;
        FR.coinList.length = 0;
        FR.particles.length = 0;
        FR.segments.length = 0;
    }

    function updateMPHud() {
        ui.mpHudScore.textContent = Math.floor(S.mpOpponentScore);
        var livesHTML = '';
        for (var i = 0; i < S.mpMaxLives; i++) {
            livesHTML += '<span class="mp-heart' + (i < S.mpOpponentLives ? '' : ' lost') + '">\u2764\uFE0F</span>';
        }
        ui.mpHudLives.innerHTML = livesHTML;
    }

    function updateMPPlayerLives() {
        var html = '';
        for (var i = 0; i < S.mpMaxLives; i++) {
            html += '<span class="mp-heart' + (i < S.mpLives ? '' : ' lost') + '">\u2764\uFE0F</span>';
        }
        ui.mpPlayerLives.innerHTML = html;
    }

    function triggerMPDeath() {
        S.mpLives--;
        A.play('hit');
        E.triggerShake(1.2);
        E.triggerFlash('#ff2200', 0.25);
        E.spawnDeathBurst(FR.player.group.position.clone());
        updateMPPlayerLives();

        // Sync to Firestore
        if (FR.Fire && S.mpMatchId) {
            FR.Fire.updateMatchState(S.mpMatchId, S.mpPlayerKey, {
                score: Math.floor(S.score),
                lives: S.mpLives,
                finished: S.mpLives <= 0
            });
        }

        if (S.mpLives <= 0) {
            // Player is out
            S.mpIsFinished = true;
            S.mode = 'mp-gameover';
            // Wait for opponent
            if (S.mpOpponentFinished) {
                showMPResult();
            }
            return;
        }

        // Respawn: brief slow-mo then continue
        S.mode = 'mp-dying';
        S.deathTimer = 0.3;
    }

    function mpRespawn() {
        // Reset position to center lane, on ground, at current Z
        S.pLane = 1;
        S.pX = C.LANES[1];
        S.pY = 0;
        S.vY = 0;
        S.jumping = false;
        S.sliding = false;
        S.slideTmr = 0;
        S.speed = C.INIT_SPEED;
        S.mpInvincible = true;
        S.mpInvincibleTimer = 2.0;

        FR.player.group.position.set(S.pX, 0, S.pZ);

        S.mode = 'mp-playing';
    }

    function syncMPScore(dt) {
        S.mpSyncTimer += dt;
        if (S.mpSyncTimer >= 1.0) {
            S.mpSyncTimer = 0;
            if (FR.Fire && S.mpMatchId) {
                FR.Fire.updateMatchState(S.mpMatchId, S.mpPlayerKey, {
                    score: Math.floor(S.score),
                    lives: S.mpLives,
                    finished: false
                });
            }
        }
    }

    function showMPResult() {
        S.mode = 'mp-result';
        var myScore = Math.floor(S.score);
        var oppScore = Math.floor(S.mpOpponentScore);
        var bonus = 0;
        var resultText = '';

        if (myScore > oppScore) {
            resultText = 'YOU WIN!';
            ui.mpResultTitle.className = 'mp-win';
            bonus = 1000;
        } else if (myScore < oppScore) {
            resultText = 'YOU LOSE';
            ui.mpResultTitle.className = 'mp-lose';
            bonus = 0;
        } else {
            resultText = 'TIE!';
            ui.mpResultTitle.className = 'mp-tie';
            bonus = 500;
        }

        ui.mpResultTitle.textContent = resultText;
        ui.mpResultMyScore.textContent = myScore;
        ui.mpResultOppName.textContent = S.mpOpponentName;
        ui.mpResultOppScore.textContent = oppScore;

        // Add coins to wallet
        FR.Shop.wallet += S.coins + bonus;
        S.totalCoins += S.coins;
        try { localStorage.setItem('fr_tc', String(S.totalCoins)); } catch (e) {}
        FR.Shop.save();

        ui.mpResultCoins.textContent = 'Coins earned: ' + S.coins;
        if (bonus > 0) {
            ui.mpResultBonus.textContent = '+ ' + bonus + ' winner bonus!';
        } else {
            ui.mpResultBonus.textContent = '';
        }

        // Update high score
        if (myScore > S.highScore) {
            S.highScore = myScore;
            try { localStorage.setItem('fr_hs', String(S.highScore)); } catch (e) {}
        }

        if (FR.Fire && FR.Fire.isSignedIn()) FR.Fire.sync();
        if (FR.Fire) FR.Fire.finishMatch(S.mpMatchId);

        ui.hud.classList.remove('visible');
        ui.mpHud.classList.add('hidden');
        ui.mpPlayerLives.classList.add('hidden');
        ui.mpResultScr.classList.remove('hidden');
    }

    function closeMPResult() {
        ui.mpResultScr.classList.add('hidden');
        if (FR.Fire) FR.Fire.cleanupMatch();
        S.mpMatchId = null;
        S.mpPlayerKey = null;
    }

    // MP button handlers
    ui.startMpBtn.addEventListener('click', function () { openMPQueue(); });
    ui.mpQueueCancel.addEventListener('click', function () { cancelMPQueue(); });
    ui.mpResultHome.addEventListener('click', function () {
        closeMPResult();
        goHome();
    });
    ui.mpResultAgain.addEventListener('click', function () {
        closeMPResult();
        openMPQueue();
    });

    // ============================================================
    // POWER-UP ACTIVATION
    // ============================================================
    function activatePowerups() {
        var shop = FR.Shop;
        S.shieldActive = false;
        S.magnetActive = false;
        S.doubleCoins = false;

        if (shop.powerups.shield.selected && shop.powerups.shield.qty > 0) {
            shop.powerups.shield.qty--;
            shop.powerups.shield.selected = false;
            S.shieldActive = true;
            W.addShield();
        }
        if (shop.powerups.magnet.selected && shop.powerups.magnet.qty > 0) {
            shop.powerups.magnet.qty--;
            shop.powerups.magnet.selected = false;
            S.magnetActive = true;
        }
        if (shop.powerups.doubleCoins.selected && shop.powerups.doubleCoins.qty > 0) {
            shop.powerups.doubleCoins.qty--;
            shop.powerups.doubleCoins.selected = false;
            S.doubleCoins = true;
        }
        if (shop.powerups.headStart.selected && shop.powerups.headStart.qty > 0) {
            shop.powerups.headStart.qty--;
            shop.powerups.headStart.selected = false;
            S.score = 500;
        }
        shop.save();
    }

    // ============================================================
    // GAME STATE MANAGEMENT
    // ============================================================
    function startGame() {
        A.init();
        A.setVolume(FR.Settings.volume);
        activatePowerups();
        S.jumpsThisRun = 0;
        S.slidesThisRun = 0;
        S.mode = 'playing';
        ui.startScr.classList.add('hidden');
        ui.hud.classList.add('visible');
    }

    function triggerDeath() {
        S.mode = 'dying';
        S.deathTimer = 0.6; // brief slow-mo
        A.play('hit');
        E.triggerShake(1.5);
        E.triggerFlash('#ff2200', 0.3);
        E.spawnDeathBurst(FR.player.group.position.clone());
        E.clearTrail();
    }

    function showGameOver() {
        S.mode = 'gameover';
        var isNew = false;

        // Add run coins to wallet and accumulate total
        FR.Shop.wallet += S.coins;
        S.totalCoins += S.coins;
        try { localStorage.setItem('fr_tc', String(S.totalCoins)); } catch (e) {}
        FR.Shop.save();

        // Update daily quest progress
        FR.Quests.updateProgress({
            score: S.score,
            coins: S.coins,
            jumps: S.jumpsThisRun,
            slides: S.slidesThisRun,
            distance: S.score,
            games: 1
        });

        // Accumulate lifetime stats
        S.totalGames++;
        S.totalDistance += Math.floor(S.score);
        S.totalJumps += S.jumpsThisRun;
        S.totalSlides += S.slidesThisRun;
        try {
            localStorage.setItem('fr_tg', String(S.totalGames));
            localStorage.setItem('fr_td', String(S.totalDistance));
            localStorage.setItem('fr_tj', String(S.totalJumps));
            localStorage.setItem('fr_ts', String(S.totalSlides));
        } catch (e) {}

        // Check achievements
        checkAchievements();

        if (Math.floor(S.score) > S.highScore) {
            S.highScore = Math.floor(S.score);
            isNew = true;
            try { localStorage.setItem('fr_hs', String(S.highScore)); } catch (e) {}
        }
        if (S.coins > S.highCoins) {
            S.highCoins = S.coins;
            try { localStorage.setItem('fr_hc', String(S.highCoins)); } catch (e) {}
        }

        // Sync to cloud
        if (FR.Fire && FR.Fire.isSignedIn()) FR.Fire.sync();

        ui.goScore.textContent = Math.floor(S.score);
        ui.goCoins.textContent = S.coins;
        ui.hudBest.textContent = 'Best: ' + S.highScore;

        if (isNew) {
            ui.goNewBest.classList.add('show');
            E.spawnConfetti(40);
            A.play('fanfare');
        } else {
            ui.goNewBest.classList.remove('show');
        }

        // Clean up shield visual if active
        W.removeShield();

        ui.overScr.classList.remove('hidden');
        ui.hud.classList.remove('visible');
    }

    function restartGame() {
        // Clear world objects
        var i;
        for (i = FR.obsList.length - 1; i >= 0; i--) { FR.scene.remove(FR.obsList[i].mesh); }
        for (i = FR.coinList.length - 1; i >= 0; i--) { if (!FR.coinList[i].collected) FR.scene.remove(FR.coinList[i].mesh); }
        for (i = FR.particles.length - 1; i >= 0; i--) { FR.scene.remove(FR.particles[i].mesh); FR.particles[i].mesh.material.dispose(); }
        for (i = FR.segments.length - 1; i >= 0; i--) {
            FR.scene.remove(FR.segments[i]);
            FR.segments[i].traverse(function (c) { if (c.geometry) c.geometry.dispose(); });
        }
        FR.obsList.length = 0;
        FR.coinList.length = 0;
        FR.particles.length = 0;
        FR.segments.length = 0;

        // Reset state
        S.score = 0; S.coins = 0; S.speed = C.INIT_SPEED;
        S.pZ = 0; S.pX = 0; S.pY = 0; S.pLane = 1;
        S.vY = 0; S.jumping = false; S.sliding = false; S.slideTmr = 0;
        S.slideBlend = 0;
        S.runPh = 0; S.gTime = 0; S.lastObsZ = 22; S.lastCoinZ = 12;
        S.shakeAmt = 0; S.flashAlpha = 0; S.deathTimer = 0;
        S.shieldActive = false; S.magnetActive = false; S.doubleCoins = false;
        S.jumpsThisRun = 0; S.slidesThisRun = 0;

        // Clean up shield visual and trail
        W.removeShield();
        E.clearTrail();

        // Rebuild
        W.initSegments();
        spawnObstacles();
        spawnCoinGroups();

        // Activate selected powerups
        activatePowerups();

        // UI
        ui.overScr.classList.add('hidden');
        ui.hud.classList.add('visible');

        S.mode = 'playing';
    }

    // ============================================================
    // MAIN UPDATE
    // ============================================================
    function update(dt) {
        // Speed ramp
        S.speed = Math.min(C.MAX_SPEED, S.speed + C.SPEED_ACCEL * dt);

        // Move forward
        S.pZ += S.speed * dt;
        S.score += S.speed * dt * 2;

        // Lane switching (smooth lerp)
        var targetX = C.LANES[S.pLane];
        var dx = targetX - S.pX;
        if (Math.abs(dx) > 0.04) {
            S.pX += Math.sign(dx) * Math.min(Math.abs(dx), C.LANE_LERP * dt);
        } else {
            S.pX = targetX;
        }

        // Jump physics
        if (S.jumping) {
            S.vY -= C.GRAVITY * dt;
            S.pY += S.vY * dt;
            if (S.pY <= 0) {
                S.pY = 0; S.vY = 0; S.jumping = false;
                A.play('land');
                var landPos = new THREE.Vector3(S.pX, 0.08, S.pZ);
                E.spawnBurst(landPos, 0x8a7a5a, 12, 3, 2);
                E.spawnLandingRing(landPos);
            }
        }

        // Slide timer
        if (S.sliding) {
            S.slideTmr -= dt;
            if (S.slideTmr <= 0) S.sliding = false;
        }

        // Player position
        FR.player.group.position.set(S.pX, S.pY - S.slideBlend * 0.45, S.pZ);
        W.animatePlayer(dt);

        // Camera
        updateCamera(dt);

        // Footstep audio
        A.updateSteps(dt, S.speed, !S.jumping && !S.sliding);
        A.updateAmbient(S.speed);

        // Animate coins (rotation, bob, glow pulse)
        var coinGlow = 0.6 + Math.sin(S.gTime * 4) * 0.25;
        FR.mat.coin.emissiveIntensity = coinGlow;
        for (var i = 0; i < FR.coinList.length; i++) {
            var c = FR.coinList[i];
            if (!c.collected) {
                c.mesh.rotation.y += 3.5 * dt;
                var baseY = c.arcY || C.COIN_Y;
                c.mesh.position.y = baseY + Math.sin(S.gTime * 3 + c.z * 0.5) * 0.12;
            }
        }

        // Spawning & recycling
        spawnObstacles();
        spawnCoinGroups();
        W.recycleSegments();
        cleanupObjects();

        // Collisions
        checkCoinCollect();
        var hitObs = checkCollisions();
        if (hitObs) {
            if (S.shieldActive) {
                S.shieldActive = false;
                W.removeShield();
                A.play('hit');
                E.triggerShake(0.8);
                E.triggerFlash('#44aaff', 0.25);
                E.spawnBurst(FR.player.group.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0x44aaff, 15, 5, 6);
                // Remove the obstacle so it can't re-trigger death next frame
                FR.scene.remove(hitObs.mesh);
                var idx = FR.obsList.indexOf(hitObs);
                if (idx !== -1) FR.obsList.splice(idx, 1);
            } else {
                triggerDeath();
                return;
            }
        }

        // Effects
        E.updateParticles(dt);
        E.updateLeaves(dt, S.pZ, S.gTime);
        E.updateFireflies(dt, S.pZ, S.gTime, nightAmount);
        E.updateClouds(dt, S.pZ, S.gTime, nightAmount);
        E.updateStars(dt, S.pZ, S.gTime, nightAmount);
        E.updateSpeedLines(dt, S.speed, S.pZ);
        E.updateLandingRings(dt);
        W.updateShieldVisual(dt);
        E.updateShake(dt);
        E.updateTrail(dt, FR.player.group.position, S.speed, !S.jumping && !S.sliding);
        E.updateRain(dt, S.pZ, S.gTime);
        A.updateRainAmbient(E.isRaining());

        // Near-miss detection
        checkNearMiss(dt);

        // Environment
        updateEnvironment(dt);

        // HUD
        updateHUD();
    }

    // ============================================================
    // MULTIPLAYER UPDATE (like update but with MP death/respawn)
    // ============================================================
    function mpUpdate(dt) {
        // Invincibility timer
        if (S.mpInvincible) {
            S.mpInvincibleTimer -= dt;
            if (S.mpInvincibleTimer <= 0) {
                S.mpInvincible = false;
                // Stop flashing
                FR.player.group.traverse(function (c) {
                    if (c.isMesh) c.visible = true;
                });
            } else {
                // Flash player model
                var flash = Math.floor(S.mpInvincibleTimer * 10) % 2 === 0;
                FR.player.group.traverse(function (c) {
                    if (c.isMesh) c.visible = flash;
                });
            }
        }

        // Speed ramp
        S.speed = Math.min(C.MAX_SPEED, S.speed + C.SPEED_ACCEL * dt);

        // Move forward
        S.pZ += S.speed * dt;
        S.score += S.speed * dt * 2;

        // Lane switching
        var targetX = C.LANES[S.pLane];
        var dx = targetX - S.pX;
        if (Math.abs(dx) > 0.04) {
            S.pX += Math.sign(dx) * Math.min(Math.abs(dx), C.LANE_LERP * dt);
        } else {
            S.pX = targetX;
        }

        // Jump physics
        if (S.jumping) {
            S.vY -= C.GRAVITY * dt;
            S.pY += S.vY * dt;
            if (S.pY <= 0) {
                S.pY = 0; S.vY = 0; S.jumping = false;
                A.play('land');
                var landPos = new THREE.Vector3(S.pX, 0.08, S.pZ);
                E.spawnBurst(landPos, 0x8a7a5a, 12, 3, 2);
                E.spawnLandingRing(landPos);
            }
        }

        // Slide timer
        if (S.sliding) {
            S.slideTmr -= dt;
            if (S.slideTmr <= 0) S.sliding = false;
        }

        // Player position
        FR.player.group.position.set(S.pX, S.pY - S.slideBlend * 0.45, S.pZ);
        W.animatePlayer(dt);

        // Camera
        updateCamera(dt);

        // Audio
        A.updateSteps(dt, S.speed, !S.jumping && !S.sliding);
        A.updateAmbient(S.speed);

        // Coins
        var coinGlow = 0.6 + Math.sin(S.gTime * 4) * 0.25;
        FR.mat.coin.emissiveIntensity = coinGlow;
        for (var i = 0; i < FR.coinList.length; i++) {
            var c = FR.coinList[i];
            if (!c.collected) {
                c.mesh.rotation.y += 3.5 * dt;
                var baseY = c.arcY || C.COIN_Y;
                c.mesh.position.y = baseY + Math.sin(S.gTime * 3 + c.z * 0.5) * 0.12;
            }
        }

        // Spawning
        spawnObstacles();
        spawnCoinGroups();
        W.recycleSegments();
        cleanupObjects();

        // Collisions
        checkCoinCollect();
        if (!S.mpInvincible) {
            var hitObs = checkCollisions();
            if (hitObs) {
                triggerMPDeath();
                return;
            }
        }

        // Effects
        E.updateParticles(dt);
        E.updateLeaves(dt, S.pZ, S.gTime);
        E.updateFireflies(dt, S.pZ, S.gTime, nightAmount);
        E.updateClouds(dt, S.pZ, S.gTime, nightAmount);
        E.updateStars(dt, S.pZ, S.gTime, nightAmount);
        E.updateSpeedLines(dt, S.speed, S.pZ);
        E.updateLandingRings(dt);
        E.updateShake(dt);
        E.updateRain(dt, S.pZ, S.gTime);
        A.updateRainAmbient(E.isRaining());

        // Near-miss detection
        checkNearMiss(dt);

        // Environment
        updateEnvironment(dt);

        // HUD
        updateHUD();
        updateMPHud();
        updateMPPlayerLives();

        // Sync score to Firestore periodically
        syncMPScore(dt);
    }

    // ============================================================
    // MAIN LOOP
    // ============================================================
    function loop(time) {
        requestAnimationFrame(loop);

        var t = time / 1000;
        var dt = Math.min(t - S.prevTime, 0.05);
        S.prevTime = t;

        if (S.mode === 'shop') {
            if (pressed['Escape'] || pressed['KeyB']) {
                closeShop();
            }
            for (var ks in pressed) pressed[ks] = false;
            FR.camera.position.set(
                Math.sin(t * 0.3) * 2.5,
                5.5 + Math.sin(t * 0.5) * 0.6,
                -8 + Math.sin(t * 0.2) * 2
            );
            FR.camera.lookAt(0, 2, 12);
            updateEnvironment(dt);
            E.updateClouds(dt, 0, S.gTime, nightAmount);
            E.updateStars(dt, 0, S.gTime, nightAmount);

        } else if (S.mode === 'inventory') {
            if (pressed['Escape']) {
                closeInventory();
            }
            for (var kinv in pressed) pressed[kinv] = false;
            FR.camera.position.set(
                Math.sin(t * 0.3) * 2.5,
                5.5 + Math.sin(t * 0.5) * 0.6,
                -8 + Math.sin(t * 0.2) * 2
            );
            FR.camera.lookAt(0, 2, 12);
            updateEnvironment(dt);
            E.updateClouds(dt, 0, S.gTime, nightAmount);
            E.updateStars(dt, 0, S.gTime, nightAmount);

        } else if (S.mode === 'settings') {
            if (!rebindTarget && pressed['Escape']) {
                closeSettings();
            }
            for (var kset in pressed) pressed[kset] = false;
            FR.camera.position.set(
                Math.sin(t * 0.3) * 2.5,
                5.5 + Math.sin(t * 0.5) * 0.6,
                -8 + Math.sin(t * 0.2) * 2
            );
            FR.camera.lookAt(0, 2, 12);
            updateEnvironment(dt);
            E.updateClouds(dt, 0, S.gTime, nightAmount);
            E.updateStars(dt, 0, S.gTime, nightAmount);

        } else if (S.mode === 'leaderboard') {
            if (pressed['Escape']) {
                closeLeaderboard();
            }
            for (var klb in pressed) pressed[klb] = false;
            FR.camera.position.set(
                Math.sin(t * 0.3) * 2.5,
                5.5 + Math.sin(t * 0.5) * 0.6,
                -8 + Math.sin(t * 0.2) * 2
            );
            FR.camera.lookAt(0, 2, 12);
            updateEnvironment(dt);
            E.updateClouds(dt, 0, S.gTime, nightAmount);
            E.updateStars(dt, 0, S.gTime, nightAmount);

        } else if (S.mode === 'stats') {
            if (pressed['Escape']) {
                closeStats();
            }
            for (var kst in pressed) pressed[kst] = false;
            FR.camera.position.set(
                Math.sin(t * 0.3) * 2.5,
                5.5 + Math.sin(t * 0.5) * 0.6,
                -8 + Math.sin(t * 0.2) * 2
            );
            FR.camera.lookAt(0, 2, 12);
            updateEnvironment(dt);
            E.updateClouds(dt, 0, S.gTime, nightAmount);
            E.updateStars(dt, 0, S.gTime, nightAmount);

        } else if (S.mode === 'username') {
            for (var kun in pressed) pressed[kun] = false;
            FR.camera.position.set(
                Math.sin(t * 0.3) * 2.5,
                5.5 + Math.sin(t * 0.5) * 0.6,
                -8 + Math.sin(t * 0.2) * 2
            );
            FR.camera.lookAt(0, 2, 12);
            updateEnvironment(dt);
            E.updateClouds(dt, 0, S.gTime, nightAmount);
            E.updateStars(dt, 0, S.gTime, nightAmount);

        } else if (S.mode === 'start') {
            // Title screen: gentle camera sway
            if (pressed['KeyB']) {
                openShop('start');
                for (var kb1 in pressed) pressed[kb1] = false;
            } else if (pressed['Space'] || pressed['Enter'] || tapped) {
                tapped = false;
                startGame();
                for (var k2 in pressed) pressed[k2] = false;
                keys['Space'] = false; keys['Enter'] = false;
            }
            for (var k3 in pressed) pressed[k3] = false;
            FR.camera.position.set(
                Math.sin(t * 0.3) * 2.5,
                5.5 + Math.sin(t * 0.5) * 0.6,
                -8 + Math.sin(t * 0.2) * 2
            );
            FR.camera.lookAt(0, 2, 12);
            updateEnvironment(dt);
            E.updateLeaves(dt, 0, S.gTime);
            E.updateFireflies(dt, 0, S.gTime, nightAmount);
            E.updateClouds(dt, 0, S.gTime, nightAmount);
            E.updateStars(dt, 0, S.gTime, nightAmount);

        } else if (S.mode === 'mp-queue' || S.mode === 'mp-countdown') {
            if (pressed['Escape'] && S.mode === 'mp-queue') {
                cancelMPQueue();
            }
            for (var kmpq in pressed) pressed[kmpq] = false;
            FR.camera.position.set(
                Math.sin(t * 0.3) * 2.5,
                5.5 + Math.sin(t * 0.5) * 0.6,
                -8 + Math.sin(t * 0.2) * 2
            );
            FR.camera.lookAt(0, 2, 12);
            updateEnvironment(dt);
            E.updateClouds(dt, 0, S.gTime, nightAmount);
            E.updateStars(dt, 0, S.gTime, nightAmount);

        } else if (S.mode === 'mp-playing') {
            processInput();
            mpUpdate(dt);

        } else if (S.mode === 'mp-dying') {
            S.deathTimer -= dt;
            var mpSlowDt = dt * 0.15;
            S.pZ += S.speed * mpSlowDt * 0.3;
            FR.player.group.position.z = S.pZ;
            updateCamera(mpSlowDt);
            E.updateParticles(mpSlowDt);
            E.updateShake(dt);
            updateEnvironment(mpSlowDt);
            if (S.deathTimer <= 0) mpRespawn();

        } else if (S.mode === 'mp-gameover') {
            // Waiting for opponent to finish
            for (var kmpgo in pressed) pressed[kmpgo] = false;
            E.updateParticles(dt);
            FR.camera.position.y += 0.1 * dt;
            // Opponent HUD still updates via listener
            updateMPHud();

        } else if (S.mode === 'mp-result') {
            for (var kmpr in pressed) pressed[kmpr] = false;
            E.updateParticles(dt);

        } else if (S.mode === 'playing') {
            processInput();
            update(dt);

        } else if (S.mode === 'dying') {
            // Slow-mo death
            S.deathTimer -= dt;
            var slowDt = dt * 0.15;
            S.pZ += S.speed * slowDt * 0.3;
            FR.player.group.position.z = S.pZ;
            updateCamera(slowDt);
            E.updateParticles(slowDt);
            E.updateShake(dt); // shake decays at normal speed
            updateEnvironment(slowDt);

            if (S.deathTimer <= 0) showGameOver();

        } else if (S.mode === 'gameover') {
            if (pressed['KeyB']) {
                openShop('gameover');
                for (var kb2 in pressed) pressed[kb2] = false;
            } else if (pressed['Space'] || pressed['Enter'] || tapped) {
                tapped = false;
                pressed['Space'] = false; pressed['Enter'] = false;
                keys['Space'] = false; keys['Enter'] = false;
                restartGame();
            }
            for (var k4 in pressed) pressed[k4] = false;
            E.updateParticles(dt);
            FR.camera.position.y += 0.2 * dt;
        }

        // Render
        if (FR.composer) {
            FR.composer.render();
        } else {
            FR.renderer.render(FR.scene, FR.camera);
        }
    }

    // ============================================================
    // LOADING & INITIALIZATION
    // ============================================================
    function init() {
        // Progress indicator
        var fill = ui.loadFill;
        fill.style.width = '20%';

        // Initialize Firebase (no-op if not configured)
        if (FR.Fire) FR.Fire.init();

        setupScene();
        fill.style.width = '35%';

        W.initMaterials();
        W.initTreeGeos();
        W.initTuftGeo();
        W.initCoinGeo();
        fill.style.width = '50%';

        W.createSky();
        W.buildPlayer();
        FR.player.group.position.set(0, 0, 0);
        fill.style.width = '65%';

        W.initSegments();
        S.lastObsZ = 22;
        S.lastCoinZ = 12;
        spawnObstacles();
        spawnCoinGroups();
        fill.style.width = '80%';

        E.initFlash();
        E.initLeaves();
        E.initFireflies();
        E.initRain();
        E.initClouds();
        E.initStars();
        E.initSpeedLines();
        fill.style.width = '95%';

        // Initial camera
        FR.camera.position.set(0, 5.5, -8);
        FR.camera.lookAt(0, 2, 12);

        // Apply saved outfit
        W.applyOutfit(FR.Shop.activeOutfit);

        // Show selected powerups on start screen
        renderStartPowerups();

        // Apply saved settings (volume + update control hints)
        updateCtrlGrid();

        // Update best score display
        ui.hudBest.textContent = 'Best: ' + S.highScore;

        // Remove loading screen
        fill.style.width = '100%';
        setTimeout(function () {
            ui.loading.classList.add('done');
            ui.uiRoot.classList.add('visible');
            S.mode = 'start';
            setTimeout(function () {
                ui.loading.style.display = 'none';
            }, 700);
        }, 400);

        S.prevTime = performance.now() / 1000;
        requestAnimationFrame(loop);
    }

    // Start when page loads
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
