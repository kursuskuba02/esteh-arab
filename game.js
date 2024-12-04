// Game state
const gameState = {
    level: 1,
    fulus: 0,
    patience: 100,
    isPlaying: false,
    customerTimer: null,
    gameTimer: null,
    timeLeft: 180, // 3 minutes in seconds
    leaderboard: [],
    arabicNumbers: {
        1: { arabic: 'وَاحِد', pronunciation: 'wahid' },
        2: { arabic: 'اِثْنَان', pronunciation: 'ithnan' },
        3: { arabic: 'ثَلَاثَة', pronunciation: 'thalatha' },
        4: { arabic: 'أَرْبَعَة', pronunciation: 'arbaa' },
        5: { arabic: 'خَمْسَة', pronunciation: 'khamsa' },
        6: { arabic: 'سِتَّة', pronunciation: 'sitta' },
        7: { arabic: 'سَبْعَة', pronunciation: 'sabaa' },
        8: { arabic: 'ثَمَانِيَة', pronunciation: 'thamaniya' },
        9: { arabic: 'تِسْعَة', pronunciation: 'tisaa' },
        10: { arabic: 'عَشَرَة', pronunciation: 'ashara' }
    },
    teaTypes: {
        '☕': { arabic: 'شاي عادي', emoji: '☕' },
        '🍵': { arabic: 'شاي أخضر', emoji: '🍵' },
        '🫖': { arabic: 'شاي عربي', emoji: '🫖' },
        '🧋': { arabic: 'شاي بوبا', emoji: '🧋' }
    },
    customerEmojis: [
        '👨', '🧑', '👦', '🧓', '👴', '👶', '👨‍🦰', '🧑‍🦱', '👩‍🦱', '🧑‍🦰',
        '👳‍♀️', '👳‍♂️', '💂‍♀️', '🕵️', '👷', '👨‍⚕️', '🧑‍🎓', '👩‍🌾', '👩‍🏭',
        '🧑‍🏫', '👩‍💻', '👨‍✈️', '🧕', '🧑‍🚀', '🧛'
    ],
    currentCustomer: null,
    currentOrders: [],
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Start game immediately when the page loads
    startGame();
});

function startGame() {
    gameState.level = 1;
    gameState.fulus = 0;
    gameState.isPlaying = true;
    gameState.timeLeft = 180;
    UI.updateDisplay(gameState.level, gameState.fulus);
    generateOrder();
    startCustomerTimer();
    startGameTimer();
}

function startCustomerTimer() {
    if (gameState.customerTimer) {
        clearInterval(gameState.customerTimer);
    }
    
    gameState.patience = 100;
    UI.updatePatienceBar(gameState.patience);
    
    const totalTime = 15000; // 15 seconds
    const updateInterval = 50; // Update every 50ms for smooth animation
    const decrementPerTick = (100 * updateInterval) / totalTime;
    
    gameState.customerTimer = setInterval(() => {
        if (!gameState.isPlaying) {
            clearInterval(gameState.customerTimer);
            return;
        }

        gameState.patience = Math.max(0, gameState.patience - decrementPerTick);
        UI.updatePatienceBar(gameState.patience);

        if (gameState.patience <= 0) {
            customerLeft();
        }
    }, updateInterval);
}

function startGameTimer() {
    const timerElement = document.getElementById('timer');
    
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
    }

    gameState.gameTimer = setInterval(() => {
        gameState.timeLeft--;
        
        // Update timer display
        const minutes = Math.floor(gameState.timeLeft / 60);
        const seconds = gameState.timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Check if time is up
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameTimer);
    clearInterval(gameState.customerTimer);
    
    // Prompt for player name
    const playerName = prompt('Waktu habis! Masukkan nama Anda:', '');
    if (playerName) {
        // Add to leaderboard
        gameState.leaderboard.push({
            name: playerName,
            score: gameState.fulus,
            date: new Date().toLocaleDateString()
        });
        
        // Sort leaderboard by score
        gameState.leaderboard.sort((a, b) => b.score - a.score);
        
        // Show leaderboard
        let leaderboardText = 'PAPAN SKOR:\n\n';
        gameState.leaderboard.forEach((entry, index) => {
            leaderboardText += `${index + 1}. ${entry.name}: ${entry.score} 💰 (${entry.date})\n`;
        });
        alert(leaderboardText);
    }
    
    // Reset and restart game
    startGame();
}

function generateOrder() {
    // Get random customer emoji
    const randomCustomerIndex = Math.floor(Math.random() * gameState.customerEmojis.length);
    gameState.currentCustomer = gameState.customerEmojis[randomCustomerIndex];
    
    // Update customer display
    const customerEmojiElement = document.getElementById('customer-emoji');
    if (customerEmojiElement) {
        customerEmojiElement.textContent = gameState.currentCustomer;
        // Reset animation
        customerEmojiElement.style.animation = 'none';
        customerEmojiElement.offsetHeight; // Trigger reflow
        customerEmojiElement.style.animation = null;
    }

    const availableTypes = Object.values(gameState.teaTypes);
    const numOrders = Math.min(Math.floor(Math.random() * gameState.level) + 1, 3);
    const selectedTypes = [];
    gameState.currentOrders = [];
    
    // Randomly select unique tea types
    while (selectedTypes.length < numOrders && selectedTypes.length < availableTypes.length) {
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        if (!selectedTypes.find(t => t.emoji === randomType.emoji)) {
            selectedTypes.push(randomType);
        }
    }
    
    // Generate orders with random quantities between 1-10
    selectedTypes.forEach(type => {
        const quantity = Math.floor(Math.random() * 10) + 1;
        gameState.currentOrders.push({
            quantity,
            type,
            arabicNumber: gameState.arabicNumbers[quantity]
        });
    });
    
    UI.displayOrder(gameState.currentOrders);
}

function checkOrder() {
    const trayContents = UI.getTrayContents();
    let correct = true;
    
    // Check each order
    gameState.currentOrders.forEach(order => {
        const orderCount = order.quantity;
        const orderType = order.type.emoji;
        
        // Count how many of this type are in the tray
        const trayCount = trayContents.filter(item => item === orderType).length;
        
        if (trayCount !== orderCount) {
            correct = false;
        }
    });
    
    if (correct) {
        // Reward based on remaining patience and level
        const baseReward = 10;
        const patienceBonus = Math.floor(gameState.patience / 20);
        const levelBonus = gameState.level;
        const reward = baseReward + patienceBonus + levelBonus;
        
        gameState.fulus += reward;
        gameState.level++;
        
        UI.showEmotion(true);
        UI.updateDisplay(gameState.level, gameState.fulus);
        UI.clearTray();
        generateOrder();
        startCustomerTimer();
    } else {
        UI.showEmotion(false);
        // Penalty for wrong order
        gameState.patience = Math.max(0, gameState.patience - 20);
        UI.updatePatienceBar(gameState.patience);
        
        if (gameState.patience <= 0) {
            customerLeft();
        }
    }
}

function customerLeft() {
    UI.showEmotion(false);
    gameState.level = Math.max(1, gameState.level - 1);
    UI.updateDisplay(gameState.level, gameState.fulus);
    UI.clearTray();
    generateOrder();
    startCustomerTimer();
}
