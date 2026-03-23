/**
 * COSMIC CLICKER v4 — script.js
 * Tech Tree · Clan Bases · Alchemy/Artifacts · Lore
 * Weekly Seasons · NPC Traders · Google Auth · RU/EN
 */

/* ══════════════════════════════════════
   DATA DEFINITIONS
══════════════════════════════════════ */
const SEASONS = [
  {id:0,emoji:'☀️',name:'Solar Flare',   bonus:{cpc:0.20},          reward:{type:'skin',id:'sun'},              color:'#ff8c00',desc:'+20% click power'},
  {id:1,emoji:'❄️',name:'Ice Nebula',    bonus:{cps:0.20},          reward:{type:'skin',id:'crystal'},          color:'#00d4ff',desc:'+20% auto mining'},
  {id:2,emoji:'🌋',name:'Volcanic Core', bonus:{raid:0.50},         reward:{type:'resource',res:'nebcore',amt:5},color:'#ff4400',desc:'+50% raid damage'},
  {id:3,emoji:'🌌',name:'Dark Matter',   bonus:{prestigeBonus:0.25},reward:{type:'resource',res:'voidcrystal',amt:3},color:'#b400ff',desc:'+25% prestige mult'},
  {id:4,emoji:'⚡',name:'Electric Storm',bonus:{crit:0.10},         reward:{type:'skin',id:'vortex'},           color:'#ffd700',desc:'+10% crit chance'},
  {id:5,emoji:'🌸',name:'Cosmic Spring', bonus:{resources:2},       reward:{type:'resource',res:'stardust',amt:10},color:'#ff88cc',desc:'Resources drop 2×'},
  {id:6,emoji:'🎃',name:'Void Halloween',bonus:{cpc:0.15,cps:0.15}, reward:{type:'coins',amt:10000},            color:'#ff8c00',desc:'+15% click & auto'},
  {id:7,emoji:'❄️',name:'Frost Nova',    bonus:{offline:2},         reward:{type:'skin',id:'moon'},             color:'#88ccff',desc:'Offline income ×2'},
];

const TECH_BRANCHES = [
  {id:'click',name:'CLICK RESEARCH',nodes:[
    {id:'t_cpc1', icon:'👆',name:'POWER CLICK I',  desc:'+10% per click',    cost:1000,   bonus:{cpc:0.10},         requires:null},
    {id:'t_cpc2', icon:'👊',name:'POWER CLICK II', desc:'+20% per click',    cost:8000,   bonus:{cpc:0.20},         requires:'t_cpc1'},
    {id:'t_crit1',icon:'💥',name:'CRIT MASTER',    desc:'+5% crit chance',   cost:5000,   bonus:{crit:0.05},        requires:'t_cpc1'},
    {id:'t_crit2',icon:'🌟',name:'VOID STRIKE',    desc:'Crit mult ×2',      cost:50000,  bonus:{critMult:2},       requires:'t_crit1'},
    {id:'t_cpc3', icon:'🔥',name:'POWER CLICK III',desc:'+50% per click',    cost:200000, bonus:{cpc:0.50},         requires:'t_cpc2'},
  ]},
  {id:'auto',name:'AUTO RESEARCH',nodes:[
    {id:'t_cps1',icon:'⚙️',name:'EFFICIENCY I',    desc:'+10% auto/sec',     cost:2000,   bonus:{cps:0.10},         requires:null},
    {id:'t_cps2',icon:'🔧',name:'EFFICIENCY II',   desc:'+25% auto/sec',     cost:15000,  bonus:{cps:0.25},         requires:'t_cps1'},
    {id:'t_over',icon:'🚀',name:'OVERCLOCK',       desc:'+50% auto/sec',     cost:80000,  bonus:{cps:0.50},         requires:'t_cps2'},
    {id:'t_sing',icon:'🕳️',name:'SINGULARITY DRIVE',desc:'+100% auto/sec',  cost:500000, bonus:{cps:1.00},         requires:'t_over'},
  ]},
  {id:'economy',name:'ECONOMY RESEARCH',nodes:[
    {id:'t_res1',  icon:'✨',name:'RESOURCE SCOUT', desc:'+50% resource drops',cost:3000,  bonus:{resources:0.5},   requires:null},
    {id:'t_lucky', icon:'🎰',name:'LUCKY MINER',    desc:'Crits drop resources',cost:20000,bonus:{luckyRes:true},   requires:'t_res1'},
    {id:'t_off',   icon:'💤',name:'SLEEP COLLECTOR',desc:'Offline income ×1.5',cost:30000, bonus:{offline:0.5},     requires:'t_res1'},
    {id:'t_trade', icon:'💱',name:'COSMIC TRADER',  desc:'NPC 20% cheaper',   cost:100000, bonus:{npcDiscount:0.20},requires:'t_lucky'},
  ]},
  {id:'prestige',name:'PRESTIGE RESEARCH',nodes:[
    {id:'t_soul',  icon:'♻️',name:'SOUL TRANSFER',  desc:'+10% prestige mult', cost:50000, bonus:{prestigeBonus:0.10},requires:null},
    {id:'t_mem',   icon:'🧠',name:'COSMIC MEMORY',  desc:'Keep 5% coins on prestige',cost:200000,bonus:{keepCoins:0.05},requires:'t_soul'},
    {id:'t_legacy',icon:'🌟',name:'LEGACY BOOST',   desc:'+20% prestige mult', cost:1000000,bonus:{prestigeBonus:0.20},requires:'t_soul'},
  ]},
];

const ARTIFACTS = [
  {id:'phoenix',  icon:'🔥',name:'PHOENIX CORE',    desc:'+25% all income',   bonus:{allIncome:0.25},    cost:{stardust:5,nebcore:3}},
  {id:'voidheart',icon:'💀',name:'VOID HEART',      desc:'+15% crit chance',  bonus:{crit:0.15},         cost:{stardust:3,voidcrystal:2}},
  {id:'starcrown',icon:'👑',name:'STAR CROWN',      desc:'+50% prestige mult',bonus:{prestigeBonus:0.50},cost:{nebcore:5,voidcrystal:3}},
  {id:'thunder',  icon:'⚡',name:'THUNDER GAUNTLET',desc:'+100% click power', bonus:{cpc:1.00},          cost:{stardust:8,voidcrystal:2}},
  {id:'nebula',   icon:'🌌',name:'NEBULA ESSENCE',  desc:'Resources drop 3×', bonus:{resources:2},       cost:{nebcore:8,stardust:4}},
  {id:'timestone',icon:'⏳',name:'TIME STONE',      desc:'Offline income ×3', bonus:{offline:2},         cost:{stardust:5,nebcore:5,voidcrystal:3}},
];

const RECIPES = [
  {id:'clickboost',name:'CLICK SURGE', icon:'⚡',desc:'3× clicks 60s',  cost:{stardust:3},         effect:'clickBoost60'},
  {id:'autoboost', name:'AUTO SURGE',  icon:'🤖',desc:'5× auto 60s',    cost:{nebcore:2},           effect:'autoBoost60'},
  {id:'megaboost', name:'MEGA BOOST',  icon:'💥',desc:'×10 all 30s',    cost:{stardust:2,nebcore:2},effect:'megaBoost30'},
  {id:'lucky5k',   name:'LUCKY STASH', icon:'🎰',desc:'+5000 coins',    cost:{voidcrystal:1},       effect:'luckyCoins'},
];

const LORE = [
  {icon:'🌍',title:'Chapter 1: The Beginning',unlock:0,text:'You were a simple space miner on a remote asteroid. One day your drill struck a vein of cosmic ore unlike anything in the database. The Galactic Mining Commission dispatched an observer — but you knew this discovery was yours alone. The age of Cosmic Clicking had begun.'},
  {icon:'⭐',title:'Chapter 2: The First Star',unlock:1000,text:'Word spread across the sector. Other pilots began scanning the region. Your station expanded from a single drill to a sprawling complex. When you made first contact with the Star Forge, the ancient automated factory stirred back to life after millennia of dormancy.'},
  {icon:'🚀',title:'Chapter 3: The Rival',unlock:10000,text:'The Void Corporation dispatched Commander NEXUS to claim the ore fields. NEXUS had the backing of three star systems. You had raw determination and loyal pilots. The race to corner the galactic market had begun. The first duel was fought not with weapons, but with clicks per second.'},
  {icon:'🌌',title:'Chapter 4: The Nebula Gate',unlock:100000,text:'Hidden within the Nebula Harvest Station was a gate. Beyond it lay the Dark Matter Core — a dimension where resources were a thousand times more concentrated, but so was the danger. You were the first human to step through.'},
  {icon:'🏰',title:'Chapter 5: The Alliance',unlock:1000000,text:'Rival mining clans set aside differences when the Void Corporation deployed fleet-scale suppression drones. Together, the clans built the first united base — combining their technologies, banks, and firepower. The Cosmic Alliance was forged in the fires of necessity.'},
  {icon:'♻️',title:'Chapter 6: Rebirth Protocol',unlock:10000000,text:'The Singularity emits what scientists call Prestige Waves. Pilots who surfed these waves underwent a form of cosmic rebirth — losing accumulated wealth but emerging with a fundamental enhancement to their very perception of energy. You chose to dive in.'},
  {icon:'🌀',title:'Chapter 7: The Void Speaks',unlock:100000000,text:'In the deepest reaches of your operation, you encountered something that defied categorization. It called itself the Singularity Intelligence — a consciousness born from a billion stars. It offered you unlimited cosmic power, in exchange for becoming its emissary.'},
  {icon:'🎭',title:'Chapter 8: The Final Season',unlock:1000000000,text:'The galaxy runs in seasons — cosmic weather patterns shifting the fundamental constants of physics on a seven-day cycle. The greatest pilots did not merely play the game. They became part of the galaxy itself.'},
];

const BUILDINGS = [
  {id:'power',  icon:'⚡',name:'POWER CORE',    desc:'All members +5% coins/sec per level', maxLevel:5,baseCost:500,  costMult:3,bonus:{cps:0.05}},
  {id:'lab',    icon:'🔬',name:'RESEARCH LAB',  desc:'All members +5% coins/click per level',maxLevel:5,baseCost:800,  costMult:3,bonus:{cpc:0.05}},
  {id:'shield', icon:'🛡️',name:'SHIELD GEN',    desc:'Offline income +20% per level',       maxLevel:3,baseCost:2000, costMult:4,bonus:{offline:0.2}},
  {id:'trading',icon:'🏪',name:'TRADING POST',  desc:'NPC 10% cheaper per level',           maxLevel:3,baseCost:3000, costMult:5,bonus:{npcDiscount:0.10}},
  {id:'nebulat',icon:'🌌',name:'NEBULA TAP',    desc:'+20% resource drops per level',       maxLevel:4,baseCost:5000, costMult:5,bonus:{resources:0.2}},
];

const NPC_OFFERS = {
  boost_deal:    {npc:'🤖',name:'VOLT-3000',   desc:'3× click power for 2 hours.',   deal:'Pay 500🪙 → 3× clicks 2h',  price:500,  effect:'clickBoost7200'},
  resource_deal: {npc:'👽',name:'ZRIX-7',      desc:'Fresh stardust from the nebula.',deal:'Pay 1000🪙 → 5× Stardust✨',price:1000, effect:'resource_stardust_5'},
  mystery_box:   {npc:'🎭',name:'???',          desc:'I cannot say what is inside.',   deal:'Pay 2000🪙 → mystery reward',price:2000, effect:'mystery'},
  skin_deal:     {npc:'🎨',name:'COSME',        desc:'A fine cosmetic item.',          deal:'Pay 100🪙 → random skin',    price:100,  effect:'random_skin'},
  prestige_boost:{npc:'♻️',name:'ANCIENT ONE',  desc:'The essence of a thousand cycles.',deal:'Pay 5000🪙 → +10% prestige',price:5000, effect:'prestige_boost'},
};

const UPGRADES = [
  {id:'drill1',name:'PLASMA DRILL',    icon:'⚡',desc:'+1/click',   baseCost:15,     costMult:1.50,effect:{cpc:1}},
  {id:'auto1', name:'ASTEROID MINER', icon:'🪐',desc:'+0.5/sec',   baseCost:75,     costMult:1.55,effect:{cps:.5}},
  {id:'drill2',name:'QUANTUM AMP',    icon:'🔮',desc:'+5/click',   baseCost:350,    costMult:1.65,effect:{cpc:5}},
  {id:'auto2', name:'SPACE STATION',  icon:'🛸',desc:'+4/sec',     baseCost:900,    costMult:1.70,effect:{cps:4}},
  {id:'drill3',name:'STAR FORGE',     icon:'⭐',desc:'+25/click',  baseCost:3500,   costMult:1.80,effect:{cpc:25}},
  {id:'auto3', name:'NEBULA HARVEST', icon:'🌌',desc:'+25/sec',    baseCost:9000,   costMult:1.85,effect:{cps:25}},
  {id:'drill4',name:'NEBULA CRYSTAL', icon:'💎',desc:'+120/click', baseCost:28000,  costMult:1.90,effect:{cpc:120}},
  {id:'auto4', name:'COSMIC ENGINE',  icon:'🚀',desc:'+150/sec',   baseCost:80000,  costMult:2.00,effect:{cps:150}},
  {id:'drill5',name:'VOID FIST',      icon:'🌀',desc:'+600/click', baseCost:300000, costMult:2.10,effect:{cpc:600}},
  {id:'auto5', name:'BLACK HOLE TAP', icon:'🕳️',desc:'+800/sec',   baseCost:1000000,costMult:2.20,effect:{cps:800}},
];

