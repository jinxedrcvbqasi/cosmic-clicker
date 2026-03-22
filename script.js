/**
 * ══════════════════════════════════════════
 *  COSMIC CLICKER — script.js
 *  Game logic: clicking, upgrades, auto-save,
 *  leaderboard, presence, star canvas
 * ══════════════════════════════════════════
 */

/* ═══════════════════════════════════════════
   UPGRADE DEFINITIONS
═══════════════════════════════════════════ */
const UPGRADES = [
  {
    id: 'drill1',
    name: 'PLASMA DRILL',
    icon: '⚡',
    desc: '+1 per click',
    baseCost: 15,
    costMult: 1.5,
    maxLevel: 999,
    effect: { coinsPerClick: 1 },
  },
  {
    id: 'auto1',
    name: 'ASTEROID MINER',
    icon: '🪐',
    desc: '+0.5/sec auto',
    baseCost: 75,
    costMult: 1.55,
    maxLevel: 999,
    effect: { coinsPerSecond: 0.5 },
  },
  {
    id: 'drill2',
    name: 'QUANTUM AMP',
    icon: '🔮',
    desc: '+5 per click',
    baseCost: 350,
    costMult: 1.65,
    maxLevel: 999,
    effect: { coinsPerClick: 5 },
  },
  {
    id: 'auto2',
    name: 'SPACE STATION',
    icon: '🛸',
    desc: '+4/sec auto',
    baseCost: 900,
    costMult: 1.7,
    maxLevel: 999,
    effect: { coinsPerSecond: 4 },
  },
  {
    id: 'drill3',
    name: 'STAR FORGE',
    icon: '⭐',
    desc: '+25 per click',
    baseCost: 3500,
    costMult: 1.8,
    maxLevel: 999,
    effect: { coinsPerClick: 25 },
  },
  {
    id: 'auto3',
    name: 'NEBULA HARVESTER',
    icon: '🌌',
    desc: '+25/sec auto',
    baseCost: 9000,
    costMult: 1.85,
    maxLevel: 999,
    effect: { coinsPerSecond: 25 },
  },
  {
    id: 'drill4',
    name: 'NEBULA CRYSTAL',
    icon: '💎',
    desc: '+120 per click',
    baseCost: 28000,
    costMult: 1.9,
    maxLevel: 999,
    effect: { coinsPerClick: 120 },
  },
  {
    id: 'auto4',
    name: 'COSMIC ENGINE',
    icon: '🚀',
    desc: '+150/sec auto',
    baseCost: 80000,
    costMult: 2.0,
    maxLevel: 999,
    effect: { coinsPerSecond: 150 },
  },
  {
    id: 'drill5',
    name: 'VOID FIST',
    icon: '🌀',
    desc: '+600 per click',
    baseCost: 300000,
    costMult: 2.1,
    maxLevel: 999,
    effect: { coinsPerClick: 600 },
  },
  {
    id: 'auto5',
    name: 'BLACK HOLE TAP',
    icon: '🕳️',
    desc: '+800/sec auto',
    baseCost: 1000000,
    costMult: 2.2,
    maxLevel: 999,
    effect: { coinsPerSecond: 800 },
  },
];

/* ═══════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════ */
const state = {
  username: '',
  coins: 0,
  totalCoins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgradeLevels: {},   // { upgradeId: level }
};

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9 ).toFixed(2) + 'B';
  if (n >= 1e6)  return (n / 1e6 ).toFixed(2) + 'M';
  if (n >= 1e3)  return (n / 1e3 ).toFixed(1) + 'K';
  return n.toString();
}

function upgradeCost(upg) {
  const lvl = state.upgradeLevels[upg.id] || 0;
  return Math.floor(upg.baseCost * Math.pow(upg.costMult, lvl));
}

function recalcStats() {
  let cpc = 1;
  let cps = 0;
  UPGRADES.forEach(upg => {
    const lvl = state.upgradeLevels[upg.id] || 0;
    if (upg.effect.coinsPerClick) cpc += upg.effect.coinsPerClick * lvl;
    if (upg.effect.coinsPerSecond) cps += upg.effect.coinsPerSecond * lvl;
  });
  state.coinsPerClick = cpc;
  state.coinsPerSecond = cps;
}

