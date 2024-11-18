import axios from "axios";
import fs from 'fs'
import FormData from "form-data";
import userModel from "../models/userModel.js";

// Controller function to remove bg from image
const removeBgImage = async (req, res) => {
    let imagePath = null;
    
    try {
        // Validate request
        if (!req.file) {
            throw new Error('No image file uploaded');
        }

        const { clerkId } = req.body;
        if (!clerkId) {
            throw new Error('User ID is required');
        }

        // Log request details
        console.log('Processing request:', {
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            clerkId: clerkId
        });

        // Find user and check credits
        const user = await userModel.findOne({ clerkId });
        if (!user) {
            throw new Error('User not found');
        }

        if (user.creditBalance <= 0) {
            throw new Error('Insufficient credits');
        }

        imagePath = req.file.path;
        const imageFile = fs.createReadStream(imagePath);

        // Prepare form data for ClipDrop API
        const formdata = new FormData();
        formdata.append('image_file', imageFile);

        console.log('Sending request to ClipDrop API');
        
        // Make request to ClipDrop API
        const { data } = await axios.post(
            'https://clipdrop-api.co/remove-background/v1',
            formdata,
            {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API,
                },
                responseType: 'arraybuffer',
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        if (!data) {
            throw new Error('No response from background removal service');
        }

        // Convert response to base64
        const base64Image = Buffer.from(data, 'binary').toString('base64');
        const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;

        // Update user credits
        const updatedUser = await userModel.findByIdAndUpdate(
            user._id,
            { $inc: { creditBalance: -1 } },
            { new: true }
        );

        console.log('Background removal successful');

        res.json({
            success: true,
            resultImage,
            creditBalance: updatedUser.creditBalance,
            message: 'Background removed successfully'
        });

    } catch (error) {
        console.error('Error in removeBgImage:', error);
        
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.message || 'Failed to process image',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        
    } finally {
        // Clean up temporary file
        if (imagePath) {
            try {
                fs.unlinkSync(imagePath);
            } catch (unlinkError) {
                console.error('Error deleting temporary file:', unlinkError);
            }
        }
    }
};

export { removeBgImage }