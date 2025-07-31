// Main application entry point
import { loadProducts, filterProductsByCategory, getProducts } from './js/services/productService.js';
import { checkGuess, getRandomProductIndex } from './js/game/gameLogic.js';
import {
    getCurrentProduct,
    setCurrentProduct,
    getGuesses,
    addGuess,
    resetGuesses,
    resetAttempts,
    getAttempts,
    getMaxAttempts,
    setSelectedCategory,
    getSelectedCategory,
    setFilteredProducts,
    getFilteredProducts,
    resetGameState
} from './js/game/gameState.js';
import {
    initComparisonMode,
    generateComparison,
    getCurrentComparison,
    getComparisonScore,
    getComparisonRound,
    getMaxRounds,
    checkComparisonAnswer
} from './js/game/modes/comparisonMode.js';
import {
    showModeSelection,
    showCategorySelection,
    showGameScreen,
    showComparisonScreen,
    renderGuesses,
    showGameEndModal,
    updateProductDisplay,
    clearGameUI,
    showError,
    guessInput,
    submitButton,
    backToCategoriesBtn
} from './js/components/uiManager.js';
import { setupInputValidation, validateGuess } from './js/components/inputHandler.js';

// Game mode state
let selectedMode = null;

// Initialize the application
async function initApp() {
    try {
        await loadProducts();
        setupInputValidation();
        setupEventListeners();
        showModeSelection();
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('خطأ في تحميل التطبيق. يرجى المحاولة مرة أخرى.');
    }
}

// Setup all event listeners
function setupEventListeners() {
    setupModeSelection();
    setupCategorySelection();
    setupGameControls();
    setupImageModal();
    setupComparisonMode();
}

// Setup mode selection event listeners
// Setup mode selection event listeners
function setupModeSelection() {
    const modeBoxes = document.querySelectorAll('.mode-box');
    const backToModesBtn = document.getElementById('back-to-modes');
    
    console.log('Mode boxes found:', modeBoxes.length);
    
    modeBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const mode = box.getAttribute('data-mode');
            console.log('Mode selected:', mode);
            selectedMode = mode;
            
            if (mode === 'category') {
                showCategorySelection();
            } else if (mode === 'random') {
                setSelectedCategory(null);
                setFilteredProducts(getProducts());
                initGame();
            } else if (mode === 'comparison') {
                console.log('Starting comparison mode...');
                setSelectedCategory(null);
                setFilteredProducts(getProducts());
                console.log('Products set for comparison:', getProducts().length);
                initComparisonGame();
            }
        });
    });
    
    if (backToModesBtn) {
        backToModesBtn.addEventListener('click', () => {
            selectedMode = null;
            showModeSelection();
        });
    }
}

// Setup comparison mode event listeners
function setupComparisonMode() {
    const backToModesBtn = document.getElementById('back-to-modes-comparison');
    const comparisonChoices = document.querySelectorAll('.comparison-choice');
    // Remove these button references since we're removing the buttons
    // const nextComparisonBtn = document.getElementById('nextComparisonBtn');
    // const viewFinalScoreBtn = document.getElementById('viewFinalScoreBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const backToModesFromFinal = document.getElementById('backToModesFromFinal');
    
    if (backToModesBtn) {
        backToModesBtn.addEventListener('click', () => {
            selectedMode = null;
            showModeSelection();
        });
    }
    
    comparisonChoices.forEach(choice => {
        choice.addEventListener('click', () => {
            handleComparisonChoice(choice.getAttribute('data-choice'));
        });
    });
    
    // Remove the button event listeners since we're removing the buttons
    // if (nextComparisonBtn) { ... }
    // if (viewFinalScoreBtn) { ... }
    
    // Add these missing event handlers at the end of setupComparisonMode function
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            const finalModal = bootstrap.Modal.getInstance(document.getElementById('finalScoreModal'));
            if (finalModal) {
                finalModal.hide();
            }
            initComparisonGame();
        });
    }
    
    if (backToModesFromFinal) {
        backToModesFromFinal.addEventListener('click', () => {
            const finalModal = bootstrap.Modal.getInstance(document.getElementById('finalScoreModal'));
            if (finalModal) {
                finalModal.hide();
            }
            selectedMode = null;
            showModeSelection();
        });
    }
}

// Setup category selection event listeners
function setupCategorySelection() {
    const categoryBoxes = document.querySelectorAll('.category-box');
    const backToModesBtn = document.getElementById('back-to-modes');
    
    categoryBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const category = box.getAttribute('data-category');
            setSelectedCategory(category);
            
            if (category === 'all') {
                setFilteredProducts(getProducts());
            } else {
                setFilteredProducts(filterProductsByCategory(category));
            }
            
            if (selectedMode === 'comparison') {
                initComparisonGame();
            } else {
                initGame();
            }
        });
    });
    
    if (backToModesBtn) {
        backToModesBtn.addEventListener('click', () => {
            selectedMode = null;
            showModeSelection();
        });
    }
}

