import axios from "axios";
import FormData from "form-data";
import userModel from "../models/userModel.js";
import sharp from 'sharp';

// Helper function to optimize image buffer
const optimizeImageBuffer = async (buffer, mimetype) => {
    try {
        // Get image metadata
        const metadata = await sharp(buffer).metadata();
        
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
        const optimizedBuffer = await sharp(buffer)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 85,
                progressive: true
            })
            .toBuffer();
        
        return optimizedBuffer;
    } catch (error) {
        console.error('Error optimizing image:', error);
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

        // Optimize image buffer
        const optimizedBuffer = await optimizeImageBuffer(req.file.buffer, req.file.mimetype);

        // Create form data
        const formData = new FormData();
        formData.append('image_file', optimizedBuffer, {
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
            message: 'Background Removed Successfully'
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