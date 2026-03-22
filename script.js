/**
 * ══════════════════════════════════════════
 *  COSMIC CLICKER v2 — script.js
 *  All game logic: clicks, upgrades, prestige,
 *  achievements, quests, events, sounds,
 *  particles, skins, graph, chat, clans, duels, gifts
 * ══════════════════════════════════════════
 */

/* ═══════════════════════════════════
   UPGRADES
═══════════════════════════════════ */
const UPGRADES = [
  { id:'drill1',  name:'PLASMA DRILL',      icon:'⚡', desc:'+1 per click',    baseCost:15,      costMult:1.5,  effect:{cpc:1} },
  { id:'auto1',   name:'ASTEROID MINER',    icon:'🪐', desc:'+0.5/sec auto',  baseCost:75,      costMult:1.55, effect:{cps:0.5} },
  { id:'drill2',  name:'QUANTUM AMP',       icon:'🔮', desc:'+5 per click',   baseCost:350,     costMult:1.65, effect:{cpc:5} },
  { id:'auto2',   name:'SPACE STATION',     icon:'🛸', desc:'+4/sec auto',    baseCost:900,     costMult:1.70, effect:{cps:4} },
  { id:'drill3',  name:'STAR FORGE',        icon:'⭐', desc:'+25 per click',  baseCost:3500,    costMult:1.80, effect:{cpc:25} },
  { id:'auto3',   name:'NEBULA HARVESTER',  icon:'🌌', desc:'+25/sec auto',   baseCost:9000,    costMult:1.85, effect:{cps:25} },
  { id:'drill4',  name:'NEBULA CRYSTAL',    icon:'💎', desc:'+120 per click', baseCost:28000,   costMult:1.90, effect:{cpc:120} },
  { id:'auto4',   name:'COSMIC ENGINE',     icon:'🚀', desc:'+150/sec auto',  baseCost:80000,   costMult:2.00, effect:{cps:150} },
  { id:'drill5',  name:'VOID FIST',         icon:'🌀', desc:'+600 per click', baseCost:300000,  costMult:2.10, effect:{cpc:600} },
  { id:'auto5',   name:'BLACK HOLE TAP',    icon:'🕳️', desc:'+800/sec auto',  baseCost:1000000, costMult:2.20, effect:{cps:800} },
];

/* ═══════════════════════════════════
   ACHIEVEMENTS
═══════════════════════════════════ */
const ACHIEVEMENTS = [
  { id:'first_click',    icon:'👆', name:'FIRST CONTACT',    desc:'Click for the first time',            check:s => s.totalClicks >= 1 },
  { id:'click100',       icon:'🖱️', name:'CLICK FEVER',      desc:'Click 100 times',                     check:s => s.totalClicks >= 100 },
  { id:'click1000',      icon:'⚡', name:'RAPID FIRE',       desc:'Click 1,000 times',                   check:s => s.totalClicks >= 1000 },
  { id:'click10k',       icon:'🌪️', name:'TAP STORM',        desc:'Click 10,000 times',                  check:s => s.totalClicks >= 10000 },
  { id:'coins100',       icon:'🪙', name:'POCKET CHANGE',    desc:'Earn 100 coins',                      check:s => s.totalCoins >= 100 },
  { id:'coins10k',       icon:'💰', name:'SPACE MERCHANT',   desc:'Earn 10,000 coins',                   check:s => s.totalCoins >= 10000 },
  { id:'coins1m',        icon:'💎', name:'GALACTIC BANKER',  desc:'Earn 1,000,000 coins',                check:s => s.totalCoins >= 1000000 },
  { id:'coins1b',        icon:'🌌', name:'COSMIC TYCOON',    desc:'Earn 1,000,000,000 coins',            check:s => s.totalCoins >= 1e9 },
  { id:'first_upgrade',  icon:'🔧', name:'FIRST UPGRADE',    desc:'Buy your first upgrade',              check:s => Object.values(s.upgradeLevels).some(v=>v>=1) },
  { id:'upgrade10',      icon:'🏗️', name:'TECH TREE',        desc:'Buy 10 total upgrade levels',         check:s => Object.values(s.upgradeLevels).reduce((a,b)=>a+b,0)>=10 },
  { id:'auto10',         icon:'🤖', name:'AUTOMATION',       desc:'Reach 10 coins/sec',                  check:s => s.coinsPerSecond >= 10 },
  { id:'auto1000',       icon:'🏭', name:'SPACE FACTORY',    desc:'Reach 1,000 coins/sec',               check:s => s.coinsPerSecond >= 1000 },
  { id:'prestige1',      icon:'♻️', name:'REBIRTH',          desc:'Prestige for the first time',         check:s => s.prestigeLevel >= 1 },
  { id:'prestige5',      icon:'🌟', name:'PHOENIX',          desc:'Prestige 5 times',                    check:s => s.prestigeLevel >= 5 },
  { id:'won_duel',       icon:'🥇', name:'DUEL CHAMPION',   desc:'Win a duel',                           check:s => s.achievements && s.achievements['won_duel'] },
  { id:'sent_gift',      icon:'🎁', name:'GENEROUS PILOT',  desc:'Send a gift to another player',        check:s => s.achievements && s.achievements['sent_gift'] },
  { id:'joined_clan',    icon:'⚔️', name:'CLAN MEMBER',     desc:'Join or create a clan',                check:s => !!s.clanId },
];

/* ═══════════════════════════════════
   COIN SKINS
═══════════════════════════════════ */
const SKINS = [
  { id:'default', emoji:'🪙', name:'DEFAULT',  cost:0 },
  { id:'gem',     emoji:'💎', name:'DIAMOND',  cost:500 },
  { id:'star',    emoji:'⭐', name:'STAR',     cost:1000 },
  { id:'moon',    emoji:'🌕', name:'MOON',     cost:2000 },
  { id:'crystal', emoji:'🔮', name:'CRYSTAL',  cost:5000 },
  { id:'gold',    emoji:'💰', name:'GOLD BAG', cost:3000 },
  { id:'sun',     emoji:'☀️', name:'SUN',      cost:10000 },
  { id:'vortex',  emoji:'🌀', name:'VORTEX',   cost:15000 },
];