const PLANETS = [
  {id:'terra',      emoji:'🌍',name:'TERRA NOVA',    desc:'Starting planet.',        cost:0,      bonus:{cpc:0.05}, x:50,y:50},
  {id:'asteroid',   emoji:'☄️',name:'ASTEROID BELT', desc:'Metal-rich rocks.',       cost:500,    bonus:{cps:0.10}, x:22,y:28},
  {id:'nebula',     emoji:'🌌',name:'NEBULA STATION',desc:'Exotic matter clouds.',   cost:10000,  bonus:{both:0.15},x:78,y:22},
  {id:'dark',       emoji:'🌑',name:'DARK CORE',     desc:'Unstable but profitable.',cost:200000, bonus:{both:0.25},x:18,y:72},
  {id:'singularity',emoji:'🌀',name:'SINGULARITY',   desc:'Edge of reality.',        cost:5000000,bonus:{both:0.50},x:82,y:75},
];

const SKINS=[
  {id:'default',emoji:'🪙',name:'DEFAULT', cost:0},
  {id:'gem',    emoji:'💎',name:'DIAMOND', cost:500},
  {id:'star',   emoji:'⭐',name:'STAR',    cost:1000},
  {id:'moon',   emoji:'🌕',name:'MOON',    cost:2000},
  {id:'crystal',emoji:'🔮',name:'CRYSTAL', cost:5000},
  {id:'gold',   emoji:'💰',name:'GOLD BAG',cost:3000},
  {id:'sun',    emoji:'☀️',name:'SUN',     cost:10000},
  {id:'vortex', emoji:'🌀',name:'VORTEX',  cost:0,craftOnly:true},
];

const RESOURCES=[
  {id:'stardust',  emoji:'✨',name:'Stardust'},
  {id:'nebcore',   emoji:'💠',name:'Neb. Core'},
  {id:'voidcrystal',emoji:'🔷',name:'Void Crystal'},
];

const ACHIEVEMENTS=[
  {id:'click1',   icon:'👆',name:'FIRST CONTACT',    desc:'Click once',                  check:s=>s.totalClicks>=1},
  {id:'click100', icon:'🖱️',name:'CLICK FEVER',      desc:'100 clicks',                  check:s=>s.totalClicks>=100},
  {id:'click1k',  icon:'⚡',name:'RAPID FIRE',       desc:'1,000 clicks',                check:s=>s.totalClicks>=1000},
  {id:'click10k', icon:'🌪️',name:'TAP STORM',        desc:'10,000 clicks',               check:s=>s.totalClicks>=10000},
  {id:'coins100', icon:'🪙',name:'POCKET CHANGE',    desc:'Earn 100 coins',              check:s=>s.totalCoins>=100},
  {id:'coins10k', icon:'💰',name:'SPACE MERCHANT',   desc:'Earn 10K coins',              check:s=>s.totalCoins>=10000},
  {id:'coins1m',  icon:'💎',name:'GALACTIC BANKER',  desc:'Earn 1M coins',               check:s=>s.totalCoins>=1000000},
  {id:'coins1b',  icon:'🌌',name:'COSMIC TYCOON',    desc:'Earn 1B coins',               check:s=>s.totalCoins>=1e9},
  {id:'upg1',     icon:'🔧',name:'FIRST UPGRADE',    desc:'Buy first upgrade',           check:s=>Object.values(s.upgradeLevels||{}).some(v=>v>=1)},
  {id:'tech5',    icon:'🌳',name:'RESEARCHER',       desc:'Research 5 techs',            check:s=>Object.keys(s.techResearched||{}).length>=5},
  {id:'alltech',  icon:'🎓',name:'MASTER SCIENTIST', desc:'Research all techs',          check:s=>Object.keys(s.techResearched||{}).length>=TECH_BRANCHES.reduce((a,b)=>a+b.nodes.length,0)},
  {id:'artifact1',icon:'⚗️',name:'ALCHEMIST',        desc:'Forge first artifact',        check:s=>Object.keys(s.forgedArtifacts||{}).length>=1},
  {id:'artall',   icon:'🔮',name:'GRANDMASTER',      desc:'Forge all artifacts',         check:s=>Object.keys(s.forgedArtifacts||{}).length>=ARTIFACTS.length},
  {id:'prestige1',icon:'♻️',name:'REBIRTH',          desc:'Prestige once',               check:s=>s.prestigeLevel>=1},
  {id:'prestige5',icon:'🌟',name:'PHOENIX',          desc:'Prestige 5 times',            check:s=>s.prestigeLevel>=5},
  {id:'planet5',  icon:'🗺️',name:'GALACTIC PILOT',   desc:'Own all 5 planets',          check:s=>Object.keys(s.ownedPlanets||{}).length>=5},
  {id:'raid1',    icon:'⚔️',name:'RAIDER',           desc:'Join a raid',                 check:s=>!!s.achievements?.raid1},
  {id:'season1',  icon:'🎭',name:'SEASONAL PILOT',   desc:'Claim season reward',         check:s=>!!s.achievements?.season1},
  {id:'clan1',    icon:'🏰',name:'CLAN MEMBER',      desc:'Join a clan',                 check:s=>!!s.clanId},
  {id:'building1',icon:'🏗️',name:'BASE BUILDER',     desc:'Upgrade clan building',       check:s=>!!s.achievements?.building1},
  {id:'won_duel', icon:'🥇',name:'DUEL CHAMPION',    desc:'Win a duel',                  check:s=>!!s.achievements?.won_duel},
  {id:'sent_gift',icon:'🎁',name:'GENEROUS PILOT',   desc:'Send a gift',                 check:s=>!!s.achievements?.sent_gift},
  {id:'lore5',    icon:'📖',name:'HISTORIAN',        desc:'Read 5 lore chapters',        check:s=>(s.loreRead||0)>=5},
  {id:'npc_deal', icon:'🤖',name:"TRADER'S FRIEND",  desc:'Accept NPC deal',             check:s=>!!s.achievements?.npc_deal},
  {id:'slots_win',icon:'🎰',name:'JACKPOT!',         desc:'Win slots jackpot',           check:s=>!!s.achievements?.slots_win},
];

const EVENTS=[
  {id:'meteor',      icon:'☄️',name:'METEOR SHOWER!',duration:0, apply(s){const g=Math.max(500,s.coinsPerSecond*10);s.coins+=g;s.totalCoins+=g;return`+${fmt(g)} coins!`;},resource:'stardust'},
  {id:'click_boost', icon:'⚡',name:'CLICK FRENZY!', duration:30,apply(s){s.activeBoost={type:'click',mult:3,end:Date.now()+30000};return'3× clicks 30s!';},resource:'stardust'},
  {id:'auto_boost',  icon:'🌀',name:'AUTO SURGE!',   duration:20,apply(s){s.activeBoost={type:'auto', mult:5,end:Date.now()+20000};return'5× auto 20s!';}, resource:'nebcore'},
  {id:'lucky',       icon:'🎰',name:'LUCKY STRIKE!', duration:0, apply(s){const m=2+Math.floor(Math.random()*9);const g=s.coinsPerClick*50*m;s.coins+=g;s.totalCoins+=g;return`×${m} bonus!`;},resource:'voidcrystal'},
  {id:'double',      icon:'💥',name:'DOUBLE DAY!',   duration:60,apply(s){s.activeBoost={type:'mega', mult:10,end:Date.now()+60000};return'×10 everything!';},resource:'nebcore'},
];

const SLOTS_SYMBOLS=['🪙','💎','⭐','🌌','🔮','💰','⚡'];
const SLOTS_PAYTABLE=[
  {syms:['🌌','🌌','🌌'],mult:500,label:'JACKPOT'},
  {syms:['💎','💎','💎'],mult:100,label:'DIAMOND'},
  {syms:['⭐','⭐','⭐'],mult:50, label:'TRIPLE STAR'},
  {syms:['💰','💰','💰'],mult:25, label:'GOLD RUSH'},
  {syms:['🔮','🔮','🔮'],mult:15, label:'MAGIC'},
  {syms:['⚡','⚡','⚡'],mult:10, label:'LIGHTNING'},
  {syms:['🪙','🪙','🪙'],mult:5,  label:'TRIPLE COIN'},
];

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
const state={
  uid:null, username:'',
  coins:0, totalCoins:0,
  coinsPerClick:1, coinsPerSecond:0,
  upgradeLevels:{}, prestigeLevel:0,
  achievements:{}, dailyQuests:{}, totalClicks:0,
  clanId:null, activeSkin:'default', unlockedSkins:{default:true},
  resources:{stardust:0,nebcore:0,voidcrystal:0},
  ownedPlanets:{}, planetBonus:{cpc:0,cps:0},
  techResearched:{}, equippedArtifacts:[], forgedArtifacts:{},
  seasonPoints:0, seasonRewardClaimed:{},
  activeBoost:null, soundEnabled:true,
  eventsLog:[], questClicksToday:0, questCoinsToday:0, questUpgradesToday:0,
  coinsHistory:[], lastGraphCoins:0,
  raidMyDamage:0, loreRead:0,
  currentSeason:null, clanData:null,
};

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const $=id=>document.getElementById(id);
function fmt(n){
  n=Math.floor(n);
  if(n>=1e12)return(n/1e12).toFixed(2)+'T';
  if(n>=1e9) return(n/1e9).toFixed(2)+'B';
  if(n>=1e6) return(n/1e6).toFixed(2)+'M';
  if(n>=1e3) return(n/1e3).toFixed(1)+'K';
  return n.toString();
}
function escHTML(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function getTodayKey(){return new Date().toISOString().slice(0,10);}
function upgradeCost(u){return Math.floor(u.baseCost*Math.pow(u.costMult,state.upgradeLevels[u.id]||0));}

/* ══════════════════════════════════════
   BONUS CALCULATIONS
══════════════════════════════════════ */
function getTechBonus(){
  const b={cpc:0,cps:0,crit:0,critMult:1,offline:0,resources:0,prestigeBonus:0,keepCoins:0,npcDiscount:0,luckyRes:false};
  TECH_BRANCHES.forEach(br=>br.nodes.forEach(n=>{
    if(!state.techResearched[n.id])return;
    Object.entries(n.bonus).forEach(([k,v])=>{
      if(k==='critMult')b.critMult*=v;
      else if(k==='luckyRes')b.luckyRes=true;
      else if(k in b)b[k]+=v;
    });
  }));
  return b;
}
function getArtifactBonus(){
  const b={allIncome:0,cpc:0,crit:0,prestigeBonus:0,resources:0,offline:0};
  (state.equippedArtifacts||[]).forEach(id=>{
    const a=ARTIFACTS.find(x=>x.id===id);if(!a)return;
    Object.entries(a.bonus).forEach(([k,v])=>{if(k in b)b[k]+=v;});
  });
  return b;
}
function getClanBonus(){
  const b={cpc:0,cps:0,offline:0,npcDiscount:0,resources:0};
  if(!state.clanData?.buildings)return b;
  BUILDINGS.forEach(bd=>{
    const lvl=state.clanData.buildings[bd.id]||0;if(!lvl)return;
    Object.entries(bd.bonus).forEach(([k,v])=>{if(k in b)b[k]+=v*lvl;});
  });
  return b;
}
function getSeasonBonus(){return state.currentSeason?SEASONS[state.currentSeason.index]?.bonus||{}:{};}
function prestigeMult(){
  const tech=getTechBonus(),art=getArtifactBonus();
  const base=state.prestigeLevel===0?1:(1+state.prestigeLevel*0.5);
  return base*(1+tech.prestigeBonus+art.prestigeBonus);
}
function recalcPlanetBonus(){
  let cpc=0,cps=0;
  PLANETS.forEach(p=>{
    if(!state.ownedPlanets[p.id])return;
    if(p.bonus.cpc)cpc+=p.bonus.cpc;
    if(p.bonus.cps)cps+=p.bonus.cps;
    if(p.bonus.both){cpc+=p.bonus.both;cps+=p.bonus.both;}
  });
  state.planetBonus={cpc,cps};
}
function recalcStats(){
  const tech=getTechBonus(),art=getArtifactBonus(),clan=getClanBonus(),season=getSeasonBonus();
  let cpc=1,cps=0;
  UPGRADES.forEach(u=>{
    const l=state.upgradeLevels[u.id]||0;
    if(u.effect.cpc)cpc+=u.effect.cpc*l;
    if(u.effect.cps)cps+=u.effect.cps*l;
  });
  const pm=prestigeMult();
  const allMult=1+art.allIncome;
  const cpcBonus=1+tech.cpc+art.cpc+(clan.cpc||0)+(season.cpc||0);
  const cpsBonus=1+tech.cps+(clan.cps||0)+(season.cps||0);
  const pCPC=1+state.planetBonus.cpc,pCPS=1+state.planetBonus.cps;
  state.coinsPerClick=cpc*pm*pCPC*cpcBonus*allMult;
  state.coinsPerSecond=cps*pm*pCPS*cpsBonus*allMult;
}
function getCritChance(){const tech=getTechBonus(),art=getArtifactBonus(),s=getSeasonBonus();return 0.08+tech.crit+art.crit+(s.crit||0);}
function getCritMult(){return getTechBonus().critMult||1;}
function effectiveCPC(){
  if(state.activeBoost?.end>Date.now()){
    if(state.activeBoost.type==='click')return state.coinsPerClick*state.activeBoost.mult;
    if(state.activeBoost.type==='mega') return state.coinsPerClick*10;
  }
  return state.coinsPerClick;
}
function effectiveCPS(){
  if(state.activeBoost?.end>Date.now()){
    if(state.activeBoost.type==='auto')return state.coinsPerSecond*state.activeBoost.mult;
    if(state.activeBoost.type==='mega')return state.coinsPerSecond*10;
  }
  return state.coinsPerSecond;
}

/* ══════════════════════════════════════
   SOUND
══════════════════════════════════════ */
let audioCtx=null;
function getAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
function playTone(freq,type,dur,vol=0.15,delay=0){
  if(!state.soundEnabled)return;
  try{const ctx=getAudio(),o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type=type;o.frequency.value=freq;const ts=ctx.currentTime+delay/1000;g.gain.setValueAtTime(0,ts);g.gain.linearRampToValueAtTime(vol,ts+.01);g.gain.exponentialRampToValueAtTime(.001,ts+dur);o.start(ts);o.stop(ts+dur+.05);}catch(e){}
}
const SFX={
  click(){playTone(600,'sine',.06,.12);},
  crit(){playTone(900,'sine',.1,.2);playTone(1200,'sine',.08,.15,80);},
  buy(){playTone(440,'triangle',.08,.15);playTone(660,'triangle',.08,.15,100);},
  ach(){[[523,'sine'],[659,'sine'],[784,'sine'],[1047,'sine']].forEach(([f,tp],i)=>playTone(f,tp,.2,.2,i*100));},
  prestige(){for(let i=0;i<8;i++)playTone(200+i*80,'sawtooth',.15,.1,i*60);},
  event(){playTone(440,'square',.1,.15);playTone(550,'square',.1,.12,120);},
  gift(){playTone(880,'sine',.12,.18);playTone(1100,'sine',.1,.15,150);},
  chat(){playTone(700,'sine',.06,.08);},
  slots(){[[220,'square'],[330,'square'],[440,'square']].forEach(([f,tp],i)=>playTone(f,tp,.08,.12,i*50));},
  jackpot(){for(let i=0;i<12;i++)playTone(300+i*60,'sine',.2,.2,i*80);},
  raid(){playTone(150,'sawtooth',.3,.3);playTone(200,'sawtooth',.25,.25,150);},
  season(){[[523,'sine'],[659,'sine'],[784,'sine'],[1047,'sine'],[1319,'sine']].forEach(([f,tp],i)=>playTone(f,tp,.25,.2,i*120));},
};

/* ══════════════════════════════════════
   PARTICLES
══════════════════════════════════════ */
const pCanvas=$('particleCanvas'),pCtx=pCanvas.getContext('2d');
let particles=[];
function setupParticleCanvas(){pCanvas.width=200;pCanvas.height=200;}
function spawnExplosion(cx,cy,isCrit){
  const n=isCrit?22:12,colors=isCrit?['#ffd700','#ff8c00','#ffaa00','#fff','#ff6600']:['#ffd700','#ffcc44','#ffe080'];
  for(let i=0;i<n;i++){const a=(Math.PI*2/n)*i+(Math.random()-.5)*.4,sp=(isCrit?2.5:1.4)+Math.random()*2;particles.push({x:cx*2,y:cy*2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(isCrit?1:0),r:(isCrit?4:2.5)+Math.random()*2,life:1,decay:.025+Math.random()*.015,color:colors[Math.floor(Math.random()*colors.length)]});}
}
function tickParticles(){
  pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
  particles=particles.filter(p=>p.life>0);
  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.life-=p.decay;p.r*=.97;pCtx.globalAlpha=p.life;pCtx.beginPath();pCtx.arc(p.x,p.y,Math.max(.1,p.r),0,Math.PI*2);pCtx.fillStyle=p.color;pCtx.fill();});
  pCtx.globalAlpha=1;requestAnimationFrame(tickParticles);
}

