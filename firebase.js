/**
 * COSMIC CLICKER v4 — firebase.js
 * SETUP:
 * 1. Replace firebaseConfig
 * 2. Enable Authentication → Google provider in Firebase Console
 * 3. Rules: { "rules": { ".read": true, ".write": true } }
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

let db = null, auth = null, firebaseReady = false;
try {
  firebase.initializeApp(firebaseConfig);
  db   = firebase.database();
  auth = firebase.auth();
  firebaseReady = true;
  console.log("✅ Firebase v4 connected");
} catch(e) { console.warn("⚠️ Firebase offline:", e.message); }

function sanitiseKey(n) {
  return (n||'').trim().replace(/[.#$\[\]\/\s]/g,'_').slice(0,30) || 'anon';
}

/* ═══════════════ AUTH ═══════════════ */
function fbSignInGoogle() {
  if(!auth) return Promise.reject('No auth');
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
}
function fbSignInAnon() {
  if(!auth) return Promise.reject('No auth');
  return auth.signInAnonymously();
}
function fbSignOut() {
  if(!auth) return;
  auth.signOut();
}
function fbOnAuthChange(cb) {
  if(!auth) { cb(null); return; }
  auth.onAuthStateChanged(cb);
}
function fbGetUID() {
  return auth?.currentUser?.uid || null;
}

/* ═══════════════ PLAYER ═══════════════ */
function fbSavePlayer(uid, data) {
  if(!firebaseReady || !uid) return;
  db.ref(`players/${uid}`).update({
    name: data.name || 'Pilot',
    displayName: data.name || 'Pilot',
    coins: Math.floor(data.coins || 0),
    totalCoins: Math.floor(data.totalCoins || 0),
    coinsPerClick: data.coinsPerClick || 1,
    coinsPerSecond: data.coinsPerSecond || 0,
    upgradeLevels: data.upgradeLevels || {},
    prestigeLevel: data.prestigeLevel || 0,
    achievements: data.achievements || {},
    dailyQuests: data.dailyQuests || {},
    totalClicks: data.totalClicks || 0,
    clanId: data.clanId || null,
    activeSkin: data.activeSkin || 'default',
    unlockedSkins: data.unlockedSkins || {},
    resources: data.resources || {},
    ownedPlanets: data.ownedPlanets || {},
    techResearched: data.techResearched || {},
    equippedArtifacts: data.equippedArtifacts || [],
    forgedArtifacts: data.forgedArtifacts || {},
    seasonPoints: data.seasonPoints || 0,
    seasonRewardClaimed: data.seasonRewardClaimed || {},
    lastSeen: firebase.database.ServerValue.TIMESTAMP,
  }).catch(() => {});
}

function fbLoadPlayer(uid) {
  if(!firebaseReady || !uid) return Promise.resolve(null);
  return db.ref(`players/${uid}`).once('value').then(s => s.val()).catch(() => null);
}

