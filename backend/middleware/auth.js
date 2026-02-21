import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

const authMiddleware = async (req, res, next) => {
    console.log("🔐 AUTH MIDDLEWARE CALLED - Path:", req.path, "Method:", req.method);
    
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("❌ No auth header found");
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            console.log("❌ No token found");
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing"
            });
        }

        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");

        if (!user) {
            console.log("❌ User not found");
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        console.log("✅ Auth successful for user:", user.email);
        next();
        
    } catch (err) {
        console.error("❌ JWT verification failed:", err.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export default authMiddleware;