/* ══════════════════════════════════════
   HUD
══════════════════════════════════════ */
function updateHUD(){
  $('coinDisplay').textContent=fmt(state.coins);
  $('coinDisplayM').textContent=fmt(state.coins);
  $('perClickDisplay').textContent=fmt(effectiveCPC());
  $('perClickM').textContent=fmt(effectiveCPC());
  $('perSecDisplay').textContent=fmt(effectiveCPS());
  $('perSecM').textContent=fmt(effectiveCPS());
  $('allTimeDisplay').textContent=fmt(state.totalCoins);
  $('autoDisplay').textContent=fmt(effectiveCPS());
  $('prestigeWrap').style.display=state.totalCoins>=1000000?'block':'none';
  $('prestigeMultShow').textContent=(1+(state.prestigeLevel+1)*0.5).toFixed(1);
  const sp=$('mySeasonPts');if(sp)sp.textContent=fmt(state.seasonPoints||0);
  updateUpgradeCards('upgradesListDesktop');
  updateUpgradeCards('upgradesListMobile');
}

/* ══════════════════════════════════════
   UPGRADES
══════════════════════════════════════ */
function buildUpgradeCards(cid){
  const el=$(cid);if(!el)return;el.innerHTML='';
  UPGRADES.forEach(u=>{
    const card=document.createElement('button');
    card.className='upgrade-card';card.dataset.id=u.id;
    card.innerHTML=`<div class="upg-icon">${u.icon}</div><div class="upg-info"><div class="upg-name">${u.name}</div><div class="upg-desc">${u.desc}</div></div><div class="upg-right"><div class="upg-level">LV <span>0</span></div><div class="upg-cost">🪙0</div></div>`;
    card.addEventListener('click',()=>buyUpgrade(u.id));
    el.appendChild(card);
  });
}
function updateUpgradeCards(cid){
  const el=$(cid);if(!el)return;
  UPGRADES.forEach(u=>{
    const card=el.querySelector(`[data-id="${u.id}"]`);if(!card)return;
    const cost=upgradeCost(u),can=state.coins>=cost;
    card.querySelector('.upg-level span').textContent=state.upgradeLevels[u.id]||0;
    const ce=card.querySelector('.upg-cost');ce.textContent=`🪙${fmt(cost)}`;ce.className='upg-cost'+(can?'':' cant-afford');
    card.classList.toggle('affordable',can);card.classList.toggle('locked',!can);
  });
}
function buyUpgrade(id){
  const u=UPGRADES.find(x=>x.id===id);if(!u)return;
  const cost=upgradeCost(u);
  if(state.coins<cost){shakeCard(id);return;}
  state.coins-=cost;state.upgradeLevels[id]=(state.upgradeLevels[id]||0)+1;
  state.questUpgradesToday++;recalcStats();updateHUD();flashCard(id);SFX.buy();addSeasonPts(5);
  showToast(`${u.icon} ${u.name} Lv${state.upgradeLevels[id]}`);
  checkAchievements();checkQuestProgress();scheduleSave();
}
function shakeCard(id){['upgradesListDesktop','upgradesListMobile'].forEach(c=>{const card=$(c)?.querySelector(`[data-id="${id}"]`);if(card)card.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:300});});}
function flashCard(id){['upgradesListDesktop','upgradesListMobile'].forEach(c=>{const card=$(c)?.querySelector(`[data-id="${id}"]`);if(card){card.classList.add('just-bought');setTimeout(()=>card.classList.remove('just-bought'),450);}});}

/* ══════════════════════════════════════
   CLICKING
══════════════════════════════════════ */
const mainCoin=$('mainCoin'),coinFace=$('coinFace'),floatPortal=$('floatPortal');
function handleCoinClick(cx,cy){
  if(!fbValidateClick())return;
  const isCrit=Math.random()<getCritChance();
  const mult=isCrit?(3+Math.floor(Math.random()*3))*getCritMult():1;
  const earned=effectiveCPC()*mult;
  state.coins+=earned;state.totalCoins+=earned;state.totalClicks++;
  state.questClicksToday++;state.questCoinsToday+=earned;
  const rect=mainCoin.getBoundingClientRect();
  spawnExplosion(cx-rect.left,cy-rect.top,isCrit);
  spawnFloat(cx,cy,fmt(earned),isCrit?'crit':'normal');
  if(isCrit){SFX.crit();addSeasonPts(2);}else SFX.click();
  if(isCrit&&getTechBonus().luckyRes&&Math.random()<0.05){
    const res=['stardust','nebcore','voidcrystal'][Math.floor(Math.random()*3)];
    state.resources[res]=(state.resources[res]||0)+1;renderCraft();
  }
  mainCoin.classList.add('clicking');setTimeout(()=>mainCoin.classList.remove('clicking'),100);
  updateHUD();checkAchievements();checkQuestProgress();
}
mainCoin.addEventListener('click',e=>handleCoinClick(e.clientX,e.clientY));
mainCoin.addEventListener('touchend',e=>{e.preventDefault();const t=e.changedTouches[0];handleCoinClick(t.clientX,t.clientY);},{passive:false});
function spawnFloat(cx,cy,text,type='normal'){
  const pr=floatPortal.getBoundingClientRect();
  const el=document.createElement('div');
  el.className=`float-text ${type}`;el.textContent='+'+text;
  el.style.left=(cx-pr.left+(Math.random()-.5)*40)+'px';el.style.top=(cy-pr.top-10)+'px';
  floatPortal.appendChild(el);setTimeout(()=>el.remove(),1050);
}
function spawnAutoFloat(){
  const rect=mainCoin.getBoundingClientRect(),pr=floatPortal.getBoundingClientRect();
  spawnFloat(rect.left+rect.width/2+(Math.random()-.5)*60,rect.top+rect.height/2+(Math.random()-.5)*30,fmt(effectiveCPS()*2),'auto');
}

/* ══════════════════════════════════════
   AUTO TICK
══════════════════════════════════════ */
let lastTick=Date.now(),autoFloatTimer=0;
function autoTick(){
  const now=Date.now(),dt=Math.min((now-lastTick)/1000,.1);lastTick=now;
  if(state.activeBoost?.end<=now){state.activeBoost=null;$('boostPill').style.display='none';updateHUD();}
  const cps=effectiveCPS();
  if(cps>0){
    const gain=cps*dt;state.coins+=gain;state.totalCoins+=gain;state.questCoinsToday+=gain;
    autoFloatTimer+=dt;if(autoFloatTimer>=2&&cps>=1){spawnAutoFloat();autoFloatTimer=0;}
    updateHUD();
  }
  requestAnimationFrame(autoTick);
}

/* ══════════════════════════════════════
   OFFLINE INCOME
══════════════════════════════════════ */
function checkOfflineIncome(lastSeen){
  if(!lastSeen)return;
  const tech=getTechBonus(),art=getArtifactBonus(),clan=getClanBonus(),season=getSeasonBonus();
  const offMult=0.5+tech.offline+art.offline+(clan.offline||0)+(season.offline||0);
  const elapsed=Math.min((Date.now()-lastSeen)/1000,8*3600);
  if(elapsed<60)return;
  const earned=state.coinsPerSecond*elapsed*offMult;
  if(earned<1)return;
  const hrs=Math.floor(elapsed/3600),mins=Math.floor((elapsed%3600)/60);
  $('offlineTime').textContent=hrs>0?`${hrs}h ${mins}m`:`${mins}m`;
  $('offlineCoins').textContent='+'+fmt(earned)+' 🪙';
  $('offlineModal').classList.remove('hidden');
  $('claimOfflineBtn').onclick=()=>{
    state.coins+=earned;state.totalCoins+=earned;
    $('offlineModal').classList.add('hidden');
    updateHUD();SFX.ach();showToast(`💤 +${fmt(earned)} offline!`);
    if(earned>=10000){state.achievements['offline_big']=true;checkAchievements();}
    scheduleSave();
  };
}

/* ══════════════════════════════════════
   PRESTIGE
══════════════════════════════════════ */
$('prestigeBtn').addEventListener('click',()=>{
  $('curPrestigeLvl').textContent=state.prestigeLevel;
  $('newPrestigeMult').textContent='×'+(1+(state.prestigeLevel+1)*0.5).toFixed(1);
  $('prestigeModal').classList.remove('hidden');
});
$('prestigeClose').addEventListener('click',()=>$('prestigeModal').classList.add('hidden'));
$('confirmPrestigeBtn').addEventListener('click',()=>{
  const keep=Math.floor(state.coins*(getTechBonus().keepCoins||0));
  state.prestigeLevel++;state.coins=keep;state.upgradeLevels={};state.questUpgradesToday=0;
  recalcStats();$('prestigeModal').classList.add('hidden');
  $('prestigeBadge').style.display='inline-flex';$('prestigeLevel').textContent=state.prestigeLevel;
  SFX.prestige();addSeasonPts(100);showToast(`♻️ Prestige ${state.prestigeLevel}!`);
  updateHUD();checkAchievements();scheduleSave();
});

