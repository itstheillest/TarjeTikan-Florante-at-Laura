

// ==================== CONFIGURATION ====================
const CONFIG = {
    // Hourly pull limit (does NOT stack)
    MAXPULLSPERHOUR: 5,
    PULLWINDOWMS: 60 * 60 * 1000,

    DRAW1COST: 1,
    DRAW5COST: 5,

    STORAGEKEY: "gachaEnergyData",
    HISTORYKEY: "gachaHistory",
    BANNERKEY: "currentBanner",
    MAXHISTORYENTRIES: 20,
    OWNEDKEY: "gachaOwnedCards",

    DUPESKEY: "gachaCardCounts",
    PITYCOUNT: 70, // CHANGEABLE PITY
    PITYKEY: "gachaPityCount",
    GUARANTEEDKEY: "gachaGuaranteedCounter",
};

// Pull cards from cards.js (global)
const getCARDS = () => (Array.isArray(window.CARDS) ? window.CARDS : []);

// Allow permanent timer override (debug)
CONFIG.TIMEROVERRIDEKEY = "gachaPullWindowMs";

const savedMs = Number(localStorage.getItem(CONFIG.TIMEROVERRIDEKEY));
if (Number.isFinite(savedMs) && savedMs > 0) {
  CONFIG.PULLWINDOWMS = savedMs;
}

// ==================== BANNER DATA ====================
const BANNERS = {
    forest: {
        // Madilim na Kagubatan
        name: "Madilim na Kagubatan, Kabanata 1-8", // BANDILA NG MISTERYOSONG GUBAT or MYSTICAL FOREST BANNER
        subtitle: "Discover legendary treasures",
        showcaseImage: "Images/banner1.png",
        colors: {
            primary: '#699954',
            secondary: '#2d5a3d',
            accent: '#d4af37',
            gradient1: 'rgba(58, 107, 76, 0.85)',
            gradient2: 'rgba(45, 90, 61, 0.9)'
        },
        background: "Images/Interface_1.jpg",
    },
    ocean: {
        // PAG-AARAL SA ATENAS
        name: "Pag-aaral sa Atenas, Kabanata 9-16", // BANDILA NG MALALIM NA DAGAT or DEEP OCEAN BANNER
        subtitle: "Treasures from the abyss",
        showcaseImage: "Images/banner2.png",
        colors: {
            primary: '#1e3a5f',
            secondary: '#14293f',
            accent: '#4fc3f7',
            gradient1: 'rgba(30, 58, 95, 0.85)',
            gradient2: 'rgba(20, 41, 63, 0.9)'
        },
        background: "Images/Interface_2.jpg",
    },
    volcano: {
        // DIGMAAN AT TRAHEDYA
        name: "Digmaan at Trahedya, Kabanata 17-25", // BANDILA NG MALUPIT NA BULKAN or VOLCANIC FURY BANNER
        subtitle: "Forge your destiny in flames",
        showcaseImage: "Images/banner3.png",
        colors: {
            primary: '#8b2500',
            secondary: '#5a1800',
            accent: '#ff6b35',
            gradient1: 'rgba(139, 37, 0, 0.85)',
            gradient2: 'rgba(90, 24, 0, 0.9)'
        },
        background: "Images/Interface_3.jpg",
    },
    celestial: {
        // PAGWAWAKAS AT KATAPUSAN
        name: "Pagwawakas at Katapusan, Kabanata 26-30", // BANDILA NG MATAAS NA LANGIT or CELESTIAL HEIGHTS BANNER
        subtitle: "Reach for the stars",
        showcaseImage: "Images/banner4.png",
        colors: {
            primary: '#4a148c',
            secondary: '#311b92',
            accent: '#e1bee7',
            gradient1: 'rgba(74, 20, 140, 0.85)',
            gradient2: 'rgba(49, 27, 146, 0.9)'
        },
        background: "Images/Interface_4.jpg",
    }
};

// ===============================
// BANNER CARD RULES (RATE UP + LIMITED)
// ===============================

    // 1) Each banner has 1 rate-up Full Art card (higher odds ONLY on that banner).
    // Change these IDs to match your cards.js exactly.
const BANNER_RATE_UP = {
    forest:   ["FATAO-002-1_Duke_Briseo", "FATAO-003-1_Florante", "FATAO-001-1_Aladin"],
    ocean:    ["FATAO-004-2_Antenor","FATAO-005-2_Haring_Linceo","FATAO-006-2_Prinsesa_Floresca"],
    volcano:  ["FATAO-007-3_Konde_Adolfo","FATAO-008-3_Sultan_Ali-Adab"], // example you gave
    celestial:["FATAO-009-4_Flerida","FATAO-010-4_Laura"],
};

    // 2) Banner-limited cards (these IDs can ONLY be pulled on that banner).
    // Example you gave: Celestial banner has SCTG-001-TAGPUAN1 as limited.
const BANNER_LIMITED = {
    forest: ["FATAO-003-1_Florante","SCTAO-005-Florante"],
    ocean: ["FATAO-006-2_Prinsesa_Floresca","SCTAO-019-Prinsesa_Floresca"],
    volcano: ["FATAO-007-3_Konde_Adolfo","SCTAO-011-Konde_Adolfo"],
    celestial: ["FATAO-010-4_Laura", "FATAO-009-4_Flerida", "SCTAO-013-Laura"],
};

// Meaning: if FA happens, we pick the rate-up card this % of the time.
// (Example: 50 means 50% chance for the rate-up FA, 40% chance for other FA.)
const RATE_UP_FA_PERCENT = 50; // CHANGE THE NUMBER FOR RATE UP RATES
const FULL_ART_CHANCE = 0.01; // CHANGE THIS FOR FULL ART RATES, 0.01 = 1%

// ==================== BANNER MANAGER ====================
class BannerManager {
    constructor() {
        this.currentBanner = this.detectBanner();
        this.applyTheme();
    }

    detectBanner() {
        const urlParams = new URLSearchParams(window.location.search);
        const bannerParam = urlParams.get('banner');
        
        if (bannerParam && BANNERS[bannerParam]) {
            localStorage.setItem(CONFIG.BANNER_KEY, bannerParam);
            return bannerParam;
        }
        
        const savedBanner = localStorage.getItem(CONFIG.BANNER_KEY);
        return (savedBanner && BANNERS[savedBanner]) ? savedBanner : 'forest';
    }