/* ═══════════════════════════════════
   DAILY QUEST TEMPLATES
═══════════════════════════════════ */
function buildDailyQuests(prestigeLevel) {
  const scale = 1 + prestigeLevel * 0.5;
  return [
    { id:'q_clicks', icon:'👆', name:'CLICK WARRIOR',  desc:`Click ${fmt(Math.floor(200*scale))} times`,       target:Math.floor(200*scale),  progress:0, reward:Math.floor(500*scale),  claimed:false },
    { id:'q_coins',  icon:'🪙', name:'COIN COLLECTOR', desc:`Earn ${fmt(Math.floor(1000*scale))} coins`,       target:Math.floor(1000*scale), progress:0, reward:Math.floor(1000*scale), claimed:false },
    { id:'q_upgr',   icon:'🔧', name:'TECH RUSH',      desc:`Buy ${Math.max(1,Math.floor(scale))} upgrade(s)`, target:Math.max(1,Math.floor(scale)), progress:0, reward:Math.floor(2000*scale), claimed:false },
  ];
}

/* ═══════════════════════════════════
   RANDOM EVENTS
═══════════════════════════════════ */
const EVENTS = [
  { id:'meteor',      icon:'☄️', name:'METEOR SHOWER!',    desc:'Instant coin bonus',          duration:0,  apply(s){s.coins += Math.max(500, s.coinsPerSecond*10); return '+'+fmt(Math.max(500,Math.floor(s.coinsPerSecond*10)))+' coins!'; } },
  { id:'click_boost', icon:'⚡', name:'CLICK FRENZY!',     desc:'3× clicks for 30 seconds',    duration:30, apply(s){s.activeBoost={type:'click',mult:3,end:Date.now()+30000}; return '3× click power for 30s!'; } },
  { id:'auto_boost',  icon:'🌀', name:'AUTO SURGE!',       desc:'5× auto for 20 seconds',      duration:20, apply(s){s.activeBoost={type:'auto', mult:5,end:Date.now()+20000}; return '5× auto-mine for 20s!'; } },
  { id:'lucky',       icon:'🎰', name:'LUCKY STRIKE!',     desc:'Random massive click bonus',   duration:0,  apply(s){const m=2+Math.floor(Math.random()*9); s.coins+=s.coinsPerClick*50*m; return `×${m} bonus clicked!`; } },
];

/* ═══════════════════════════════════
   GAME STATE
═══════════════════════════════════ */
const state = {
  username: '',
  coins: 0,
  totalCoins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgradeLevels: {},
  prestigeLevel: 0,
  achievements: {},
  dailyQuests: {},
  totalClicks: 0,
  clanId: null,
  activeSkin: 'default',
  unlockedSkins: { default: true },
  activeBoost: null,
  coinsHistory: [],   // [{t,v}] for graph
  soundEnabled: true,
  eventsLog: [],
  questUpgradesBought: 0,  // track upgrades bought today
  questCoinsEarned: 0,      // track coins earned today
};

/* ═══════════════════════════════════
   HELPERS
═══════════════════════════════════ */
const $ = id => document.getElementById(id);
function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e12) return (n/1e12).toFixed(2)+'T';
  if (n >= 1e9)  return (n/1e9).toFixed(2)+'B';
  if (n >= 1e6)  return (n/1e6).toFixed(2)+'M';
  if (n >= 1e3)  return (n/1e3).toFixed(1)+'K';
  return n.toString();
}
function escHTML(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function getTodayKey(){ return new Date().toISOString().slice(0,10); }

function upgradeCost(upg) {
  const lvl = state.upgradeLevels[upg.id] || 0;
  return Math.floor(upg.baseCost * Math.pow(upg.costMult, lvl));
}
function prestigeMult() {
  return state.prestigeLevel === 0 ? 1 : (1 + state.prestigeLevel * 0.5);
}
function recalcStats() {
  let cpc = 1, cps = 0;
  UPGRADES.forEach(u => {
    const lvl = state.upgradeLevels[u.id] || 0;
    if (u.effect.cpc) cpc += u.effect.cpc * lvl;
    if (u.effect.cps) cps += u.effect.cps * lvl;
  });
  const pm = prestigeMult();
  state.coinsPerClick = cpc * pm;
  state.coinsPerSecond = cps * pm;
}

/* ═══════════════════════════════════
   SOUND (Web Audio API)
═══════════════════════════════════ */
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function playTone(freq, type, duration, vol=0.15, delayMs=0) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    const t = ctx.currentTime + delayMs/1000;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t+0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t+duration);
    osc.start(t); osc.stop(t+duration+0.05);
  } catch(e){}
}
const sounds = {
  click()  { playTone(600,'sine',0.06,0.12); },
  crit()   { playTone(900,'sine',0.1,0.2); playTone(1200,'sine',0.08,0.15,80); },
  buy()    { playTone(440,'triangle',0.08,0.15); playTone(660,'triangle',0.08,0.15,100); },
  achiev() {
    [[523,'sine'],[659,'sine'],[784,'sine'],[1047,'sine']].forEach(([f,t],i)=>playTone(f,t,0.2,0.2,i*100));
  },
  prestige() {
    for(let i=0;i<8;i++) playTone(200+i*80,'sawtooth',0.15,0.1,i*60);
  },
  event()  { playTone(440,'square',0.1,0.15); playTone(550,'square',0.1,0.12,120); },
  gift()   { playTone(880,'sine',0.12,0.18); playTone(1100,'sine',0.1,0.15,150); },
  chat()   { playTone(700,'sine',0.06,0.08); },
};

/* ═══════════════════════════════════
   PARTICLE EXPLOSION
═══════════════════════════════════ */
const pCanvas = $('particleCanvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];

function setupParticleCanvas() {
  pCanvas.width = 200; pCanvas.height = 200;
}

function spawnExplosion(cx, cy, isCrit) {
  const count = isCrit ? 22 : 12;
  const colors = isCrit
    ? ['#ffd700','#ff8c00','#ffaa00','#ffffff','#ff6600']
    : ['#ffd700','#ffcc44','#ffe080','#fff8a0'];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI*2/count)*i + (Math.random()-.5)*.4;
    const speed = (isCrit ? 2.5 : 1.4) + Math.random()*2;
    particles.push({
      x: cx*2, y: cy*2,
      vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - (isCrit?1:0),
      r: (isCrit ? 4 : 2.5)+Math.random()*2,
      life:1, decay:.025+Math.random()*.015,
      color: colors[Math.floor(Math.random()*colors.length)],
    });
  }
}

function tickParticles() {
  pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
  particles = particles.filter(p=>p.life>0);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy; p.vy+=.12;
    p.life-=p.decay; p.r*=.97;
    pCtx.globalAlpha = p.life;
    pCtx.beginPath();
    pCtx.arc(p.x,p.y,Math.max(.1,p.r),0,Math.PI*2);
    pCtx.fillStyle = p.color;
    pCtx.fill();
  });
  pCtx.globalAlpha=1;
  requestAnimationFrame(tickParticles);
}

