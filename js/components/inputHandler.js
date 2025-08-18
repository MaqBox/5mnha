// Input validation and event handling
import { guessInput } from './uiManager.js';

export function setupInputValidation() {
    // Check if guessInput exists before adding event listeners
    if (!guessInput) {
        console.error('Error: guessInput element not found');
        return;
    }
    
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
}

export function validateGuess(inputValue) {
    // If input is empty or just whitespace, don't show error - just ignore
    if (!inputValue || inputValue.trim() === '') {
        return {
            valid: false,
            silent: true // Don't show error message
        };
    }
    
    const guess = parseFloat(inputValue);
    
    // Only validate if there's actual input
    if (isNaN(guess) || guess < 0) {
        return {
            valid: false,
            silent: true // Don't show error message, just ignore invalid input
        };
    }
    
    return {
        valid: true,
        value: guess
    };
}
export function setupInputValidationFor(element) {
    if (!element) return;

    // Allow only digits 0-9
    element.addEventListener('input', (event) => {
        const value = event.target.value;
        const cleanValue = value.replace(/[^0-9]/g, '');
        event.target.value = cleanValue;
    });

    // Block non-digit keys, decimal point, negatives, etc.
    element.addEventListener('keydown', (event) => {
        if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
            (event.keyCode === 65 && event.ctrlKey === true) ||
            (event.keyCode === 67 && event.ctrlKey === true) ||
            (event.keyCode === 86 && event.ctrlKey === true) ||
            (event.keyCode === 88 && event.ctrlKey === true) ||
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            return;
        }
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && 
            (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }
    });

    // Prevent minus sign
    element.addEventListener('keydown', (event) => {
        if (event.key === '-' || event.key === 'Subtract') {
            event.preventDefault();
        }
    });
}