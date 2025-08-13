// Page loader utility to load HTML content into containers
class PageLoader {
    static async loadPage(pageName, containerId) {
        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load ${pageName}: ${response.status}`);
            }
            const content = await response.text();
            document.getElementById(containerId).innerHTML = content;
        } catch (error) {
            console.error('Error loading page:', error);
        }
    }

    static async loadModals() {
        try {
            const response = await fetch('pages/modals.html');
            if (!response.ok) {
                throw new Error(`Failed to load modals: ${response.status}`);
            }
            const content = await response.text();
            document.getElementById('modals-container').innerHTML = content;
        } catch (error) {
            console.error('Error loading modals:', error);
        }
    }
}

// Load all pages when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load all page content first
        await Promise.all([
            PageLoader.loadPage('mode-selection', 'mode-selection'),
            PageLoader.loadPage('category-selection', 'category-selection'),
            PageLoader.loadPage('game-screen', 'game-screen'),
            PageLoader.loadPage('comparison-screen', 'comparison-screen'),
            PageLoader.loadPage('higher-lower-screen', 'higher-lower-screen'),
            PageLoader.loadPage('memory-match-screen', 'memory-match-screen'), // Add this line
            PageLoader.loadModals()
        ]);
        
        console.log('All pages loaded successfully');
        
        // Wait longer for DOM to be fully ready and processed
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Now initialize the app
        if (window.initApp) {
            await window.initApp();
        }
    } catch (error) {
        console.error('Error during page loading and initialization:', error);
    }
});