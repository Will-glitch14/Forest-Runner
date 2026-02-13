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
        shopBack:   document.getElementById('shop-back'),
        startPU:    document.getElementById('start-powerups'),
        startShopBtn: document.getElementById('start-shop-btn'),
        goShopBtn:  document.getElementById('go-shop-btn'),
        goHomeBtn:  document.getElementById('go-home-btn'),
    };
    var shopReturnTo = 'start'; // which screen to go back to

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
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyB'].indexOf(e.code) !== -1) {
            e.preventDefault();
        }
        if (!keys[e.code]) pressed[e.code] = true;
        keys[e.code] = true;
    });
    document.addEventListener('keyup', function (e) { keys[e.code] = false; });

    function processInput() {
        if (pressed['ArrowLeft'] || pressed['KeyA']) {
            if (S.pLane < 2) S.pLane++;
        }
        if (pressed['ArrowRight'] || pressed['KeyD']) {
            if (S.pLane > 0) S.pLane--;
        }
        if (pressed['ArrowUp'] || pressed['KeyW'] || pressed['Space']) {
            if (!S.jumping && !S.sliding) {
                S.jumping = true;
                S.vY = C.JUMP_FORCE;
                A.play('jump');
            }
        }
        if (pressed['ArrowDown'] || pressed['KeyS']) {
            if (!S.jumping && !S.sliding) {
                S.sliding = true;
                S.slideTmr = C.SLIDE_DUR;
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
            if (Math.abs(S.pZ - obs.z) > 1.8) continue;
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
    }

    function closeShop() {
        ui.shopScr.classList.add('hidden');
        S.mode = shopReturnTo;
        if (shopReturnTo === 'start') {
            ui.startScr.classList.remove('hidden');
            renderStartPowerups();
        } else if (shopReturnTo === 'gameover') {
            ui.overScr.classList.remove('hidden');
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

        // Cosmetics
        var cosHTML = '';
        for (var c in shop.cosmetics) {
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
        }
    });

    ui.shopBack.addEventListener('click', function () { closeShop(); });
    ui.startShopBtn.addEventListener('click', function () { openShop('start'); });
    ui.goShopBtn.addEventListener('click', function () { openShop('gameover'); });
    ui.goHomeBtn.addEventListener('click', function () { goHome(); });

    function goHome() {
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
        activatePowerups();
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
    }

    function showGameOver() {
        S.mode = 'gameover';
        var isNew = false;

        // Add run coins to wallet
        FR.Shop.wallet += S.coins;
        FR.Shop.save();

        if (Math.floor(S.score) > S.highScore) {
            S.highScore = Math.floor(S.score);
            isNew = true;
            try { localStorage.setItem('fr_hs', String(S.highScore)); } catch (e) {}
        }
        if (S.coins > S.highCoins) {
            S.highCoins = S.coins;
            try { localStorage.setItem('fr_hc', String(S.highCoins)); } catch (e) {}
        }

        ui.goScore.textContent = Math.floor(S.score);
        ui.goCoins.textContent = S.coins;
        ui.hudBest.textContent = 'Best: ' + S.highScore;

        if (isNew) {
            ui.goNewBest.classList.add('show');
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
        S.runPh = 0; S.gTime = 0; S.lastObsZ = 22; S.lastCoinZ = 12;
        S.shakeAmt = 0; S.flashAlpha = 0; S.deathTimer = 0;
        S.shieldActive = false; S.magnetActive = false; S.doubleCoins = false;

        // Clean up shield visual
        W.removeShield();

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
        FR.player.group.position.set(S.pX, S.pY, S.pZ);
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

        // Environment
        updateEnvironment(dt);

        // HUD
        updateHUD();
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

        } else if (S.mode === 'start') {
            // Title screen: gentle camera sway
            if (pressed['KeyB']) {
                openShop('start');
                for (var kb1 in pressed) pressed[kb1] = false;
            } else if (pressed['Space'] || pressed['Enter']) {
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
            } else if (pressed['Space'] || pressed['Enter']) {
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