    getBannerData() {
        return BANNERS[this.currentBanner];
    }

    applyTheme() {
        const banner = this.getBannerData();
        const root = document.documentElement;
        
        // Apply CSS custom properties
        root.style.setProperty('--primary-green', banner.colors.primary);
        root.style.setProperty('--secondary-green', banner.colors.secondary);
        root.style.setProperty('--accent-gold', banner.colors.accent);
        
        // Update background with image
        const bgContainer = document.querySelector('.background-container');
        if (banner.background) {
            bgContainer.style.backgroundImage = `
                linear-gradient(135deg, ${banner.colors.primary}40 0%, ${banner.colors.secondary}40 100%),
                url('${banner.background}')
            `;
        } else {
            bgContainer.style.background = `
                linear-gradient(135deg, ${banner.colors.primary} 0%, ${banner.colors.secondary} 100%)
            `;
        }
        
        const showcaseImage = document.getElementById('showcaseImage');
        if (showcaseImage && banner.showcaseImage) {
            showcaseImage.src = banner.showcaseImage;
        }
        
        document.body.className = `theme-${this.currentBanner}`;
    }

    getItems() {
        return this.getBannerData().items;
    }
}

// ==================== ENERGY SYSTEM ====================
class EnergySystem {
  constructor() {
    this.loadState();
    this.updateUI();
    this.startCountdown();
  }

  // State:
  // cycleStart: timestamp when the current "hour window" started (only set after first pull)
  // used: pulls used in this window (0..MAXPULLSPERHOUR)
  loadState() {
    const saved = localStorage.getItem(CONFIG.STORAGEKEY);

    const reset = () => {
      this.cycleStart = 0;
      this.used = 0;
      this.saveState();
    };

    if (!saved) return reset();

    try {
      const data = JSON.parse(saved);

      // If old/invalid data exists, reset cleanly (prevents NaN)
      this.cycleStart = Number.isFinite(data.cycleStart) ? data.cycleStart : 0;
      this.used = Number.isFinite(data.used) ? data.used : 0;

      // Clamp
      this.used = Math.max(0, Math.min(CONFIG.MAXPULLSPERHOUR, Math.floor(this.used)));

      this.syncWindow();
      this.saveState();
    } catch {
      reset();
    }
  }

  saveState() {
    localStorage.setItem(
      CONFIG.STORAGEKEY,
      JSON.stringify({ cycleStart: this.cycleStart, used: this.used })
    );
  }

  syncWindow() {
    // Only run a countdown if user has started using pulls (used > 0)
    if (this.used <= 0 || !Number.isFinite(this.cycleStart) || this.cycleStart <= 0) {
      this.used = 0;
      this.cycleStart = 0;
      return;
    }

    const now = Date.now();
    const elapsed = now - this.cycleStart;

    if (elapsed >= CONFIG.PULLWINDOWMS) {
      // Full refill after 1 hour
      this.used = 0;
      this.cycleStart = 0;
      this.saveState();
    }
  }

  getAvailableEnergy() {
    this.syncWindow();
    const avail = CONFIG.MAXPULLSPERHOUR - this.used;
    return Number.isFinite(avail) ? Math.max(0, Math.min(CONFIG.MAXPULLSPERHOUR, avail)) : 0;
  }

