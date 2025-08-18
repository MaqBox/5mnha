// Basket Mode Implementation - Guess prices for 3-6 products with 6 attempts each
import { getProducts } from '../../services/productService.js';
import { getRandomProductIndex, checkGuess } from '../gameLogic.js';
import { setupInputValidationFor, validateGuess } from '../../components/inputHandler.js';
import { toArabicNumerals } from '../../utils/arabicNumerals.js';

class BasketGame {
    constructor() {
        this.gameProducts = [];
        this.totalPrice = 0;
        this.maxAttempts = 6;
        this.currentAttempts = 0;
        this.totalScore = 0;
        this.gameComplete = false;
        this.minProducts = 3;
        this.maxProducts = 6;
        this.guesses = []; // Add guesses array for immediate feedback
        this.maxGuessesDisplay = 3; // Maximum guesses to display in container
    }

    // Update the init method to use correct IDs
    init() {
        // Add missing element initializations
        this.gameContainer = document.getElementById('basket-game-container');
        this.productsGrid = document.getElementById('basket-products-grid');
        
        // Scope the input selection to the basket container to avoid duplicate-ID conflicts
        this.priceInput = this.gameContainer ? this.gameContainer.querySelector('#guess-input') : null;
        // Debug warning if duplicate guess inputs exist in the DOM
        const allGuessInputs = document.querySelectorAll('#guess-input');
        if (allGuessInputs.length > 1) {
            console.warn(`Detected ${allGuessInputs.length} elements with id="guess-input". Scoping to basket container to avoid conflicts.`, allGuessInputs);
        }

        this.submitButton = document.getElementById('basket-submit-guess');
        this.feedbackSection = document.getElementById('basket-feedback');
        this.feedbackContent = document.getElementById('basket-feedback-content');
        this.tryAgainButton = document.getElementById('basket-try-again');
        this.newGameButton = document.getElementById('basket-new-game');
        this.guessContainer = document.getElementById('basket-guess-container');
        this.currentAttemptElement = document.getElementById('basket-current-attempt');
        this.maxAttemptsElement = document.getElementById('basket-max-attempts');
        
        // Update validation array - remove undefined elements
        const requiredElements = [
            this.gameContainer, this.productsGrid, this.priceInput, 
            this.submitButton, this.feedbackSection, this.feedbackContent,
            this.tryAgainButton, this.newGameButton, this.guessContainer,
            this.currentAttemptElement, this.maxAttemptsElement
        ];
        
        if (requiredElements.some(element => !element)) {
            console.error('One or more required elements not found in basket mode');
            return;
        }

        // Attach shared numeric-only filters to basket input
        setupInputValidationFor(this.priceInput);
        
        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        // Submit guess
        this.submitButton?.addEventListener('click', () => this.submitGuess());
        
        // Enter key for input
        this.priceInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitGuess();
            }
        });
        
        // Try again button
        this.tryAgainButton?.addEventListener('click', () => this.tryAgain());
        
        // New game button
        this.newGameButton?.addEventListener('click', () => this.startNewGame());
        
        // Back to modes button
        const backButton = document.getElementById('back-to-modes-basket');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.showModeSelection();
            });
        }
    }

    startNewGame() {
        console.log('Starting new basket game...');
        
        // Reset game state
        this.currentAttempts = 0;
        this.totalScore = 0;
        this.gameComplete = false;
        this.guesses = []; // Reset guesses array
        
        // Select random products
        this.selectGameProducts();
        
        // Display all products
        this.displayAllProducts();
        this.updateUI();
        this.hideFeedback();
        this.clearGuesses(); // Clear previous guesses
    }

    selectGameProducts() {
        const allProducts = getProducts();
        if (!allProducts || allProducts.length < this.minProducts) {
            console.error('Not enough products available for basket mode');
            return;
        }
        
        // Select random number of products between min and max
        const numProducts = Math.floor(Math.random() * (this.maxProducts - this.minProducts + 1)) + this.minProducts;
        
        // Randomly select products
        this.gameProducts = [];
        const usedIndices = new Set();
        
        while (this.gameProducts.length < numProducts) {
            const randomIndex = getRandomProductIndex(allProducts);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                this.gameProducts.push(allProducts[randomIndex]);
            }
        }
        
        // Calculate total price (currency-safe to 2 decimals)
        const rawTotal = this.gameProducts.reduce((sum, product) => sum + Number(product.price), 0);
        this.totalPrice = Math.round(rawTotal * 100) / 100;
        
        console.log(`Selected ${this.gameProducts.length} products for basket mode. Total price: ${this.totalPrice}`);
    }

    displayAllProducts() {
        if (!this.productsGrid) return;
        
        this.productsGrid.innerHTML = '';
        
        this.gameProducts.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-4 col-sm-6';
            productCard.innerHTML = `
                <div class="product-card h-100">
                    <div class="product-image-container">
                        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    </div>
                    <div class="product-info">
                        <h6 class="product-name">${product.name}</h6>
                    </div>
                </div>
            `;
            this.productsGrid.appendChild(productCard);
        });
        
        // Clear input
        if (this.priceInput) {
            this.priceInput.value = '';
            this.priceInput.focus();
        }

        // Enable click-to-enlarge on product images (same behavior as classic mode)
        const modalElement = document.getElementById('imageModal');
        const modalImage = document.getElementById('modal-image');
        if (modalElement && modalImage) {
            const images = this.productsGrid.querySelectorAll('.product-image');
            images.forEach(img => {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    modalImage.src = img.src;
                    modalImage.alt = img.alt || 'Product image';
                    const imageModal = new bootstrap.Modal(modalElement);
                    imageModal.show();
                });
            });
        } else {
            console.warn('Image modal elements not found; ensure modals.html is loaded.');
        }
    }

    submitGuess() {
        // Add null check for priceInput
        if (!this.priceInput) {
            console.error('Price input element not found');
            return;
        }
        
        // Debug: Log the raw input value
        const rawValue = this.priceInput.value;
        console.log('Raw input value:', rawValue);
        
        // Use shared validation for consistency with regular mode
        const validation = validateGuess(rawValue);
        if (!validation.valid) {
            // Keep silent behavior consistent with regular mode
            return;
        }
        const guess = validation.value;
        console.log('Validated guess:', guess);

        // Comprehensive overflow handling
        if (this.currentAttempts >= this.maxAttempts) {
            this.handleAttemptOverflow();
            return;
        }

        // Check if guess display container would overflow
        if (this.guesses.length >= this.maxGuessesDisplay) {
            this.handleGuessDisplayOverflow();
        }
        
        this.currentAttempts++;
        
        // Calculate immediate feedback using custom logic for basket mode
        const result = this.checkBasketGuess(guess);
        
        // Add guess to array for immediate feedback
        this.guesses.push({ value: guess, result });
        
        // Render guesses with immediate feedback
        this.renderGuesses();
        
        // Clear input with null check
        if (this.priceInput) {
            this.priceInput.value = '';
        }
        
        const difference = Math.abs(guess - this.totalPrice);
        const percentageError = (difference / this.totalPrice) * 100;
        
        // Calculate score based on accuracy
        let points = 0;
        let accuracy = '';
        
        if (percentageError <= 5) {
            points = 100;
            accuracy = 'ممتاز';
        } else if (percentageError <= 15) {
            points = 75;
            accuracy = 'جيد';
        } else if (percentageError <= 30) {
            points = 50;
            accuracy = 'مقبول';
        } else {
            points = 25;
            accuracy = 'ضعيف';
        }
        
        // Bonus points for fewer attempts
        const attemptBonus = Math.max(0, (this.maxAttempts - this.currentAttempts) * 10);
        points += attemptBonus;
        
        this.totalScore = points;
        
        this.updateUI();
        
        // End game after correct guess or max attempts
        if (result.correct || this.currentAttempts >= this.maxAttempts) {
            setTimeout(() => {
                // Ensure no inline feedback panel is shown; show only the modal
                this.hideFeedback();
                this.showBasketEndModal(guess, this.totalPrice, result.correct);
                this.endGame();
            }, 1000);
        }
    }

    // Handle attempt overflow with user feedback
    handleAttemptOverflow() {
        const remainingAttempts = this.maxAttempts - this.currentAttempts;
        
        if (remainingAttempts <= 0) {
            // Disable input and submit button
            if (this.priceInput) {
                this.priceInput.disabled = true;
                this.priceInput.placeholder = 'انتهت المحاولات المتاحة';
            }
            if (this.submitButton) {
                this.submitButton.disabled = true;
                this.submitButton.textContent = 'انتهت المحاولات';
            }
            
            // Show final result via modal only (no inline panel)
            setTimeout(() => {
                this.hideFeedback();
                this.showBasketEndModal(0, this.totalPrice, false);
                this.endGame();
            }, 1000);
        } else {
            // No inline warnings; keep UI clean until round ends
        }
    }

    // Handle guess display overflow
    handleGuessDisplayOverflow() {
        // Remove oldest guess to make room for new one
        if (this.guesses.length >= this.maxGuessesDisplay) {
            this.guesses.shift(); // Remove first (oldest) guess
            
            // Show overflow indicator
            this.showOverflowIndicator();
        }
    }

    // Show overflow indicator to user
    showOverflowIndicator() {
        const overflowIndicator = document.createElement('div');
        overflowIndicator.className = 'overflow-indicator text-muted small text-center mb-2';
        overflowIndicator.innerHTML = '<i class="bi bi-three-dots"></i> المحاولات الأقدم مخفية';
        
        // Insert at top of guess container
        if (this.guessContainer && !this.guessContainer.querySelector('.overflow-indicator')) {
            this.guessContainer.insertBefore(overflowIndicator, this.guessContainer.firstChild);
            
            // Remove indicator after 3 seconds
            setTimeout(() => {
                if (overflowIndicator.parentNode) {
                    overflowIndicator.remove();
                }
            }, 3000);
        }
    }

    // Enhanced renderGuesses with overflow handling
    renderGuesses() {
        if (!this.guessContainer) return;
        
        // Clear container but preserve overflow indicator
        const overflowIndicator = this.guessContainer.querySelector('.overflow-indicator');
        this.guessContainer.innerHTML = '';
        
        // Re-add overflow indicator if it existed
        if (overflowIndicator) {
            this.guessContainer.appendChild(overflowIndicator);
        }
        
        // Render only the most recent guesses (up to maxGuessesDisplay)
        const displayGuesses = this.guesses.slice(-this.maxGuessesDisplay);
        
        displayGuesses.forEach(guess => {
            const guessElement = document.createElement('div');
            guessElement.className = `guess-item`;
            const displayString = toArabicNumerals(String(guess.value));
            guessElement.innerHTML = `
                <div class="guess-box">
                    <div class="guess-price">
                        <span class="price-number">${displayString}</span>
                        <span class="price-symbol">
                            <img src="images/sar/Saudi_Riyal_Symbol-1.png" alt="SAR" class="sar-symbol" />
                        </span>
                    </div>
                    <div class="guess-indicator ${guess.result.color || ''}">
                        ${guess.result.message}
                    </div>
                </div>
            `;
            this.guessContainer.appendChild(guessElement);
        });
        
        // Auto-scroll to bottom to show latest guess
        this.guessContainer.scrollTop = this.guessContainer.scrollHeight;
    }

    // Enhanced tryAgain with proper state reset
    tryAgain() {
        if (this.currentAttempts >= this.maxAttempts) {
            this.startNewGame();
            return;
        }
        
        // Re-enable input and submit button if they were disabled
        if (this.priceInput) {
            this.priceInput.disabled = false;
            this.priceInput.placeholder = 'أدخل السعر الإجمالي';
        }
        if (this.submitButton) {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'تأكيد التخمين';
        }
        
        this.hideFeedback();
        if (this.priceInput) {
            this.priceInput.value = '';
            this.priceInput.focus();
        }
    }

    showGuessResult(guess, actualTotal, points, percentageError, accuracy) {
        const isCorrect = percentageError <= 5;
        const difference = Math.abs(guess - actualTotal);
        
        let feedbackHTML = `
            <div class="result-summary text-center">
                <div class="result-icon mb-3">
                    ${isCorrect ? 
                        '<i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>' : 
                        '<i class="bi bi-x-circle-fill text-danger" style="font-size: 3rem;"></i>'
                    }
                </div>
                <h4 class="${isCorrect ? 'text-success' : 'text-danger'} mb-3">
                    ${isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
                </h4>
                <div class="price-comparison mb-3">
                    <p class="mb-1"><strong>تخمينك:</strong> ${guess.toFixed(2)} ريال</p>
                    <p class="mb-1"><strong>السعر الصحيح:</strong> ${actualTotal.toFixed(2)} ريال</p>
                    <p class="mb-1"><strong>الفرق:</strong> ${difference.toFixed(2)} ريال</p>
                    <p class="mb-1"><strong>نسبة الخطأ:</strong> ${percentageError.toFixed(1)}%</p>
                </div>
                <div class="score-info">
                    <span class="badge bg-primary fs-6">النقاط المكتسبة: ${points}</span>
                    <span class="badge bg-secondary fs-6 ms-2">التقييم: ${accuracy}</span>
                    <span class="badge bg-info fs-6 ms-2">المحاولة: ${this.currentAttempts}/${this.maxAttempts}</span>
                </div>
            </div>
        `;
        
        this.feedbackContent.innerHTML = feedbackHTML;
        this.showFeedback();
    }

    showFeedback(message = '', type = 'info') {
        if (message) {
            this.feedbackContent.innerHTML = `<div class="alert alert-${type === 'warning' ? 'warning' : 'info'}">${message}</div>`;
        }
        this.feedbackSection?.classList.remove('d-none');
    }

    hideFeedback() {
        this.feedbackSection?.classList.add('d-none');
    }

    tryAgain() {
        if (this.currentAttempts >= this.maxAttempts) {
            this.startNewGame();
            return;
        }
        
        this.hideFeedback();
        if (this.priceInput) {
            this.priceInput.value = '';
            this.priceInput.focus();
        }
    }

    updateUI() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.totalScore;
        }
        
        if (this.totalProductsElement) {
            this.totalProductsElement.textContent = this.gameProducts.length;
        }
        
        if (this.attemptsRemainingElement) {
            this.attemptsRemainingElement.textContent = this.maxAttempts - this.currentAttempts;
        }
        
        // Update attempts counter
        if (this.currentAttemptElement) {
            this.currentAttemptElement.textContent = this.currentAttempts;
        }
        
        if (this.maxAttemptsElement) {
            this.maxAttemptsElement.textContent = this.maxAttempts;
        }
    }

    // Add the missing clearGuesses method
    clearGuesses() {
        if (this.guessContainer) {
            this.guessContainer.innerHTML = '';
        }
        this.guesses = [];
    }

    // Add custom checkGuess method for basket mode
    checkBasketGuess(guess) {
        const normalizedGuess = Math.round(guess * 100) / 100;
        const normalizedTotal = Math.round(this.totalPrice * 100) / 100;
        
        if (normalizedGuess === normalizedTotal) {
            return {
                correct: true,
                message: `<i class="bi bi-check-circle-fill"></i>`,
                color: 'bg-success bg-opacity-25'
            };
        } else if (guess < this.totalPrice) {
            return {
                correct: false,
                message: `<i class="bi bi-arrow-up-circle-fill"></i>`,
                color: 'bg-danger bg-opacity-25'
            };
        } else {
            return {
                correct: false,
                message: `<i class="bi bi-arrow-down-circle-fill"></i>`,
                color: 'bg-success bg-opacity-25'
            };
        }
    }

    endGame() {
        this.gameComplete = true;
        console.log('Basket game ended. Final score:', this.totalScore);
    }

    // Show end-of-round modal like classic mode; clicking outside starts a new game
    showBasketEndModal(guess, actualTotal, isCorrect) {
        try {
            const modalEl = document.getElementById('gameEndModal');
            const bodyEl = document.getElementById('gameEndModalBody');
            if (!modalEl || !bodyEl) {
                console.warn('End modal elements not found; ensure pages/modals.html is loaded.');
                return;
            }

            const sarImg = '<img src="images/sar/Saudi_Riyal_Symbol-1.png" alt="SAR" class="sar-symbol" style="height: 1.5em; width: auto; vertical-align: middle; margin-left: 0.2em; margin-right: 0.2em;" />';
            let message = '';

            if (isCorrect) {
                message = `<div class='mb-3 text-success'>صح عليك جبتها في ${toArabicNumerals(this.currentAttempts)} من المحاولات<br><span class='fw-bold'>${toArabicNumerals(actualTotal)} ${sarImg}</span></div>`;
            } else {
                message = `<div class='mb-3 text-danger'>لقد خسرت! السعر الصحيح هو <span class='fw-bold'>${toArabicNumerals(actualTotal)} ${sarImg}</span></div>`;
            }

            bodyEl.innerHTML = message;

            // Remove aria-hidden before showing modal
            modalEl.removeAttribute('aria-hidden');

            const modal = new bootstrap.Modal(modalEl);
            modal.show();

            // When the modal is hidden (including clicking outside), start a new game
            modalEl.addEventListener('hidden.bs.modal', () => {
                modalEl.setAttribute('aria-hidden', 'true');
                this.startNewGame();
            }, { once: true });
        } catch (err) {
            console.error('Failed to show basket end modal:', err);
        }
    }
}

// Export the game class
export { BasketGame };

// Initialize and export game instance
let basketGame = null;

export function initBasketMode() {
    basketGame = new BasketGame();
    basketGame.init();
    return basketGame;
}

export function getBasketGame() {
    return basketGame;
}

