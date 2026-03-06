import mongoose from "mongoose";
import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// TOKEN
const TOKEN_EXPIRES_IN = "24h";
const JWT_SECRET = "your_jwt_secret_here";

const createToken = (userId) => {
    const secret = JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined on the server");
    return jwt.sign({ id: userId }, secret, { expiresIn: TOKEN_EXPIRES_IN });
};

// REGISTER FUNCTION
export async function register(req, res) {
    try {
        const name = String(req.body.name || "").trim();
        const emailRaw = String(req.body.email || "").trim();
        const email =
            validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();
        const password = String(req.body.password || "");

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be atlest 8 character"
            });
        }

        const exists = await User.findOne({ email }).lean();
        if (exists) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const newId = new mongoose.Types.ObjectId();
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            _id: newId,
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = createToken(newId.toString());

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Register error", err);

        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User already exist"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// FORGOT PASSWORD FUNCTION
export async function forgotPassword(req, res) {
    try {
        const emailRaw = String(req.body.email || "").trim();
        const email = validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal whether user exists or not for security
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a new password will be sent shortly"
            });
        }

        // Generate a new random password (8 characters with mixed case and numbers)
        const newPassword = Math.random().toString(36).slice(-4) + 
                           Math.random().toString(36).slice(-4).toUpperCase() + 
                           Math.floor(Math.random() * 10);

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password in database
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });

        console.log("=== EMAIL DEBUG INFO ===");
        console.log("Mailtrap Host: sandbox.smtp.mailtrap.io");
        console.log("Mailtrap User: 8b617481896d0e");
        console.log("========================");

        // Create nodemailer transporter with Mailtrap credentials
        // Using sandbox.smtp.mailtrap.io as per user's credentials
        let transporter;
        let lastError = null;
        
        // Try port 2525
        try {
            transporter = nodemailer.createTransport({
                host: "sandbox.smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: "8b617481896d0e",
                    pass: "1a0c2c47ea964f"
                }
            });
            await transporter.verify();
            console.log("Connected on port 2525!");
        } catch (err) {
            console.log("Port 2525 failed:", err.message);
            lastError = err;
            transporter = null;
        }
        
        // If 2525 failed, try port 587
        if (!transporter) {
            try {
                transporter = nodemailer.createTransport({
                    host: "sandbox.smtp.mailtrap.io",
                    port: 587,
                    secure: false,
                    auth: {
                        user: "8b617481896d0e",
                        pass: "1a0c2c47ea964f"
                    }
                });
                await transporter.verify();
                console.log("Connected on port 587!");
            } catch (err) {
                console.log("Port 587 failed:", err.message);
                lastError = err;
                transporter = null;
            }
        }
        
        // If still no transporter, return error
        if (!transporter) {
            console.error("All SMTP ports failed:", lastError?.message);
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a new password will be sent shortly"
            });
        }

        // Email content
        const mailOptions = {
            from: "noreply@karzone.com",
            to: email,
            subject: "Karzone - Your New Password",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset - Karzone</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your password has been reset as per your request. Here are your new login credentials:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>New Password:</strong> ${newPassword}</p>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        Please login with this new password and change it immediately for security purposes.
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        If you did not request this password reset, please contact us immediately.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">Best regards,<br>Karzone Team</p>
                </div>
            `
        };

        // Send email
        console.log("Sending email to:", email);
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully! Message ID:", info.messageId);

        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, a new password will be sent shortly"
        });

    } catch (err) {
        console.error("Forgot password error:", err);
        
        // Even if email fails, return success to prevent email enumeration
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, a new password will be sent shortly"
        });
    }
}

// LOGIN FUNCTION
export async function login(req, res) {
    try {
        const emailRaw = String(req.body.email || "").trim();
        const email =
            validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();
        const password = String(req.body.password || "");

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Login error", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// GET CURRENT USER (for token validation)
export async function getMe(req, res) {
    try {
        const user = req.user;
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("GetMe error", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// LOGOUT (client-side logout)
export async function logout(req, res) {
    try {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err) {
        console.error("Logout error", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
