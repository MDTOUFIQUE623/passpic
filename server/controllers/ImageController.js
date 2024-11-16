import axios from "axios";
import fs from 'fs'
import FormData from "form-data";
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
        const base64Image = imageBuffer.toString('base64');

        // Call PixelCut API
        const { data } = await axios.post(
            'https://api.developer.pixelcut.ai/v1/remove-background',
            {
                image_base64: base64Image,
                format: 'png'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-KEY': 'sk_ed53e25114d842d7827b589cf8707bdf'
                }
            }
        );

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
            resultImage: data.image_url, // PixelCut returns the processed image URL
            creditBalance: updatedUser.creditBalance,
            message: 'Background Removed'
        });

    } catch (error) {
        console.error('Error processing image:', error);
        
        // Clean up temporary file if it exists
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting temporary file:', unlinkError);
            }
        }

        res.json({ 
            success: false, 
            message: error.message || 'Failed to process image'
        });
    }
}

export { removeBgImage }