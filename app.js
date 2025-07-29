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
let selectedCategory = null;
let filteredProducts = [];

// Category definitions
const categories = {
    'fresh-produce': {
        name: 'خضار وفواكه طازجة',
        keywords: ['موز', 'بطاطس', 'طماطم', 'خيار', 'بصل', 'برتقال', 'ليمون', 'فلفل', 'توت', 'جزر', 'خس', 'باذنجان', 'تفاح', 'كوسة']
    },
    'snacks-chocolates': {
        name: 'وجبات خفيفة وشوكولاتة',
        keywords: ['صن رينج', 'تيفاني', 'البطل', 'باجة', 'كريسبي', 'دوريتوس', 'أعواد', 'فيريرو', 'هيرشيز', 'كيندر', 'كيت كات', 'إم آند إمز', 'ميني', 'أوزمو', 'ريسز']
    },
    'canned-goods': {
        name: 'معلبات',
        keywords: ['تونة', 'ذرة', 'طماطم مقشرة', 'طماطم مقطعة', 'فول مدمس', 'حمص', 'أناناس']
    },
    'basic-products': {
        name: 'منتجات أساسية',
        keywords: ['حليب', 'سكر', 'زيت']
    },
    'personal-care': {
        name: 'عناية شخصية',
        keywords: ['معجون أسنان', 'كولجيت']
    },
    'frozen-foods': {
        name: 'أطعمة مجمدة',
        keywords: ['قطع دجاج', 'سيارا']
    }
};

// DOM elements
const guessInput = document.getElementById('guess-input');
const submitButton = document.getElementById('submit-guess');
const guessContainer = document.querySelector('.guess-container');
const resultDiv = document.querySelector('.result');
const productImage = document.getElementById('product-image');
const categorySelection = document.getElementById('category-selection');
const gameScreen = document.getElementById('game-screen');
const backToCategoriesBtn = document.getElementById('back-to-categories');

// Get modal elements
const gameEndModal = document.getElementById('gameEndModal');
const gameEndModalBody = document.getElementById('gameEndModalBody');
const gameEndTryAgain = document.getElementById('gameEndTryAgain');

// Category selection functionality
function filterProductsByCategory(category) {
    console.log('Filtering by category:', category);
    console.log('Total products loaded:', products.length);
    
    if (!category) {
        console.log('No category provided');
        return [];
    }
    
    const filtered = products.filter(product => {
        console.log('Product category:', product.category, 'Target category:', category, 'Match:', product.category === category);
        return product.category === category;
    });
    
    console.log('Filtered products count:', filtered.length);
    console.log('Filtered products:', filtered);
    
    return filtered;
}

function showCategorySelection() {
    categorySelection.style.display = 'block';
    gameScreen.style.display = 'none';
    selectedCategory = null;
    filteredProducts = [];
}

function showGameScreen() {
    categorySelection.style.display = 'none';
    gameScreen.style.display = 'block';
}

// Category box click handlers
// Add this function to preload products
async function loadProducts() {
    try {
        if (products.length === 0) {
            console.log('Loading products...');
            const response = await fetch('products.json');
            products = await response.json();
            console.log('Products loaded:', products.length);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => {
    // Load products first
    await loadProducts();
    
    const categoryBoxes = document.querySelectorAll('.category-box');
    console.log('Found category boxes:', categoryBoxes.length);
    
    categoryBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const category = box.getAttribute('data-category');
            console.log('Category box clicked:', category);
            console.log('Products array length before filtering:', products.length);
            
            selectedCategory = category;
            filteredProducts = filterProductsByCategory(category);
            
            console.log('Filtered products result:', filteredProducts.length);
            
            if (filteredProducts.length === 0) {
                console.log('No products found for category:', category);
                alert('لا توجد منتجات في هذه الفئة حالياً');
                return;
            }
            
            showGameScreen();
            initGame();
        });
    });
});

// Update the initGame function to remove the product loading logic since it's now preloaded
async function initGame() {
    try {
        if (products.length === 0) {
            console.log('Products not loaded, loading now...');
            await loadProducts();
        }
        
        if (products.length === 0) {
            throw new Error('No products found');
        }
        
        // Use filtered products if category is selected
        const productsToUse = selectedCategory ? filteredProducts : products;
        
        if (productsToUse.length === 0) {
            throw new Error('No products found in selected category');
        }
        
        // Pick a random product from the filtered list
        const randomIndex = getRandomProductIndex(productsToUse);
        currentProduct = productsToUse[randomIndex];
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

// Back to categories button
if (backToCategoriesBtn) {
    backToCategoriesBtn.addEventListener('click', () => {
        showCategorySelection();
    });
}

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

function getRandomProductIndex(productsArray) {
    // Filter out recently shown products
    const availableProducts = productsArray
        .map((_, index) => index)
        .filter(index => !recentProducts.includes(index));

    // Reset history if all products have been shown
    if (availableProducts.length === 0) {
        recentProducts = [];
        return Math.floor(Math.random() * productsArray.length);
    }

    const randomIndex = availableProducts[
        Math.floor(Math.random() * availableProducts.length)
    ];

    // Update recent products queue
    recentProducts.push(randomIndex);
    if (recentProducts.length > 25) {
        recentProducts.shift();
    }

    return randomIndex;
}

// Update submitButton event listener to show modal on game end
submitButton.addEventListener('click', () => {
    const inputValue = guessInput.value.trim();
    const guess = parseFloat(inputValue);
    
    // Validate input: must be a positive number
    if (isNaN(guess) || guess < 0) {
        // Show error message for invalid input
        resultDiv.innerHTML = '<div class="alert alert-warning" role="alert">يرجى إدخال رقم صحيح أكبر من أو يساوي صفر</div>';
        resultDiv.className = 'result animate__animated animate__shake';
        return;
    }
    
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
});

// Enhanced input event listener to allow only whole numbers (no decimals)
guessInput.addEventListener('input', (event) => {
    const value = event.target.value;
    // Remove any non-digit characters (letters, decimals, negative signs, etc.)
    // Only allow digits 0-9
    const cleanValue = value.replace(/[^0-9]/g, '');
    event.target.value = cleanValue;
});

// Enhanced keydown event listener to prevent typing unwanted characters
guessInput.addEventListener('keydown', (event) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.keyCode === 65 && event.ctrlKey === true) ||
        (event.keyCode === 67 && event.ctrlKey === true) ||
        (event.keyCode === 86 && event.ctrlKey === true) ||
        (event.keyCode === 88 && event.ctrlKey === true) ||
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
        return;
    }
    
    // Only allow digits (0-9) - block everything else including decimal point
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && 
        (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
    }
});

// Add keydown event listener to prevent typing negative signs
guessInput.addEventListener('keydown', (event) => {
    // Prevent minus key (both regular and numpad)
    if (event.key === '-' || event.key === 'Subtract') {
        event.preventDefault();
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

// Start the game when page loads - show category selection first
window.addEventListener('DOMContentLoaded', () => {
    showCategorySelection();
});

// Image modal functionality
document.getElementById('product-image').addEventListener('click', function() {
    const modalImage = document.getElementById('modal-image');
    modalImage.src = this.src;
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show();
});

// Add image preloading and compression
function optimizeImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}

// Preload next 3 product images
function preloadNextImages() {
    const nextIndexes = getNextProductIndexes(3);
    nextIndexes.forEach(index => {
        if (products[index]) {
            optimizeImage(products[index].imageUrl);
        }
    });
}
