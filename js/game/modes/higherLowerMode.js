// Higher-Lower mode logic - "Guess if the next price is higher or lower!"
import { getFilteredProducts, setCurrentProduct } from '../gameState.js';
import { getRandomProductIndex } from '../gameLogic.js';

let currentProduct = null;
let nextProduct = null;
let higherLowerScore = 0;
let higherLowerRound = 0;
let maxRounds = 10;
let gameHistory = [];

export function initHigherLowerMode() {
    higherLowerScore = 0;
    higherLowerRound = 0;
    gameHistory = [];
    generateHigherLowerRound();
}

export function generateHigherLowerRound() {
    const products = getFilteredProducts();
    
    if (products.length < 2) {
        throw new Error('Need at least 2 products for higher-lower mode');
    }
    
    // Get current product or generate first one
    if (!currentProduct) {
        const randomIndex = getRandomProductIndex(products);
        currentProduct = products[randomIndex];
    }
    
    // Get next product with different price
    let nextIndex;
    let attempts = 0;
    const maxAttempts = products.length * 2;
    
    do {
        nextIndex = getRandomProductIndex(products);
        attempts++;
        
        if (attempts > maxAttempts) {
            break;
        }
    } while (products[nextIndex].id === currentProduct.id || products[nextIndex].price === currentProduct.price);
    
    nextProduct = products[nextIndex];
    
    // If we can't find a product with different price, find any different one
    if (nextProduct.price === currentProduct.price) {
        for (let i = 0; i < products.length; i++) {
            if (products[i].id !== currentProduct.id) {
                nextProduct = products[i];
                break;
            }
        }
    }
    
    
    return {
        currentProduct: currentProduct,
        nextProduct: nextProduct,
        round: higherLowerRound,
        maxRounds: maxRounds
    };
}

export function checkHigherLowerAnswer(guess) {
    if (!currentProduct || !nextProduct) {
        return { error: 'No active round' };
    }
    
    // Save the products that were actually displayed for comparison
    const comparedCurrentProduct = currentProduct;
    const comparedNextProduct = nextProduct;
    
    // Debug logging
    console.log('Comparing products:');
    console.log('Current (visible):', comparedCurrentProduct.name, comparedCurrentProduct.price);
    console.log('Next (mystery):', comparedNextProduct.name, comparedNextProduct.price);
    
    // Compare against the DISPLAYED mystery product (nextProduct)
    const isHigher = nextProduct.price > currentProduct.price;
    const isCorrect = (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);
    
    if (isCorrect) {
        higherLowerScore++;
    }
    
    // Store history with the actual displayed products
    gameHistory.push({
        round: higherLowerRound,
        currentProduct: comparedCurrentProduct,
        nextProduct: comparedNextProduct,
        guess: guess,
        correct: isCorrect,
        actualHigher: isHigher
    });
    
    // Move the mystery product to become the new current product
    currentProduct = nextProduct;
    
    // Increment the round counter AFTER processing the current round
    higherLowerRound++;

    // Check for game completion AFTER incrementing the round
    const gameComplete = higherLowerRound >= maxRounds;
    
    // DON'T generate new mystery product here - do it later!
    // This prevents the race condition
    if (!gameComplete) {
        nextProduct = null; // Clear it for now
    } else {
        nextProduct = null;
    }
    
    // Return the result with the products that were actually compared
    const result = {
        correct: isCorrect,
        score: higherLowerScore,
        round: higherLowerRound, // This will now show the updated round number
        maxRounds: maxRounds,
        gameComplete: gameComplete,
        currentProduct: comparedCurrentProduct, // The product that was visible during comparison
        nextProduct: comparedNextProduct, // The mystery product that was actually compared
        actualResult: isHigher ? 'higher' : 'lower'
    };
    
    console.log('Result being returned:');
    console.log('Current in result:', result.currentProduct.name, result.currentProduct.price);
    console.log('Next in result:', result.nextProduct.name, result.nextProduct.price);
    
    return result;
}

// Add a new function to generate the next mystery product
export function generateNextMysteryProduct() {
    if (higherLowerRound >= maxRounds || !currentProduct) {
        return;
    }
    
    const products = getFilteredProducts();
    let nextIndex;
    let attempts = 0;
    const maxAttempts = products.length * 2;
    
    do {
        nextIndex = getRandomProductIndex(products);
        attempts++;
        
        if (attempts > maxAttempts) {
            break;
        }
    } while (products[nextIndex].id === currentProduct.id || products[nextIndex].price === currentProduct.price);
    
    nextProduct = products[nextIndex];
    
    // If we can't find a product with different price, find any different one
    if (nextProduct.price === currentProduct.price) {
        for (let i = 0; i < products.length; i++) {
            if (products[i].id !== currentProduct.id) {
                nextProduct = products[i];
                break;
            }
        }
    }
}

export function getCurrentRound() {
    return {
        currentProduct: currentProduct,
        nextProduct: nextProduct,
        round: higherLowerRound,
        maxRounds: maxRounds
    };
}

export function getHigherLowerScore() {
    return higherLowerScore;
}

export function getHigherLowerRound() {
    return higherLowerRound;
}

export function getMaxRounds() {
    return maxRounds;
}

export function setMaxRounds(rounds) {
    maxRounds = rounds;
}

export function getGameHistory() {
    return gameHistory;
}