/* ══════════════════════════════════════
   TECH TREE
══════════════════════════════════════ */
function renderTechTree(){
  const el=$('techTree');if(!el)return;el.innerHTML='';
  TECH_BRANCHES.forEach(br=>{
    const sec=document.createElement('div');sec.className='tech-branch';
    sec.innerHTML=`<div class="tech-branch-title">${br.name}</div><div class="tech-nodes"></div>`;
    const nodesEl=sec.querySelector('.tech-nodes');
    br.nodes.forEach(n=>{
      const researched=!!state.techResearched[n.id];
      const prereqMet=!n.requires||!!state.techResearched[n.requires];
      const canAfford=state.coins>=n.cost;
      const node=document.createElement('div');
      node.className='tech-node '+(researched?'tech-researched':!prereqMet?'tech-locked':canAfford?'tech-available':'');
      node.innerHTML=`<span class="tech-node-icon">${n.icon}</span><div class="tech-node-name">${n.name}</div><div class="tech-node-desc">${n.desc}</div><div class="tech-node-cost ${researched?'researched':''}">${researched?'✅ DONE':'🪙'+fmt(n.cost)}</div>`;
      if(!researched&&prereqMet)node.addEventListener('click',()=>researchTech(n));
      nodesEl.appendChild(node);
    });
    el.appendChild(sec);
  });
}
function researchTech(n){
  if(state.techResearched[n.id])return;
  if(n.requires&&!state.techResearched[n.requires]){showToast('Requires previous research!');return;}
  if(state.coins<n.cost){showToast(t('notEnoughCoins'));return;}
  state.coins-=n.cost;state.techResearched[n.id]=true;
  recalcStats();updateHUD();renderTechTree();SFX.buy();addSeasonPts(20);
  showToast(`🌳 Researched: ${n.name}!`);checkAchievements();scheduleSave();
}

/* ══════════════════════════════════════
   ALCHEMY & ARTIFACTS
══════════════════════════════════════ */
function renderCraft(){
  const rr=$('resourcesRow');
  if(rr)rr.innerHTML=RESOURCES.map(r=>`<div class="res-chip"><span>${r.emoji}</span><span class="res-count">${state.resources[r.id]||0}</span><span>${r.name}</span></div>`).join('');
  renderArtifacts();
  renderBasicCraft();
}
function renderArtifacts(){
  const al=$('artifactsList');if(!al)return;
  al.innerHTML=`<p class="panel-sub">Equipped: ${(state.equippedArtifacts||[]).length}/2</p>`;
  ARTIFACTS.forEach(a=>{
    const forged=!!state.forgedArtifacts[a.id];
    const equipped=(state.equippedArtifacts||[]).includes(a.id);
    const div=document.createElement('div');
    div.className='artifact-card'+(equipped?' equipped-art':'')+(forged?'':' not-forged');
    const costHtml=Object.entries(a.cost).map(([rid,amt])=>{
      const r=RESOURCES.find(x=>x.id===rid);const has=(state.resources[rid]||0)>=amt;
      return`<span style="color:${has?'var(--green)':'var(--red)'}">${r?.emoji||rid}×${amt}</span>`;
    }).join(' ');
    div.innerHTML=`<div class="artifact-icon">${a.icon}</div><div class="artifact-info"><div class="artifact-name">${a.name}${equipped?' ✨':''}</div><div class="artifact-bonus">${a.desc}</div>${!forged?`<div style="margin-top:4px;font-size:10px">${costHtml}</div>`:''}</div>`;
    const btn=document.createElement('button');
    btn.className='artifact-btn'+(equipped?' unequip-btn':'');
    if(forged){
      btn.textContent=equipped?'UNEQUIP':'EQUIP';
      if(!equipped&&(state.equippedArtifacts||[]).length>=2)btn.disabled=true;
      btn.onclick=()=>toggleArtifact(a.id);
    }else{
      const canForge=Object.entries(a.cost).every(([rid,amt])=>(state.resources[rid]||0)>=amt);
      btn.textContent='FORGE';btn.disabled=!canForge;btn.onclick=()=>forgeArtifact(a.id);
    }
    div.appendChild(btn);al.appendChild(div);
  });
}
function renderBasicCraft(){
  const bcl=$('basicCraftList');if(!bcl)return;bcl.innerHTML='';
  RECIPES.forEach(rec=>{
    const costItems=Object.entries(rec.cost).map(([rid,amt])=>{
      const r=RESOURCES.find(x=>x.id===rid);const has=(state.resources[rid]||0)>=amt;
      return`<span class="craft-cost-item ${has?'met':'unmet'}">${r?.emoji||rid}×${amt}</span>`;
    }).join('');
    const canCraft=Object.entries(rec.cost).every(([rid,amt])=>(state.resources[rid]||0)>=amt);
    const div=document.createElement('div');div.className='craft-card';
    div.innerHTML=`<div class="craft-icon">${rec.icon}</div><div class="craft-info"><div class="craft-name">${rec.name}</div><div class="craft-cost-row">${costItems}</div><div style="font-size:11px;color:var(--text-sub);margin-top:3px">${rec.desc}</div></div>`;
    const btn=document.createElement('button');btn.className='craft-btn';btn.textContent=canCraft?'CRAFT':'NEED';btn.disabled=!canCraft;
    btn.onclick=()=>doBasicCraft(rec.id);div.appendChild(btn);bcl.appendChild(div);
  });
}
function forgeArtifact(id){
  const a=ARTIFACTS.find(x=>x.id===id);if(!a)return;
  if(!Object.entries(a.cost).every(([rid,amt])=>(state.resources[rid]||0)>=amt)){showToast('Not enough resources!');return;}
  Object.entries(a.cost).forEach(([rid,amt])=>state.resources[rid]-=amt);
  state.forgedArtifacts[id]=true;SFX.jackpot();addSeasonPts(50);
  showToast(`⚗️ ${a.name} forged!`);renderCraft();checkAchievements();scheduleSave();
}
function toggleArtifact(id){
  const eq=state.equippedArtifacts||[];
  state.equippedArtifacts=eq.includes(id)?eq.filter(x=>x!==id):(eq.length>=2?(showToast('Max 2 artifacts!'),eq):[...eq,id]);
  recalcStats();renderCraft();updateHUD();SFX.buy();scheduleSave();
}
function doBasicCraft(id){
  const rec=RECIPES.find(r=>r.id===id);if(!rec)return;
  if(!Object.entries(rec.cost).every(([rid,amt])=>(state.resources[rid]||0)>=amt))return;
  Object.entries(rec.cost).forEach(([rid,amt])=>state.resources[rid]-=amt);
  if(rec.effect==='clickBoost60')state.activeBoost={type:'click',mult:3,end:Date.now()+60000};
  if(rec.effect==='autoBoost60') state.activeBoost={type:'auto', mult:5,end:Date.now()+60000};
  if(rec.effect==='megaBoost30') state.activeBoost={type:'mega', mult:10,end:Date.now()+30000};
  if(rec.effect==='luckyCoins'){state.coins+=5000;state.totalCoins+=5000;}
  if(state.activeBoost){$('boostPill').style.display='flex';$('boostPill').textContent=`${rec.icon} BOOSTED`;}
  state.achievements['craft1']=true;SFX.buy();showToast(`${t('craftSuccess')}: ${rec.name}`);
  renderCraft();updateHUD();checkAchievements();scheduleSave();
}

/* ══════════════════════════════════════
   GALAXY MAP
══════════════════════════════════════ */
function renderGalaxyMap(){
  const map=$('galaxyMap');if(!map)return;map.innerHTML='';
  PLANETS.forEach(p=>{
    const owned=!!state.ownedPlanets[p.id];
    const node=document.createElement('div');
    node.className='planet-node'+(owned?' owned':state.totalCoins<p.cost?' locked-planet':'');
    node.style.left=p.x+'%';node.style.top=p.y+'%';
    node.innerHTML=`<span class="planet-emoji">${p.emoji}</span><div class="planet-label">${p.name}</div><div class="planet-price">${owned?'✅ OWNED':p.cost===0?'FREE':'🪙'+fmt(p.cost)}</div>`;
    node.addEventListener('click',()=>buyPlanet(p));map.appendChild(node);
  });
}
function buyPlanet(p){
  if(state.ownedPlanets[p.id]){showToast('Already owned!');return;}
  if(p.cost>0&&state.coins<p.cost){showToast(t('notEnoughCoins'));return;}
  if(p.cost>0)state.coins-=p.cost;
  state.ownedPlanets[p.id]=true;recalcPlanetBonus();recalcStats();updateHUD();
  renderGalaxyMap();SFX.buy();addSeasonPts(30);showToast(`${p.emoji} ${p.name} unlocked!`);
  checkAchievements();scheduleSave();
}

/* ══════════════════════════════════════
   LORE
══════════════════════════════════════ */
function renderLorePanel(){
  // Lore entries shown in tech panel area — click to open modal
}
function openLore(idx){
  const ch=LORE[idx];if(!ch)return;
  $('loreIcon').textContent=ch.icon;$('loreTitle').textContent=ch.title;$('loreText').textContent=ch.text;
  $('loreModal').classList.remove('hidden');
  state.loreRead=Math.max(state.loreRead||0,idx+1);checkAchievements();scheduleSave();
}
$('loreClose').addEventListener('click',()=>$('loreModal').classList.add('hidden'));
function renderLoreChapters(){
  // Add lore button to tech panel
  const techEl=$('techTree');if(!techEl)return;
  const existing=document.getElementById('loreSection');if(existing)existing.remove();
  const sec=document.createElement('div');sec.id='loreSection';
  sec.innerHTML=`<div class="section-label" style="margin-top:20px" data-i18n="loreTitle">📖 LORE</div>`;
  LORE.forEach((ch,i)=>{
    const unlocked=state.totalCoins>=ch.unlock;
    const btn=document.createElement('button');
    btn.style.cssText='display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;cursor:pointer;text-align:left;transition:border-color .2s;font-family:var(--font-b)';
    btn.innerHTML=`<span style="font-size:20px">${ch.icon}</span><div><div style="font-family:var(--font-d);font-size:9px;letter-spacing:1px;color:var(--text);margin-bottom:2px">${ch.title}</div><div style="font-size:11px;color:var(--text-sub)">${unlocked?'Click to read':'Unlock at '+fmt(ch.unlock)+' coins'}</div></div>`;
    if(unlocked)btn.addEventListener('click',()=>openLore(i));
    else btn.style.opacity='.4';
    sec.appendChild(btn);
  });
  techEl.appendChild(sec);
}

