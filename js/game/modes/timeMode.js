// Time mode logic - "Guess as many as you can in the time limit!"
import { getFilteredProducts, setCurrentProduct, resetGuesses, resetAttempts } from '../gameState.js';
import { getRandomProductIndex } from '../gameLogic.js';

let timeScore = 0;
let timeRemaining = 20; // 20 seconds default
let timerInterval = null;
let isTimeMode = false;
let currentTimeProduct = null;

export function initTimeMode(duration = 20) {
    timeScore = 0;
    timeRemaining = duration;
    isTimeMode = true;
    
    // Start the timer
    startTimer();
    
    // Generate first product
    generateTimeProduct();
}

export function generateTimeProduct() {
    const products = getFilteredProducts();
    
    if (products.length === 0) {
        throw new Error('No products available for time mode');
    }
    
    const randomIndex = getRandomProductIndex(products);
    const selectedProduct = products[randomIndex];
    
    currentTimeProduct = selectedProduct;
    setCurrentProduct(selectedProduct);
    resetGuesses();
    resetAttempts();
    
    return selectedProduct;
}

export function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            endTimeMode();
        }
    }, 1000);
}

export function updateTimerDisplay() {
    const timerElement = document.getElementById('time-remaining');
    const timerCircle = document.getElementById('timer-progress-circle');
    
    if (timerElement) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update circular progress
        if (timerCircle) {
            const initialTime = 60; // or whatever the initial time was
            const progressPercentage = (timeRemaining / initialTime);
            const circumference = 2 * Math.PI * 45; // 2πr where r=45
            const offset = circumference * (1 - progressPercentage);
            timerCircle.style.strokeDasharray = `${circumference}`;
            timerCircle.style.strokeDashoffset = `${offset}`;
            
            // Remove previous warning classes
            timerCircle.classList.remove('warning', 'danger');
            timerElement.classList.remove('text-warning', 'text-danger');
            
            // Add warning colors based on time remaining
            if (timeRemaining <= 5) {
                timerCircle.classList.add('danger');
                timerElement.classList.add('text-danger');
            } else if (timeRemaining <= 10) {
                timerCircle.classList.add('warning');
                timerElement.classList.add('text-warning');
            }
        }
    }
}

export function endTimeMode() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    isTimeMode = false;
    
    // Show final score modal
    showTimeModeResults();
}

export function showTimeModeResults() {
    const modal = new bootstrap.Modal(document.getElementById('timeModeResultModal'));
    const scoreElement = document.getElementById('time-mode-final-score');
    
    if (scoreElement) {
        scoreElement.textContent = timeScore;
    }
    
    modal.show();
}

export function handleCorrectGuess() {
    timeScore++;
    updateScoreDisplay();
    
    // Generate next product immediately
    setTimeout(() => {
        if (isTimeMode && timeRemaining > 0) {
            generateTimeProduct();
            // Update UI with new product
            const event = new CustomEvent('timeProductChanged', {
                detail: { product: currentTimeProduct }
            });
            document.dispatchEvent(event);
        }
    }, 1000); // Small delay to show success
}

export function updateScoreDisplay() {
    const scoreElement = document.getElementById('time-mode-score');
    if (scoreElement) {
        scoreElement.textContent = timeScore;
    }
}

export function getTimeScore() {
    return timeScore;
}

export function getTimeRemaining() {
    return timeRemaining;
}

export function isTimeModeActive() {
    return isTimeMode;
}

export function getCurrentTimeProduct() {
    return currentTimeProduct;
}

export function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

export function resumeTimer() {
    if (isTimeMode && timeRemaining > 0) {
        startTimer();
    }
}

export function stopTimeModeWithoutResults() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    isTimeMode = false;
}