/* ═══════════════════════════════════════════
   DOM REFS
═══════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const coinDisplay    = $('coinDisplay');
const perClickDisp   = $('perClickDisplay');
const perSecDisp     = $('perSecDisplay');
const allTimeDisp    = $('allTimeDisplay');
const autoDisp       = $('autoDisplay');
const onlineCount    = $('onlineCount');
const headerUsername = $('headerUsername');
const leaderboard    = $('leaderboard');
const upgradesList   = $('upgradesList');
const mainCoin       = $('mainCoin');
const floatPortal    = $('floatPortal');
const critNote       = $('critNote');
const toast          = $('toast');
const usernameModal  = $('usernameModal');
const gameWrap       = $('gameWrap');

/* ═══════════════════════════════════════════
   DISPLAY UPDATES
═══════════════════════════════════════════ */
function updateHUD() {
  coinDisplay.textContent  = fmt(state.coins);
  perClickDisp.textContent = fmt(state.coinsPerClick);
  perSecDisp.textContent   = fmt(state.coinsPerSecond);
  allTimeDisp.textContent  = fmt(state.totalCoins);
  autoDisp.textContent     = fmt(state.coinsPerSecond);
  updateUpgradeCards();
}

/* ═══════════════════════════════════════════
   UPGRADE CARDS RENDER
═══════════════════════════════════════════ */
function buildUpgradeCards() {
  upgradesList.innerHTML = '';
  UPGRADES.forEach(upg => {
    const card = document.createElement('button');
    card.className = 'upgrade-card';
    card.dataset.id = upg.id;
    card.innerHTML = `
      <div class="upg-icon">${upg.icon}</div>
      <div class="upg-info">
        <div class="upg-name">${upg.name}</div>
        <div class="upg-desc">${upg.desc}</div>
      </div>
      <div class="upg-right">
        <div class="upg-level">LV <span>0</span></div>
        <div class="upg-cost">🪙 0</div>
      </div>
    `;
    card.addEventListener('click', () => buyUpgrade(upg.id));
    upgradesList.appendChild(card);
  });
}

function updateUpgradeCards() {
  UPGRADES.forEach(upg => {
    const card = upgradesList.querySelector(`[data-id="${upg.id}"]`);
    if (!card) return;
    const lvl  = state.upgradeLevels[upg.id] || 0;
    const cost = upgradeCost(upg);
    const canAfford = state.coins >= cost;

    card.querySelector('.upg-level span').textContent = lvl;
    const costEl = card.querySelector('.upg-cost');
    costEl.textContent = `🪙 ${fmt(cost)}`;
    costEl.className = 'upg-cost' + (canAfford ? '' : ' cant-afford');

    card.classList.toggle('affordable', canAfford);
    card.classList.toggle('locked', !canAfford);
  });
}

/* ═══════════════════════════════════════════
   BUYING UPGRADES
═══════════════════════════════════════════ */
function buyUpgrade(id) {
  const upg  = UPGRADES.find(u => u.id === id);
  if (!upg) return;
  const cost = upgradeCost(upg);
  if (state.coins < cost) {
    shakeCard(id);
    return;
  }
  state.coins -= cost;
  state.upgradeLevels[id] = (state.upgradeLevels[id] || 0) + 1;
  recalcStats();
  updateHUD();
  flashCard(id);
  showToast(`${upg.icon} ${upg.name} — Level ${state.upgradeLevels[id]}`);
}

