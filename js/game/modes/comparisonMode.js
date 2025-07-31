// Comparison mode logic - "Which is more expensive?"
import { getFilteredProducts } from '../gameState.js';
import { getRandomProductIndex } from '../gameLogic.js';

let currentComparison = null;
let comparisonScore = 0;
let comparisonRound = 0;
let maxRounds = 10;

export function initComparisonMode() {
    comparisonScore = 0;
    comparisonRound = 0;
    generateComparison();
}

export function generateComparison() {
    const products = getFilteredProducts();
    
    if (products.length < 2) {
        throw new Error('Need at least 2 products for comparison mode');
    }
    
    // Get two different random products with different prices
    let product1Index = getRandomProductIndex(products);
    let product2Index;
    let attempts = 0;
    const maxAttempts = products.length * 2; // Prevent infinite loop
    
    do {
        product2Index = getRandomProductIndex(products);
        attempts++;
        
        // If we've tried too many times, just use any different product
        if (attempts > maxAttempts) {
            break;
        }
    } while (product2Index === product1Index || products[product1Index].price === products[product2Index].price);
    
    const product1 = products[product1Index];
    const product2 = products[product2Index];
    
    // If products still have the same price after max attempts, find a different one
    if (product1.price === product2.price) {
        // Find a product with a different price
        for (let i = 0; i < products.length; i++) {
            if (i !== product1Index && products[i].price !== product1.price) {
                product2Index = i;
                break;
            }
        }
    }
    
    const finalProduct1 = products[product1Index];
    const finalProduct2 = products[product2Index];
    
    // If we still can't find products with different prices, throw an error
    if (finalProduct1.price === finalProduct2.price) {
        throw new Error('Cannot find products with different prices for comparison');
    }
    
    currentComparison = {
        product1: finalProduct1,
        product2: finalProduct2,
        correctAnswer: finalProduct1.price > finalProduct2.price ? 'product1' : 'product2'
    };
    
    comparisonRound++;
    
    return currentComparison;
}

export function checkComparisonAnswer(selectedProduct) {
    if (!currentComparison) {
        return { error: 'No active comparison' };
    }
    
    const isCorrect = selectedProduct === currentComparison.correctAnswer;
    
    if (isCorrect) {
        comparisonScore++;
    }
    
    const result = {
        correct: isCorrect,
        score: comparisonScore,
        round: comparisonRound,
        maxRounds,
        product1: currentComparison.product1,
        product2: currentComparison.product2,
        correctAnswer: currentComparison.correctAnswer,
        gameComplete: comparisonRound >= maxRounds
    };
    
    return result;
}

export function getCurrentComparison() {
    return currentComparison;
}

export function getComparisonScore() {
    return comparisonScore;
}

export function getComparisonRound() {
    return comparisonRound;
}

export function getMaxRounds() {
    return maxRounds;
}

export function setMaxRounds(rounds) {
    maxRounds = rounds;
}