  getTimeUntilResetSeconds() {
    this.syncWindow();
    if (this.used === 0 || this.cycleStart === 0) return 0;

    const now = Date.now();
    const remainingMs = (this.cycleStart + CONFIG.PULLWINDOWMS) - now;
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

    consumeEnergy(amount) {
        amount = Number(amount);
        if (!Number.isFinite(amount) || amount <= 0) return false;

        const available = this.getAvailableEnergy();
        if (!Number.isFinite(available) || available < amount) return false;

        if (this.used === 0) this.cycleStart = Date.now();
        this.used += amount;
        this.used = Math.max(0, Math.min(CONFIG.MAXPULLSPERHOUR, this.used));
        this.saveState();
        return true;
    }


  formatCountdown() {
    const available = this.getAvailableEnergy();
    if (available === CONFIG.MAXPULLSPERHOUR) return "HANDA NA";

    const seconds = this.getTimeUntilResetSeconds();
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  updateUI() {
    const available = this.getAvailableEnergy();
    const percentage = (available / CONFIG.MAXPULLSPERHOUR) * 100;

    document.getElementById("countdownTimer").textContent = this.formatCountdown();
    document.getElementById("energyBarFillTop").style.width = `${percentage}%`;
    document.getElementById("energyTextTop").textContent = `${available}/${CONFIG.MAXPULLSPERHOUR}`;

    document.getElementById("draw1Btn").disabled = available < CONFIG.DRAW1COST;
    document.getElementById("draw5Btn").disabled = available < CONFIG.DRAW5COST;
  }

  startCountdown() {
    setInterval(() => this.updateUI(), 1000);
  }

  resetTimerCheat() {
    this.cycleStart = 0;
    this.used = 0;
    this.saveState();
    this.updateUI();
  }

}



// ==================== GACHA SYSTEM ====================
class GachaSystem {
    constructor(bannerManager) {
        this.bannerManager = bannerManager;
        this.rateThresholds = {
            legendary: 2,
            epic: 10,
            rare: 30,
            common: 100
        };
    }

    getCardsForBanner(rarity, type) {
        const bannerKey = this.bannerManager?.currentBanner || "forest";

        let pool = CARDS.filter(c =>
            c.rarity === rarity && (!type || c.type === type)
        );

        const limitedAll = Object.values(BANNER_LIMITED).flat();
        const limitedSet = new Set(limitedAll);

        pool = pool.filter(card => {
            if (!limitedSet.has(card.id)) return true;
            return (BANNER_LIMITED[bannerKey] || []).includes(card.id);
        });

        return pool;
    }


    draw(count) {
        const results = [];

        // Helpers (defined once per draw call)
        const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const rollCardTypeSC = () => {
            const r = Math.random() * 100;
            if (r < 49.5) return "TAO";
            if (r < 66.0) return "TT";
            if (r < 82.5) return "TG";
            return "KG";
        };

        const getCards = (rarity, type) => {
            const bannerKey = this.bannerManager?.currentBanner || "forest";
            let pool = CARDS.filter(c => c.rarity === rarity && (!type || c.type === type));

            // Banner-limited logic:
            const limitedAll = Object.values(BANNER_LIMITED).flat();
            const limitedSet = new Set(limitedAll);

            pool = pool.filter(card => {
            if (!limitedSet.has(card.id)) return true;
            return (BANNER_LIMITED[bannerKey] || []).includes(card.id);
            });

            return pool;
        };

        for (let i = 0; i < count; i++) {
            // --- Pity check (guarantee FA on Nth pull) ---
            let pity = getPityCount(); // number of consecutive non-FA pulls so far [file:18]
            const isPityPull = (CONFIG.PITYCOUNT > 0 && (pity + 1) >= CONFIG.PITYCOUNT);

            // If pity triggers -> force FA, else roll normally
            const isFA = isPityPull ? true : (Math.random() < FULL_ART_CHANCE);

            let card = null;

            if (isFA) {
            // Full Art is 100% Tauhan
            const bannerKey = this.bannerManager?.currentBanner || "forest";

            // Accept either a string or an array in config
            const rateUpRaw = BANNER_RATE_UP[bannerKey];
            const rateUpIds = Array.isArray(rateUpRaw) ? rateUpRaw : (rateUpRaw ? [rateUpRaw] : []);

            const faPool = this.getCardsForBanner("FA", "TAO");

            if (faPool.length) {
                const rateUpPool = faPool.filter(c => rateUpIds.includes(c.id));
                const others = faPool.filter(c => !rateUpIds.includes(c.id));
                const guaranteed = getGuaranteedCounter() === 1;

                // If guaranteed, force rate-up if possible
                if (guaranteed && rateUpPool.length) {
                    card = pickRandom(rateUpPool);
                    setGuaranteedCounter(0); // reset after winning the guaranteed
                } else {
                    // Normal 50/50
                    const wonRateUp = rateUpPool.length && (Math.random() * 100 < RATE_UP_FA_PERCENT);

                    if (wonRateUp) {
                        card = pickRandom(rateUpPool);
                        setGuaranteedCounter(0); // (optional) keep it clean
                    } else {
                        card = pickRandom(others.length ? others : faPool);
                        // If you pulled a non-rate-up FA, set guarantee for next FA
                        setGuaranteedCounter(1);
                    }
                }
            }

            // Reset pity on FA (whether natural or pity)
            setPityCount(0);

            } else {
            // Standard Card (SC)
            const type = rollCardTypeSC();

            let pool = getCards("SC", type);
            if (!pool.length) pool = getCards("SC");

            if (pool.length) card = pickRandom(pool);

            // Increase pity only when we actually gave a non-FA card
            setPityCount(pity + 1);
            }

            if (card) {
            results.push({
                ...card,
                name: card.name || card.id
            });
            }
        }

        if (results.length !== count) {
            console.warn("Draw produced fewer cards than expected.", {
            expected: count,
            got: results.length,
            banner: this.bannerManager?.currentBanner,
            });
        }

        return results;
    }



    updateContinueButton() {
        const btn = document.getElementById("closeResultBtn");
        const cards = Array.from(document.querySelectorAll("#resultCards .result-card"));
        const allFlipped = cards.length > 0 && cards.every(c => c.classList.contains("is-flipped"));

        btn.textContent = allFlipped ? "MAGPATULOY" : "LAKTAWAN";
    }

    revealAllCards() {
        const cards = Array.from(document.querySelectorAll("#resultCards .result-card"));

        cards.forEach(cardEl => {
            if (cardEl.dataset.upgradePending !== "1") return;

            cardEl.dataset.upgradePending = "0";

            const upgradedImage = cardEl.dataset.upgradedImage;
            const upgradedId = cardEl.dataset.upgradedId;
            const upgradedName = cardEl.dataset.upgradedName;

            cardEl.dataset.cardImage = upgradedImage;
            if (upgradedId) cardEl.dataset.cardId = upgradedId;        
            if (upgradedName) cardEl.dataset.cardTitle = upgradedName; 


            const frontImg = cardEl.querySelector(".card-front img");
            if (frontImg) frontImg.src = upgradedImage;

            cardEl.classList.remove("SC");
            cardEl.classList.add("FA");

            cardEl.classList.remove("is-upgrading");
        });

        // Count all cards when LAKTAWAN is used
        cards.forEach((cardEl) => {
            if (cardEl.dataset.counted === "1") return;
            cardEl.dataset.counted = "1";

            const id = cardEl.dataset.cardId || cardEl.dataset.cardTitle;
            if (!id) return;

            const wasNew = getCardCount(id) === 0;
            incrementCardCount(id, 1);
            addOwnedCardId(id);

            if (wasNew) {
                const badge = cardEl.querySelector(".new-badge");
                if (badge) badge.textContent = "Bago!";
            }
        });


        // 2) Flip them all
        cards.forEach(c => c.classList.add("is-flipped"));

        this.updateContinueButton();
    }


    showResults(results) {
        const resultOverlay = document.getElementById('resultOverlay');
        const resultCards = document.getElementById('resultCards');
        
        resultCards.innerHTML = results
            .map(
                (item, index) => `
                    <div
                        class="result-card ${item.rarity}"
                        style="animation-delay: ${index * 0.1}s"
                        data-card-image="${item.image}"
                        data-card-title="${item.id}"
                        data-card-id="${item.id}"         
                        data-rarity="${item.rarity}"
                        aria-label="Card ${index + 1}"
                    >
                    <div class="card-glow"></div>

                    <div class="flip-card">
                        <div class="flip-inner">
                            <div class="card-face card-back">
                                <img src="Cards/CARD_BACK_ART.png" alt="Card back" draggable="false" />
                            </div>

                                <div class="card-face card-front">
                                    <div class="new-badge" aria-hidden="true"></div> 
                                    <img src="${item.image}" alt="${item.id}" draggable="false" />
                                </div>
                            </div>
                        </div>
                    </div>
                `
                )
            .join("");

        this.updateContinueButton();

        // CHANGE UPGRADE RATES HERE, 0.01 = 1%
        this.maybeUpgradeCards(results, 0.01);

        // Click-to-zoom event delegation
        resultCards.onclick = (e) => {
            const cardEl = e.target.closest(".result-card");
            if (!cardEl) return;

            // 1) First click: flip
            if (!cardEl.classList.contains("is-flipped")) {

                const cardId = cardEl.dataset.cardId;

                // If this card is currently scheduled to upgrade, don't count it yet here.
                // Let procAndFlip handle it (or count after upgrade is applied).
                if (cardEl.dataset.upgradePending !== "1") {
                const wasNew = getCardCount(cardId) === 0;
                incrementCardCount(cardId, 1);
                addOwnedCardId(cardId);

                if (wasNew) {
                    const badge = cardEl.querySelector(".new-badge");
                    if (badge) badge.textContent = "Bago!";
                }
                }

                if (cardEl.dataset.upgradePending === "1") {
                this.procAndFlip(cardEl);
                } else {
                cardEl.classList.add("is-flipped");
                this.updateContinueButton();
                }
                return;
            }

            // 2) Already flipped: open zoom viewer
            const img = document.getElementById("cardViewerImage");
            img.src = cardEl.dataset.cardImage;
            ModalController.openModal("cardViewerModal");
        };


        resultOverlay.classList.add('active');
        resultOverlay.setAttribute('aria-hidden', 'false');
        this.saveToHistory(results);
    }

    saveToHistory(results) {
        const history = JSON.parse(localStorage.getItem(CONFIG.HISTORYKEY) || "[]");

        history.unshift({
            timestamp: Date.now(),
            banner: this.bannerManager.currentBanner,
            // keep the pull order + show names
            items: results.map(c => ({ id: c.id, name: c.name }))
        });

        if (history.length > CONFIG.MAXHISTORYENTRIES) history.pop();

        results.forEach(c => addOwnedCardId(c.id));
        localStorage.setItem(CONFIG.HISTORYKEY, JSON.stringify(history));
    }


    getOwnedCardIdSet() {
        return getOwnedSetFromStorage();
    }



    typeLabelFromCard(card) {
    // SC types use card.type; FA Tauhan uses "FATAO" for the filter dropdown
        if (card.rarity === "FA") return "FATAO";
        return card.type || "UNK";
    }

    getInventoryFilters() {
    return {
            sort: localStorage.getItem("inv_sort") || "az",
            type: localStorage.getItem("inv_type") || "all",
            show: localStorage.getItem("inv_show") || "all",
            search: (document.getElementById("inventorySearchInput")?.value || "").trim().toLowerCase(),
        };
    }


    loadHistory() {
        const history = JSON.parse(localStorage.getItem(CONFIG.HISTORYKEY) || "[]");
        const historyList = document.getElementById('historyList');
        
        if (history.length === 0) {
                historyList.innerHTML = '<p class="no-history">Walang kasaysayan ng pagkolekta, simulan mo na mangolekta!</p>';
                return;
            }
        
        historyList.innerHTML = history.map(entry => {
            const date = new Date(entry.timestamp).toLocaleString();
            const bannerName = BANNERS[entry.banner]?.name || 'Unknown Banner';
            const itemNames = (entry.items || [])
            .map((item) => {
                const id = item && item.id ? String(item.id) : String(item);
                const name = item && item.name ? item.name : id;

                const isFA = id.startsWith("FA") || id.startsWith("FATAO");
                return isFA ? `<span class="fa-text">${name}</span>` : name;
            })
            .join(", ");

                // NEW: detect Full Art in this history entry
                const hasFA = (entry.items || []).some((item) => {
                    const id = item && item.id ? String(item.id) : String(item);
                    return id.startsWith("FA") || id.startsWith("FATAO");
                });

            return `
                <div class="rate-item">
                    <div>
                        <div style="font-size:0.8rem;opacity:0.7;margin-bottom:0.25rem">${date}</div>
                        <div style="font-size:0.75rem;opacity:0.6;margin-bottom:0.5rem">${bannerName}</div>
                        <div>${itemNames}</div>
                    </div>
                </div>
            `;

                })
        .join("");
        }

    loadInventory() {
        rebuildOwnedFromHistory();
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;

        const ownedSet = this.getOwnedCardIdSet();
        const f = this.getInventoryFilters();
        let list = [...getCARDS()];

        // Search
        if (f.search) {
            list = list.filter(c => (c.name || '').toLowerCase().includes(f.search));
        }

        // Type filter
        if (f.type !== "all") {
            list = list.filter(c => {
                const t = this.typeLabelFromCard(c);
                return t === f.type || (f.type === "TAO" && t === "FATAO");
            });
        }


        // Sort (name A-Z / Z-A)
        list.sort((a, b) => {
            const an = (a.name || '').toLowerCase();
            const bn = (b.name || '').toLowerCase();
            // Check for 'za' OR 'z-a'
            const isZA = (f.sort === 'za' || f.sort === 'z-a');
            return isZA ? bn.localeCompare(an) : an.localeCompare(bn);
        });

        // Owned first (stable secondary sort)
        list.sort((a, b) => {
            const ao = ownedSet.has(a.id) ? 1 : 0;
            const bo = ownedSet.has(b.id) ? 1 : 0;
            return bo - ao; // owned (1) before unowned (0)
        });

        if (list.length === 0) {
            grid.innerHTML = `<p class="no-history">No cards found.</p>`;
            return;
        }

        grid.innerHTML = list.map(card => {
            const owned = ownedSet.has(card.id);
            const cls = owned ? 'inv-card owned' : 'inv-card unowned';
            const imgSrc = owned ? card.image : 'Cards/CARD_BACK_ART.png';
            const title = owned ? (card.name || '???') : '???';

            return `
            <div class="${cls}"
                data-card-id="${card.id}"
                data-card-owned="${owned ? 1 : 0}"
                data-card-image="${card.image}"
                aria-label="${title}">
                <img src="${imgSrc}" alt="${title}" draggable="false">
            <div class="inv-name">${title}</div>
            </div>
            `;
        }).join('');  

        const ownedList = list.filter(c => ownedSet.has(c.id));
        const unownedList = list.filter(c => !ownedSet.has(c.id));

        // Helper to render a single card
        // Helper to render a single card
        const renderCard = (c, isOwned) => {
            const cls = isOwned ? "inv-card owned" : "inv-card unowned";
            const displayName = isOwned ? c.name : "???";

            // NEW: counts/dupes
            const count = isOwned ? getCardCount(c.id) : 0;     // total copies owned
            const dupes = Math.max(0, count - 1);              // duplicates = extra copies

            // What to show under the card
            const koleksyonText = isOwned ? `Naulit: ${count}x` : "";

            // If unowned, show back art; if owned, show real image
            const imgSrc =  c.image;

            return `
                <div class="${cls}"
                    data-card-id="${c.id}"
                    data-card-owned="${isOwned ? 1 : 0}"
                    data-card-image="${c.image}"
                    aria-label="${displayName}">
                <img src="${imgSrc}" alt="${displayName}" draggable="false">
                <div class="inv-name"><span class="inv-name-text">${displayName}</span></div>
                ${isOwned ? `<div class="inv-count">${koleksyonText}</div>` : ""}
                </div>
            `;
        };



        let html = '';
        // Normalize to lowercase to handle "All", "all", "Owned", "owned"
        const show = (f.show || 'all').toLowerCase();

        // LOGIC: If user picked 'owned' or 'all'
        if (show === 'all' || show === 'owned') {
            if (ownedList.length > 0) {
                if (show === 'all') html += `<h3 class="inv-section-title">MAYROON NA (${ownedList.length})</h3>`;
                html += `<div class="inv-section-grid">`;
                html += ownedList.map(c => renderCard(c, true)).join('');
                html += `</div>`;
            } else if (show === 'owned') {
                html += `<p class="no-history">Wala pang mga Tarjete...</p>`;
            }
        }

        // LOGIC: If user picked 'unowned' or 'all'
        if (show === 'all' || show === 'unowned') {
            if (unownedList.length > 0) {
                if (show === 'all') html += `<h3 class="inv-section-title">WALA PA (${unownedList.length})</h3>`;
                html += `<div class="inv-section-grid">`;
                html += unownedList.map(c => renderCard(c, false)).join('');
                html += `</div>`;
            } else if (show === 'unowned') {
                html += `<p class="no-history">Nasaiyo na lahat ng Tarjete!</p>`;
            }
        }

        if (list.length === 0) {
            html = `<p class="no-history">No cards match your filters.</p>`;
        }

        grid.innerHTML = html;

        requestAnimationFrame(() => {
            grid.querySelectorAll(".inv-name").forEach(el => {
                const text = el.querySelector(".inv-name-text");
                if (!text) return;

                const original = text.textContent;

                // reset to single copy first
                text.textContent = original;

                const diff = text.scrollWidth - el.clientWidth;
                if (diff < 2) return;

                text.textContent = original + "\u00A0\u00A0\u00A0" + original;

                const singleWidth = text.scrollWidth / 2;
                text.style.setProperty("--marquee-distance", `${singleWidth}px`);

                const pxPerSecond = 20; // CHANGE THIS IF YOU WANT TO MAKE THE MOVEMENT SLOWER
                const duration = singleWidth / pxPerSecond;

                text.style.animation = `invMarquee ${duration}s linear infinite`;
            });
        });


        // Click to view only if owned (unowned is locked)
        grid.onclick = (e) => {
            const el = e.target.closest(".inv-card");
            if (!el) return;
            if (el.dataset.cardOwned !== "1") return;

            const img = document.getElementById("cardViewerImage");
            img.src = el.dataset.cardImage;
            ModalController.openModal("cardViewerModal");
        };
    }

    maybeUpgradeCards(results, upgradeChance = 0.01) {
        const scIndexes = results
            .map((r, i) => ({ r, i }))
            .filter(x => x.r.rarity === "SC")
            .map(x => x.i);

        if (scIndexes.length === 0) return;

        const bannerKey = this.bannerManager?.currentBanner || "forest";
        const rateUpRaw = BANNER_RATE_UP[bannerKey];
        const rateUpIds = Array.isArray(rateUpRaw) ? rateUpRaw : (rateUpRaw ? [rateUpRaw] : []);

        const faPool = this.getCardsForBanner('FA', 'TAO'); // respects banner-limited rules
        if (faPool.length === 0) return;


        const rateUpCards = faPool.filter(c => rateUpIds.includes(c.id));
        const others = faPool.filter(c => !rateUpIds.includes(c.id));

        const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];


        if (faPool.length === 0) return;

        for (const targetIndex of scIndexes) {
            if (Math.random() >= upgradeChance) continue;

            let newCard;

            const guaranteed = getGuaranteedCounter() === 1;

            if (guaranteed && rateUpCards.length) {
                // Consume guarantee: force rate-up
                newCard = pickRandom(rateUpCards);
                setGuaranteedCounter(0);
            } else {
                // Normal 50/50
                const wonRateUp = rateUpCards.length && (Math.random() * 100 < RATE_UP_FA_PERCENT);

                if (wonRateUp) {
                    newCard = pickRandom(rateUpCards);
                    setGuaranteedCounter(0); // optional, keeps it clean
                } else {
                    newCard = others.length ? pickRandom(others) : pickRandom(rateUpCards);
                    // If we actually lost to a non-rate-up, set guarantee for next FA
                    if (others.length) setGuaranteedCounter(1);
                }
            }

            if (!newCard || !newCard.image) continue;

            // Update result data so history stores FA
            results[targetIndex] = { ...newCard };

            // Mark the DOM card as will proc but DO NOT flip it yet
            const cardEl = document.querySelectorAll("#resultCards .result-card")[targetIndex];
            if (!cardEl) continue;

            cardEl.dataset.upgradePending = "1";
            cardEl.dataset.upgradedImage = newCard.image;
            cardEl.dataset.upgradedId = newCard.id;      // NEW (used for counting)
            cardEl.dataset.upgradedName = newCard.name;  // NEW (used for display)

        }
    }

    async procAndFlip(cardEl) {
        if (!cardEl || cardEl.classList.contains("is-flipped")) return;
        if (cardEl.dataset.upgradePending !== "1") return;

        cardEl.dataset.upgradePending = "0"; // prevent double proc
        cardEl.classList.add("is-upgrading");

        // swap the front image so when it flips, it reveals the upgraded art
        const upgradedImage = cardEl.dataset.upgradedImage;
        const upgradedId = cardEl.dataset.upgradedId;      // NEW
        const upgradedName = cardEl.dataset.upgradedName;  // NEW (optional)

        cardEl.dataset.cardImage = upgradedImage;
        if (upgradedId) cardEl.dataset.cardId = upgradedId;        // IMPORTANT

        // Count THIS upgraded card now (since click handler skipped counting it)
        if (cardEl.dataset.counted !== "1") {
            cardEl.dataset.counted = "1";
            const id = cardEl.dataset.cardId;
            if (id) {
                const wasNew = getCardCount(id) === 0;
                incrementCardCount(id, 1);
                addOwnedCardId(id);
                if (wasNew) {
                const badge = cardEl.querySelector(".new-badge");
                if (badge) badge.textContent = "Bago!";
                }
            }
        }

        if (upgradedName) cardEl.dataset.cardTitle = upgradedName; // optional for display


        const frontImg = cardEl.querySelector(".card-front img");
        if (frontImg) frontImg.src = upgradedImage;

        // fast proc duration
        await new Promise(r => setTimeout(r, 220));

        // now lock it in as FA (gold forever after proc)
        cardEl.classList.remove("SC");
        cardEl.classList.add("FA");

        cardEl.classList.remove("is-upgrading");
        cardEl.classList.add("is-flipped");
        this.updateContinueButton();
    }

}

// ==================== HELP ME- I mean, HELPER ====================

function getOwnedSetFromStorage() {
    const raw = localStorage.getItem(CONFIG.OWNEDKEY);
    if (!raw) return new Set();
    try {
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr : []);
    } catch {
        return new Set();
    }
}

