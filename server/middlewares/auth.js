import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required"
            });
        }

        const decoded = jwt.decode(token);
        
        if (!decoded || !decoded.sub) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
        }

        const clerkId = req.body.clerkId || decoded.sub;
        
        if (req.body instanceof Object) {
            req.body.clerkId = clerkId;
        }

        console.log('Auth middleware:', {
            tokenPresent: !!token,
            decodedPresent: !!decoded,
            clerkId: clerkId,
            bodyType: typeof req.body,
            method: req.method,
            contentType: req.headers['content-type']
        });

        next();

    } catch (error) {
        console.error('Auth middleware error:', {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        
        res.status(401).json({
            success: false,
            message: "Authentication failed: " + error.message
        });
    }
};

export default authUser;