/* ═══════════════════════════════════
   DOM REFS
═══════════════════════════════════ */
const mainCoin       = $('mainCoin');
const coinFace       = $('coinFace');
const floatPortal    = $('floatPortal');
const boostPill      = $('boostPill');
const prestigeWrap   = $('prestigeWrap');
const eventBanner    = $('eventBanner');

/* ═══════════════════════════════════
   HUD UPDATES
═══════════════════════════════════ */
function updateHUD() {
  const c = state.coins, tc = state.totalCoins;
  $('coinDisplay').textContent    = fmt(c);
  $('coinDisplayM').textContent   = fmt(c);
  $('perClickDisplay').textContent= fmt(effectiveCPC());
  $('perClickM').textContent      = fmt(effectiveCPC());
  $('perSecDisplay').textContent  = fmt(effectiveCPS());
  $('perSecM').textContent        = fmt(effectiveCPS());
  $('allTimeDisplay').textContent = fmt(tc);
  $('autoDisplay').textContent    = fmt(effectiveCPS());

  // Prestige button visible at 1M total coins
  const canPrestige = tc >= 1000000 || state.totalCoins >= 1000000;
  prestigeWrap.style.display = canPrestige ? 'block' : 'none';
  $('prestigeMultShow').textContent = (1 + (state.prestigeLevel+1)*0.5).toFixed(1);

  updateUpgradeCards('upgradesListDesktop');
  updateUpgradeCards('upgradesListMobile');
}

function effectiveCPC() {
  if (state.activeBoost && state.activeBoost.type === 'click' && state.activeBoost.end > Date.now())
    return state.coinsPerClick * state.activeBoost.mult;
  return state.coinsPerClick;
}
function effectiveCPS() {
  if (state.activeBoost && state.activeBoost.type === 'auto' && state.activeBoost.end > Date.now())
    return state.coinsPerSecond * state.activeBoost.mult;
  return state.coinsPerSecond;
}

