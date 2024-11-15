import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

// Initialize the model
let model = null;

export const loadFaceDetectionModel = async () => {
    try {
        if (!model) {
            model = await blazeface.load();
            console.log('Face detection model loaded successfully');
        }
        return model;
    } catch (error) {
        console.error('Error loading face detection model:', error);
        throw error;
    }
};

export const detectFace = async (imageElement) => {
    try {
        if (!model) {
            await loadFaceDetectionModel();
        }

        // Make predictions
        const predictions = await model.estimateFaces(imageElement, false);
        
        if (!predictions.length) {
            throw new Error('No face detected in the image');
        }

        if (predictions.length > 1) {
            throw new Error('Multiple faces detected. Please use a photo with a single face.');
        }

        return predictions[0];
    } catch (error) {
        console.error('Face detection error:', error);
        throw error;
    }
};

// Constants for passport photo
const PASSPORT_SPECS = {
    width: 600,         // 35mm in pixels
    height: 750,        // 45mm in pixels
    faceHeight: 525,    // Face should take ~70% of height
    backgroundColor: '#FFFFFF'
};

export const createPassportPhoto = async (imageElement) => {
    try {
        // Detect face in the image
        const face = await detectFace(imageElement);
        
        // Get face dimensions from blazeface prediction
        const faceBox = {
            x: face.topLeft[0],
            y: face.topLeft[1],
            width: face.bottomRight[0] - face.topLeft[0],
            height: face.bottomRight[1] - face.topLeft[1]
        };

        // Calculate scale to make face the right size
        const scale = PASSPORT_SPECS.faceHeight / faceBox.height;

        // Create canvas for the passport photo
        const canvas = document.createElement('canvas');
        canvas.width = PASSPORT_SPECS.width;
        canvas.height = PASSPORT_SPECS.height;
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = PASSPORT_SPECS.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate position to center face
        const scaledWidth = imageElement.width * scale;
        const scaledHeight = imageElement.height * scale;
        
        // Center horizontally and position face vertically with proper spacing
        const x = (PASSPORT_SPECS.width - scaledWidth) / 2 + (-faceBox.x * scale);
        const y = (PASSPORT_SPECS.height - scaledHeight) / 2 + (-faceBox.y * scale);

        // Draw the image
        ctx.drawImage(
            imageElement,
            x, y,
            scaledWidth,
            scaledHeight
        );

        // Convert to base64
        return canvas.toDataURL('image/jpeg', 0.95);
    } catch (error) {
        console.error('Error creating passport photo:', error);
        throw error;
    }
}; 