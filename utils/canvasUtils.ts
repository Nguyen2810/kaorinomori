const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
};

const parseRatio = (ratioStr: string): number => {
    const [width, height] = ratioStr.split(':').map(Number);
    return width / height;
};

export const padImage = async (
    originalImageSrc: string,
    targetRatioStr: string
): Promise<{ paddedImage: string }> => {
    
    const image = await loadImage(originalImageSrc);

    const targetRatio = parseRatio(targetRatioStr);
    const originalRatio = image.width / image.height;

    let newWidth: number;
    let newHeight: number;

    // Determine the new canvas dimensions
    if (targetRatio > originalRatio) {
        // New canvas is wider than the original
        newWidth = image.height * targetRatio;
        newHeight = image.height;
    } else {
        // New canvas is taller than the original
        newWidth = image.width;
        newHeight = image.width / targetRatio;
    }
    
    // Create canvas for the image
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = newWidth;
    imageCanvas.height = newHeight;
    const imageCtx = imageCanvas.getContext('2d');
    if (!imageCtx) throw new Error("Could not get canvas context for image");

    // Fill image canvas with black. The model will replace this.
    imageCtx.fillStyle = 'black';
    imageCtx.fillRect(0, 0, newWidth, newHeight);

    // Calculate the position to draw the original image in the center
    const dx = (newWidth - image.width) / 2;
    const dy = (newHeight - image.height) / 2;

    // Draw original image onto the new, larger canvas
    imageCtx.drawImage(image, dx, dy);

    return {
        paddedImage: imageCanvas.toDataURL('image/png'),
    };
};
