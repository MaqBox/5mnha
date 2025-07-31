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
    
    // Get two different random products
    let product1Index = getRandomProductIndex(products);
    let product2Index;
    
    do {
        product2Index = getRandomProductIndex(products);
    } while (product2Index === product1Index);
    
    const product1 = products[product1Index];
    const product2 = products[product2Index];
    
    currentComparison = {
        product1,
        product2,
        correctAnswer: product1.price > product2.price ? 'product1' : 'product2'
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