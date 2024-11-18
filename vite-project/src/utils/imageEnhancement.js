const enhanceImage = async (imageData) => {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            
            img.onload = () => {
                // High-quality upscaling
                const scale = 4.0;
                const intermediateCanvas = document.createElement('canvas');
                intermediateCanvas.width = img.width * scale;
                intermediateCanvas.height = img.height * scale;
                const intermediateCtx = intermediateCanvas.getContext('2d', { willReadFrequently: true });

                intermediateCtx.imageSmoothingEnabled = true;
                intermediateCtx.imageSmoothingQuality = 'high';
                intermediateCtx.drawImage(img, 0, 0, intermediateCanvas.width, intermediateCanvas.height);

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(intermediateCanvas, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const width = canvas.width;

                const smoothedData = new Uint8ClampedArray(data);

                // Enhanced dark spot removal
                for (let y = 2; y < canvas.height - 2; y++) {
                    for (let x = 2; x < canvas.width - 2; x++) {
                        const idx = (y * width + x) * 4;
                        
                        if (isDarkSpot(data, idx, width)) {
                            const avgColor = getAverageColor(data, x, y, width);
                            const isSkin = isSkinTone(data[idx], data[idx + 1], data[idx + 2]);
                            
                            // Reduced blending factors for dark spots
                            const blendFactor = isSkin ? 0.65 : 0.55;
                            
                            smoothedData[idx] = lerp(data[idx], avgColor.r, blendFactor);
                            smoothedData[idx + 1] = lerp(data[idx + 1], avgColor.g, blendFactor);
                            smoothedData[idx + 2] = lerp(data[idx + 2], avgColor.b, blendFactor);
                            
                            // Reduced surrounding pixel blend strength
                            const blendRadius = isSkin ? 2 : 1;
                            for (let dy = -blendRadius; dy <= blendRadius; dy++) {
                                for (let dx = -blendRadius; dx <= blendRadius; dx++) {
                                    if (dx === 0 && dy === 0) continue;
                                    
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    const surroundIdx = ((y + dy) * width + (x + dx)) * 4;
                                    
                                    if (surroundIdx >= 0 && surroundIdx < data.length - 3) {
                                        const surroundBlend = (1 - distance / (blendRadius + 1)) * 0.3;
                                        smoothedData[surroundIdx] = lerp(data[surroundIdx], avgColor.r, surroundBlend);
                                        smoothedData[surroundIdx + 1] = lerp(data[surroundIdx + 1], avgColor.g, surroundBlend);
                                        smoothedData[surroundIdx + 2] = lerp(data[surroundIdx + 2], avgColor.b, surroundBlend);
                                    }
                                }
                            }
                        }
                    }
                }

                // Enhanced color processing
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = smoothedData[i];
                    data[i + 1] = smoothedData[i + 1];
                    data[i + 2] = smoothedData[i + 2];

                    if (isSkinTone(data[i], data[i + 1], data[i + 2])) {
                        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
                        
                        // Minimal skin enhancement parameters
                        const brightnessBoost = 1.02;
                        const saturationReduce = 0.98;
                        
                        const newL = Math.min(l * brightnessBoost, 0.95);
                        const newS = s * saturationReduce;
                        
                        const [r, g, b] = hslToRgb(h, newS, newL);
                        
                        // Reduced blending strength
                        data[i] = truncate(lerp(data[i], r, 0.3));
                        data[i + 1] = truncate(lerp(data[i + 1], g, 0.3));
                        data[i + 2] = truncate(lerp(data[i + 2], b, 0.3));
                        
                        // Minimal highlight intensity
                        const highlightIntensity = 0.03;
                        data[i] = truncate(data[i] + (255 - data[i]) * highlightIntensity);
                        data[i + 1] = truncate(data[i + 1] + (255 - data[i + 1]) * highlightIntensity);
                        data[i + 2] = truncate(data[i + 2] + (255 - data[i + 2]) * highlightIntensity);
                    }

                    data[i + 3] = smoothedData[i + 3];
                }

                // Final adjustments
                ctx.putImageData(imageData, 0, 0);
                
                // Very subtle final adjustments
                ctx.filter = 'brightness(101%) contrast(100.5%)';
                ctx.drawImage(canvas, 0, 0);
                ctx.filter = 'none';

                resolve(canvas.toDataURL('image/png', 1.0));
            };

            img.onerror = (error) => {
                console.error('Error loading image for enhancement:', error);
                reject(new Error('Failed to load image for enhancement'));
            };

            img.src = imageData;

        } catch (error) {
            console.error('Image enhancement error:', error);
            reject(error);
        }
    });
};

// More conservative dark spot detection
const isDarkSpot = (data, idx, width) => {
    const centerBrightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    const surroundingBrightness = getSurroundingBrightness(data, idx, width);
    
    if (isSkinTone(data[idx], data[idx + 1], data[idx + 2])) {
        return centerBrightness < surroundingBrightness - 18;
    }
    return centerBrightness < surroundingBrightness - 20;
};

// Add RGB to HSL conversion
const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return [h, s, l];
};

// Add HSL to RGB conversion
const hslToRgb = (h, s, l) => {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
};

// Get average brightness of surrounding pixels
const getSurroundingBrightness = (data, idx, width) => {
    const offsets = [
        -width * 4 - 4, -width * 4, -width * 4 + 4,
        -4, 4,
        width * 4 - 4, width * 4, width * 4 + 4
    ];
    
    let total = 0;
    let count = 0;
    
    offsets.forEach(offset => {
        const pos = idx + offset;
        if (pos >= 0 && pos < data.length) {
            total += (data[pos] + data[pos + 1] + data[pos + 2]) / 3;
            count++;
        }
    });
    
    return total / count;
};

// Get average color of surrounding pixels
const getAverageColor = (data, x, y, width) => {
    let r = 0, g = 0, b = 0, count = 0;
    
    // Increased radius from 1 to 2 for wider sampling
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const idx = ((y + dy) * width + (x + dx)) * 4;
            if (idx >= 0 && idx < data.length - 3) {
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
            }
        }
    }
    
    return {
        r: r / count,
        g: g / count,
        b: b / count
    };
};

// Linear interpolation helper
const lerp = (a, b, t) => {
    return a + (b - a) * t;
};

// Helper function to keep values in valid range
const truncate = (value) => {
    return Math.min(255, Math.max(0, Math.round(value)));
};

// Improved skin tone detection
const isSkinTone = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    return (
        r > 95 && g > 40 && b > 20 &&
        r > g && r > b &&
        max - min > 15 &&
        Math.abs(r - g) > 15 &&
        r - g > 20
    );
};

export { enhanceImage }; 