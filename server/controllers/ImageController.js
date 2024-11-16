import axios from "axios";
import FormData from "form-data";
import userModel from "../models/userModel.js";
import sharp from 'sharp';

// Separate function to compress image to optimal size
const compressImage = async (buffer) => {
    try {
        // Target size of 2MB to be safe
        const targetSizeInBytes = 2 * 1024 * 1024;
        const metadata = await sharp(buffer).metadata();

        // Initial compression with reduced dimensions
        let width = metadata.width;
        let height = metadata.height;
        const MAX_DIMENSION = 1800;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        // Convert to PNG first to handle transparency
        let processedBuffer = await sharp(buffer)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .png()
            .toBuffer();

        // Then convert to JPEG with compression
        let quality = 90;
        let outputBuffer = await sharp(processedBuffer)
            .jpeg({ quality })
            .toBuffer();

        // Gradually reduce quality if needed
        while (outputBuffer.length > targetSizeInBytes && quality > 20) {
            quality -= 10;
            outputBuffer = await sharp(processedBuffer)
                .jpeg({ 
                    quality,
                    progressive: true,
                    optimizeCoding: true
                })
                .toBuffer();
        }

        // If still too large, reduce dimensions further
        if (outputBuffer.length > targetSizeInBytes) {
            const scaleFactor = Math.sqrt(targetSizeInBytes / outputBuffer.length);
            width = Math.round(width * scaleFactor);
            height = Math.round(height * scaleFactor);

            outputBuffer = await sharp(processedBuffer)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ 
                    quality: Math.max(quality, 40),
                    progressive: true,
                    optimizeCoding: true
                })
                .toBuffer();
        }

        const finalSize = outputBuffer.length / (1024 * 1024);
        console.log(`Compression complete - Final size: ${finalSize.toFixed(2)}MB, Quality: ${quality}%, Dimensions: ${width}x${height}`);

        if (finalSize > 5) {
            throw new Error('Failed to compress image to required size');
        }

        return outputBuffer;
    } catch (error) {
        console.error('Error in compressImage:', error);
        throw new Error(`Failed to compress image: ${error.message}`);
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

        if (!req.file || !req.file.buffer) {
            return res.json({ 
                success: false, 
                message: "No image file provided" 
            });
        }

        // Step 1: Always compress the image first
        console.log(`Original image size: ${(req.file.buffer.length / 1024 / 1024).toFixed(2)}MB`);
        const compressedBuffer = await compressImage(req.file.buffer);
        console.log(`Compressed image size: ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB`);

        // Verify the size is under limit
        if (compressedBuffer.length > 5 * 1024 * 1024) {
            throw new Error('Image size is still too large after compression');
        }

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
                
                // Check if error is related to file size
                if (error.message.includes('413') || error.message.includes('size')) {
                    throw new Error('Image size is too large for processing');
                }
                
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