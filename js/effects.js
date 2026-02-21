/* ================================================================
   effects.js - Visual effects: particles, falling leaves,
                fireflies, screen shake, flash overlay
   ================================================================ */
FR.Effects = (function () {
    'use strict';
    var C = FR.C;
    var particGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);

    // ============================================================
    // GENERAL PARTICLES (coin burst, landing dust)
    // ============================================================
    function spawnBurst(pos, color, count, spread, upForce) {
        var pMat = new THREE.MeshBasicMaterial({ color: color, transparent: true });
        for (var i = 0; i < count; i++) {
            var p = new THREE.Mesh(particGeo, pMat.clone());
            p.position.copy(pos);
            var vel = new THREE.Vector3(
                (Math.random() - 0.5) * (spread || 5),
                Math.random() * (upForce || 5) + 1,
                (Math.random() - 0.5) * (spread || 5)
            );
            FR.scene.add(p);
            FR.particles.push({ mesh: p, vel: vel, life: 0.55 + Math.random() * 0.2, maxLife: 0.7 });
        }
    }

    function updateParticles(dt) {
        for (var i = FR.particles.length - 1; i >= 0; i--) {
            var p = FR.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                FR.scene.remove(p.mesh);
                p.mesh.material.dispose();
                FR.particles.splice(i, 1);
                continue;
            }
            p.vel.y -= 14 * dt;
            p.mesh.position.addScaledVector(p.vel, dt);
            var t = p.life / p.maxLife;
            p.mesh.material.opacity = t;
            p.mesh.scale.setScalar(t * 0.8 + 0.2);
            p.mesh.rotation.x += dt * 5;
            p.mesh.rotation.z += dt * 3;
        }
    }

    // ============================================================
    // FALLING LEAVES (THREE.Points)
    // ============================================================
    var leafCount = 180;
    var leafPositions, leafVelocities, leafPoints;

    function makeLeafTexture() {
        var c = document.createElement('canvas'); c.width = 32; c.height = 32;
        var x = c.getContext('2d');
        // Leaf shape
        x.fillStyle = '#5a9a32';
        x.beginPath();
        x.ellipse(16, 14, 5, 11, -0.2, 0, Math.PI * 2);
        x.fill();
        // Darker center vein
        x.strokeStyle = '#3a7a1a'; x.lineWidth = 1;
        x.beginPath(); x.moveTo(16, 3); x.lineTo(15, 26); x.stroke();
        return new THREE.CanvasTexture(c);
    }

    function initLeaves() {
        var geo = new THREE.BufferGeometry();
        leafPositions = new Float32Array(leafCount * 3);
        leafVelocities = [];

        for (var i = 0; i < leafCount; i++) {
            leafPositions[i * 3]     = (Math.random() - 0.5) * 70;
            leafPositions[i * 3 + 1] = 3 + Math.random() * 18;
            leafPositions[i * 3 + 2] = Math.random() * 120;
            leafVelocities.push({
                x: (Math.random() - 0.5) * 0.6,
                y: -0.4 - Math.random() * 1.0,
                z: (Math.random() - 0.5) * 0.4,
                sway: 1 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(leafPositions, 3));
        var mat2 = new THREE.PointsMaterial({
            map: makeLeafTexture(),
            size: 0.45,
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
            sizeAttenuation: true,
        });

        leafPoints = new THREE.Points(geo, mat2);
        FR.scene.add(leafPoints);
        FR.leaves = leafPoints;
    }

    function updateLeaves(dt, playerZ, gTime) {
        var pos = leafPoints.geometry.attributes.position;
        for (var i = 0; i < leafCount; i++) {
            var v = leafVelocities[i];
            var x = pos.getX(i) + v.x * dt + Math.sin(gTime * v.sway + v.phase) * 0.4 * dt;
            var y = pos.getY(i) + v.y * dt;
            var z = pos.getZ(i) + v.z * dt;

            // Recycle if too low or too far behind
            if (y < -0.5 || z < playerZ - 30) {
                x = (Math.random() - 0.5) * 70;
                y = 5 + Math.random() * 18;
                z = playerZ + 10 + Math.random() * 100;
            }
            pos.setXYZ(i, x, y, z);
        }
        pos.needsUpdate = true;
    }

    // ============================================================
    // FIREFLIES (visible at night)
    // ============================================================
    var fireflyCount = 50;
    var fireflyPositions, fireflyVelocities, fireflyPoints;

    function makeFireflyTexture() {
        var c = document.createElement('canvas'); c.width = 16; c.height = 16;
        var x = c.getContext('2d');
        var grd = x.createRadialGradient(8, 8, 0, 8, 8, 8);
        grd.addColorStop(0, 'rgba(255,255,180,1)');
        grd.addColorStop(0.3, 'rgba(255,240,100,0.6)');
        grd.addColorStop(1, 'rgba(255,200,50,0)');
        x.fillStyle = grd;
        x.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(c);
    }

    function initFireflies() {
        var geo = new THREE.BufferGeometry();
        fireflyPositions = new Float32Array(fireflyCount * 3);
        fireflyVelocities = [];

        for (var i = 0; i < fireflyCount; i++) {
            fireflyPositions[i * 3]     = (Math.random() - 0.5) * 40;
            fireflyPositions[i * 3 + 1] = 1 + Math.random() * 5;
            fireflyPositions[i * 3 + 2] = Math.random() * 80;
            fireflyVelocities.push({
                x: (Math.random() - 0.5) * 0.8,
                y: (Math.random() - 0.5) * 0.5,
                z: (Math.random() - 0.5) * 0.6,
                blink: Math.random() * Math.PI * 2,
                blinkSpd: 1.5 + Math.random() * 2,
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
        var mat2 = new THREE.PointsMaterial({
            map: makeFireflyTexture(),
            size: 0.35,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        fireflyPoints = new THREE.Points(geo, mat2);
        FR.scene.add(fireflyPoints);
        FR.fireflies = fireflyPoints;
    }

    function updateFireflies(dt, playerZ, gTime, nightAmount) {
        // nightAmount: 0 = day, 1 = night
        fireflyPoints.material.opacity = nightAmount * 0.9;
        if (nightAmount < 0.05) return;

        var pos = fireflyPoints.geometry.attributes.position;
        for (var i = 0; i < fireflyCount; i++) {
            var v = fireflyVelocities[i];
            var x = pos.getX(i) + v.x * dt;
            var y = pos.getY(i) + v.y * dt + Math.sin(gTime * v.blinkSpd + v.blink) * 0.3 * dt;
            var z = pos.getZ(i) + v.z * dt;

            if (y < 0.5) y = 0.5 + Math.random() * 4;
            if (y > 7) y = 7;
            if (z < playerZ - 20) z = playerZ + 10 + Math.random() * 60;

            pos.setXYZ(i, x, y, z);
        }
        pos.needsUpdate = true;

        // Pulse size
        fireflyPoints.material.size = 0.3 + Math.sin(gTime * 2) * 0.08;
    }

    // ============================================================
    // SCREEN SHAKE
    // ============================================================
    function triggerShake(amount) {
        FR.S.shakeAmt = amount;
        FR.S.shakeDecay = amount;
    }

    function getShakeOffset() {
        var s = FR.S.shakeAmt;
        if (s < 0.01) return { x: 0, y: 0 };
        return {
            x: (Math.random() - 0.5) * s * 0.6,
            y: (Math.random() - 0.5) * s * 0.4,
        };
    }

    function updateShake(dt) {
        if (FR.S.shakeAmt > 0) {
            FR.S.shakeAmt *= Math.max(0, 1 - dt * 8);
            if (FR.S.shakeAmt < 0.01) FR.S.shakeAmt = 0;
        }
    }

    // ============================================================
    // FLASH OVERLAY
    // ============================================================
    var flashEl = null;
    function initFlash() {
        flashEl = document.getElementById('flash');
    }

    function triggerFlash(color, alpha) {
        if (!flashEl) return;
        flashEl.style.background = color || '#ffd700';
        flashEl.style.opacity = alpha || 0.25;
        // Fade out via CSS transition
        setTimeout(function () { flashEl.style.opacity = 0; }, 50);
    }

    // ============================================================
    // CLOUDS (visible during day, fade at night)
    // ============================================================
    var cloudCount = 60;
    var cloudPositions, cloudVelocities, cloudPoints;

    function makeCloudTexture() {
        var c = document.createElement('canvas'); c.width = 64; c.height = 64;
        var x = c.getContext('2d');
        var grd = x.createRadialGradient(32, 32, 0, 32, 32, 30);
        grd.addColorStop(0, 'rgba(255,255,255,0.9)');
        grd.addColorStop(0.4, 'rgba(240,240,255,0.5)');
        grd.addColorStop(0.7, 'rgba(220,230,255,0.15)');
        grd.addColorStop(1, 'rgba(200,220,255,0)');
        x.fillStyle = grd;
        x.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    }

    function initClouds() {
        var geo = new THREE.BufferGeometry();
        cloudPositions = new Float32Array(cloudCount * 3);
        cloudVelocities = [];
        for (var i = 0; i < cloudCount; i++) {
            cloudPositions[i * 3]     = (Math.random() - 0.5) * 100;
            cloudPositions[i * 3 + 1] = 16 + Math.random() * 10;
            cloudPositions[i * 3 + 2] = Math.random() * 120;
            cloudVelocities.push({
                x: (Math.random() - 0.5) * 0.4,
                z: (Math.random() - 0.5) * 0.2,
            });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
        var mat = new THREE.PointsMaterial({
            map: makeCloudTexture(),
            size: 8 + Math.random() * 6,
            transparent: true, opacity: 0.45,
            depthWrite: false, sizeAttenuation: true,
        });
        cloudPoints = new THREE.Points(geo, mat);
        FR.scene.add(cloudPoints);
    }

    function updateClouds(dt, playerZ, gTime, nightAmount) {
        cloudPoints.material.opacity = (1 - nightAmount) * 0.45;
        var pos = cloudPoints.geometry.attributes.position;
        for (var i = 0; i < cloudCount; i++) {
            var v = cloudVelocities[i];
            var x = pos.getX(i) + v.x * dt;
            var z = pos.getZ(i) + v.z * dt;
            if (z < playerZ - 40) {
                x = (Math.random() - 0.5) * 100;
                z = playerZ + 30 + Math.random() * 100;
            }
            pos.setXYZ(i, x, pos.getY(i), z);
        }
        pos.needsUpdate = true;
    }

    // ============================================================
    // STARS (visible at night, twinkle)
    // ============================================================
    var starCount = 100;
    var starPositions, starPhases, starPoints;

    function makeStarTexture() {
        var c = document.createElement('canvas'); c.width = 8; c.height = 8;
        var x = c.getContext('2d');
        var grd = x.createRadialGradient(4, 4, 0, 4, 4, 4);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.5, 'rgba(200,220,255,0.4)');
        grd.addColorStop(1, 'rgba(150,180,255,0)');
        x.fillStyle = grd;
        x.fillRect(0, 0, 8, 8);
        return new THREE.CanvasTexture(c);
    }

    function initStars() {
        var geo = new THREE.BufferGeometry();
        starPositions = new Float32Array(starCount * 3);
        starPhases = [];
        for (var i = 0; i < starCount; i++) {
            starPositions[i * 3]     = (Math.random() - 0.5) * 120;
            starPositions[i * 3 + 1] = 22 + Math.random() * 16;
            starPositions[i * 3 + 2] = Math.random() * 120;
            starPhases.push({ phase: Math.random() * Math.PI * 2, spd: 1.5 + Math.random() * 3 });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        var mat = new THREE.PointsMaterial({
            map: makeStarTexture(),
            size: 0.3, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false, sizeAttenuation: true,
        });
        starPoints = new THREE.Points(geo, mat);
        FR.scene.add(starPoints);
    }

    function updateStars(dt, playerZ, gTime, nightAmount) {
        starPoints.material.opacity = nightAmount * 0.85;
        starPoints.material.size = 0.25 + Math.sin(gTime * 1.5) * 0.05;
        if (nightAmount < 0.05) return;
        var pos = starPoints.geometry.attributes.position;
        for (var i = 0; i < starCount; i++) {
            var z = pos.getZ(i);
            if (z < playerZ - 50) {
                pos.setXYZ(i,
                    (Math.random() - 0.5) * 120,
                    22 + Math.random() * 16,
                    playerZ + 20 + Math.random() * 100
                );
            }
        }
        pos.needsUpdate = true;
    }

    // ============================================================
    // SPEED LINES (appear at high speed)
    // ============================================================
    var speedLines = [];
    var speedLineGeo = null;

    function initSpeedLines() {
        speedLineGeo = new THREE.BoxGeometry(0.015, 0.015, 1);
        for (var i = 0; i < 30; i++) {
            var len = 3 + Math.random() * 4;
            var mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
            var mesh = new THREE.Mesh(speedLineGeo, mat);
            mesh.scale.z = len;
            mesh.visible = false;
            FR.scene.add(mesh);
            speedLines.push({
                mesh: mesh,
                side: (i % 2 === 0) ? -1 : 1,
                baseX: 6 + Math.random() * 8,
                baseY: 0.5 + Math.random() * 3.5,
                zOff: Math.random() * 40,
                len: len,
            });
        }
    }

    function updateSpeedLines(dt, speed, playerZ) {
        var frac = (speed - C.MAX_SPEED * 0.55) / (C.MAX_SPEED * 0.45);
        frac = Math.max(0, Math.min(1, frac));
        for (var i = 0; i < speedLines.length; i++) {
            var sl = speedLines[i];
            if (frac <= 0) { sl.mesh.visible = false; continue; }
            sl.mesh.visible = true;
            sl.zOff -= speed * dt * 2.5;
            if (sl.zOff < -20) {
                sl.zOff = 10 + Math.random() * 30;
                sl.baseY = 0.5 + Math.random() * 3.5;
            }
            sl.mesh.position.set(
                sl.side * sl.baseX,
                sl.baseY,
                playerZ + sl.zOff
            );
            sl.mesh.material.opacity = frac * (0.15 + Math.random() * 0.1);
        }
    }

    // ============================================================
    // TRAIL PARTICLE SYSTEM
    // ============================================================
    var trailParticles = [];
    var trailTimer = 0;
    var TRAIL_MAX = 60;
    var TRAIL_INTERVAL = 0.03;
    var trailGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    var trailGeoSphere = new THREE.SphereGeometry(0.14, 6, 5);
    var trailGeoDiamond = new THREE.OctahedronGeometry(0.15);
    var trailGeoDisc = new THREE.CircleGeometry(0.18, 8);
    var trailShapes = {
        fire: 'sphere', lava: 'sphere', ember: 'sphere', bloodmoon: 'sphere', sunset: 'sphere',
        ice: 'diamond', frost: 'diamond', tundra: 'diamond', electric: 'diamond', cosmic: 'diamond',
        nature: 'disc', petal: 'disc', cherry: 'disc', pollen: 'disc', moss2: 'disc', feather: 'disc', honey: 'disc',
    };
    var trailGeoMap = { sphere: trailGeoSphere, diamond: trailGeoDiamond, disc: trailGeoDisc };

    function updateTrail(dt, playerPos, speed, isGrounded) {
        var trail = FR.Trails;
        if (!trail || trail.active === 'none') return;
        var tType = trail.types[trail.active];
        if (!tType) return;

        trailTimer += dt;
        // Spawn particles
        while (trailTimer >= TRAIL_INTERVAL && trailParticles.length < TRAIL_MAX) {
            trailTimer -= TRAIL_INTERVAL;
            var color;
            if (tType.rainbow) {
                var hue = (Date.now() * 0.001) % 1;
                color = new THREE.Color().setHSL(hue, 1, 0.5);
            } else {
                color = new THREE.Color(Math.random() < 0.5 ? tType.color : tType.color2);
            }
            var mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
            var activeKey = trail.active;
            var shapeKey = trailShapes[activeKey];
            var geo = (shapeKey && trailGeoMap[shapeKey]) || trailGeo;
            var mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                playerPos.x + (Math.random() - 0.5) * 0.4,
                playerPos.y + 0.3 + Math.random() * 0.6,
                playerPos.z - 0.5 - Math.random() * 0.3
            );
            mesh.scale.setScalar(1.0 + Math.random() * 0.6);
            FR.scene.add(mesh);
            trailParticles.push({
                mesh: mesh,
                vel: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.8,
                    0.5 + Math.random() * 1.0,
                    -(speed * 0.05 + Math.random() * 0.5)
                ),
                life: 0.7 + Math.random() * 0.4,
                maxLife: 1.1,
                shape: shapeKey || 'box'
            });
        }
        if (trailTimer >= TRAIL_INTERVAL) trailTimer = 0;

        // Update particles
        for (var i = trailParticles.length - 1; i >= 0; i--) {
            var p = trailParticles[i];
            p.life -= dt;
            if (p.life <= 0) {
                FR.scene.remove(p.mesh);
                p.mesh.material.dispose();
                trailParticles.splice(i, 1);
                continue;
            }
            p.mesh.position.addScaledVector(p.vel, dt);
            var t = p.life / p.maxLife;
            p.mesh.material.opacity = t * 0.9;
            p.mesh.scale.setScalar(t * 1.0 + 0.3);
            if (p.shape === 'diamond') {
                p.mesh.rotation.x += dt * 4;
                p.mesh.rotation.y += dt * 3;
            } else if (p.shape === 'disc') {
                p.mesh.rotation.z += dt * 3;
            }
        }
    }

    function clearTrail() {
        for (var i = trailParticles.length - 1; i >= 0; i--) {
            FR.scene.remove(trailParticles[i].mesh);
            trailParticles[i].mesh.material.dispose();
        }
        trailParticles.length = 0;
        trailTimer = 0;
    }

    // ============================================================
    // ENHANCED DEATH BURST
    // ============================================================
    var sphereGeo = new THREE.SphereGeometry(0.06, 5, 4);

    function spawnDeathBurst(pos) {
        var colors = [
            FR.mat.jacket ? FR.mat.jacket.color.getHex() : 0x2a6699,
            FR.mat.scarf ? FR.mat.scarf.color.getHex() : 0xcc3333,
            0xff4422, 0xffaa22, 0xffffff,
        ];
        for (var i = 0; i < 30; i++) {
            var geo = (i % 3 === 0) ? sphereGeo : particGeo;
            var col = colors[Math.floor(Math.random() * colors.length)];
            var mat = new THREE.MeshBasicMaterial({ color: col, transparent: true });
            var p = new THREE.Mesh(geo, mat);
            p.position.copy(pos);
            p.position.y += 1.2;
            var vel = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 10 + 2,
                (Math.random() - 0.5) * 8
            );
            FR.scene.add(p);
            FR.particles.push({ mesh: p, vel: vel, life: 0.7 + Math.random() * 0.4, maxLife: 1.1 });
        }
    }

    // ============================================================
    // LANDING RING EFFECT
    // ============================================================
    var landingRings = [];

    function spawnLandingRing(pos) {
        var geo = new THREE.RingGeometry(0.1, 0.3, 16);
        var mat = new THREE.MeshBasicMaterial({
            color: 0x8a7a5a, transparent: true, opacity: 0.5,
            side: THREE.DoubleSide, depthWrite: false,
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(pos.x, 0.05, pos.z);
        FR.scene.add(mesh);
        landingRings.push({ mesh: mesh, life: 0.4 });
    }

    function updateLandingRings(dt) {
        for (var i = landingRings.length - 1; i >= 0; i--) {
            var r = landingRings[i];
            r.life -= dt;
            if (r.life <= 0) {
                FR.scene.remove(r.mesh);
                r.mesh.geometry.dispose();
                r.mesh.material.dispose();
                landingRings.splice(i, 1);
                continue;
            }
            var t = 1 - (r.life / 0.4);
            var sc = 0.3 + t * 2.5;
            r.mesh.scale.set(sc, sc, 1);
            r.mesh.material.opacity = (1 - t) * 0.5;
        }
    }

    // ============================================================
    // CONFETTI BURST (new high score celebration)
    // ============================================================
    var confettiColors = [0xff0000, 0xff8800, 0xffff00, 0x00cc44, 0x0088ff, 0x6644ff, 0xff44cc];

    function spawnConfetti(count) {
        count = count || 40;
        var camPos = FR.camera.position.clone();
        var camDir = new THREE.Vector3();
        FR.camera.getWorldDirection(camDir);
        var spawnPos = camPos.clone().addScaledVector(camDir, 6);
        spawnPos.y += 4;
        for (var i = 0; i < count; i++) {
            var color = confettiColors[i % confettiColors.length];
            var mat = new THREE.MeshBasicMaterial({ color: color, transparent: true });
            var p = new THREE.Mesh(particGeo, mat);
            p.position.set(
                spawnPos.x + (Math.random() - 0.5) * 6,
                spawnPos.y + Math.random() * 2,
                spawnPos.z + (Math.random() - 0.5) * 4
            );
            p.scale.set(1.5 + Math.random(), 0.5 + Math.random() * 0.5, 1);
            var vel = new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                Math.random() * 4 + 2,
                (Math.random() - 0.5) * 6
            );
            FR.scene.add(p);
            FR.particles.push({ mesh: p, vel: vel, life: 1.5 + Math.random() * 1.0, maxLife: 2.5 });
        }
    }

    // ============================================================
    // RAIN PARTICLE SYSTEM
    // ============================================================
    var rainCount = 120;
    var rainPositions, rainVelocities, rainPoints;
    var rainActive = false, rainTimer = 0, rainCooldown = 0, rainOpacity = 0, rainDuration = 0;

    function makeRainTexture() {
        var c = document.createElement('canvas'); c.width = 4; c.height = 16;
        var x = c.getContext('2d');
        var grd = x.createLinearGradient(2, 0, 2, 16);
        grd.addColorStop(0, 'rgba(180,200,255,0)');
        grd.addColorStop(0.3, 'rgba(180,200,255,0.8)');
        grd.addColorStop(1, 'rgba(180,200,255,0)');
        x.fillStyle = grd;
        x.fillRect(0, 0, 4, 16);
        return new THREE.CanvasTexture(c);
    }

    function initRain() {
        var geo = new THREE.BufferGeometry();
        rainPositions = new Float32Array(rainCount * 3);
        rainVelocities = [];
        for (var i = 0; i < rainCount; i++) {
            rainPositions[i * 3]     = (Math.random() - 0.5) * 40;
            rainPositions[i * 3 + 1] = Math.random() * 20;
            rainPositions[i * 3 + 2] = Math.random() * 80;
            rainVelocities.push({
                y: -(12 + Math.random() * 6),
                x: 0.5 + Math.random() * 0.5
            });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        var mat = new THREE.PointsMaterial({
            map: makeRainTexture(),
            size: 0.3,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            sizeAttenuation: true
        });
        rainPoints = new THREE.Points(geo, mat);
        FR.scene.add(rainPoints);
    }

    function updateRain(dt, playerZ, gTime) {
        if (!rainPoints) return;

        // State machine: inactive -> active -> cooldown
        if (!rainActive && rainCooldown <= 0) {
            if (Math.random() < 0.001) {
                rainActive = true;
                rainDuration = 20 + Math.random() * 40;
                rainTimer = 0;
            }
        }
        if (rainActive) {
            rainTimer += dt;
            if (rainTimer >= rainDuration) {
                rainActive = false;
                rainCooldown = 30 + Math.random() * 30;
            }
        }
        if (rainCooldown > 0) rainCooldown -= dt;

        // Fade opacity
        var targetOp = rainActive ? 0.6 : 0;
        rainOpacity += (targetOp - rainOpacity) * Math.min(1, dt * 2);
        rainPoints.material.opacity = rainOpacity;

        if (rainOpacity < 0.01) return;

        var pos = rainPoints.geometry.attributes.position;
        for (var i = 0; i < rainCount; i++) {
            var v = rainVelocities[i];
            var x = pos.getX(i) + v.x * dt;
            var y = pos.getY(i) + v.y * dt;
            var z = pos.getZ(i);
            if (y < -0.5 || z < playerZ - 20) {
                x = (Math.random() - 0.5) * 40;
                y = 15 + Math.random() * 10;
                z = playerZ + Math.random() * 80;
            }
            pos.setXYZ(i, x, y, z);
        }
        pos.needsUpdate = true;
    }

    function isRaining() {
        return rainActive;
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        spawnBurst:       spawnBurst,
        updateParticles:  updateParticles,
        initLeaves:       initLeaves,
        updateLeaves:     updateLeaves,
        initFireflies:    initFireflies,
        updateFireflies:  updateFireflies,
        triggerShake:     triggerShake,
        getShakeOffset:   getShakeOffset,
        updateShake:      updateShake,
        initFlash:        initFlash,
        triggerFlash:     triggerFlash,
        initClouds:       initClouds,
        updateClouds:     updateClouds,
        initStars:        initStars,
        updateStars:      updateStars,
        initSpeedLines:   initSpeedLines,
        updateSpeedLines: updateSpeedLines,
        spawnDeathBurst:  spawnDeathBurst,
        spawnLandingRing: spawnLandingRing,
        updateLandingRings: updateLandingRings,
        updateTrail:      updateTrail,
        clearTrail:       clearTrail,
        spawnConfetti:    spawnConfetti,
        initRain:         initRain,
        updateRain:       updateRain,
        isRaining:        isRaining,
    };
})();