/* ═══════════════════════════════════
   UPGRADE CARDS
═══════════════════════════════════ */
function buildUpgradeCards(containerId) {
  const el = $(containerId);
  if (!el) return;
  el.innerHTML = '';
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
      </div>`;
    card.addEventListener('click', () => buyUpgrade(upg.id));
    el.appendChild(card);
  });
}
function updateUpgradeCards(containerId) {
  const el = $(containerId);
  if (!el) return;
  UPGRADES.forEach(upg => {
    const card = el.querySelector(`[data-id="${upg.id}"]`);
    if (!card) return;
    const lvl = state.upgradeLevels[upg.id] || 0;
    const cost = upgradeCost(upg);
    const can = state.coins >= cost;
    card.querySelector('.upg-level span').textContent = lvl;
    const costEl = card.querySelector('.upg-cost');
    costEl.textContent = `🪙 ${fmt(cost)}`;
    costEl.className = 'upg-cost' + (can ? '' : ' cant-afford');
    card.classList.toggle('affordable', can);
    card.classList.toggle('locked', !can);
  });
}
function buyUpgrade(id) {
  const upg = UPGRADES.find(u=>u.id===id);
  if (!upg) return;
  const cost = upgradeCost(upg);
  if (state.coins < cost) { shakeCard(id); return; }
  state.coins -= cost;
  state.upgradeLevels[id] = (state.upgradeLevels[id]||0)+1;
  state.questUpgradesBought++;
  recalcStats();
  updateHUD();
  flashCard(id);
  sounds.buy();
  showToast(`${upg.icon} ${upg.name} — Lv ${state.upgradeLevels[id]}`);
  checkAchievements();
  checkQuestProgress();
  scheduleSave();
}
function shakeCard(id) {
  ['upgradesListDesktop','upgradesListMobile'].forEach(cid => {
    const card = $(cid)?.querySelector(`[data-id="${id}"]`);
    if (!card) return;
    card.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:300});
  });
}
function flashCard(id) {
  ['upgradesListDesktop','upgradesListMobile'].forEach(cid => {
    const card = $(cid)?.querySelector(`[data-id="${id}"]`);
    if (card) { card.classList.add('just-bought'); setTimeout(()=>card.classList.remove('just-bought'),450); }
  });
}

/* ═══════════════════════════════════
   CLICKING
═══════════════════════════════════ */
const CRIT_CHANCE = 0.08;

function handleCoinClick(clientX, clientY) {
  const isCrit = Math.random() < CRIT_CHANCE;
  const earned = isCrit
    ? effectiveCPC() * (3 + Math.floor(Math.random()*3))
    : effectiveCPC();

  state.coins      += earned;
  state.totalCoins += earned;
  state.totalClicks++;
  state.questCoinsEarned += earned;

  // Particle explosion
  const rect = mainCoin.getBoundingClientRect();
  const lx = clientX - rect.left;
  const ly = clientY - rect.top;
  spawnExplosion(lx, ly, isCrit);

  // Float text
  spawnFloat(clientX, clientY, fmt(earned), isCrit?'crit':'normal');
  if (isCrit) sounds.crit(); else sounds.click();

  mainCoin.classList.add('clicking');
  setTimeout(()=>mainCoin.classList.remove('clicking'), 100);

  updateHUD();
  checkAchievements();
  checkQuestProgress();
}

mainCoin.addEventListener('click', e => handleCoinClick(e.clientX, e.clientY));
mainCoin.addEventListener('touchend', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  handleCoinClick(t.clientX, t.clientY);
}, {passive:false});

/* Float texts */
function spawnFloat(cx, cy, text, type='normal') {
  const portal = floatPortal;
  const rect = portal.getBoundingClientRect();
  const x = cx - rect.left + (Math.random()-.5)*40;
  const y = cy - rect.top  - 10;
  const el = document.createElement('div');
  el.className = `float-text ${type}`;
  el.textContent = '+'+text;
  el.style.left = x+'px';
  el.style.top  = y+'px';
  portal.appendChild(el);
  setTimeout(()=>el.remove(), 1050);
}
function spawnAutoFloat(coins) {
  const rect = mainCoin.getBoundingClientRect();
  const prect = floatPortal.getBoundingClientRect();
  const x = rect.left + rect.width/2  - prect.left + (Math.random()-.5)*60;
  const y = rect.top  + rect.height/2 - prect.top  + (Math.random()-.5)*30;
  spawnFloat(x + prect.left, y + prect.top, fmt(coins), 'auto');
}

/* ═══════════════════════════════════
   AUTO-TICK
═══════════════════════════════════ */
let lastTick = Date.now();
let autoFloatTimer = 0;

function autoTick() {
  const now = Date.now();
  const dt  = Math.min((now - lastTick)/1000, 0.1);
  lastTick = now;

  // Check boost expiry
  if (state.activeBoost && state.activeBoost.end <= now) {
    state.activeBoost = null;
    boostPill.style.display = 'none';
    updateHUD();
  }

  const cps = effectiveCPS();
  if (cps > 0) {
    const gain = cps * dt;
    state.coins      += gain;
    state.totalCoins += gain;
    state.questCoinsEarned += gain;

    autoFloatTimer += dt;
    if (autoFloatTimer >= 2 && cps >= 1) {
      spawnAutoFloat(cps * 2);
      autoFloatTimer = 0;
    }
    updateHUD();
  }

  // Periodic full HUD refresh (every 2s)
  requestAnimationFrame(autoTick);
}

/* ═══════════════════════════════════
   PRESTIGE
═══════════════════════════════════ */
$('prestigeBtn').addEventListener('click', () => {
  $('curPrestigeLvl').textContent = state.prestigeLevel;
  $('newPrestigeMult').textContent = '×' + (1 + (state.prestigeLevel+1)*0.5).toFixed(1);
  $('prestigeModal').classList.remove('hidden');
});
$('prestigeClose').addEventListener('click',   ()=>$('prestigeModal').classList.add('hidden'));
$('confirmPrestigeBtn').addEventListener('click', doPrestige);

function doPrestige() {
  state.prestigeLevel++;
  state.coins       = 0;
  state.upgradeLevels = {};
  state.questUpgradesBought = 0;
  recalcStats();
  $('prestigeModal').classList.add('hidden');
  $('prestigeBadge').style.display = 'inline-flex';
  $('prestigeLevel').textContent = state.prestigeLevel;
  sounds.prestige();
  showToast(`♻️ Prestige ${state.prestigeLevel}! ×${prestigeMult().toFixed(1)} bonus`);
  updateHUD();
  checkAchievements();
  scheduleSave();
}

/* ═══════════════════════════════════
   ACHIEVEMENTS
═══════════════════════════════════ */
function checkAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    if (state.achievements[ach.id]) return;
    try {
      if (ach.check(state)) {
        state.achievements[ach.id] = true;
        showAchievementPopup(ach);
        sounds.achiev();
        renderAchievements();
        scheduleSave();
      }
    } catch(e){}
  });
}

function showAchievementPopup(ach) {
  const popup = $('achPopup');
  $('achPopIcon').textContent = ach.icon;
  $('achPopName').textContent = ach.name;
  popup.style.display='flex';
  popup.classList.add('show');
  clearTimeout(popup._timer);
  popup._timer = setTimeout(()=>{ popup.classList.remove('show'); setTimeout(()=>popup.style.display='none',350); }, 3000);
}

function renderAchievements() {
  const el = $('achievementsList');
  if (!el) return;
  el.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const unlocked = !!state.achievements[ach.id];
    const div = document.createElement('div');
    div.className = 'ach-card ' + (unlocked?'unlocked':'locked');
    div.innerHTML = `
      <div class="ach-icon">${ach.icon}</div>
      <div class="ach-info">
        <div class="ach-name">${ach.name}</div>
        <div class="ach-desc">${ach.desc}</div>
      </div>
      <div class="ach-check">${unlocked?'✅':'🔒'}</div>`;
    el.appendChild(div);
  });
}

/* ═══════════════════════════════════
   DAILY QUESTS
═══════════════════════════════════ */
function initDailyQuests() {
  const today = getTodayKey();
  if (!state.dailyQuests || state.dailyQuests.date !== today) {
    state.dailyQuests = { date: today, quests: buildDailyQuests(state.prestigeLevel) };
    state.questUpgradesBought = 0;
    state.questCoinsEarned = 0;
  }
  renderQuests();
}

function checkQuestProgress() {
  if (!state.dailyQuests || !state.dailyQuests.quests) return;
  let changed = false;
  state.dailyQuests.quests.forEach(q => {
    if (q.claimed) return;
    if (q.id==='q_clicks')  q.progress = Math.min(q.target, state.totalClicks % (q.target+1) || state.totalClicks);
    if (q.id==='q_coins')   { q.progress = Math.min(q.target, Math.floor(state.questCoinsEarned)); }
    if (q.id==='q_upgr')    { q.progress = Math.min(q.target, state.questUpgradesBought); }
    changed = true;
  });
  if (changed) renderQuests();
}

// Fix click tracking for quests
let questClickStart = 0;
function trackQuestClick() {
  if (!state.dailyQuests || !state.dailyQuests.quests) return;
  const q = state.dailyQuests.quests.find(x=>x.id==='q_clicks');
  if (q && !q.claimed) { q.progress = Math.min(q.target, (q.progress||0)+1); renderQuests(); }
}

function renderQuests() {
  const el = $('questsList');
  if (!el || !state.dailyQuests || !state.dailyQuests.quests) return;
  el.innerHTML = '';
  state.dailyQuests.quests.forEach((q, i) => {
    const pct = Math.min(100, (q.progress/q.target)*100);
    const done = q.progress >= q.target;
    const div = document.createElement('div');
    div.className = 'quest-card' + (done?' completed':'');
    div.innerHTML = `
      <div class="quest-header">
        <span class="quest-name">${q.icon} ${q.name}</span>
        <span class="quest-reward">+${fmt(q.reward)} 🪙</span>
      </div>
      <div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pct}%"></div></div>
      <div class="quest-footer">
        <span class="quest-count">${fmt(q.progress)} / ${fmt(q.target)}</span>
        ${done && !q.claimed
          ? `<button class="quest-claim-btn" data-qi="${i}">CLAIM</button>`
          : q.claimed
          ? '<span class="quest-claimed">✅ CLAIMED</span>'
          : ''
        }
      </div>`;
    el.appendChild(div);
  });
  el.querySelectorAll('.quest-claim-btn').forEach(btn => {
    btn.addEventListener('click', () => claimQuest(+btn.dataset.qi));
  });
}

function claimQuest(i) {
  const q = state.dailyQuests.quests[i];
  if (!q || q.claimed || q.progress < q.target) return;
  q.claimed = true;
  state.coins += q.reward;
  state.totalCoins += q.reward;
  renderQuests();
  updateHUD();
  sounds.achiev();
  showToast(`🎉 Quest complete! +${fmt(q.reward)} coins`);
  scheduleSave();
}

/* ═══════════════════════════════════
   RANDOM EVENTS
═══════════════════════════════════ */
let eventActive = false;
let eventBarInterval = null;

function scheduleNextEvent() {
  const delay = (6 + Math.random()*8) * 60 * 1000; // 6–14 minutes
  setTimeout(triggerEvent, delay);
}

function triggerEvent() {
  if (eventActive) { scheduleNextEvent(); return; }
  const ev = EVENTS[Math.floor(Math.random()*EVENTS.length)];
  const msg = ev.apply(state);
  eventActive = true;

  // Show banner
  $('eventIcon').textContent = ev.icon;
  $('eventText').textContent = ev.name + ' ' + msg;
  eventBanner.style.display = 'flex';
  sounds.event();
  showToast(`${ev.icon} ${ev.name} — ${msg}`);

  // Log
  addEventLog(ev.icon, ev.name, msg);

  if (ev.duration > 0) {
    // Update boost pill
    boostPill.style.display = 'flex';
    boostPill.textContent = `${ev.icon} BOOSTED`;

    let remaining = ev.duration;
    $('eventBar').style.width = '100%';
    $('eventTime').textContent = remaining+'s';

    clearInterval(eventBarInterval);
    eventBarInterval = setInterval(()=>{
      remaining--;
      const pct = (remaining/ev.duration)*100;
      $('eventBar').style.width = pct+'%';
      $('eventTime').textContent = remaining+'s';
      if (remaining<=0) {
        clearInterval(eventBarInterval);
        endEvent();
      }
    }, 1000);
  } else {
    updateHUD();
    setTimeout(endEvent, 3000);
  }

  scheduleNextEvent();
}

function endEvent() {
  eventActive = false;
  eventBanner.style.display = 'none';
  boostPill.style.display = 'none';
  state.activeBoost = null;
  updateHUD();
}

function addEventLog(icon, name, msg) {
  state.eventsLog.unshift({icon,name,msg,time:new Date().toLocaleTimeString()});
  if (state.eventsLog.length > 10) state.eventsLog.pop();
  renderEventsLog();
}

function renderEventsLog() {
  const el = $('eventsLog');
  if (!el) return;
  if (state.eventsLog.length === 0) { el.innerHTML='<p class="empty-note">No events yet…</p>'; return; }
  el.innerHTML = state.eventsLog.map(e =>
    `<div class="event-log-item">${e.icon} <strong>${e.name}</strong> &mdash; ${escHTML(e.msg)} <span style="margin-left:auto;font-size:10px;color:var(--text-sub)">${e.time}</span></div>`
  ).join('');
}

/* ═══════════════════════════════════
   COIN SKINS
═══════════════════════════════════ */
$('skinBtn').addEventListener('click', ()=>{ buildSkinsGrid(); $('skinModal').classList.remove('hidden'); });
$('skinClose').addEventListener('click', ()=>$('skinModal').classList.add('hidden'));

function buildSkinsGrid() {
  const grid = $('skinsGrid');
  grid.innerHTML = '';
  SKINS.forEach(skin => {
    const unlocked = !!state.unlockedSkins[skin.id];
    const selected = state.activeSkin === skin.id;
    const div = document.createElement('div');
    div.className = 'skin-option' + (selected?' selected':'') + (!unlocked?' locked-skin':'');
    div.innerHTML = `
      <div class="skin-emoji">${skin.emoji}</div>
      <div class="skin-name">${skin.name}</div>
      <div class="skin-cost">${unlocked ? (selected?'✅ ON':'FREE') : '🪙'+fmt(skin.cost)}</div>`;
    div.addEventListener('click', ()=>selectSkin(skin));
    grid.appendChild(div);
  });
}

function selectSkin(skin) {
  if (state.unlockedSkins[skin.id]) {
    state.activeSkin = skin.id;
    coinFace.textContent = skin.emoji;
    buildSkinsGrid();
    scheduleSave();
    sounds.buy();
  } else if (state.coins >= skin.cost) {
    state.coins -= skin.cost;
    state.unlockedSkins[skin.id] = true;
    state.activeSkin = skin.id;
    coinFace.textContent = skin.emoji;
    buildSkinsGrid();
    updateHUD();
    scheduleSave();
    showToast(`🎨 ${skin.name} skin unlocked!`);
    sounds.buy();
  } else {
    showToast(`Need ${fmt(skin.cost)} coins to unlock`);
  }
}

/* ═══════════════════════════════════
   STATS GRAPH
═══════════════════════════════════ */
const gCanvas = $('statsGraph');
const gCtx = gCanvas.getContext('2d');
let lastGraphCoins = 0;
let graphInterval = null;

function initGraph() {
  resizeGraph();
  window.addEventListener('resize', resizeGraph);
  graphInterval = setInterval(recordGraphPoint, 30000);
}

function resizeGraph() {
  const wrap = gCanvas.parentElement;
  gCanvas.width  = wrap.clientWidth * window.devicePixelRatio;
  gCanvas.height = 140 * window.devicePixelRatio;
  gCanvas.style.width  = wrap.clientWidth + 'px';
  gCanvas.style.height = '140px';
  drawGraph();
}

function recordGraphPoint() {
  const earned = state.totalCoins - lastGraphCoins;
  lastGraphCoins = state.totalCoins;
  state.coinsHistory.push({ t: Date.now(), v: Math.max(0, earned) });
  if (state.coinsHistory.length > 20) state.coinsHistory.shift();
  if ($('panelStats').classList.contains('active')) drawGraph();
}

function drawGraph() {
  const W = gCanvas.width, H = gCanvas.height;
  const dpr = window.devicePixelRatio || 1;
  gCtx.clearRect(0, 0, W, H);

  const data = state.coinsHistory;
  if (data.length < 2) {
    gCtx.fillStyle = 'rgba(220,232,255,0.3)';
    gCtx.font = `${12*dpr}px Orbitron`;
    gCtx.textAlign = 'center';
    gCtx.fillText('Collecting data...', W/2, H/2);
    return;
  }

  const maxV = Math.max(1, ...data.map(d=>d.v));
  const bars = data.length;
  const barW = (W - (bars+1)*2*dpr) / bars;
  const padB = 24*dpr, padT = 12*dpr;
  const chartH = H - padB - padT;

  // Gridlines
  gCtx.strokeStyle = 'rgba(0,212,255,0.1)';
  gCtx.lineWidth = dpr;
  for (let i=0;i<=4;i++) {
    const y = padT + (chartH/4)*i;
    gCtx.beginPath(); gCtx.moveTo(0,y); gCtx.lineTo(W,y); gCtx.stroke();
  }

  // Bars
  data.forEach((d,i)=>{
    const h = (d.v/maxV)*chartH;
    const x = 2*dpr + i*(barW+2*dpr);
    const y = padT + chartH - h;
    const grad = gCtx.createLinearGradient(0,y,0,y+h);
    grad.addColorStop(0,'rgba(0,212,255,0.85)');
    grad.addColorStop(1,'rgba(180,0,255,0.5)');
    gCtx.fillStyle = grad;
    gCtx.beginPath();
    gCtx.roundRect(x, y, barW, h, [3*dpr,3*dpr,0,0]);
    gCtx.fill();
  });

  // X labels
  gCtx.fillStyle = 'rgba(220,232,255,0.45)';
  gCtx.font = `${8*dpr}px Orbitron`;
  gCtx.textAlign = 'center';
  [0, Math.floor(bars/2), bars-1].forEach(i=>{
    if (!data[i]) return;
    const x = 2*dpr + i*(barW+2*dpr) + barW/2;
    gCtx.fillText('-'+((bars-1-i)*0.5).toFixed(1)+'m', x, H-6*dpr);
  });
}

function renderDetailedStats() {
  const el = $('detailedStats');
  if (!el) return;
  const rows = [
    ['PRESTIGE LEVEL',  state.prestigeLevel],
    ['TOTAL CLICKS',    fmt(state.totalClicks)],
    ['BONUS MULT',      '×' + prestigeMult().toFixed(1)],
    ['UPGRADES OWNED',  Object.values(state.upgradeLevels).reduce((a,b)=>a+b,0)],
    ['ACHIEVEMENTS',    `${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}`],
    ['CLAN',            state.clanId || 'None'],
    ['ACTIVE SKIN',     SKINS.find(s=>s.id===state.activeSkin)?.emoji + ' ' + (SKINS.find(s=>s.id===state.activeSkin)?.name||'—')],
  ];
  el.innerHTML = rows.map(([k,v])=>`
    <div class="detail-row">
      <span class="detail-key">${k}</span>
      <span class="detail-val">${escHTML(String(v))}</span>
    </div>`).join('');
}

/* ═══════════════════════════════════
   CHAT
═══════════════════════════════════ */
let lastChatTime = 0;

$('chatSendBtn').addEventListener('click', sendChat);
$('chatInput').addEventListener('keydown', e => { if (e.key==='Enter') sendChat(); });

function sendChat() {
  const input = $('chatInput');
  const text = input.value.trim();
  if (!text) return;
  const now = Date.now();
  if (now - lastChatTime < 2500) { showToast('Slow down…'); return; }
  lastChatTime = now;
  fbSendChat(state.username, text);
  input.value = '';
  sounds.chat();
}

function renderChat(msgs) {
  const box = $('chatMessages');
  if (!box) return;
  if (!msgs || msgs.length === 0) { box.innerHTML='<div class="chat-empty">No messages yet…</div>'; return; }
  const atBottom = box.scrollHeight - box.scrollTop <= box.clientHeight + 40;
  box.innerHTML = msgs.map(m => `
    <div class="chat-msg ${m.name===state.username?'mine':''}">
      <div class="chat-name ${m.name===state.username?'me':''}">${escHTML(m.name)}</div>
      <div class="chat-text">${escHTML(m.text)}</div>
    </div>`).join('');
  if (atBottom) box.scrollTop = box.scrollHeight;
}

/* Notification dot for new chat messages */
let chatVisible = false;
let unreadChat = 0;

function onNewChatMsg() {
  if (!chatVisible) {
    unreadChat++;
    $('socialNotifDot').style.display = 'block';
  }
}

/* ═══════════════════════════════════
   ONLINE PLAYERS
═══════════════════════════════════ */
function renderOnlinePlayers(list) {
  const el = $('onlinePlayers');
  if (!el) return;
  const others = list.filter(p=>p.name!==state.username);
  if (others.length===0) { el.innerHTML='<div class="lb-loading">No other pilots online</div>'; return; }
  el.innerHTML = others.map(p=>`
    <div class="pilot-row">
      <span class="pilot-row-name">👨‍🚀 ${escHTML(p.name)}</span>
      <div class="pilot-row-btns">
        <button class="pilot-action-btn duel" data-key="${escHTML(p.key)}" data-name="${escHTML(p.name)}">⚔️ Duel</button>
        <button class="pilot-action-btn" data-gift-key="${escHTML(p.key)}" data-gift-name="${escHTML(p.name)}">🎁 Gift</button>
      </div>
    </div>`).join('');
  el.querySelectorAll('.pilot-action-btn.duel').forEach(btn=>{
    btn.addEventListener('click',()=>startDuel(btn.dataset.key, btn.dataset.name));
  });
  el.querySelectorAll('[data-gift-key]').forEach(btn=>{
    btn.addEventListener('click',()=>openGiftModal(btn.dataset.giftKey, btn.dataset.giftName));
  });
}

/* ═══════════════════════════════════
   LEADERBOARD
═══════════════════════════════════ */
function renderLeaderboard(entries, elId='leaderboard') {
  const el = $(elId);
  if (!el) return;
  if (!entries || entries.length===0) { el.innerHTML='<div class="lb-loading">No pilots yet!</div>'; return; }
  const medals=['🥇','🥈','🥉'];
  el.innerHTML = entries.map((e,i)=>`
    <div class="lb-row ${e.name===state.username?'me':''}">
      <div class="lb-rank ${i<3?'r'+(i+1):''}">${medals[i]||i+1}</div>
      <div class="lb-name">${escHTML(e.name)}</div>
      <div class="lb-score">${fmt(e.totalCoins)}</div>
    </div>`).join('');
}

/* ═══════════════════════════════════
   CLANS
═══════════════════════════════════ */
$('createClanBtn').addEventListener('click', async () => {
  const name = $('clanCreateInput').value.trim();
  if (!name || name.length<2) { showToast('Enter a clan name (2+ chars)'); return; }
  if (state.coins < 500) { showToast('Need 500 coins to create a clan'); return; }
  const ok = await fbCreateClan(name, state.username);
  if (ok) {
    state.coins -= 500;
    state.clanId = name;
    updateClanUI();
    updateHUD();
    scheduleSave();
    showToast('⚔️ Clan "'+name+'" created!');
    checkAchievements();
  } else {
    showToast('Clan name already taken!');
  }
});

$('joinClanBtn').addEventListener('click', async () => {
  const name = $('clanJoinInput').value.trim();
  if (!name) { showToast('Enter clan name'); return; }
  const ok = await fbJoinClan(name, state.username);
  if (ok) {
    state.clanId = name;
    updateClanUI();
    scheduleSave();
    showToast('⚔️ Joined clan "'+name+'"!');
    checkAchievements();
  } else {
    showToast('Clan "'+name+'" not found');
  }
});

$('leaveClanBtn').addEventListener('click', () => {
  if (!state.clanId) return;
  fbLeaveClan(state.clanId, state.username);
  state.clanId = null;
  updateClanUI();
  scheduleSave();
  showToast('Left clan');
});

function updateClanUI() {
  if (state.clanId) {
    $('clanInClan').style.display = 'block';
    $('clanNoClan').style.display = 'none';
    $('clanNameDisplay').textContent = '⚔️ ' + state.clanId;
  } else {
    $('clanInClan').style.display = 'none';
    $('clanNoClan').style.display = 'block';
  }
}

function renderClanLeaderboard(clans) {
  const el = $('clanLeaderboard');
  if (!el) return;
  if (!clans || clans.length===0) { el.innerHTML='<div class="lb-loading">No clans yet</div>'; return; }
  el.innerHTML = clans.map((c,i)=>`
    <div class="lb-row ${c.name===state.clanId?'me':''}">
      <div class="lb-rank ${i<3?'r'+(i+1):''}">${['🥇','🥈','🥉'][i]||i+1}</div>
      <div class="lb-name">⚔️ ${escHTML(c.name)} <span style="font-size:10px;color:var(--text-sub)">(${c.members})</span></div>
      <div class="lb-score">${fmt(c.total)}</div>
    </div>`).join('');
}

/* ═══════════════════════════════════
   DUELS
═══════════════════════════════════ */
let activeDuelKey = null;
let duelMyScore = 0;
let duelOppKey = '';
let duelTimer = null;

$('acceptDuelBtn').addEventListener('click',  ()=>acceptDuel());
$('declineDuelBtn').addEventListener('click', ()=>$('duelModal').classList.add('hidden'));

function startDuel(targetKey, targetName) {
  const prize = Math.max(100, Math.floor(state.coins * 0.05));
  const key = fbChallengeDuel(state.username, targetKey, prize);
  if (!key) { showToast('Firebase not connected'); return; }
  activeDuelKey = key;
  duelOppKey = targetKey;
  showToast(`⚔️ Challenge sent to ${targetName}!`);
  // Listen for result
  fbListenDuel(key, handleDuelUpdate);
}

function acceptDuel() {
  if (!activeDuelKey) return;
  fbAcceptDuel(activeDuelKey);
  $('duelModal').classList.add('hidden');
  startDuelUI();
}

function handleDuelUpdate(data) {
  if (!data) return;
  if (data.status === 'active' && !$('duelActiveModal').classList.contains('hidden')===false) {
    startDuelUI();
  }
  // Update opp score
  if (data.scores) {
    const myKey = sanitiseKey(state.username);
    const oppScore = Object.entries(data.scores).filter(([k])=>k!==myKey).map(([,v])=>v)[0] || 0;
    $('duelOppScore').textContent = oppScore;
  }
  if (data.status === 'finished') endDuel(data);
}

function startDuelUI() {
  duelMyScore = 0;
  $('duelMyName').textContent  = state.username;
  $('duelMyScore').textContent = '0';
  $('duelOppScore').textContent= '0';
  $('duelActiveModal').classList.remove('hidden');

  let sec = 30;
  $('duelCountdown').textContent = sec;
  clearInterval(duelTimer);
  duelTimer = setInterval(()=>{
    sec--;
    $('duelCountdown').textContent = sec;
    if (sec <= 0) {
      clearInterval(duelTimer);
      fbFinishDuel(activeDuelKey);
    }
  }, 1000);
}

$('duelCoinBtn').addEventListener('click', ()=>{
  if (!activeDuelKey) return;
  duelMyScore++;
  $('duelMyScore').textContent = duelMyScore;
  sounds.click();
  fbUpdateDuelScore(activeDuelKey, sanitiseKey(state.username), duelMyScore);
});
$('duelCoinBtn').addEventListener('touchend', e=>{
  e.preventDefault();
  if (!activeDuelKey) return;
  duelMyScore++;
  $('duelMyScore').textContent = duelMyScore;
  sounds.click();
  fbUpdateDuelScore(activeDuelKey, sanitiseKey(state.username), duelMyScore);
}, {passive:false});

function endDuel(data) {
  clearInterval(duelTimer);
  $('duelActiveModal').classList.add('hidden');
  if (!data || !data.scores) return;
  const myKey = sanitiseKey(state.username);
  const myScore  = data.scores[myKey] || 0;
  const oppScore = Object.entries(data.scores).filter(([k])=>k!==myKey).map(([,v])=>v)[0] || 0;
  const won = myScore > oppScore;
  if (won) {
    const prize = data.prize || 500;
    state.coins += prize;
    state.totalCoins += prize;
    state.achievements['won_duel'] = true;
    updateHUD();
    sounds.achiev();
    showToast(`🏆 DUEL WON! +${fmt(prize)} coins!`);
    checkAchievements();
  } else {
    showToast(`💀 Duel lost… (${myScore} vs ${oppScore})`);
  }
  activeDuelKey = null;
  scheduleSave();
}

/* ═══════════════════════════════════
   GIFTS
═══════════════════════════════════ */
let giftTargetKey = '';

function openGiftModal(targetKey, targetName) {
  giftTargetKey = targetKey;
  $('giftTarget').textContent = targetName;
  $('giftBalance').textContent = `Your balance: ${fmt(state.coins)} coins`;
  $('giftAmount').value = '';
  $('giftModal').classList.remove('hidden');
}

$('giftClose').addEventListener('click', ()=>$('giftModal').classList.add('hidden'));
$('confirmGiftBtn').addEventListener('click', async ()=>{
  const amount = parseInt($('giftAmount').value);
  if (!amount || amount < 10) { showToast('Minimum gift is 10 coins'); return; }
  if (amount > state.coins) { showToast('Not enough coins!'); return; }
  state.coins -= amount;
  updateHUD();
  const ok = await fbSendGift(state.username, giftTargetKey, amount);
  $('giftModal').classList.add('hidden');
  if (ok) {
    state.achievements['sent_gift'] = true;
    sounds.gift();
    showToast(`🎁 Gift of ${fmt(amount)} coins sent!`);
    checkAchievements();
    scheduleSave();
  } else {
    // Refund on fail
    state.coins += amount;
    updateHUD();
    showToast('Failed to send gift');
  }
});

function handleIncomingNotification(data) {
  if (!data) return;
  if (data.type === 'gift') {
    state.coins += data.amount || 0;
    state.totalCoins += data.amount || 0;
    updateHUD();
    sounds.gift();
    showToast(`🎁 ${data.from} sent you ${fmt(data.amount)} coins!`);
    scheduleSave();
  } else if (data.type === 'duel') {
    activeDuelKey = data.duelKey;
    $('duelChallenger').textContent = data.from;
    $('duelPrize').textContent = fmt(data.prize||500);
    $('duelModal').classList.remove('hidden');
    sounds.event();
    fbListenDuel(data.duelKey, handleDuelUpdate);
  }
}

/* ═══════════════════════════════════
   MOBILE TABS
═══════════════════════════════════ */
function initTabs() {
  const tabs   = document.querySelectorAll('.mtab');
  const panels = document.querySelectorAll('.g-panel');

  function activate(panelId) {
    panels.forEach(p => p.classList.toggle('active', p.id===panelId));
    tabs.forEach(t => t.classList.toggle('active', t.dataset.panel===panelId));
    chatVisible = panelId === 'panelSocial';
    if (chatVisible) { unreadChat=0; $('socialNotifDot').style.display='none'; }
    if (panelId==='panelStats') { drawGraph(); renderDetailedStats(); }
  }

  if (window.innerWidth > 900) {
    // Desktop: show Mine by default, tabs still work
    activate('panelMine');
  } else {
    activate('panelMine');
  }

  tabs.forEach(tab => tab.addEventListener('click', ()=> activate(tab.dataset.panel)));
}

/* ═══════════════════════════════════
   TOAST
═══════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2400);
}

/* ═══════════════════════════════════
   AUTO-SAVE
═══════════════════════════════════ */
let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(doSave, 6000);
}
function doSave() {
  if (!state.username) return;
  fbSavePlayer(state.username, {
    coins:          state.coins,
    totalCoins:     state.totalCoins,
    coinsPerClick:  state.coinsPerClick,
    coinsPerSecond: state.coinsPerSecond,
    upgradeLevels:  state.upgradeLevels,
    prestigeLevel:  state.prestigeLevel,
    achievements:   state.achievements,
    dailyQuests:    state.dailyQuests,
    totalClicks:    state.totalClicks,
    clanId:         state.clanId,
    activeSkin:     state.activeSkin,
    unlockedSkins:  state.unlockedSkins,
  });
}
setInterval(doSave, 30000);

/* ═══════════════════════════════════
   STAR CANVAS
═══════════════════════════════════ */
function initStarCanvas() {
  const canvas = $('starCanvas');
  const ctx = canvas.getContext('2d');
  let stars = [], W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars = [];
    const n = Math.floor((W*H)/3500);
    for(let i=0;i<n;i++) stars.push({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.3+.2, a:Math.random(),
      da:(Math.random()-.5)*.007,
      vx:(Math.random()-.5)*.03,
      vy:Math.random()*.04+.01,
      hue:Math.random()<.15?(Math.random()<.5?200:280):0,
      sat:Math.random()<.15?100:0,
    });
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    stars.forEach(s=>{
      s.a+=s.da; if(s.a<=0||s.a>=1) s.da*=-1;
      s.x+=s.vx; s.y+=s.vy;
      if(s.y>H){s.y=0;s.x=Math.random()*W;}
      if(s.x<0)s.x=W; if(s.x>W)s.x=0;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle = s.sat>0 ? `hsla(${s.hue},${s.sat}%,80%,${s.a})` : `rgba(200,220,255,${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);
  resize(); draw();
}

