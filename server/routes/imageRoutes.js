import express from 'express'
import { removeBgImage } from '../controllers/ImageController.js'
import { upload, handleMulterError } from '../middlewares/multer.js'
import authUser from '../middlewares/auth.js'

const imageRouter = express.Router()

imageRouter.post('/remove-bg', 
    upload.single('image'),
    handleMulterError,
    authUser,
    removeBgImage
)

export default imageRouter