function saveOwnedSetToStorage(set) {
    localStorage.setItem(CONFIG.OWNEDKEY, JSON.stringify([...set]));
}

function addOwnedCardId(cardId) {
    if (!cardId) return;
    const owned = getOwnedSetFromStorage();
    owned.add(String(cardId).trim());
    saveOwnedSetToStorage(owned);
}

function rebuildOwnedFromHistory() {
  const raw = localStorage.getItem(CONFIG.HISTORYKEY);
  if (!raw) return;

  try {
    const history = JSON.parse(raw);
    if (!Array.isArray(history)) return;

    const owned = new Set();

    for (const entry of history) {
      const items = Array.isArray(entry?.items) ? entry.items : [];
      for (const item of items) {
        const id = (typeof item === "object" && item?.id) ? item.id : item;
        if (typeof id === "string" && id.trim()) owned.add(id.trim());
      }
    }

    saveOwnedSetToStorage(owned);
  } catch {
    // ignore bad history format
  }
}

function getCountsMap() {
    const raw = localStorage.getItem(CONFIG.DUPESKEY);
    if (!raw) return {};
    try {
        const obj = JSON.parse(raw);
        return obj && typeof obj === "object" ? obj : {};
    } catch {
        return {};
    }
}

function saveCountsMap(map) {
    localStorage.setItem(CONFIG.DUPESKEY, JSON.stringify(map));
}

