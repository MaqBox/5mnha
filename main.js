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
    initTimeMode,
    handleCorrectGuess,
    isTimeModeActive,
    getCurrentTimeProduct,
    endTimeMode,
    stopTimeModeWithoutResults
} from './js/game/modes/timeMode.js';
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
    backToCategoriesBtn,
    initializeUIElements  // Add this import
} from './js/components/uiManager.js';
import { setupInputValidation, validateGuess } from './js/components/inputHandler.js';
import {
    initHigherLowerMode,
    checkHigherLowerAnswer,
    getCurrentRound,
    getHigherLowerScore,
    getHigherLowerRound,
    getMaxRounds as getHigherLowerMaxRounds,
    generateNextMysteryProduct,
    generateHigherLowerRound
} from './js/game/modes/higherLowerMode.js';

import {
    initMemoryMatch,
    getMemoryMatchGame
} from './js/game/modes/memoryMatchMode.js';
import {
    initBasketMode,
    getBasketGame
} from './js/game/modes/basketMode.js';

// Game mode state
let selectedMode = null;

// Initialize the application
async function initApp() {
    try {
        // First initialize UI elements with more retries and longer intervals
        const uiInitialized = await initializeUIElements();
        
        if (!uiInitialized) {
            throw new Error('Failed to initialize UI elements');
        }
        
        // Add a small delay to ensure DOM is fully processed
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Then proceed with other initializations
        await loadProducts();
        setupInputValidation();
        setupEventListeners();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        // Show error in a way that doesn't depend on UI elements
        alert('Error initializing application: ' + error.message);
    }
}