// Setup game control event listeners
function setupGameControls() {
    submitButton.addEventListener('click', handleGuessSubmission);
    
    guessInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            submitButton.click();
        }
    });
    
    // Remove this entire block since we're handling it in showGameEndModal now
    // const gameEndModal = document.getElementById('gameEndModal');
    // if (gameEndModal) {
    //     gameEndModal.addEventListener('hidden.bs.modal', () => {
    //         initGame();
    //     });
    // }
    
    if (backToCategoriesBtn) {
        backToCategoriesBtn.addEventListener('click', () => {
            if (selectedMode === 'category') {
                showCategorySelection();
            } else {
                showModeSelection();
            }
        });
    }
}

// Setup image modal functionality
function setupImageModal() {
    document.getElementById('product-image').addEventListener('click', function() {
        const modalImage = document.getElementById('modal-image');
        modalImage.src = this.src;
        const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
        imageModal.show();
    });
}

// Comparison game functions
function initComparisonGame() {
    console.log('Initializing comparison game...');
    try {
        initComparisonMode();
        console.log('Comparison mode initialized');
        showComparisonScreen();
        console.log('Comparison screen shown');
        displayComparison();
        console.log('Comparison displayed');
    } catch (error) {
        console.error('Error in initComparisonGame:', error);
    }
}

function displayComparison() {
    console.log('Displaying comparison...');
    const comparison = getCurrentComparison();
    console.log('Current comparison:', comparison);
    
    if (!comparison || !comparison.product1 || !comparison.product2) {
        console.error('No valid comparison data available');
        return;
    }
    
    // Check if required DOM elements exist
    const scoreEl = document.getElementById('comparison-score');
    const roundEl = document.getElementById('comparison-round');
    const maxRoundsEl = document.getElementById('comparison-max-rounds');
    
    console.log('DOM elements found:', {
        scoreEl: !!scoreEl,
        roundEl: !!roundEl,
        maxRoundsEl: !!maxRoundsEl
    });
    
    if (scoreEl) scoreEl.textContent = getComparisonScore();
    if (roundEl) roundEl.textContent = getComparisonRound();
    if (maxRoundsEl) maxRoundsEl.textContent = getMaxRounds();
    
    const img1 = document.getElementById('comparison-image-1');
    const img2 = document.getElementById('comparison-image-2');
    
    if (img1 && img2) {
        // Fix: Use imageUrl instead of image
        img1.src = comparison.product1.imageUrl || '';
        img1.alt = comparison.product1.name || '';
        document.getElementById('comparison-name-1').textContent = comparison.product1.name || '';
        
        img2.src = comparison.product2.imageUrl || '';
        img2.alt = comparison.product2.name || '';
        document.getElementById('comparison-name-2').textContent = comparison.product2.name || '';
        
        console.log('Products displayed:', {
            product1: comparison.product1.name,
            product2: comparison.product2.name
        });
    } else {
        console.error('Image elements not found');
    }
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('correct', 'incorrect', 'disabled');
    });
    
    document.querySelectorAll('.comparison-choice').forEach(btn => {
        btn.disabled = false;
    });
}

function handleComparisonChoice(choice) {
    const result = checkComparisonAnswer(choice);
    
    document.querySelectorAll('.comparison-choice').forEach(btn => {
        btn.disabled = true;
    });
    
    const product1Card = document.querySelector('#comparison-product-1 .product-card');
    const product2Card = document.querySelector('#comparison-product-2 .product-card');
    
    if (result.correctAnswer === 'product1') {
        product1Card.classList.add('correct');
        product2Card.classList.add('incorrect');
    } else {
        product2Card.classList.add('correct');
        product1Card.classList.add('incorrect');
    }
    
    setTimeout(() => {
        showComparisonResult(result);
    }, 1000);
}

