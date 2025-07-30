// Product loading and filtering service
let products = [];

export async function loadProducts() {
    try {
        if (products.length === 0) {
            console.log('Loading products...');
            const response = await fetch('products.json');
            products = await response.json();
            console.log('Products loaded:', products.length);
        }
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        throw error;
    }
}

export function getProducts() {
    return products;
}

export function filterProductsByCategory(category) {
    console.log('Filtering by category:', category);
    console.log('Total products loaded:', products.length);
    
    if (!category) {
        console.log('No category provided');
        return [];
    }
    
    const filtered = products.filter(product => {
        console.log('Product category:', product.category, 'Target category:', category, 'Match:', product.category === category);
        return product.category === category;
    });
    
    console.log('Filtered products count:', filtered.length);
    console.log('Filtered products:', filtered);
    
    return filtered;
}