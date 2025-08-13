// Higher-Lower mode logic - "Guess if the next price is higher or lower!"
import { getFilteredProducts, setCurrentProduct } from '../gameState.js';
import { getRandomProductIndex } from '../gameLogic.js';

let currentProduct = null;
let nextProduct = null;
let higherLowerScore = 0;
let higherLowerRound = 1; // Start from 1 instead of 0
let maxRounds = 10;
let gameHistory = [];

export function initHigherLowerMode() {
    higherLowerScore = 0;
    higherLowerRound = 1; // Start from 1
    gameHistory = [];
    currentProduct = null;
    nextProduct = null;
    generateHigherLowerRound();
}

export function generateHigherLowerRound() {
    const products = getFilteredProducts();

    console.log('Products available for higher-lower:', products ? products.length : 0);

    if (!products || products.length === 0) {
        throw new Error('No products available for comparison');
    }
    
    if (products.length < 2) {
        throw new Error('Need at least 2 products for higher-lower mode');
    }
    
    // Get current product or generate first one
    if (!currentProduct) {
        const randomIndex = getRandomProductIndex(products);
        currentProduct = products[randomIndex];
        console.log('Selected first product:', currentProduct.name);
    }
    
    // Filter by name instead of id since products don't have id field
    let candidates = products.filter(p => p.name !== currentProduct.name);
    console.log('Candidates after filtering by name:', candidates.length);
    
    // OPTION 1 IMPLEMENTATION: Only use products with different prices
    let differentPriceProducts = candidates.filter(p => p.price !== currentProduct.price);
    console.log('Products with different prices:', differentPriceProducts.length);
    
    if (differentPriceProducts.length > 0) {
        // Use products with different prices
        const randomIndex = Math.floor(Math.random() * differentPriceProducts.length);
        nextProduct = differentPriceProducts[randomIndex];
        console.log('Selected next product (different price):', nextProduct.name, nextProduct.price);
    } else {
        // No products with different prices available - try to find a new current product
        console.log('No products with different prices found. Attempting to find new current product.');
        
        // Get all products with different prices from any product
        const allDifferentPricePairs = [];
        for (let i = 0; i < products.length; i++) {
            for (let j = 0; j < products.length; j++) {
                if (i !== j && products[i].price !== products[j].price) {
                    allDifferentPricePairs.push({ current: products[i], next: products[j] });
                }
            }
        }
        
        if (allDifferentPricePairs.length > 0) {
            // Select a random pair with different prices
            const randomPairIndex = Math.floor(Math.random() * allDifferentPricePairs.length);
            const selectedPair = allDifferentPricePairs[randomPairIndex];
            currentProduct = selectedPair.current;
            nextProduct = selectedPair.next;
            console.log('Found new pair with different prices:', currentProduct.name, currentProduct.price, 'vs', nextProduct.name, nextProduct.price);
        } else {
            // Truly no products with different prices in the entire dataset
            throw new Error('No products with different prices available for comparison. All products have identical prices.');
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
    const gameComplete = higherLowerRound > maxRounds;
    
    // Clear next product - will be generated later if game continues
    nextProduct = null;
    
    // Return the result with the products that were actually compared
    const result = {
        correct: isCorrect,
        score: higherLowerScore,
        round: higherLowerRound - 1, // Show the round that was just completed
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

// Generate the next mystery product
export function generateNextMysteryProduct() {
    if (higherLowerRound > maxRounds || !currentProduct) {
        return;
    }
    
    const products = getFilteredProducts();
    if (!products || products.length < 2) {
        return;
    }
    
    // Filter by name instead of id since products don't have id field
    let candidates = products.filter(p => p.name !== currentProduct.name);
    
    // OPTION 1 IMPLEMENTATION: Only use products with different prices
    let differentPriceProducts = candidates.filter(p => p.price !== currentProduct.price);
    
    if (differentPriceProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * differentPriceProducts.length);
        nextProduct = differentPriceProducts[randomIndex];
        console.log('Generated next mystery product with different price:', nextProduct.name, nextProduct.price);
    } else {
        // No products with different prices - try to find a new current product that has different-priced alternatives
        console.log('No different-priced products available for current product. Searching for new current product.');
        
        // Find products that have at least one different-priced alternative
        const productsWithDifferentPriceAlternatives = products.filter(product => {
            return products.some(other => other.name !== product.name && other.price !== product.price);
        });
        
        if (productsWithDifferentPriceAlternatives.length > 0) {
            // Select a new current product that has different-priced alternatives
            const randomIndex = Math.floor(Math.random() * productsWithDifferentPriceAlternatives.length);
            currentProduct = productsWithDifferentPriceAlternatives[randomIndex];
            
            // Now find a different-priced product for the new current product
            const newCandidates = products.filter(p => p.name !== currentProduct.name && p.price !== currentProduct.price);
            if (newCandidates.length > 0) {
                const nextRandomIndex = Math.floor(Math.random() * newCandidates.length);
                nextProduct = newCandidates[nextRandomIndex];
                console.log('Selected new current product and next product with different prices:', currentProduct.name, currentProduct.price, 'vs', nextProduct.name, nextProduct.price);
            }
        } else {
            // All products have identical prices - this should be rare
            console.warn('All products have identical prices. Cannot generate meaningful comparison.');
            nextProduct = null;
        }
    }
}

export function getCurrentRound() {
    // If nextProduct is null and game is still active, generate it
    if (!nextProduct && higherLowerRound <= maxRounds && currentProduct) {
        generateNextMysteryProduct();
    }
    
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