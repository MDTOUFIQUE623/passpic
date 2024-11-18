import axios from "axios";
import fs from 'fs'
import FormData from "form-data";
import userModel from "../models/userModel.js";

const removeBgImage = async (req, res) => {
    try {
        const { clerkId } = req.body;
        const user = await userModel.findOne({ clerkId });

        if (!user) {
            return res.json({ success: false, message: "User Not Found" });
        }

        if (user.creditBalance === 0) {
            return res.json({ success: false, message: "No Credit Balance", creditBalance: user.creditBalance });
        }

        if (!req.file) {
            return res.json({ success: false, message: "No image file provided" });
        }

        // Check file size (30MB limit for ClipDrop API)
        const maxSize = 30 * 1024 * 1024; // 30MB
        if (req.file.size > maxSize) {
            fs.unlinkSync(req.file.path);
            return res.json({ 
                success: false, 
                message: "File size too large. Maximum size is 30MB" 
            });
        }

        const imagePath = req.file.path;
        const imageFile = fs.createReadStream(imagePath);

        const formdata = new FormData();
        formdata.append('image_file', imageFile, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        formdata.append('transparency_handling', 'discard_alpha_layer');

        console.log('Sending request to ClipDrop API with:', {
            fileSize: req.file.size,
            fileName: req.file.originalname,
            mimeType: req.file.mimetype
        });

        const { data, headers } = await axios.post(
            'https://clipdrop-api.co/remove-background/v1',
            formdata,
            {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API,
                    'accept': 'image/png',
                    ...formdata.getHeaders()
                },
                responseType: 'arraybuffer',
                maxContentLength: maxSize,
                maxBodyLength: maxSize,
                timeout: 30000 // 30 second timeout
            }
        );

        // Log API response details
        console.log('ClipDrop API Response:', {
            remainingCredits: headers['x-remaining-credits'],
            creditsConsumed: headers['x-credits-consumed'],
            contentType: headers['content-type'],
            contentLength: headers['content-length']
        });

        if (!data) {
            throw new Error('No data received from API');
        }

        const base64Image = Buffer.from(data, 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`;

        const updatedUser = await userModel.findByIdAndUpdate(
            user._id, 
            { $inc: { creditBalance: -1 } },
            { new: true }
        );

        // Clean up the temporary file
        fs.unlinkSync(imagePath);

        return res.json({
            success: true,
            resultImage,
            creditBalance: updatedUser.creditBalance,
            message: 'Background Removed',
            remainingCredits: headers['x-remaining-credits']
        });

    } catch (error) {
        console.error('Error processing image:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting temporary file:', unlinkError);
            }
        }

        let errorMessage = 'Failed to process image';
        
        if (error.response) {
            if (error.response.status === 400) {
                errorMessage = 'Invalid image format or corrupted file';
            } else if (error.response.status === 402) {
                errorMessage = 'No remaining API credits';
            } else if (error.response.status === 413) {
                errorMessage = 'Image size too large';
            } else if (error.response.status === 429) {
                errorMessage = 'Too many requests. Please try again later';
            }
            
            // If response contains JSON error message
            if (error.response.data) {
                try {
                    const errorData = JSON.parse(error.response.data.toString());
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    console.error('Error parsing API error response:', e);
                }
            }
        }

        return res.json({ 
            success: false, 
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export { removeBgImage };