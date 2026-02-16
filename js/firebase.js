/* ================================================================
   firebase.js - Firebase Auth (Google Sign-In) + Firestore cloud save
   ================================================================
   Paste your Firebase config below. If left empty or Firebase SDK
   is not loaded, everything is a silent no-op and the game works
   normally with localStorage only.
   ================================================================ */
(function () {
    'use strict';

    // ---- YOUR FIREBASE CONFIG (paste from Firebase Console) ----
    var firebaseConfig = {
        apiKey: "AIzaSyCXDafsE0juETaG7AYb6oHljhV59aBdHOI",
        authDomain: "forestrunner-4a9dd.firebaseapp.com",
        projectId: "forestrunner-4a9dd",
        storageBucket: "forestrunner-4a9dd.firebasestorage.app",
        messagingSenderId: "850408807723",
        appId: "1:850408807723:web:c90bb45689776c3f1ef96e"
    };

    // ---- Internal state ----
    var auth = null;
    var db = null;
    var currentUser = null;
    var available = false;
    var syncing = false;
    var username = null; // cached username for current user

    // ============================================================
    // INIT
    // ============================================================
    function init() {
        if (typeof firebase === 'undefined') return;
        if (!firebaseConfig.apiKey) return;
        try {
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            available = true;

            auth.onAuthStateChanged(function (user) {
                currentUser = user;
                updateAuthUI();
                if (user) {
                    loadCloudData();
                }
            });

            // Handle redirect result (from signInWithRedirect)
            auth.getRedirectResult().catch(function () {});
        } catch (e) {
            available = false;
        }
    }

    // ============================================================
    // AUTH
    // ============================================================
    function signIn() {
        if (!available || !auth) return;
        var provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(function (e) {
            console.warn('Popup sign-in failed:', e.code, e.message);
            // Fallback to redirect if popup was blocked or failed
            if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user' ||
                e.code === 'auth/cancelled-popup-request') {
                auth.signInWithRedirect(provider);
            }
        });
    }

    function signOut() {
        if (!available || !auth) return;
        username = null;
        auth.signOut().catch(function () {});
    }

    function isSignedIn() {
        return available && currentUser !== null;
    }

    function isAvailable() {
        return available;
    }

    function getUser() {
        return currentUser;
    }

    // ============================================================
    // CLOUD DATA — LOAD & MERGE
    // ============================================================
    function loadCloudData() {
        if (!available || !db || !currentUser) return;
        db.collection('users').doc(currentUser.uid).get()
            .then(function (doc) {
                if (doc.exists) {
                    var data = doc.data();
                    username = data.username || null;
                    mergeCloudData(data);
                } else {
                    // First sign-in: push local data to cloud
                    sync();
                }
                updateAuthUI();
                // If no username set, prompt user to pick one
                if (!username && FR.Fire.onNeedUsername) {
                    FR.Fire.onNeedUsername();
                }
            })
            .catch(function () {
                // Network error — continue with localStorage
            });
    }

    function mergeCloudData(cloud) {
        if (!cloud) return;
        var S = FR.S;
        var shop = FR.Shop;

        // High scores: take higher
        if (cloud.highScore && cloud.highScore > S.highScore) {
            S.highScore = cloud.highScore;
            try { localStorage.setItem('fr_hs', String(S.highScore)); } catch (e) {}
        }
        if (cloud.highCoins && cloud.highCoins > S.highCoins) {
            S.highCoins = cloud.highCoins;
            try { localStorage.setItem('fr_hc', String(S.highCoins)); } catch (e) {}
        }
        if (cloud.totalCoins && cloud.totalCoins > S.totalCoins) {
            S.totalCoins = cloud.totalCoins;
            try { localStorage.setItem('fr_tc', String(S.totalCoins)); } catch (e) {}
        }

        // Wallet: take higher
        if (cloud.wallet && cloud.wallet > shop.wallet) {
            shop.wallet = cloud.wallet;
        }

        // Seed totalCoins from wallet for existing players (one-time migration)
        if (S.totalCoins === 0 && shop.wallet > 0) {
            S.totalCoins = shop.wallet;
            try { localStorage.setItem('fr_tc', String(S.totalCoins)); } catch (e) {}
        }

        // Shop data
        if (cloud.shop) {
            // Active outfit from cloud
            if (cloud.shop.activeOutfit && shop.cosmetics[cloud.shop.activeOutfit]) {
                shop.activeOutfit = cloud.shop.activeOutfit;
            }

            // Powerup quantities: take higher per item
            if (cloud.shop.powerups) {
                for (var pk in cloud.shop.powerups) {
                    if (shop.powerups[pk]) {
                        var cloudQty = cloud.shop.powerups[pk].qty || 0;
                        if (cloudQty > shop.powerups[pk].qty) {
                            shop.powerups[pk].qty = cloudQty;
                        }
                        // Preserve selected state from cloud if local has none selected
                        if (cloud.shop.powerups[pk].selected) {
                            shop.powerups[pk].selected = true;
                        }
                    }
                }
            }

            // Cosmetics owned: union (true on either side = true)
            if (cloud.shop.cosmetics) {
                for (var ck in cloud.shop.cosmetics) {
                    if (shop.cosmetics[ck] && cloud.shop.cosmetics[ck].owned) {
                        shop.cosmetics[ck].owned = true;
                    }
                }
            }

            // Icons owned: union (true on either side = true)
            if (cloud.shop.icons) {
                for (var ik in cloud.shop.icons) {
                    if (shop.icons[ik] && cloud.shop.icons[ik].owned) {
                        shop.icons[ik].owned = true;
                    }
                }
            }

            // activeIcon: cloud wins
            if (cloud.shop.activeIcon !== undefined) {
                shop.activeIcon = cloud.shop.activeIcon;
            }
        }

        // Settings: cloud wins
        if (cloud.settings) {
            if (typeof cloud.settings.volume === 'number') {
                FR.Settings.volume = cloud.settings.volume;
            }
            if (cloud.settings.bindings) {
                for (var bk in cloud.settings.bindings) {
                    if (FR.Settings.bindings[bk] && Array.isArray(cloud.settings.bindings[bk])) {
                        FR.Settings.bindings[bk] = cloud.settings.bindings[bk];
                    }
                }
            }
            FR.Settings.save();
        }

        // Save merged data locally
        shop.save();

        // Push merged result back to cloud
        sync();

        // Update HUD best score if game.js has loaded
        var hudBest = document.getElementById('hud-best');
        if (hudBest) hudBest.textContent = 'Best: ' + S.highScore;
    }

    // ============================================================
    // SYNC — Write current state to Firestore
    // ============================================================
    function sync() {
        if (!available || !db || !currentUser) return;
        if (syncing) return;
        syncing = true;

        var shop = FR.Shop;
        var S = FR.S;

        var powerups = {};
        for (var pk in shop.powerups) {
            powerups[pk] = {
                qty: shop.powerups[pk].qty,
                selected: shop.powerups[pk].selected
            };
        }
        var cosmetics = {};
        for (var ck in shop.cosmetics) {
            cosmetics[ck] = { owned: shop.cosmetics[ck].owned };
        }
        var icons = {};
        for (var ik in shop.icons) {
            icons[ik] = { owned: shop.icons[ik].owned };
        }

        var data = {
            highScore: S.highScore,
            highCoins: S.highCoins,
            totalCoins: S.totalCoins,
            wallet: shop.wallet,
            shop: {
                activeOutfit: shop.activeOutfit,
                activeIcon: shop.activeIcon || null,
                powerups: powerups,
                cosmetics: cosmetics,
                icons: icons
            },
            settings: {
                volume: FR.Settings.volume,
                bindings: FR.Settings.bindings
            },
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            lastSaved: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (username) data.username = username;

        db.collection('users').doc(currentUser.uid).set(data, { merge: true })
            .then(function () {
                syncing = false;
                updateSyncIndicator(true);
                // Update leaderboard entry if user has a username and a score
                if (username && S.highScore > 0) {
                    db.collection('leaderboard').doc(currentUser.uid).set({
                        uid: currentUser.uid,
                        username: username,
                        photoURL: currentUser.photoURL || '',
                        highScore: S.highScore,
                        totalCoins: S.totalCoins,
                        activeIcon: shop.activeIcon || null,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true }).catch(function () {});
                }
            })
            .catch(function () {
                syncing = false;
            });
    }

    // ============================================================
    // AUTH UI
    // ============================================================
    function updateAuthUI() {
        var signedIn = isSignedIn();
        var user = currentUser;

        // Start screen auth
        var startSignIn = document.getElementById('start-signin-btn');
        var startProfile = document.getElementById('start-auth-profile');
        if (startSignIn) startSignIn.style.display = available ? (signedIn ? 'none' : 'flex') : 'none';
        if (startProfile) startProfile.style.display = signedIn ? 'flex' : 'none';

        // Game over auth
        var goProfile = document.getElementById('go-auth-profile');
        if (goProfile) goProfile.style.display = signedIn ? 'flex' : 'none';

        // Settings auth
        var settingsSignIn = document.getElementById('settings-signin-btn');
        var settingsSignOut = document.getElementById('settings-signout-btn');
        var settingsProfile = document.getElementById('settings-auth-profile');
        if (settingsSignIn) settingsSignIn.style.display = available ? (signedIn ? 'none' : 'flex') : 'none';
        if (settingsSignOut) settingsSignOut.style.display = signedIn ? 'inline-block' : 'none';
        if (settingsProfile) settingsProfile.style.display = signedIn ? 'flex' : 'none';

        // Fill in user data
        if (signedIn && user) {
            var displayStr = username || user.displayName || 'Player';
            var names = document.querySelectorAll('.auth-name');
            for (var j = 0; j < names.length; j++) {
                names[j].textContent = displayStr;
            }

            // Avatar: show icon if activeIcon set, otherwise Google photo
            var profiles = document.querySelectorAll('.auth-profile');
            for (var p = 0; p < profiles.length; p++) {
                var prof = profiles[p];
                var imgAvatar = prof.querySelector('.auth-avatar');
                var iconAvatar = prof.querySelector('.auth-icon-avatar');

                if (FR.Shop.activeIcon && FR.Shop.icons[FR.Shop.activeIcon]) {
                    var iconData = FR.Shop.icons[FR.Shop.activeIcon];
                    if (imgAvatar) imgAvatar.style.display = 'none';
                    if (!iconAvatar) {
                        iconAvatar = document.createElement('div');
                        iconAvatar.className = 'auth-icon-avatar';
                        prof.insertBefore(iconAvatar, prof.firstChild);
                    }
                    iconAvatar.style.background = iconData.bg;
                    iconAvatar.textContent = iconData.icon;
                    iconAvatar.style.display = 'flex';
                } else {
                    if (iconAvatar) iconAvatar.style.display = 'none';
                    if (imgAvatar) {
                        imgAvatar.src = user.photoURL || '';
                        imgAvatar.style.display = user.photoURL ? 'block' : 'none';
                    }
                }
            }
        }
    }

    function updateSyncIndicator(success) {
        var indicators = document.querySelectorAll('.auth-synced');
        for (var i = 0; i < indicators.length; i++) {
            indicators[i].style.opacity = success ? '1' : '0';
            if (success) {
                // Fade out after 2 seconds
                (function (el) {
                    setTimeout(function () { el.style.opacity = '0'; }, 2000);
                })(indicators[i]);
            }
        }
    }

    // ============================================================
    // USERNAME
    // ============================================================
    function setUsername(name, callback) {
        if (!available || !db || !currentUser) { if (callback) callback(false); return; }
        username = name;
        var batch = db.batch();
        var userRef = db.collection('users').doc(currentUser.uid);
        batch.set(userRef, { username: name }, { merge: true });
        // Also create/update leaderboard entry
        var lbRef = db.collection('leaderboard').doc(currentUser.uid);
        batch.set(lbRef, {
            uid: currentUser.uid,
            username: name,
            photoURL: currentUser.photoURL || '',
            highScore: FR.S.highScore,
            totalCoins: FR.S.totalCoins,
            activeIcon: FR.Shop.activeIcon || null,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        batch.commit()
            .then(function () {
                updateAuthUI();
                if (callback) callback(true);
            })
            .catch(function () {
                if (callback) callback(false);
            });
    }

    function getUsername() {
        return username;
    }

    // ============================================================
    // LEADERBOARD
    // ============================================================
    function fetchLeaderboard(callback) {
        if (!available || !db) { callback([]); return; }
        db.collection('leaderboard')
            .orderBy('highScore', 'desc')
            .limit(20)
            .get()
            .then(function (snap) {
                var results = [];
                snap.forEach(function (doc) {
                    var d = doc.data();
                    results.push({
                        uid: d.uid || doc.id,
                        username: d.username || 'Player',
                        photoURL: d.photoURL || '',
                        highScore: d.highScore || 0,
                        activeIcon: d.activeIcon || null
                    });
                });
                callback(results);
            })
            .catch(function () {
                callback([]);
            });
    }

    function fetchCoinLeaderboard(callback) {
        if (!available || !db) { callback([]); return; }
        db.collection('leaderboard')
            .orderBy('totalCoins', 'desc')
            .limit(20)
            .get()
            .then(function (snap) {
                var results = [];
                snap.forEach(function (doc) {
                    var d = doc.data();
                    results.push({
                        uid: d.uid || doc.id,
                        username: d.username || 'Player',
                        photoURL: d.photoURL || '',
                        totalCoins: d.totalCoins || 0,
                        activeIcon: d.activeIcon || null
                    });
                });
                callback(results);
            })
            .catch(function () {
                callback([]);
            });
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    FR.Fire = {
        init: init,
        signIn: signIn,
        signOut: signOut,
        sync: sync,
        isSignedIn: isSignedIn,
        isAvailable: isAvailable,
        getUser: getUser,
        getUsername: getUsername,
        setUsername: setUsername,
        fetchLeaderboard: fetchLeaderboard,
        fetchCoinLeaderboard: fetchCoinLeaderboard,
        updateAuthUI: updateAuthUI,
        onNeedUsername: null  // set by game.js to open username modal
    };
})();
