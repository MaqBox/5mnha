// Game state management
import { gameConfig } from '../config/gameConfig.js';

let currentProduct = null;
let guesses = [];
let attempts = 0;
let recentProducts = [];
let selectedCategory = null;
let filteredProducts = [];

export function getCurrentProduct() {
    return currentProduct;
}

export function setCurrentProduct(product) {
    currentProduct = product;
}

export function getGuesses() {
    return guesses;
}

export function addGuess(guess) {
    guesses.push(guess);
}

export function resetGuesses() {
    guesses = [];
}

export function getAttempts() {
    return attempts;
}

export function incrementAttempts() {
    attempts++;
    return attempts;
}

export function resetAttempts() {
    attempts = 0;
}

export function getMaxAttempts() {
    return gameConfig.maxAttempts;
}

export function getRecentProducts() {
    return recentProducts;
}

export function addRecentProduct(index) {
    recentProducts.push(index);
    if (recentProducts.length > gameConfig.recentProductsLimit) {
        recentProducts.shift();
    }
}

export function resetRecentProducts() {
    recentProducts = [];
}

export function getSelectedCategory() {
    return selectedCategory;
}

export function setSelectedCategory(category) {
    selectedCategory = category;
}

export function getFilteredProducts() {
    return filteredProducts;
}

export function setFilteredProducts(products) {
    filteredProducts = products;
}

export function resetGameState() {
    currentProduct = null;
    guesses = [];
    attempts = 0;
    selectedCategory = null;
    filteredProducts = [];
}