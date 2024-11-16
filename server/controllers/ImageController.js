import axios from "axios";
import fs from 'fs'
import userModel from "../models/userModel.js";

// Controller function to remove bg from image
const removeBgImage = async (req, res) => {
    try {
        const { clerkId } = req.body

        const user = await userModel.findOne({ clerkId })

        if (!user) {
            return res.json({ success: false, message: "User Not Found" })
        }

        if (user.creditBalance === 0) {
            return res.json({ success: false, message: "No Credit Balance", creditBalance: user.creditBalance })
        }

        const imagePath = req.file.path;

        // Convert image to base64
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

        // Call PixelCut API
        const response = await axios({
            method: 'post',
            url: 'https://api.developer.pixelcut.ai/v1/remove-background',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-KEY': 'sk_ed53e25114d842d7827b589cf8707bdf'
            },
            data: {
                image_base64: base64Image,
                format: 'png',
                crop: false,
                scale: 'original',
                remove_shadow: true
            }
        });

        if (!response.data || !response.data.image_base64) {
            throw new Error('Invalid response from PixelCut API');
        }

        // Update credit balance
        const updatedUser = await userModel.findByIdAndUpdate(
            user._id,
            { $inc: { creditBalance: -1 } },
            { new: true }
        );

        // Clean up the temporary file
        fs.unlinkSync(imagePath);

        res.json({
            success: true,
            resultImage: response.data.image_base64, // Send the base64 image directly
            creditBalance: updatedUser.creditBalance,
            message: 'Background Removed'
        });

    } catch (error) {
        console.error('Error processing image:', error);
        console.error('Error response:', error.response?.data); // Log the error response
        
        // Clean up temporary file if it exists
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting temporary file:', unlinkError);
            }
        }

        res.status(error.response?.status || 500).json({ 
            success: false, 
            message: error.response?.data?.message || error.message || 'Failed to process image'
        });
    }
}

export { removeBgImage }