/* ================================================================
   audio.js - Procedural audio via Web Audio API
   Wind ambience, bird chirps, footsteps, and sound effects
   ================================================================ */
FR.Audio = (function () {
    'use strict';
    var ctx = null, masterGain = null, ambGain = null;
    var footL = true, stepCD = 0;

    function init() {
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = 1.0;
            masterGain.connect(ctx.destination);
            startAmbient();
        } catch (e) { ctx = null; }
    }

    // ---- Ambient layers ----
    function startAmbient() {
        // Wind (filtered noise)
        var len = ctx.sampleRate * 2;
        var buf = ctx.createBuffer(2, len, ctx.sampleRate);
        for (var ch = 0; ch < 2; ch++) {
            var d = buf.getChannelData(ch);
            for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1);
        }
        var src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;

        var filt = ctx.createBiquadFilter();
        filt.type = 'bandpass'; filt.frequency.value = 320; filt.Q.value = 0.35;

        // Slow LFO on filter frequency for natural feel
        var lfo = ctx.createOscillator();
        var lfoG = ctx.createGain();
        lfo.frequency.value = 0.15;
        lfoG.gain.value = 80;
        lfo.connect(lfoG);
        lfoG.connect(filt.frequency);
        lfo.start();

        ambGain = ctx.createGain();
        ambGain.gain.value = 0.06;

        src.connect(filt);
        filt.connect(ambGain);
        ambGain.connect(masterGain);
        src.start();

        // Second wind layer (higher)
        var src2 = ctx.createBufferSource();
        src2.buffer = buf; src2.loop = true;
        var f2 = ctx.createBiquadFilter();
        f2.type = 'highpass'; f2.frequency.value = 2000;
        var g2 = ctx.createGain(); g2.gain.value = 0.015;
        src2.connect(f2); f2.connect(g2); g2.connect(masterGain);
        src2.start();

        scheduleBird();
    }

    // ---- Bird chirps ----
    function scheduleBird() {
        var delay = 2200 + Math.random() * 6000;
        setTimeout(function () {
            if (ctx && ctx.state === 'running') chirp();
            scheduleBird();
        }, delay);
    }

    function chirp() {
        var t = ctx.currentTime;
        var notes = 1 + Math.floor(Math.random() * 3);
        for (var n = 0; n < notes; n++) {
            var offset = n * 0.1;
            var o = ctx.createOscillator();
            var g = ctx.createGain();
            o.connect(g); g.connect(masterGain);
            var f = 1200 + Math.random() * 1200;
            o.frequency.setValueAtTime(f, t + offset);
            o.frequency.exponentialRampToValueAtTime(f * (0.7 + Math.random() * 0.8), t + offset + 0.06);
            g.gain.setValueAtTime(0.035, t + offset);
            g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);
            o.start(t + offset); o.stop(t + offset + 0.1);
        }
    }

    // ---- Footstep (synced to run animation) ----
    function footstep() {
        if (!ctx) return;
        var t = ctx.currentTime;
        // Thud
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.connect(g); g.connect(masterGain);
        o.type = 'sine';
        o.frequency.setValueAtTime(80 + Math.random() * 30, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.06);
        g.gain.setValueAtTime(0.07, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.start(t); o.stop(t + 0.08);
        // Crunch noise
        var len2 = ctx.sampleRate * 0.05;
        var nb = ctx.createBuffer(1, len2, ctx.sampleRate);
        var nd = nb.getChannelData(0);
        for (var i = 0; i < len2; i++) nd[i] = (Math.random() * 2 - 1);
        var ns = ctx.createBufferSource(); ns.buffer = nb;
        var nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 3000;
        var ng = ctx.createGain(); ng.gain.setValueAtTime(0.04, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        ns.connect(nf); nf.connect(ng); ng.connect(masterGain);
        ns.start(t); ns.stop(t + 0.05);
    }

    // ---- Sound effects ----
    function play(type) {
        if (!ctx) return;
        var t = ctx.currentTime;
        switch (type) {
            case 'coin': {
                var o1 = ctx.createOscillator(), g1 = ctx.createGain();
                o1.connect(g1); g1.connect(masterGain);
                o1.type = 'sine';
                o1.frequency.setValueAtTime(880, t);
                o1.frequency.exponentialRampToValueAtTime(1760, t + 0.06);
                g1.gain.setValueAtTime(0.18, t);
                g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                o1.start(t); o1.stop(t + 0.12);
                // Harmonic
                var o2 = ctx.createOscillator(), g2 = ctx.createGain();
                o2.connect(g2); g2.connect(masterGain);
                o2.type = 'sine';
                o2.frequency.setValueAtTime(1320, t + 0.05);
                o2.frequency.exponentialRampToValueAtTime(2200, t + 0.12);
                g2.gain.setValueAtTime(0.12, t + 0.05);
                g2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                o2.start(t + 0.05); o2.stop(t + 0.18);
                break;
            }
            case 'jump': {
                var oj = ctx.createOscillator(), gj = ctx.createGain();
                oj.connect(gj); gj.connect(masterGain);
                oj.type = 'sine';
                oj.frequency.setValueAtTime(200, t);
                oj.frequency.exponentialRampToValueAtTime(580, t + 0.12);
                gj.gain.setValueAtTime(0.12, t);
                gj.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                oj.start(t); oj.stop(t + 0.18);
                break;
            }
            case 'slide': {
                var os = ctx.createOscillator(), gs = ctx.createGain();
                os.connect(gs); gs.connect(masterGain);
                os.type = 'sawtooth';
                os.frequency.setValueAtTime(380, t);
                os.frequency.exponentialRampToValueAtTime(80, t + 0.18);
                gs.gain.setValueAtTime(0.06, t);
                gs.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
                os.start(t); os.stop(t + 0.22);
                break;
            }
            case 'hit': {
                var oh = ctx.createOscillator(), gh = ctx.createGain();
                oh.connect(gh); gh.connect(masterGain);
                oh.type = 'square';
                oh.frequency.setValueAtTime(140, t);
                oh.frequency.exponentialRampToValueAtTime(35, t + 0.35);
                gh.gain.setValueAtTime(0.28, t);
                gh.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
                oh.start(t); oh.stop(t + 0.45);
                // Noise crunch
                var hlen = ctx.sampleRate * 0.2;
                var hb = ctx.createBuffer(1, hlen, ctx.sampleRate);
                var hd = hb.getChannelData(0);
                for (var i = 0; i < hlen; i++) hd[i] = (Math.random() * 2 - 1);
                var hs = ctx.createBufferSource(); hs.buffer = hb;
                var hg = ctx.createGain();
                hg.gain.setValueAtTime(0.15, t);
                hg.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                hs.connect(hg); hg.connect(masterGain);
                hs.start(t); hs.stop(t + 0.25);
                break;
            }
            case 'land': {
                var ol = ctx.createOscillator(), gl = ctx.createGain();
                ol.connect(gl); gl.connect(masterGain);
                ol.type = 'sine';
                ol.frequency.setValueAtTime(100, t);
                ol.frequency.exponentialRampToValueAtTime(50, t + 0.08);
                gl.gain.setValueAtTime(0.08, t);
                gl.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                ol.start(t); ol.stop(t + 0.1);
                break;
            }
        }
    }

    // Called every frame to trigger footsteps in sync with running
    function updateSteps(dt, speed, isGrounded) {
        if (!isGrounded || !ctx) return;
        stepCD -= dt;
        if (stepCD <= 0) {
            footstep();
            stepCD = 0.28 - (speed / FR.C.MAX_SPEED) * 0.1; // faster at higher speed
        }
    }

    // Adjust ambient volume based on speed
    function updateAmbient(speed) {
        if (!ambGain) return;
        var t = (speed - FR.C.INIT_SPEED) / (FR.C.MAX_SPEED - FR.C.INIT_SPEED);
        ambGain.gain.value = 0.06 + t * 0.06;
    }

    return { init: init, play: play, updateSteps: updateSteps, updateAmbient: updateAmbient };
})();
