import axios from "axios";
import fs from 'fs'
import FormData from "form-data";
import userModel from "../models/userModel.js";

// Controller function to remove bg from image
const removeBgImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ 
                success: false, 
                message: "No image file provided" 
            });
        }

        const { clerkId } = req.body;

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

        const imagePath = req.file.path;
        const imageSize = req.file.size;

        // Check file size
        if (imageSize > 15 * 1024 * 1024) { // 15MB in bytes
            fs.unlinkSync(imagePath); // Clean up
            return res.json({ 
                success: false, 
                message: "File size exceeds 15MB limit" 
            });
        }

        // Reading the image file
        const imageFile = fs.createReadStream(imagePath);

        const formdata = new FormData();
        formdata.append('image_file', imageFile);

        const { data } = await axios.post(
            'https://clipdrop-api.co/remove-background/v1',
            formdata,
            {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API,
                },
                responseType: 'arraybuffer',
                maxContentLength: 15 * 1024 * 1024, // 15MB
                maxBodyLength: 15 * 1024 * 1024 // 15MB
            }
        );

        const base64Image = Buffer.from(data, 'binary').toString('base64');
        const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;

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
            resultImage,
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
};

export { removeBgImage };