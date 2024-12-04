// UI Controller
const UI = {
    elements: {
        levelDisplay: document.getElementById('level'),
        fulusDisplay: document.getElementById('fulus'),
        patienceBar: document.getElementById('patience-bar'),
        tray: document.getElementById('tray'),
        clearTrayButton: document.getElementById('clear-tray'),
        serveButton: document.getElementById('serve-order'),
        emotionPopup: document.getElementById('popup-emotion'),
        customerSpeech: document.getElementById('customer-speech'),
        selectedDrinkIcon: document.querySelector('.selected-icon'),
        quantityDisplay: document.querySelector('.quantity'),
        minusButton: document.querySelector('.minus-btn'),
        plusButton: document.querySelector('.plus-btn'),
        addButton: document.querySelector('.add-btn'),
        teaButtons: document.querySelectorAll('.tea-button')
    },
    selectedDrink: null,
    currentQuantity: 0,
    initialized: false,

    init() {
        if (this.initialized) return;
        
        // Initialize tea buttons
        this.elements.teaButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selected class from all buttons
                this.elements.teaButtons.forEach(b => b.classList.remove('selected'));
                // Add selected class to clicked button
                btn.classList.add('selected');
                // Update selected drink
                this.selectedDrink = btn.dataset.drink;
                // Update selected drink display
                if (this.elements.selectedDrinkIcon) {
                    this.elements.selectedDrinkIcon.textContent = this.selectedDrink;
                }
            });
        });

        // Initialize quantity controls
        if (this.elements.minusButton) {
            this.elements.minusButton.addEventListener('click', () => {
                if (this.currentQuantity > 0) {
                    this.currentQuantity--;
                    this.updateQuantityDisplay();
                }
            });
        }

        if (this.elements.plusButton) {
            this.elements.plusButton.addEventListener('click', () => {
                if (this.currentQuantity < 10) {
                    this.currentQuantity++;
                    this.updateQuantityDisplay();
                }
            });
        }

        // Initialize add button
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', () => {
                if (this.selectedDrink && this.currentQuantity > 0) {
                    for (let i = 0; i < this.currentQuantity; i++) {
                        this.addToTray({ emoji: this.selectedDrink });
                    }
                    // Reset quantity after adding
                    this.currentQuantity = 0;
                    this.updateQuantityDisplay();
                }
            });
        }

        // Initialize clear tray button
        if (this.elements.clearTrayButton) {
            this.elements.clearTrayButton.addEventListener('click', () => this.clearTray());
        }

        // Initialize serve button
        if (this.elements.serveButton) {
            this.elements.serveButton.addEventListener('click', () => {
                if (typeof checkOrder === 'function') {
                    checkOrder();
                }
            });
        }
        
        this.initialized = true;
    },

    updateQuantityDisplay() {
        if (this.elements.quantityDisplay) {
            this.elements.quantityDisplay.textContent = this.currentQuantity;
        }
    },

    updateDisplay(level, fulus) {
        if (this.elements.levelDisplay) this.elements.levelDisplay.textContent = level;
        if (this.elements.fulusDisplay) this.elements.fulusDisplay.textContent = fulus;
    },

    updatePatienceBar(percentage) {
        if (this.elements.patienceBar) {
            const width = Math.max(0, Math.min(100, percentage));
            this.elements.patienceBar.style.width = `${width}%`;
        }
    },

    showEmotion(isHappy) {
        if (this.elements.emotionPopup) {
            const emotion = isHappy ? '😊' : '😠';
            this.elements.emotionPopup.textContent = emotion;
            this.elements.emotionPopup.className = 'emotion-popup'; // Reset classes
            
            // Add appropriate classes
            this.elements.emotionPopup.classList.add('show');
            this.elements.emotionPopup.classList.add(isHappy ? 'happy' : 'angry');
            
            // Remove classes after animation
            setTimeout(() => {
                this.elements.emotionPopup.className = 'emotion-popup';
            }, 1000);
        }
    },

    displayOrder(orders) {
        if (this.elements.customerSpeech) {
            const orderText = orders.map(order => 
                `${order.arabicNumber.arabic} ${order.type.emoji}`
            ).join(' ');
            this.elements.customerSpeech.innerHTML = orderText;
        }
    },

    clearTray() {
        if (this.elements.tray) {
            this.elements.tray.innerHTML = '';
        }
    },

    addToTray(teaType) {
        if (this.elements.tray && teaType.emoji) {
            const teaElement = document.createElement('span');
            teaElement.textContent = teaType.emoji;
            teaElement.style.fontSize = '24px';
            this.elements.tray.appendChild(teaElement);
        }
    },

    getTrayContents() {
        if (!this.elements.tray) return [];
        return Array.from(this.elements.tray.children).map(child => child.textContent);
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
