import axios from "axios";
import FormData from "form-data";
import userModel from "../models/userModel.js";
import sharp from 'sharp';

// Separate function to compress image to optimal size
const compressImage = async (buffer) => {
    try {
        const metadata = await sharp(buffer).metadata();
        
        // Target a smaller size for all images (3MB)
        const targetSizeInBytes = 3 * 1024 * 1024;
        
        // Initial dimensions
        let width = metadata.width;
        let height = metadata.height;
        
        // If dimensions are too large, reduce them
        const MAX_DIMENSION = 2000;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        // First attempt: high quality compression
        let outputBuffer = await sharp(buffer)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        // If still too large, reduce quality gradually
        let quality = 80;
        while (outputBuffer.length > targetSizeInBytes && quality > 30) {
            quality -= 5;
            outputBuffer = await sharp(buffer)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality })
                .toBuffer();
        }

        // If still too large, reduce dimensions
        if (outputBuffer.length > targetSizeInBytes) {
            const scaleFactor = Math.sqrt(targetSizeInBytes / outputBuffer.length);
            width = Math.round(width * scaleFactor);
            height = Math.round(height * scaleFactor);

            outputBuffer = await sharp(buffer)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ 
                    quality: Math.max(quality, 50),
                    progressive: true,
                    optimizeScans: true
                })
                .toBuffer();
        }

        console.log(`Compressed image - Size: ${(outputBuffer.length / 1024 / 1024).toFixed(2)}MB, Quality: ${quality}%, Dimensions: ${width}x${height}`);
        return outputBuffer;
    } catch (error) {
        console.error('Error in compressImage:', error);
        throw new Error('Failed to compress image');
    }
};

// Controller function to remove bg from image
const removeBgImage = async (req, res) => {
    try {
        const { clerkId } = req.body;

        // Validate user and credits
        const user = await userModel.findOne({ clerkId });
        if (!user) {
            return res.json({ success: false, message: "User Not Found" });
        }
        if (user.creditBalance === 0) {
            return res.json({ 
                success: false, 
                message: "No Credit Balance", 
                creditBalance: user.creditBalance 
            });
        }

        if (!req.file) {
            return res.json({ 
                success: false, 
                message: "No image file provided" 
            });
        }

        // Step 1: Compress the image first
        console.log(`Original image size: ${(req.file.buffer.length / 1024 / 1024).toFixed(2)}MB`);
        const compressedBuffer = await compressImage(req.file.buffer);
        console.log(`Compressed image size: ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB`);

        // Step 2: Create form data with compressed image
        const formData = new FormData();
        formData.append('image_file', compressedBuffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });

        // Step 3: Make API request with retries
        let response = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !response) {
            try {
                response = await axios.post(
                    'https://clipdrop-api.co/remove-background/v1',
                    formData,
                    {
                        headers: {
                            'x-api-key': process.env.CLIPDROP_API,
                            ...formData.getHeaders()
                        },
                        responseType: 'arraybuffer',
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity,
                        timeout: 60000 // 60 second timeout
                    }
                );
            } catch (error) {
                attempts++;
                console.error(`Attempt ${attempts} failed:`, error.message);
                if (attempts === maxAttempts) {
                    throw new Error('Failed to remove background after multiple attempts');
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Step 4: Process response
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`;

        // Step 5: Update credit balance
        const updatedUser = await userModel.findByIdAndUpdate(
            user._id,
            { $inc: { creditBalance: -1 } },
            { new: true }
        );

        return res.json({
            success: true,
            resultImage,
            creditBalance: updatedUser.creditBalance,
            message: 'Background removed successfully'
        });

    } catch (error) {
        console.error('Error processing image:', error);
        return res.json({
            success: false,
            message: error.message || 'Failed to process image',
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
};

export { removeBgImage };