/* ══════════════════════════════════════
   SEASONS
══════════════════════════════════════ */
function getWeekKey(){const d=new Date(),day=d.getDay(),diff=(day-5+7)%7,fri=new Date(d);fri.setDate(d.getDate()-diff);fri.setHours(0,0,0,0);return fri.toISOString().slice(0,10);}
function getNextFriday(){const d=new Date(),day=d.getDay(),diff=(5-day+7)%7||7,next=new Date(d);next.setDate(d.getDate()+diff);next.setHours(0,0,0,0);return next.getTime();}
function addSeasonPts(pts){state.seasonPoints=(state.seasonPoints||0)+pts;if(state.uid)fbAddSeasonPoints(state.uid,pts);}
function renderSeason(seasonData){
  if(!seasonData){
    const wk=getWeekKey(),wn=Math.floor(new Date(wk).getTime()/(7*24*3600*1000)),idx=wn%SEASONS.length;
    seasonData={index:idx,name:SEASONS[idx].name,weekKey:wk,endsAt:getNextFriday()};
  }
  state.currentSeason=seasonData;
  const s=SEASONS[seasonData.index];if(!s)return;
  document.body.className=`season-${seasonData.index}`;
  const si=$('seasonIndicator');if(si)si.textContent=s.emoji;
  const icon=$('seasonThemeIcon');if(icon)icon.textContent=s.emoji;
  const name=$('seasonName');if(name)name.textContent=s.emoji+' '+s.name;
  const ends=$('seasonEnds');
  if(ends&&seasonData.endsAt){const diff=seasonData.endsAt-Date.now(),days=Math.floor(diff/86400000),hrs=Math.floor((diff%86400000)/3600000);ends.textContent=`${t('seasonEnds')}: ${days}d ${hrs}h`;}
  const bonuses=$('seasonBonuses');
  if(bonuses)bonuses.innerHTML=Object.entries(s.bonus).map(([k,v])=>`<div class="season-bonus-chip">${k.toUpperCase()} ${typeof v==='number'?'+'+Math.round(v*100)+'%':'×'+v}</div>`).join('');
  renderSeasonReward(s,seasonData);
  fbGetSeasonLeaderboard(e=>renderLeaderboard(e.map(x=>({name:x.name,totalCoins:x.pts})),'seasonLeaderboard','🌟'));
  fbGetSeasonLeaderboard(e=>renderLeaderboard(e.map(x=>({name:x.name,totalCoins:x.pts})),'seasonLeaderboardStats','🌟'));
  recalcStats();updateHUD();
}
function renderSeasonReward(s,seasonData){
  const src=$('seasonRewardCard');if(!src)return;
  const wk=seasonData.weekKey,claimed=state.seasonRewardClaimed?.[wk],eligible=(state.seasonPoints||0)>=500;
  let rDesc='';
  if(s.reward.type==='skin')rDesc=`🎨 Exclusive: ${SKINS.find(x=>x.id===s.reward.id)?.name||s.reward.id} Skin`;
  if(s.reward.type==='resource')rDesc=`${RESOURCES.find(x=>x.id===s.reward.res)?.emoji||'✨'} ×${s.reward.amt} ${s.reward.res}`;
  if(s.reward.type==='coins')rDesc=`🪙 ${fmt(s.reward.amt)} coins`;
  src.innerHTML=`<div class="season-reward-card"><div class="season-reward-icon">${s.emoji}</div><div class="season-reward-name">${s.name} REWARD</div><div class="season-reward-desc">${rDesc}<br><br>Need 500 pts — You have: <strong style="color:var(--gold)">${state.seasonPoints||0}</strong></div>${!claimed&&eligible?`<button class="launch-btn" id="claimSeasonRewardBtn" style="margin-top:12px">🏆 ${t('claimSeason')}</button>`:claimed?'<p style="color:var(--green);font-family:var(--font-d);font-size:11px;letter-spacing:2px">✅ CLAIMED</p>':'<p style="color:var(--text-sub);font-size:12px">Earn more season points!</p>'}</div>`;
  const cb=$('claimSeasonRewardBtn');
  if(cb)cb.onclick=()=>{
    state.seasonRewardClaimed=state.seasonRewardClaimed||{};state.seasonRewardClaimed[wk]=true;
    if(s.reward.type==='skin'){state.unlockedSkins[s.reward.id]=true;showToast(`🎨 Season skin unlocked!`);}
    if(s.reward.type==='resource'){state.resources[s.reward.res]=(state.resources[s.reward.res]||0)+s.reward.amt;renderCraft();showToast(`✨ +${s.reward.amt} ${s.reward.res}!`);}
    if(s.reward.type==='coins'){state.coins+=s.reward.amt;state.totalCoins+=s.reward.amt;updateHUD();showToast(`🪙 +${fmt(s.reward.amt)} season coins!`);}
    if(state.uid)fbMarkSeasonRewardClaimed(state.uid,wk);
    state.achievements['season1']=true;SFX.season();checkAchievements();renderSeasonReward(s,seasonData);scheduleSave();
  };
}

/* ══════════════════════════════════════
   NPC TRADER
══════════════════════════════════════ */
let npcOfferData=null,npcTimer=null,npcTimeLeft=60;
function showNPCOffer(offerType){
  const offer=NPC_OFFERS[offerType];if(!offer)return;
  npcOfferData={...offer,type:offerType};
  $('npcAvatar').textContent=offer.npc;
  $('npcDesc').textContent=offer.desc;$('npcDealBox').textContent=offer.deal;
  npcTimeLeft=60;$('npcTimer').textContent=`Offer expires in ${npcTimeLeft}s`;
  $('npcModal').classList.remove('hidden');SFX.event();
  clearInterval(npcTimer);
  npcTimer=setInterval(()=>{npcTimeLeft--;$('npcTimer').textContent=`Offer expires in ${npcTimeLeft}s`;if(npcTimeLeft<=0){clearInterval(npcTimer);$('npcModal').classList.add('hidden');npcOfferData=null;}},1000);
}
$('acceptNpcBtn').addEventListener('click',()=>{
  if(!npcOfferData)return;clearInterval(npcTimer);
  const offer=npcOfferData;
  const tech=getTechBonus(),clan=getClanBonus();
  const price=Math.floor(offer.price*(1-(tech.npcDiscount+clan.npcDiscount||0)));
  if(state.coins<price){showToast(t('notEnoughCoins'));return;}
  state.coins-=price;
  if(offer.effect==='clickBoost7200')state.activeBoost={type:'click',mult:3,end:Date.now()+7200000};
  if(offer.effect.startsWith('resource_')){const pts=offer.effect.split('_');state.resources[pts[1]]=(state.resources[pts[1]]||0)+parseInt(pts[2]);renderCraft();}
  if(offer.effect==='mystery'){const r=Math.random();if(r<.33){state.coins+=10000;state.totalCoins+=10000;showToast('🎁 Mystery: +10K coins!');}else if(r<.66){state.resources.stardust+=3;renderCraft();showToast('🎁 Mystery: +3 Stardust!');}else{state.unlockedSkins['gem']=true;showToast('🎁 Mystery: Diamond skin!');}}
  if(offer.effect==='random_skin'){const locked=SKINS.filter(s=>!state.unlockedSkins[s.id]&&!s.craftOnly);if(locked.length){const sk=locked[Math.floor(Math.random()*locked.length)];state.unlockedSkins[sk.id]=true;showToast(`🎨 Got ${sk.name} skin!`);}else showToast('All skins owned! +1000 coins');}
  if(state.activeBoost){$('boostPill').style.display='flex';$('boostPill').textContent=`${offer.npc} BOOSTED`;}
  state.achievements['npc_deal']=true;updateHUD();checkAchievements();scheduleSave();
  SFX.buy();showToast(`${offer.npc} Deal accepted!`);$('npcModal').classList.add('hidden');npcOfferData=null;
});
$('declineNpcBtn').addEventListener('click',()=>{clearInterval(npcTimer);$('npcModal').classList.add('hidden');npcOfferData=null;});
function scheduleNPC(){setTimeout(()=>{if(!npcOfferData){const types=Object.keys(NPC_OFFERS);showNPCOffer(types[Math.floor(Math.random()*types.length)]);}scheduleNPC();},(15+Math.random()*25)*60000);}

/* ══════════════════════════════════════
   CLAN BASE
══════════════════════════════════════ */
$('createClanBtn')?.addEventListener('click',async()=>{
  const name=$('clanCreateInput').value.trim();
  if(name.length<2){showToast('Name too short');return;}
  if(state.coins<500){showToast(t('notEnoughCoins'));return;}
  const ok=await fbCreateClan(name,state.uid,state.username);
  if(ok){state.coins-=500;state.clanId=name;updateHUD();loadClanData();scheduleSave();showToast('⚔️ Clan created!');checkAchievements();}
  else showToast('Clan name taken!');
});
$('joinClanBtn')?.addEventListener('click',async()=>{
  const name=$('clanJoinInput').value.trim();if(!name)return;
  const ok=await fbJoinClan(name,state.uid,state.username);
  if(ok){state.clanId=name;loadClanData();scheduleSave();showToast('⚔️ Joined clan!');checkAchievements();}
  else showToast('Clan not found');
});
$('leaveClanBtn')?.addEventListener('click',()=>{
  if(!state.clanId)return;fbLeaveClan(state.clanId,state.uid);state.clanId=null;state.clanData=null;
  renderClanBase();scheduleSave();showToast('Left clan');
});
function loadClanData(){
  if(!state.clanId)return;
  fbGetClanData(state.clanId,data=>{state.clanData=data;recalcStats();renderClanBase();});
}
function renderClanBase(){
  const hasClan=!!state.clanId;
  $('noClanMsg').style.display=hasClan?'none':'block';
  $('clanBaseBuildings').style.display=hasClan?'block':'none';
  $('leaveClanBtn').style.display=hasClan?'inline-block':'none';
  if(!hasClan||!state.clanData)return;
  const ib=$('clanInfoBar');
  if(ib)ib.innerHTML=`<div class="clan-info-name">⚔️ ${escHTML(state.clanId)}</div><div class="clan-info-bank">${t('clanBank')}: 🪙${fmt(state.clanData.bank||0)}</div>`;
  const list=$('buildingsList');if(!list)return;list.innerHTML='';
  BUILDINGS.forEach(bd=>{
    const lvl=state.clanData?.buildings?.[bd.id]||0;
    const cost=Math.floor(bd.baseCost*Math.pow(bd.costMult,lvl));
    const maxed=lvl>=bd.maxLevel,bankHas=(state.clanData?.bank||0)>=cost;
    const div=document.createElement('div');div.className='building-card';
    div.innerHTML=`<div class="building-icon">${bd.icon}</div><div class="building-info"><div class="building-name">${bd.name}</div><div class="building-desc">${bd.desc}</div><div class="building-level">Level ${lvl}/${bd.maxLevel}</div></div>`;
    if(!maxed){
      const btn=document.createElement('button');btn.className='building-btn';btn.disabled=!bankHas;btn.textContent=`⬆️ ${fmt(cost)}🪙`;
      btn.onclick=()=>doUpgradeBuilding(bd.id,lvl+1,cost);
      div.appendChild(btn);
      const row=document.createElement('div');row.className='contribute-row';
      row.innerHTML=`<input class="contribute-input" type="number" placeholder="Contribute 🪙..." id="cont_${bd.id}" min="10"/>`;
      const cb=document.createElement('button');cb.className='small-btn';cb.textContent=t('contribute');
      cb.onclick=()=>doContribute(bd.id);row.appendChild(cb);div.appendChild(row);
    }else{const mx=document.createElement('span');mx.style.cssText='color:var(--gold);font-family:var(--font-d);font-size:10px;letter-spacing:1px';mx.textContent='✅ MAX';div.appendChild(mx);}
    list.appendChild(div);
  });
}
async function doContribute(bdId){
  if(!state.clanId)return;const input=$(`cont_${bdId}`),amt=parseInt(input?.value);
  if(!amt||amt<10){showToast('Min 10 coins');return;}if(state.coins<amt){showToast(t('notEnoughCoins'));return;}
  state.coins-=amt;await fbContributeToClan(state.clanId,state.uid,amt);
  updateHUD();SFX.buy();showToast(`💰 Contributed ${fmt(amt)}!`);if(input)input.value='';scheduleSave();
}
async function doUpgradeBuilding(bdId,newLvl,cost){
  if(!state.clanId)return;const ok=await fbUpgradeClanBuilding(state.clanId,bdId,newLvl,cost);
  if(ok){SFX.buy();showToast('🏗️ Building upgraded!');state.achievements['building1']=true;checkAchievements();scheduleSave();}
  else showToast('Not enough in clan bank!');
}

/* ══════════════════════════════════════
   ACHIEVEMENTS
══════════════════════════════════════ */
function checkAchievements(){
  ACHIEVEMENTS.forEach(a=>{
    if(state.achievements[a.id])return;
    try{if(a.check(state)){state.achievements[a.id]=true;showAchievement(a);SFX.ach();renderAchievements();scheduleSave();}}catch(e){}
  });
}
function showAchievement(a){
  const p=$('achPopup');$('achPopIcon').textContent=a.icon;$('achPopName').textContent=a.name;
  p.style.display='flex';p.classList.add('show');clearTimeout(p._t);
  p._t=setTimeout(()=>{p.classList.remove('show');setTimeout(()=>p.style.display='none',350);},3000);
}
function renderAchievements(){
  const el=$('achievementsList');if(!el)return;
  el.innerHTML=ACHIEVEMENTS.map(a=>{const u=!!state.achievements[a.id];return`<div class="ach-card ${u?'unlocked':'locked'}"><div class="ach-icon">${a.icon}</div><div class="ach-info"><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div><div>${u?'✅':'🔒'}</div></div>`;}).join('');
}

/* ══════════════════════════════════════
   DAILY QUESTS
══════════════════════════════════════ */
function buildDailyQuests(){const sc=1+state.prestigeLevel*.5;return[{id:'q_clicks',icon:'👆',name:'CLICK WARRIOR',target:Math.floor(200*sc),progress:0,reward:Math.floor(500*sc),claimed:false},{id:'q_coins',icon:'🪙',name:'COIN COLLECTOR',target:Math.floor(1000*sc),progress:0,reward:Math.floor(1000*sc),claimed:false},{id:'q_upgr',icon:'🔧',name:'TECH RUSH',target:Math.max(1,Math.floor(sc)),progress:0,reward:Math.floor(2000*sc),claimed:false}];}
function initDailyQuests(){const today=getTodayKey();if(!state.dailyQuests?.date||state.dailyQuests.date!==today){state.dailyQuests={date:today,quests:buildDailyQuests()};state.questClicksToday=state.questCoinsToday=state.questUpgradesToday=0;}renderQuests();}
function checkQuestProgress(){if(!state.dailyQuests?.quests)return;state.dailyQuests.quests.forEach(q=>{if(q.claimed)return;if(q.id==='q_clicks')q.progress=Math.min(q.target,state.questClicksToday);if(q.id==='q_coins')q.progress=Math.min(q.target,Math.floor(state.questCoinsToday));if(q.id==='q_upgr')q.progress=Math.min(q.target,state.questUpgradesToday);});renderQuests();}
function renderQuests(){
  const el=$('questsList');if(!el||!state.dailyQuests?.quests)return;
  el.innerHTML=state.dailyQuests.quests.map((q,i)=>{
    const pct=Math.min(100,(q.progress/q.target)*100),done=q.progress>=q.target;
    return`<div class="quest-card${done?' completed':''}"><div class="quest-header"><span class="quest-name">${q.icon} ${q.name}</span><span class="quest-reward">+${fmt(q.reward)}🪙</span></div><div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pct}%"></div></div><div class="quest-footer"><span class="quest-count">${fmt(q.progress)}/${fmt(q.target)}</span>${done&&!q.claimed?`<button class="quest-claim-btn" data-qi="${i}">${t('claim')}</button>`:q.claimed?`<span class="quest-claimed">${t('claimed')}</span>`:''}</div></div>`;
  }).join('');
  el.querySelectorAll('.quest-claim-btn').forEach(btn=>btn.addEventListener('click',()=>{const q=state.dailyQuests.quests[+btn.dataset.qi];if(!q||q.claimed||q.progress<q.target)return;q.claimed=true;state.coins+=q.reward;state.totalCoins+=q.reward;addSeasonPts(25);renderQuests();updateHUD();SFX.ach();showToast(`🎉 Quest! +${fmt(q.reward)}`);scheduleSave();}));
}

