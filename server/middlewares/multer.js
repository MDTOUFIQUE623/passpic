import multer from "multer";

// Configure multer to use memory storage for serverless environment
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and WEBP images are allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 30 * 1024 * 1024, // 30MB (ClipDrop limit)
        files: 1
    },
    fileFilter
});

export default upload;