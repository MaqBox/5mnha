// Helper function to convert Western numerals to Arabic numerals
function toArabicNumerals(num) {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, d => arabicNumerals[d]);
}

// Game state
let products = [];
let currentProduct = null;
let guesses = [];
let attempts = 0;
let maxAttempts = 6;
let recentProducts = []; // Track last 15 shown products

// DOM elements
const guessInput = document.getElementById('guess-input');
const submitButton = document.getElementById('submit-guess');
const guessContainer = document.querySelector('.guess-container');
const resultDiv = document.querySelector('.result');
const productImage = document.getElementById('product-image');

// Get modal elements
const gameEndModal = document.getElementById('gameEndModal');
const gameEndModalBody = document.getElementById('gameEndModalBody');
const gameEndTryAgain = document.getElementById('gameEndTryAgain');

// Game functions
function checkGuess(guess) {
    attempts++;
    const difference = Math.abs(guess - currentProduct.price);
    const sarImg = '<img src="images/sar/Saudi_Riyal_Symbol-1.png" alt="SAR" class="sar-symbol" style="height: 1.5em; width: auto; vertical-align: middle; margin-left: 0.2em; margin-right: 0.2em;" />';
    
    if (guess === currentProduct.price) {
        return { correct: true, message: "صح عليك جبتها في " + toArabicNumerals(attempts) + " من المحاولات" };
    } else if (attempts >= maxAttempts) {
        return { correct: false, message: `لقد خسرت السعر هو  ${toArabicNumerals(currentProduct.price)} ${sarImg}` };
    } else if (guess < currentProduct.price) {
        return { 
            correct: false, 
            message: `<i class=\"bi bi-arrow-up-circle-fill\"></i>`,
            color: 'bg-danger bg-opacity-25'
        };
    } else {
        return { 
            correct: false, 
            message: `<i class=\"bi bi-arrow-down-circle-fill\"></i>`,
            color: 'bg-success bg-opacity-25'
        };
    }
}

// Remove daily logic and related functions
// Remove getTodayString, getDailyProductIndex, hasPlayedToday, savePlayedToday, and all their usages
// Update initGame to pick a random product each time
function getRandomProductIndex(products) {
    // Filter out recently shown products
    const availableProducts = products
        .map((_, index) => index)
        .filter(index => !recentProducts.includes(index));

    // Reset history if all products have been shown
    if (availableProducts.length === 0) {
        recentProducts = [];
        return Math.floor(Math.random() * products.length);
    }

    const randomIndex = availableProducts[
        Math.floor(Math.random() * availableProducts.length)
    ];

    // Update recent products queue
    recentProducts.push(randomIndex);
    if (recentProducts.length > 15) {
        recentProducts.shift();
    }

    return randomIndex;
}

async function initGame() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        if (products.length === 0) {
            throw new Error('No products found');
        }
        // Pick a random product each time
        const randomIndex = getRandomProductIndex(products);
        currentProduct = products[randomIndex];
        productImage.src = currentProduct.imageUrl || 'placeholder.jpg';
        productImage.alt = currentProduct.name;
        document.getElementById('product-name').textContent = currentProduct.name;
        guesses = [];
        attempts = 0;
        guessContainer.innerHTML = '';
        resultDiv.textContent = '';
        resultDiv.className = 'result';
        document.getElementById('current-attempt').textContent = attempts;
    } catch (error) {
        console.error('Error initializing game:', error);
        resultDiv.textContent = 'Error loading products. Please try again later.';
    }
}

// Update submitButton event listener to show modal on game end
submitButton.addEventListener('click', () => {
    const guess = parseFloat(guessInput.value);
    if (!isNaN(guess)) {
        const result = checkGuess(guess);
        if (!result.correct && attempts < maxAttempts) {
            guesses.push({ value: guess, result });
            renderGuesses();
        } else {
            renderGuesses();
        }
        if (result.correct || attempts >= maxAttempts) {
            // Prepare modal content
            let message = '';
            const sarImg = '<img src="images/sar/Saudi_Riyal_Symbol-1.png" alt="SAR" class="sar-symbol" style="height: 1.5em; width: auto; vertical-align: middle; margin-left: 0.2em; margin-right: 0.2em;" />';
            if (result.correct) {
                message = `<div class='mb-3 text-success'>${result.message}<br><span class='fw-bold'>${toArabicNumerals(currentProduct.price)} ${sarImg}</span></div>`;
            } else {
                message = `<div class='mb-3 text-danger'>لقد خسرت! السعر الصحيح هو <span class='fw-bold'>${toArabicNumerals(currentProduct.price)} ${sarImg}</span></div>`;
            }
            gameEndModalBody.innerHTML = message;
            // Show modal
            const modal = new bootstrap.Modal(gameEndModal);
            modal.show();
            // Hide resultDiv
            resultDiv.innerHTML = '';
            resultDiv.classList.remove('animate__animated', 'animate__bounce');
            const tryAgainContainer = document.getElementById('try-again-container');
            if (tryAgainContainer) tryAgainContainer.style.display = 'block';
        } else {
            const tryAgainContainer = document.getElementById('try-again-container');
            if (tryAgainContainer) tryAgainContainer.style.display = 'none';
        }
        guessInput.value = '';
    }
});

// Remove Try Again button logic
const gameEndNext = document.getElementById('gameEndNext');
if (gameEndNext) {
    gameEndNext.addEventListener('click', () => {
        initGame();
    });
}

// Add Enter key support
guessInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        submitButton.click();
    }
});

function renderGuesses() {
    guessContainer.innerHTML = '';
    guesses.forEach(guess => {
        const guessElement = document.createElement('div');
        guessElement.className = `guess-item`;
        guessElement.innerHTML = `
            <div class="guess-box">
                <div class="guess-price">
                    <span class="price-number">${toArabicNumerals(guess.value)}</span>
                    <span class="price-symbol">
                        <img src="images/sar/Saudi_Riyal_Symbol-1.png" alt="SAR" class="sar-symbol" />
                    </span>
                </div>
                <div class="guess-indicator ${guess.result.color || ''}">
                    ${guess.result.message}
                </div>
            </div>
        `;
        guessContainer.appendChild(guessElement);
    });
    
    // Update the attempts counter in the UI
    document.getElementById('current-attempt').textContent = toArabicNumerals(attempts);
    document.getElementById('max-attempts').textContent = toArabicNumerals(maxAttempts);
}

// Reset game state
function resetGame() {
    const today = getTodayString();
    guesses = [];
    attempts = 0;
    guessContainer.innerHTML = '';
    resultDiv.textContent = '';
    resultDiv.className = 'result';
    document.getElementById('current-attempt').textContent = attempts;
    
    // Save reset state to history
    saveGameToHistory(today, currentProduct, guesses, attempts, false);
}

// Remove reset button event listener and related logic

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);

// Image modal functionality
document.getElementById('product-image').addEventListener('click', function() {
    const modalImage = document.getElementById('modal-image');
    modalImage.src = this.src;
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show();
});
