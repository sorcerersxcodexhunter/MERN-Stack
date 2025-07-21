import jwt from "jsonwebtoken";

export const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.adminToken || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required"
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY || "your-secret-key");
        
        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        req.admin = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid admin token"
        });
    }
};