/* ══════════════════════════════════════
   RANDOM EVENTS
══════════════════════════════════════ */
let eventActive=false,eventBarInt=null;
function scheduleEvent(){setTimeout(triggerEvent,(3+Math.random()*7)*60000);}
function triggerEvent(ev){
  if(eventActive){scheduleEvent();return;}
  if(!ev||typeof ev!=='object')ev=EVENTS[Math.floor(Math.random()*EVENTS.length)];
  const msg=ev.apply(state);
  eventActive=true;$('eventIcon').textContent=ev.icon;$('eventText').textContent=ev.name+' '+msg;
  $('eventBanner').style.display='flex';SFX.event();showToast(`${ev.icon} ${ev.name} — ${msg}`);
  addEventLog(ev.icon,ev.name,msg);addSeasonPts(10);
  const season=getSeasonBonus(),tech=getTechBonus(),clan=getClanBonus();
  const dropChance=1+tech.resources+(clan.resources||0)+((season.resources||1)-1);
  if(ev.resource&&Math.random()<0.7*dropChance){state.resources[ev.resource]=(state.resources[ev.resource]||0)+1;showToast(`+1 ${RESOURCES.find(r=>r.id===ev.resource)?.emoji} resource!`);renderCraft();}
  if(ev.duration>0){
    $('boostPill').style.display='flex';$('boostPill').textContent=`${ev.icon} BOOSTED`;
    let rem=ev.duration;$('eventBar').style.width='100%';$('eventTime').textContent=rem+'s';
    clearInterval(eventBarInt);eventBarInt=setInterval(()=>{rem--;$('eventBar').style.width=(rem/ev.duration*100)+'%';$('eventTime').textContent=rem+'s';if(rem<=0){clearInterval(eventBarInt);endEvent();}},1000);
  }else{updateHUD();setTimeout(endEvent,3000);}
  scheduleEvent();
}
function endEvent(){eventActive=false;$('eventBanner').style.display='none';$('boostPill').style.display='none';state.activeBoost=null;updateHUD();}
function addEventLog(icon,name,msg){
  state.eventsLog.unshift({icon,name,msg,time:new Date().toLocaleTimeString()});
  if(state.eventsLog.length>10)state.eventsLog.pop();
  const el=$('eventsLog');if(!el)return;
  el.innerHTML=state.eventsLog.map(e=>`<div class="event-log-item">${e.icon} <strong>${e.name}</strong> — ${escHTML(e.msg)} <span style="margin-left:auto;font-size:10px;color:var(--text-sub)">${e.time}</span></div>`).join('');
}

/* ══════════════════════════════════════
   RAID
══════════════════════════════════════ */
let raidData=null;
const RAID_BOSSES=[{emoji:'🌍',name:'Terra Boss',hpBase:100000},{emoji:'🔴',name:'Mars Titan',hpBase:500000},{emoji:'🪐',name:'Saturn Lord',hpBase:2000000},{emoji:'🌌',name:'Nebula Giant',hpBase:10000000}];
function initRaid(){const boss=RAID_BOSSES[Math.floor(Date.now()/(24*3600000))%RAID_BOSSES.length];fbInitRaid(boss.hpBase,boss.emoji,boss.name);fbOnRaid(data=>{raidData=data;updateRaidUI();});}
function updateRaidUI(){
  if(!raidData)return;
  const pct=Math.max(0,100-(raidData.damage/raidData.hp*100));
  $('raidBoss').textContent=raidData.bossEmoji||'🌍';
  $('raidHpBar').innerHTML=`<div class="raid-hp-bar-fill" style="width:${100-pct}%"></div>`;
  $('raidHpText').textContent=`${fmt(raidData.hp-raidData.damage)} / ${fmt(raidData.hp)} HP`;
  $('raidStrip').style.display=raidData.status==='active'?'flex':'none';
  if(raidData.status==='active'){
    $('raidInfo').innerHTML=`<p>Boss: <strong style="color:var(--red)">${escHTML(raidData.bossName||'Unknown')}</strong></p><p>Contributors: <strong>${Object.keys(raidData.contributors||{}).length}</strong></p>`;
    $('raidAttackBtn').style.display='block';$('raidMyDmg').style.display='block';$('raidDmgVal').textContent=fmt(state.raidMyDamage);
    $('raidStripText').textContent=`${raidData.bossEmoji} ${raidData.bossName} — ${fmt(raidData.hp-raidData.damage)} HP`;$('raidStripBar').style.width=pct+'%';
  }else if(raidData.status==='defeated'){
    $('raidInfo').innerHTML=`<p style="color:var(--green);font-family:var(--font-d)">🎉 RAID COMPLETE!</p>`;
    $('raidAttackBtn').style.display='none';
    const myDmg=raidData.contributors?.[state.uid]||0,claimed=raidData.claimed?.[state.uid];
    if(myDmg>0&&!claimed&&!raidData._popupShown){raidData._popupShown=true;showRaidReward(myDmg,raidData.hp);}
  }
  renderRaidLeaderboard();
}
function showRaidReward(myDmg,totalHp){
  const share=myDmg/totalHp,coins=Math.floor(share*50000+1000);
  $('raidRewardCoins').textContent='+'+fmt(coins)+' 🪙';
  $('raidRewardRes').textContent=myDmg>totalHp*.1?'1× Void Crystal 🔷':'1× Stardust ✨';
  $('raidRewardModal').classList.remove('hidden');
  $('claimRaidBtn').onclick=()=>{
    state.coins+=coins;state.totalCoins+=coins;
    if(myDmg>totalHp*.1)state.resources['voidcrystal']=(state.resources['voidcrystal']||0)+1;
    else state.resources['stardust']=(state.resources['stardust']||0)+1;
    fbMarkRaidClaimed(state.uid);addSeasonPts(50);
    $('raidRewardModal').classList.add('hidden');updateHUD();renderCraft();SFX.jackpot();showToast('🎉 Raid reward!');
    state.achievements['raid1']=true;checkAchievements();scheduleSave();
  };
}
function renderRaidLeaderboard(){
  const el=$('raidLeaderboard');if(!el||!raidData?.contributors)return;
  const entries=Object.entries(raidData.contributors).map(([k,v])=>({key:k,dmg:v})).sort((a,b)=>b.dmg-a.dmg).slice(0,10);
  if(!entries.length){el.innerHTML='<div class="lb-loading">No attackers</div>';return;}
  const m=['🥇','🥈','🥉'];
  el.innerHTML=entries.map((e,i)=>`<div class="lb-row${e.key===state.uid?' me':''}"><div class="lb-rank${i<3?' r'+(i+1):''}">${m[i]||i+1}</div><div class="lb-name">${escHTML(e.key.slice(0,16))}</div><div class="lb-score">${fmt(e.dmg)} DMG</div></div>`).join('');
}
$('raidAttackBtn').addEventListener('click',()=>{
  if(!raidData||raidData.status!=='active')return;
  const season=getSeasonBonus();
  const dmg=Math.floor(effectiveCPC()*20+effectiveCPS()*2)*(1+(season.raid||0));
  state.raidMyDamage+=dmg;
  fbDealRaidDamage(state.uid,dmg).then(ok=>{if(ok){SFX.raid();$('raidBoss').classList.add('shake');setTimeout(()=>$('raidBoss').classList.remove('shake'),300);}});
});
$('raidJoinBtn').addEventListener('click',()=>switchPanel('panelRaid'));

/* ══════════════════════════════════════
   SLOTS
══════════════════════════════════════ */
let slotsSpinning=false,betAmount=50,betIdx=0;
const BET_STEPS=[50,100,250,500,1000,2500,5000];
function initSlots(){
  const pt=document.getElementById('payTable');
  if(!pt)return;
  $('betDown').addEventListener('click',()=>{betIdx=Math.max(0,betIdx-1);$('betAmount').textContent=BET_STEPS[betIdx];});
  $('betUp').addEventListener('click',()=>{betIdx=Math.min(BET_STEPS.length-1,betIdx+1);$('betAmount').textContent=BET_STEPS[betIdx];});
  $('slotsSpinBtn').addEventListener('click',doSpin);
}
function doSpin(){
  if(slotsSpinning)return;const bet=BET_STEPS[betIdx];
  if(state.coins<bet){showToast(t('notEnoughCoins'));return;}
  state.coins-=bet;updateHUD();slotsSpinning=true;$('slotsSpinBtn').disabled=true;
  $('slotsResult').textContent='Spinning…';$('slotsResult').className='slots-result';
  ['ri0','ri1','ri2'].forEach(id=>document.getElementById(id)?.parentElement.classList.add('spinning'));
  SFX.slots();
  const results=Array.from({length:3},()=>SLOTS_SYMBOLS[Math.floor(Math.random()*SLOTS_SYMBOLS.length)]);
  [0,1,2].forEach(i=>setTimeout(()=>{
    const ri=document.getElementById('ri'+i);if(ri){ri.parentElement.classList.remove('spinning');ri.textContent=results[i];}
    if(i===2)setTimeout(()=>evalSlots(results,bet),200);
  },300+i*350));
}
function evalSlots(results,bet){
  slotsSpinning=false;$('slotsSpinBtn').disabled=false;
  let mult=0,label='';
  for(const p of SLOTS_PAYTABLE){if(p.syms&&results.every((r,i)=>r===p.syms[i])){mult=p.mult;label=p.label;break;}}
  if(!mult&&(results[0]===results[1]||results[1]===results[2]||results[0]===results[2])){mult=2;label='ANY PAIR';}
  if(mult>0){
    const won=bet*mult;state.coins+=won;state.totalCoins+=won;updateHUD();
    $('slotsResult').textContent=`${label}! +${fmt(won)}🪙 (×${mult})`;$('slotsResult').className='slots-result win';
    if(mult>=500){SFX.jackpot();state.achievements['slots_win']=true;checkAchievements();}else SFX.buy();
    showToast(`🎰 ${label}! +${fmt(won)}`);addSeasonPts(5);
  }else{$('slotsResult').textContent=`No match. Lost ${fmt(bet)}.`;$('slotsResult').className='slots-result loss';}
  scheduleSave();
}