function getCardCount(cardId) {
    const map = getCountsMap();
    return Number(map[cardId] ?? 0) || 0;
}

function incrementCardCount(cardId, amount = 1) {
    if (!cardId) return 0;
    const id = String(cardId).trim();
    const map = getCountsMap();
    const prev = Number(map[id] ?? 0) || 0;
    const next = prev + amount;
    map[id] = next;
    saveCountsMap(map);
    return next;
}

function getIntFromStorage(key, fallback = 0) {
    const n = Number(localStorage.getItem(key));
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

function setIntToStorage(key, value) {
    const n = Number(value);
    const safe = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    localStorage.setItem(key, String(safe));
    return safe;
}

function getPityCount() {
    return getIntFromStorage(CONFIG.PITYKEY, 0);
}
function setPityCount(n) {
    return setIntToStorage(CONFIG.PITYKEY, n);
}

function getGuaranteedCounter() {
    return getIntFromStorage(CONFIG.GUARANTEEDKEY, 0); // 0 or 1
}
function setGuaranteedCounter(n) {
    return setIntToStorage(CONFIG.GUARANTEEDKEY, n ? 1 : 0);
}




// ==================== MODAL CONTROLLER ====================
class ModalController {
    static openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    static initCloseButtons() {
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                this.closeModal(modalId);
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                }
            });
        });
    }
}

