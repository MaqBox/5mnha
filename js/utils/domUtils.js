// DOM utility functions

/**
 * Safely get a DOM element, with optional retry mechanism
 * @param {string} selector - The CSS selector for the element
 * @param {number} maxRetries - Maximum number of retries (default: 15)
 * @param {number} retryInterval - Milliseconds between retries (default: 200)
 * @returns {Promise<Element>} - The DOM element
 */
export async function getElement(selector, maxRetries = 20, retryInterval = 300) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const tryGetElement = () => {
            attempts++;
            const element = document.querySelector(selector);
            
            if (element) {
                resolve(element);
            } else if (attempts < maxRetries) {
                setTimeout(tryGetElement, retryInterval);
            } else {
                console.error(`Element not found after ${maxRetries} attempts: ${selector}`);
                reject(new Error(`Element not found: ${selector}`));
            }
        };
        
        tryGetElement();
    });
}

/**
 * Safely get multiple DOM elements
 * @param {string[]} selectors - Array of CSS selectors
 * @returns {Promise<Object>} - Object with elements mapped to their selectors
 */
export async function getElements(selectors, maxRetries = 20, retryInterval = 300) {
    const elements = {};
    const missingElements = [];
    
    for (const selector of selectors) {
        const key = selector.startsWith('#') ? selector.substring(1) : selector.replace('.', '');
        try {
            elements[key] = await getElement(selector, maxRetries, retryInterval);
        } catch (error) {
            console.error(`Failed to get element: ${selector}`, error);
            missingElements.push(selector);
        }
    }
    
    if (missingElements.length > 0) {
        console.warn('Some elements could not be found:', missingElements);
    }
    
    return elements;
}