/* ═══════════════ PRESENCE ═══════════════ */
let presenceRef = null, heartbeatInt = null;
function fbSetOnline(uid, username) {
  if(!firebaseReady || !uid) return;
  presenceRef = db.ref(`presence/${uid}`);
  db.ref('.info/connected').on('value', async snap => {
    if(!snap.val()) return;
    try {
      await presenceRef.onDisconnect().remove();
      await presenceRef.set({ name: username, uid, joinedAt: firebase.database.ServerValue.TIMESTAMP });
    } catch(e) { console.warn("Presence:", e.message); }
  });
  clearInterval(heartbeatInt);
  heartbeatInt = setInterval(() => {
    if(presenceRef) presenceRef.set({ name: username, uid, joinedAt: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
  }, 50000);
}
function fbOnOnlineCount(cb) {
  if(!firebaseReady) { cb(1); return; }
  db.ref('presence').on('value', snap => cb(snap.numChildren()), () => cb(0));
}
function fbOnOnlinePlayers(cb) {
  if(!firebaseReady) { cb([]); return; }
  db.ref('presence').on('value', snap => {
    const l = []; snap.forEach(c => { const d = c.val(); if(d?.name) l.push({ key: c.key, name: d.name }); });
    cb(l);
  }, () => cb([]));
}

/* ═══════════════ LEADERBOARD ═══════════════ */
function fbOnLeaderboard(cb) {
  if(!firebaseReady) { cb([]); return; }
  db.ref('players').orderByChild('totalCoins').limitToLast(10).on('value', snap => {
    const e = []; snap.forEach(c => { const d = c.val(); if(d?.name) e.push({ name: d.name, totalCoins: d.totalCoins || 0 }); });
    e.sort((a,b) => b.totalCoins - a.totalCoins); cb(e);
  }, () => cb([]));
}

/* ═══════════════ CHAT ═══════════════ */
function fbSendChat(username, text, uid) {
  if(!firebaseReady || !text.trim()) return;
  db.ref(`chat/${Date.now()}_${sanitiseKey(username)}`).set({
    name: username, text: text.trim().slice(0, 120),
    time: firebase.database.ServerValue.TIMESTAMP, uid: uid || null,
  }).catch(() => {});
}
function fbOnChat(cb) {
  if(!firebaseReady) return;
  db.ref('chat').orderByChild('time').limitToLast(35).on('value', snap => {
    const m = []; snap.forEach(c => { const d = c.val(); if(d) m.push(d); }); cb(m);
  }, () => {});
}
function fbPruneChat() {
  if(!firebaseReady) return;
  db.ref('chat').orderByChild('time').once('value', snap => {
    if(snap.numChildren() > 60) {
      const ks = []; snap.forEach(c => ks.push(c.key));
      ks.slice(0, ks.length - 60).forEach(k => db.ref(`chat/${k}`).remove());
    }
  });
}

/* ═══════════════ NOTIFICATIONS ═══════════════ */
function fbSendGift(fromName, toUID, amount) {
  if(!firebaseReady) return Promise.resolve(false);
  return db.ref(`notifications/${toUID}/${Date.now()}_gift`).set({
    type: 'gift', from: fromName, amount: Math.floor(amount),
    time: firebase.database.ServerValue.TIMESTAMP,
  }).then(() => true).catch(() => false);
}
function fbListenNotifications(uid, cb) {
  if(!firebaseReady || !uid) return;
  db.ref(`notifications/${uid}`).on('child_added', snap => {
    const d = snap.val(); if(d) { cb(d, snap.key); snap.ref.remove(); }
  }, () => {});
}

/* ═══════════════ DUELS ═══════════════ */
function fbChallengeDuel(challengerName, challengedUID, prize) {
  if(!firebaseReady) return null;
  const k = `duel_${Date.now()}`;
  const myUID = fbGetUID();
  db.ref(`duels/${k}`).set({ challenger: challengerName, challengedUID, prize: prize || 500,
    status: 'pending', scores: { [myUID || 'p1']: 0, opp: 0 }, createdAt: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
  db.ref(`notifications/${challengedUID}/duel_${Date.now()}`).set({
    type: 'duel', duelKey: k, from: challengerName, prize: prize || 500,
    time: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
  return k;
}
function fbAcceptDuel(k) { if(firebaseReady) db.ref(`duels/${k}`).update({ status: 'active', startTime: firebase.database.ServerValue.TIMESTAMP }).catch(() => {}); }
function fbUpdateDuelScore(k, uid, score) { if(firebaseReady) db.ref(`duels/${k}/scores/${uid || 'p1'}`).set(score).catch(() => {}); }
function fbListenDuel(k, cb) { if(firebaseReady) db.ref(`duels/${k}`).on('value', snap => { if(snap.val()) cb(snap.val()); }, () => {}); }
function fbFinishDuel(k) {
  if(!firebaseReady) return;
  db.ref(`duels/${k}`).update({ status: 'finished' }).catch(() => {});
  setTimeout(() => db.ref(`duels/${k}`).remove().catch(() => {}), 60000);
}

/* ═══════════════ CLANS ═══════════════ */
function fbCreateClan(name, uid, username) {
  if(!firebaseReady) return Promise.resolve(false);
  const k = sanitiseKey(name);
  return db.ref(`clans/${k}`).once('value').then(snap => {
    if(snap.val()) return false;
    return db.ref(`clans/${k}`).set({
      name, founder: username, members: { [uid]: username },
      bank: 0, buildings: {}, createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => true);
  }).catch(() => false);
}
function fbJoinClan(name, uid, username) {
  if(!firebaseReady) return Promise.resolve(false);
  const k = sanitiseKey(name);
  return db.ref(`clans/${k}`).once('value').then(snap => {
    if(!snap.val()) return false;
    return db.ref(`clans/${k}/members/${uid}`).set(username).then(() => true);
  }).catch(() => false);
}
function fbLeaveClan(name, uid) {
  if(!firebaseReady) return;
  db.ref(`clans/${sanitiseKey(name)}/members/${uid}`).remove().catch(() => {});
}
function fbOnClanLeaderboard(cb) {
  if(!firebaseReady) { cb([]); return; }
  db.ref('clans').on('value', async snap => {
    const clans = [], ps = [];
    snap.forEach(c => {
      const d = c.val(); if(!d?.members) return;
      const mks = Object.keys(d.members);
      ps.push(Promise.all(mks.map(mk => db.ref(`players/${mk}/totalCoins`).once('value').then(s => s.val() || 0)))
        .then(coins => clans.push({ name: d.name, total: coins.reduce((a,b) => a+b, 0), members: mks.length, bank: d.bank||0, buildings: d.buildings||{} })));
    });
    await Promise.all(ps);
    clans.sort((a,b) => b.total - a.total); cb(clans.slice(0, 10));
  }, () => cb([]));
}

/* ═══════════════ CLAN BASE ═══════════════ */
function fbContributeToClan(clanName, uid, amount) {
  if(!firebaseReady) return Promise.resolve(false);
  const k = sanitiseKey(clanName);
  return db.ref(`clans/${k}/bank`).transaction(bank => (bank || 0) + amount)
    .then(() => true).catch(() => false);
}
function fbUpgradeClanBuilding(clanName, buildingId, newLevel, cost) {
  if(!firebaseReady) return Promise.resolve(false);
  const k = sanitiseKey(clanName);
  return db.ref(`clans/${k}`).transaction(clan => {
    if(!clan || (clan.bank || 0) < cost) return clan;
    clan.bank = (clan.bank || 0) - cost;
    clan.buildings = clan.buildings || {};
    clan.buildings[buildingId] = newLevel;
    return clan;
  }).then(res => res.committed).catch(() => false);
}
function fbGetClanData(clanName, cb) {
  if(!firebaseReady) { cb(null); return; }
  db.ref(`clans/${sanitiseKey(clanName)}`).on('value', snap => cb(snap.val()), () => cb(null));
}

/* ═══════════════ RAID ═══════════════ */
function fbInitRaid(hp, bossEmoji, bossName) {
  if(!firebaseReady) return;
  const key = new Date().toISOString().slice(0,10);
  db.ref(`raids/${key}`).once('value').then(snap => {
    if(!snap.val()) {
      db.ref(`raids/${key}`).set({ hp, maxHp: hp, damage: 0, status: 'active',
        contributors: {}, bossEmoji, bossName, startedAt: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
    }
  });
}
function fbOnRaid(cb) {
  if(!firebaseReady) return;
  const key = new Date().toISOString().slice(0,10);
  db.ref(`raids/${key}`).on('value', snap => cb(snap.val()), () => cb(null));
}
function fbDealRaidDamage(uid, amount) {
  if(!firebaseReady) return Promise.resolve(false);
  const key = new Date().toISOString().slice(0,10);
  return db.ref(`raids/${key}`).transaction(raid => {
    if(!raid || raid.status !== 'active') return raid;
    const dmg = Math.min(amount, raid.hp - raid.damage);
    if(dmg <= 0) return raid;
    raid.damage = (raid.damage || 0) + dmg;
    raid.contributors = raid.contributors || {};
    raid.contributors[uid] = (raid.contributors[uid] || 0) + dmg;
    if(raid.damage >= raid.hp) { raid.status = 'defeated'; raid.finishedAt = firebase.database.ServerValue.TIMESTAMP; }
    return raid;
  }).then(r => r.committed).catch(() => false);
}
function fbMarkRaidClaimed(uid) {
  if(!firebaseReady) return;
  const key = new Date().toISOString().slice(0,10);
  db.ref(`raids/${key}/claimed/${uid}`).set(true).catch(() => {});
}

/* ═══════════════ SEASONS ═══════════════ */
function getWeekKey() {
  const d = new Date();
  // Find last Friday
  const day = d.getDay(); // 0=Sun, 5=Fri
  const diff = (day - 5 + 7) % 7;
  const fri = new Date(d); fri.setDate(d.getDate() - diff); fri.setHours(0,0,0,0);
  return fri.toISOString().slice(0,10);
}
function getNextFriday() {
  const d = new Date(); const day = d.getDay();
  const diff = (5 - day + 7) % 7 || 7;
  const next = new Date(d); next.setDate(d.getDate() + diff); next.setHours(0,0,0,0);
  return next.getTime();
}
function fbGetCurrentSeason(cb) {
  if(!firebaseReady) { cb(null); return; }
  db.ref('season/current').on('value', snap => cb(snap.val()), () => cb(null));
}
function fbAddSeasonPoints(uid, points) {
  if(!firebaseReady || !uid) return;
  db.ref(`players/${uid}/seasonPoints`).transaction(p => (p || 0) + points).catch(() => {});
}
function fbMarkSeasonRewardClaimed(uid, weekKey) {
  if(!firebaseReady || !uid) return;
  db.ref(`players/${uid}/seasonRewardClaimed/${weekKey}`).set(true).catch(() => {});
}
function fbGetSeasonLeaderboard(cb) {
  if(!firebaseReady) { cb([]); return; }
  db.ref('players').orderByChild('seasonPoints').limitToLast(10).on('value', snap => {
    const e = []; snap.forEach(c => { const d = c.val(); if(d?.name) e.push({ name: d.name, pts: d.seasonPoints || 0 }); });
    e.sort((a,b) => b.pts - a.pts); cb(e);
  }, () => cb([]));
}

/* ═══════════════ NPC / BROADCAST ═══════════════ */
function fbListenNPCOffer(cb) {
  if(!firebaseReady) return;
  db.ref('npcOffer').on('value', snap => { if(snap.val()?.active) cb(snap.val()); }, () => {});
}
function fbListenBroadcast(cb) {
  if(!firebaseReady) return;
  db.ref('broadcast').orderByChild('time').limitToLast(1).on('child_added', snap => {
    const d = snap.val(); if(d) cb(d.message);
  }, () => {});
}
function fbListenGlobalEvent(cb) {
  if(!firebaseReady) return;
  db.ref('globalEvent').on('value', snap => { if(snap.val()) cb(snap.val()); }, () => {});
}

/* ═══════════════ ANTICHEAT ═══════════════ */
let _clickBucket = 0, _bucketReset = Date.now();
function fbValidateClick() {
  const now = Date.now();
  if(now - _bucketReset > 1000) { _clickBucket = 0; _bucketReset = now; }
  _clickBucket++;
  return _clickBucket <= 18;
}

/* ═══════════════ PUSH ═══════════════ */
async function fbRequestPush() {
  if(!('Notification' in window)) return false;
  return (await Notification.requestPermission()) === 'granted';
}
function fbLocalNotif(title, body) {
  if(Notification.permission === 'granted') new Notification(title, { body, icon: 'icon-192.png' });
}

