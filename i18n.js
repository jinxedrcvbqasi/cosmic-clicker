/**
 * COSMIC CLICKER v4 — i18n.js
 * RU / EN translations
 */
const LANGS = {
  en: {
    // General
    appName: 'COSMIC CLICKER',
    launch: '🚀 LAUNCH MISSION',
    pilotPlaceholder: 'Pilot callsign...',
    orContinueWith: 'or continue with',
    signInGoogle: '🔵 Sign in with Google',
    signInAnon: '👤 Play as Guest',
    welcomeBack: '🚀 Welcome back',
    newPilot: '🌌 New pilot',
    online: 'online',
    tapToMine: 'TAP TO MINE',
    // Nav tabs
    mine: 'MINE', shop: 'SHOP', galaxy: 'GALAXY', raid: 'RAID',
    games: 'GAMES', social: 'SOCIAL', stats: 'STATS',
    tech: 'TECH', lore: 'LORE', season: 'SEASON',
    // Stats
    coins: 'COINS', perClick: 'PER CLICK', perSec: 'PER SEC', allTime: 'ALL TIME',
    // Shop
    upgradeShop: 'UPGRADE SHOP',
    // Prestige
    prestige: 'PRESTIGE', prestigeReset: 'PRESTIGE RESET',
    prestigeDesc: 'Coins and upgrades reset. You gain a permanent multiplier.',
    confirmPrestige: '♻️ CONFIRM',
    curLevel: 'Current level', newMult: 'New multiplier',
    // Offline
    welcomeBackTitle: 'WELCOME BACK!',
    offlineDesc: 'Your miners kept working while you were away.',
    awayFor: 'Away for', coinsEarned: 'Coins earned',
    collectOffline: '💰 COLLECT!',
    // Tech tree
    techTree: '🌳 TECH TREE',
    techDesc: 'Research permanent upgrades for your empire',
    research: 'RESEARCH',
    researched: '✅ RESEARCHED',
    // Clan base
    clanBase: '🏰 CLAN BASE',
    clanBaseDesc: 'Contribute coins to upgrade clan buildings',
    contribute: 'CONTRIBUTE',
    clanBank: 'Clan Bank',
    // Alchemy / Artifacts
    alchemy: '⚗️ ALCHEMY',
    artifacts: '🔮 ARTIFACTS',
    forge: 'FORGE',
    equipped: 'EQUIPPED',
    equip: 'EQUIP',
    unequip: 'UNEQUIP',
    // Lore
    loreTitle: '📖 GALAXY LORE',
    loreDesc: 'The story of your cosmic empire',
    locked: '🔒 LOCKED',
    // Season
    seasonTitle: '🎭 WEEKLY SEASON',
    seasonEnds: 'Season ends',
    seasonReward: 'Season Reward',
    claimSeason: '🏆 CLAIM REWARD',
    seasonPoints: 'Season Points',
    // NPC Trader
    traderTitle: '🤖 SPACE TRADER',
    traderAppeared: 'A mysterious trader appeared!',
    accept: 'ACCEPT DEAL',
    decline: 'NO THANKS',
    // Raid
    raidTitle: '🌍 GLOBAL RAID',
    attackBoss: '⚔️ ATTACK BOSS',
    raidComplete: 'RAID COMPLETE!',
    raidShare: 'Your share',
    // Social
    chat: '💬 GALAXY CHAT', onlinePilots: '🧑‍🚀 ONLINE PILOTS',
    myClan: '⚔️ MY CLAN', clanRankings: '🏰 CLAN RANKINGS',
    createClan: 'Create (500🪙)', joinClan: 'Join', leaveClan: 'Leave Clan',
    // Achievements
    achievUnlocked: 'ACHIEVEMENT UNLOCKED',
    // Quests
    dailyQuests: '📋 DAILY QUESTS', claim: 'CLAIM', claimed: '✅ CLAIMED',
    // Toast
    notEnoughCoins: 'Not enough coins!', slowDown: 'Slow down…',
    craftSuccess: 'Crafted', tooFast: 'Too fast!',
  },
  ru: {
    appName: 'COSMIC CLICKER',
    launch: '🚀 НАЧАТЬ МИССИЮ',
    pilotPlaceholder: 'Позывной пилота...',
    orContinueWith: 'или войти через',
    signInGoogle: '🔵 Войти через Google',
    signInAnon: '👤 Играть как гость',
    welcomeBack: '🚀 С возвращением',
    newPilot: '🌌 Новый пилот',
    online: 'онлайн',
    tapToMine: 'ТАП ДЛЯ ДОБЫЧИ',
    mine: 'ДОБЫЧА', shop: 'МАГАЗИН', galaxy: 'ГАЛАКТИКА', raid: 'РЕЙД',
    games: 'ИГРЫ', social: 'СОЦИУМ', stats: 'СТАТА',
    tech: 'НАУКА', lore: 'ЛОР', season: 'СЕЗОН',
    coins: 'МОНЕТЫ', perClick: 'ЗА КЛИК', perSec: 'В СЕК', allTime: 'ВСЕГО',
    upgradeShop: 'МАГАЗИН УЛУЧШЕНИЙ',
    prestige: 'ПРЕСТИЖ', prestigeReset: 'СБРОС ПРЕСТИЖА',
    prestigeDesc: 'Монеты и улучшения сбросятся. Получишь постоянный множитель.',
    confirmPrestige: '♻️ ПОДТВЕРДИТЬ',
    curLevel: 'Текущий уровень', newMult: 'Новый множитель',
    welcomeBackTitle: 'С ВОЗВРАЩЕНИЕМ!',
    offlineDesc: 'Твои шахтёры работали пока ты отдыхал.',
    awayFor: 'Отсутствовал', coinsEarned: 'Монет заработано',
    collectOffline: '💰 ЗАБРАТЬ!',
    techTree: '🌳 ДЕРЕВО НАУКИ',
    techDesc: 'Исследуй постоянные улучшения для своей империи',
    research: 'ИЗУЧИТЬ',
    researched: '✅ ИЗУЧЕНО',
    clanBase: '🏰 БАЗА КЛАНА',
    clanBaseDesc: 'Вноси монеты для улучшения зданий клана',
    contribute: 'ВНЕСТИ',
    clanBank: 'Банк клана',
    alchemy: '⚗️ АЛХИМИЯ',
    artifacts: '🔮 АРТЕФАКТЫ',
    forge: 'СКОВАТЬ',
    equipped: 'НАДЕТО',
    equip: 'НАДЕТЬ',
    unequip: 'СНЯТЬ',
    loreTitle: '📖 ЛОР ГАЛАКТИКИ',
    loreDesc: 'История твоей космической империи',
    locked: '🔒 ЗАПЕРТО',
    seasonTitle: '🎭 ЕЖЕНЕДЕЛЬНЫЙ СЕЗОН',
    seasonEnds: 'Сезон заканчивается',
    seasonReward: 'Награда сезона',
    claimSeason: '🏆 ЗАБРАТЬ НАГРАДУ',
    seasonPoints: 'Очки сезона',
    traderTitle: '🤖 КОСМИЧЕСКИЙ ТОРГОВЕЦ',
    traderAppeared: 'Появился таинственный торговец!',
    accept: 'ПРИНЯТЬ СДЕЛКУ',
    decline: 'ОТКАЗАТЬ',
    raidTitle: '🌍 ГЛОБАЛЬНЫЙ РЕЙД',
    attackBoss: '⚔️ АТАКОВАТЬ БОССА',
    raidComplete: 'РЕЙД ЗАВЕРШЁН!',
    raidShare: 'Твоя доля',
    chat: '💬 ЧАТ ГАЛАКТИКИ', onlinePilots: '🧑‍🚀 ПИЛОТЫ ОНЛАЙН',
    myClan: '⚔️ МОЙ КЛАН', clanRankings: '🏰 РЕЙТИНГ КЛАНОВ',
    createClan: 'Создать (500🪙)', joinClan: 'Вступить', leaveClan: 'Выйти из клана',
    achievUnlocked: 'ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО',
    dailyQuests: '📋 ЕЖЕДНЕВНЫЕ ЗАДАНИЯ', claim: 'ЗАБРАТЬ', claimed: '✅ ЗАБРАНО',
    notEnoughCoins: 'Недостаточно монет!', slowDown: 'Не так быстро…',
    craftSuccess: 'Скрафчено', tooFast: 'Слишком быстро!',
  }
};

let currentLang = localStorage.getItem('cc_lang') || 'en';
function t(key) { return LANGS[currentLang][key] || LANGS['en'][key] || key; }
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('cc_lang', lang);
  applyTranslations();
}
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
}
