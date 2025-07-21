import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';

export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
                status: "error"
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                message: "Invalid token. User not found.",
                status: "error"
            });
        }
        
        req.user = { id: user._id.toString(), email: user.email, role: user.role };
        next();
        
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            status: "error",
            error: error.message
        });
    }
};
