// Core game logic functions
import { toArabicNumerals } from '../utils/arabicNumerals.js';
import { 
    getCurrentProduct, 
    getAttempts, 
    incrementAttempts, 
    getMaxAttempts,
    getRecentProducts,
    addRecentProduct,
    resetRecentProducts
} from './gameState.js';

export function checkGuess(guess) {
    const attempts = incrementAttempts();
    const currentProduct = getCurrentProduct();
    const maxAttempts = getMaxAttempts();
    const difference = Math.abs(guess - currentProduct.price);
    const sarImg = '<img src="images/sar/Saudi_Riyal_Symbol-1.png" alt="SAR" class="sar-symbol" style="height: 1.5em; width: auto; vertical-align: middle; margin-left: 0.2em; margin-right: 0.2em;" />';
    
    if (guess === currentProduct.price) {
        return { 
            correct: true, 
            message: `<i class="bi bi-check-circle-fill"></i>`,
            color: 'bg-primary bg-opacity-25'
        };
    } else if (attempts >= maxAttempts) {
        return { 
            correct: false, 
            message: `<i class="bi bi-x-circle-fill"></i>`,
            color: 'bg-danger bg-opacity-25'
        };
    } else if (guess < currentProduct.price) {
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

export function getRandomProductIndex(productsArray) {
    const recentProducts = getRecentProducts();
    
    // Filter out recently shown products
    const availableProducts = productsArray
        .map((_, index) => index)
        .filter(index => !recentProducts.includes(index));

    // Reset history if all products have been shown
    if (availableProducts.length === 0) {
        resetRecentProducts();
        return Math.floor(Math.random() * productsArray.length);
    }

    const randomIndex = availableProducts[
        Math.floor(Math.random() * availableProducts.length)
    ];

    // Update recent products queue
    addRecentProduct(randomIndex);

    return randomIndex;
}