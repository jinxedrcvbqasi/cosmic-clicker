/**
 * ══════════════════════════════════════════
 *  COSMIC CLICKER v2 — firebase.js
 *  All Firebase Realtime Database operations
 * ══════════════════════════════════════════
 *
 *  SETUP:
 *  1. https://console.firebase.google.com → Create project
 *  2. Build → Realtime Database → Create database → Test mode
 *  3. Project Settings → Web app → copy config below
 *
 *  DATABASE RULES (Firebase Console → Rules):
 *  { "rules": { ".read": true, ".write": true } }
 */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmBBG2d77LFW9CjoaPGq_0_82GhIAyARA",
  authDomain: "cosmic-clicker-f8a14.firebaseapp.com",
  databaseURL: "https://cosmic-clicker-f8a14-default-rtdb.firebaseio.com",
  projectId: "cosmic-clicker-f8a14",
  storageBucket: "cosmic-clicker-f8a14.firebasestorage.app",
  messagingSenderId: "961977045043",
  appId: "1:961977045043:web:39aa8fcbe678afd9e29346",
  measurementId: "G-Y46DSVF2XJ"
};

let db = null;
let firebaseReady = false;

try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  firebaseReady = true;
  console.log("✅ Firebase connected");
} catch (e) {
  console.warn("⚠️ Firebase offline mode:", e.message);
}

function sanitiseKey(name) {
  return (name || '').trim()
    .replace(/[.#$\[\]\/]/g, '_')
    .slice(0, 30) || 'anonymous';
}

/* ═══════════════════ PLAYER ═══════════════════ */
function fbSavePlayer(username, data) {
  if (!firebaseReady) return;
  const key = sanitiseKey(username);
  db.ref(`players/${key}`).set({
    name:           username,
    coins:          Math.floor(data.coins          || 0),
    totalCoins:     Math.floor(data.totalCoins      || 0),
    coinsPerClick:  data.coinsPerClick  || 1,
    coinsPerSecond: data.coinsPerSecond || 0,
    upgradeLevels:  data.upgradeLevels  || {},
    prestigeLevel:  data.prestigeLevel  || 0,
    achievements:   data.achievements   || {},
    dailyQuests:    data.dailyQuests    || {},
    totalClicks:    data.totalClicks    || 0,
    clanId:         data.clanId         || null,
    activeSkin:     data.activeSkin     || 'default',
    unlockedSkins:  data.unlockedSkins  || {},
    lastSeen:       firebase.database.ServerValue.TIMESTAMP,
  }).catch(e => console.warn("Save failed:", e.message));
}

function fbLoadPlayer(username) {
  if (!firebaseReady) return Promise.resolve(null);
  return db.ref(`players/${sanitiseKey(username)}`).once('value')
    .then(s => s.val())
    .catch(() => null);
}

/* ═══════════════════ PRESENCE ═══════════════════ */
let presenceRef = null;
let heartbeatInterval = null;

function fbSetOnline(username) {
  if (!firebaseReady) return;
  const key = sanitiseKey(username);
  presenceRef = db.ref(`presence/${key}`);

  db.ref('.info/connected').on('value', async snap => {
    if (!snap.val()) return;
    try {
      await presenceRef.onDisconnect().remove();
      await presenceRef.set({
        name: username,
        joinedAt: firebase.database.ServerValue.TIMESTAMP,
      });
      console.log("✅ Presence set:", username);
    } catch (e) {
      console.warn("⚠️ Presence failed:", e.message);
    }
  });

  clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (presenceRef) presenceRef.set({
      name: username,
      joinedAt: firebase.database.ServerValue.TIMESTAMP,
    }).catch(() => {});
  }, 50000);
}

function fbOnOnlineCount(callback) {
  if (!firebaseReady) { callback(1); return; }
  db.ref('presence').on('value', snap => {
    callback(snap.numChildren());
  }, () => callback(0));
}

/* Returns list of {key, name} for online players */
function fbOnOnlinePlayers(callback) {
  if (!firebaseReady) { callback([]); return; }
  db.ref('presence').on('value', snap => {
    const list = [];
    snap.forEach(c => {
      const d = c.val();
      if (d && d.name) list.push({ key: c.key, name: d.name });
    });
    callback(list);
  }, () => callback([]));
}

/* ═══════════════════ LEADERBOARD ═══════════════════ */
function fbOnLeaderboard(callback) {
  if (!firebaseReady) { callback([]); return; }
  db.ref('players').orderByChild('totalCoins').limitToLast(10)
    .on('value', snap => {
      const entries = [];
      snap.forEach(c => {
        const d = c.val();
        if (d && d.name) entries.push({ name: d.name, totalCoins: d.totalCoins || 0 });
      });
      entries.sort((a, b) => b.totalCoins - a.totalCoins);
      callback(entries);
    }, () => callback([]));
}

/* ═══════════════════ CHAT ═══════════════════ */
function fbSendChat(username, text) {
  if (!firebaseReady || !text.trim()) return;
  const key = Date.now() + '_' + sanitiseKey(username);
  db.ref(`chat/${key}`).set({
    name: username,
    text: text.trim().slice(0, 120),
    time: firebase.database.ServerValue.TIMESTAMP,
  }).catch(() => {});
}

function fbOnChat(callback) {
  if (!firebaseReady) return;
  db.ref('chat').orderByChild('time').limitToLast(35)
    .on('value', snap => {
      const msgs = [];
      snap.forEach(c => { const d = c.val(); if (d) msgs.push(d); });
      callback(msgs);
    }, () => {});
}