function showComparisonResult(result) {
    const modal = new bootstrap.Modal(document.getElementById('comparisonResultModal'));
    const modalElement = document.getElementById('comparisonResultModal');
    
    // Set result content
    const resultIcon = document.getElementById('comparisonResultIcon');
    const resultMessage = document.getElementById('comparisonResultMessage');
    
    if (result.correct) {
        resultIcon.className = 'bi bi-check-circle-fill text-success display-1';
        resultMessage.textContent = 'إجابة صحيحة! أحسنت';
    } else {
        resultIcon.className = 'bi bi-x-circle-fill text-danger display-1';
        resultMessage.textContent = 'إجابة خاطئة، حاول مرة أخرى';
    }
    
    // Set product information
    document.getElementById('resultImage1').src = result.product1.imageUrl || result.product1.image;
    document.getElementById('resultName1').textContent = result.product1.name;
    document.getElementById('resultPrice1').innerHTML = `${result.product1.price}<img src="images/sar/Saudi_Riyal_Symbol-1.png" alt="SAR" class="sar-symbol" style="height: 1.2em; width: auto; vertical-align: middle; margin: 0 0.2em;">`;
    
    document.getElementById('resultImage2').src = result.product2.imageUrl || result.product2.image;
    document.getElementById('resultName2').textContent = result.product2.name;
    document.getElementById('resultPrice2').innerHTML = `${result.product2.price}<img src="images/sar/Saudi_Riyal_Symbol-1.png" alt="SAR" class="sar-symbol" style="height: 1.2em; width: auto; vertical-align: middle; margin: 0 0.2em;">`;
    
    // Remove aria-hidden before showing modal
    modalElement.removeAttribute('aria-hidden');
    
    // Show the modal
    modal.show();
    
    // Add click-anywhere functionality and hidden event listener
    const handleModalClose = function() {
        modal.hide();
    };
    
    const handleModalHidden = function() {
        modalElement.setAttribute('aria-hidden', 'true');
        // Remove event listeners to prevent memory leaks
        modalElement.removeEventListener('click', handleModalClose);
        document.removeEventListener('keydown', handleKeyDown);
        
        // Determine next action based on game state
        if (result.gameComplete) {
            showFinalScore();
        } else {
            startNextComparison();
        }
    };
    
    const handleKeyDown = function(event) {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleModalClose();
        }
    };
    
    // Add event listeners
    modalElement.addEventListener('click', handleModalClose);
    document.addEventListener('keydown', handleKeyDown);
    modalElement.addEventListener('hidden.bs.modal', handleModalHidden, { once: true });
}

function startNextComparison() {
    generateComparison();
    displayComparison();
}

function showFinalScore() {
    const modal = new bootstrap.Modal(document.getElementById('finalScoreModal'));
    const score = getComparisonScore();
    const maxRounds = getMaxRounds();
    const wrongAnswers = maxRounds - score;
    const accuracy = Math.round((score / maxRounds) * 100);
    
    document.getElementById('finalScoreDisplay').textContent = `${score}/${maxRounds}`;
    document.getElementById('correctAnswers').textContent = score;
    document.getElementById('wrongAnswers').textContent = wrongAnswers;
    document.getElementById('accuracyPercentage').textContent = `${accuracy}%`;
    
    const messageEl = document.getElementById('finalScoreMessage');
    if (accuracy >= 80) {
        messageEl.textContent = 'ممتاز! أداء رائع';
        messageEl.className = 'fs-5 text-success';
    } else if (accuracy >= 60) {
        messageEl.textContent = 'جيد! يمكنك التحسن';
        messageEl.className = 'fs-5 text-primary';
    } else {
        messageEl.textContent = 'حاول مرة أخرى';
        messageEl.className = 'fs-5 text-warning';
    }
    
    modal.show();
}

// Handle guess submission
function handleGuessSubmission() {
    const inputValue = guessInput.value.trim();
    const validation = validateGuess(inputValue);
    
    if (!validation.valid) {
        if (!validation.silent) {
            showError(validation.error);
        }
        return;
    }
    
    const guess = validation.value;
    const result = checkGuess(guess);
    const currentProduct = getCurrentProduct();
    
    if (!result.correct && getAttempts() < getMaxAttempts()) {
        addGuess({ value: guess, result });
        renderGuesses(getGuesses());
    } else {
        addGuess({ value: guess, result });
        renderGuesses(getGuesses());
        showGameEndModal(result, currentProduct);
        
        const tryAgainContainer = document.getElementById('try-again-container');
        if (tryAgainContainer) tryAgainContainer.style.display = 'block';
    }
    
    guessInput.value = '';
}

// Initialize a new game
async function initGame() {
    try {
        const products = getProducts();
        
        if (products.length === 0) {
            throw new Error('No products found');
        }
        
        const selectedCategory = getSelectedCategory();
        const productsToUse = selectedCategory ? getFilteredProducts() : products;
        
        if (productsToUse.length === 0) {
            throw new Error('No products found in selected category');
        }
        
        const randomIndex = getRandomProductIndex(productsToUse);
        const selectedProduct = productsToUse[randomIndex];
        
        setCurrentProduct(selectedProduct);
        resetGuesses();
        resetAttempts();
        
        showGameScreen();
        updateProductDisplay(selectedProduct);
        clearGameUI();
        
        console.log('Game initialized with product:', selectedProduct.name);
    } catch (error) {
        console.error('Error initializing game:', error);
        showError('خطأ في تحميل المنتجات. يرجى المحاولة مرة أخرى.');
    }
}

// Make initGame globally accessible
window.initGame = initGame;

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
// Remove this line: window.addEventListener('DOMContentLoaded', initApp);