function shakeCard(id) {
  const card = upgradesList.querySelector(`[data-id="${id}"]`);
  if (!card) return;
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'cardShake 0.3s ease';
  setTimeout(() => { card.style.animation = ''; }, 350);
}
// Inject shake keyframes
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes cardShake {
  0%,100% { transform:translateX(0); }
  20%      { transform:translateX(-6px); }
  40%      { transform:translateX(6px); }
  60%      { transform:translateX(-4px); }
  80%      { transform:translateX(4px); }
}`;
document.head.appendChild(shakeStyle);

function flashCard(id) {
  const card = upgradesList.querySelector(`[data-id="${id}"]`);
  if (!card) return;
  card.classList.add('just-bought');
  setTimeout(() => card.classList.remove('just-bought'), 450);
}

/* ═══════════════════════════════════════════
   COIN CLICK
═══════════════════════════════════════════ */
let critChance = 0.07;  // 7% crit chance

function handleCoinClick(e) {
  const isCrit = Math.random() < critChance;
  const earned = isCrit
    ? state.coinsPerClick * (3 + Math.floor(Math.random() * 3))
    : state.coinsPerClick;

  state.coins      += earned;
  state.totalCoins += earned;

  // Visual feedback
  spawnFloat(e, fmt(earned), isCrit ? 'crit' : 'normal');
  if (isCrit) showCrit();

  // Coin click animation
  mainCoin.classList.add('clicking');
  setTimeout(() => mainCoin.classList.remove('clicking'), 100);

  updateHUD();
}

function spawnFloat(e, text, type = 'normal') {
  const portal = floatPortal;
  const rect   = portal.getBoundingClientRect();

  let x, y;
  if (e && e.clientX !== undefined) {
    x = e.clientX - rect.left + (Math.random() - 0.5) * 40;
    y = e.clientY - rect.top  - 10;
  } else {
    // auto-click — spawn randomly around coin
    const coinRect = mainCoin.getBoundingClientRect();
    x = coinRect.left + coinRect.width / 2  - rect.left + (Math.random() - 0.5) * 60;
    y = coinRect.top  + coinRect.height / 2 - rect.top  + (Math.random() - 0.5) * 30;
  }

  const el = document.createElement('div');
  el.className = `float-text ${type}`;
  el.textContent = '+' + text;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  portal.appendChild(el);
  setTimeout(() => el.remove(), 1050);
}

let critTimeout = null;
function showCrit() {
  critNote.style.display = 'block';
  critNote.style.animation = 'none';
  void critNote.offsetWidth;
  critNote.style.animation = 'critPop 0.7s ease-out forwards';
  clearTimeout(critTimeout);
  critTimeout = setTimeout(() => { critNote.style.display = 'none'; }, 750);
}

// Bind click & touch
mainCoin.addEventListener('click', handleCoinClick);
mainCoin.addEventListener('touchend', e => {
  e.preventDefault();
  handleCoinClick(e.changedTouches[0]);
}, { passive: false });

/* ═══════════════════════════════════════════
   AUTO-PRODUCTION TICK
═══════════════════════════════════════════ */
let lastTick = Date.now();
let autoAccum = 0;        // accumulated fractional coins
let autoFloatAccum = 0;   // only show floats once per second

function autoTick() {
  const now  = Date.now();
  const dt   = (now - lastTick) / 1000;
  lastTick   = now;

  if (state.coinsPerSecond > 0) {
    const gain    = state.coinsPerSecond * dt;
    state.coins      += gain;
    state.totalCoins += gain;
    autoAccum += gain;

    // Show float roughly every 1.5 seconds
    autoFloatAccum += dt;
    if (autoFloatAccum >= 1.5 && state.coinsPerSecond >= 1) {
      spawnFloat(null, fmt(state.coinsPerSecond * 1.5), 'auto');
      autoFloatAccum = 0;
    }

    if (autoAccum >= 1) {
      autoAccum = 0;
      updateHUD();
    }
  }

  requestAnimationFrame(autoTick);
}

/* ═══════════════════════════════════════════
   AUTO-SAVE
═══════════════════════════════════════════ */
let saveTimeout = null;
function scheduleSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    fbSavePlayer(state.username, {
      coins:          state.coins,
      totalCoins:     state.totalCoins,
      coinsPerClick:  state.coinsPerClick,
      coinsPerSecond: state.coinsPerSecond,
      upgradeLevels:  state.upgradeLevels,
    });
  }, 5000);
}

// Force save every 30s
setInterval(() => {
  if (state.username) {
    fbSavePlayer(state.username, {
      coins:          state.coins,
      totalCoins:     state.totalCoins,
      coinsPerClick:  state.coinsPerClick,
      coinsPerSecond: state.coinsPerSecond,
      upgradeLevels:  state.upgradeLevels,
    });
  }
}, 30000);

// Schedule save on upgrades (override updateHUD)
const _origUpdateHUD = updateHUD;

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ═══════════════════════════════════════════
   LEADERBOARD RENDER
═══════════════════════════════════════════ */
function renderLeaderboard(entries) {
  leaderboard.innerHTML = '';
  if (!entries || entries.length === 0) {
    leaderboard.innerHTML = '<div class="lb-loading">No pilots yet!</div>';
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  entries.forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row' + (entry.name === state.username ? ' me' : '');
    const rankClass = i < 3 ? ` r${i+1}` : '';
    row.innerHTML = `
      <div class="lb-rank${rankClass}">${medals[i] || (i + 1)}</div>
      <div class="lb-name">${escapeHTML(entry.name)}</div>
      <div class="lb-score">${fmt(entry.totalCoins)}</div>
    `;
    leaderboard.appendChild(row);
  });
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ═══════════════════════════════════════════
   MOBILE TABS
═══════════════════════════════════════════ */
function initMobileTabs() {
  const tabs    = document.querySelectorAll('.mtab');
  const panels  = {
    panelClicker:  document.getElementById('panelClicker'),
    panelUpgrades: document.getElementById('panelUpgrades'),
    panelStats:    document.getElementById('panelStats'),
  };

  function activateTab(panelId) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.panel === panelId));
    Object.entries(panels).forEach(([id, el]) => {
      el.classList.toggle('panel-active', id === panelId);
    });
  }

  // On mobile: show clicker by default
  if (window.innerWidth <= 900) {
    activateTab('panelClicker');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.panel));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      // Remove panel-active so all show via grid
      Object.values(panels).forEach(el => el.classList.remove('panel-active'));
    } else {
      // Re-apply default mobile tab if none active
      const anyActive = Object.values(panels).some(el => el.classList.contains('panel-active'));
      if (!anyActive) activateTab('panelClicker');
    }
  });
}

/* ═══════════════════════════════════════════
   STAR CANVAS
═══════════════════════════════════════════ */
function initStarCanvas() {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');
  let stars    = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    spawnStars();
  }

  function spawnStars() {
    stars = [];
    const count = Math.floor((W * H) / 3500);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    Math.random() * 1.4 + 0.2,
        a:    Math.random(),
        da:   (Math.random() - 0.5) * 0.006,
        vx:   (Math.random() - 0.5) * 0.03,
        vy:   Math.random() * 0.04 + 0.01,
        hue:  Math.random() < 0.15 ? (Math.random() < 0.5 ? 200 : 280) : 0,
        sat:  Math.random() < 0.15 ? 100 : 0,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a  += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      s.x  += s.vx;
      s.y  += s.vy;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;

      const color = s.sat > 0
        ? `hsla(${s.hue}, ${s.sat}%, 80%, ${s.a})`
        : `rgba(200, 220, 255, ${s.a})`;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

/* ═══════════════════════════════════════════
   USERNAME / START
═══════════════════════════════════════════ */
function startGame(username) {
  state.username       = username;
  headerUsername.textContent = username.length > 14 ? username.slice(0, 14) + '…' : username;

  // Show game
  usernameModal.style.display = 'none';
  gameWrap.style.display = 'flex';

  // Build UI
  buildUpgradeCards();
  initMobileTabs();

  // Load saved data
  fbLoadPlayer(username).then(data => {
    if (data) {
      state.coins          = data.coins          || 0;
      state.totalCoins     = data.totalCoins      || 0;
      state.upgradeLevels  = data.upgradeLevels   || {};
      recalcStats();
      showToast('🚀 Welcome back, ' + username + '!');
    } else {
      showToast('🌌 New pilot: ' + username + '!');
    }
    updateHUD();
  });

  // Presence
  fbSetOnline(username);
  fbOnOnlineCount(n => { onlineCount.textContent = n; });

  // Leaderboard listener
  fbOnLeaderboard(renderLeaderboard);

  // Auto-save every 15s
  setInterval(scheduleSave, 15000);

  // Start auto-tick
  lastTick = Date.now();
  requestAnimationFrame(autoTick);
}

/* ── Username modal submit ── */
function handleUsernameSubmit() {
  const val = $('usernameInput').value.trim();
  if (!val || val.length < 2) {
    $('usernameInput').focus();
    $('usernameInput').style.borderColor = '#ff4466';
    $('usernameInput').style.boxShadow = '0 0 20px rgba(255,68,102,0.3)';
    setTimeout(() => {
      $('usernameInput').style.borderColor = '';
      $('usernameInput').style.boxShadow = '';
    }, 1000);
    return;
  }
  localStorage.setItem('cc_username', val);
  startGame(val);
}

$('startBtn').addEventListener('click', handleUsernameSubmit);
$('usernameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleUsernameSubmit();
});

/* ── Auto-login if username in localStorage ── */
window.addEventListener('DOMContentLoaded', () => {
  initStarCanvas();
  const saved = localStorage.getItem('cc_username');
  if (saved) {
    $('usernameInput').value = saved;
  }
});

/* ── Prevent double tap zoom on mobile ── */
document.addEventListener('touchstart', e => {
  if (e.target === mainCoin) e.preventDefault();
}, { passive: false });
