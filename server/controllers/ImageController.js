import axios from "axios";
import fs from 'fs'
import FormData from "form-data";
import userModel from "../models/userModel.js";
import sharp from 'sharp';
import { promisify } from 'util';
import path from 'path';

const unlinkAsync = promisify(fs.unlink);

// Helper function to optimize image before processing
const optimizeImage = async (inputPath, maxSize = 5000) => {
    const stats = await sharp(inputPath).metadata();
    
    if (Math.max(stats.width, stats.height) > maxSize) {
        const tempPath = `${inputPath}_optimized`;
        await sharp(inputPath)
            .resize(maxSize, maxSize, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFile(tempPath);
            
        await unlinkAsync(inputPath);
        await fs.promises.rename(tempPath, inputPath);
    }
    
    // Convert to PNG format for better compatibility
    const pngPath = `${inputPath}.png`;
    await sharp(inputPath)
        .png()
        .toFile(pngPath);
        
    await unlinkAsync(inputPath);
    return pngPath;
};

// Controller function to remove bg from image
const removeBgImage = async (req, res) => {
    let optimizedImagePath = null;
    
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

        // Optimize image before processing
        optimizedImagePath = await optimizeImage(req.file.path);
        
        // Create form data with optimized image
        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(optimizedImagePath));

        // Make multiple attempts to remove background
        let attempts = 0;
        const maxAttempts = 3;
        let error = null;

        while (attempts < maxAttempts) {
            try {
                const response = await axios.post(
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
                        timeout: 30000 // 30 second timeout
                    }
                );

                // Process successful response
                const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                const resultImage = `data:image/png;base64,${base64Image}`;

                // Update credit balance
                const updatedUser = await userModel.findByIdAndUpdate(
                    user._id,
                    { $inc: { creditBalance: -1 } },
                    { new: true }
                );

                // Clean up files
                await unlinkAsync(optimizedImagePath);

                return res.json({
                    success: true,
                    resultImage,
                    creditBalance: updatedUser.creditBalance,
                    message: 'Background Removed Successfully'
                });

            } catch (attemptError) {
                error = attemptError;
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
            }
        }

        // If all attempts failed, throw the last error
        throw error;

    } catch (error) {
        console.error('Error processing image:', error);

        // Clean up files
        if (optimizedImagePath && fs.existsSync(optimizedImagePath)) {
            try {
                await unlinkAsync(optimizedImagePath);
            } catch (unlinkError) {
                console.error('Error deleting temporary file:', unlinkError);
            }
        }

        // Send appropriate error response
        return res.json({
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to process image',
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
};

export { removeBgImage }