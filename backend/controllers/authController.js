const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const transporter = require("../middleware/mailConfig");

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
const RESET_TOKEN_EXPIRY = "1h";

// User Registration for Web
const register = async (req, res) => {
    try {
        const { name, email, password, phone, dateOfBirth, address } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "Email already registered" 
            });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Get uploaded image filename
        const photo = req.file ? req.file.filename : null;

        const user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            phone,
            dateOfBirth,
            address,
            role: "client", // Default role for registration
            photo 
        });
        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role, 
                photo: user.photo 
            },
            SECRET_KEY,
            { expiresIn: "12h" }
        );

        // Send Welcome Email
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Welcome to MindConnect",
                html: `
                    <h2>Welcome to MindConnect!</h2>
                    <p>Hi ${name},</p>
                    <p>Thank you for registering with MindConnect. We're excited to help you on your wellness journey!</p>
                    <p>You can now book appointments and start your therapy sessions.</p>
                    <p>Best regards,<br>The MindConnect Team</p>
                `
            });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        res.status(201).json({ 
            success: true, 
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                address: user.address,
                role: user.role,
                photo: user.photo
            }
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            message: "Registration failed",
            error: err.message 
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).send({
                success: false,
                message: "Invalid email or password",
                statusCode: 403,
            });
        }

        // Create JWT with user details
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role, 
                photo: user.photo 
            },
            SECRET_KEY,
            { expiresIn: "12h" }
        );

        // Send response with all necessary data
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                address: user.address,
                role: user.role,
                photo: user.photo
            },
            message: "Login successful",
            statusCode: 200,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Login failed",
            error: error.message,
            statusCode: 500,
        });
    }
};

// Request Password Reset - Generate a Reset Token and send via email
const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({ 
                success: false,
                message: "Email is required" 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ 
                success: false,
                message: "User not found" 
            });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in user document (you might want to create a separate OTP model)
        // For now, we'll just send the OTP via email
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset OTP - MindConnect",
            html: `
                <h2>Password Reset Request</h2>
                <p>Hi ${user.name},</p>
                <p>You requested a password reset. Here's your OTP:</p>
                <h3 style="font-size: 24px; color: #4F46E5; font-weight: bold;">${otp}</h3>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>The MindConnect Team</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).send({ 
            success: true,
            message: "OTP sent successfully",
            otp: otp, // In production, don't send OTP in response
            expiry: otpExpiry
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ 
            success: false,
            message: "Error in sending reset email", 
            error: error.message 
        });
    }
};

// Reset Password for Web
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).send({ 
                success: false,
                message: "Email, OTP, and new password are required" 
            });
        }

        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ 
                success: false,
                message: "User not found" 
            });
        }

        // In a real application, you would verify the OTP from the database
        // For now, we'll just proceed with the password reset
        // You should implement proper OTP verification here

        // Hash the new password and update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).send({ 
            success: true,
            message: "Password reset successfully" 
        });
    } catch (error) {
        res.status(500).send({ 
            success: false,
            message: "Error resetting password", 
            error: error.message 
        });
    }
};

// Validate Session
const validateSession = async (req, res) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).send({ 
                success: false,
                message: "No token provided" 
            });
        }

        const verified = jwt.verify(token, SECRET_KEY);

        if (!verified) {
            return res.status(401).send({ 
                success: false,
                message: "Invalid or expired token" 
            });
        }

        // Get user details
        const user = await User.findById(verified.id).select('-password');
        if (!user) {
            return res.status(401).send({ 
                success: false,
                message: "User not found" 
            });
        }

        res.status(200).send({ 
            success: true,
            message: "Token is valid", 
            user: user 
        });
    } catch (error) {
        res.status(401).send({ 
            success: false,
            message: "Invalid or expired token", 
            error: error.message 
        });
    }
};

module.exports = {
    register,
    login,
    resetPasswordRequest,
    resetPassword,
    validateSession,
};
