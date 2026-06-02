// Game State
const gameState = {
    score: 0,
    perClick: 1,
    perSecond: 0,
    combo: 1,
    comboTimer: null,
    upgrades: {
        cursor: { owned: 0, level: 1 },
        grandma: { owned: 0, level: 1 },
        farm: { owned: 0, level: 1 },
        factory: { owned: 0, level: 1 },
        mine: { owned: 0, level: 1 },
    }
};

// Upgrade Definitions
const upgradeDefs = {
    cursor: {
        name: 'Better Cursor',
        icon: '🖱️',
        description: '+0.1 per click',
        baseCost: 10,
        effect: () => gameState.perClick += 0.1
    },
    grandma: {
        name: 'Grandma',
        icon: '👵',
        description: '+0.5 per second',
        baseCost: 100,
        effect: () => gameState.perSecond += 0.5
    },
    farm: {
        name: 'Farm',
        icon: '🌾',
        description: '+1 per second',
        baseCost: 500,
        effect: () => gameState.perSecond += 1
    },
    factory: {
        name: 'Factory',
        icon: '🏭',
        description: '+3 per second',
        baseCost: 3000,
        effect: () => gameState.perSecond += 3
    },
    mine: {
        name: 'Mine',
        icon: '⛏️',
        description: '+5 per second',
        baseCost: 10000,
        effect: () => gameState.perSecond += 5
    }
};

// DOM Elements
const clickButton = document.getElementById('clickButton');
const scoreDisplay = document.getElementById('score');
const perClickDisplay = document.getElementById('perClick');
const perSecondDisplay = document.getElementById('perSecond');
const upgradesGrid = document.getElementById('upgradesGrid');
const resetButton = document.getElementById('resetButton');
const comboFill = document.getElementById('comboFill');
const comboText = document.getElementById('comboText');

// Initialize
function init() {
    loadGame();
    setupEventListeners();
    renderUpgrades();
    setInterval(tickPassiveIncome, 100);
    updateDisplay();
}

// Event Listeners
function setupEventListeners() {
    clickButton.addEventListener('click', handleClick);
    resetButton.addEventListener('click', resetGame);
}

// Handle Click
function handleClick() {
    const clickValue = gameState.perClick * gameState.combo;
    gameState.score += clickValue;

    // Create floating text
    createFloatingText(clickButton, `+${Math.round(clickValue)}`);

    // Update combo
    updateCombo();

    // Update display
    updateDisplay();
}

// Create floating text animation
function createFloatingText(element, text) {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = text;

    const rect = element.getBoundingClientRect();
    floatingText.style.left = (rect.left + rect.width / 2) + 'px';
    floatingText.style.top = (rect.top + rect.height / 2) + 'px';
    floatingText.style.color = `hsl(${Math.random() * 60 + 200}, 100%, 50%)`;

    document.body.appendChild(floatingText);

    setTimeout(() => floatingText.remove(), 1000);
}

// Combo System
function updateCombo() {
    gameState.combo = Math.min(1 + (gameState.score / 1000), 10);
    const comboPercent = ((gameState.combo - 1) / 9) * 100;
    comboFill.style.width = comboPercent + '%';
    comboText.textContent = `Combo: x${gameState.combo.toFixed(2)}`;
}

// Passive Income
function tickPassiveIncome() {
    const income = gameState.perSecond / 10; // Divided by 10 because we tick 10 times per second
    gameState.score += income;
    updateDisplay();
}

// Update Display
function updateDisplay() {
    scoreDisplay.textContent = Math.floor(gameState.score);
    perClickDisplay.textContent = gameState.perClick.toFixed(1);
    perSecondDisplay.textContent = gameState.perSecond.toFixed(1);
}

// Render Upgrades
function renderUpgrades() {
    upgradesGrid.innerHTML = '';

    for (const [key, def] of Object.entries(upgradeDefs)) {
        const upgrade = gameState.upgrades[key];
        const cost = calculateCost(def.baseCost, upgrade.level);
        const canAfford = gameState.score >= cost;

        const card = document.createElement('div');
        card.className = `upgrade-card ${canAfford ? '' : 'locked'}`;

        card.innerHTML = `
            <div class="upgrade-icon">${def.icon}</div>
            <div class="upgrade-name">${def.name}</div>
            <div class="upgrade-description">${def.description}</div>
            <div class="upgrade-cost">Cost: ${Math.floor(cost)}</div>
            <div class="upgrade-owned">Owned: ${upgrade.owned}</div>
        `;

        card.addEventListener('click', () => {
            if (canAfford) {
                buyUpgrade(key);
            }
        });

        upgradesGrid.appendChild(card);
    }
}

// Calculate Cost
function calculateCost(baseCost, level) {
    return baseCost * Math.pow(1.15, level - 1);
}

// Buy Upgrade
function buyUpgrade(key) {
    const def = upgradeDefs[key];
    const upgrade = gameState.upgrades[key];
    const cost = calculateCost(def.baseCost, upgrade.level);

    if (gameState.score >= cost) {
        gameState.score -= cost;
        upgrade.owned += 1;
        upgrade.level += 1;

        // Apply the upgrade effect
        def.effect();

        updateDisplay();
        renderUpgrades();
        saveGame();

        // Create celebration effect
        createFloatingText(document.querySelector('.upgrades-section'), `${def.name} Purchased!`);
    }
}

// Reset Game
function resetGame() {
    if (confirm('Are you sure you want to reset your game? This cannot be undone.')) {
        gameState.score = 0;
        gameState.perClick = 1;
        gameState.perSecond = 0;
        gameState.combo = 1;
        gameState.upgrades = {
            cursor: { owned: 0, level: 1 },
            grandma: { owned: 0, level: 1 },
            farm: { owned: 0, level: 1 },
            factory: { owned: 0, level: 1 },
            mine: { owned: 0, level: 1 },
        };

        updateDisplay();
        renderUpgrades();
        saveGame();
    }
}

// Save/Load Game
function saveGame() {
    localStorage.setItem('clickerGameState', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('clickerGameState');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(gameState, loaded);
    }
    updateCombo();
}

// Start the game
init();