/* ══════════════════════════════════════
   SHOOTER
══════════════════════════════════════ */
const sc=$('shooterCanvas'),sCtx=sc&&sc.getContext('2d');
let shooterState={active:false,meteors:[],bullets:[],player:{x:150,y:230,hp:3},score:0,timeLeft:0};
function initShooter(){
  if(!sc)return;
  sc.addEventListener('click',e=>{if(!shooterState.active)return;const r=sc.getBoundingClientRect(),sx=sc.width/sc.clientWidth;shooterState.bullets.push({x:shooterState.player.x,y:shooterState.player.y-10,vy:-6});playTone(800,'square',.05,.1);});
  sc.addEventListener('mousemove',e=>{if(!shooterState.active)return;const r=sc.getBoundingClientRect(),sx=sc.width/sc.clientWidth;shooterState.player.x=(e.clientX-r.left)*sx;});
  sc.addEventListener('touchmove',e=>{if(!shooterState.active)return;e.preventDefault();const r=sc.getBoundingClientRect(),sx=sc.width/sc.clientWidth;shooterState.player.x=(e.touches[0].clientX-r.left)*sx;},{passive:false});
  $('shooterStartBtn').addEventListener('click',startShooter);
  drawShooterIdle();
}
function startShooter(){
  if(state.coins<50){showToast('Need 50 coins!');return;}
  state.coins-=50;updateHUD();
  shooterState={active:true,meteors:[],bullets:[],player:{x:150,y:230,hp:3},score:0,timeLeft:10,spawnInt:null,interval:null,animFrame:null};
  $('shooterStartBtn').style.display='none';$('shooterHP').textContent=3;$('shooterScore').textContent=0;$('shooterTime').textContent='10s';
  shooterState.spawnInt=setInterval(()=>{if(shooterState.active)shooterState.meteors.push({x:20+Math.random()*260,y:-20,vy:1.5+Math.random()*2,r:8+Math.random()*12});},400);
  shooterState.interval=setInterval(()=>{shooterState.timeLeft--;$('shooterTime').textContent=shooterState.timeLeft+'s';if(shooterState.timeLeft<=0)endShooter();},1000);
  function loop(){if(!shooterState.active)return;updateShooter();drawShooter();shooterState.animFrame=requestAnimationFrame(loop);}loop();
}
function updateShooter(){
  const s=shooterState;s.bullets=s.bullets.filter(b=>{b.y+=b.vy;return b.y>0;});
  s.meteors=s.meteors.filter(m=>{
    m.y+=m.vy;if(Math.abs(m.x-s.player.x)<16&&Math.abs(m.y-s.player.y)<16){s.player.hp--;$('shooterHP').textContent=s.player.hp;playTone(200,'sawtooth',.15,.3);if(s.player.hp<=0){endShooter();return false;}return false;}
    if(m.y>280)return false;
    let hit=false;s.bullets=s.bullets.filter(b=>{if(!hit&&Math.abs(b.x-m.x)<m.r+4&&Math.abs(b.y-m.y)<m.r+4){hit=true;return false;}return true;});
    if(hit){s.score++;$('shooterScore').textContent=s.score;playTone(440,'sine',.05,.15);return false;}return true;
  });
}
function drawShooter(){if(!sCtx)return;const W=sc.width,H=sc.height;sCtx.fillStyle='#000010';sCtx.fillRect(0,0,W,H);sCtx.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<30;i++){sCtx.beginPath();sCtx.arc((i*97)%W,(i*53)%H,1,0,Math.PI*2);sCtx.fill();}const s=shooterState;sCtx.fillStyle='#00d4ff';s.bullets.forEach(b=>{sCtx.beginPath();sCtx.arc(b.x,b.y,3,0,Math.PI*2);sCtx.fill();});s.meteors.forEach(m=>{sCtx.font=Math.round(m.r*2)+'px serif';sCtx.textAlign='center';sCtx.textBaseline='middle';sCtx.fillText('☄️',m.x,m.y);});sCtx.font='24px serif';sCtx.textAlign='center';sCtx.textBaseline='middle';sCtx.fillText('🚀',s.player.x,s.player.y);}
function drawShooterIdle(){if(!sCtx)return;const W=sc.width,H=sc.height;sCtx.fillStyle='#000010';sCtx.fillRect(0,0,W,H);sCtx.fillStyle='rgba(0,212,255,.4)';sCtx.font='12px Orbitron';sCtx.textAlign='center';sCtx.fillText('PRESS PLAY',W/2,H/2);sCtx.font='10px Orbitron';sCtx.fillStyle='rgba(220,232,255,.3)';sCtx.fillText('Move: mouse · Shoot: click/tap',W/2,H/2+24);}
function endShooter(){const s=shooterState;s.active=false;clearInterval(s.spawnInt);clearInterval(s.interval);cancelAnimationFrame(s.animFrame);const reward=s.score*20;state.coins+=reward;state.totalCoins+=reward;updateHUD();$('shooterStartBtn').style.display='block';$('shooterStartBtn').textContent='🚀 PLAY AGAIN (50🪙)';$('shooterTime').textContent='Done';SFX.buy();showToast(`🚀 Score ${s.score} → +${fmt(reward)} coins!`);drawShooterIdle();scheduleSave();}

/* ══════════════════════════════════════
   SKINS
══════════════════════════════════════ */
$('skinBtn').addEventListener('click',()=>{buildSkinsGrid();$('skinModal').classList.remove('hidden');});
$('skinClose').addEventListener('click',()=>$('skinModal').classList.add('hidden'));
function buildSkinsGrid(){
  $('skinsGrid').innerHTML=SKINS.map(s=>{const owned=!!state.unlockedSkins[s.id],sel=state.activeSkin===s.id;return`<div class="skin-option${sel?' selected':''}${!owned&&(s.craftOnly)?'  locked-skin':''}" data-sid="${s.id}"><div class="skin-emoji">${s.emoji}</div><div class="skin-name">${s.name}</div><div class="skin-cost">${owned?(sel?'✅ ON':'SELECT'):s.craftOnly?'CRAFT':'🪙'+fmt(s.cost)}</div></div>`;}).join('');
  $('skinsGrid').querySelectorAll('.skin-option').forEach(el=>{
    el.addEventListener('click',()=>{
      const sk=SKINS.find(x=>x.id===el.dataset.sid);if(!sk)return;
      if(state.unlockedSkins[sk.id]){state.activeSkin=sk.id;coinFace.textContent=sk.emoji;buildSkinsGrid();scheduleSave();SFX.buy();}
      else if(!sk.craftOnly&&state.coins>=sk.cost){state.coins-=sk.cost;state.unlockedSkins[sk.id]=true;state.activeSkin=sk.id;coinFace.textContent=sk.emoji;buildSkinsGrid();updateHUD();scheduleSave();SFX.buy();showToast(`🎨 ${sk.name} unlocked!`);}
      else if(sk.craftOnly)showToast('Craft this in Alchemy!');
      else showToast(`Need ${fmt(sk.cost)} coins`);
    });
  });
}

/* ══════════════════════════════════════
   CHAT
══════════════════════════════════════ */
let lastChatTime=0,chatVisible=false;
$('chatSendBtn').addEventListener('click',sendChat);
$('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendChat();});
function sendChat(){const input=$('chatInput'),text=input.value.trim();if(!text)return;if(Date.now()-lastChatTime<2500){showToast(t('slowDown'));return;}lastChatTime=Date.now();fbSendChat(state.username,text,state.uid);input.value='';SFX.chat();}
function renderChat(msgs){
  const box=$('chatMessages');if(!box)return;
  if(!msgs?.length){box.innerHTML='<div class="chat-empty">No messages yet…</div>';return;}
  const atBot=box.scrollHeight-box.scrollTop<=box.clientHeight+40;
  box.innerHTML=msgs.map(m=>`<div class="chat-msg${m.name===state.username?' mine':''}"><div class="chat-name${m.name===state.username?' me':''}">${escHTML(m.name)}</div><div class="chat-text">${escHTML(m.text)}</div></div>`).join('');
  if(atBot)box.scrollTop=box.scrollHeight;
  if(!chatVisible)$('socialNotifDot').style.display='block';
}

/* ══════════════════════════════════════
   ONLINE PLAYERS
══════════════════════════════════════ */
function renderOnlinePlayers(list,elId='onlinePlayersSocial'){
  const el=$(elId);if(!el)return;
  const others=list.filter(p=>p.key!==state.uid);
  if(!others.length){el.innerHTML='<div class="lb-loading">No other pilots online</div>';return;}
  el.innerHTML=others.map(p=>`<div class="pilot-row"><span class="pilot-row-name">👨‍🚀 ${escHTML(p.name)}</span><div class="pilot-row-btns"><button class="pilot-action-btn duel" data-key="${escHTML(p.key)}" data-name="${escHTML(p.name)}">⚔️</button><button class="pilot-action-btn" data-gk="${escHTML(p.key)}" data-gn="${escHTML(p.name)}">🎁</button></div></div>`).join('');
  el.querySelectorAll('.pilot-action-btn.duel').forEach(b=>b.addEventListener('click',()=>startDuel(b.dataset.key,b.dataset.name)));
  el.querySelectorAll('[data-gk]').forEach(b=>b.addEventListener('click',()=>openGiftModal(b.dataset.gk,b.dataset.gn)));
}

/* ══════════════════════════════════════
   LEADERBOARD
══════════════════════════════════════ */
function renderLeaderboard(entries,elId='leaderboard',unit=''){
  const el=$(elId);if(!el)return;
  if(!entries?.length){el.innerHTML='<div class="lb-loading">No pilots yet!</div>';return;}
  const m=['🥇','🥈','🥉'];
  el.innerHTML=entries.map((e,i)=>`<div class="lb-row${e.name===state.username?' me':''}"><div class="lb-rank${i<3?' r'+(i+1):''}">${m[i]||i+1}</div><div class="lb-name">${escHTML(e.name)}</div><div class="lb-score">${fmt(e.totalCoins)}${unit}</div></div>`).join('');
}

/* ══════════════════════════════════════
   DUELS
══════════════════════════════════════ */
let activeDuelKey=null,duelMyScore=0,duelTimer=null;
$('acceptDuelBtn').addEventListener('click',acceptDuel);
$('declineDuelBtn').addEventListener('click',()=>$('duelModal').classList.add('hidden'));
function startDuel(targetUID,targetName){const prize=Math.max(100,Math.floor(state.coins*.05));const key=fbChallengeDuel(state.username,targetUID,prize);if(!key){showToast('Firebase not connected');return;}activeDuelKey=key;fbListenDuel(key,handleDuelUpdate);showToast(`⚔️ Challenge sent to ${targetName}!`);}
function acceptDuel(){if(!activeDuelKey)return;fbAcceptDuel(activeDuelKey);$('duelModal').classList.add('hidden');startDuelUI();}
function handleDuelUpdate(data){if(!data)return;if(data.status==='active')startDuelUI();if(data.scores){const oppScore=Object.entries(data.scores).filter(([k])=>k!==state.uid).map(([,v])=>v)[0]||0;$('duelOppScore').textContent=oppScore;}if(data.status==='finished')endDuel(data);}
function startDuelUI(){duelMyScore=0;$('duelMyName').textContent=state.username;$('duelMyScore').textContent='0';$('duelOppScore').textContent='0';$('duelActiveModal').classList.remove('hidden');let sec=30;$('duelCountdown').textContent=sec;clearInterval(duelTimer);duelTimer=setInterval(()=>{sec--;$('duelCountdown').textContent=sec;if(sec<=0){clearInterval(duelTimer);fbFinishDuel(activeDuelKey);}},1000);}
$('duelCoinBtn').addEventListener('click',()=>{if(!activeDuelKey)return;duelMyScore++;$('duelMyScore').textContent=duelMyScore;SFX.click();fbUpdateDuelScore(activeDuelKey,state.uid,duelMyScore);});
$('duelCoinBtn').addEventListener('touchend',e=>{e.preventDefault();if(!activeDuelKey)return;duelMyScore++;$('duelMyScore').textContent=duelMyScore;SFX.click();fbUpdateDuelScore(activeDuelKey,state.uid,duelMyScore);},{passive:false});
function endDuel(data){clearInterval(duelTimer);$('duelActiveModal').classList.add('hidden');if(!data?.scores)return;const myScore=data.scores[state.uid]||0,oppScore=Object.entries(data.scores).filter(([k])=>k!==state.uid).map(([,v])=>v)[0]||0;if(myScore>oppScore){const prize=data.prize||500;state.coins+=prize;state.totalCoins+=prize;state.achievements['won_duel']=true;updateHUD();SFX.ach();showToast(`🏆 WON! +${fmt(prize)}`);checkAchievements();}else showToast(`💀 Lost (${myScore} vs ${oppScore})`);activeDuelKey=null;scheduleSave();}

/* ══════════════════════════════════════
   GIFTS
══════════════════════════════════════ */
let giftTargetUID='';
function openGiftModal(uid,name){giftTargetUID=uid;$('giftTarget').textContent=name;$('giftBalance').textContent=`Balance: ${fmt(state.coins)} 🪙`;$('giftAmount').value='';$('giftModal').classList.remove('hidden');}
$('giftClose').addEventListener('click',()=>$('giftModal').classList.add('hidden'));
$('confirmGiftBtn').addEventListener('click',async()=>{const amt=parseInt($('giftAmount').value);if(!amt||amt<10){showToast('Min 10 coins');return;}if(amt>state.coins){showToast(t('notEnoughCoins'));return;}state.coins-=amt;updateHUD();const ok=await fbSendGift(state.username,giftTargetUID,amt);$('giftModal').classList.add('hidden');if(ok){state.achievements['sent_gift']=true;SFX.gift();showToast(`🎁 Sent ${fmt(amt)} coins!`);checkAchievements();scheduleSave();}else{state.coins+=amt;updateHUD();showToast('Failed to send gift');}});
function handleNotification(data){
  if(!data)return;
  if(data.type==='gift'){state.coins+=data.amount||0;state.totalCoins+=data.amount||0;updateHUD();SFX.gift();showToast(`🎁 ${data.from} sent ${fmt(data.amount)} coins!`);scheduleSave();}
  if(data.type==='duel'){activeDuelKey=data.duelKey;$('duelChallenger').textContent=data.from;$('duelPrize').textContent=fmt(data.prize||500);$('duelModal').classList.remove('hidden');SFX.event();fbListenDuel(data.duelKey,handleDuelUpdate);}
}

/* ══════════════════════════════════════
   STATS GRAPH
══════════════════════════════════════ */
const gCanvas=$('statsGraph'),gCtx=gCanvas&&gCanvas.getContext('2d');
function initGraph(){if(!gCanvas)return;resizeGraph();window.addEventListener('resize',resizeGraph);setInterval(()=>{const e=state.totalCoins-state.lastGraphCoins;state.lastGraphCoins=state.totalCoins;state.coinsHistory.push({t:Date.now(),v:Math.max(0,e)});if(state.coinsHistory.length>20)state.coinsHistory.shift();},30000);}
function resizeGraph(){if(!gCanvas)return;const w=gCanvas.parentElement.clientWidth;gCanvas.width=w*(window.devicePixelRatio||1);gCanvas.height=140*(window.devicePixelRatio||1);gCanvas.style.width=w+'px';gCanvas.style.height='140px';drawGraph();}
function drawGraph(){
  if(!gCtx)return;const W=gCanvas.width,H=gCanvas.height,dpr=window.devicePixelRatio||1;gCtx.clearRect(0,0,W,H);const data=state.coinsHistory;
  if(data.length<2){gCtx.fillStyle='rgba(220,232,255,.3)';gCtx.font=`${12*dpr}px Orbitron`;gCtx.textAlign='center';gCtx.fillText('Collecting data…',W/2,H/2);return;}
  const maxV=Math.max(1,...data.map(d=>d.v)),bars=data.length,bW=(W-(bars+1)*2*dpr)/bars,padB=24*dpr,padT=12*dpr,chartH=H-padB-padT;
  gCtx.strokeStyle='rgba(0,212,255,.1)';gCtx.lineWidth=dpr;
  for(let i=0;i<=4;i++){const y=padT+chartH/4*i;gCtx.beginPath();gCtx.moveTo(0,y);gCtx.lineTo(W,y);gCtx.stroke();}
  data.forEach((d,i)=>{const h=(d.v/maxV)*chartH,x=2*dpr+i*(bW+2*dpr),y=padT+chartH-h;const g=gCtx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'rgba(0,212,255,.85)');g.addColorStop(1,'rgba(180,0,255,.5)');gCtx.fillStyle=g;gCtx.beginPath();gCtx.roundRect(x,y,bW,h,[3*dpr,3*dpr,0,0]);gCtx.fill();});
}
function renderDetailedStats(){
  const el=$('detailedStats');if(!el)return;
  const tech=getTechBonus(),rows=[['PRESTIGE',state.prestigeLevel],['TOTAL CLICKS',fmt(state.totalClicks)],['BONUS MULT','×'+prestigeMult().toFixed(1)],['PLANETS',`${Object.keys(state.ownedPlanets||{}).length}/${PLANETS.length}`],['ACHIEVEMENTS',`${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}`],['RESEARCHED',`${Object.keys(state.techResearched||{}).length}/${TECH_BRANCHES.reduce((a,b)=>a+b.nodes.length,0)}`],['ARTIFACTS',`${(state.equippedArtifacts||[]).length}/2 equipped`],['CLAN',state.clanId||'None'],['SEASON PTS',fmt(state.seasonPoints||0)],['SKIN',SKINS.find(s=>s.id===state.activeSkin)?.emoji+' '+(SKINS.find(s=>s.id===state.activeSkin)?.name||'—')]];
  el.innerHTML=rows.map(([k,v])=>`<div class="detail-row"><span class="detail-key">${k}</span><span class="detail-val">${escHTML(String(v))}</span></div>`).join('');
}

