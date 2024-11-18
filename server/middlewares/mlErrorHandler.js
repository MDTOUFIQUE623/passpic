const mlErrorHandler = (err, req, res, next) => {
    if (err.name === 'TensorflowError') {
        console.error('ML Processing Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error processing image with ML model',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    next(err);
};

export default mlErrorHandler; 