// UI management and DOM manipulation
import { toArabicNumerals } from '../utils/arabicNumerals.js';
import { getAttempts, getMaxAttempts } from '../game/gameState.js';

// DOM elements
const guessInput = document.getElementById('guess-input');
const submitButton = document.getElementById('submit-guess');
const guessContainer = document.querySelector('.guess-container');
const resultDiv = document.querySelector('.result');
const productImage = document.getElementById('product-image');
const modeSelection = document.getElementById('mode-selection');
const categorySelection = document.getElementById('category-selection');
const gameScreen = document.getElementById('game-screen');
const comparisonScreen = document.getElementById('comparison-screen'); // Add this line
const backToCategoriesBtn = document.getElementById('back-to-categories');
const gameEndModal = document.getElementById('gameEndModal');
const gameEndModalBody = document.getElementById('gameEndModalBody');
const gameEndTryAgain = document.getElementById('gameEndTryAgain');

export function showModeSelection() {
    modeSelection.style.display = 'block';
    categorySelection.style.display = 'none';
    gameScreen.style.display = 'none';
    if (comparisonScreen) comparisonScreen.style.display = 'none'; // Add this line
}

export function showCategorySelection() {
    modeSelection.style.display = 'none';
    categorySelection.style.display = 'block';
    gameScreen.style.display = 'none';
    if (comparisonScreen) comparisonScreen.style.display = 'none'; // Add this line
}

export function showGameScreen() {
    modeSelection.style.display = 'none';
    categorySelection.style.display = 'none';
    gameScreen.style.display = 'block';
    if (comparisonScreen) comparisonScreen.style.display = 'none'; // Add this line
}

// Add this new function
export function showComparisonScreen() {
    console.log('Showing comparison screen...');
    console.log('Comparison screen element:', comparisonScreen);
    
    modeSelection.style.display = 'none';
    categorySelection.style.display = 'none';
    gameScreen.style.display = 'none';
    
    if (comparisonScreen) {
        // Remove the d-none class instead of setting display style
        comparisonScreen.classList.remove('d-none');
        comparisonScreen.style.display = 'block';
        console.log('Comparison screen display set to block');
    } else {
        console.error('Comparison screen element not found!');
    }
}

export function renderGuesses(guesses) {
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
    document.getElementById('current-attempt').textContent = toArabicNumerals(getAttempts());
    document.getElementById('max-attempts').textContent = toArabicNumerals(getMaxAttempts());
}

export function showGameEndModal(result, currentProduct) {
    let message = '';
    const sarImg = '<img src="images/sar/Saudi_Riyal_Symbol-1.png" alt="SAR" class="sar-symbol" style="height: 1.5em; width: auto; vertical-align: middle; margin-left: 0.2em; margin-right: 0.2em;" />';
    
    if (result.correct) {
        const attempts = getAttempts();
        message = `<div class='mb-3 text-success'>صح عليك جبتها في ${toArabicNumerals(attempts)} من المحاولات<br><span class='fw-bold'>${toArabicNumerals(currentProduct.price)} ${sarImg}</span></div>`;
    } else {
        message = `<div class='mb-3 text-danger'>لقد خسرت! السعر الصحيح هو <span class='fw-bold'>${toArabicNumerals(currentProduct.price)} ${sarImg}</span></div>`;
    }
    
    gameEndModalBody.innerHTML = message;
    
    // Remove aria-hidden before showing modal
    gameEndModal.removeAttribute('aria-hidden');
    
    const modal = new bootstrap.Modal(gameEndModal);
    modal.show();
    
    // Add the hidden event listener when modal is shown
    gameEndModal.addEventListener('hidden.bs.modal', function() {
        // Restore aria-hidden
        gameEndModal.setAttribute('aria-hidden', 'true');
        // Import and call initGame - we need to import it
        window.initGame();
    }, { once: true });
    
    // Hide resultDiv
    resultDiv.innerHTML = '';
    resultDiv.classList.remove('animate__animated', 'animate__bounce');
    
    const tryAgainContainer = document.getElementById('try-again-container');
    if (tryAgainContainer) tryAgainContainer.style.display = 'block';
}

export function updateProductDisplay(product) {
    productImage.src = product.imageUrl || 'placeholder.jpg';
    productImage.alt = product.name;
    document.getElementById('product-name').textContent = product.name;
}

export function clearGameUI() {
    guessContainer.innerHTML = '';
    resultDiv.textContent = '';
    resultDiv.className = 'result';
    document.getElementById('current-attempt').textContent = '0';
    if (guessInput) guessInput.value = '';
}

export function showError(message) {
    resultDiv.innerHTML = `<div class="alert alert-warning" role="alert">${message}</div>`;
    resultDiv.className = 'result animate__animated animate__shake';
}

// Export DOM elements for use in other modules
export { 
    guessInput, 
    submitButton, 
    guessContainer, 
    resultDiv, 
    productImage, 
    modeSelection,
    categorySelection, 
    gameScreen,
    comparisonScreen, // Add this line
    backToCategoriesBtn,
    gameEndModal,
    gameEndModalBody,
    gameEndTryAgain
};