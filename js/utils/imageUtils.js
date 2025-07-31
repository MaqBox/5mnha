// Image optimization and preloading utilities
export function optimizeImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}

export function preloadNextImages(products, getNextProductIndexes) {
    const nextIndexes = getNextProductIndexes(3);
    nextIndexes.forEach(index => {
        if (products[index]) {
            optimizeImage(products[index].imageUrl);
        }
    });
}