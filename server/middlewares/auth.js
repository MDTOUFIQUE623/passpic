import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not Authorized, Login Again"
            });
        }

        // Decode the token to get clerkId
        const decoded = jwt.decode(token);
        
        if (!decoded || !decoded.sub) {  // Clerk uses 'sub' for the user ID
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        req.body.clerkId = decoded.sub;  // Use 'sub' as clerkId
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: error.message || "Authentication failed"
        });
    }
};

export default authUser;