/* Prune old chat (keep last 60 messages) */
function fbPruneChat() {
  if (!firebaseReady) return;
  db.ref('chat').orderByChild('time').once('value', snap => {
    if (snap.numChildren() > 60) {
      const keys = [];
      snap.forEach(c => keys.push(c.key));
      keys.slice(0, keys.length - 60).forEach(k => db.ref(`chat/${k}`).remove());
    }
  });
}

/* ═══════════════════ GIFTS ═══════════════════ */
function fbSendGift(fromName, toKey, amount) {
  if (!firebaseReady) return Promise.resolve(false);
  const notifKey = Date.now() + '_gift';
  return db.ref(`notifications/${toKey}/${notifKey}`).set({
    type: 'gift',
    from: fromName,
    amount: Math.floor(amount),
    time: firebase.database.ServerValue.TIMESTAMP,
  }).then(() => true).catch(() => false);
}

function fbListenNotifications(username, callback) {
  if (!firebaseReady) return;
  const key = sanitiseKey(username);
  db.ref(`notifications/${key}`).on('child_added', snap => {
    const d = snap.val();
    if (d) {
      callback(d, snap.key);
      // Remove after reading
      snap.ref.remove();
    }
  }, () => {});
}

/* ═══════════════════ DUELS ═══════════════════ */
function fbChallengeDuel(challengerName, challengedKey, prize) {
  if (!firebaseReady) return null;
  const duelKey = `duel_${Date.now()}`;
  db.ref(`duels/${duelKey}`).set({
    challenger: challengerName,
    challengedKey: challengedKey,
    prize: prize || 500,
    status: 'pending',
    scores: { [sanitiseKey(challengerName)]: 0, opp: 0 },
    startTime: null,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
  }).catch(() => {});
  // Notify challenged player
  db.ref(`notifications/${challengedKey}/duel_${Date.now()}`).set({
    type: 'duel',
    duelKey,
    from: challengerName,
    prize: prize || 500,
    time: firebase.database.ServerValue.TIMESTAMP,
  }).catch(() => {});
  return duelKey;
}

function fbAcceptDuel(duelKey) {
  if (!firebaseReady) return;
  db.ref(`duels/${duelKey}`).update({
    status: 'active',
    startTime: firebase.database.ServerValue.TIMESTAMP,
  }).catch(() => {});
}

function fbUpdateDuelScore(duelKey, scoreKey, score) {
  if (!firebaseReady) return;
  db.ref(`duels/${duelKey}/scores/${scoreKey}`).set(score).catch(() => {});
}

function fbListenDuel(duelKey, callback) {
  if (!firebaseReady) return;
  db.ref(`duels/${duelKey}`).on('value', snap => {
    if (snap.val()) callback(snap.val());
  }, () => {});
}

function fbFinishDuel(duelKey) {
  if (!firebaseReady) return;
  db.ref(`duels/${duelKey}`).update({ status: 'finished' }).catch(() => {});
  // Clean up after 1 min
  setTimeout(() => db.ref(`duels/${duelKey}`).remove().catch(() => {}), 60000);
}

/* ═══════════════════ CLANS ═══════════════════ */
function fbCreateClan(clanName, username) {
  if (!firebaseReady) return Promise.resolve(false);
  const clanKey = sanitiseKey(clanName);
  return db.ref(`clans/${clanKey}`).once('value').then(snap => {
    if (snap.val()) return false; // exists
    return db.ref(`clans/${clanKey}`).set({
      name: clanName,
      founder: username,
      members: { [sanitiseKey(username)]: username },
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    }).then(() => true);
  }).catch(() => false);
}

function fbJoinClan(clanName, username) {
  if (!firebaseReady) return Promise.resolve(false);
  const clanKey = sanitiseKey(clanName);
  return db.ref(`clans/${clanKey}`).once('value').then(snap => {
    if (!snap.val()) return false; // doesn't exist
    return db.ref(`clans/${clanKey}/members/${sanitiseKey(username)}`).set(username).then(() => true);
  }).catch(() => false);
}

function fbLeaveClan(clanName, username) {
  if (!firebaseReady) return;
  const clanKey = sanitiseKey(clanName);
  db.ref(`clans/${clanKey}/members/${sanitiseKey(username)}`).remove().catch(() => {});
}

function fbOnClanLeaderboard(callback) {
  if (!firebaseReady) { callback([]); return; }
  // Leaderboard based on sum of member totalCoins
  db.ref('clans').on('value', async clanSnap => {
    const clans = [];
    const promises = [];
    clanSnap.forEach(c => {
      const data = c.val();
      if (!data || !data.members) return;
      const memberKeys = Object.keys(data.members);
      const p = Promise.all(memberKeys.map(mk =>
        db.ref(`players/${mk}/totalCoins`).once('value').then(s => s.val() || 0)
      )).then(coins => {
        clans.push({ name: data.name, total: coins.reduce((a, b) => a + b, 0), members: memberKeys.length });
      });
      promises.push(p);
    });
    await Promise.all(promises);
    clans.sort((a, b) => b.total - a.total);
    callback(clans.slice(0, 10));
  }, () => callback([]));
}

/* ═══════════════════ GLOBAL EVENTS ═══════════════════ */
function fbPostGlobalEvent(eventData) {
  if (!firebaseReady) return;
  db.ref('globalEvent').set({
    ...eventData,
    startTime: firebase.database.ServerValue.TIMESTAMP,
  }).catch(() => {});
}

function fbOnGlobalEvent(callback) {
  if (!firebaseReady) return;
  db.ref('globalEvent').on('value', snap => {
    if (snap.val()) callback(snap.val());
  }, () => {});
}

