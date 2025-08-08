// UI management and DOM manipulation
import { toArabicNumerals } from '../utils/arabicNumerals.js';
import { getAttempts, getMaxAttempts } from '../game/gameState.js';
import { isTimeModeActive } from '../game/modes/timeMode.js';
import { getElement, getElements } from '../utils/domUtils.js';

// DOM elements - initialize as null
let guessInput = null;
let submitButton = null;
let guessContainer = null;
let resultDiv = null;
let productImage = null;
let modeSelection = null;
let categorySelection = null;
let gameScreen = null;
let comparisonScreen = null;
let backToCategoriesBtn = null;
let gameEndModal = null;
let gameEndModalBody = null;
let gameEndTryAgain = null;

// Initialize UI elements
export async function initializeUIElements() {
    try {
        const elements = await getElements([
            '#guess-input',
            '#submit-guess',
            '.guess-container',
            '.result',
            '#product-image',
            '#mode-selection',
            '#category-selection',
            '#game-screen',
            '#comparison-screen',
            '#back-to-categories',
            '#gameEndModal',
            '#gameEndModalBody',
            '#gameEndTryAgain'
        ]);
        
        // Assign elements to variables
        guessInput = elements['guess-input'];
        submitButton = elements['submit-guess'];
        guessContainer = elements['guess-container'];
        resultDiv = elements['result'];
        productImage = elements['product-image'];
        modeSelection = elements['mode-selection'];
        categorySelection = elements['category-selection'];
        gameScreen = elements['game-screen'];
        comparisonScreen = elements['comparison-screen'];
        backToCategoriesBtn = elements['back-to-categories'];
        gameEndModal = elements['gameEndModal'];
        gameEndModalBody = elements['gameEndModalBody'];
        gameEndTryAgain = elements['gameEndTryAgain'];
        
        console.log('UI elements initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing UI elements:', error);
        return false;
    }
}

// Update the showError function to handle null resultDiv
export function showError(message) {
    if (resultDiv) {
        resultDiv.innerHTML = `<div class="alert alert-warning" role="alert">${message}</div>`;
        resultDiv.className = 'result animate__animated animate__shake';
    } else {
        console.error('Error: resultDiv element not found');
    }
}

// Update the updateProductDisplay function to handle null productImage
export function updateProductDisplay(product) {
    if (productImage && product) {
        productImage.src = product.imageUrl || 'placeholder.jpg';
        productImage.alt = product.name;
        
        const productNameElement = document.getElementById('product-name');
        if (productNameElement) {
            productNameElement.textContent = product.name;
        }
    } else {
        console.error('Error: productImage element not found or product is undefined');
    }
}

// Keep the rest of your functions with null checks
export function showModeSelection() {
   if (window.hideAllScreens) {
        window.hideAllScreens();
    }
    modeSelection.style.display = 'block';
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
    if (comparisonScreen) comparisonScreen.style.display = 'none';
    
    // Show/hide time mode elements
    const timeModeElements = document.getElementById('time-mode-elements');
    const attemptsCounter = document.getElementById('attempts-counter');
    
    if (timeModeElements) {
        if (isTimeModeActive()) {
            timeModeElements.classList.remove('d-none');
            
            // Hide attempts counter in time mode
            if (attemptsCounter) {
                attemptsCounter.style.display = 'none';
            }
            
            // Add this code to apply the CSS class to the guess container
            const guessContainerElement = document.querySelector('.guess-container');
            if (guessContainerElement) {
                guessContainerElement.classList.add('time-mode-guess-container');
            }
        } else {
            timeModeElements.classList.add('d-none');
            
            // Show attempts counter in regular mode
            if (attemptsCounter) {
                attemptsCounter.style.display = 'block';
            }
            
            // Remove the CSS class when not in time mode
            const guessContainerElement = document.querySelector('.guess-container');
            if (guessContainerElement) {
                guessContainerElement.classList.remove('time-mode-guess-container');
            }
        }
    }
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
    try {
        if (!guessContainer) {
            console.error('Error: guessContainer element not found');
            // Try to get the element directly as a fallback
            const container = document.querySelector('.guess-container');
            if (!container) {
                console.error('Still could not find guessContainer even with direct query');
                return;
            }
            guessContainer = container;
        }
        
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
        
        // Only update attempts counter if NOT in time mode
        if (!isTimeModeActive()) {
            const currentAttemptElement = document.getElementById('current-attempt');
            const maxAttemptsElement = document.getElementById('max-attempts');
            
            if (currentAttemptElement) {
                currentAttemptElement.textContent = toArabicNumerals(getAttempts());
            } else {
                console.warn('current-attempt element not found');
            }
            
            if (maxAttemptsElement) {
                maxAttemptsElement.textContent = toArabicNumerals(getMaxAttempts());
            } else {
                console.warn('max-attempts element not found');
            }
        }

        if (isTimeModeActive() && guesses.length > 2) {
            guessContainer.scrollTop = guessContainer.scrollHeight;
        }

    } catch (error) {
        console.error('Error rendering guesses:', error);
    }
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


export function clearGameUI() {
    try {
        if (!guessContainer) {
            console.error('Error: guessContainer element not found in clearGameUI');
            // Try to get the element directly as a fallback
            const container = document.querySelector('.guess-container');
            if (container) {
                guessContainer = container;
            }
        }
        
        if (guessContainer) guessContainer.innerHTML = '';
        
        if (!resultDiv) {
            console.error('Error: resultDiv element not found in clearGameUI');
            // Try to get the element directly as a fallback
            const result = document.querySelector('.result');
            if (result) {
                resultDiv = result;
            }
        }
        
        if (resultDiv) {
            resultDiv.textContent = '';
            resultDiv.className = 'result';
        }
        
        // Only reset attempts counter if NOT in time mode
        if (!isTimeModeActive()) {
            const currentAttemptElement = document.getElementById('current-attempt');
            if (currentAttemptElement) {
                currentAttemptElement.textContent = '0';
            } else {
                console.warn('current-attempt element not found in clearGameUI');
            }
        }
        
        if (guessInput) guessInput.value = '';
    } catch (error) {
        console.error('Error clearing game UI:', error);
    }
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
    comparisonScreen,
    backToCategoriesBtn,
    gameEndModal,
    gameEndModalBody,
    gameEndTryAgain
};