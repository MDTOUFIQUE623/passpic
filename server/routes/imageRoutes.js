import express from 'express'
import { removeBgImage } from '../controllers/ImageController.js'
import upload from '../middlewares/multer.js'
import authUser from '../middlewares/auth.js'

const imageRouter = express.Router()

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof Error) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

imageRouter.post(
    '/remove-bg',
    (req, res, next) => {
        upload.single('image')(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Error uploading file'
                });
            }
            next();
        });
    },
    handleMulterError,
    authUser,
    removeBgImage
);

export default imageRouter