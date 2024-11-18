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

        // Log token details (without exposing sensitive data)
        console.log('Token received:', {
            length: token.length,
            type: typeof token
        });

        const decoded = jwt.decode(token);
        
        if (!decoded || !decoded.sub) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
        }

        req.body.clerkId = decoded.sub;
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