function renderRatesPanel() {
    const body = document.getElementById("ratesBody");
    if (!body) return;

    const cards = Array.isArray(window.CARDS) ? window.CARDS : [];
    const bannerKey = bannerManager?.currentBanner || "forest";

    // If a card is limited on ANY banner, it can ONLY appear on its allowed banner(s).
    const limitedAll = Object.values(BANNER_LIMITED).flat();
    const limitedSet = new Set(limitedAll);

    const allowedOnBanner = (card) => {
        if (!card?.id) return false;
        if (!limitedSet.has(card.id)) return true; // not limited anywhere
        return (BANNER_LIMITED[bannerKey] || []).includes(card.id);
    };

    const pool = cards.filter(allowedOnBanner);

    const faPool = pool.filter(c => c.rarity === "FA"); // all FA allowed on this banner
    const scPool = pool.filter(c => c.rarity === "SC");

    const scByType = {
        TAO: scPool.filter(c => c.type === "TAO"),
        TT:  scPool.filter(c => c.type === "TT"),
        TG:  scPool.filter(c => c.type === "TG"),
        KG:  scPool.filter(c => c.type === "KG"),
    };

    // Overall rates
    const faRate = (Number(FULL_ART_CHANCE) || 0) * 100;
    const scRate = 100 - faRate;

    // Your SC type proc rates (percent of total pulls)
    // CHANGE STANDARD CARD RATES
    const SC_TYPE_PROC = {
        TAO: 49.5,
        TT: 16.5,
        TG: 16.5,
        KG: 16.5,
    };

    // Helper formatting
    const pct = (n, d = 2) => `${Number(n || 0).toFixed(d)}%`;
    const escapeHtml = (s) =>
        String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    // --- Full Art per-card rates (with rate-up) ---
    const rateUpRaw = BANNER_RATE_UP[bannerKey];
    const rateUpIds = Array.isArray(rateUpRaw) ? rateUpRaw : (rateUpRaw ? [rateUpRaw] : []);

    const rateUpCards = faPool.filter(c => rateUpIds.includes(c.id));
    const others = faPool.filter(c => !rateUpIds.includes(c.id));

    const rateUpShare = rateUpCards.length ? (Number(RATE_UP_FA_PERCENT) || 0) / 100 : 0;

    // Split the "rate-up share" evenly across the 3 rate-up cards
    const faRateUpEach = rateUpCards.length ? (faRate * rateUpShare) / rateUpCards.length : 0;

    // Split the remaining share across non-rate-up cards
    const faOthersTotal = faRate * (1 - rateUpShare);
    const faOtherEach = others.length ? faOthersTotal / others.length : 0;


    const renderCardRow = (name, cardPct) =>
        `<li>${escapeHtml(name)} <span class="card-rate">${pct(cardPct, 3)}</span></li>`;

    const faListHtml = (() => {
        if (!faPool.length) return `<li>(Walang Full Art cards)</li>`;

        // Put rate-up on top (if present), then others
        let html = "";

        // Put ALL rate-up cards first (each gets the same faRateUpEach)
        if (rateUpCards.length) {
        html += rateUpCards
            .map(c => renderCardRow(c.name || c.id, faRateUpEach))
            .join("");
        }

        // Then list all non-rate-up FA cards
        html += others
        .map(c => renderCardRow(c.name || c.id, faOtherEach))
        .join("");

        return html;

    })();

    // --- Standard per-card rates (split evenly inside allowed subtype) ---
    const scGroupHtml = (key, label) => {
        const list = scByType[key] || [];
        const groupProc = (SC_TYPE_PROC[key] || 0); // percent of total pulls
        const perCard = list.length ? (groupProc / list.length) : 0;

        return `
        <div class="rate-subgroup">
            <div class="rate-subheader">
            <div class="rate-subtitle">${escapeHtml(label)}</div>
            <div class="rate-subpercent">${pct(groupProc, 1)}</div>
            </div>
            <ul class="rate-sublist">
            ${list.length
                ? list.map(c => renderCardRow(c.name || c.id, perCard)).join("")
                : "<li>(None)</li>"
            }
            </ul>
        </div>
        `;
    };
    // code name "FA"
    // code name "SC"
    body.innerHTML = `
        <div class="rate-block fullart-block">
        <div class="rate-header">
            <div class="rate-title rarity fullart">★★★★★ Bihirang Tarjete</div> 
            <div class="rate-percent">${pct(faRate, 2)}</div>
        </div>
        <ul class="rate-list">
            ${faListHtml}
        </ul>
        </div>

        <div class="rate-block standard-block">
        <div class="rate-header">
            <div class="rate-title rarity standard">★★★ Ordinaryong Tarjete</div>
            <div class="rate-percent">${pct(scRate, 2)}</div>
        </div>

        ${scGroupHtml("TAO", "Silver Tauhan Cards")}
        ${scGroupHtml("TT",  "Silver Tagatulong")}
        ${scGroupHtml("TG",  "Silver Tagpuan")}
        ${scGroupHtml("KG",  "Silver Kagamitan")}
        </div>
    `;
}




