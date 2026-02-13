/* ================================================================
   world.js - Textures, materials, sky dome, player model,
              ground segments, trees, decorations, obstacles, coins
   ================================================================ */
FR.World = (function () {
    'use strict';
    var C = FR.C;
    var M = FR.mat; // filled during init

    // ============================================================
    // PROCEDURAL TEXTURES (canvas-generated)
    // ============================================================
    function makeGrassTex() {
        var c = document.createElement('canvas'); c.width = 256; c.height = 256;
        var x = c.getContext('2d');
        // Base
        x.fillStyle = '#3a6b2a'; x.fillRect(0, 0, 256, 256);
        // Noise patches
        for (var i = 0; i < 600; i++) {
            var r = Math.random() * 255 | 0;
            x.fillStyle = 'rgb(' + (40 + (r % 25)) + ',' + (85 + (r % 35)) + ',' + (30 + (r % 18)) + ')';
            x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3);
        }
        // Shadow patches for depth
        for (var s = 0; s < 15; s++) {
            x.fillStyle = 'rgba(20,50,15,0.2)';
            x.beginPath();
            x.ellipse(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 14, 6 + Math.random() * 10, Math.random() * Math.PI, 0, Math.PI * 2);
            x.fill();
        }
        // Blade strokes
        x.lineWidth = 1;
        for (var j = 0; j < 200; j++) {
            x.strokeStyle = 'rgba(' + (50 + Math.random() * 40 | 0) + ',' + (100 + Math.random() * 50 | 0) + ',' + (30 + Math.random() * 20 | 0) + ',0.5)';
            var bx = Math.random() * 256, by = Math.random() * 256;
            x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + (Math.random() - 0.5) * 3, by - 4 - Math.random() * 6); x.stroke();
        }
        var tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 8);
        return tex;
    }

    function makePathTex() {
        var c = document.createElement('canvas'); c.width = 256; c.height = 256;
        var x = c.getContext('2d');
        x.fillStyle = '#8a7a5a'; x.fillRect(0, 0, 256, 256);
        // Pebble noise
        for (var i = 0; i < 500; i++) {
            var br = 120 + Math.random() * 30 | 0;
            x.fillStyle = 'rgb(' + br + ',' + (br - 15) + ',' + (br - 35) + ')';
            var sz = 1 + Math.random() * 3;
            x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, sz, 0, Math.PI * 2); x.fill();
        }
        // Worn center line
        var wGrd = x.createLinearGradient(108, 0, 148, 0);
        wGrd.addColorStop(0, 'rgba(110,95,70,0)');
        wGrd.addColorStop(0.3, 'rgba(110,95,70,0.18)');
        wGrd.addColorStop(0.5, 'rgba(115,100,75,0.25)');
        wGrd.addColorStop(0.7, 'rgba(110,95,70,0.18)');
        wGrd.addColorStop(1, 'rgba(110,95,70,0)');
        x.fillStyle = wGrd;
        x.fillRect(108, 0, 40, 256);
        // Subtle ruts
        x.strokeStyle = 'rgba(100,85,60,0.15)'; x.lineWidth = 3;
        for (var j = 0; j < 5; j++) {
            x.beginPath(); x.moveTo(Math.random() * 256, 0);
            x.bezierCurveTo(Math.random() * 256, 85, Math.random() * 256, 170, Math.random() * 256, 256);
            x.stroke();
        }
        var tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 10);
        return tex;
    }

    function makeBarkTex() {
        var c = document.createElement('canvas'); c.width = 64; c.height = 128;
        var x = c.getContext('2d');
        x.fillStyle = '#5a3a1a'; x.fillRect(0, 0, 64, 128);
        for (var i = 0; i < 40; i++) {
            var y2 = Math.random() * 128;
            x.strokeStyle = 'rgba(' + (70 + Math.random() * 30 | 0) + ',' + (40 + Math.random() * 20 | 0) + ',' + (15 + Math.random() * 15 | 0) + ',0.5)';
            x.lineWidth = 1 + Math.random() * 2;
            x.beginPath(); x.moveTo(0, y2); x.lineTo(64, y2 + (Math.random() - 0.5) * 8); x.stroke();
        }
        var tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    // ============================================================
    // MATERIALS
    // ============================================================
    function initMaterials() {
        var gTex = makeGrassTex();
        var pTex = makePathTex();
        var bTex = makeBarkTex();

        M.grass     = new THREE.MeshPhongMaterial({ map: gTex });
        M.path      = new THREE.MeshPhongMaterial({ map: pTex });
        M.trunk     = new THREE.MeshPhongMaterial({ map: bTex, color: 0x6a4a2a });
        M.birchTrunk = new THREE.MeshPhongMaterial({ color: 0xe8ddd0 });
        M.leaf1     = new THREE.MeshPhongMaterial({ color: 0x2a7a22 });
        M.leaf2     = new THREE.MeshPhongMaterial({ color: 0x1a6a18 });
        M.leaf3     = new THREE.MeshPhongMaterial({ color: 0x3a8a2a });
        M.leafLight = new THREE.MeshPhongMaterial({ color: 0x60aa38 });
        M.leafDark  = new THREE.MeshPhongMaterial({ color: 0x1a5a12 });
        M.log       = new THREE.MeshPhongMaterial({ color: 0x5a3818 });
        M.logEnd    = new THREE.MeshPhongMaterial({ color: 0x7a5a3a });
        M.rock      = new THREE.MeshPhongMaterial({ color: 0x6a6a60, flatShading: true });
        M.vine      = new THREE.MeshPhongMaterial({ color: 0x2a7a15 });
        M.branch    = new THREE.MeshPhongMaterial({ color: 0x5a4020 });
        M.pit       = new THREE.MeshPhongMaterial({ color: 0x080604 });
        M.pitEdge   = new THREE.MeshPhongMaterial({ color: 0x4a3a28, flatShading: true });
        M.coin      = new THREE.MeshPhongMaterial({ color: 0xffd700, emissive: 0xcc8800, emissiveIntensity: 0.8, shininess: 100 });
        M.jacket    = new THREE.MeshPhongMaterial({ color: 0x2a6699 });
        M.pants     = new THREE.MeshPhongMaterial({ color: 0x554433 });
        M.skin      = new THREE.MeshPhongMaterial({ color: 0xf0c090 });
        M.hair      = new THREE.MeshPhongMaterial({ color: 0x3a2210 });
        M.hat       = new THREE.MeshPhongMaterial({ color: 0x5a3818 });
        M.boot      = new THREE.MeshPhongMaterial({ color: 0x332211 });
        M.pack      = new THREE.MeshPhongMaterial({ color: 0x7a5530 });
        M.scarf     = new THREE.MeshPhongMaterial({ color: 0xcc3333 });
        M.mushCap   = new THREE.MeshPhongMaterial({ color: 0xcc3333 });
        M.mushStem  = new THREE.MeshPhongMaterial({ color: 0xeeddcc });
        M.flower    = [
            new THREE.MeshPhongMaterial({ color: 0xff6688 }),
            new THREE.MeshPhongMaterial({ color: 0xffaa33 }),
            new THREE.MeshPhongMaterial({ color: 0x8888ff }),
            new THREE.MeshPhongMaterial({ color: 0xff44cc }),
            new THREE.MeshPhongMaterial({ color: 0xffffff }),
        ];
        M.fern      = new THREE.MeshPhongMaterial({ color: 0x2a7822, side: THREE.DoubleSide });
        M.stoneEdge = new THREE.MeshPhongMaterial({ color: 0x666658, flatShading: true });
    }

    // ============================================================
    // SKY DOME (gradient shader)
    // ============================================================
    function createSky() {
        var geo = new THREE.SphereGeometry(220, 20, 14);
        var mat2 = new THREE.ShaderMaterial({
            uniforms: {
                topColor:    { value: new THREE.Color(0x4488cc) },
                bottomColor: { value: new THREE.Color(0x88aa88) },
                offset:      { value: 25 },
                exponent:    { value: 0.5 },
            },
            vertexShader: [
                'varying vec3 vWorldPos;',
                'void main() {',
                '  vec4 wp = modelMatrix * vec4(position, 1.0);',
                '  vWorldPos = wp.xyz;',
                '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform vec3 topColor;',
                'uniform vec3 bottomColor;',
                'uniform float offset;',
                'uniform float exponent;',
                'varying vec3 vWorldPos;',
                'void main() {',
                '  float h = normalize(vWorldPos + vec3(0.0, offset, 0.0)).y;',
                '  gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);',
                '}'
            ].join('\n'),
            side: THREE.BackSide,
            depthWrite: false,
        });
        FR.sky = new THREE.Mesh(geo, mat2);
        FR.scene.add(FR.sky);
    }

    // ============================================================
    // PLAYER CHARACTER
    // ============================================================
    function buildPlayer() {
        var P = FR.player;
        P.group = new THREE.Group();

        // Torso
        P.torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.45), M.jacket);
        P.torso.position.y = 1.7; P.torso.castShadow = true;
        P.group.add(P.torso);

        // Head
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), M.skin);
        head.position.y = 2.55; head.castShadow = true;
        P.group.add(head);

        // Hair
        var hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.30, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), M.hair
        );
        hair.position.y = 2.6; P.group.add(hair);

        // Hat (explorer)
        var brim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 10), M.hat);
        brim.position.y = 2.82; P.group.add(brim);
        var htop = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.27, 0.26, 10), M.hat);
        htop.position.y = 2.97; P.group.add(htop);

        // Scarf
        var scarf = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.5), M.scarf);
        scarf.position.set(0, 2.28, 0); P.group.add(scarf);
        // Scarf tail
        P.scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.55), M.scarf);
        P.scarfTail.position.set(0.15, 2.22, -0.38); P.group.add(P.scarfTail);

        // Arms
        function makeArm(side) {
            var arm = new THREE.Group();
            arm.position.set(side * 0.52, 2.1, 0);
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), M.jacket);
            mesh.position.y = -0.35; mesh.castShadow = true; arm.add(mesh);
            var hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), M.skin);
            hand.position.y = -0.76; arm.add(hand);
            return arm;
        }
        P.lArm = makeArm(-1); P.rArm = makeArm(1);
        P.group.add(P.lArm); P.group.add(P.rArm);

        // Legs
        function makeLeg(side) {
            var leg = new THREE.Group();
            leg.position.set(side * 0.2, 1.15, 0);
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.8, 0.26), M.pants);
            mesh.position.y = -0.35; mesh.castShadow = true; leg.add(mesh);
            var boot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.25, 0.36), M.boot);
            boot.position.set(0, -0.82, 0.04); leg.add(boot);
            return leg;
        }
        P.lLeg = makeLeg(-1); P.rLeg = makeLeg(1);
        P.group.add(P.lLeg); P.group.add(P.rLeg);

        // Backpack
        var pack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.3), M.pack);
        pack.position.set(0, 1.8, -0.32); pack.castShadow = true;
        P.group.add(pack);

        // Enable shadows on all children
        P.group.traverse(function (c) { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });

        FR.scene.add(P.group);
    }

    function animatePlayer(dt) {
        var S = FR.S, P = FR.player;
        S.runPh += S.speed * dt * 0.45;
        var sw = Math.sin(S.runPh);

        // Scarf physics (trails behind)
        P.scarfTail.rotation.x = Math.sin(S.gTime * 6) * 0.15;
        P.scarfTail.rotation.z = Math.sin(S.gTime * 4) * 0.1;

        if (S.sliding) {
            P.group.scale.set(1, 0.42, 1);
            P.torso.rotation.x = 0.35;
            P.lArm.rotation.x = -0.3; P.rArm.rotation.x = -0.3;
            P.lLeg.rotation.x = 0.4;  P.rLeg.rotation.x = 0.4;
        } else if (S.jumping) {
            P.group.scale.set(1, 1, 1);
            P.torso.rotation.x = -0.12;
            P.lArm.rotation.x = -0.7; P.rArm.rotation.x = -0.7;
            P.lLeg.rotation.x = 0.4;  P.rLeg.rotation.x = -0.25;
        } else {
            P.group.scale.set(1, 1, 1);
            P.torso.rotation.x = 0.06 + Math.abs(sw) * 0.03;
            P.lArm.rotation.x = sw * 0.9;  P.rArm.rotation.x = -sw * 0.9;
            P.lLeg.rotation.x = -sw * 0.85; P.rLeg.rotation.x = sw * 0.85;
        }
    }

    // ============================================================
    // TREES (3 types: pine, oak, birch)
    // ============================================================

    // Shared geometries for performance
    var treeGeos = {};
    function initTreeGeos() {
        treeGeos.trunk1 = new THREE.CylinderGeometry(0.12, 0.22, 5.5, 6);
        treeGeos.trunk2 = new THREE.CylinderGeometry(0.2, 0.35, 4.0, 6);
        treeGeos.trunkB = new THREE.CylinderGeometry(0.07, 0.13, 6.0, 6);
    }

    function createPine() {
        var g = new THREE.Group();
        var h = 6 + Math.random() * 5;
        var sc = 0.7 + Math.random() * 0.5;

        var trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1 * sc, 0.2 * sc, h * 0.55, 6), M.trunk
        );
        trunk.position.y = h * 0.275; trunk.castShadow = true; trunk.receiveShadow = true;
        g.add(trunk);

        var layers = 3 + Math.floor(Math.random() * 2);
        var leafMats = [M.leaf1, M.leaf2, M.leafDark];
        var lm = leafMats[Math.floor(Math.random() * 3)];
        for (var i = 0; i < layers; i++) {
            var cr = (layers - i) * 0.55 * sc + 0.35;
            var ch = 2.0 + Math.random() * 0.6;
            var cone = new THREE.Mesh(new THREE.ConeGeometry(cr, ch, 7), lm);
            cone.position.y = h * 0.4 + i * 1.35;
            cone.castShadow = true; cone.receiveShadow = true;
            g.add(cone);
        }
        return g;
    }

    function createOak() {
        var g = new THREE.Group();
        var h = 4.5 + Math.random() * 3.5;
        var trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.34, h * 0.5, 7), M.trunk
        );
        trunk.position.y = h * 0.25; trunk.castShadow = true; trunk.receiveShadow = true;
        g.add(trunk);

        var leafMats = [M.leaf1, M.leaf3, M.leafLight];
        var lm = leafMats[Math.floor(Math.random() * 3)];
        for (var i = 0; i < 3; i++) {
            var r = 1.1 + Math.random() * 0.7;
            var sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6), lm);
            sphere.position.set(
                (Math.random() - 0.5) * 1.0,
                h * 0.5 + Math.random() * 0.6,
                (Math.random() - 0.5) * 1.0
            );
            sphere.castShadow = true; sphere.receiveShadow = true;
            g.add(sphere);
        }
        return g;
    }

    function createBirch() {
        var g = new THREE.Group();
        var h = 6 + Math.random() * 5;
        var trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.12, h * 0.7, 6), M.birchTrunk
        );
        trunk.position.y = h * 0.35; trunk.castShadow = true; trunk.receiveShadow = true;
        g.add(trunk);

        // Dark marks on birch
        for (var m = 0; m < 5; m++) {
            var mark = new THREE.Mesh(
                new THREE.BoxGeometry(0.13, 0.04, 0.14),
                new THREE.MeshPhongMaterial({ color: 0x555544 })
            );
            mark.position.set(
                (Math.random() - 0.5) * 0.06,
                h * 0.1 + Math.random() * h * 0.5,
                (Math.random() - 0.5) * 0.06
            );
            g.add(mark);
        }

        for (var i = 0; i < 4; i++) {
            var r = 0.5 + Math.random() * 0.45;
            var sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 5), M.leafLight);
            sphere.position.set(
                (Math.random() - 0.5) * 1.2,
                h * 0.45 + i * 0.7 + Math.random() * 0.3,
                (Math.random() - 0.5) * 0.9
            );
            sphere.castShadow = true; sphere.receiveShadow = true;
            g.add(sphere);
        }
        return g;
    }

    function randomTree() {
        var r = Math.random();
        if (r < 0.45) return createPine();
        if (r < 0.75) return createOak();
        return createBirch();
    }

    // ============================================================
    // GROUND DECORATIONS
    // ============================================================
    function createMushroom() {
        var g = new THREE.Group();
        var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.2, 6), M.mushStem);
        stem.position.y = 0.1; g.add(stem);
        var cap = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), M.mushCap
        );
        cap.position.y = 0.2; g.add(cap);
        // Spots
        for (var i = 0; i < 3; i++) {
            var spot = new THREE.Mesh(new THREE.CircleGeometry(0.02, 5), M.mushStem);
            var a = Math.random() * Math.PI * 0.8;
            var b = Math.random() * Math.PI * 2;
            spot.position.set(Math.sin(a) * Math.cos(b) * 0.11, 0.2 + Math.cos(a) * 0.1, Math.sin(a) * Math.sin(b) * 0.11);
            spot.lookAt(spot.position.clone().multiplyScalar(2));
            g.add(spot);
        }
        return g;
    }

    function createFlower() {
        var g = new THREE.Group();
        var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.25 + Math.random() * 0.15, 4), M.fern);
        stem.position.y = 0.14; g.add(stem);
        var fm = M.flower[Math.floor(Math.random() * M.flower.length)];
        var petal = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), fm);
        petal.position.y = 0.3; g.add(petal);
        var center = new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 4),
            new THREE.MeshPhongMaterial({ color: 0xffee44 }));
        center.position.y = 0.32; g.add(center);
        return g;
    }

    function createFern() {
        var g = new THREE.Group();
        for (var i = 0; i < 3; i++) {
            var blade = new THREE.Mesh(
                new THREE.PlaneGeometry(0.15, 0.5 + Math.random() * 0.3), M.fern
            );
            blade.position.y = 0.2;
            blade.rotation.y = (i / 3) * Math.PI * 2 + Math.random() * 0.3;
            blade.rotation.x = -0.3;
            g.add(blade);
        }
        return g;
    }

    // ============================================================
    // GRASS TUFTS (path edge detail)
    // ============================================================
    var tuftGeo = null;
    function initTuftGeo() {
        tuftGeo = new THREE.PlaneGeometry(0.12, 0.35);
    }

    function createGrassTuft() {
        var g = new THREE.Group();
        for (var i = 0; i < 3; i++) {
            var blade = new THREE.Mesh(tuftGeo, M.fern);
            blade.position.y = 0.15;
            blade.rotation.y = (i / 3) * Math.PI + Math.random() * 0.4;
            g.add(blade);
        }
        var sc = 0.8 + Math.random() * 0.5;
        g.scale.set(sc, sc, sc);
        return g;
    }

    // ============================================================
    // GROUND SEGMENTS
    // ============================================================
    function createSegment(zStart) {
        var g = new THREE.Group();
        g.userData.zStart = zStart;

        // Grass plane
        var grass = new THREE.Mesh(new THREE.PlaneGeometry(80, C.SEG_LEN), M.grass);
        grass.rotation.x = -Math.PI / 2;
        grass.position.set(0, -0.02, C.SEG_LEN / 2);
        grass.receiveShadow = true;
        g.add(grass);

        // Dirt path
        var path = new THREE.Mesh(new THREE.PlaneGeometry(C.PATH_W, C.SEG_LEN), M.path);
        path.rotation.x = -Math.PI / 2;
        path.position.set(0, 0.0, C.SEG_LEN / 2);
        path.receiveShadow = true;
        g.add(path);

        // Edge stones
        for (var side = -1; side <= 1; side += 2) {
            var ex = side * (C.PATH_W / 2 + 0.15);
            for (var z = 0; z < C.SEG_LEN; z += 1.6 + Math.random() * 2.5) {
                var ssz = 0.2 + Math.random() * 0.3;
                var stone = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(ssz, 0), M.stoneEdge
                );
                stone.position.set(ex + (Math.random() - 0.5) * 0.4, ssz * 0.3, z);
                stone.rotation.set(Math.random(), Math.random(), Math.random());
                stone.receiveShadow = true; stone.castShadow = true;
                g.add(stone);
            }
        }

        // Trees on both sides
        for (var tz = Math.random() * 3; tz < C.SEG_LEN; tz += 2.5 + Math.random() * 4.5) {
            if (Math.random() < 0.72) {
                var tl = randomTree();
                tl.position.set(-(C.PATH_W / 2) - 1.5 - Math.random() * 14, 0, tz);
                tl.rotation.y = Math.random() * Math.PI * 2;
                g.add(tl);
            }
            if (Math.random() < 0.72) {
                var tr = randomTree();
                tr.position.set((C.PATH_W / 2) + 1.5 + Math.random() * 14, 0, tz);
                tr.rotation.y = Math.random() * Math.PI * 2;
                g.add(tr);
            }
        }

        // Ground decorations (mushrooms, flowers, ferns)
        for (var dz = Math.random() * 6; dz < C.SEG_LEN; dz += 3 + Math.random() * 5) {
            for (var ds = -1; ds <= 1; ds += 2) {
                if (Math.random() < 0.35) {
                    var dec;
                    var dr = Math.random();
                    if (dr < 0.25) dec = createMushroom();
                    else if (dr < 0.6) dec = createFlower();
                    else dec = createFern();
                    dec.position.set(
                        ds * (C.PATH_W / 2 + 0.6 + Math.random() * 4),
                        0, dz
                    );
                    dec.rotation.y = Math.random() * Math.PI * 2;
                    g.add(dec);
                }
            }
        }

        // Bushes
        for (var bz = Math.random() * 8; bz < C.SEG_LEN; bz += 5 + Math.random() * 7) {
            for (var bs = -1; bs <= 1; bs += 2) {
                if (Math.random() < 0.4) {
                    var bsh = new THREE.Mesh(
                        new THREE.SphereGeometry(0.4 + Math.random() * 0.5, 6, 5),
                        Math.random() < 0.5 ? M.leaf2 : M.leafDark
                    );
                    bsh.position.set(
                        bs * (C.PATH_W / 2 + 0.8 + Math.random() * 3),
                        0.2, bz
                    );
                    bsh.scale.y = 0.6; bsh.castShadow = true; bsh.receiveShadow = true;
                    g.add(bsh);
                }
            }
        }

        // Grass tufts along path edges
        if (tuftGeo) {
            for (var tz2 = Math.random() * 2; tz2 < C.SEG_LEN; tz2 += 1.5 + Math.random() * 2.5) {
                for (var ts = -1; ts <= 1; ts += 2) {
                    if (Math.random() < 0.6) {
                        var tuft = createGrassTuft();
                        tuft.position.set(
                            ts * (C.PATH_W / 2 + 0.05 + Math.random() * 0.45),
                            0, tz2
                        );
                        tuft.rotation.y = Math.random() * Math.PI * 2;
                        g.add(tuft);
                    }
                }
            }
        }

        g.position.z = zStart;
        FR.scene.add(g);
        return g;
    }

    function initSegments() {
        for (var i = -1; i < C.NUM_SEGS; i++) {
            FR.segments.push(createSegment(i * C.SEG_LEN));
        }
    }

    function recycleSegments() {
        var S = FR.S;
        for (var i = 0; i < FR.segments.length; i++) {
            var seg = FR.segments[i];
            if (seg.position.z + C.SEG_LEN < S.pZ - C.CLEANUP) {
                var maxZ = -Infinity;
                for (var j = 0; j < FR.segments.length; j++) {
                    if (FR.segments[j].position.z > maxZ) maxZ = FR.segments[j].position.z;
                }
                FR.scene.remove(seg);
                // Dispose geometries to free memory
                seg.traverse(function (c) {
                    if (c.geometry) c.geometry.dispose();
                });
                FR.segments[i] = createSegment(maxZ + C.SEG_LEN);
                break;
            }
        }
    }

    // ============================================================
    // OBSTACLES
    // ============================================================

    function makeLog(lane) {
        var g = new THREE.Group();
        var logMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.44, C.LANE_W * 0.9, 8), M.log
        );
        logMesh.rotation.z = Math.PI / 2;
        logMesh.position.y = 0.44; logMesh.castShadow = true;
        g.add(logMesh);

        // End rings
        for (var side = -1; side <= 1; side += 2) {
            var end = new THREE.Mesh(new THREE.CircleGeometry(0.38, 8), M.logEnd);
            end.position.set(side * C.LANE_W * 0.45, 0.44, 0);
            end.rotation.y = side * Math.PI / 2;
            g.add(end);
        }

        // Bark details / small branches
        for (var i = 0; i < 4; i++) {
            var br = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.35, 4), M.branch);
            br.position.set(
                (Math.random() - 0.5) * C.LANE_W * 0.5,
                0.7 + Math.random() * 0.15,
                (Math.random() - 0.5) * 0.25
            );
            br.rotation.set(Math.random(), Math.random(), Math.random());
            g.add(br);
        }

        g.position.x = C.LANES[lane];
        return { mesh: g, type: 'low', lane: lane, z: 0 };
    }

    function makeRock(lane) {
        var g = new THREE.Group();
        var sz = 0.6 + Math.random() * 0.35;
        var rGeo = new THREE.DodecahedronGeometry(sz, 1);
        var pos = rGeo.attributes.position;
        for (var i = 0; i < pos.count; i++) {
            pos.setXYZ(i,
                pos.getX(i) * (0.8 + Math.random() * 0.4),
                pos.getY(i) * (0.65 + Math.random() * 0.35),
                pos.getZ(i) * (0.8 + Math.random() * 0.4)
            );
        }
        rGeo.computeVertexNormals();
        var rock = new THREE.Mesh(rGeo, M.rock);
        rock.position.y = sz * 0.55; rock.castShadow = true;
        g.add(rock);

        // Smaller companion stones
        for (var j = 0; j < 2; j++) {
            if (Math.random() < 0.55) {
                var sz2 = 0.15 + Math.random() * 0.2;
                var r2 = new THREE.Mesh(new THREE.DodecahedronGeometry(sz2, 0), M.rock);
                r2.position.set((Math.random() - 0.5) * 0.8, sz2 * 0.4, (Math.random() - 0.5) * 0.5);
                r2.castShadow = true; g.add(r2);
            }
        }

        g.position.x = C.LANES[lane];
        return { mesh: g, type: 'low', lane: lane, z: 0 };
    }

    function makeVine(lane) {
        var g = new THREE.Group();
        var brLen = C.LANE_W * 1.15;

        // Horizontal branch
        var br = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, brLen, 6), M.branch);
        br.rotation.z = Math.PI / 2; br.position.y = 2.6; br.castShadow = true;
        g.add(br);

        // Support posts
        for (var s = -1; s <= 1; s += 2) {
            var post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.6, 5), M.branch);
            post.position.set(s * brLen * 0.5, 1.3, 0); post.castShadow = true;
            g.add(post);
        }

        // Hanging vines with leaves
        var vc = 6 + Math.floor(Math.random() * 4);
        for (var i = 0; i < vc; i++) {
            var vLen = 0.9 + Math.random() * 1.3;
            var v = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, vLen, 4), M.vine);
            v.position.set(
                (Math.random() - 0.5) * brLen * 0.85,
                2.6 - vLen / 2,
                (Math.random() - 0.5) * 0.35
            );
            v.rotation.z = (Math.random() - 0.5) * 0.12;
            g.add(v);

            // Small leaves on vine tips
            if (Math.random() < 0.6) {
                var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), M.vine);
                leaf.position.set(v.position.x, 2.6 - vLen + 0.05, v.position.z);
                g.add(leaf);
            }
        }

        g.position.x = C.LANES[lane];
        return { mesh: g, type: 'high', lane: lane, z: 0 };
    }

    function makeGap(lane) {
        var g = new THREE.Group();
        var gapLen = 3.8;
        var gapW = C.LANE_W * 0.88;

        // Dark pit
        var pit = new THREE.Mesh(new THREE.BoxGeometry(gapW, 0.7, gapLen), M.pit);
        pit.position.set(C.LANES[lane], -0.36, 0);
        g.add(pit);

        // Cover on path surface
        var cover = new THREE.Mesh(
            new THREE.PlaneGeometry(gapW, gapLen),
            new THREE.MeshPhongMaterial({ color: 0x100a04, transparent: true, opacity: 0.92 })
        );
        cover.rotation.x = -Math.PI / 2;
        cover.position.set(C.LANES[lane], 0.006, 0);
        g.add(cover);

        // Broken edge rocks
        for (var i = 0; i < 12; i++) {
            var esz = 0.1 + Math.random() * 0.14;
            var edge = new THREE.Mesh(new THREE.DodecahedronGeometry(esz, 0), M.pitEdge);
            var zz = (Math.random() - 0.5) * gapLen;
            var sideX = (Math.random() < 0.5 ? -1 : 1) * (gapW * 0.45 + Math.random() * 0.15);
            edge.position.set(C.LANES[lane] + sideX, 0.04 + Math.random() * 0.08, zz);
            edge.rotation.set(Math.random(), Math.random(), Math.random());
            g.add(edge);
        }

        return { mesh: g, type: 'gap', lane: lane, z: 0 };
    }

    function spawnObstacle(lane) {
        var r = Math.random();
        if (r < 0.30)      return makeLog(lane);
        else if (r < 0.55) return makeRock(lane);
        else if (r < 0.80) return makeVine(lane);
        else                return makeGap(lane);
    }

    // ============================================================
    // COINS
    // ============================================================
    var coinGeo = null;
    function initCoinGeo() {
        coinGeo = new THREE.TorusGeometry(0.28, 0.09, 8, 14);
    }

    function makeCoin(lane, z) {
        var coin = new THREE.Mesh(coinGeo, M.coin);
        coin.position.set(C.LANES[lane], C.COIN_Y, z);
        coin.castShadow = true;
        FR.scene.add(coin);
        return { mesh: coin, lane: lane, z: z, collected: false };
    }

    // ============================================================
    // OUTFIT SYSTEM
    // ============================================================
    function applyOutfit(key) {
        var outfit = FR.Shop.cosmetics[key];
        if (!outfit) return;
        M.jacket.color.set(outfit.jacket);
        M.scarf.color.set(outfit.scarf);
        M.hat.color.set(outfit.hat);
    }

    // ============================================================
    // SHIELD VISUAL
    // ============================================================
    var shieldMesh = null;

    function addShield() {
        if (shieldMesh) return;
        var geo = new THREE.SphereGeometry(1.1, 16, 12);
        var mat = new THREE.MeshPhongMaterial({
            color: 0x44aaff,
            transparent: true,
            opacity: 0.22,
            emissive: 0x2288cc,
            emissiveIntensity: 0.4,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        shieldMesh = new THREE.Mesh(geo, mat);
        shieldMesh.position.y = 1.5;
        FR.player.group.add(shieldMesh);
    }

    function removeShield() {
        if (!shieldMesh) return;
        FR.player.group.remove(shieldMesh);
        shieldMesh.geometry.dispose();
        shieldMesh.material.dispose();
        shieldMesh = null;
    }

    function updateShieldVisual(dt) {
        if (!shieldMesh) return;
        shieldMesh.rotation.y += dt * 1.5;
        shieldMesh.material.opacity = 0.18 + Math.sin(FR.S.gTime * 3) * 0.06;
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        initMaterials:   initMaterials,
        createSky:       createSky,
        buildPlayer:     buildPlayer,
        animatePlayer:   animatePlayer,
        initSegments:    initSegments,
        recycleSegments: recycleSegments,
        spawnObstacle:   spawnObstacle,
        initCoinGeo:     initCoinGeo,
        makeCoin:        makeCoin,
        initTreeGeos:    initTreeGeos,
        initTuftGeo:     initTuftGeo,
        applyOutfit:     applyOutfit,
        addShield:       addShield,
        removeShield:    removeShield,
        updateShieldVisual: updateShieldVisual,
    };
})();
