import multer from "multer";

// creating multer middleware for parsing formdata
const storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, `${Date.now()}_${file.originalname}`)
    }
});

// Update multer configuration with larger file size limit
const upload = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB in bytes
    }
});

// Add error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size is too large. Maximum size is 15MB'
            });
        }
    }
    next(err);
};

export { upload, handleMulterError };