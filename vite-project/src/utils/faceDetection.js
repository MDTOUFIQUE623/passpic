import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Passport photo specifications (in pixels)
const PASSPORT_SPECS = {
    width: 413,     // 35mm at 300 DPI
    height: 531,    // 45mm at 300 DPI
    faceHeight: 372, // Face should take ~70% of height
    topMargin: 160,  // Increased top margin for better head positioning
    idealFacePercent: 0.85 // Increased to 85% for closer zoom
};

// Load face detection models
export const loadFaceDetectionModel = async () => {
    try {
        if (!modelsLoaded) {
            console.log('Loading face detection models...');
            
            // Set the models path
            const MODEL_URL = window.location.origin + '/models';
            
            // Load required models
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            ]);
            
            modelsLoaded = true;
            console.log('Face detection models loaded successfully');
            return true;
        }
        return modelsLoaded;
    } catch (error) {
        console.error('Error loading face detection models:', error);
        modelsLoaded = false;
        throw new Error('Failed to load face detection models. Please refresh the page.');
    }
};

// Create an image element from base64
const createImage = (base64String) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error('Failed to load image: ' + e.message));
        img.crossOrigin = 'Anonymous';
        img.src = base64String;
    });
};

// Updated dimension calculations
const calculatePassportDimensions = (faceBox, imageWidth, imageHeight) => {
    // Calculate face center point
    const faceCenterX = faceBox.x + (faceBox.width / 2);
    const faceCenterY = faceBox.y + (faceBox.height / 2);
    
    // Calculate the scale to make face the right size in passport photo
    // Increased scale factor for closer zoom
    const scale = (PASSPORT_SPECS.height * PASSPORT_SPECS.idealFacePercent) / (faceBox.height * 1.6);
    
    // Calculate scaled dimensions
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    
    // Calculate x position to center the face horizontally
    const x = (PASSPORT_SPECS.width / 2) - (faceCenterX * scale);
    
    // Calculate y position with adjusted head space
    // Adjusted to position face slightly higher
    const y = PASSPORT_SPECS.topMargin - (faceBox.y * scale) + (faceBox.height * scale * 0.05);

    return { scale, scaledWidth, scaledHeight, x, y };
};

// Create passport photo
export const createPassportPhoto = async (backgroundRemovedImage) => {
    try {
        // Create image element
        const img = await createImage(backgroundRemovedImage);
        console.log('Image loaded:', img.width, 'x', img.height);

        // Create temporary canvas for face detection
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        // Initialize face detector with adjusted settings
        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.5
        });

        // Detect faces with landmarks
        console.log('Detecting faces...');
        const detections = await faceapi.detectAllFaces(tempCanvas, options)
            .withFaceLandmarks();

        if (!detections || detections.length === 0) {
            throw new Error('No face detected. Please use a clear front-facing photo.');
        }

        // Get the largest face (assuming it's the main subject)
        const detection = detections.reduce((prev, current) => {
            const prevArea = prev.detection.box.width * prev.detection.box.height;
            const currentArea = current.detection.box.width * current.detection.box.height;
            return (prevArea > currentArea) ? prev : current;
        });

        // Get face box
        const box = detection.detection.box;

        // Calculate dimensions with new adjustments
        const dimensions = calculatePassportDimensions(box, img.width, img.height);

        // Create final canvas
        const canvas = document.createElement('canvas');
        canvas.width = PASSPORT_SPECS.width;
        canvas.height = PASSPORT_SPECS.height;
        const ctx = canvas.getContext('2d');

        // Make background transparent initially
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image
        ctx.save();
        ctx.drawImage(
            img,
            dimensions.x,
            dimensions.y,
            dimensions.scaledWidth,
            dimensions.scaledHeight
        );
        ctx.restore();

        return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
        console.error('Error creating passport photo:', error);
        throw error;
    }
};

// Add this function after the existing functions
export const changePassportBackground = (passportImageData, backgroundColor) => {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            
            img.onload = () => {
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = PASSPORT_SPECS.width;
                canvas.height = PASSPORT_SPECS.height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                // Fill background first
                if (backgroundColor !== 'transparent') {
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Draw original image
                ctx.drawImage(img, 0, 0);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Process image data for transparency
                for (let i = 0; i < data.length; i += 4) {
                    // If pixel is white (background)
                    if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
                        if (backgroundColor === 'transparent') {
                            // Make pixel transparent
                            data[i + 3] = 0;
                        } else {
                            // Use background color
                            const color = hexToRgb(backgroundColor);
                            data[i] = color.r;
                            data[i + 1] = color.g;
                            data[i + 2] = color.b;
                            data[i + 3] = 255;
                        }
                    }
                }

                // Put processed image data back
                ctx.putImageData(imageData, 0, 0);

                // Convert to base64 and resolve
                const format = backgroundColor === 'transparent' ? 'image/png' : 'image/jpeg';
                resolve(canvas.toDataURL(format, 1.0));
            };

            img.onerror = (error) => {
                console.error('Error loading image:', error);
                reject(error);
            };

            img.src = passportImageData;

        } catch (error) {
            console.error('Error in changePassportBackground:', error);
            reject(error);
        }
    });
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
};
  