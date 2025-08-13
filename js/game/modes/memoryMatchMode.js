// Memory Match Mode Implementation
import { getProducts } from '../../services/productService.js';
import { getRandomProductIndex } from '../gameLogic.js';

class MemoryMatchGame {
    constructor() {
        this.gameProducts = [];
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 0;
        this.score = 0;
        this.gameBoard = null;
        this.isProcessing = false;
        this.startTime = null;
        this.timerInterval = null;
        this.elapsedTime = 0;
    }

    init() {
        this.gameBoard = document.getElementById('memory-grid');
        if (!this.gameBoard) {
            console.error('Memory game board element not found!');
            return;
        }
        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        // Back to modes button
        document.getElementById('back-to-modes-memory')?.addEventListener('click', () => {
            if (typeof showModeSelection === 'function') {
                showModeSelection();
            }
        });

        // Play again from result modal
        document.getElementById('memory-play-again')?.addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('memoryResultModal'));
            modal?.hide();
            this.startNewGame();
        });

        // Back to modes from result modal
        document.getElementById('memory-back-to-modes')?.addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('memoryResultModal'));
            modal?.hide();
            if (typeof showModeSelection === 'function') {
                showModeSelection();
            }
        });
    }

    startNewGame() {
        // Reset game state
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 0;
        this.score = 0;
        this.isProcessing = false;
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.startTimer();

        // Get products and select random ones for the game (6 products = 12 cards)
        const allProducts = getProducts();
        if (!allProducts || allProducts.length < 6) {
            console.error('Not enough products available for memory match game');
            return;
        }
        
        this.gameProducts = this.getRandomProducts(allProducts, 6);
        
        // Create card pairs
        this.createCards();
        
        // Render the game board
        this.renderGameBoard();
        
        // Update UI
        this.updateUI();
    }
     startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('memory-time');
        if (timerElement) {
            const minutes = Math.floor(this.elapsedTime / 60);
            const seconds = this.elapsedTime % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    getRandomProducts(products, count) {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    createCards() {
        this.cards = [];
        
        // Create pairs of cards
        this.gameProducts.forEach((product, index) => {
            // Product card
            this.cards.push({
                id: `product-${index}`,
                type: 'product',
                product: product,
                productIndex: index, // Add index for matching
                matched: false,
                flipped: false
            });
            
            // Price card
            this.cards.push({
                id: `price-${index}`,
                type: 'price',
                product: product,
                productIndex: index, // Add index for matching
                matched: false,
                flipped: false
            });
        });
        
        // Shuffle the cards
        this.shuffleCards();
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderGameBoard() {
        if (!this.gameBoard) return;
        
        this.gameBoard.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.gameBoard.appendChild(cardElement);
        });
    }

    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'memory-card';
        cardDiv.dataset.cardIndex = index;
        
        // Card back (hidden content)
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.innerHTML = '<i class="bi bi-question-circle"></i>';
        
        // Card front (revealed when flipped) - Fixed class name
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        
        if (card.type === 'product') {
            // Fixed: Use imageUrl instead of image
            cardFront.innerHTML = `
                <img src="${card.product.imageUrl}" alt="${card.product.name}" class="card-image">
                <div class="card-name">${card.product.name}</div>
            `;
        } else {
            cardFront.innerHTML = `
                <div class="card-name">السعر</div>
                <div class="card-price">${card.product.price} ريال</div>
            `;
        }
        
        cardDiv.appendChild(cardBack);
        cardDiv.appendChild(cardFront);
        
        // Add click event listener
        cardDiv.addEventListener('click', () => this.handleCardClick(index));
        
        return cardDiv;
    }

    handleCardClick(cardIndex) {
        if (this.isProcessing) return;
        
        const card = this.cards[cardIndex];
        
        // Don't allow clicking on already flipped or matched cards
        if (card.flipped || card.matched) return;
        
        // Don't allow more than 2 cards to be flipped
        if (this.flippedCards.length >= 2) return;
        
        // Flip the card
        this.flipCard(cardIndex);
        
        // Check for matches when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.attempts++;
            this.updateUI();
            
            setTimeout(() => {
                this.checkForMatch();
            }, 1000);
        }
    }

    flipCard(cardIndex) {
        const card = this.cards[cardIndex];
        const cardElement = this.gameBoard.children[cardIndex];
        
        card.flipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push(cardIndex);
    }

    checkForMatch() {
        this.isProcessing = true;
        
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        
        // Fixed: Use productIndex instead of product.id
        const isMatch = firstCard.productIndex === secondCard.productIndex && 
                       firstCard.type !== secondCard.type;
        
        if (isMatch) {
            // Mark cards as matched
            firstCard.matched = true;
            secondCard.matched = true;
            
            const firstElement = this.gameBoard.children[firstIndex];
            const secondElement = this.gameBoard.children[secondIndex];
            
            firstElement.classList.add('matched');
            secondElement.classList.add('matched');
            
            this.matchedPairs++;
            this.score += 100;
            
            // Bonus points for fewer attempts
            if (this.attempts <= this.matchedPairs) {
                this.score += 50;
            }
            
        } else {
            // Flip cards back
            setTimeout(() => {
                firstCard.flipped = false;
                secondCard.flipped = false;
                
                const firstElement = this.gameBoard.children[firstIndex];
                const secondElement = this.gameBoard.children[secondIndex];
                
                firstElement.classList.remove('flipped');
                secondElement.classList.remove('flipped');
            }, 500);
        }
        
        // Clear flipped cards array
        this.flippedCards = [];
        this.isProcessing = false;
        
        // Update UI
        this.updateUI();
        
        // Check if game is complete
        if (this.matchedPairs === this.gameProducts.length) {
            setTimeout(() => {
                this.showGameResult();
            }, 1000);
        }
    }

    updateUI() {
        // Update score
        const scoreElement = document.getElementById('memory-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // Update matched pairs
        const pairsElement = document.getElementById('memory-pairs');
        if (pairsElement) {
            pairsElement.textContent = this.matchedPairs;
        }
        
        // Update attempts/moves
        const movesElement = document.getElementById('memory-moves');
        if (movesElement) {
            movesElement.textContent = this.attempts;
        }

         // Update timer display
        this.updateTimerDisplay();
    }

    showGameResult() {
        // Stop the timer when game ends
        this.stopTimer();
        const accuracy = this.attempts > 0 ? Math.round((this.matchedPairs / this.attempts) * 100) : 0;
        
        // Update final score
        const finalScoreElement = document.getElementById('final-memory-score');
        if (finalScoreElement) {
            finalScoreElement.textContent = this.score;
        }
        
        // Update final moves
        const finalMovesElement = document.getElementById('final-memory-moves');
        if (finalMovesElement) {
            finalMovesElement.textContent = this.attempts;
        }
        // Update final time
        const finalTimeElement = document.getElementById('final-memory-time');
    if (finalTimeElement) {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        finalTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

        // Update accuracy
        const accuracyElement = document.getElementById('final-memory-accuracy');
        if (accuracyElement) {
            accuracyElement.textContent = `${accuracy}%`;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('memoryResultModal'));
        modal.show();
    }
}

// Export the game class
export { MemoryMatchGame };

// Initialize and export game instance
let memoryMatchGame = null;

export function initMemoryMatch() {
    memoryMatchGame = new MemoryMatchGame();
    memoryMatchGame.init();
    return memoryMatchGame;
}

export function getMemoryMatchGame() {
    return memoryMatchGame;
}