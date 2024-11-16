import axios from "axios";
import FormData from "form-data";
import userModel from "../models/userModel.js";
import sharp from 'sharp';

// Helper function to compress image buffer to target size
const compressImageBuffer = async (buffer, targetSizeInMB = 4.9) => {
    try {
        const metadata = await sharp(buffer).metadata();
        let quality = 100;
        let outputBuffer = buffer;
        const targetSizeInBytes = targetSizeInMB * 1024 * 1024;

        // First try: Optimize dimensions if needed
        const MAX_DIMENSION = 4000;
        let width = metadata.width;
        let height = metadata.height;
        
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
            
            outputBuffer = await sharp(buffer)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 100 })
                .toBuffer();
        }

        // If still too large, gradually reduce quality until we meet target size
        while (outputBuffer.length > targetSizeInBytes && quality > 10) {
            quality -= 5;
            outputBuffer = await sharp(buffer)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality })
                .toBuffer();
        }

        console.log(`Compressed image to quality: ${quality}%, Size: ${(outputBuffer.length / 1024 / 1024).toFixed(2)}MB`);
        return outputBuffer;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
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

        // Process the image buffer
        let processedBuffer = req.file.buffer;
        const originalSize = processedBuffer.length / (1024 * 1024); // Size in MB

        // If image is larger than 5MB, compress it
        if (originalSize > 5) {
            console.log(`Original image size: ${originalSize.toFixed(2)}MB, compressing...`);
            processedBuffer = await compressImageBuffer(processedBuffer);
            console.log(`Compressed image size: ${(processedBuffer.length / 1024 / 1024).toFixed(2)}MB`);
        }

        // Create form data
        const formData = new FormData();
        formData.append('image_file', processedBuffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });

        // Make API request with retries
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
                if (attempts === maxAttempts) {
                    throw new Error(error.response?.data?.toString() || error.message);
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Process response
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`;

        // Update credit balance
        const updatedUser = await userModel.findByIdAndUpdate(
            user._id,
            { $inc: { creditBalance: -1 } },
            { new: true }
        );

        return res.json({
            success: true,
            resultImage,
            creditBalance: updatedUser.creditBalance,
            message: originalSize > 5 ? 'Image was compressed and background removed successfully' : 'Background removed successfully'
        });

    } catch (error) {
        console.error('Error processing image:', error);
        return res.json({
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to process image',
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
};

export { removeBgImage };