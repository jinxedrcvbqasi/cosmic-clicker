/**
 * ══════════════════════════════════════════
 *  COSMIC CLICKER — firebase.js
 *  Firebase Realtime Database setup
 * ══════════════════════════════════════════
 *
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  SETUP INSTRUCTIONS                                         │
 *  │                                                             │
 *  │  1. Go to https://console.firebase.google.com               │
 *  │  2. Create a new project (or use existing)                  │
 *  │  3. Click "Add app" → Web (</> icon)                        │
 *  │  4. Copy your firebaseConfig object below                   │
 *  │  5. In Firebase Console → Build → Realtime Database         │
 *  │     → Create database → Start in TEST MODE                  │
 *  │                                                             │
 *  │  Database Rules (for development — set in Firebase console):|
 *  │  {                                                          │
 *  │    "rules": {                                               │
 *  │      ".read": true,                                         │
 *  │      ".write": true                                         │
 *  │    }                                                        │
 *  │  }                                                          │
 *  └─────────────────────────────────────────────────────────────┘
 */

// ── REPLACE THIS WITH YOUR FIREBASE CONFIG ──────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBmBBG2d77LFW9CjoaPGq_0_82GhIAyARA",
  authDomain: "cosmic-clicker-f8a14.firebaseapp.com",
  projectId: "cosmic-clicker-f8a14",
  storageBucket: "cosmic-clicker-f8a14.firebasestorage.app",
  messagingSenderId: "961977045043",
  appId: "1:961977045043:web:39aa8fcbe678afd9e29346",
  measurementId: "G-Y46DSVF2XJ"
}; ────────────────────────────────────────────────────────────────

// Initialise Firebase
let db = null;
let firebaseReady = false;

try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  firebaseReady = true;
  console.log("✅ Firebase connected");
} catch (e) {
  console.warn("⚠️ Firebase init failed — running in offline mode.", e.message);
}

/* ── Sanitise username for use as a Firebase key ── */
function sanitiseKey(name) {
  return name.trim()
    .replace(/\./g, '_')
    .replace(/#/g, '_')
    .replace(/\$/g, '_')
    .replace(/\[/g, '_')
    .replace(/\]/g, '_')
    .replace(/\//g, '_')
    .slice(0, 30);
}

/* ═══════════════════════════════════════════
   PLAYER DATA — save / load
═══════════════════════════════════════════ */

/**
 * Save player data to Firebase.
 * @param {string} username
 * @param {object} data  { coins, totalCoins, coinsPerClick, coinsPerSecond, upgradeLevels }
 */
function fbSavePlayer(username, data) {
  if (!firebaseReady) return;
  const key = sanitiseKey(username);
  db.ref(`players/${key}`).set({
    name:           username,
    coins:          Math.floor(data.coins),
    totalCoins:     Math.floor(data.totalCoins),
    coinsPerClick:  data.coinsPerClick,
    coinsPerSecond: data.coinsPerSecond,
    upgradeLevels:  data.upgradeLevels,
    lastSeen:       firebase.database.ServerValue.TIMESTAMP,
  }).catch(err => console.warn("Save failed:", err.message));
}

/**
 * Load player data from Firebase.
 * @param {string} username
 * @returns {Promise<object|null>}
 */
function fbLoadPlayer(username) {
  if (!firebaseReady) return Promise.resolve(null);
  const key = sanitiseKey(username);
  return db.ref(`players/${key}`).once('value')
    .then(snap => snap.val())
    .catch(err => { console.warn("Load failed:", err.message); return null; });
}

/* ═══════════════════════════════════════════
   PRESENCE — online player counter
═══════════════════════════════════════════ */

let presenceRef = null;

/**
 * Register this player as online. Automatically cleans up on disconnect.
 * @param {string} username
 */
function fbSetOnline(username) {
  if (!firebaseReady) return;
  const key = sanitiseKey(username);
  presenceRef = db.ref(`presence/${key}`);

  // Use .info/connected for reliable presence
  db.ref('.info/connected').on('value', snap => {
    if (snap.val() === false) return;
    presenceRef.set({
      name: username,
      joinedAt: firebase.database.ServerValue.TIMESTAMP,
    });
    presenceRef.onDisconnect().remove();
  });
}

/**
 * Listen to online count changes.
 * @param {function} callback  (count: number) => void
 */
function fbOnOnlineCount(callback) {
  if (!firebaseReady) { callback(1); return; }
  db.ref('presence').on('value', snap => {
    callback(snap.numChildren());
  });
}

/* ═══════════════════════════════════════════
   LEADERBOARD — top 10 by totalCoins
═══════════════════════════════════════════ */

/**
 * Listen to leaderboard changes (top 10 by totalCoins).
 * @param {function} callback  (entries: Array<{name, totalCoins}>) => void
 */
function fbOnLeaderboard(callback) {
  if (!firebaseReady) { callback([]); return; }
  db.ref('players')
    .orderByChild('totalCoins')
    .limitToLast(10)
    .on('value', snap => {
      const entries = [];
      snap.forEach(child => {
        const d = child.val();
        if (d && d.name) {
          entries.push({ name: d.name, totalCoins: d.totalCoins || 0 });
        }
      });
      entries.sort((a, b) => b.totalCoins - a.totalCoins);
      callback(entries);
    });
}