/* ══════════════════════════════════════
   TOAST & TABS
══════════════════════════════════════ */
let toastT=null;
function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400);}
let currentPanel='panelMine';
function switchPanel(id){
  document.querySelectorAll('.g-panel').forEach(p=>p.classList.toggle('active',p.id===id));
  document.querySelectorAll('.mtab').forEach(tab=>tab.classList.toggle('active',tab.dataset.panel===id));
  currentPanel=id;chatVisible=id==='panelSocial';
  if(chatVisible)$('socialNotifDot').style.display='none';
  if(id==='panelStats'){drawGraph();renderDetailedStats();}
  if(id==='panelTech'){renderTechTree();renderGalaxyMap();renderLoreChapters();}
  if(id==='panelAlchemy'){renderCraft();}
  if(id==='panelClan'){renderClanBase();}
  if(id==='panelRaid')updateRaidUI();
  if(id==='panelSeason')renderSeason(state.currentSeason);
}
function initTabs(){document.querySelectorAll('.mtab').forEach(tab=>tab.addEventListener('click',()=>switchPanel(tab.dataset.panel)));switchPanel('panelMine');}

/* ══════════════════════════════════════
   SOUND TOGGLE / LANG / PWA
══════════════════════════════════════ */
$('soundToggle').addEventListener('click',()=>{state.soundEnabled=!state.soundEnabled;$('soundToggle').textContent=state.soundEnabled?'🔊':'🔇';$('soundToggle').classList.toggle('active',!state.soundEnabled);});
$('langToggle').addEventListener('click',()=>{const next=currentLang==='en'?'ru':'en';setLang(next);$('langToggle').textContent=next.toUpperCase();});
$('notifBtn').addEventListener('click',async()=>{const ok=await fbRequestPush();if(ok){showToast('🔔 Notifications enabled!');$('notifBtn').classList.add('active');}else showToast('Notifications not allowed');});

/* ══════════════════════════════════════
   SAVE
══════════════════════════════════════ */
let saveTimer=null;
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(doSave,6000);}
function doSave(){
  if(!state.uid&&!state.username)return;
  fbSavePlayer(state.uid||sanitiseKey(state.username),{
    name:state.username,coins:state.coins,totalCoins:state.totalCoins,
    coinsPerClick:state.coinsPerClick,coinsPerSecond:state.coinsPerSecond,
    upgradeLevels:state.upgradeLevels,prestigeLevel:state.prestigeLevel,
    achievements:state.achievements,dailyQuests:state.dailyQuests,totalClicks:state.totalClicks,
    clanId:state.clanId,activeSkin:state.activeSkin,unlockedSkins:state.unlockedSkins,
    resources:state.resources,ownedPlanets:state.ownedPlanets,
    techResearched:state.techResearched,equippedArtifacts:state.equippedArtifacts,forgedArtifacts:state.forgedArtifacts,
    seasonPoints:state.seasonPoints,seasonRewardClaimed:state.seasonRewardClaimed,
    loreRead:state.loreRead,
  });
}
setInterval(doSave,30000);

/* ══════════════════════════════════════
   STAR CANVAS
══════════════════════════════════════ */
function initStarCanvas(){
  const canvas=$('starCanvas'),ctx=canvas.getContext('2d');let stars=[],W,H;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;stars=[];const n=Math.floor(W*H/3500);for(let i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.3+.2,a:Math.random(),da:(Math.random()-.5)*.007,vx:(Math.random()-.5)*.03,vy:Math.random()*.04+.01,hue:Math.random()<.15?(Math.random()<.5?200:280):0,sat:Math.random()<.15?100:0});}
  function draw(){ctx.clearRect(0,0,W,H);stars.forEach(s=>{s.a+=s.da;if(s.a<=0||s.a>=1)s.da*=-1;s.x+=s.vx;s.y+=s.vy;if(s.y>H)s.y=0;if(s.x<0)s.x=W;if(s.x>W)s.x=0;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=s.sat?`hsla(${s.hue},${s.sat}%,80%,${s.a})`:`rgba(200,220,255,${s.a})`;ctx.fill();});requestAnimationFrame(draw);}
  window.addEventListener('resize',resize);resize();draw();
}

/* ══════════════════════════════════════
   SERVICE WORKER
══════════════════════════════════════ */
function registerSW(){if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').then(r=>console.log('✅ SW',r.scope)).catch(e=>console.warn('SW:',e));}

/* ══════════════════════════════════════
   AUTH + START GAME
══════════════════════════════════════ */
function sanitiseKey(n){return(n||'').trim().replace(/[.#$[\]/\s]/g,'_').slice(0,30)||'anon';}

async function startGame(uid, username){
  state.uid=uid;state.username=username;
  $('headerUsername').textContent=username.length>13?username.slice(0,13)+'…':username;
  $('authModal').style.display='none';$('gameWrap').style.display='flex';
  setupParticleCanvas();buildUpgradeCards('upgradesListDesktop');buildUpgradeCards('upgradesListMobile');
  initTabs();initGraph();initSlots();initShooter();

  const data=await fbLoadPlayer(uid);
  if(data){
    Object.assign(state,{
      coins:data.coins||0,totalCoins:data.totalCoins||0,upgradeLevels:data.upgradeLevels||{},
      prestigeLevel:data.prestigeLevel||0,achievements:data.achievements||{},totalClicks:data.totalClicks||0,
      clanId:data.clanId||null,activeSkin:data.activeSkin||'default',unlockedSkins:data.unlockedSkins||{default:true},
      resources:data.resources||{stardust:0,nebcore:0,voidcrystal:0},ownedPlanets:data.ownedPlanets||{},
      techResearched:data.techResearched||{},equippedArtifacts:data.equippedArtifacts||[],forgedArtifacts:data.forgedArtifacts||{},
      seasonPoints:data.seasonPoints||0,seasonRewardClaimed:data.seasonRewardClaimed||{},
      loreRead:data.loreRead||0,
    });
    if(data.dailyQuests)state.dailyQuests=data.dailyQuests;
    const lastSeen=data.lastSeen;
    recalcPlanetBonus();recalcStats();
    coinFace.textContent=SKINS.find(s=>s.id===state.activeSkin)?.emoji||'🪙';
    if(state.prestigeLevel>0){$('prestigeBadge').style.display='inline-flex';$('prestigeLevel').textContent=state.prestigeLevel;}
    showToast(`${t('welcomeBack')}, ${username}!`);
    setTimeout(()=>checkOfflineIncome(lastSeen),800);
  }else{
    state.unlockedSkins={default:true};state.resources={stardust:0,nebcore:0,voidcrystal:0};state.ownedPlanets={};
    if(!state.ownedPlanets['terra']){state.ownedPlanets['terra']=true;recalcPlanetBonus();recalcStats();}
    showToast(`${t('newPilot')}: ${username}!`);
  }
  state.lastGraphCoins=state.totalCoins;
  initDailyQuests();renderAchievements();renderCraft();updateHUD();checkAchievements();

  fbSetOnline(uid,username);
  fbOnOnlineCount(n=>$('onlineCount').textContent=n);
  fbOnOnlinePlayers(list=>{renderOnlinePlayers(list,'onlinePlayersSocial');renderOnlinePlayers(list,'onlinePlayers');});
  fbOnLeaderboard(e=>{renderLeaderboard(e,'leaderboard');renderLeaderboard(e,'leaderboardStats');});
  fbOnChat(msgs=>renderChat(msgs));
  fbListenNotifications(uid,handleNotification);
  fbOnClanLeaderboard(clans=>{
    const el=$('clanLeaderboard');if(!el)return;
    if(!clans.length){el.innerHTML='<div class="lb-loading">No clans yet</div>';return;}
    const m=['🥇','🥈','🥉'];el.innerHTML=clans.map((c,i)=>`<div class="lb-row${c.name===state.clanId?' me':''}"><div class="lb-rank${i<3?' r'+(i+1):''}">${m[i]||i+1}</div><div class="lb-name">⚔️${escHTML(c.name)}</div><div class="lb-score">${fmt(c.total)}</div></div>`).join('');
  });
  fbPruneChat();fbListenNPCOffer(offer=>showNPCOffer(offer.type));
  fbListenBroadcast(msg=>{$('broadcastStrip').style.display='flex';$('broadcastMsg').textContent=msg;setTimeout(()=>$('broadcastStrip').style.display='none',10000);});
  fbListenGlobalEvent(ev=>{const eventDef=EVENTS.find(e=>e.id===ev.type);if(eventDef)triggerEvent(eventDef);});
  fbGetCurrentSeason(seasonData=>renderSeason(seasonData));
  if(state.clanId)loadClanData();
  initRaid();

  lastTick=Date.now();
  requestAnimationFrame(autoTick);
  requestAnimationFrame(tickParticles);
  setTimeout(triggerEvent,(2+Math.random()*4)*60000);
  scheduleNPC();
}

/* ══════════════════════════════════════
   AUTH ENTRY POINT
══════════════════════════════════════ */
$('startBtn').addEventListener('click',()=>{
  const val=$('usernameInput').value.trim();
  if(!val||val.length<2){$('usernameInput').animate([{borderColor:'#ff4466'},{borderColor:''}],{duration:600});return;}
  localStorage.setItem('cc_username',val);
  // Sign in anonymously and use username as display name
  fbSignInAnon().then(cred=>{startGame(cred.user.uid,val);}).catch(()=>startGame(sanitiseKey(val),val));
});
$('usernameInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('startBtn').click();});
$('googleBtn').addEventListener('click',()=>{
  fbSignInGoogle().then(cred=>{
    const name=cred.user.displayName||cred.user.email?.split('@')[0]||'Pilot';
    localStorage.setItem('cc_username',name);startGame(cred.user.uid,name);
  }).catch(e=>showToast('Google sign-in failed'));
});

window.addEventListener('DOMContentLoaded',()=>{
  initStarCanvas();registerSW();applyTranslations();
  $('langToggle').textContent=currentLang.toUpperCase();
  // Check if already signed in
  fbOnAuthChange(user=>{
    if(user&&localStorage.getItem('cc_username')&&$('gameWrap').style.display==='none'){
      const name=localStorage.getItem('cc_username');startGame(user.uid,name);
    } else {
      const saved=localStorage.getItem('cc_username');if(saved&&$('usernameInput'))$('usernameInput').value=saved;
    }
  });
});
document.addEventListener('touchstart',e=>{if(e.target===$('mainCoin'))e.preventDefault();},{passive:false});