/* ═══════════════════════════════════
   SOUND TOGGLE
═══════════════════════════════════ */
$('soundToggle').addEventListener('click',()=>{
  state.soundEnabled = !state.soundEnabled;
  $('soundToggle').textContent = state.soundEnabled ? '🔊' : '🔇';
  $('soundToggle').classList.toggle('active', !state.soundEnabled);
});

/* ═══════════════════════════════════
   START GAME
═══════════════════════════════════ */
function sanitiseKey(name) {
  return (name||'').trim().replace(/[.#$\[\]\/]/g,'_').slice(0,30)||'anon';
}

function startGame(username) {
  state.username = username;
  $('headerUsername').textContent = username.length>13 ? username.slice(0,13)+'…' : username;
  $('usernameModal').style.display = 'none';
  $('gameWrap').style.display = 'flex';

  setupParticleCanvas();
  buildUpgradeCards('upgradesListDesktop');
  buildUpgradeCards('upgradesListMobile');
  initTabs();
  initGraph();

  fbLoadPlayer(username).then(data => {
    if (data) {
      state.coins          = data.coins          || 0;
      state.totalCoins     = data.totalCoins      || 0;
      state.upgradeLevels  = data.upgradeLevels   || {};
      state.prestigeLevel  = data.prestigeLevel   || 0;
      state.achievements   = data.achievements    || {};
      state.totalClicks    = data.totalClicks     || 0;
      state.clanId         = data.clanId          || null;
      state.activeSkin     = data.activeSkin      || 'default';
      state.unlockedSkins  = data.unlockedSkins   || { default:true };
      if (data.dailyQuests) state.dailyQuests = data.dailyQuests;
      recalcStats();
      coinFace.textContent = SKINS.find(s=>s.id===state.activeSkin)?.emoji || '🪙';
      if (state.prestigeLevel > 0) {
        $('prestigeBadge').style.display='inline-flex';
        $('prestigeLevel').textContent = state.prestigeLevel;
      }
      showToast('🚀 Welcome back, '+username+'!');
    } else {
      state.unlockedSkins = { default: true };
      showToast('🌌 New pilot: '+username+'!');
    }
    lastGraphCoins = state.totalCoins;
    initDailyQuests();
    renderAchievements();
    updateClanUI();
    updateHUD();
    checkAchievements();
  });

  fbSetOnline(username);
  fbOnOnlineCount(n => $('onlineCount').textContent = n);
  fbOnOnlinePlayers(renderOnlinePlayers);
  fbOnLeaderboard(entries => { renderLeaderboard(entries,'leaderboard'); renderLeaderboard(entries,'leaderboardStats'); });
  fbOnChat(msgs => { renderChat(msgs); onNewChatMsg(); });
  fbListenNotifications(username, handleIncomingNotification);
  fbOnClanLeaderboard(renderClanLeaderboard);
  fbPruneChat();

  // Start ticks
  lastTick = Date.now();
  requestAnimationFrame(autoTick);
  requestAnimationFrame(tickParticles);

  // First event in 3–7 min
  setTimeout(triggerEvent, (3 + Math.random()*4) * 60000);
}

/* ═══════════════════════════════════
   USERNAME FORM
═══════════════════════════════════ */
function handleStart() {
  const val = $('usernameInput').value.trim();
  if (!val || val.length < 2) {
    $('usernameInput').animate([{borderColor:'#ff4466'},{borderColor:''}],{duration:600});
    return;
  }
  localStorage.setItem('cc_username', val);
  startGame(val);
}

$('startBtn').addEventListener('click', handleStart);
$('usernameInput').addEventListener('keydown', e => { if(e.key==='Enter') handleStart(); });

window.addEventListener('DOMContentLoaded', ()=>{
  initStarCanvas();
  const saved = localStorage.getItem('cc_username');
  if (saved) $('usernameInput').value = saved;
});

document.addEventListener('touchstart', e=>{
  if(e.target===mainCoin) e.preventDefault();
}, {passive:false});