// Setup all event listeners
function setupEventListeners() {
    setupModeSelection();
    setupCategorySelection();
    setupGameControls();
    setupImageModal();
    setupComparisonMode();
    setupHigherLowerMode();
}


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
                initComparisonGame();
            } else if (mode === 'timed') {
                console.log('Starting time mode...');
                setSelectedCategory(null);
                setFilteredProducts(getProducts());
                initTimedGame();
            } else if (mode === 'higher-lower') {
                console.log('Starting higher-lower mode...');
                setSelectedCategory(null);
                initHigherLowerGame();
            } else if (mode === 'memory-match') {
                console.log('Starting memory match mode...');
                setSelectedCategory(null);
                setFilteredProducts(getProducts());
                initMemoryMatchGame();
            }
            else if (mode === 'basket') {
                console.log('Starting basket mode...');
                setSelectedCategory(null);
                setFilteredProducts(getProducts());
                initBasketGame();
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
async function initBasketGame() {
    try {
        // Ensure products are loaded first
        await loadProducts();
        const products = getProducts();
        
        // Validate minimum product requirements
        if (products.length < 3) {
            throw new Error(`Basket mode requires at least 3 products. Currently have: ${products.length}`);
        }
        
        console.log(`Loading ${products.length} products for basket mode`);
        
        // Set filtered products
        setFilteredProducts(products);
        
        // Show the screen first
        showBasketModeScreen();
        
        console.log(`Basket mode initialized successfully with ${products.length} products`);
    } catch (error) {
        console.error('Error initializing basket mode:', error);
        showError('Error initializing basket mode: ' + error.message);
        
        // Fallback to mode selection if initialization fails
        setTimeout(() => {
            showModeSelection();
        }, 3000);
    }
}

function showBasketModeScreen() {
    hideAllScreens();
    const basketModeScreen = document.getElementById('basket-mode-screen');
    if (basketModeScreen) {
        basketModeScreen.style.display = 'block';
        // Initialize the basket mode
        initBasketMode();
    }
}
// Add new function for Higher-Lower game initialization
async function initHigherLowerGame() {
    try {
        // Ensure products are loaded first
        await loadProducts();
        const products = getProducts();
        
        // Validate minimum product requirements
        if (products.length < 2) {
            throw new Error(`Higher-lower mode requires at least 2 products. Currently have: ${products.length}`);
        }
        
        console.log(`Loading ${products.length} products for higher-lower mode`);
        
        // Set filtered products and verify they're set correctly
        setFilteredProducts(products);
        
        // Double-check that filtered products are actually set
        const verifyProducts = getFilteredProducts();
        if (!verifyProducts || verifyProducts.length < 2) {
            throw new Error(`Failed to set filtered products. Expected: ${products.length}, Got: ${verifyProducts ? verifyProducts.length : 0}`);
        }
        
        console.log(`Verified ${verifyProducts.length} filtered products available`);
        
        // Show the screen first
        showHigherLowerScreen();
        
        console.log(`Higher-lower mode initialized successfully with ${verifyProducts.length} products`);
    } catch (error) {
        console.error('Error initializing higher-lower mode:', error);
        showError('Error initializing higher-lower mode: ' + error.message);
        
        // Fallback to mode selection if initialization fails
        setTimeout(() => {
            showModeSelection();
        }, 3000);
    }
}

async function initMemoryMatchGame() {
    try {
        // Ensure products are loaded first
        await loadProducts();
        const products = getProducts();
        
        // Validate minimum product requirements
        if (products.length < 6) {
            throw new Error(`Memory match mode requires at least 6 products. Currently have: ${products.length}`);
        }
        
        console.log(`Loading ${products.length} products for memory match mode`);
        
        // Set filtered products
        setFilteredProducts(products);
        
        // Show the screen first
        showMemoryMatchScreen();
        
        // Initialize the memory match game
        initMemoryMatch();
        
        console.log(`Memory match mode initialized successfully with ${products.length} products`);
    } catch (error) {
        console.error('Error initializing memory match mode:', error);
        showError('Error initializing memory match mode: ' + error.message);
        
        // Fallback to mode selection if initialization fails
        setTimeout(() => {
            showModeSelection();
        }, 3000);
    }
}

// Add function to show memory match screen
function showMemoryMatchScreen() {
    hideAllScreens();
    const memoryMatchScreen = document.getElementById('memory-match-screen');
    if (memoryMatchScreen) {
        memoryMatchScreen.style.display = 'block';
        memoryMatchScreen.classList.remove('d-none');
    }
}
function hideAllScreens() {
    const modeSelection = document.getElementById('mode-selection');
    const categorySelection = document.getElementById('category-selection');
    const gameScreen = document.getElementById('game-screen');
    const comparisonScreen = document.getElementById('comparison-screen');
    const higherLowerScreen = document.getElementById('higher-lower-screen');
    const memoryMatchScreen = document.getElementById('memory-match-screen');
    const basketModeScreen = document.getElementById('basket-mode-screen');
    
    if (modeSelection) modeSelection.style.display = 'none';
    if (categorySelection) categorySelection.style.display = 'none';
    if (gameScreen) gameScreen.style.display = 'none';
    if (comparisonScreen) comparisonScreen.style.display = 'none';
    if (higherLowerScreen) higherLowerScreen.style.display = 'none';
    if (memoryMatchScreen) memoryMatchScreen.style.display = 'none';
    if (basketModeScreen) basketModeScreen.style.display = 'none';
}
// Add function to show higher-lower screen
function showHigherLowerScreen() {
    hideAllScreens();
    
    const higherLowerScreen = document.getElementById('higher-lower-screen');
    if (higherLowerScreen) {
        higherLowerScreen.style.display = 'block';
        higherLowerScreen.classList.remove('d-none');
    }
    
    // Initialize the mode and render - do this together to avoid race conditions
    try {
        initHigherLowerMode();
        renderHigherLowerRound();
    } catch (error) {
        console.error('Error initializing higher-lower screen:', error);
        showError('Error: ' + error.message);
    }
}

// Add function to render higher-lower round
function renderHigherLowerRound() {
    // Ensure the round is generated before rendering
    let roundData = getCurrentRound();
    
    // If products aren't set, generate the round first
    if (!roundData.currentProduct || !roundData.nextProduct) {
        try {
            roundData = generateHigherLowerRound();
        } catch (error) {
            console.error('Error generating higher-lower round:', error);
            showError('Error: ' + error.message);
            return;
        }
    }

    console.log('Rendering round data:', roundData);
    
    // Add null checks before accessing properties
    if (!roundData.currentProduct || !roundData.nextProduct) {
        console.error('Products not properly initialized');
        return;
    }
    
    // Get UI elements - fix the element IDs to match the HTML
    const product1Name = document.getElementById('higher-lower-name-1');
    const product1Image = document.getElementById('higher-lower-image-1');
    const product1Price = document.getElementById('higher-lower-price-1');
    const product2Name = document.getElementById('higher-lower-name-2');
    const product2Image = document.getElementById('higher-lower-image-2');
    
    const roundCounter = document.getElementById('higher-lower-round');
    const maxRoundsCounter = document.getElementById('higher-lower-max-rounds');
    const scoreDisplay = document.getElementById('higher-lower-score');
    
    // Update product 1 (visible price)
    if (product1Name) product1Name.textContent = roundData.currentProduct.name;
    if (product1Image) {
        product1Image.src = roundData.currentProduct.imageUrl || '';
        product1Image.alt = roundData.currentProduct.name;
    }
    if (product1Price) product1Price.textContent = `ريال ${roundData.currentProduct.price}`;
    
    // Update product 2 (mystery - name only, price hidden)
    if (product2Name) product2Name.textContent = roundData.nextProduct.name;
    if (product2Image) {
        product2Image.src = roundData.nextProduct.imageUrl || '';
        product2Image.alt = roundData.nextProduct.name;
    }
    
    // Update game status
    if (roundCounter) {
        roundCounter.textContent = roundData.round;
    }
    
    if (maxRoundsCounter) {
        maxRoundsCounter.textContent = roundData.maxRounds;
    }
    
    if (scoreDisplay) scoreDisplay.textContent = getHigherLowerScore();
}


// Add function to handle higher-lower choice
function handleHigherLowerChoice(choice) {
    try {
        const result = checkHigherLowerAnswer(choice);
        
        if (result.error) {
            showError(result.error);
            return;
        }
        
        // Show result feedback
        showHigherLowerResult(result);
        
        if (result.gameComplete) {
            setTimeout(() => {
                showHigherLowerFinalScore();
            }, 2000);
        } else {
            setTimeout(() => {
                // Generate the new mystery product AFTER showing the result
                generateNextMysteryProduct();
                renderHigherLowerRound();
            }, 1500);
        }
    } catch (error) {
        console.error('Error in higher-lower choice:', error);
        showError('Error processing choice: ' + error.message);
    }
}

// Add event listener setup for higher-lower mode
function setupHigherLowerMode() {
    const higherBtn = document.getElementById('higher-btn');
    const lowerBtn = document.getElementById('lower-btn');
    const backToModesBtn = document.getElementById('back-to-modes-higher-lower');
    
    if (higherBtn) {
        higherBtn.addEventListener('click', () => handleHigherLowerChoice('higher'));
    }
    
    if (lowerBtn) {
        lowerBtn.addEventListener('click', () => handleHigherLowerChoice('lower'));
    }
    
    if (backToModesBtn) {
        backToModesBtn.addEventListener('click', () => {
            selectedMode = null;
            showModeSelection();
        });
    }
     const higherLowerImage1 = document.getElementById('higher-lower-image-1');
    const higherLowerImage2 = document.getElementById('higher-lower-image-2');
    
    if (higherLowerImage1) {
        higherLowerImage1.addEventListener('click', function() {
            const modalImage = document.getElementById('modal-image');
            modalImage.src = this.src;
            const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
            imageModal.show();
        });
    }
    
    if (higherLowerImage2) {
        higherLowerImage2.addEventListener('click', function() {
            const modalImage = document.getElementById('modal-image');
            modalImage.src = this.src;
            const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
            imageModal.show();
        });
    }
}

// Setup comparison mode event listeners
function setupComparisonMode() {
    const backToModesBtn = document.getElementById('back-to-modes-comparison');
    const comparisonChoices = document.querySelectorAll('.comparison-choice');
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
    
    // Add click functionality to comparison images
    const comparisonImage1 = document.getElementById('comparison-image-1');
    const comparisonImage2 = document.getElementById('comparison-image-2');
    
    if (comparisonImage1) {
        comparisonImage1.addEventListener('click', function() {
            const modalImage = document.getElementById('modal-image');
            modalImage.src = this.src;
            const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
            imageModal.show();
        });
    }
    
    if (comparisonImage2) {
        comparisonImage2.addEventListener('click', function() {
            const modalImage = document.getElementById('modal-image');
            modalImage.src = this.src;
            const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
            imageModal.show();
        });
    }
    
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
// Setup game control event listeners
function setupGameControls() {
    if (!submitButton || !guessInput) {
        console.error('Error: Game control elements not found');
        return;
    }
    
    submitButton.addEventListener('click', handleGuessSubmission);
    
    guessInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            submitButton.click();
        }
    });
    
    if (backToCategoriesBtn) {
        backToCategoriesBtn.addEventListener('click', () => {
        // Use the new function instead of endTimeMode
        if (isTimeModeActive()) {
            stopTimeModeWithoutResults();
        }
        
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


// Time game functions
function initTimedGame() {
    console.log('Initializing timed game...');
    try {
        initTimeMode(60); // 60 seconds
        showGameScreen();
        
        // Listen for product changes in time mode
        document.addEventListener('timeProductChanged', (event) => {
            updateProductDisplay(event.detail.product);
            clearGameUI();
        });
        
        // Update UI with first product
        const currentProduct = getCurrentProduct();
        if (currentProduct) {
            updateProductDisplay(currentProduct);
            clearGameUI();
        }
        
        console.log('Time mode initialized');
    } catch (error) {
        console.error('Error in initTimedGame:', error);
    }
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
    
    // Handle time mode differently
    if (isTimeModeActive()) {
        addGuess({ value: guess, result });
        renderGuesses(getGuesses());
        
        if (result.correct) {
            handleCorrectGuess(); // Changed from handleTimeModeCorrectGuess()
        }
        
        guessInput.value = '';
        return;
    }
    
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
function updateHigherLowerDisplay() {
    const roundData = getCurrentRound();
    if (!roundData) return;
    
    const productName = document.getElementById('higher-lower-product-name');
    const productImage = document.getElementById('higher-lower-product-image');
    const productPrice = document.getElementById('higher-lower-product-price');
    const roundCounter = document.getElementById('higher-lower-round');
    const scoreDisplay = document.getElementById('higher-lower-score');
    
    if (productName && roundData.currentProduct) {
        productName.textContent = roundData.currentProduct.name;
    }
    if (productImage && roundData.currentProduct) {
        productImage.src = roundData.currentProduct.imageUrl || '';
        productImage.alt = roundData.currentProduct.name;
    }
    if (productPrice && roundData.currentProduct) {
        productPrice.textContent = `ريال ${roundData.currentProduct.price}`;
    }
    if (roundCounter) {
        roundCounter.textContent = `${roundData.round}/${roundData.maxRounds}`;
    }
    if (scoreDisplay) {
        scoreDisplay.textContent = getHigherLowerScore();
    }
}

function showHigherLowerResult(result) {
    // First, reveal the actual price on the UI
    const product2Price = document.querySelector('#higher-lower-product-2 .price-value');
    if (product2Price && result.nextProduct) {
        product2Price.textContent = `ريال ${result.nextProduct.price}`;
        product2Price.classList.remove('text-muted');
        product2Price.classList.add(result.correct ? 'text-success' : 'text-danger');
    }
    
    // Small delay before showing modal to let users see the price
    setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById('higherLowerResultModal'));
        const modalElement = document.getElementById('higherLowerResultModal');
        
        const resultIcon = document.getElementById('higherLowerResultIcon');
        const resultMessage = document.getElementById('higherLowerResultMessage');
        const resultDetails = document.getElementById('higherLowerResultDetails');
        
        if (result.correct) {
            resultIcon.className = 'bi bi-check-circle-fill text-success display-1';
            resultMessage.textContent = 'إجابة صحيحة! أحسنت';
        } else {
            resultIcon.className = 'bi bi-x-circle-fill text-danger display-1';
            resultMessage.textContent = 'إجابة خاطئة، حاول مرة أخرى';
        }
        
        if (resultDetails && result.nextProduct) {
            resultDetails.innerHTML = `
                <div class="text-center">
                    <p class="mb-3">لقد خمنت أن سعر <strong>${result.nextProduct.name}</strong> سيكون <strong>${result.actualResult === 'higher' ? 'أعلى' : 'أقل'}</strong> من ريال ${result.currentProduct?.price || 0}</p>
                    <p class="mb-2">السعر الفعلي: <strong>ريال ${result.nextProduct.price || 0}</strong></p>
                    <p class="mb-0">الإجابة الصحيحة: <strong>${result.actualResult === 'higher' ? 'أعلى' : 'أقل'}</strong></p>
                </div>
            `;
        }
        
        modal.show();
           
        const handleModalClose = function() {
            modal.hide();
        };
        
        const handleModalHidden = function() {
            // Reset the price display for next round
            if (product2Price) {
                product2Price.textContent = '؟؟؟';
                product2Price.className = 'price-value text-muted';
            }
            
            if (modalElement) {
                modalElement.setAttribute('aria-hidden', 'true');
            }
            modalElement.removeEventListener('click', handleModalClose);
            modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
        };
        
        if (modalElement) {
            modalElement.addEventListener('click', handleModalClose);
            modalElement.addEventListener('hidden.bs.modal', handleModalHidden, { once: true });
        }
    }, 800); // 800ms delay to show the price revelation
}

function showHigherLowerFinalScore() {
    const modal = new bootstrap.Modal(document.getElementById('higherLowerFinalScoreModal'));
    const score = getHigherLowerScore();
    const maxRounds = getHigherLowerMaxRounds();
    const wrongAnswers = maxRounds - score;
    const accuracy = Math.round((score / maxRounds) * 100);
    
    document.getElementById('higherLowerFinalScoreDisplay').textContent = `${score}/${maxRounds}`;
    document.getElementById('higherLowerCorrectAnswers').textContent = score;
    document.getElementById('higherLowerWrongAnswers').textContent = wrongAnswers;
    
    const messageEl = document.getElementById('higherLowerFinalScoreMessage');
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


// Expose initApp to window for page-loader to call
window.initApp = initApp;

// Expose initGame to window for uiManager.js to call
window.initGame = initGame;

window.showModeSelection = showModeSelection;

window.initTimedGame = initTimedGame;
window.initHigherLowerGame = initHigherLowerGame;
window.hideAllScreens = hideAllScreens;
window.initMemoryMatchGame = initMemoryMatchGame;
window.showMemoryMatchScreen = showMemoryMatchScreen;
window.initBasketGame = initBasketGame;
window.showBasketModeScreen = showBasketModeScreen;