// ==================== INITIALIZE ====================
const bannerManager = new BannerManager();
const energySystem = new EnergySystem();
const gachaSystem = new GachaSystem(bannerManager);
rebuildOwnedFromHistory();

function isCardsReady() {
    return Array.isArray(window.CARDS) && window.CARDS.length > 0;
}

function updateDrawButtonsReadyState() {
    const ready = isCardsReady();
    document.getElementById("draw1Btn").disabled = !ready || document.getElementById("draw1Btn").disabled;
    document.getElementById("draw5Btn").disabled = !ready || document.getElementById("draw5Btn").disabled;
}

// poll briefly on page load
const readyPoll = setInterval(() => {
    updateDrawButtonsReadyState();
    if (isCardsReady()) clearInterval(readyPoll);
}, 100);



// ==================== EVENT LISTENERS ====================
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'home_page.html';
});

document.getElementById('inventoryBtn').addEventListener('click', () => {
    // Sync settings UI from saved values
    const s = localStorage.getItem("inv_sort") || "az";
    const t = localStorage.getItem("inv_type") || "all";
    const sh = localStorage.getItem("inv_show") || "all";
    document.querySelectorAll('input[name="invSort"]').forEach(r => {
        r.checked = (r.value === s);
    });
    document.querySelectorAll('input[name="invType"]').forEach(r => (r.checked = (r.value === t)));
    document.querySelectorAll('input[name="invShow"]').forEach(r => (r.checked = (r.value === sh)));

    gachaSystem.loadInventory();
    ModalController.openModal("inventoryModal");
});

// Inventory: open Settings panel
const invSettingsBtn = document.getElementById("inventorySettingsBtn");
    if (invSettingsBtn) {
        invSettingsBtn.addEventListener("click", () => {
        ModalController.openModal("inventorySettingsModal");
        });
    }

// Inventory: live search
const invSearch = document.getElementById("inventorySearchInput");
if (invSearch) {
    invSearch.addEventListener("input", () => gachaSystem.loadInventory());
}

const invSort = document.getElementById("invSort");
const invType = document.getElementById("invType");
const invShow = document.getElementById("invShow");

function saveInvSetting(key, value) {
    localStorage.setItem(key, value);
    gachaSystem.loadInventory();
}

const invSortGroup = document.getElementById('invSortGroup');
if (invSortGroup) {
    invSortGroup.addEventListener('change', (e) => {
        if (e.target && e.target.name === 'invSort') {
        saveInvSetting('inv_sort', e.target.value);
        }
    });
}

const invTypeGroup = document.getElementById("invTypeGroup");
if (invTypeGroup) {
  invTypeGroup.addEventListener("change", (e) => {
    if (e.target && e.target.name === "invType") {
      saveInvSetting("inv_type", e.target.value);
    }
  });
}

const invShowGroup = document.getElementById("invShowGroup");
if (invShowGroup) {
  invShowGroup.addEventListener("change", (e) => {
    if (e.target && e.target.name === "invShow") {
      saveInvSetting("inv_show", e.target.value);
    }
  });
}

const detalyeBtn = document.getElementById("detalyeBtn");
if (detalyeBtn) {
  detalyeBtn.addEventListener("click", () => {
    renderRatesPanel();
    ModalController.openModal("detalyeModal");
  });
}



