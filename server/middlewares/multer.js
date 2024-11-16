import multer from "multer";

// Configure storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '/tmp') // Use tmp directory for temporary storage
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB in bytes
    },
    fileFilter: fileFilter
});

export default upload;