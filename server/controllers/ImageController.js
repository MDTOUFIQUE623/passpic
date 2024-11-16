import axios from "axios";
import fs from 'fs';
import FormData from "form-data";
import userModel from "../models/userModel.js";
import sharp from 'sharp';
import { promisify } from 'util';
import path from 'path';

const unlinkAsync = promisify(fs.unlink);

// Helper function to safely delete file
const safeDeleteFile = async (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            await fs.promises.chmod(filePath, 0o666); // Ensure we have permission to delete
            await fs.promises.unlink(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Helper function to optimize image
const optimizeImage = async (inputPath) => {
    try {
        const outputPath = `${inputPath}_optimized.jpg`;
        
        // Get image metadata
        const metadata = await sharp(inputPath).metadata();
        
        // Calculate target dimensions while maintaining aspect ratio
        const MAX_DIMENSION = 4000;
        let width = metadata.width;
        let height = metadata.height;
        
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        // Optimize image
        await sharp(inputPath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 85,
                progressive: true
            })
            .toFile(outputPath);

        // Replace original with optimized version
        await safeDeleteFile(inputPath);
        await fs.promises.rename(outputPath, inputPath);
        
        return inputPath;
    } catch (error) {
        console.error('Error optimizing image:', error);
        throw error;
    }
};

// Controller function to remove bg from image
const removeBgImage = async (req, res) => {
    let imagePath = null;
    
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

        imagePath = req.file.path;

        // Optimize image if needed
        imagePath = await optimizeImage(imagePath);

        // Create form data with proper headers
        const formData = new FormData();
        const imageStream = fs.createReadStream(imagePath);
        formData.append('image_file', imageStream, {
            filename: path.basename(imagePath),
            contentType: req.file.mimetype
        });

        // Make API request with retries and proper error handling
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

        // Process response and clean up
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`;

        // Update credit balance
        const updatedUser = await userModel.findByIdAndUpdate(
            user._id,
            { $inc: { creditBalance: -1 } },
            { new: true }
        );

        // Clean up the file
        await safeDeleteFile(imagePath);

        return res.json({
            success: true,
            resultImage,
            creditBalance: updatedUser.creditBalance,
            message: 'Background Removed Successfully'
        });

    } catch (error) {
        console.error('Error processing image:', error);

        // Clean up on error
        await safeDeleteFile(imagePath);

        return res.json({
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to process image',
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
};

export { removeBgImage };