const historyaBtn = document.getElementById("historyaBtn");
if (historyaBtn) {
  historyaBtn.addEventListener("click", () => {
    gachaSystem.loadHistory();
    ModalController.openModal("historyaModal");
  });
}


document.getElementById("draw1Btn").addEventListener("click", () => {
    if (!isCardsReady()) {
    alert("Loading cards... please wait.");
    return;
    }

    if (!energySystem.consumeEnergy(CONFIG.DRAW1COST)) return;
    energySystem.updateUI();
    const results = gachaSystem.draw(1);
    gachaSystem.showResults(results);
});

document.getElementById("draw5Btn").addEventListener("click", () => {
    if (!isCardsReady()) {
    alert("Loading cards... please wait.");
    return;
    }


    if (!energySystem.consumeEnergy(CONFIG.DRAW5COST)) return;
    energySystem.updateUI();
    const results = gachaSystem.draw(5);
    gachaSystem.showResults(results);
});


document.getElementById("closeResultBtn").addEventListener("click", () => {
    const btn = document.getElementById("closeResultBtn");

    // If not all flipped yet, LAKTAWAN = reveal all
    if (btn.textContent.trim().toUpperCase() === "LAKTAWAN") {
        gachaSystem.revealAllCards();
        return;
    }

    // CONTINUE = close overlay
    const resultOverlay = document.getElementById("resultOverlay");
    resultOverlay.classList.remove("active");
    resultOverlay.setAttribute("aria-hidden", true);
});


ModalController.initCloseButtons();

// Prevent click on the image from bubbling and closing the modal
const cardViewerImage = document.getElementById("cardViewerImage");
if (cardViewerImage) {
    cardViewerImage.addEventListener("click", (e) => e.stopPropagation());
}


function openCheatInput() {
    const input = prompt("Cheat code:");
    if (!input) return;

    const parts = input.trim().toLowerCase().split(/\s+/);
    const cmd = parts[0];
    const arg = parts[1]; // optional

    const cheats = {
        // existing
        cheatresetimer: () => energySystem.resetTimerCheat(),
        cheatresettimer: () => energySystem.resetTimerCheat(),

        // NEW 1: reset whole account
        cheatresetaccount: () => {
        const ok = confirm("Ulitin ang account? Mawawala ang lahat ng iyong Tarjete");
        if (!ok) return;

        localStorage.removeItem(CONFIG.STORAGEKEY);
        localStorage.removeItem(CONFIG.HISTORYKEY);
        localStorage.removeItem(CONFIG.BANNERKEY);
        localStorage.removeItem(CONFIG.TIMEROVERRIDEKEY);
        localStorage.removeItem(CONFIG.DUPESKEY);


        localStorage.removeItem(CONFIG.OWNEDKEY);

        location.reload();
        },

        // NEW 2: change timer permanently (expects 6 digits HHMMSS)
        cheatchangetimertime: () => {
        if (!arg || !/^\d{6}$/.test(arg)) {
            alert("walang nangyari...");
            return;
        }

        const hh = Number(arg.slice(0, 2));
        const mm = Number(arg.slice(2, 4));
        const ss = Number(arg.slice(4, 6));
        const totalSeconds = (hh * 3600) + (mm * 60) + ss;

        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
            alert("walang nangyari...");
            return;
        }

        const ms = totalSeconds * 1000;
        CONFIG.PULLWINDOWMS = ms; // affects the running timer logic
        localStorage.setItem(CONFIG.TIMEROVERRIDEKEY, String(ms)); // makes it permanent

        // Optional: restart the cycle so the new window applies cleanly
        energySystem.resetTimerCheat();
        },

        cheatgiveuser: () => {
            const cardId = (arg || "").trim();
            if (!cardId) {
                alert("Gamit: cheatgiveuser [card ID]");
                return;
            }

            const cards = Array.isArray(window.CARDS) ? window.CARDS : [];
            const card = cards.find(c => String(c.id).toLowerCase() === cardId.toLowerCase());

            if (!card) {
                alert("Hindi mahanap ang: " + cardId);
                return;
            }

            // Add it to history as a 1-item entry so it becomes "owned"
            const raw = localStorage.getItem(CONFIG.HISTORYKEY);
            const history = raw ? JSON.parse(raw) : [];
            incrementCardCount(card.id, 1);
            addOwnedCardId(card.id);

            history.unshift({
                timestamp: Date.now(),
                banner: bannerManager?.currentBanner || "forest",
                items: [{ id: card.id, name: card.name }]
            });

            if (history.length > CONFIG.MAXHISTORYENTRIES) history.pop();
            localStorage.setItem(CONFIG.HISTORYKEY, JSON.stringify(history));

            // Refresh inventory UI if it's open
            gachaSystem.loadInventory();

            alert(`Binigay: ${card.name} (${card.id})`);
        },

        cheatgiveuserall: () => {
            const cards = Array.isArray(window.CARDS) ? window.CARDS : [];

            cards.forEach(c => addOwnedCardId(c.id));

            cards.forEach(c => incrementCardCount(c.id, 1));

            // Give all cards by adding them to history (so they become "owned")
            const history = [{
                timestamp: Date.now(),
                banner: bannerManager?.currentBanner || "forest",
                items: cards.map(c => ({ id: c.id, name: c.name }))
            }];

            localStorage.setItem(CONFIG.HISTORYKEY, JSON.stringify(history));

            // Refresh UI if inventory is open
            gachaSystem.loadInventory();

            alert(`Binigay ang lahat ng Tarjete (${cards.length}).`);
        },
    };

    if (!cheats[cmd]) {
        alert("walang nangyari...");
        return;
    }

    alert(`"${cmd}" ay ginamit`);
    cheats[cmd]();
}

const cheatBtn = document.getElementById("cheatBtn");
if (cheatBtn) {
    cheatBtn.addEventListener("click", openCheatInput);
    cheatBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCheatInput();
        }
    });
}



// ==================== RIPPLE EFFECT ====================
// Add ripple effect to all action buttons
document.querySelectorAll('.action-button, .nav-button').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// ==================== CONSOLE INFO ====================
console.log('🎮 Gacha system initialized');
console.log('📍 Current banner:', bannerManager.currentBanner);
console.log('⚡ Available energy:', energySystem.getAvailableEnergy(), 'hours');


